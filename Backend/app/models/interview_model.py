from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.config.database import Base

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    drive_id = Column(Integer, ForeignKey("hiring_drives.id"), nullable=True)

    role = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    total_questions = Column(Integer, default=5)

    status = Column(String, default="active")
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)