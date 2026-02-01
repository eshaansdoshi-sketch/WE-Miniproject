"""
AI-powered feedback generator for candidate evaluations.
"""
import os

import httpx

# Load AI configuration from environment
AI_BASE_URL = os.getenv("AI_BASE_URL")
AI_API_KEY = os.getenv("AI_API_KEY")


async def generate_candidate_feedback(evaluation_result: dict, role_name: str) -> str:
    """
    Generates a professional feedback message for a candidate based on evaluation results.

    Args:
        evaluation_result: Dictionary containing:
            - qualified: bool
            - matched_skills: list of matched skills
            - missing_skills: list of missing skills
        role_name: Name of the job role applied for

    Returns:
        A professional feedback message string.
    """
    qualified = evaluation_result.get("qualified", False)
    matched_skills = evaluation_result.get("matched_skills", [])
    missing_skills = evaluation_result.get("missing_skills", [])
    candidate_level = evaluation_result.get("candidate_level", "")
    required_level = evaluation_result.get("required_level", "")

    # Build context for AI
    if qualified:
        context = f"""
The candidate has PASSED the evaluation for the "{role_name}" role.
Matched skills: {', '.join(matched_skills) if matched_skills else 'N/A'}
Generate a positive, professional message (2-3 sentences) congratulating them and informing them they will proceed to the next round.
"""
    else:
        context = f"""
The candidate has NOT PASSED the evaluation for the "{role_name}" role.
Matched skills: {', '.join(matched_skills) if matched_skills else 'None'}
Missing skills: {', '.join(missing_skills) if missing_skills else 'None'}
Candidate level: {candidate_level}
Required level: {required_level}
Generate a polite, professional message (2-3 sentences) explaining why they didn't qualify, mentioning the skill gaps or experience mismatch, and encouraging them to improve and reapply in the future.
"""

    url = f"{AI_BASE_URL}/chat/completions"

    headers = {
        "Authorization": f"Bearer {AI_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "arcee-ai/trinity-large-preview:free",
        "temperature": 0.5,
        "messages": [
            {
                "role": "system",
                "content": "You are a professional HR assistant. Generate concise, empathetic feedback messages for job candidates. Keep responses to 2-3 sentences maximum. Do not use markdown formatting.",
            },
            {
                "role": "user",
                "content": context.strip(),
            },
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)

        if response.status_code != 200:
            # Fallback to basic message if AI fails
            return _generate_fallback_feedback(qualified, role_name, missing_skills)

        response_data = response.json()
        content = response_data["choices"][0]["message"]["content"]
        return content.strip()

    except Exception:
        # Fallback to basic message if anything fails
        return _generate_fallback_feedback(qualified, role_name, missing_skills)


def _generate_fallback_feedback(qualified: bool, role_name: str, missing_skills: list) -> str:
    """
    Generates a basic fallback feedback message when AI is unavailable.
    """
    if qualified:
        return f"Congratulations! You have met the requirements for the {role_name} position and will be moving to the next round of our hiring process."
    else:
        if missing_skills:
            skills_text = ", ".join(missing_skills)
            return f"Thank you for applying to the {role_name} position. Unfortunately, your profile does not fully match our requirements at this time. We encourage you to develop skills in: {skills_text}, and consider reapplying in the future."
        else:
            return f"Thank you for applying to the {role_name} position. Unfortunately, your experience level does not match our current requirements. We encourage you to gain more experience and consider reapplying in the future."
