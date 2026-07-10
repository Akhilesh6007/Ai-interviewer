from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProctorEventCreate(BaseModel):
    event_type: str
    severity: str = "medium"
    message: Optional[str] = None


class ProctorEventResponse(BaseModel):
    id: int
    session_id: int
    event_type: str
    severity: str
    message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True