"""
Candidate Feedback Generator - Creates personalized feedback for candidates.
"""
import json
import os

import httpx

from services.supabase_client import (
    supabase_select_by_id,
    supabase_select_where_in,
)

# Load AI configuration from environment
AI_BASE_URL = os.getenv("AI_BASE_URL")
AI_API_KEY = os.getenv("AI_API_KEY")


async def generate_candidate_feedback(candidate_id: str) -> dict:
    """
    Generates personalized feedback for a candidate.

    Args:
        candidate_id: The candidate's UUID

    Returns:
        Dictionary with status and feedback message.
    """
    # Step 1: Fetch candidate
    candidate = await supabase_select_by_id("candidates", candidate_id)

    if candidate is None:
        return {
            "error": True,
            "message": f"Candidate with id {candidate_id} not found",
        }

    if isinstance(candidate, dict) and candidate.get("error"):
        return {
            "error": True,
            "message": "Failed to fetch candidate",
        }

    # Step 2: Fetch evaluations
    evaluations = await supabase_select_where_in(
        "evaluations",
        "candidate_id",
        [candidate_id]
    )

    qualified = False
    matched_skills = []
    missing_skills = []
    
    if isinstance(evaluations, list) and len(evaluations) > 0:
        latest_eval = evaluations[-1]
        qualified = latest_eval.get("qualified", False)
        matched_skills = latest_eval.get("matched_skills", [])
        missing_skills = latest_eval.get("missing_skills", [])

    # Step 3: Fetch test attempts
    test_attempts = await supabase_select_where_in(
        "test_attempts",
        "candidate_id",
        [candidate_id]
    )

    test_results = []
    weak_areas = []
    if isinstance(test_attempts, list):
        for attempt in test_attempts:
            test_id = attempt.get("test_id", "")
            score = attempt.get("score", 0)
            test_results.append({"test": test_id, "score": score})
            if score < 60:
                weak_areas.append(test_id.replace("_v1", "").replace("_", " ").title())

    # Step 4: Generate AI feedback
    candidate_data = {
        "skills": candidate.get("skills", []),
        "experience_level": candidate.get("experience_level"),
        "resume_score": candidate.get("resume_score", 0),
        "qualified": qualified,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "test_results": test_results,
        "weak_areas": weak_areas,
    }

    feedback_message = await _generate_ai_feedback(candidate_data)
    status = "Qualified" if qualified else "Rejected"

    return {
        "status": status,
        "feedback_message": feedback_message,
        "details": {
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "test_results": test_results,
        },
    }


async def _generate_ai_feedback(candidate_data: dict) -> str:
    """Generates AI-powered personalized feedback message."""
    qualified = candidate_data.get("qualified", False)
    
    if qualified:
        context = f"""
Generate an encouraging feedback message for a QUALIFIED candidate.

Candidate info:
- Skills matched: {', '.join(candidate_data.get('matched_skills', [])) or 'N/A'}
- Experience level: {candidate_data.get('experience_level', 'Unknown')}
- Resume score: {candidate_data.get('resume_score', 0)}/100

Include:
1. Congratulations on qualifying
2. Brief mention of their strengths
3. Next steps they can expect (interview scheduling)

Keep it professional, warm, and 2-3 sentences max.
"""
    else:
        context = f"""
Generate constructive feedback for a candidate who did NOT qualify.

Candidate info:
- Missing skills: {', '.join(candidate_data.get('missing_skills', [])) or 'None specific'}
- Weak test areas: {', '.join(candidate_data.get('weak_areas', [])) or 'None'}
- Resume score: {candidate_data.get('resume_score', 0)}/100

Include:
1. Thank them for applying
2. Explain skill gaps or weak areas professionally
3. Encourage them to improve and reapply

Keep it professional, supportive, and 2-3 sentences max. Don't be discouraging.
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
                "content": "You are an HR professional writing personalized feedback to job candidates. Be concise, professional, and empathetic. Do not use markdown formatting.",
            },
            {
                "role": "user",
                "content": context,
            },
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)

        if response.status_code != 200:
            return _generate_fallback_feedback(candidate_data)

        response_data = response.json()
        content = response_data["choices"][0]["message"]["content"]
        return content.strip()

    except Exception:
        return _generate_fallback_feedback(candidate_data)


def _generate_fallback_feedback(candidate_data: dict) -> str:
    """Generates basic fallback feedback when AI is unavailable."""
    if candidate_data.get("qualified"):
        return "Congratulations! You have successfully qualified for the position. Our HR team will contact you shortly to schedule the next steps in the interview process."
    else:
        missing = candidate_data.get("missing_skills", [])
        weak = candidate_data.get("weak_areas", [])
        
        if missing:
            return f"Thank you for applying. Unfortunately, your profile does not meet our current requirements. We encourage you to strengthen your skills in: {', '.join(missing)}, and consider reapplying in the future."
        elif weak:
            return f"Thank you for applying. Your test performance in {', '.join(weak)} suggests room for improvement. We encourage you to practice and reapply when ready."
        else:
            return "Thank you for applying. Unfortunately, your profile does not meet our current requirements at this time. We encourage you to continue developing your skills and consider reapplying in the future."
