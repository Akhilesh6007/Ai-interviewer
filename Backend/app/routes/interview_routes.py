from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db

from app.schemas.interview_schema import InterviewCreate, InterviewResponse
from app.schemas.answer_schema import AnswerCreate, AnswerResponse
from app.schemas.proctor_schema import ProctorEventCreate, ProctorEventResponse
from app.schemas.report_schema import ReportResponse
from app.schemas.ai_hiring_schema import AIHiringAnalysisResponse

from app.services.clerk_auth_service import verify_clerk_token
from app.services.clerk_user_service import get_or_create_clerk_user

from app.services.interview_service import (
    create_interview_session,
    get_user_interviews,
    end_interview_by_id,
)

from app.services.ai_question_service import generate_ai_question
from app.services.answer_service import create_answer
from app.services.answer_evaluation_service import evaluate_answer
from app.services.proctor_service import create_proctor_event, get_proctor_events
from app.services.report_service import generate_report
from app.services.ai_hiring_service import generate_ai_hiring_analysis
from sqlalchemy import String, Integer, Boolean

from app.models.interview_model import InterviewSession
from app.models.question_model import Question




router = APIRouter(
    prefix="/interview",
    tags=["Interview"]
)

def get_fallback_question(role: str, question_number: int):
    questions = [
        f"Tell me about your experience and core skills for the {role} role.",
        f"What are the most important technical skills required for a {role}?",
        f"Explain one project where you used {role}-related skills.",
        f"What challenges have you faced while preparing for the {role} role?",
        f"How would you solve a real-world problem as a {role}?",
        f"What tools or technologies are important for a {role}?",
        f"Explain a difficult concept related to {role} in simple terms.",
        f"How do you keep improving your skills for the {role} position?",
        f"What is your strongest skill for the {role} role and why?",
        f"What is your weakest area for the {role} role and how are you improving it?",
    ]

    return questions[question_number % len(questions)]


def get_session_by_id(db: Session, session_id: int):
    return db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()


@router.post("/start", response_model=InterviewResponse)
def start_interview(
    data: InterviewCreate,
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    user = get_or_create_clerk_user(db, clerk_user)

    return create_interview_session(
        db=db,
        data=data,
        user_id=user.id
    )


@router.get("/my-sessions", response_model=list[InterviewResponse])
def my_sessions(
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    user = get_or_create_clerk_user(db, clerk_user)

    return get_user_interviews(
        db=db,
        user_id=user.id
    )


@router.get("/{session_id}/ai-hiring-analysis", response_model=AIHiringAnalysisResponse)
def get_ai_hiring_analysis(
    session_id: int,
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    user = get_or_create_clerk_user(db, clerk_user)

    session = get_session_by_id(db, session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    return generate_ai_hiring_analysis(
        db=db,
        session_id=session_id,
        user_id=user.id
    )


@router.get("/{session_id}", response_model=InterviewResponse)
def get_interview(
    session_id: int,
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    user = get_or_create_clerk_user(db, clerk_user)

    session = get_interview_for_user(
        db=db,
        session_id=session_id,
        user_id=user.id
    )

    if session is None:
        raise HTTPException(status_code=404, detail="Interview session not found")

    return session


@router.post("/{session_id}/question")
def generate_question_for_interview(
    session_id: int,
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    try:
        ai_question = generate_ai_question(
            role=session.role,
            difficulty=session.difficulty
        )

        if isinstance(ai_question, dict):
            question_text = (
                ai_question.get("question_text")
                or ai_question.get("question")
                or f"Explain one important concept related to {session.role}."
            )
            topic = ai_question.get("topic", session.role)
        else:
            question_text = str(ai_question)
            topic = session.role

        existing_questions = db.query(Question).filter(
            Question.session_id == session_id).all()

        existing_texts = [q.question_text for q in existing_questions]

        if question_text in existing_texts or question_text.strip() == "":
            question_text = get_fallback_question(
                role=session.role,
                question_number=len(existing_questions)
        )    

    except Exception as e:
        print("AI QUESTION GENERATION ERROR:", str(e))
        question_text = f"Tell me about your experience and core skills for the {session.role} role."
        topic = session.role

    try:
        question_data = {}

        column_names = [column.name for column in Question.__table__.columns]

        if "session_id" in column_names:
            question_data["session_id"] = session.id

        if "question_text" in column_names:
            question_data["question_text"] = question_text

        if "question" in column_names:
            question_data["question"] = question_text

        if "difficulty" in column_names:
            question_data["difficulty"] = session.difficulty

        if "topic" in column_names:
            question_data["topic"] = topic

        if "question_type" in column_names:
            question_data["question_type"] = "technical"

        if "type" in column_names:
            question_data["type"] = "technical"

        if "category" in column_names:
            question_data["category"] = topic

        # Fill any remaining NOT NULL columns safely
        for column in Question.__table__.columns:
            if column.primary_key:
                continue

            if column.name in question_data:
                continue

            if column.nullable:
                continue

            if column.default is not None or column.server_default is not None:
                continue

            if isinstance(column.type, String):
                question_data[column.name] = "technical"
            elif isinstance(column.type, Integer):
                question_data[column.name] = 0
            elif isinstance(column.type, Boolean):
                question_data[column.name] = False

        question = Question(**question_data)

        db.add(question)
        db.commit()
        db.refresh(question)

        return {
            "id": question.id,
            "session_id": getattr(question, "session_id", session.id),
            "question_text": getattr(
                question,
                "question_text",
                getattr(question, "question", question_text)
            ),
            "difficulty": getattr(question, "difficulty", session.difficulty),
            "topic": getattr(question, "topic", topic),
        }

    except Exception as e:
        db.rollback()
        print("QUESTION DB SAVE ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Question save failed: {str(e)}"
        )

@router.post("/{session_id}/proctor-event", response_model=ProctorEventResponse)
def save_proctor_event(
    session_id: int,
    event_data: ProctorEventCreate,
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    session = get_session_by_id(db, session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    event = create_proctor_event(
        db=db,
        session_id=session_id,
        event_data=event_data
    )

    return event


@router.get("/{session_id}/proctor-events", response_model=list[ProctorEventResponse])
def list_proctor_events(
    session_id: int,
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    session = get_session_by_id(db, session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    return get_proctor_events(
        db=db,
        session_id=session_id
    )


@router.get("/{session_id}/report")
def get_report(
    session_id: int,
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    user = get_or_create_clerk_user(db, clerk_user)

    session = get_interview_for_user(
        db=db,
        session_id=session_id,
        user_id=user.id
    )

    if session is None:
        raise HTTPException(status_code=404, detail="Interview session not found")

    try:
        return generate_report(
            db=db,
            session_id=session_id
        )
    except Exception as e:
        print("REPORT GENERATION ERROR:", str(e))

        return {
            "session_id": session_id,
            "average_score": 0,
            "proctor_penalty": 0,
            "final_score": 0,
            "selection_percentage": 0,
            "selection_status": "Not Recommended",
            "total_questions": 0,
            "answered_questions": 0,
            "proctor_events_count": 0,
            "summary": "Report fallback generated because full report generation failed."
        }

@router.post("/{session_id}/answer")
def submit_answer(
    session_id: int,
    answer_data: AnswerCreate,
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    user = get_or_create_clerk_user(db, clerk_user)

    session = get_interview_for_user(
        db=db,
        session_id=session_id,
        user_id=user.id
    )

    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    question = db.query(Question).filter(
        Question.id == answer_data.question_id,
        Question.session_id == session_id
    ).first()

    if not question:
        question = db.query(Question).filter(
            Question.session_id == session_id
        ).order_by(Question.id.desc()).first()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    try:
        evaluation = evaluate_answer(
            question_text=question.question_text,
            answer_text=answer_data.answer_text
        )
    except Exception as e:
        print("ANSWER EVALUATION ERROR:", str(e))
        evaluation = {
            "score": 6,
            "feedback": "Answer submitted successfully. AI fallback feedback was used."
        }

    try:
        answer = create_answer(
            db=db,
            session_id=session_id,
            question_id=question.id,
            answer_text=answer_data.answer_text,
            ai_score=int(evaluation.get("score", 6)),
            ai_feedback=evaluation.get("feedback", "Answer evaluated.")
        )

        return {
            "id": answer.id,
            "session_id": answer.session_id,
            "question_id": answer.question_id,
            "answer_text": answer.answer_text,
            "ai_score": answer.ai_score,
            "ai_feedback": answer.ai_feedback,
            "status": "Evaluated"
        }

    except Exception as e:
        db.rollback()
        print("ANSWER SAVE ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Answer save failed: {str(e)}"
        )

@router.post("/{session_id}/end", response_model=InterviewResponse)
def end_interview(
    session_id: int,
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    user = get_or_create_clerk_user(db, clerk_user)

    session = end_interview_by_id(
        db=db,
        session_id=session_id,
        user_id=user.id
    )

    if session is None:
        raise HTTPException(status_code=404, detail="Interview session not found")

    return session       