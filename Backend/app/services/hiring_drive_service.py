import uuid

from sqlalchemy.orm import Session

from app.models.hiring_drive_model import HiringDrive
from app.schemas.hiring_drive_schema import HiringDriveCreate
from app.models.interview_model import InterviewSession
from app.services.report_service import generate_report


def create_hiring_drive(db: Session, company_user_id: int, data: HiringDriveCreate):
    drive = HiringDrive(
        company_user_id=company_user_id,
        title=data.title,
        role=data.role,
        difficulty=data.difficulty,
        interview_questions=data.interview_questions,
        coding_questions=data.coding_questions,
        duration_minutes=data.duration_minutes,
        proctoring_enabled=data.proctoring_enabled,
        invite_code=str(uuid.uuid4())[:8],
    )

    db.add(drive)
    db.commit()
    db.refresh(drive)

    return drive


def get_company_drives(db: Session, company_user_id: int):
    drives = db.query(HiringDrive).filter(
        HiringDrive.company_user_id == company_user_id
    ).order_by(
        HiringDrive.created_at.desc()
    ).all()

    result = []

    for drive in drives:
        sessions = db.query(InterviewSession).filter(
            InterviewSession.drive_id == drive.id
        ).all()

        candidates_count = len(sessions)
        shortlisted_count = 0
        review_count = 0
        rejected_count = 0

        for session in sessions:
            try:
                report = generate_report(db=db, session_id=session.id)
                final_score = report.get("final_score", 0)
                final_status = report.get("final_status", "")

                if final_score >= 75 and "clean" in final_status.lower():
                    shortlisted_count += 1
                elif final_score >= 50:
                    review_count += 1
                else:
                    rejected_count += 1

            except Exception:
                review_count += 1

        result.append({
            "id": drive.id,
            "company_user_id": drive.company_user_id,
            "title": drive.title,
            "role": drive.role,
            "difficulty": drive.difficulty,
            "interview_questions": drive.interview_questions,
            "coding_questions": drive.coding_questions,
            "duration_minutes": drive.duration_minutes,
            "proctoring_enabled": drive.proctoring_enabled,
            "status": drive.status,
            "invite_code": drive.invite_code,
            "created_at": drive.created_at,
            "candidates_count": candidates_count,
            "shortlisted_count": shortlisted_count,
            "review_count": review_count,
            "rejected_count": rejected_count,
        })

    return result


def get_drive_by_invite_code(db: Session, invite_code: str):
    return (
        db.query(HiringDrive)
        .filter(HiringDrive.invite_code == invite_code)
        .first()
    )