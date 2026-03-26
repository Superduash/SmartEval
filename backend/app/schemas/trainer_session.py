from datetime import datetime

from pydantic import BaseModel


class TrainerSessionCreateRequest(BaseModel):
    plan_id: str
    title: str


class TrainerSessionUpdateRequest(BaseModel):
    elapsed_seconds: int
    is_running: bool


class TrainerSessionResponse(BaseModel):
    id: int
    student_id: int
    plan_id: str
    title: str
    elapsed_seconds: int
    is_running: bool
    status: str
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None = None

    class Config:
        from_attributes = True


class TrainerSessionsResponse(BaseModel):
    sessions: list[TrainerSessionResponse]
