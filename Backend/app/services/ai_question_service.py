import os
import random
import time
from groq import Groq


def fallback_question(role: str, difficulty: str):
    text_questions = [
        f"What are the most important technical skills required for a {role}?",
        f"Explain one project where you used {role}-related skills.",
        f"How would you debug a production issue as a {role}?",
        f"What tools or frameworks are important for a {role}, and why?",
        f"Describe a challenging problem you solved while preparing for the {role} role.",
    ]

    mcq_questions = [
        {
            "question_text": f"Which skill is most important for a {role}?",
            "options": ["Communication only", "Problem solving", "Guessing answers", "Ignoring debugging"],
        },
        {
            "question_text": f"What is the best way to improve as a {role}?",
            "options": ["Practice projects", "Avoid coding", "Skip documentation", "Only memorize theory"],
        },
        {
            "question_text": f"Which approach is best when facing a technical issue as a {role}?",
            "options": ["Debug step by step", "Ignore the issue", "Restart randomly", "Copy without understanding"],
        },
    ]

    if random.random() < 0.4:
        q = random.choice(mcq_questions)
        return {
            "question_text": q["question_text"],
            "topic": role,
            "difficulty": difficulty,
            "question_type": "mcq",
            "options": q["options"],
            "source": "fallback",
        }

    return {
        "question_text": random.choice(text_questions),
        "topic": role,
        "difficulty": difficulty,
        "question_type": "text",
        "options": None,
        "source": "fallback",
    }


def generate_ai_question(role: str, difficulty: str):
    try:
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            print("GROQ_API_KEY missing. Using fallback question.")
            return fallback_question(role, difficulty)

        client = Groq(api_key=api_key)

        question_type = random.choice(["text", "text", "mcq"])

        if question_type == "mcq":
            prompt = f"""
Generate ONE professional MCQ interview question.

Role: {role}
Difficulty: {difficulty}
Unique seed: {time.time()}

Return strictly in this format:

Question: <question>
A) <option>
B) <option>
C) <option>
D) <option>

Rules:
- Make it role-specific.
- Do not include answer.
- Do not include explanation.
"""
        else:
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
            max_tokens=180,
        )

        content = response.choices[0].message.content.strip()

        if not content:
            return fallback_question(role, difficulty)

        if question_type == "mcq":
            lines = [line.strip() for line in content.splitlines() if line.strip()]
            question_text = lines[0].replace("Question:", "").strip()

            options = []
            for line in lines[1:]:
                if line.startswith(("A)", "B)", "C)", "D)")):
                    options.append(line[2:].strip())

            if len(options) < 4:
                return fallback_question(role, difficulty)

            return {
                "question_text": question_text,
                "topic": role,
                "difficulty": difficulty,
                "question_type": "mcq",
                "options": options[:4],
                "source": "groq",
            }

        return {
            "question_text": content,
            "topic": role,
            "difficulty": difficulty,
            "question_type": "text",
            "options": None,
            "source": "groq",
        }

    except Exception as e:
        print("GROQ QUESTION GENERATION ERROR:", str(e))
        return fallback_question(role, difficulty)