from pydantic import BaseModel


class ReportResponse(BaseModel):
    session_id: int
    total_questions: int
    total_answers: int
    average_score: float
    total_proctor_events: int
    high_severity_events: int
    medium_severity_events: int
    proctor_penalty: float
    final_score: float
    selection_percentage: float
    selection_status: str
    final_status: str