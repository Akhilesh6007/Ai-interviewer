from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from datetime import datetime
from app.config.database import Base


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)

    answer_text = Column(Text, nullable=False)
    ai_score = Column(Integer, nullable=True)
    ai_feedback = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    
    # score = Column(nullable=true)