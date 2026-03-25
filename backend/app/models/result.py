from sqlalchemy import Column, Float, ForeignKey, Integer, Text

from app.core.database import Base


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    marks = Column(Float, nullable=False)
    feedback = Column(Text, nullable=False)
