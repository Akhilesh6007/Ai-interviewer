from pydantic import BaseModel
from typing import List


class LeetCodeContestRequest(BaseModel):
    username: str


class ContestQuestion(BaseModel):
    question_number: int
    title: str
    difficulty: str
    topic: str
    description: str


class LeetCodeContestResponse(BaseModel):
    username: str
    contest_title: str
    user_level: str
    recommendation: str
    easy_count: int
    medium_count: int
    hard_count: int
    questions: List[ContestQuestion]