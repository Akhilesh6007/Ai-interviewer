from sqlalchemy.orm import Session
from app.models.proctor_event_model import ProctorEvent


def create_proctor_event(
    db: Session,
    session_id: int,
    event_type: str,
    severity: str,
    message: str | None = None
):

    event = ProctorEvent(
        session_id=session_id,
        event_type=event_type,
        severity=severity,
        message=message
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event

def get_proctor_events(db: Session, session_id: int):

    events = db.query(ProctorEvent).filter(
        ProctorEvent.session_id == session_id
    ).order_by(ProctorEvent.created_at.desc()).all()

    return events