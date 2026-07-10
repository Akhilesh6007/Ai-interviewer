import json
import os
import google.generativeai as genai

from sqlalchemy.orm import Session

from app.models.question_model import Question
from app.models.answer_model import Answer
from app.models.proctor_event_model import ProctorEvent
from app.models.code_submission_model import CodeSubmission
from app.services.report_service import generate_report


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def _fallback_hiring_analysis(report_data, answers, proctor_events, coding_submissions):
    average_score = report_data.get("average_score", 0)
    final_score = report_data.get("final_score", 0)
    high_events = report_data.get("high_severity_events", 0)
    total_answers = report_data.get("total_answers", 0)

    if final_score >= 80 and high_events == 0:
        recommendation = "Proceed to Next Round"
        confidence = 85
        integrity_risk = "Low"
    elif final_score >= 60 and high_events <= 2:
        recommendation = "Needs Recruiter Review"
        confidence = 65
        integrity_risk = "Medium"
    else:
        recommendation = "Not Recommended Currently"
        confidence = 40
        integrity_risk = "High"

    if total_answers == 0:
        technical_fit = "Insufficient interview answer data available."
        communication_fit = (
            "Cannot evaluate communication properly because no answers were submitted."
        )
    elif average_score >= 8:
        technical_fit = "Strong technical fit for the selected role."
        communication_fit = "Good answer quality with structured explanations."
    elif average_score >= 5:
        technical_fit = (
            "Moderate technical fit. Candidate needs more depth in core concepts."
        )
        communication_fit = "Average communication. Answers need more clarity and examples."
    else:
        technical_fit = "Weak technical fit based on current interview performance."
        communication_fit = "Answers need better structure, clarity, and confidence."

    if len(coding_submissions) > 0:
        avg_code_score = sum(s.score or 0 for s in coding_submissions) / len(
            coding_submissions
        )

        if avg_code_score >= 80:
            leetcode_readiness = (
                "Good coding readiness. Candidate shows strong problem-solving ability."
            )
        elif avg_code_score >= 60:
            leetcode_readiness = (
                "Moderate coding readiness. More medium-level practice is recommended."
            )
        else:
            leetcode_readiness = (
                "Coding readiness is low. Candidate should practice DSA fundamentals."
            )
    else:
        leetcode_readiness = "No coding submissions available for this session/user."

    return {
        "overall_recommendation": recommendation,
        "hiring_confidence": confidence,
        "technical_fit": technical_fit,
        "communication_fit": communication_fit,
        "integrity_risk": integrity_risk,
        "leetcode_readiness": leetcode_readiness,
        "strengths": [
            "Completed the AI proctored interview flow.",
            "Interview performance was evaluated using AI scoring.",
            "Candidate activity was monitored using proctoring signals.",
        ],
        "weaknesses": [
            "Needs deeper explanation in technical answers.",
            "Should improve consistency in coding and interview preparation.",
            "Should avoid suspicious proctoring events during assessment.",
        ],
        "recruiter_notes": (
            "This recommendation is generated using AI answer evaluation, "
            "proctoring activity, final score, and coding submission signals."
        ),
        "improvement_roadmap": [
            "Day 1-2: Revise core role-based technical concepts.",
            "Day 3-4: Practice medium-level DSA problems.",
            "Day 5: Give one mock interview with structured answers.",
            "Day 6: Review weak topics and improve explanations.",
            "Day 7: Attempt a timed coding contest and final mock interview.",
        ],
        "skill_gap_analysis": [
            {
                "skill": "Technical Knowledge",
                "level": "Moderate" if average_score >= 5 else "Needs Improvement",
                "reason": "Based on AI interview answer score.",
            },
            {
                "skill": "Communication",
                "level": "Moderate" if total_answers > 0 else "Insufficient Data",
                "reason": "Based on clarity and availability of submitted answers.",
            },
            {
                "skill": "Interview Integrity",
                "level": "High Risk" if high_events >= 3 else "Low Risk",
                "reason": "Based on high severity proctoring events.",
            },
            {
                "skill": "Coding Readiness",
                "level": "Available"
                if len(coding_submissions) > 0
                else "Insufficient Data",
                "reason": "Based on recent coding submissions and scores.",
            },
        ],
    }


def generate_ai_hiring_analysis(db: Session, session_id: int, user_id: int):
    report_data = generate_report(db=db, session_id=session_id)

    answers = db.query(Answer).filter(
        Answer.session_id == session_id
    ).all()

    proctor_events = db.query(ProctorEvent).filter(
        ProctorEvent.session_id == session_id
    ).all()

    coding_submissions = db.query(CodeSubmission).filter(
        CodeSubmission.user_id == user_id
    ).order_by(CodeSubmission.submitted_at.desc()).limit(5).all()

    answer_summary = []

    for answer in answers:
        question = db.query(Question).filter(
            Question.id == answer.question_id
        ).first()

        answer_summary.append(
            {
                "question": question.question_text if question else "Unknown question",
                "answer": answer.answer_text,
                "score": answer.ai_score,
                "feedback": answer.ai_feedback,
            }
        )

    proctor_summary = [
        {
            "event_type": event.event_type,
            "severity": event.severity,
            "message": event.message,
        }
        for event in proctor_events
    ]

    coding_summary = [
        {
            "question_title": item.question_title,
            "difficulty": item.difficulty,
            "topic": item.topic,
            "language": item.language,
            "status": item.status,
            "score": item.score,
        }
        for item in coding_submissions
    ]

    if not GEMINI_API_KEY:
        return _fallback_hiring_analysis(
            report_data,
            answers,
            proctor_events,
            coding_submissions,
        )

    try:
        required_json_format = """
{
  "overall_recommendation": "Proceed to Next Round / Needs Recruiter Review / Not Recommended Currently",
  "hiring_confidence": 0,
  "technical_fit": "short paragraph",
  "communication_fit": "short paragraph",
  "integrity_risk": "Low / Medium / High with short explanation",
  "leetcode_readiness": "short paragraph",
  "strengths": ["point 1", "point 2", "point 3"],
  "weaknesses": ["point 1", "point 2", "point 3"],
  "recruiter_notes": "short recruiter-facing note",
  "improvement_roadmap": ["Day 1...", "Day 2...", "Day 3..."],
  "skill_gap_analysis": [
    {
      "skill": "skill name",
      "level": "Strong / Moderate / Needs Improvement / High Risk",
      "reason": "short reason"
    }
  ]
}
"""

        prompt = f"""
You are an AI Recruiter Copilot.

Analyze this candidate's interview, proctoring, and coding performance.
Return ONLY valid JSON. Do not include markdown.

Required JSON format:
{required_json_format}

Interview Report:
{json.dumps(report_data, indent=2, default=str)}

Answers:
{json.dumps(answer_summary, indent=2, default=str)}

Proctor Events:
{json.dumps(proctor_summary, indent=2, default=str)}

Recent Coding Submissions:
{json.dumps(coding_summary, indent=2, default=str)}
"""

        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)

        text = response.text.strip()

        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()
        elif text.startswith("```"):
            text = text.replace("```", "").strip()

        data = json.loads(text)

        return {
            "overall_recommendation": data.get(
                "overall_recommendation",
                "Needs Recruiter Review",
            ),
            "hiring_confidence": int(data.get("hiring_confidence", 60)),
            "technical_fit": data.get(
                "technical_fit",
                "Technical fit needs recruiter review.",
            ),
            "communication_fit": data.get(
                "communication_fit",
                "Communication fit needs recruiter review.",
            ),
            "integrity_risk": data.get("integrity_risk", "Medium"),
            "leetcode_readiness": data.get(
                "leetcode_readiness",
                "Coding readiness needs review.",
            ),
            "strengths": data.get("strengths", []),
            "weaknesses": data.get("weaknesses", []),
            "recruiter_notes": data.get(
                "recruiter_notes",
                "Recruiter should review the candidate manually.",
            ),
            "improvement_roadmap": data.get("improvement_roadmap", []),
            "skill_gap_analysis": data.get("skill_gap_analysis", []),
        }

    except Exception as e:
        print("AI Hiring Analysis Error:", str(e))

        return _fallback_hiring_analysis(
            report_data,
            answers,
            proctor_events,
            coding_submissions,
        )