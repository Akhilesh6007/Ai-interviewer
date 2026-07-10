from pydantic import BaseModel
from typing import Optional


class InterviewCreate(BaseModel):
    role: str
    difficulty: str
    number_of_questions: int
    drive_code: Optional[str] = None


class InterviewResponse(BaseModel):
    id: int
    user_id: int
    role: str
    difficulty: str
    total_questions: int
    status: str
    drive_id: Optional[int] = None

    class Config:
        from_attributes = True