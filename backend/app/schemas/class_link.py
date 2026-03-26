from datetime import datetime

from pydantic import BaseModel, EmailStr


class TeacherLinkResponse(BaseModel):
    teacher_id: int
    teacher_name: str
    teacher_email: EmailStr
    joined_at: datetime
    status: str


class TeacherLinksResponse(BaseModel):
    teachers: list[TeacherLinkResponse]


class StudentLinkResponse(BaseModel):
    student_id: int
    student_name: str
    student_email: EmailStr
    joined_at: datetime
    status: str


class StudentLinksResponse(BaseModel):
    students: list[StudentLinkResponse]
