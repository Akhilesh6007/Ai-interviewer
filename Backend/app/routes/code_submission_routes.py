from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.clerk_auth_service import verify_clerk_token
from app.services.clerk_user_service import get_or_create_clerk_user

from app.schemas.code_submission_schema import (
    CodeSubmissionCreate,
    CodeSubmissionResponse
)

from app.services.code_submission_service import (
    create_code_submission,
    get_user_submissions
)


router = APIRouter(
    prefix="/code",
    tags=["Code Submissions"]
)


@router.post("/submit", response_model=CodeSubmissionResponse)
def submit_code(
    data: CodeSubmissionCreate,
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    user = get_or_create_clerk_user(db, clerk_user)

    submission = create_code_submission(
        db=db,
        user_id=user.id,
        question_title=data.question_title,
        difficulty=data.difficulty,
        topic=data.topic,
        language=data.language,
        code=data.code
    )

    return submission


@router.get("/my-submissions", response_model=list[CodeSubmissionResponse])
def my_submissions(
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    user = get_or_create_clerk_user(db, clerk_user)

    submissions = get_user_submissions(
        db=db,
        user_id=user.id
    )

    return submissions