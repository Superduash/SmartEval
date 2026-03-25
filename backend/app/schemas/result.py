from pydantic import BaseModel


class ResultResponse(BaseModel):
    id: int
    student_id: int
    exam_id: int
    marks: float
    feedback: str

    class Config:
        from_attributes = True


class EvaluateRequest(BaseModel):
    exam_id: int
    student_id: int
    question_upload_id: int
    answer_upload_id: int
    rubric_upload_id: int


class ParentMessageResponse(BaseModel):
    message: str
    performance_level: str
    recommendation: str


class TrainerPlanResponse(BaseModel):
    techniques: list[str]
    weekly_plan: list[str]
    daily_time_minutes: int
    focus_areas: list[str]
