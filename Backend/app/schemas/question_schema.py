from pydantic import BaseModel
from typing import Optional, List


class QuestionResponse(BaseModel):
    id: int
    session_id: int
    question_text: str
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    question_type: Optional[str] = "text"
    options: Optional[List[str]] = None

    class Config:
        from_attributes = True