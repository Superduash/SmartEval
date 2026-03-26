# pyright: reportGeneralTypeIssues=false

from datetime import datetime, timezone
from typing import Any, cast

from sqlalchemy.orm import Session

from app.models.trainer_session import TrainerSession


def list_sessions(db: Session, *, student_id: int) -> list[TrainerSession]:
    return (
        db.query(TrainerSession)
        .filter(TrainerSession.student_id == student_id)
        .order_by(TrainerSession.updated_at.desc(), TrainerSession.id.desc())
        .all()
    )


def get_or_create_session(db: Session, *, student_id: int, plan_id: str, title: str) -> TrainerSession:
    existing = (
        db.query(TrainerSession)
        .filter(
            TrainerSession.student_id == student_id,
            TrainerSession.plan_id == plan_id,
            TrainerSession.status != "completed",
        )
        .order_by(TrainerSession.id.desc())
        .first()
    )
    if existing:
        return existing

    session = TrainerSession(
        student_id=student_id,
        plan_id=plan_id,
        title=title,
        elapsed_seconds=0,
        is_running=True,
        status="active",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def update_session(
    db: Session,
    *,
    session: TrainerSession,
    elapsed_seconds: int,
    is_running: bool,
) -> TrainerSession:
    session_obj = cast(Any, session)
    session_obj.elapsed_seconds = max(0, int(elapsed_seconds))
    session_obj.is_running = bool(is_running)
    if str(session_obj.status) != "completed":
        session_obj.status = "active" if is_running else "paused"

    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def complete_session(db: Session, *, session: TrainerSession, elapsed_seconds: int) -> TrainerSession:
    session_obj = cast(Any, session)
    session_obj.elapsed_seconds = max(0, int(elapsed_seconds))
    session_obj.is_running = False
    session_obj.status = "completed"
    session_obj.completed_at = datetime.now(timezone.utc)

    db.add(session)
    db.commit()
    db.refresh(session)
    return session
