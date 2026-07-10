from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.clerk_auth_service import verify_clerk_token
from app.schemas.admin_schema import (
    CandidateRankResponse,
    RecruiterSummaryResponse
)

from app.services.admin_service import (
    get_candidate_rankings,
    generate_recruiter_summary
)
from app.models.user_model import User
from app.models.interview_model import InterviewSession
from app.models.code_submission_model import CodeSubmission
from app.services.report_service import generate_report


router = APIRouter(
    prefix="/admin",
    tags=["Admin Recruiter"]
)


@router.get("/candidate-rankings", response_model=list[CandidateRankResponse])
def candidate_rankings(
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    return get_candidate_rankings(db)

@router.get("/recruiter-summary", response_model=RecruiterSummaryResponse)
def recruiter_summary(
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    return generate_recruiter_summary(db)

@router.get("/candidate/{user_id}")
def candidate_detail(
    user_id: int,
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        return {
            "error": "Candidate not found"
        }

    latest_session = db.query(InterviewSession).filter(
        InterviewSession.user_id == user.id
    ).order_by(
        InterviewSession.started_at.desc()
    ).first()

    report = None

    if latest_session:
        try:
            report = generate_report(
                db=db,
                session_id=latest_session.id
            )
        except Exception:
            report = None

    submissions = db.query(CodeSubmission).filter(
        CodeSubmission.user_id == user.id
    ).order_by(
        CodeSubmission.submitted_at.desc()
    ).all()

    if submissions:
        coding_score = sum(item.score or 0 for item in submissions) / len(submissions)
    else:
        coding_score = 0

    return {
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "latest_session_id": latest_session.id if latest_session else None,
        "report": report,
        "coding_score": round(coding_score, 2),
        "submissions": [
            {
                "id": item.id,
                "question_title": item.question_title,
                "difficulty": item.difficulty,
                "topic": item.topic,
                "language": item.language,
                "status": item.status,
                "score": item.score,
                "runtime": item.runtime,
                "submitted_at": item.submitted_at
            }
            for item in submissions
        ]
    }