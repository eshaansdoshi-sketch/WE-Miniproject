"""
AI-powered test question generator.
Generates MCQ questions for skill tests using AI.
"""
import json
import os

import httpx

# Load AI configuration from environment
AI_BASE_URL = os.getenv("AI_BASE_URL")
AI_API_KEY = os.getenv("AI_API_KEY")


async def generate_questions_for_test(skill_name: str, test_id: str) -> list:
    """
    Generates 5 MCQ questions for a skill test using AI.

    Args:
        skill_name: The skill to generate questions for (e.g., "Python", "JavaScript")
        test_id: The test identifier for reference

    Returns:
        List of question dictionaries with:
        - question_text: The question text
        - options: List of 4 options
        - correct_answer: The correct option (matches one option exactly)
    """
    url = f"{AI_BASE_URL}/chat/completions"

    headers = {
        "Authorization": f"Bearer {AI_API_KEY}",
        "Content-Type": "application/json",
    }

    prompt = f"""Generate exactly 5 multiple choice questions for testing practical knowledge of {skill_name}.

Requirements:
- Each question must test practical, real-world usage of {skill_name}
- Each question must have exactly 4 options labeled A, B, C, D
- The correct_answer must be the full text of one option (not just the letter)
- Questions should range from basic to intermediate difficulty

You MUST respond with ONLY a valid JSON array in this exact format, no other text:
[
  {{
    "question_text": "What is the output of...",
    "options": ["A. Option one", "B. Option two", "C. Option three", "D. Option four"],
    "correct_answer": "A. Option one"
  }}
]

Generate exactly 5 questions now:"""

    payload = {
        "model": "arcee-ai/trinity-large-preview:free",
        "temperature": 0.7,
        "messages": [
            {
                "role": "system",
                "content": "You are a technical assessment expert. Generate clear, practical MCQ questions that test real-world knowledge. Always respond with valid JSON only, no markdown or explanation.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(url, headers=headers, json=payload)
    except httpx.TimeoutException:
        return {
            "error": True,
            "message": "AI service timed out",
        }
    except httpx.RequestError as e:
        return {
            "error": True,
            "message": f"AI service connection failed: {str(e)}",
        }

    if response.status_code != 200:
        return {
            "error": True,
            "message": "AI service returned an error",
            "status_code": response.status_code,
        }

    try:
        response_data = response.json()
        content = response_data["choices"][0]["message"]["content"]

        # Clean up the response - remove markdown code blocks if present
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        # Parse as JSON
        questions = json.loads(content)

        # Validate structure
        if not isinstance(questions, list):
            return {
                "error": "Invalid response format - expected list",
                "raw": content,
            }

        # Ensure we have exactly 5 questions
        if len(questions) < 5:
            return {
                "error": f"Only {len(questions)} questions generated, expected 5",
                "questions": questions,
            }

        # Take first 5 questions and add test_id
        validated_questions = []
        for q in questions[:5]:
            validated_questions.append({
                "test_id": test_id,
                "question_text": q.get("question_text", ""),
                "options": q.get("options", []),
                "correct_answer": q.get("correct_answer", ""),
            })

        return validated_questions

    except (json.JSONDecodeError, KeyError, IndexError) as e:
        return {
            "error": "AI response parsing failed",
            "raw": content if "content" in dir() else str(e),
        }
