from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.models.contact import TrustedContact
from app.schemas.sos import ContactCreate
from app.core.security import get_current_user_id

router = APIRouter(prefix="/contacts", tags=["contacts"])

@router.post("/")
def add_contact(payload: ContactCreate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    contact = TrustedContact(owner_id=user_id, name=payload.name, phone=payload.phone, email=payload.email)
    db.add(contact); db.commit(); db.refresh(contact)
    return contact

@router.get("/")
def list_contacts(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    return db.query(TrustedContact).filter(TrustedContact.owner_id == user_id).all()

@router.delete("/{contact_id}")
def delete_contact(contact_id: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    db.query(TrustedContact).filter(TrustedContact.id == contact_id, TrustedContact.owner_id == user_id).delete()
    db.commit()
    return {"status": "deleted"}
