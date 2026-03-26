from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.waitlist_lead import WaitlistLead


def add_waitlist_lead(db: Session, *, email: str, source: str) -> WaitlistLead:
    normalized = email.strip().lower()
    exists = db.query(WaitlistLead).filter(WaitlistLead.email == normalized).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already on waitlist")

    lead = WaitlistLead(email=normalized, source=source.strip() or "pricing", status="coming_soon")
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead
