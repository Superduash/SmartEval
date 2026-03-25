from types import SimpleNamespace

from app.models import Exam, Upload, UploadType


def test_teacher_evaluation_endpoint_returns_marks(client_teacher, db_session, mocker):
    exam = Exam(teacher_id=1, subject="Science")
    db_session.add(exam)
    db_session.commit()
    db_session.refresh(exam)

    q = Upload(user_id=1, exam_id=exam.id, file_path="q.txt", type=UploadType.question_paper)
    a = Upload(user_id=1, exam_id=exam.id, file_path="a.txt", type=UploadType.answer_script)
    r = Upload(user_id=1, exam_id=exam.id, file_path="r.txt", type=UploadType.rubric)
    db_session.add_all([q, a, r])
    db_session.commit()
    db_session.refresh(q)
    db_session.refresh(a)
    db_session.refresh(r)

    mocker.patch(
        "app.routes.teacher.AgentOrchestrator.evaluate_submission",
        return_value=SimpleNamespace(id=1, student_id=2, exam_id=exam.id, marks=88, feedback="Strong answer"),
    )

    payload = {
        "exam_id": exam.id,
        "student_id": 2,
        "question_upload_id": q.id,
        "answer_upload_id": a.id,
        "rubric_upload_id": r.id,
    }

    response = client_teacher.post("/api/v1/teacher/evaluate", json=payload)
    assert response.status_code == 200
    assert response.json()["marks"] == 88
