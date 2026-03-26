from sqlalchemy import Column, Integer, String

from app.core.database import Base


class WaitlistLead(Base):
    __tablename__ = "waitlist_leads"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    source = Column(String(120), nullable=False, default="pricing")
    status = Column(String(32), nullable=False, default="coming_soon")
