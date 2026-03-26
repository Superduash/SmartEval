from sqlalchemy.orm import Session
from typing import Any, cast

from app.models.profile import Profile
from app.models.user import User


def get_or_create_profile(db: Session, user_id: int) -> Profile:
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if profile:
        return profile

    profile = Profile(user_id=user_id)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def update_profile(db: Session, user: User, *, name: str | None, phone: str | None, avatar_url: str | None, timezone: str | None, bio: str | None) -> tuple[User, Profile]:
    user_obj = cast(Any, user)
    user_id = cast(int, user_obj.id)
    profile = get_or_create_profile(db, user_id)
    profile_obj = cast(Any, profile)

    if name is not None and name.strip():
        user_obj.name = name.strip()
    if phone is not None:
        profile_obj.phone = phone.strip() if phone else None
    if avatar_url is not None:
        profile_obj.avatar_url = avatar_url.strip() if avatar_url else None
    if timezone is not None:
        profile_obj.timezone = timezone.strip() if timezone else None
    if bio is not None:
        profile_obj.bio = bio.strip() if bio else None

    db.add(user)
    db.add(profile)
    db.commit()
    db.refresh(user)
    db.refresh(profile)
    return user, profile
