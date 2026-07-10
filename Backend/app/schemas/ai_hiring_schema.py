from pydantic import BaseModel
from typing import List


class SkillGapItem(BaseModel):
    skill: str
    level: str
    reason: str


class AIHiringAnalysisResponse(BaseModel):
    overall_recommendation: str
    hiring_confidence: int
    technical_fit: str
    communication_fit: str
    integrity_risk: str
    leetcode_readiness: str
    strengths: List[str]
    weaknesses: List[str]
    recruiter_notes: str
    improvement_roadmap: List[str]
    skill_gap_analysis: List[SkillGapItem]