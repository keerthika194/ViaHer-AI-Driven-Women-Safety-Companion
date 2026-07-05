import os
import osmnx as ox
import networkx as nx
from app.core.config import settings


def get_graph() -> nx.MultiDiGraph:
    if os.path.exists(settings.GRAPH_CACHE_PATH):
        return ox.load_graphml(settings.GRAPH_CACHE_PATH)

    print(
        f"Downloading road network for {settings.CITY_NAME} "
        "(first run only — may take a few minutes)..."
    )
    G = ox.graph_from_place(settings.CITY_NAME, network_type="drive")
    G = ox.add_edge_speeds(G)
    G = ox.add_edge_travel_times(G)

    # Ensure the cache directory exists BEFORE writing
    cache_dir = os.path.dirname(settings.GRAPH_CACHE_PATH)
    if cache_dir:
        os.makedirs(cache_dir, exist_ok=True)

    ox.save_graphml(G, settings.GRAPH_CACHE_PATH)
    return G
