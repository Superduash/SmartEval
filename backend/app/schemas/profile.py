from pydantic import BaseModel, EmailStr

from app.models.user import Role


class ProfileResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: Role
    phone: str | None = None
    avatar_url: str | None = None
    timezone: str | None = None
    bio: str | None = None


class ProfileUpdateRequest(BaseModel):
    name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None
    timezone: str | None = None
    bio: str | None = None
