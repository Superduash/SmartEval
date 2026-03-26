from pydantic import BaseModel


class NotificationUpdateRequest(BaseModel):
    is_read: bool


class ActionResponse(BaseModel):
    success: bool
    message: str
