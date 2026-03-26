from sqlalchemy import Boolean, Column, ForeignKey, Integer, String

from app.core.database import Base


class ParentContact(Base):
    __tablename__ = "parent_contacts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), nullable=False)
    relationship = Column(String(80), nullable=False, default="Guardian")
    status = Column(String(32), nullable=False, default="active")
    email_opt_in = Column(Boolean, nullable=False, default=True)
