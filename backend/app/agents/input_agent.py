from app.utils.ocr import extract_text


class InputAgent:
    name = "InputAgent"

    def run(self, question_path: str, answer_path: str, rubric_path: str) -> dict:
        question_text = extract_text(question_path)
        answer_text = extract_text(answer_path)
        rubric_text = extract_text(rubric_path)

        return {
            "question_text": question_text,
            "answer_text": answer_text,
            "rubric_text": rubric_text,
        }
