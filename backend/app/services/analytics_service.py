from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.analytics import Analytics
from app.models.result import Result


def _safe_round(value: float) -> float:
    return round(float(value), 2)


def _empty_chart(labels: list[str] | None = None) -> dict:
    return {"labels": labels or [], "datasets": [{"data": []}]}


def _marks_distribution(marks: list[float]) -> tuple[list[str], list[int]]:
    buckets = ["0-20", "21-40", "41-60", "61-80", "81-100"]
    counts = [0, 0, 0, 0, 0]

    for mark in marks:
        value = max(0.0, min(100.0, float(mark)))
        if value <= 20:
            counts[0] += 1
        elif value <= 40:
            counts[1] += 1
        elif value <= 60:
            counts[2] += 1
        elif value <= 80:
            counts[3] += 1
        else:
            counts[4] += 1

    return buckets, counts


def get_teacher_analytics(db: Session, exam_id: int) -> dict:
    marks = [float(row[0]) for row in db.query(Result.marks).filter(Result.exam_id == exam_id).all()]
    if not marks:
        return {
            "average_marks": 0.0,
            "highest_mark": 0.0,
            "pass_percentage": 0.0,
            "bar_chart": _empty_chart(),
            "pie_chart": {"labels": ["Pass", "Fail"], "datasets": [{"data": [0, 0]}]},
        }

    avg = sum(marks) / len(marks)
    high = max(marks)
    passed = len([m for m in marks if m >= settings.passing_mark])
    pass_percentage = (passed / len(marks)) * 100
    labels, distribution = _marks_distribution(marks)

    return {
        "average_marks": _safe_round(avg),
        "highest_mark": _safe_round(high),
        "pass_percentage": _safe_round(pass_percentage),
        "bar_chart": {
            "labels": labels,
            "datasets": [{"label": "Students", "data": distribution}],
        },
        "pie_chart": {
            "labels": ["Pass", "Fail"],
            "datasets": [{"data": [passed, len(marks) - passed]}],
        },
    }


def get_student_analytics(db: Session, student_id: int) -> dict:
    marks = [float(row[0]) for row in db.query(Result.marks).filter(Result.student_id == student_id).order_by(Result.id.asc()).all()]

    analytics = db.query(Analytics).filter(Analytics.student_id == student_id).first()
    if marks:
        computed_average = sum(marks) / len(marks)
        computed_improvement = marks[-1] - marks[0]
    else:
        computed_average = 0.0
        computed_improvement = 0.0

    average = float(analytics.average) if analytics else computed_average
    improvement = float(analytics.improvement) if analytics else computed_improvement

    if analytics:
        analytics.average = computed_average
        analytics.improvement = computed_improvement
    else:
        analytics = Analytics(student_id=student_id, average=computed_average, improvement=computed_improvement)
        db.add(analytics)
    db.commit()

    weak = len([m for m in marks if m < settings.passing_mark])
    strong = len(marks) - weak

    suggestions: list[str] = []
    if not marks:
        suggestions.append("Complete your first evaluation to unlock personalized recommendations.")
    elif improvement > 5:
        suggestions.append("You are improving well. Increase mock test frequency to accelerate progress.")
    elif improvement >= 0:
        suggestions.append("Your progress is stable. Focus on weak-topic revision and timed drills.")
    else:
        suggestions.append("Recent dip detected. Revisit fundamentals and schedule shorter daily review cycles.")

    suggestions.append("Use active recall and spaced repetition for long-term retention.")

    return {
        "average": _safe_round(average),
        "improvement": _safe_round(improvement),
        "line_chart": {
            "labels": [f"Test {i + 1}" for i in range(len(marks))],
            "datasets": [{"label": "Progress", "data": marks}],
        },
        "pie_chart": {
            "labels": ["Above Pass Mark", "Below Pass Mark"],
            "datasets": [{"data": [strong, weak]}],
        },
        "suggestions": suggestions,
    }
