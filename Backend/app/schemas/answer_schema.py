from pydantic import BaseModel
from typing import Optional


class AnswerCreate(BaseModel):
    question_id: int
    answer_text: str


class AnswerResponse(BaseModel):
    id: int
    question_id: int
    session_id: int
    answer_text: str
    ai_score: Optional[int] = None
    ai_feedback: Optional[str] = None

    class Config:
        from_attributes = True