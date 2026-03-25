from app.models import Result


def test_teacher_analytics_charts_generated(client_teacher, db_session):
    db_session.add_all(
        [
            Result(student_id=2, exam_id=10, marks=35, feedback="x"),
            Result(student_id=2, exam_id=10, marks=75, feedback="y"),
        ]
    )
    db_session.commit()

    response = client_teacher.get("/api/v1/teacher/analytics/10")
    assert response.status_code == 200
    payload = response.json()
    assert "bar_chart" in payload
    assert "pie_chart" in payload
    assert payload["highest_mark"] == 75


def test_student_analytics_returns_line_and_pie(client_student, db_session):
    db_session.add_all(
        [
            Result(student_id=2, exam_id=1, marks=65, feedback="A"),
            Result(student_id=2, exam_id=2, marks=75, feedback="B"),
        ]
    )
    db_session.commit()

    response = client_student.get("/api/v1/student/analytics")
    assert response.status_code == 200
    payload = response.json()
    assert "line_chart" in payload
    assert "pie_chart" in payload
