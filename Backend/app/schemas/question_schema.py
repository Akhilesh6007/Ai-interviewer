from pydantic import BaseModel


class QuestionCreate(BaseModel):
    session_id: int
    question_number: int


class QuestionResponse(BaseModel):
    id: int
    session_id: int
    question_text: str
    question_number: int

    class Config:
        from_attributes = True