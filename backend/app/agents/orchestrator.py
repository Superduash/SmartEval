import logging

from sqlalchemy.orm import Session

from app.agents.evaluation_agent import EvaluationAgent
from app.agents.input_agent import InputAgent
from app.agents.memory_agent import MemoryAgent
from app.agents.parent_agent import ParentAgent
from app.agents.personal_trainer_agent import PersonalTrainerAgent
from app.models.analytics import Analytics
from app.models.result import Result
from app.models.user import User
from app.services.agent_log_service import log_agent_action
from app.services.notification_service import create_notification


logger = logging.getLogger(__name__)


class AgentOrchestrator:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.input_agent = InputAgent()
        self.evaluation_agent = EvaluationAgent()
        self.parent_agent = ParentAgent()
        self.trainer_agent = PersonalTrainerAgent()
        self.memory_agent = MemoryAgent()

    def evaluate_submission(self, student_id: int, exam_id: int, question_path: str, answer_path: str, rubric_path: str) -> Result:
        logger.info("Starting evaluation for student=%s exam=%s", student_id, exam_id)
        parsed = self.input_agent.run(question_path, answer_path, rubric_path)
        log_agent_action(self.db, self.input_agent.name, f"OCR completed for student {student_id}")

        evaluated = self.evaluation_agent.run(parsed)
        log_agent_action(self.db, self.evaluation_agent.name, f"Evaluation completed for exam {exam_id}")

        result = Result(
            student_id=student_id,
            exam_id=exam_id,
            marks=evaluated["marks"],
            feedback=evaluated["feedback"],
        )
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)

        create_notification(
            self.db,
            user_id=student_id,
            exam_id=exam_id,
            title="Result Published",
            message=f"Your exam {exam_id} has been evaluated. Marks: {result.marks}.",
            kind="result",
        )
        log_agent_action(self.db, "NotificationService", f"Created result notification for student {student_id}")

        self._refresh_analytics(student_id)
        logger.info("Evaluation completed and persisted for student=%s exam=%s", student_id, exam_id)
        return result

    def parent_message(self, marks: float) -> dict:
        message = self.parent_agent.run(marks)
        log_agent_action(self.db, self.parent_agent.name, "Generated parent guidance message")
        return message

    def trainer_plan(self, user: User, average: float) -> dict:
        plan = self.trainer_agent.run(user.name, average)
        log_agent_action(self.db, self.trainer_agent.name, f"Generated personal trainer plan for user {user.id}")
        return plan

    def memory_insights(self, student_id: int) -> dict:
        history = (
            self.db.query(Result.marks)
            .filter(Result.student_id == student_id)
            .order_by(Result.id.asc())
            .all()
        )
        marks_history = [mark for (mark,) in history]
        insights = self.memory_agent.run(marks_history)
        log_agent_action(self.db, self.memory_agent.name, f"Generated memory insights for user {student_id}")
        return insights

    def _refresh_analytics(self, student_id: int) -> None:
        history = (
            self.db.query(Result.marks)
            .filter(Result.student_id == student_id)
            .order_by(Result.id.asc())
            .all()
        )
        marks_history = [mark for (mark,) in history]
        insights = self.memory_agent.run(marks_history)

        analytics = self.db.query(Analytics).filter(Analytics.student_id == student_id).first()
        if not analytics:
            analytics = Analytics(student_id=student_id, average=insights["average"], improvement=insights["improvement"])
            self.db.add(analytics)
        else:
            analytics.average = insights["average"]
            analytics.improvement = insights["improvement"]
        self.db.commit()
