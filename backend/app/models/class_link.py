from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.sql import func

from app.core.database import Base


class ClassLink(Base):
    __tablename__ = "class_links"
    __table_args__ = (UniqueConstraint("student_id", "teacher_id", name="uq_class_link_student_teacher"),)

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String(24), nullable=False, default="active")
    joined_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
