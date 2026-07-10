from pydantic import BaseModel
from typing import Optional


class LeetCodeConnectRequest(BaseModel):
    username: str


class LeetCodeProfileResponse(BaseModel):
    username: str
    real_name: Optional[str] = None
    ranking: Optional[int] = None
    reputation: Optional[int] = None

    total_solved: int = 0
    easy_solved: int = 0
    medium_solved: int = 0
    hard_solved: int = 0

    contest_rating: Optional[float] = None
    global_ranking: Optional[int] = None
    attended_contests: Optional[int] = None