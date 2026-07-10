from sqlalchemy.orm import Session

from app.models.question_model import Question


def create_question(
    db: Session,
    session_id: int,
    question_text: str,
    question_number: int
):

    question = Question(
        session_id=session_id,
        question_text=question_text,
        question_number=question_number
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return question