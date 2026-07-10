from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from app.config.database import Base


class ProctorEvent(Base):
    __tablename__ = "proctor_events"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)

    event_type = Column(String, nullable=False)
    severity = Column(String, default="medium")
    message = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)