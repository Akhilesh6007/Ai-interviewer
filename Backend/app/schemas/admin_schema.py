from pydantic import BaseModel
from typing import Optional


class CandidateRankResponse(BaseModel):
    user_id: int
    candidate_name: str
    candidate_email: str

    latest_session_id: Optional[int] = None
    interview_score: float
    selection_percentage: float
    selection_status: str
    integrity_status: str

    coding_score: float
    final_rank_score: float
    shortlist_status: str


class RecruiterSummaryResponse(BaseModel):
    summary: str
    best_candidate: str
    recommendation: str