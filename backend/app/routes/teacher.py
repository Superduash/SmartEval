from io import BytesIO
import logging
from datetime import datetime
from typing import Any, cast

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session

from app.agents.orchestrator import AgentOrchestrator
from app.core.config import settings
from app.core.database import get_db
from app.core.deps import require_teacher
from app.models.result import Result
from app.models.upload import Upload, UploadType
from app.models.user import User
from app.schemas.analytics import TeacherAnalyticsResponse
from app.schemas.class_link import StudentLinkResponse, StudentLinksResponse
from app.schemas.exam import ExamCreateRequest, ExamResponse
from app.schemas.result import EvaluateRequest, ResultResponse
from app.schemas.upload import UploadResponse
from app.services.analytics_service import get_teacher_analytics
from app.services.class_link_service import list_teacher_student_links
from app.services.exam_service import create_exam, list_exams_by_teacher
from app.services.upload_service import create_upload

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/exams", response_model=ExamResponse)
def create_exam_endpoint(payload: ExamCreateRequest, db: Session = Depends(get_db), teacher: User = Depends(require_teacher)):
    return create_exam(db, cast(int, teacher.id), payload.subject)


@router.get("/exams", response_model=list[ExamResponse])
def list_exams(db: Session = Depends(get_db), teacher: User = Depends(require_teacher)):
    return list_exams_by_teacher(db, cast(int, teacher.id))


@router.post("/upload", response_model=UploadResponse)
def upload_file_endpoint(
    type: UploadType = Form(...),
    exam_id: int | None = Form(default=None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    teacher: User = Depends(require_teacher),
):
    try:
        safe_name = str(file.filename or "teacher_upload.bin")
        content = file.file.read()
        upload = create_upload(db, cast(int, teacher.id), safe_name, content, type, exam_id)
        return upload
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Teacher upload failed for teacher=%s exam=%s", teacher.id, exam_id)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to upload file") from exc


@router.post("/evaluate", response_model=ResultResponse)
def evaluate_student(payload: EvaluateRequest, db: Session = Depends(get_db), teacher: User = Depends(require_teacher)):
    question_upload = db.query(Upload).filter(Upload.id == payload.question_upload_id).first()
    answer_upload = db.query(Upload).filter(Upload.id == payload.answer_upload_id).first()
    rubric_upload = db.query(Upload).filter(Upload.id == payload.rubric_upload_id).first()

    if not question_upload or not answer_upload or not rubric_upload:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Required uploads not found")

    orchestrator = AgentOrchestrator(db)
    return orchestrator.evaluate_submission(
        student_id=payload.student_id,
        exam_id=payload.exam_id,
        question_path=str(question_upload.file_path),
        answer_path=str(answer_upload.file_path),
        rubric_path=str(rubric_upload.file_path),
    )


@router.get("/results", response_model=list[ResultResponse])
def list_results(db: Session = Depends(get_db), teacher: User = Depends(require_teacher)):
    return db.query(Result).order_by(Result.id.desc()).all()


@router.get("/students", response_model=StudentLinksResponse)
def teacher_students(db: Session = Depends(get_db), teacher: User = Depends(require_teacher)):
    rows = list_teacher_student_links(db, teacher_id=cast(int, teacher.id))
    students = [
        # SQLAlchemy runtime values are datetime; explicit cast avoids static Column typing mismatch.
        StudentLinkResponse(
            student_id=cast(int, student.id),
            student_name=str(student.name),
            student_email=str(student.email),
            joined_at=cast(datetime, cast(Any, link).joined_at),
            status=str(link.status),
        )
        for link, student in rows
    ]
    return StudentLinksResponse(students=students)


@router.get("/analytics/{exam_id}", response_model=TeacherAnalyticsResponse)
def teacher_analytics(exam_id: int, db: Session = Depends(get_db), teacher: User = Depends(require_teacher)):
    return get_teacher_analytics(db, exam_id)


@router.get("/analytics/{exam_id}/export")
def export_teacher_analytics(exam_id: int, db: Session = Depends(get_db), teacher: User = Depends(require_teacher)):
    analytics = get_teacher_analytics(db, exam_id)
    rows = [
        "metric,value",
        f"exam_id,{exam_id}",
        f"average_marks,{analytics['average_marks']}",
        f"highest_mark,{analytics['highest_mark']}",
        f"pass_percentage,{analytics['pass_percentage']}",
    ]
    payload = "\n".join(rows)
    return StreamingResponse(
        iter([payload]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=teacher_analytics_exam_{exam_id}.csv"},
    )


@router.get("/results/export")
def export_teacher_results(db: Session = Depends(get_db), teacher: User = Depends(require_teacher)):
    rows = db.query(Result).order_by(Result.id.desc()).all()
    csv_rows = ["result_id,student_id,exam_id,marks"]
    for row in rows:
        csv_rows.append(f"{row.id},{row.student_id},{row.exam_id},{row.marks}")

    return StreamingResponse(
        iter(["\n".join(csv_rows)]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=teacher_results.csv"},
    )


@router.get("/report/{exam_id}")
def download_exam_report(exam_id: int, db: Session = Depends(get_db), teacher: User = Depends(require_teacher)):
    rows = (
        db.query(Result, User.name)
        .join(User, User.id == Result.student_id)
        .filter(Result.exam_id == exam_id)
        .all()
    )

    marks = [float(res.marks) for res, _ in rows]
    average = round(sum(marks) / len(marks), 2) if marks else 0.0

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    _width, height = letter

    y = height - 50
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(40, y, f"Evaluation Report - Exam {exam_id}")
    y -= 24

    pdf.setFont("Helvetica", 10)
    summary = f"Average Marks: {average} | Pass Mark: {settings.passing_mark}"
    pdf.drawString(40, y, summary)
    y -= 24

    if not rows:
        pdf.drawString(40, y, "No evaluated submissions found for this exam.")
    else:
        for res, student_name in rows:
            status_label = "PASS" if float(res.marks) >= settings.passing_mark else "FAIL"
            feedback = (res.feedback or "").replace("\n", " ")
            feedback = feedback[:140] + ("..." if len(feedback) > 140 else "")

            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawString(40, y, f"Student: {student_name} (ID {res.student_id})")
            y -= 14

            pdf.setFont("Helvetica", 10)
            pdf.drawString(40, y, f"Marks: {res.marks} | Result: {status_label}")
            y -= 14
            pdf.drawString(40, y, f"Feedback: {feedback}")
            y -= 20

            if y < 70:
                pdf.showPage()
                y = height - 50

    pdf.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=exam_{exam_id}_report.pdf"},
    )
