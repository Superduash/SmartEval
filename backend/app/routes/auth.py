from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import cast

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import Role
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.schemas.profile import ProfileResponse, ProfileUpdateRequest
from app.schemas.waitlist import WaitlistLeadCreateRequest, WaitlistLeadResponse
from app.services.auth_service import login_user, register_user
from app.services.profile_service import get_or_create_profile, update_profile
from app.services.waitlist_service import add_waitlist_lead

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    token, role = login_user(db, payload)
    return TokenResponse(access_token=token, role=role)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/profile", response_model=ProfileResponse)
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = cast(int, current_user.id)
    profile = get_or_create_profile(db, user_id)
    return ProfileResponse(
        id=user_id,
        name=str(current_user.name),
        email=str(current_user.email),
        role=cast(Role, current_user.role),
        phone=cast(str | None, profile.phone),
        avatar_url=cast(str | None, profile.avatar_url),
        timezone=cast(str | None, profile.timezone),
        bio=cast(str | None, profile.bio),
    )


@router.put("/profile", response_model=ProfileResponse)
def put_profile(payload: ProfileUpdateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user, profile = update_profile(
        db,
        current_user,
        name=payload.name,
        phone=payload.phone,
        avatar_url=payload.avatar_url,
        timezone=payload.timezone,
        bio=payload.bio,
    )
    return ProfileResponse(
        id=cast(int, user.id),
        name=str(user.name),
        email=str(user.email),
        role=cast(Role, user.role),
        phone=cast(str | None, profile.phone),
        avatar_url=cast(str | None, profile.avatar_url),
        timezone=cast(str | None, profile.timezone),
        bio=cast(str | None, profile.bio),
    )


@router.post("/waitlist", response_model=WaitlistLeadResponse)
def create_waitlist(payload: WaitlistLeadCreateRequest, db: Session = Depends(get_db)):
    return add_waitlist_lead(db, email=payload.email, source=payload.source)
