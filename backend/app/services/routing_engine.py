"""
Routing Engine: computes the FASTEST route (pure travel time) and the
SAFE route (time + dynamic safety cost combined) on the same graph.

Performance notes:
- _prepare_weights batches ALL edge feature extraction into a single
  numpy array and calls model.predict() ONCE (not once per edge).
  This turns an O(n_edges) model-call loop into a single vectorised call.
- Results are cached keyed by hour so repeat searches in the same hour
  return instantly without recomputing.
"""
import numpy as np
import osmnx as ox
import networkx as nx
from app.services.safety_engine import (
    dynamic_edge_score, explain_route,
    HIGHWAY_BASE_SCORE, _highway_type,
)

SAFETY_WEIGHT = 3.0  # how strongly safety influences the "safe" route

# ── Per-hour cache ────────────────────────────────────────────────────────────
_cache_hour: int | None = None   # which hour was last prepared
_cache_graph_id: int | None = None  # id() of the graph object

HIGHWAY_TYPES = list(HIGHWAY_BASE_SCORE.keys())


def _prepare_weights(G: nx.MultiDiGraph, hour: int) -> None:
    """
    Assign safety_score and safe_weight to every edge in G.
    Uses a single batched XGBoost predict call for all edges.
    Falls back to rule-based scores if the model isn't available.
    """
    global _cache_hour, _cache_graph_id

    # Return immediately if already prepared for this hour and graph
    if _cache_hour == hour and _cache_graph_id == id(G):
        return

    edges = list(G.edges(keys=True, data=True))

    # ── Try batched ML inference ──────────────────────────────────────────
    try:
        from app.ai.inference import get_model

        model = get_model()

        # Build feature matrix in one pass — no per-edge model calls
        rows = []
        for _, _, _, data in edges:
            hw = _highway_type(data)
            hw_rank = HIGHWAY_TYPES.index(hw) if hw in HIGHWAY_TYPES else len(HIGHWAY_TYPES)
            lit = 1 if data.get("lit") == "yes" else 0
            lanes = data.get("lanes", "1")
            try:
                lanes_val = int(lanes[0]) if isinstance(lanes, list) else int(lanes)
            except (ValueError, TypeError):
                lanes_val = 1
            length = data.get("length", 100)
            rows.append([hw_rank, lit, lanes_val, length, hour])

        X = np.array(rows, dtype=np.float32)
        preds = model.predict(X)                          # ONE call for all edges

        for (u, v, k, data), raw_score in zip(edges, preds):
            score = float(max(5, min(100, raw_score)))
            data["safety_score"] = score
            travel_time = data.get("travel_time", data.get("length", 50) / 8.0)
            data["safe_weight"] = travel_time + SAFETY_WEIGHT * (100 - score) / 10.0

    except Exception:
        # ── Fallback: rule-based scores (always fast) ─────────────────────
        for _, _, _, data in edges:
            score = dynamic_edge_score(data, hour)
            data["safety_score"] = score
            travel_time = data.get("travel_time", data.get("length", 50) / 8.0)
            data["safe_weight"] = travel_time + SAFETY_WEIGHT * (100 - score) / 10.0

    _cache_hour = hour
    _cache_graph_id = id(G)


def _path_summary(G, path, weight_key="travel_time"):
    coords, edge_scores, total_time, total_len = [], [], 0.0, 0.0
    for node in path:
        coords.append([G.nodes[node]["y"], G.nodes[node]["x"]])
    for u, v in zip(path[:-1], path[1:]):
        edge_data = min(
            G.get_edge_data(u, v).values(),
            key=lambda d: d.get(weight_key, 1e9),
        )
        total_time += edge_data.get("travel_time", 0)
        total_len += edge_data.get("length", 0)
        edge_scores.append(edge_data.get("safety_score", 50))
    avg_score = round(sum(edge_scores) / len(edge_scores), 1) if edge_scores else 50.0
    return coords, round(total_len / 1000, 2), round(total_time / 60, 1), avg_score, edge_scores


def compute_routes(G: nx.MultiDiGraph, orig_lat, orig_lng, dest_lat, dest_lng, hour: int):
    _prepare_weights(G, hour)

    orig_node = ox.distance.nearest_nodes(G, X=orig_lng, Y=orig_lat)
    dest_node = ox.distance.nearest_nodes(G, X=dest_lng, Y=dest_lat)

    fastest_path = nx.shortest_path(G, orig_node, dest_node, weight="travel_time")
    safe_path    = nx.shortest_path(G, orig_node, dest_node, weight="safe_weight")

    f_coords, f_km, f_min, f_score, _           = _path_summary(G, fastest_path, "travel_time")
    s_coords, s_km, s_min, s_score, s_edge_scores = _path_summary(G, safe_path,    "safe_weight")

    explanation = explain_route(s_edge_scores, avoided_isolated=(safe_path != fastest_path), hour=hour)

    return {
        "fastest": {"coordinates": f_coords, "distance_km": f_km, "duration_min": f_min, "avg_safety_score": f_score},
        "safe":    {"coordinates": s_coords, "distance_km": s_km, "duration_min": s_min, "avg_safety_score": s_score},
        "time_difference_min": round(s_min - f_min, 1),
        "explanation": explanation,
    }
