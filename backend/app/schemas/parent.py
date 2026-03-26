from pydantic import BaseModel, EmailStr


class ParentContactCreateRequest(BaseModel):
    name: str
    email: EmailStr
    relationship: str = "Guardian"


class ParentContactResponse(BaseModel):
    id: int
    student_id: int
    name: str
    email: EmailStr
    relationship: str
    status: str
    email_opt_in: bool

    class Config:
        from_attributes = True


class ParentContactsResponse(BaseModel):
    parents: list[ParentContactResponse]


class ParentInviteRequest(BaseModel):
    email: EmailStr
    name: str = "Parent / Guardian"
    relationship: str = "Guardian"
