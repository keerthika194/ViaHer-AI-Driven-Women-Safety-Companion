"""
Dynamic Safety Engine.
Computes a base safety score (0-100) per road edge from OSM attributes,
then applies a time-of-day multiplier to get the DYNAMIC score at request time.
"""

HIGHWAY_BASE_SCORE = {
    "motorway": 85, "trunk": 82, "primary": 78, "secondary": 72,
    "tertiary": 65, "residential": 55, "living_street": 58,
    "service": 40, "unclassified": 45, "track": 25, "path": 20,
}

TIME_MULTIPLIERS = {
    range(5, 9): 1.05,    # early morning
    range(9, 17): 1.10,   # day
    range(17, 20): 0.95,  # evening
    range(20, 23): 0.80,  # night
    range(23, 24): 0.60,  # late night
}
LATE_NIGHT_EARLY = range(0, 5)


def _time_multiplier(hour: int) -> float:
    if hour in LATE_NIGHT_EARLY:
        return 0.55
    for hour_range, mult in TIME_MULTIPLIERS.items():
        if hour in hour_range:
            return mult
    return 0.9


def _highway_type(edge_data: dict) -> str:
    hw = edge_data.get("highway", "unclassified")
    if isinstance(hw, list):
        hw = hw[0]
    return hw


def base_edge_score(edge_data: dict) -> float:
    hw = _highway_type(edge_data)
    score = HIGHWAY_BASE_SCORE.get(hw, 50)

    lit = edge_data.get("lit", "unknown")
    if lit == "yes":
        score += 8
    elif lit == "no":
        score -= 12

    lanes = edge_data.get("lanes", "1")
    try:
        lanes_val = int(lanes[0]) if isinstance(lanes, list) else int(lanes)
        if lanes_val >= 3:
            score += 5
    except (ValueError, TypeError):
        pass

    length = edge_data.get("length", 100)
    if length > 500:
        score -= 6  # long isolated stretch proxy

    return max(5, min(100, score))


def dynamic_edge_score(edge_data: dict, hour: int) -> float:
    base = base_edge_score(edge_data)
    return round(max(5, min(100, base * _time_multiplier(hour))), 1)


def _time_period_label(hour: int) -> str:
    """Human-readable label for the current time period."""
    if 5 <= hour < 9:
        return "early morning"
    elif 9 <= hour < 17:
        return "daytime"
    elif 17 <= hour < 20:
        return "evening"
    elif 20 <= hour < 23:
        return "night"
    else:
        return "late night"


def explain_route(
    edge_scores: list[float],
    avoided_isolated: bool,
    hour: int = 12,
) -> list[str]:
    """
    Generates human-readable reasons explaining why the safe route was chosen.
    Includes time-of-day context and detailed safety factors.
    """
    reasons: list[str] = []
    avg = sum(edge_scores) / len(edge_scores) if edge_scores else 0
    period = _time_period_label(hour)
    display_hour = f"{hour % 12 or 12}:00 {'AM' if hour < 12 else 'PM'}"

    # ── Time-of-day reasoning ────────────────────────────────────────────
    if 5 <= hour < 9:
        reasons.append(
            f"Early morning ({display_hour}) — route selected for roads "
            "with emerging daytime activity and growing visibility"
        )
    elif 9 <= hour < 17:
        reasons.append(
            f"Daytime ({display_hour}) — main roads at peak activity "
            "with high natural surveillance from pedestrians and vehicles"
        )
    elif 17 <= hour < 20:
        reasons.append(
            f"Evening ({display_hour}) — prioritizes well-lit commercial "
            "corridors over residential side roads"
        )
    elif 20 <= hour < 23:
        reasons.append(
            f"Night ({display_hour}) — avoids dimly-lit side roads, "
            "routes through arterial roads with verified street lighting"
        )
    else:
        reasons.append(
            f"Late night ({display_hour}) — strongly favors major roads "
            "with continuous lighting and nearby open establishments"
        )

    # ── Road quality / lighting ──────────────────────────────────────────
    if avg > 75:
        reasons.append(
            "Road segments have verified street lighting and "
            "multi-lane capacity for better visibility"
        )
    elif avg > 65:
        reasons.append(
            "Primarily follows main roads through commercial "
            "and well-populated areas"
        )
    else:
        reasons.append(
            "Best available route for current conditions — "
            "consider travelling with a companion during " + period
        )

    # ── Isolation avoidance ──────────────────────────────────────────────
    if avoided_isolated:
        reasons.append(
            "Avoids isolated residential shortcuts, narrow lanes, "
            "and unlit service roads"
        )

    # ── Score summary ────────────────────────────────────────────────────
    reasons.append(
        f"Dynamic safety score: {round(avg, 1)}/100 — computed across "
        f"{len(edge_scores)} road segments for {period} conditions"
    )

    return reasons
