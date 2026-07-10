from sqlalchemy.orm import Session

from app.models.answer_model import Answer


def create_answer(
    db: Session,
    session_id: int,
    question_id: int,
    answer_text: str,
    ai_score: int,
    ai_feedback: str
):

    answer = Answer(
        session_id=session_id,
        question_id=question_id,
        answer_text=answer_text,
        ai_score=ai_score,
        ai_feedback=ai_feedback
    )

    db.add(answer)
    db.commit()
    db.refresh(answer)

    return answer