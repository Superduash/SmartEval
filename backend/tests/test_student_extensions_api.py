from app.models import Exam, Result


def test_student_notifications_and_history_endpoints(client_student, db_session):
    exam = Exam(teacher_id=1, subject="History")
    db_session.add(exam)
    db_session.commit()
    db_session.refresh(exam)

    db_session.add(Result(student_id=2, exam_id=exam.id, marks=84, feedback="Well done"))
    db_session.commit()

    notif_response = client_student.get("/api/v1/student/notifications")
    assert notif_response.status_code == 200
    notif_payload = notif_response.json()
    assert "notifications" in notif_payload

    history_response = client_student.get("/api/v1/student/history")
    assert history_response.status_code == 200
    history_payload = history_response.json()
    assert "history" in history_payload
    assert len(history_payload["history"]) >= 1


def test_student_memory_insights_contains_trend(client_student, db_session):
    db_session.add_all(
        [
            Result(student_id=2, exam_id=1, marks=40, feedback="f1"),
            Result(student_id=2, exam_id=2, marks=65, feedback="f2"),
        ]
    )
    db_session.commit()

    response = client_student.get("/api/v1/student/memory-insights")
    assert response.status_code == 200
    payload = response.json()
    assert "average" in payload
    assert "improvement" in payload
    assert "insights" in payload
    assert "trend" in payload
