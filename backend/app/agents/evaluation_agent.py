import json
import logging

from openai import OpenAI

from app.core.config import settings


logger = logging.getLogger(__name__)


class EvaluationAgent:
    name = "EvaluationAgent"

    def __init__(self) -> None:
        if settings.openai_api_key:
            self.llm = OpenAI(api_key=settings.openai_api_key)
        else:
            self.llm = None

    @staticmethod
    def _fallback_score(answer: str, rubric: str) -> dict:
        answer_tokens = len(answer.split())
        rubric_tokens = len(rubric.split())

        base = 25.0 + min(55.0, answer_tokens / 4.0)
        rubric_bonus = min(20.0, rubric_tokens / 20.0)
        marks = round(min(100.0, max(0.0, base + rubric_bonus)), 2)

        feedback = (
            "Evaluation generated using fallback logic. Improve alignment with rubric keywords, "
            "add clearer structure, and provide concise supporting points."
        )
        return {"marks": marks, "feedback": feedback}

    def run(self, data: dict) -> dict:
        rubric = data.get("rubric_text", "")
        answer = data.get("answer_text", "")
        question = data.get("question_text", "")

        llm = getattr(self, "llm", None)
        if not llm or not settings.openai_api_key:
            return self._fallback_score(answer, rubric)

        prompt = (
            "Evaluate the student answer against the rubric. "
            "Return ONLY valid JSON with keys: marks (float 0-100) and feedback (string). "
            f"Question:\n{question}\n\nRubric:\n{rubric}\n\nAnswer:\n{answer}"
        )

        try:
            response = llm.chat.completions.create(
                model=settings.openai_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content or ""
        except Exception:  # noqa: BLE001
            logger.exception("OpenAI evaluation failed, using fallback scoring")
            return self._fallback_score(answer, rubric)

        try:
            parsed = json.loads(content)
            marks = float(parsed.get("marks", 70.0))
            feedback = str(parsed.get("feedback", content))
        except (json.JSONDecodeError, ValueError, TypeError):
            marks = 70.0
            feedback = content[:1200]

        safe_marks = round(min(100.0, max(0.0, marks)), 2)
        return {"marks": safe_marks, "feedback": feedback}
