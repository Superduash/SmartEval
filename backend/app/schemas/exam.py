from datetime import datetime

from pydantic import BaseModel


class ExamCreateRequest(BaseModel):
    subject: str


class ExamResponse(BaseModel):
    id: int
    teacher_id: int
    subject: str
    date: datetime

    class Config:
        from_attributes = True
