"""
Performance Report Generator - Creates comprehensive candidate reports with AI insights.
"""
import json
import os

import httpx

from services.supabase_client import (
    supabase_select_by_id,
    supabase_select_where_in,
)
from services.interview_scorer import calculate_interview_readiness

# Load AI configuration from environment
AI_BASE_URL = os.getenv("AI_BASE_URL")
AI_API_KEY = os.getenv("AI_API_KEY")


async def generate_ai_insights(candidate_data: dict) -> dict:
    """
    Generates AI-powered insights for a candidate.
    
    Returns strengths, improvement areas, and final recommendation.
    """
    url = f"{AI_BASE_URL}/chat/completions"

    headers = {
        "Authorization": f"Bearer {AI_API_KEY}",
        "Content-Type": "application/json",
    }

    # Build context for AI
    context = f"""
Candidate Performance Data:
- Resume Score: {candidate_data.get('resume_score', 0)}/100
- Skills: {', '.join(candidate_data.get('skills', [])) or 'None listed'}
- Experience Level: {candidate_data.get('experience_level', 'Unknown')}
- Qualification Status: {'Qualified' if candidate_data.get('qualified') else 'Not Qualified'}
- Test Scores: {candidate_data.get('test_scores', [])}
- Interview Readiness Score: {candidate_data.get('interview_readiness_score', 0)}/100

Based on this data, provide:
1. strengths: Key strengths of this candidate (2-3 points)
2. improvement_areas: Areas needing improvement (2-3 points)
3. final_recommendation: One of "Proceed to interview", "Consider with reservations", or "Reject"

Respond with ONLY valid JSON in this exact format:
{{
  "strengths": "...",
  "improvement_areas": "...",
  "final_recommendation": "..."
}}
"""

    payload = {
        "model": "arcee-ai/trinity-large-preview:free",
        "temperature": 0.3,
        "messages": [
            {
                "role": "system",
                "content": "You are an HR assessment expert. Analyze candidate data and provide concise, actionable insights. Always respond with valid JSON only.",
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
            return _generate_fallback_insights(candidate_data)

        response_data = response.json()
        content = response_data["choices"][0]["message"]["content"]

        # Clean up response
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

        return json.loads(content)

    except Exception:
        return _generate_fallback_insights(candidate_data)


def _generate_fallback_insights(candidate_data: dict) -> dict:
    """Generates basic fallback insights when AI is unavailable."""
    resume_score = candidate_data.get("resume_score", 0)
    qualified = candidate_data.get("qualified", False)
    interview_readiness = candidate_data.get("interview_readiness_score", 0)

    # Determine recommendation based on scores
    if interview_readiness >= 70 and qualified:
        recommendation = "Proceed to interview"
    elif interview_readiness >= 50:
        recommendation = "Consider with reservations"
    else:
        recommendation = "Reject"

    return {
        "strengths": f"Resume score of {resume_score}/100 indicates solid background.",
        "improvement_areas": "Consider gaining more experience in required skill areas.",
        "final_recommendation": recommendation,
    }


async def generate_candidate_report(candidate_id: str) -> dict:
    """
    Generates a comprehensive performance report for a candidate.

    Args:
        candidate_id: The candidate's UUID

    Returns:
        Structured report with resume analysis, qualification, test scores, and AI insights.
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
            "details": candidate,
        }

    # Step 2: Fetch evaluations for this candidate
    evaluations = await supabase_select_where_in(
        "evaluations",
        "candidate_id",
        [candidate_id]
    )

    qualification_status = False
    evaluation_details = None
    if isinstance(evaluations, list) and len(evaluations) > 0:
        # Get the most recent evaluation
        latest_eval = evaluations[-1]
        qualification_status = latest_eval.get("qualified", False)
        evaluation_details = {
            "role_id": latest_eval.get("role_id"),
            "matched_skills": latest_eval.get("matched_skills", []),
            "missing_skills": latest_eval.get("missing_skills", []),
            "feedback": latest_eval.get("feedback"),
        }

    # Step 3: Fetch test attempts
    test_attempts = await supabase_select_where_in(
        "test_attempts",
        "candidate_id",
        [candidate_id]
    )

    skill_test_results = []
    test_scores = []
    if isinstance(test_attempts, list):
        for attempt in test_attempts:
            score = attempt.get("score", 0)
            test_scores.append(score)
            skill_test_results.append({
                "test_id": attempt.get("test_id"),
                "score": score,
                "total_questions": attempt.get("total_questions"),
            })

    # Step 4: Calculate interview readiness
    resume_score = candidate.get("resume_score", 0) or 0
    interview_readiness_score = calculate_interview_readiness(resume_score, test_scores)

    # Step 5: Generate AI insights
    ai_data = {
        "resume_score": resume_score,
        "skills": candidate.get("skills", []),
        "experience_level": candidate.get("experience_level"),
        "qualified": qualification_status,
        "test_scores": test_scores,
        "interview_readiness_score": interview_readiness_score,
    }
    
    insights = await generate_ai_insights(ai_data)

    # Build final report
    return {
        "candidate_id": candidate_id,
        "resume_score": resume_score,
        "skills": candidate.get("skills", []),
        "experience_level": candidate.get("experience_level"),
        "qualification_status": qualification_status,
        "evaluation_details": evaluation_details,
        "skill_test_results": skill_test_results,
        "interview_readiness_score": interview_readiness_score,
        "strengths": insights.get("strengths", ""),
        "improvement_areas": insights.get("improvement_areas", ""),
        "final_recommendation": insights.get("final_recommendation", ""),
    }
