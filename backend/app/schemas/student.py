from datetime import datetime

from pydantic import BaseModel


class NotificationItemResponse(BaseModel):
    id: int
    title: str
    message: str
    kind: str
    is_read: bool
    created_at: datetime


class NotificationsResponse(BaseModel):
    notifications: list[NotificationItemResponse]


class HistoryItemResponse(BaseModel):
    title: str
    message: str
    event_type: str
    timestamp: datetime
    exam_id: int | None = None
    marks: float | None = None


class StudentHistoryResponse(BaseModel):
    history: list[HistoryItemResponse]


class MemoryInsightsResponse(BaseModel):
    average: float
    improvement: float
    insights: list[str]
    trend: str
