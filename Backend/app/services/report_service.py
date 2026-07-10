from sqlalchemy.orm import Session

from app.models.question_model import Question
from app.models.answer_model import Answer
from app.models.proctor_event_model import ProctorEvent


def generate_report(db: Session, session_id: int):

    total_questions = db.query(Question).filter(
        Question.session_id == session_id
    ).count()

    answers = db.query(Answer).filter(
        Answer.session_id == session_id
    ).all()

    total_answers = len(answers)

    if total_answers > 0:
        average_score = sum(answer.ai_score or 0 for answer in answers) / total_answers
    else:
        average_score = 0

    proctor_events = db.query(ProctorEvent).filter(
        ProctorEvent.session_id == session_id
    ).all()

    total_proctor_events = len(proctor_events)

    high_severity_events = len([
        event for event in proctor_events
        if event.severity == "high"
    ])

    medium_severity_events = len([
        event for event in proctor_events
        if event.severity == "medium"
    ])

    # Score analyzer logic
    average_score_percent = average_score * 10

    proctor_penalty = (high_severity_events * 10) + (medium_severity_events * 5)

    final_score = average_score_percent - proctor_penalty

    if final_score < 0:
        final_score = 0

    if final_score > 100:
        final_score = 100

    selection_percentage = final_score

    if selection_percentage >= 80:
        selection_status = "Strong Selection Chance"
    elif selection_percentage >= 60:
        selection_status = "Moderate Selection Chance"
    elif selection_percentage >= 40:
        selection_status = "Low Selection Chance"
    else:
        selection_status = "Not Recommended"

    if high_severity_events >= 3:
        final_status = "High cheating risk"
    elif total_proctor_events >= 3:
        final_status = "Needs review"
    else:
        final_status = "Clean interview"

    return {
        "session_id": session_id,
        "total_questions": total_questions,
        "total_answers": total_answers,
        "average_score": round(average_score, 2),
        "total_proctor_events": total_proctor_events,
        "high_severity_events": high_severity_events,
        "medium_severity_events": medium_severity_events,
        "proctor_penalty": round(proctor_penalty, 2),
        "final_score": round(final_score, 2),
        "selection_percentage": round(selection_percentage, 2),
        "selection_status": selection_status,
        "final_status": final_status
    }