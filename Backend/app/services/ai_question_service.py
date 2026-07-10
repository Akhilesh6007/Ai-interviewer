import google.generativeai as genai

from app.config.settings import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")


def generate_ai_question(role: str, difficulty: str, question_number: int):

    prompt = f"""
    You are an expert technical interviewer.

    Generate only one interview question.

    Role: {role}
    Difficulty: {difficulty}
    Question Number: {question_number}

    Rules:
    - Ask only one question
    - Do not give answer
    - Keep it clear and professional
    """

    try:
        response = model.generate_content(prompt)
        return response.text.strip()

    except Exception:
        return (
            f"Question {question_number}: "
            f"Explain one important {difficulty} level concept for a {role} interview."
        )