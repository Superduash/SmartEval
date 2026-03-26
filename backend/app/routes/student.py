from datetime import datetime, timezone
from io import StringIO
import logging
from typing import cast

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.agents.orchestrator import AgentOrchestrator
from app.core.database import get_db
from app.core.deps import require_student
from app.models.notification import Notification
from app.models.parent_contact import ParentContact
from app.models.result import Result
from app.models.trainer_session import TrainerSession
from app.models.upload import Upload, UploadType
from app.models.user import User
from app.schemas.class_link import TeacherLinkResponse, TeacherLinksResponse
from app.schemas.notification_action import ActionResponse, NotificationUpdateRequest
from app.schemas.parent import ParentContactCreateRequest, ParentContactResponse, ParentContactsResponse, ParentInviteRequest
from app.schemas.analytics import StudentAnalyticsResponse
from app.schemas.result import ParentMessageResponse, ResultResponse, TrainerPlanResponse
from app.schemas.student import MemoryInsightsResponse, NotificationItemResponse, NotificationsResponse, StudentHistoryResponse
from app.schemas.trainer_session import TrainerSessionCreateRequest, TrainerSessionResponse, TrainerSessionsResponse, TrainerSessionUpdateRequest
from app.schemas.upload import UploadResponse
from app.services.analytics_service import get_student_analytics
from app.services.class_link_service import join_teacher, list_student_teacher_links, unlink_teacher
from app.services.notification_service import create_notification, delete_notification, list_notifications, mark_notification_read
from app.services.parent_service import add_parent, list_parents, remove_parent, send_parent_invite, send_parent_progress_update
from app.services.trainer_session_service import complete_session, get_or_create_session, list_sessions, update_session
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
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
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


@router.get("/trainer-sessions", response_model=TrainerSessionsResponse)
def trainer_sessions(db: Session = Depends(get_db), student: User = Depends(require_student)):
    sessions = list_sessions(db, student_id=cast(int, student.id))
    return TrainerSessionsResponse(sessions=[TrainerSessionResponse.model_validate(item) for item in sessions])


@router.post("/trainer-sessions", response_model=TrainerSessionResponse)
def create_trainer_session(
    payload: TrainerSessionCreateRequest,
    db: Session = Depends(get_db),
    student: User = Depends(require_student),
):
    session = get_or_create_session(
        db,
        student_id=cast(int, student.id),
        plan_id=payload.plan_id,
        title=payload.title,
    )
    return TrainerSessionResponse.model_validate(session)


@router.patch("/trainer-sessions/{session_id}", response_model=TrainerSessionResponse)
def patch_trainer_session(
    session_id: int,
    payload: TrainerSessionUpdateRequest,
    db: Session = Depends(get_db),
    student: User = Depends(require_student),
):
    session = (
        db.query(TrainerSession)
        .filter(TrainerSession.id == session_id, TrainerSession.student_id == cast(int, student.id))
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainer session not found")

    updated = update_session(
        db,
        session=session,
        elapsed_seconds=payload.elapsed_seconds,
        is_running=payload.is_running,
    )
    return TrainerSessionResponse.model_validate(updated)


@router.post("/trainer-sessions/{session_id}/complete", response_model=TrainerSessionResponse)
def finish_trainer_session(
    session_id: int,
    payload: TrainerSessionUpdateRequest,
    db: Session = Depends(get_db),
    student: User = Depends(require_student),
):
    session = (
        db.query(TrainerSession)
        .filter(TrainerSession.id == session_id, TrainerSession.student_id == cast(int, student.id))
        .first()
    )
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trainer session not found")

    completed = complete_session(db, session=session, elapsed_seconds=payload.elapsed_seconds)
    return TrainerSessionResponse.model_validate(completed)


@router.get("/teachers", response_model=TeacherLinksResponse)
def my_teachers(db: Session = Depends(get_db), student: User = Depends(require_student)):
    rows = list_student_teacher_links(db, student_id=cast(int, student.id))
    teachers = [
        TeacherLinkResponse(
            teacher_id=cast(int, teacher.id),
            teacher_name=str(teacher.name),
            teacher_email=str(teacher.email),
            joined_at=cast(datetime, link.joined_at),
            status=str(link.status),
        )
        for link, teacher in rows
    ]
    return TeacherLinksResponse(teachers=teachers)


@router.post("/teachers/{teacher_id}/join", response_model=ActionResponse)
def add_teacher_link(teacher_id: int, db: Session = Depends(get_db), student: User = Depends(require_student)):
    try:
        join_teacher(db, student_id=cast(int, student.id), teacher_id=teacher_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return ActionResponse(success=True, message="Teacher linked")


@router.delete("/teachers/{teacher_id}", response_model=ActionResponse)
def remove_teacher_link(teacher_id: int, db: Session = Depends(get_db), student: User = Depends(require_student)):
    ok = unlink_teacher(db, student_id=cast(int, student.id), teacher_id=teacher_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher link not found")
    return ActionResponse(success=True, message="Teacher unlinked")


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


@router.patch("/notifications/{notification_id}", response_model=NotificationItemResponse)
def update_notification(
    notification_id: int,
    payload: NotificationUpdateRequest,
    db: Session = Depends(get_db),
    student: User = Depends(require_student),
):
    updated = mark_notification_read(
        db,
        user_id=cast(int, student.id),
        notification_id=notification_id,
        is_read=payload.is_read,
    )
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    return NotificationItemResponse(
        id=cast(int, updated.id),
        title=str(updated.title),
        message=str(updated.message),
        kind=str(updated.kind),
        is_read=bool(updated.is_read),
        created_at=cast(datetime, updated.created_at),
    )


@router.delete("/notifications/{notification_id}", response_model=ActionResponse)
def remove_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    student: User = Depends(require_student),
):
    ok = delete_notification(db, user_id=cast(int, student.id), notification_id=notification_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return ActionResponse(success=True, message="Notification removed")


@router.get("/parents", response_model=ParentContactsResponse)
def student_parents(db: Session = Depends(get_db), student: User = Depends(require_student)):
    records = list_parents(db, student_id=cast(int, student.id))
    return ParentContactsResponse(parents=[ParentContactResponse.model_validate(item) for item in records])


@router.post("/parents", response_model=ParentContactResponse)
def create_parent_contact(
    payload: ParentContactCreateRequest,
    db: Session = Depends(get_db),
    student: User = Depends(require_student),
):
    parent = add_parent(
        db,
        student_id=cast(int, student.id),
        name=payload.name,
        email=payload.email,
        relationship=payload.relationship,
    )
    return ParentContactResponse.model_validate(parent)


@router.delete("/parents/{parent_id}", response_model=ActionResponse)
def delete_parent_contact(parent_id: int, db: Session = Depends(get_db), student: User = Depends(require_student)):
    ok = remove_parent(db, student_id=cast(int, student.id), parent_id=parent_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent contact not found")
    return ActionResponse(success=True, message="Parent removed")


@router.post("/parents/invite", response_model=ActionResponse)
def invite_parent(payload: ParentInviteRequest, db: Session = Depends(get_db), student: User = Depends(require_student)):
    add_parent(
        db,
        student_id=cast(int, student.id),
        name=payload.name,
        email=payload.email,
        relationship=payload.relationship,
    )
    try:
        send_parent_invite(student_name=str(student.name), to_email=payload.email)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    return ActionResponse(success=True, message="Invitation email sent")


@router.post("/parents/{parent_id}/send-update", response_model=ActionResponse)
def send_parent_update(parent_id: int, db: Session = Depends(get_db), student: User = Depends(require_student)):
    parent_contact = (
        db.query(ParentContact)
        .filter(ParentContact.id == parent_id, ParentContact.student_id == cast(int, student.id))
        .first()
    )

    if not parent_contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent contact not found")

    latest_result = (
        db.query(Result)
        .filter(Result.student_id == cast(int, student.id))
        .order_by(Result.id.desc())
        .first()
    )
    summary = (
        f"Latest marks: {cast(float, latest_result.marks):.1f}%"
        if latest_result
        else "No results yet. Student has uploaded submissions and is awaiting evaluation."
    )
    try:
        send_parent_progress_update(
            to_email=str(parent_contact.email),
            student_name=str(student.name),
            summary=summary,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    create_notification(
        db,
        user_id=cast(int, student.id),
        title="Parent Update Sent",
        message=f"Progress update sent to {parent_contact.email}.",
        kind="email",
    )
    return ActionResponse(success=True, message="Progress update sent")


@router.get("/results/{exam_id}/download")
def download_feedback(exam_id: int, db: Session = Depends(get_db), student: User = Depends(require_student)):
    result = db.query(Result).filter(Result.student_id == student.id, Result.exam_id == exam_id).first()
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Result not found")

    content = (
        f"SmartEval Feedback\n"
        f"Exam: {result.exam_id}\n"
        f"Student: {result.student_id}\n"
        f"Marks: {result.marks}\n\n"
        f"Feedback:\n{result.feedback}\n"
    )
    stream = StringIO(content)
    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename=exam_{exam_id}_feedback.txt"},
    )


@router.get("/analytics/export")
def export_student_analytics(db: Session = Depends(get_db), student: User = Depends(require_student)):
    analytics = get_student_analytics(db, cast(int, student.id))
    rows = [
        "metric,value",
        f"average,{analytics['average']}",
        f"improvement,{analytics['improvement']}",
    ]
    for idx, suggestion in enumerate(analytics.get("suggestions", []), start=1):
        escaped = str(suggestion).replace('"', "''")
        rows.append(f"suggestion_{idx},\"{escaped}\"")

    payload = "\n".join(rows)
    return StreamingResponse(
        iter([payload]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=student_analytics.csv"},
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
