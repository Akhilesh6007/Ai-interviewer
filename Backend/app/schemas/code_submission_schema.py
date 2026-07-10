from pydantic import BaseModel
from datetime import datetime


class CodeSubmissionCreate(BaseModel):
    question_title: str
    difficulty: str
    topic: str
    language: str
    code: str


class CodeSubmissionResponse(BaseModel):
    id: int
    question_title: str
    difficulty: str
    topic: str
    language: str
    status: str
    score: int
    runtime: str | None
    submitted_at: datetime

    class Config:
        from_attributes = True