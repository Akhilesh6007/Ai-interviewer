from sqlalchemy.orm import Session

from app.models.interview_model import InterviewSession
from app.schemas.interview_schema import InterviewCreate
from datetime import datetime
from app.models.interview_model import InterviewSession
from app.models.hiring_drive_model import HiringDrive

def create_interview(db: Session, user_id: int, interview: InterviewCreate):

    session = InterviewSession(
        user_id=user_id,
        role=interview.role,
        difficulty=interview.difficulty,
        number_of_questions=interview.number_of_questions
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session

def get_interview_by_id(db: Session, session_id: int, user_id: int):

    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == user_id
    ).first()

    return session



def end_interview_by_id(db: Session, session_id: int, user_id: int):

    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == user_id
    ).first()

    if not session:
        return None

    session.status = "completed"
    session.ended_at = datetime.utcnow()

    db.commit()
    db.refresh(session)

    return session

def get_interview_for_user(db: Session, session_id: int, user_id: int):

    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == user_id
    ).first()

    return session

def get_user_interviews(db: Session, user_id: int):

    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user_id
    ).order_by(InterviewSession.started_at.desc()).all()

    return sessions   





def create_interview_session(db: Session, user_id: int, data):
    drive_id = None

    if getattr(data, "drive_code", None):
        drive = db.query(HiringDrive).filter(
            HiringDrive.invite_code == data.drive_code
        ).first()

        if drive:
            drive_id = drive.id

    questions_count = getattr(data, "number_of_questions", None)

    if questions_count is None:
        questions_count = getattr(data, "total_questions", 5)

    session = InterviewSession(
        user_id=user_id,
        role=data.role,
        difficulty=data.difficulty,
        total_questions=questions_count,
        drive_id=drive_id,
        status="active",
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session