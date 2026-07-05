from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.models.contact import TrustedContact
from app.models.sos_event import SOSEvent
from app.schemas.sos import SOSTrigger
from app.core.security import get_current_user_id
from app.ws.manager import manager

router = APIRouter(prefix="/sos", tags=["sos"])

@router.post("/trigger")
async def trigger_sos(payload: SOSTrigger, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    event = SOSEvent(user_id=user_id, lat=payload.lat, lng=payload.lng,
                      route_geojson=payload.route_coords, eta_minutes=payload.eta_minutes,
                      battery_percent=payload.battery_percent)
    db.add(event); db.commit(); db.refresh(event)

    contacts = db.query(TrustedContact).filter(TrustedContact.owner_id == user_id).all()
    message = {
        "type": "sos", "user_id": str(user_id), "lat": payload.lat, "lng": payload.lng,
        "eta_minutes": payload.eta_minutes, "battery_percent": payload.battery_percent,
        "route_coords": payload.route_coords,
    }
    for c in contacts:
        await manager.send_to_user(str(c.id), message)

    return {"status": "sent", "event_id": str(event.id), "contacts_notified": len(contacts)}
