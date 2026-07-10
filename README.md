# AI Proctored Interview & Coding Assessment Platform

A full-stack AI-powered interview and recruitment assessment platform designed for students, companies, and recruiters.

## Overview

This platform helps students practice interviews, companies run mass hiring assessments, and recruiters make AI-assisted hiring decisions.

It combines AI interview question generation, answer evaluation, proctoring signals, coding assessment, company hiring drives, recruiter analytics, and candidate ranking dashboards.

## User Roles

### 1. Student
- Practice AI-generated interviews
- Get AI answer evaluation and feedback
- Attempt LeetCode-style coding assessments
- View personal performance reports
- Analyze preparation level

### 2. Company
- Create mass hiring assessment drives
- Configure role, difficulty, interview questions, coding questions, and duration
- Generate shareable invite links for candidates
- Track candidate attempts
- View drive pipeline analytics

### 3. Recruiter
- View AI-ranked candidate dashboard
- Compare interview score, coding score, and integrity signals
- See AI shortlist decisions: Shortlisted, Review, Rejected
- Open detailed candidate reports
- Use recruiter analytics for faster hiring decisions

## Key Features

- Clerk-based authentication
- Role-based dashboards
- AI interview question generation
- AI answer evaluation with score and feedback
- Proctoring event tracking
- Tab switch and suspicious activity monitoring
- Final interview performance report
- AI recruiter hiring analysis
- LeetCode-style coding assessment
- Coding submission tracking
- Candidate leaderboard
- Company hiring drive creation
- Shareable drive invite links
- Drive candidate tracking
- Recruiter candidate ranking dashboard
- Demo data generator for live evaluation

## Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Axios
- Clerk Authentication
- CSS

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Clerk JWT verification
- Gemini AI API

### Tools
- Git
- GitHub
- VS Code

## Project Architecture

```txt
Frontend React App
        |
        | Axios + Clerk JWT
        |
FastAPI Backend
        |
        | SQLAlchemy ORM
        |
SQLite Database
        |
Gemini AI + Clerk Auth + Proctoring Logic