from sqlalchemy.orm import Session

from app.models.parent_contact import ParentContact
from app.services.email_service import send_email


def list_parents(db: Session, *, student_id: int) -> list[ParentContact]:
    return (
        db.query(ParentContact)
        .filter(ParentContact.student_id == student_id)
        .order_by(ParentContact.id.desc())
        .all()
    )


def add_parent(db: Session, *, student_id: int, name: str, email: str, relationship: str) -> ParentContact:
    normalized_email = email.strip().lower()
    existing = (
        db.query(ParentContact)
        .filter(ParentContact.student_id == student_id, ParentContact.email == normalized_email)
        .first()
    )
    if existing:
        return existing

    parent = ParentContact(
        student_id=student_id,
        name=name.strip() or "Parent / Guardian",
        email=normalized_email,
        relationship=relationship.strip() or "Guardian",
        status="active",
    )
    db.add(parent)
    db.commit()
    db.refresh(parent)
    return parent


def remove_parent(db: Session, *, student_id: int, parent_id: int) -> bool:
    parent = (
        db.query(ParentContact)
        .filter(ParentContact.id == parent_id, ParentContact.student_id == student_id)
        .first()
    )
    if not parent:
        return False

    db.delete(parent)
    db.commit()
    return True


def send_parent_invite(*, student_name: str, to_email: str) -> None:
    subject = "SmartEval Parent Access Invitation"
    body = (
        f"Hello,\n\n{student_name} invited you to receive SmartEval progress updates. "
        "This feature is now available in your student dashboard.\n\n"
        "You will receive periodic performance summaries.\n\n"
        "- SmartEval"
    )
    send_email(to_email=to_email, subject=subject, body=body)


def send_parent_progress_update(*, to_email: str, student_name: str, summary: str) -> None:
    subject = f"SmartEval Progress Update for {student_name}"
    body = f"Hello,\n\nHere is the latest update for {student_name}:\n\n{summary}\n\n- SmartEval"
    send_email(to_email=to_email, subject=subject, body=body)
