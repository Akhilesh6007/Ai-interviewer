import os
import random
import time
from groq import Groq


def fallback_question(role: str, difficulty: str):
    questions = [
        f"What are the most important technical skills required for a {role}?",
        f"Explain one project where you used {role}-related skills.",
        f"How would you debug a production issue as a {role}?",
        f"What tools or frameworks are important for a {role}, and why?",
        f"Describe a challenging problem you solved while preparing for the {role} role.",
        f"Explain a difficult concept related to {role} in simple terms.",
        f"How do you keep improving your skills for the {role} position?",
    ]

    return {
        "question_text": random.choice(questions),
        "topic": role,
        "difficulty": difficulty,
        "source": "fallback",
    }


def generate_ai_question(role: str, difficulty: str):
    try:
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            print("GROQ_API_KEY missing. Using fallback question.")
            return fallback_question(role, difficulty)

        client = Groq(api_key=api_key)

        prompt = f"""
Generate ONE fresh professional interview question.

Role: {role}
Difficulty: {difficulty}
Unique seed: {time.time()}

Rules:
- Ask only one question.
- Make it practical and role-specific.
- Avoid generic self-introduction questions.
- Do not include numbering.
- Do not include explanation.
- Return only the question text.
"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You generate professional technical interview questions.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.9,
            max_tokens=120,
        )

        question_text = response.choices[0].message.content.strip()

        if not question_text:
            return fallback_question(role, difficulty)

        return {
            "question_text": question_text,
            "topic": role,
            "difficulty": difficulty,
            "source": "groq",
        }

    except Exception as e:
        print("GROQ QUESTION GENERATION ERROR:", str(e))
        return fallback_question(role, difficulty)