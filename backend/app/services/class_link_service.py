# pyright: reportGeneralTypeIssues=false

from sqlalchemy.orm import Session
from typing import Any, cast

from app.models.class_link import ClassLink
from app.models.user import Role, User


def list_student_teacher_links(db: Session, *, student_id: int) -> list[tuple[ClassLink, User]]:
    rows = (
        db.query(ClassLink, User)
        .join(User, User.id == ClassLink.teacher_id)
        .filter(ClassLink.student_id == student_id)
        .order_by(ClassLink.joined_at.desc(), ClassLink.id.desc())
        .all()
    )
    return [(cast(ClassLink, row[0]), cast(User, row[1])) for row in rows]


def list_teacher_student_links(db: Session, *, teacher_id: int) -> list[tuple[ClassLink, User]]:
    rows = (
        db.query(ClassLink, User)
        .join(User, User.id == ClassLink.student_id)
        .filter(ClassLink.teacher_id == teacher_id)
        .order_by(ClassLink.joined_at.desc(), ClassLink.id.desc())
        .all()
    )
    return [(cast(ClassLink, row[0]), cast(User, row[1])) for row in rows]


def join_teacher(db: Session, *, student_id: int, teacher_id: int) -> ClassLink:
    teacher = db.query(User).filter(User.id == teacher_id).first()
    teacher_obj = cast(Any, teacher)
    if not teacher or teacher_obj.role != Role.teacher:
        raise ValueError("Teacher not found")

    existing = (
        db.query(ClassLink)
        .filter(ClassLink.student_id == student_id, ClassLink.teacher_id == teacher_id)
        .first()
    )
    if existing:
        existing_obj = cast(Any, existing)
        if str(existing_obj.status) != "active":
            existing_obj.status = "active"
            db.add(existing)
            db.commit()
            db.refresh(existing)
        return existing

    link = ClassLink(student_id=student_id, teacher_id=teacher_id, status="active")
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


def unlink_teacher(db: Session, *, student_id: int, teacher_id: int) -> bool:
    link = (
        db.query(ClassLink)
        .filter(ClassLink.student_id == student_id, ClassLink.teacher_id == teacher_id)
        .first()
    )
    if not link:
        return False

    db.delete(link)
    db.commit()
    return True
