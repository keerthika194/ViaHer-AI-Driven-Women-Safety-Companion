from pydantic import BaseModel

class RouteRequest(BaseModel):
    origin_address: str | None = None
    destination_address: str | None = None
    origin_lat: float | None = None
    origin_lng: float | None = None
    dest_lat: float | None = None
    dest_lng: float | None = None
    hour_override: int | None = None

class RouteResult(BaseModel):
    coordinates: list[list[float]]
    distance_km: float
    duration_min: float
    avg_safety_score: float

class RouteCompareResponse(BaseModel):
    fastest: RouteResult
    safe: RouteResult
    time_difference_min: float
    explanation: list[str]
