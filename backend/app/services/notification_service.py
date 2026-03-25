from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(
    db: Session,
    *,
    user_id: int,
    title: str,
    message: str,
    kind: str = "info",
    exam_id: int | None = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        exam_id=exam_id,
        title=title,
        message=message,
        kind=kind,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def list_notifications(db: Session, *, user_id: int, limit: int = 50) -> list[Notification]:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc(), Notification.id.desc())
        .limit(limit)
        .all()
    )
