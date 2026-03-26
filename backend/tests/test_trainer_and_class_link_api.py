from app.models.class_link import ClassLink


def test_student_teacher_link_flow(client_student):
    join_resp = client_student.post("/api/v1/student/teachers/1/join")
    assert join_resp.status_code == 200
    assert join_resp.json()["success"] is True

    list_resp = client_student.get("/api/v1/student/teachers")
    assert list_resp.status_code == 200
    payload = list_resp.json()
    assert len(payload["teachers"]) == 1
    assert payload["teachers"][0]["teacher_id"] == 1

    unlink_resp = client_student.delete("/api/v1/student/teachers/1")
    assert unlink_resp.status_code == 200
    assert unlink_resp.json()["success"] is True


def test_teacher_roster_lists_linked_students(db_session, client_teacher):
    db_session.add(ClassLink(student_id=2, teacher_id=1, status="active"))
    db_session.commit()

    resp = client_teacher.get("/api/v1/teacher/students")
    assert resp.status_code == 200
    students = resp.json()["students"]
    assert len(students) == 1
    assert students[0]["student_id"] == 2


def test_trainer_session_lifecycle(client_student):
    create_resp = client_student.post(
        "/api/v1/student/trainer-sessions",
        json={"plan_id": "week-1", "title": "Week 1"},
    )
    assert create_resp.status_code == 200
    session = create_resp.json()
    session_id = session["id"]
    assert session["plan_id"] == "week-1"

    update_resp = client_student.patch(
        f"/api/v1/student/trainer-sessions/{session_id}",
        json={"elapsed_seconds": 135, "is_running": False},
    )
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["elapsed_seconds"] == 135
    assert updated["is_running"] is False

    complete_resp = client_student.post(
        f"/api/v1/student/trainer-sessions/{session_id}/complete",
        json={"elapsed_seconds": 200, "is_running": False},
    )
    assert complete_resp.status_code == 200
    completed = complete_resp.json()
    assert completed["status"] == "completed"
    assert completed["elapsed_seconds"] == 200

    list_resp = client_student.get("/api/v1/student/trainer-sessions")
    assert list_resp.status_code == 200
    sessions = list_resp.json()["sessions"]
    assert len(sessions) == 1
    assert sessions[0]["id"] == session_id
