from types import SimpleNamespace

from app.agents.evaluation_agent import EvaluationAgent
from app.agents.input_agent import InputAgent
from app.agents.memory_agent import MemoryAgent
from app.agents.parent_agent import ParentAgent
from app.agents.personal_trainer_agent import PersonalTrainerAgent


def test_input_agent_structures_ocr_output(mocker):
    mocker.patch("app.agents.input_agent.extract_text", side_effect=["q", "a", "r"])
    agent = InputAgent()

    payload = agent.run("q.pdf", "a.pdf", "r.pdf")
    assert payload["question_text"] == "q"
    assert payload["answer_text"] == "a"
    assert payload["rubric_text"] == "r"


def test_evaluation_agent_fallback_logic_without_openai_key(mocker):
    # Bypass llm constructor side-effects during unit test.
    mocker.patch.object(EvaluationAgent, "__init__", lambda self: None)
    agent = EvaluationAgent()

    short = agent.run({"answer_text": "word"})
    long = agent.run({"answer_text": " ".join(["word"] * 800)})

    assert short["marks"] >= 20
    assert long["marks"] <= 100


def test_parent_agent_message_bands():
    agent = ParentAgent()
    high = agent.run(90)
    mid = agent.run(60)
    low = agent.run(35)

    assert high["performance_level"] == "excellent"
    assert mid["performance_level"] == "moderate"
    assert low["performance_level"] == "needs_support"
    assert "recommendation" in high
    assert "message" in mid


def test_trainer_agent_contains_proven_techniques():
    agent = PersonalTrainerAgent()
    plan = agent.run("Alex", 72)
    assert len(plan["techniques"]) == 5
    assert "Active Recall" in plan["techniques"]
    assert plan["daily_time_minutes"] >= 90
    assert len(plan["focus_areas"]) >= 1


def test_memory_agent_computes_average_and_improvement():
    agent = MemoryAgent()
    insights = agent.run([40, 60, 70])
    assert insights["average"] == 56.67
    assert insights["improvement"] == 30
    assert len(insights["insights"]) >= 1
    assert insights["trend"] == "improving"


def test_memory_insights_endpoint_data():
    agent = MemoryAgent()
    payload = agent.run([50, 60, 70])
    assert "average" in payload
    assert "improvement" in payload
    assert "insights" in payload
    assert "trend" in payload
