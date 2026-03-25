from sqlalchemy import Column, Float, ForeignKey, Integer

from app.core.database import Base


class Analytics(Base):
    __tablename__ = "analytics"

    student_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    average = Column(Float, nullable=False, default=0)
    improvement = Column(Float, nullable=False, default=0)
