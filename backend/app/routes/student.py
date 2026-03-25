from datetime import datetime, timezone
import logging
from typing import cast

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.agents.orchestrator import AgentOrchestrator
from app.core.database import get_db
from app.core.deps import require_student
from app.models.notification import Notification
from app.models.result import Result
from app.models.upload import Upload, UploadType
from app.models.user import User
from app.schemas.analytics import StudentAnalyticsResponse
from app.schemas.result import ParentMessageResponse, ResultResponse, TrainerPlanResponse
from app.schemas.student import MemoryInsightsResponse, NotificationItemResponse, NotificationsResponse, StudentHistoryResponse
from app.schemas.upload import UploadResponse
from app.services.analytics_service import get_student_analytics
from app.services.notification_service import create_notification, list_notifications
from app.services.upload_service import create_upload

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/upload-answer", response_model=UploadResponse)
def upload_answer_sheet(
    exam_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    student: User = Depends(require_student),
):
    try:
        student_id = cast(int, student.id)
        safe_name = str(file.filename or "answer_upload.bin")
        content = file.file.read()
        upload = create_upload(db, student_id, safe_name, content, UploadType.student_answer, exam_id)

        create_notification(
            db,
            user_id=student_id,
            exam_id=exam_id,
            title="Answer Uploaded",
            message=f"Your answer for exam {exam_id} was uploaded successfully.",
            kind="upload",
        )

        question_upload = (
            db.query(Upload)
            .filter(Upload.exam_id == exam_id, Upload.type == UploadType.question_paper)
            .order_by(Upload.id.desc())
            .first()
        )
        rubric_upload = (
            db.query(Upload)
            .filter(Upload.exam_id == exam_id, Upload.type == UploadType.rubric)
            .order_by(Upload.id.desc())
            .first()
        )

        if question_upload and rubric_upload:
            orchestrator = AgentOrchestrator(db)
            orchestrator.evaluate_submission(
                student_id=student_id,
                exam_id=exam_id,
                question_path=str(question_upload.file_path),
                answer_path=str(upload.file_path),
                rubric_path=str(rubric_upload.file_path),
            )
        else:
            create_notification(
                db,
                user_id=student_id,
                exam_id=exam_id,
                title="Evaluation Pending",
                message="Your answer is uploaded. Evaluation will start when teacher rubric and question paper are available.",
                kind="pending",
            )

        return upload
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Student upload failed for user=%s exam=%s", student.id, exam_id)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to process answer upload") from exc


@router.get("/results", response_model=list[ResultResponse])
def my_results(db: Session = Depends(get_db), student: User = Depends(require_student)):
    return db.query(Result).filter(Result.student_id == student.id).order_by(Result.id.desc()).all()


@router.get("/feedback/{exam_id}", response_model=ResultResponse)
def feedback_for_exam(exam_id: int, db: Session = Depends(get_db), student: User = Depends(require_student)):
    result = db.query(Result).filter(Result.student_id == student.id, Result.exam_id == exam_id).first()
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found")
    return result


@router.get("/analytics", response_model=StudentAnalyticsResponse)
def student_analytics(db: Session = Depends(get_db), student: User = Depends(require_student)):
    return get_student_analytics(db, cast(int, student.id))


@router.get("/parent-message", response_model=ParentMessageResponse)
def parent_message(db: Session = Depends(get_db), student: User = Depends(require_student)):
    latest = db.query(Result).filter(Result.student_id == student.id).order_by(Result.id.desc()).first()
    if not latest:
        return ParentMessageResponse(
            message="No results available yet. Once evaluations complete, a parent summary will appear here.",
            performance_level="no_data",
            recommendation="Complete at least one evaluated submission to generate personalized guidance.",
        )

    orchestrator = AgentOrchestrator(db)
    payload = orchestrator.parent_message(cast(float, latest.marks))
    return ParentMessageResponse(**payload)


@router.get("/trainer-plan", response_model=TrainerPlanResponse)
def trainer_plan(db: Session = Depends(get_db), student: User = Depends(require_student)):
    analytics = get_student_analytics(db, cast(int, student.id))
    orchestrator = AgentOrchestrator(db)
    average = float(analytics.get("average", 0.0))
    plan = orchestrator.trainer_plan(student, average)
    return TrainerPlanResponse(**plan)


@router.get("/notifications", response_model=NotificationsResponse)
def student_notifications(db: Session = Depends(get_db), student: User = Depends(require_student)):
    notifications = list_notifications(db, user_id=cast(int, student.id), limit=50)
    return NotificationsResponse(
        notifications=[
            NotificationItemResponse(
                id=cast(int, n.id),
                title=str(n.title),
                message=str(n.message),
                kind=str(n.kind),
                is_read=bool(n.is_read),
                created_at=cast(datetime, n.created_at),
            )
            for n in notifications
        ],
    )


@router.get("/memory-insights", response_model=MemoryInsightsResponse)
def memory_insights(db: Session = Depends(get_db), student: User = Depends(require_student)):
    orchestrator = AgentOrchestrator(db)
    insights = orchestrator.memory_insights(cast(int, student.id))
    return MemoryInsightsResponse(**insights)


@router.get("/history", response_model=StudentHistoryResponse)
def student_history(db: Session = Depends(get_db), student: User = Depends(require_student)):
    notifications = db.query(Notification).filter(Notification.user_id == cast(int, student.id)).order_by(Notification.created_at.desc()).limit(100).all()

    history = [
        {
            "title": n.title,
            "message": n.message,
            "event_type": n.kind,
            "timestamp": n.created_at,
            "exam_id": n.exam_id,
            "marks": None,
        }
        for n in notifications
    ]

    if not history:
        history.append(
            {
                "title": "No History Yet",
                "message": "Start by uploading an answer sheet to generate activity.",
                "event_type": "info",
                "timestamp": datetime.now(timezone.utc),
                "exam_id": None,
                "marks": None,
            }
        )

    return {"history": history}
