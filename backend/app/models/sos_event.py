import uuid
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.db.base import Base

class SOSEvent(Base):
    __tablename__ = "sos_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    route_geojson = Column(JSON, nullable=True)
    eta_minutes = Column(Float, nullable=True)
    battery_percent = Column(Float, nullable=True)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

class ActiveRoute(Base):
    __tablename__ = "active_routes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    route_coords = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
