from pydantic import BaseModel
from datetime import datetime


class HiringDriveCreate(BaseModel):
    title: str
    role: str
    difficulty: str = "medium"
    interview_questions: int = 5
    coding_questions: int = 2
    duration_minutes: int = 60
    proctoring_enabled: bool = True


class HiringDriveResponse(BaseModel):
    id: int
    company_user_id: int
    title: str
    role: str
    difficulty: str
    interview_questions: int
    coding_questions: int
    duration_minutes: int
    proctoring_enabled: bool
    status: str
    invite_code: str | None = None

    candidates_count: int = 0
    shortlisted_count: int = 0
    review_count: int = 0
    rejected_count: int = 0

    created_at: datetime

    class Config:
        from_attributes = True