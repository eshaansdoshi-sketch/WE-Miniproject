"""
AI-powered resume analyzer using OpenAI-compatible API.
"""
import json
import os

import httpx

# Load AI configuration from environment
AI_BASE_URL = os.getenv("AI_BASE_URL")
AI_API_KEY = os.getenv("AI_API_KEY")


async def analyze_resume_with_ai(resume_text: str) -> dict:
    """
    Analyzes resume text using AI to extract structured information.

    Args:
        resume_text: The cleaned resume text to analyze.

    Returns:
        A dictionary containing extracted resume information:
        - skills: list of technical skills
        - experience_level: fresher|junior|mid|senior
        - experience_summary: short 2-3 line technical capability summary
    """
    url = f"{AI_BASE_URL}/chat/completions"

    headers = {
        "Authorization": f"Bearer {AI_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "arcee-ai/trinity-large-preview:free",
        "temperature": 0.2,
        "messages": [
            {
                "role": "system",
                "content": "You extract only job-relevant structured data for skill-based hiring evaluation. Always respond with valid JSON only, no markdown or explanation.",
            },
            {
                "role": "user",
                "content": f"Extract structured JSON with exactly these keys: skills (list of technical skills only), experience_level (fresher | junior | mid | senior), experience_summary (short 2-3 line summary focused on technical capability) from this resume:\n{resume_text}",
            },
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
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

        # Try to parse as JSON
        # Remove markdown code blocks if present
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        parsed_data = json.loads(content)
        return parsed_data

    except (json.JSONDecodeError, KeyError, IndexError) as e:
        return {
            "error": "AI response parsing failed",
            "raw": content if "content" in dir() else str(e),
        }
