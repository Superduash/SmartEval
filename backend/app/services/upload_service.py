from sqlalchemy.orm import Session

from app.models.upload import Upload, UploadType
from app.services.storage.factory import get_storage_service


def create_upload(db: Session, user_id: int, file_name: str, content: bytes, upload_type: UploadType, exam_id: int | None = None) -> Upload:
    storage = get_storage_service()
    path = storage.save_file(file_name, content)

    upload = Upload(user_id=user_id, exam_id=exam_id, file_path=path, type=upload_type)
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload
