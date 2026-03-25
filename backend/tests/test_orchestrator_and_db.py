from app.agents.orchestrator import AgentOrchestrator
from app.models import Analytics, Exam, Result


def test_orchestrator_stores_marks_and_updates_analytics(db_session, mocker):
    exam = Exam(teacher_id=1, subject="Math")
    db_session.add(exam)
    db_session.commit()
    db_session.refresh(exam)

    orchestrator = AgentOrchestrator(db_session)
    mocker.patch.object(orchestrator.input_agent, "run", return_value={"question_text": "Q", "answer_text": "A", "rubric_text": "R"})
    mocker.patch.object(orchestrator.evaluation_agent, "run", return_value={"marks": 78, "feedback": "Good attempt"})

    result = orchestrator.evaluate_submission(
        student_id=2,
        exam_id=exam.id,
        question_path="q",
        answer_path="a",
        rubric_path="r",
    )

    assert result.marks == 78
    stored = db_session.query(Result).filter(Result.student_id == 2, Result.exam_id == exam.id).first()
    assert stored is not None

    analytics = db_session.query(Analytics).filter(Analytics.student_id == 2).first()
    assert analytics is not None
    assert analytics.average == 78


def test_memory_insights_endpoint_data(client_student, db_session):
    db_session.add_all(
        [
            Result(student_id=2, exam_id=1, marks=45, feedback="f1"),
            Result(student_id=2, exam_id=2, marks=55, feedback="f2"),
        ]
    )
    db_session.commit()

    response = client_student.get("/api/v1/student/memory-insights")
    assert response.status_code == 200
    payload = response.json()
    assert payload["average"] == 50
    assert "insights" in payload
