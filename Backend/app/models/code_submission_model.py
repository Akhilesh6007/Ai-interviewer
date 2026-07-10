from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.config.database import Base


class CodeSubmission(Base):
    __tablename__ = "code_submissions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    question_title = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    topic = Column(String, nullable=False)

    language = Column(String, nullable=False)
    code = Column(Text, nullable=False)

    status = Column(String, default="Submitted")
    score = Column(Integer, default=0)
    runtime = Column(String, nullable=True)

    submitted_at = Column(DateTime, default=datetime.utcnow)