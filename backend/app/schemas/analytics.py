from pydantic import BaseModel


class TeacherAnalyticsResponse(BaseModel):
    average_marks: float
    highest_mark: float
    pass_percentage: float
    bar_chart: dict
    pie_chart: dict


class StudentAnalyticsResponse(BaseModel):
    average: float
    improvement: float
    line_chart: dict
    pie_chart: dict
    suggestions: list[str]
