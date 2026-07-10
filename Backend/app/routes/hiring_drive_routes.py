from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.clerk_auth_service import verify_clerk_token
from app.services.clerk_user_service import get_or_create_clerk_user
from app.schemas.hiring_drive_schema import HiringDriveCreate, HiringDriveResponse
from app.services.hiring_drive_service import create_hiring_drive, get_company_drives
from app.services.hiring_drive_service import (
    create_hiring_drive,
    get_company_drives,
    get_drive_by_invite_code
)
from app.models.hiring_drive_model import HiringDrive
from app.models.interview_model import InterviewSession
from app.models.user_model import User
from app.services.report_service import generate_report


router = APIRouter(prefix="/company/drives", tags=["Company Hiring Drives"])


@router.post("", response_model=HiringDriveResponse)
def create_drive(
    data: HiringDriveCreate,
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    user = get_or_create_clerk_user(db, clerk_user)

    if user.role != "company":
        raise HTTPException(
            status_code=403,
            detail="Only company users can create hiring drives"
        )

    return create_hiring_drive(
        db=db,
        company_user_id=user.id,
        data=data
    )


@router.get("", response_model=list[HiringDriveResponse])
def my_company_drives(
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    user = get_or_create_clerk_user(db, clerk_user)

    if user.role != "company":
        raise HTTPException(
            status_code=403,
            detail="Only company users can view hiring drives"
        )

    return get_company_drives(
        db=db,
        company_user_id=user.id
    )

@router.get("/public/{invite_code}", response_model=HiringDriveResponse)
def public_drive_details(
    invite_code: str,
    db: Session = Depends(get_db)
):
    drive = get_drive_by_invite_code(db=db, invite_code=invite_code)

    if not drive:
        raise HTTPException(status_code=404, detail="Hiring drive not found")

    if drive.status != "active":
        raise HTTPException(status_code=400, detail="Hiring drive is not active")

    return drive


@router.get("/{drive_id}/candidates")
def drive_candidates(
    drive_id: int,
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    user = get_or_create_clerk_user(db, clerk_user)

    drive = db.query(HiringDrive).filter(
        HiringDrive.id == drive_id,
        HiringDrive.company_user_id == user.id
    ).first()

    if not drive:
        raise HTTPException(status_code=404, detail="Hiring drive not found")

    sessions = db.query(InterviewSession).filter(
        InterviewSession.drive_id == drive_id
    ).all()

    result = []

    for session in sessions:
        candidate = db.query(User).filter(User.id == session.user_id).first()

        report = None

        try:
            report = generate_report(db=db, session_id=session.id)
        except Exception:
            report = None

        result.append({
            "session_id": session.id,
            "candidate_id": candidate.id if candidate else None,
            "candidate_name": candidate.name if candidate else "Unknown",
            "candidate_email": candidate.email if candidate else "Unknown",
            "status": session.status,
            "final_score": report.get("final_score", 0) if report else 0,
            "selection_status": report.get("selection_status", "Pending") if report else "Pending",
            "integrity_status": report.get("final_status", "Pending") if report else "Pending",
        })

    return result