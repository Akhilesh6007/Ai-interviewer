import google.generativeai as genai
from app.config.settings import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.0-flash")


def evaluate_answer(question, answer):

    prompt = f"""
You are an Interviewer.

Question:
{question}

Candidate Answer:
{answer}

Evaluate in JSON format.

Return:

Communication Score (0-10)

Technical Score (0-10)

Confidence Score (0-10)

Overall Score (0-10)

Feedback

Ideal Answer

Weaknesses
"""

    response = model.generate_content(prompt)

    return response.text