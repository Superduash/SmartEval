from pydantic import BaseModel, EmailStr


class WaitlistLeadCreateRequest(BaseModel):
    email: EmailStr
    source: str = "pricing"


class WaitlistLeadResponse(BaseModel):
    id: int
    email: EmailStr
    source: str
    status: str

    class Config:
        from_attributes = True
