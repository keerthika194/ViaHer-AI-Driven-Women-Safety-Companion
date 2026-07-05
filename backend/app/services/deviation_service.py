from shapely.geometry import LineString, Point

def check_deviation(current_lat: float, current_lng: float, route_coords: list[list[float]], threshold_meters: float = 60.0) -> dict:
    if len(route_coords) < 2:
        return {"deviated": False, "distance_m": 0.0}
    line = LineString([(c[1], c[0]) for c in route_coords])  # (lng, lat)
    point = Point(current_lng, current_lat)
    distance_deg = line.distance(point)
    distance_m = distance_deg * 111_000  # rough deg-to-meters conversion
    return {"deviated": distance_m > threshold_meters, "distance_m": round(distance_m, 1)}
