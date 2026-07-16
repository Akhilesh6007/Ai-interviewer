import os
import random
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def fallback_question(role: str, difficulty: str):
    questions = [
        {
            "question_text": f"Explain one project where you used skills related to the {role} role.",
            "topic": role,
            "difficulty": difficulty,
        },
        {
            "question_text": f"What are the most important technical skills required for a {role}?",
            "topic": role,
            "difficulty": difficulty,
        },
        {
            "question_text": f"Describe a challenging problem you solved while preparing for the {role} position.",
            "topic": role,
            "difficulty": difficulty,
        },
        {
            "question_text": f"How would you approach debugging a production issue as a {role}?",
            "topic": role,
            "difficulty": difficulty,
        },
        {
            "question_text": f"What tools, frameworks, or technologies are important for a {role}, and why?",
            "topic": role,
            "difficulty": difficulty,
        },
        {
            "question_text": f"Explain a difficult concept related to {role} in simple terms.",
            "topic": role,
            "difficulty": difficulty,
        },
        {
            "question_text": f"How do you improve your technical skills for the {role} role?",
            "topic": role,
            "difficulty": difficulty,
        },
    ]

    return random.choice(questions)


def generate_ai_question(role: str, difficulty: str):
    try:
        if not GEMINI_API_KEY:
            print("GEMINI_API_KEY missing. Using fallback question.")
            return fallback_question(role, difficulty)

        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""
        Generate one professional interview question.

        Role: {role}
        Difficulty: {difficulty}

        Return only the question text.
        Do not include numbering.
        Do not include explanation.
        """

        response = model.generate_content(prompt)

        question_text = response.text.strip()

        if not question_text:
            return fallback_question(role, difficulty)

        return {
            "question_text": question_text,
            "topic": role,
            "difficulty": difficulty,
        }

    except Exception as e:
        print("AI QUESTION GENERATION ERROR:", str(e))
        return fallback_question(role, difficulty)