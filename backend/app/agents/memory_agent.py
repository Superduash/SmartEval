class MemoryAgent:
    name = "MemoryAgent"

    def run(self, marks_history: list[float]) -> dict:
        if not marks_history:
            return {
                "average": 0,
                "improvement": 0,
                "insights": ["No historical data yet. Upload more exams to generate insights."],
                "trend": "no_data",
            }

        average = sum(marks_history) / len(marks_history)
        first = marks_history[0]
        latest = marks_history[-1]
        improvement = latest - first

        suggestions = []
        if improvement > 5:
            suggestions.append("Positive trend detected. Keep the same study rhythm.")
            trend = "improving"
        elif improvement >= 0:
            suggestions.append("Stable progress. Increase revision frequency for stronger gains.")
            trend = "stable"
        else:
            suggestions.append("Performance dip detected. Revisit weak topics and reduce passive reading.")
            trend = "declining"

        suggestions.append("Use spaced repetition for retention and weekly timed practice tests.")

        return {
            "average": round(average, 2),
            "improvement": round(improvement, 2),
            "insights": suggestions,
            "trend": trend,
        }
