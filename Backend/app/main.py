from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.database import Base, engine
from app.models import user_model

# Import router
from app.routes.auth_routes import router as auth_router
from app.models import interview_model
from app.routes.interview_routes import router as interview_router

from app.models import question_model
from app.models import answer_model
from app.models import proctor_event_model
from app.routes.leetcode_routes import router as leetcode_router

from app.models import code_submission_model
from app.routes.code_submission_routes import router as code_submission_router
from app.routes.admin_routes import router as admin_router
from app.routes.user_routes import router as user_router
from app.models import hiring_drive_model
from app.routes.hiring_drive_routes import router as hiring_drive_router
from app.routes.demo_routes import router as demo_router
from app.models import (
    user_model,
    interview_model,
    question_model,
    answer_model,
    proctor_event_model,
    code_submission_model,
)
from dotenv import load_dotenv
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Proctored Interview API")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Include Authentication Routes
app.include_router(auth_router)
app.include_router(interview_router)
app.include_router(leetcode_router)
app.include_router(code_submission_router)
app.include_router(admin_router)
app.include_router(user_router)
app.include_router(hiring_drive_router)
app.include_router(demo_router)
@app.get("/")
def home():
    return {"message": "AI Proctored Interview Backend Running"}