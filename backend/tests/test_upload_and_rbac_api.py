from io import BytesIO

from fastapi import HTTPException

from app.core.deps import require_teacher
from app.models import Role, User


def test_teacher_upload_file(client_teacher):
    files = {"file": ("paper.txt", BytesIO(b"sample content"), "text/plain")}
    data = {"type": "question_paper", "exam_id": "1"}
    response = client_teacher.post("/api/v1/teacher/upload", files=files, data=data)

    assert response.status_code == 200
    payload = response.json()
    assert payload["type"] == "question_paper"
    assert payload["exam_id"] == 1


def test_student_upload_answer_sheet(client_student):
    files = {"file": ("answer.txt", BytesIO(b"student answer"), "text/plain")}
    data = {"exam_id": "1"}
    response = client_student.post("/api/v1/student/upload-answer", files=files, data=data)

    assert response.status_code == 200
    payload = response.json()
    assert payload["type"] == "student_answer"


def test_role_guard_rejects_non_teacher_user():
    student = User(id=88, name="s", email="s@test", password="x", role=Role.student)
    try:
        require_teacher(student)
        assert False, "Expected forbidden exception"
    except HTTPException as exc:
        assert exc.status_code == 403


def test_teacher_endpoint_requires_authentication(client_public):
    response = client_public.get("/api/v1/teacher/results")
    assert response.status_code in (401, 403)
