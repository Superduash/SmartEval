from pydantic import BaseModel, EmailStr

from app.models.user import Role


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Role


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Role


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: Role

    class Config:
        from_attributes = True
