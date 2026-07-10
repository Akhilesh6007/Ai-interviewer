from sqlalchemy.orm import Session

from app.models.code_submission_model import CodeSubmission


def calculate_dummy_score(code: str, difficulty: str):

    if len(code.strip()) < 30:
        return 20

    base_score = 70

    if "for" in code or "while" in code:
        base_score += 10

    if "return" in code:
        base_score += 10

    if difficulty == "hard":
        base_score -= 10
    elif difficulty == "easy":
        base_score += 5

    return max(0, min(base_score, 100))


def create_code_submission(
    db: Session,
    user_id: int,
    question_title: str,
    difficulty: str,
    topic: str,
    language: str,
    code: str
):

    score = calculate_dummy_score(code, difficulty)

    status = "Accepted" if score >= 70 else "Needs Improvement"

    submission = CodeSubmission(
        user_id=user_id,
        question_title=question_title,
        difficulty=difficulty,
        topic=topic,
        language=language,
        code=code,
        status=status,
        score=score,
        runtime="42 ms"
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return submission


def get_user_submissions(db: Session, user_id: int):

    return db.query(CodeSubmission).filter(
        CodeSubmission.user_id == user_id
    ).order_by(CodeSubmission.score.desc()).all()