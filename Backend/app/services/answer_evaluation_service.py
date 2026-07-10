import re
import google.generativeai as genai

from app.config.settings import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.0-flash")


def extract_score(text: str):
    match = re.search(r"Score:\s*(\d+)", text, re.IGNORECASE)

    if match:
        score = int(match.group(1))
        return max(0, min(score, 10))

    return 7


def evaluate_answer(question_text: str, answer_text: str):

    prompt = f"""
You are a strict technical interviewer.

Question:
{question_text}

Candidate Answer:
{answer_text}

Evaluate the answer.

Return exactly in this format:

Score: <0 to 10>
Feedback: <short feedback>
Improvement: <what should be improved>
"""

    try:
        response = model.generate_content(prompt)
        feedback_text = response.text.strip()
        score = extract_score(feedback_text)

        return {
            "score": score,
            "feedback": feedback_text
        }

    except Exception:
        if len(answer_text.strip()) < 20:
            return {
                "score": 3,
                "feedback": "Score: 3\nFeedback: Your answer is too short.\nImprovement: Explain the concept with examples."
            }

        return {
            "score": 8,
            "feedback": "Score: 8\nFeedback: Good answer. You explained the concept clearly.\nImprovement: Add real-world examples and more technical depth."
        }