class ParentAgent:
    name = "ParentAgent"

    def run(self, marks: float) -> dict:
        if marks >= 80:
            return {
                "message": "Great work! Your child is performing excellently and is building strong consistency.",
                "performance_level": "excellent",
                "recommendation": "Encourage enrichment tasks and weekly mock tests to sustain momentum.",
            }
        if marks >= 50:
            return {
                "message": "Steady progress is visible, with clear potential for higher performance.",
                "performance_level": "moderate",
                "recommendation": "Maintain a fixed revision schedule and prioritize mistake analysis after each test.",
            }

        return {
            "message": "There is room to improve, but with structure the next assessments can show strong gains.",
            "performance_level": "needs_support",
            "recommendation": "Use daily guided practice and focus on core concepts before moving to advanced problems.",
        }
