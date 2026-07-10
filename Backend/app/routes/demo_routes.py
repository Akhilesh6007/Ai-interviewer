import os
import uuid
import sqlite3
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db, engine
from app.services.clerk_auth_service import verify_clerk_token
from app.services.clerk_user_service import get_or_create_clerk_user


router = APIRouter(prefix="/demo", tags=["Demo Data"])


def _get_db_path():
    db_path = engine.url.database

    if not db_path:
        raise HTTPException(status_code=500, detail="SQLite database path not found")

    return db_path


def _table_exists(cur, table_name):
    row = cur.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (table_name,),
    ).fetchone()

    return row is not None


def _get_columns(cur, table_name):
    return cur.execute(f"PRAGMA table_info({table_name})").fetchall()


def _insert_dynamic(cur, table_name, values):
    if not _table_exists(cur, table_name):
        return None

    columns = _get_columns(cur, table_name)
    column_names = [column[1] for column in columns]

    data = {
        key: value
        for key, value in values.items()
        if key in column_names
    }

    now = datetime.utcnow().isoformat()

    for column in columns:
        column_name = column[1]
        column_type = str(column[2] or "").upper()
        not_null = column[3]
        default_value = column[4]
        is_primary_key = column[5]

        if is_primary_key:
            continue

        if column_name in data:
            continue

        if not not_null:
            continue

        if default_value is not None:
            continue

        if "INT" in column_type:
            data[column_name] = 0
        elif "BOOL" in column_type:
            data[column_name] = 0
        elif "DATE" in column_type or "TIME" in column_type:
            data[column_name] = now
        else:
            data[column_name] = "demo"

    keys = list(data.keys())
    placeholders = ",".join(["?"] * len(keys))

    query = f"""
    INSERT INTO {table_name} ({",".join(keys)})
    VALUES ({placeholders})
    """

    cur.execute(query, [data[key] for key in keys])

    return cur.lastrowid


def _get_or_create_demo_user(cur, name, email, role="student"):
    row = cur.execute(
        "SELECT id FROM users WHERE email=?",
        (email,),
    ).fetchone()

    if row:
        user_id = row[0]

        if "role" in [col[1] for col in _get_columns(cur, "users")]:
            cur.execute(
                "UPDATE users SET role=? WHERE id=?",
                (role, user_id),
            )

        return user_id

    return _insert_dynamic(
        cur,
        "users",
        {
            "name": name,
            "email": email,
            "password": "demo",
            "clerk_user_id": f"demo_{uuid.uuid4().hex[:12]}",
            "role": role,
            "created_at": datetime.utcnow().isoformat(),
        },
    )


def _ensure_company_drive(cur, company_user_id):
    if not _table_exists(cur, "hiring_drives"):
        raise HTTPException(status_code=500, detail="hiring_drives table not found")

    existing = cur.execute(
        """
        SELECT id, invite_code FROM hiring_drives
        WHERE company_user_id=? AND title=?
        """,
        (company_user_id, "Demo Fresher Hiring Drive 2026"),
    ).fetchone()

    if existing:
        drive_id = existing[0]
        invite_code = existing[1] or str(uuid.uuid4())[:8]

        cur.execute(
            "UPDATE hiring_drives SET invite_code=? WHERE id=?",
            (invite_code, drive_id),
        )

        return drive_id, invite_code

    invite_code = str(uuid.uuid4())[:8]

    drive_id = _insert_dynamic(
        cur,
        "hiring_drives",
        {
            "company_user_id": company_user_id,
            "title": "Demo Fresher Hiring Drive 2026",
            "role": "Full Stack Developer",
            "difficulty": "medium",
            "interview_questions": 5,
            "coding_questions": 2,
            "duration_minutes": 60,
            "proctoring_enabled": 1,
            "status": "active",
            "invite_code": invite_code,
            "created_at": datetime.utcnow().isoformat(),
        },
    )

    return drive_id, invite_code


def _create_demo_session(cur, candidate_id, drive_id, role, difficulty, score, integrity):
    session_id = _insert_dynamic(
        cur,
        "interview_sessions",
        {
            "user_id": candidate_id,
            "drive_id": drive_id,
            "role": role,
            "difficulty": difficulty,
            "total_questions": 5,
            "status": "ended",
            "started_at": datetime.utcnow().isoformat(),
            "ended_at": datetime.utcnow().isoformat(),
        },
    )

    question_texts = [
        f"Explain your strongest project related to {role}.",
        f"What are the most important skills for a {role}?",
        "Explain how you debug a difficult technical issue.",
        "How do you design a scalable web application?",
        "What are your weak areas and how are you improving them?",
    ]

    ai_score = max(1, min(10, round(score / 10)))

    for question_text in question_texts:
        question_id = _insert_dynamic(
            cur,
            "questions",
            {
                "session_id": session_id,
                "question_text": question_text,
                "topic": role,
                "difficulty": difficulty,
                "question_type": "technical",
                "created_at": datetime.utcnow().isoformat(),
            },
        )

        _insert_dynamic(
            cur,
            "answers",
            {
                "session_id": session_id,
                "question_id": question_id,
                "answer_text": (
                    "This is a demo candidate answer covering project experience, "
                    "technical reasoning, debugging approach, and communication skills."
                ),
                "ai_score": ai_score,
                "ai_feedback": (
                    f"Demo feedback: Candidate scored {ai_score}/10. "
                    "Answer quality, clarity, and technical depth were evaluated."
                ),
                "created_at": datetime.utcnow().isoformat(),
            },
        )

    if integrity == "clean":
        events = []
    elif integrity == "medium":
        events = [
            ("tab_switch", "medium", "Candidate switched tab once during assessment."),
            ("window_blur", "medium", "Candidate window lost focus."),
        ]
    else:
        events = [
            ("multiple_faces", "high", "Multiple faces detected during assessment."),
            ("tab_switch", "high", "Repeated tab switching detected."),
            ("copy_paste", "medium", "Copy/paste activity was detected."),
        ]

    for event_type, severity, message in events:
        _insert_dynamic(
            cur,
            "proctor_events",
            {
                "session_id": session_id,
                "event_type": event_type,
                "severity": severity,
                "message": message,
                "created_at": datetime.utcnow().isoformat(),
                "timestamp": datetime.utcnow().isoformat(),
            },
        )

    _insert_dynamic(
        cur,
        "code_submissions",
        {
            "user_id": candidate_id,
            "question_title": "Two Sum",
            "difficulty": "easy",
            "topic": "Array",
            "language": "cpp",
            "code": "// demo solution",
            "status": "Accepted",
            "score": score,
            "runtime": "52 ms",
            "submitted_at": datetime.utcnow().isoformat(),
        },
    )

    _insert_dynamic(
        cur,
        "code_submissions",
        {
            "user_id": candidate_id,
            "question_title": "Longest Substring Without Repeating Characters",
            "difficulty": "medium",
            "topic": "Sliding Window",
            "language": "python",
            "code": "# demo solution",
            "status": "Accepted" if score >= 60 else "Partial",
            "score": max(35, score - 8),
            "runtime": "88 ms",
            "submitted_at": datetime.utcnow().isoformat(),
        },
    )

    return session_id


@router.post("/seed")
def seed_demo_data(
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token),
):
    current_user = get_or_create_clerk_user(db, clerk_user)

    current_user.role = "company"
    db.commit()
    db.refresh(current_user)

    db_path = _get_db_path()

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    try:
        company_user_id = current_user.id

        drive_id, invite_code = _ensure_company_drive(
            cur=cur,
            company_user_id=company_user_id,
        )

        demo_candidates = [
            {
                "name": "Ananya Sharma",
                "email": "ananya.demo@example.com",
                "score": 88,
                "integrity": "clean",
            },
            {
                "name": "Rohit Verma",
                "email": "rohit.demo@example.com",
                "score": 64,
                "integrity": "medium",
            },
            {
                "name": "Sneha Gupta",
                "email": "sneha.demo@example.com",
                "score": 42,
                "integrity": "high",
            },
            {
                "name": "Aman Singh",
                "email": "aman.demo@example.com",
                "score": 76,
                "integrity": "clean",
            },
            {
                "name": "Priya Mehta",
                "email": "priya.demo@example.com",
                "score": 91,
                "integrity": "clean",
            },
        ]

        created_sessions = []

        for candidate in demo_candidates:
            candidate_id = _get_or_create_demo_user(
                cur=cur,
                name=candidate["name"],
                email=candidate["email"],
                role="student",
            )

            session_id = _create_demo_session(
                cur=cur,
                candidate_id=candidate_id,
                drive_id=drive_id,
                role="Full Stack Developer",
                difficulty="medium",
                score=candidate["score"],
                integrity=candidate["integrity"],
            )

            created_sessions.append(session_id)

        conn.commit()

        return {
            "message": "Demo data created successfully",
            "drive_id": drive_id,
            "invite_code": invite_code,
            "candidates_created": len(demo_candidates),
            "sessions_created": len(created_sessions),
        }

    except Exception as e:
        conn.rollback()
        print("DEMO SEED ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Demo seed failed: {str(e)}",
        )

    finally:
        conn.close()