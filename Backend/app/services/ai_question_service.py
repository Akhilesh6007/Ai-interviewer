import os
import random
import time
import google.generativeai as genai


def fallback_question(role: str, difficulty: str):
    questions = [
        f"What are the most important technical skills required for a {role}?",
        f"Explain one project where you used {role}-related skills.",
        f"How would you debug a production issue as a {role}?",
        f"What tools or frameworks are important for a {role}, and why?",
        f"Describe a challenging problem you solved while preparing for the {role} role.",
        f"Explain a difficult concept related to {role} in simple terms.",
        f"How do you keep improving your skills for the {role} position?",
        f"What is your strongest technical skill for the {role} role?",
        f"What mistakes should a beginner {role} avoid?",
        f"How would you handle tight deadlines in a {role} project?",
    ]

    return {
        "question_text": random.choice(questions),
        "topic": role,
        "difficulty": difficulty,
    }


def generate_ai_question(role: str, difficulty: str):
    try:
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            print("GEMINI_API_KEY missing. Using fallback question.")
            return fallback_question(role, difficulty)

        genai.configure(api_key=api_key)

        model = genai.GenerativeModel("gemini-2.5-flash")

        prompt = f"""
Generate ONE fresh interview question.

Role: {role}
Difficulty: {difficulty}
Unique seed: {time.time()}

Rules:
- Ask only one question.
- Do not repeat generic questions.
- Do not include numbering.
- Do not include explanation.
- Keep it professional and role-specific.
"""

        response = model.generate_content(prompt)

        question_text = response.text.strip() if response and response.text else ""

        if not question_text:
            print("Gemini returned empty question. Using fallback.")
            return fallback_question(role, difficulty)

        return {
            "question_text": question_text,
            "topic": role,
            "difficulty": difficulty,
        }

    except Exception as e:
        print("AI QUESTION GENERATION ERROR:", str(e))
        return fallback_question(role, difficulty)