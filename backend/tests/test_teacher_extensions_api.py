from app.models import Exam


def test_teacher_list_exams_endpoint(client_teacher, db_session):
    db_session.add_all(
        [
            Exam(teacher_id=1, subject="Math"),
            Exam(teacher_id=1, subject="Physics"),
        ]
    )
    db_session.commit()

    response = client_teacher.get("/api/v1/teacher/exams")
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) >= 2


def test_teacher_report_pdf_contains_response(client_teacher, db_session):
    exam = Exam(teacher_id=1, subject="Science")
    db_session.add(exam)
    db_session.commit()
    db_session.refresh(exam)

    response = client_teacher.get(f"/api/v1/teacher/report/{exam.id}")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/pdf")
