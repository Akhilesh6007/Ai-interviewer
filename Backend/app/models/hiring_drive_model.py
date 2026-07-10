from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.config.database import Base


class HiringDrive(Base):
    __tablename__ = "hiring_drives"

    id = Column(Integer, primary_key=True, index=True)

    company_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, nullable=False)
    role = Column(String, nullable=False)
    difficulty = Column(String, default="medium")

    interview_questions = Column(Integer, default=5)
    coding_questions = Column(Integer, default=2)
    duration_minutes = Column(Integer, default=60)

    proctoring_enabled = Column(Boolean, default=True)

    status = Column(String, default="active")
    invite_code = Column(String, unique=True, index=True, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)