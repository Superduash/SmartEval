from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base


class TrainerSession(Base):
    __tablename__ = "trainer_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    plan_id = Column(String(64), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    elapsed_seconds = Column(Integer, nullable=False, default=0)
    is_running = Column(Boolean, nullable=False, default=False)
    status = Column(String(24), nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
