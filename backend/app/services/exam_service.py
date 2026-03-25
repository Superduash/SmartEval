from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.exam import Exam


def create_exam(db: Session, teacher_id: int, subject: str) -> Exam:
    exam = Exam(teacher_id=teacher_id, subject=subject)
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return exam


def get_exam_by_id(db: Session, exam_id: int) -> Exam:
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")
    return exam


def list_exams_by_teacher(db: Session, teacher_id: int) -> list[Exam]:
    return db.query(Exam).filter(Exam.teacher_id == teacher_id).order_by(Exam.id.desc()).all()
