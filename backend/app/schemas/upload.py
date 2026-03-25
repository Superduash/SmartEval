from pydantic import BaseModel

from app.models.upload import UploadType


class UploadResponse(BaseModel):
    id: int
    user_id: int
    exam_id: int | None
    file_path: str
    type: UploadType

    class Config:
        from_attributes = True
