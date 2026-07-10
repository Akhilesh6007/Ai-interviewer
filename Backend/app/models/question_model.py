from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from app.config.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    question_text = Column(String, nullable=False)
    question_number = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)