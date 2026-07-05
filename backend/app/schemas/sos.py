from pydantic import BaseModel

class SOSTrigger(BaseModel):
    lat: float
    lng: float
    battery_percent: float | None = None
    eta_minutes: float | None = None
    route_coords: list[list[float]] | None = None

class ContactCreate(BaseModel):
    name: str
    phone: str | None = None
    email: str | None = None

class DeviationCheck(BaseModel):
    lat: float
    lng: float
    route_coords: list[list[float]]
