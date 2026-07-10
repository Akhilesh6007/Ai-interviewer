from sqlalchemy.orm import Session

from app.models.user_model import User
from app.models.interview_model import InterviewSession
from app.models.code_submission_model import CodeSubmission
from app.services.report_service import generate_report


def get_candidate_rankings(db: Session):
    users = db.query(User).all()

    rankings = []

    for user in users:
        latest_session = db.query(InterviewSession).filter(
            InterviewSession.user_id == user.id
        ).order_by(
            InterviewSession.started_at.desc()
        ).first()

        interview_score = 0
        selection_percentage = 0
        selection_status = "No Interview"
        integrity_status = "No Data"
        latest_session_id = None

        if latest_session:
            latest_session_id = latest_session.id

            try:
                report = generate_report(
                    db=db,
                    session_id=latest_session.id
                )

                interview_score = report.get("final_score", 0)
                selection_percentage = report.get("selection_percentage", 0)
                selection_status = report.get("selection_status", "No Data")
                integrity_status = report.get("final_status", "No Data")

            except Exception:
                interview_score = 0
                selection_percentage = 0
                selection_status = "Report Error"
                integrity_status = "Review Required"

        submissions = db.query(CodeSubmission).filter(
            CodeSubmission.user_id == user.id
        ).all()

        if submissions:
            coding_score = sum(item.score or 0 for item in submissions) / len(submissions)
        else:
            coding_score = 0

        final_rank_score = (interview_score * 0.7) + (coding_score * 0.3)
        if final_rank_score >= 75 and "clean" in integrity_status.lower():
            shortlist_status = "Shortlisted"
        elif final_rank_score >= 50:
            shortlist_status = "Review"
        else:
            shortlist_status = "Rejected"

        rankings.append({
            "user_id": user.id,
            "candidate_name": user.name,
            "candidate_email": user.email,
            "latest_session_id": latest_session_id,
            "interview_score": round(interview_score, 2),
            "selection_percentage": round(selection_percentage, 2),
            "selection_status": selection_status,
            "integrity_status": integrity_status,
            "coding_score": round(coding_score, 2),
            "final_rank_score": round(final_rank_score, 2),
            "shortlist_status": shortlist_status
        })

    rankings.sort(
        key=lambda item: item["final_rank_score"],
        reverse=True
    )

    return rankings

def generate_recruiter_summary(db: Session):
    rankings = get_candidate_rankings(db)

    if len(rankings) == 0:
        return {
            "summary": "No candidates are available for recruiter analysis.",
            "best_candidate": "No candidate available",
            "recommendation": "Ask candidates to complete interviews and coding assessments."
        }

    best_candidate = rankings[0]

    shortlisted_count = len([
        item for item in rankings
        if item["shortlist_status"] == "Shortlisted"
    ])

    review_count = len([
        item for item in rankings
        if item["shortlist_status"] == "Review"
    ])

    rejected_count = len([
        item for item in rankings
        if item["shortlist_status"] == "Rejected"
    ])

    summary = (
        f"Total {len(rankings)} candidates were analyzed. "
        f"{shortlisted_count} candidates are shortlisted, "
        f"{review_count} candidates need recruiter review, and "
        f"{rejected_count} candidates are currently rejected."
    )

    best_candidate_text = (
        f"{best_candidate['candidate_name']} is currently the strongest candidate "
        f"with a final rank score of {best_candidate['final_rank_score']}, "
        f"interview score of {best_candidate['interview_score']}%, "
        f"coding score of {best_candidate['coding_score']}/100, "
        f"and integrity status: {best_candidate['integrity_status']}."
    )

    if best_candidate["shortlist_status"] == "Shortlisted":
        recommendation = (
            "Recommended action: move the top candidate to the next hiring round."
        )
    elif best_candidate["shortlist_status"] == "Review":
        recommendation = (
            "Recommended action: manually review the top candidate report before shortlisting."
        )
    else:
        recommendation = (
            "Recommended action: ask candidates to improve interview and coding performance before shortlisting."
        )

    return {
        "summary": summary,
        "best_candidate": best_candidate_text,
        "recommendation": recommendation
    }