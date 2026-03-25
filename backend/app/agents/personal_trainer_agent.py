class PersonalTrainerAgent:
    name = "PersonalTrainerAgent"

    def run(self, student_name: str, average: float) -> dict:
        techniques = [
            "Active Recall",
            "Spaced Repetition",
            "Pomodoro Technique",
            "Feynman Technique",
            "Blurting Method",
        ]

        intensity = "moderate" if average >= 50 else "high"
        daily_time_minutes = 90 if average >= 70 else 120 if average >= 50 else 150

        if average >= 75:
            focus_areas = ["advanced problem solving", "exam speed", "accuracy under time pressure"]
        elif average >= 50:
            focus_areas = ["concept reinforcement", "mistake analysis", "time management"]
        else:
            focus_areas = ["core fundamentals", "step-by-step practice", "confidence building"]

        weekly_plan = [
            f"Day 1: Active Recall sessions ({intensity} intensity)",
            "Day 2: Spaced Repetition flashcards",
            "Day 3: Pomodoro blocks (4 x 25 min)",
            "Day 4: Feynman explanation to peer/self",
            "Day 5: Blurting practice and error review",
            "Day 6: Mixed mock test + corrections",
            f"Day 7: Reflect and set targets for next week, {student_name}",
        ]

        return {
            "techniques": techniques,
            "weekly_plan": weekly_plan,
            "daily_time_minutes": daily_time_minutes,
            "focus_areas": focus_areas,
        }
