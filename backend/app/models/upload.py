import enum

from sqlalchemy import Column, Enum, ForeignKey, Integer, String

from app.core.database import Base


class UploadType(str, enum.Enum):
    question_paper = "question_paper"
    answer_script = "answer_script"
    rubric = "rubric"
    student_answer = "student_answer"


class Upload(Base):
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=True)
    file_path = Column(String(500), nullable=False)
    type = Column(Enum(UploadType), nullable=False)
