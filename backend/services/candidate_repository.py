"""
Candidate Repository - Database operations for candidates and evaluations.
"""
from services.supabase_client import supabase_insert


async def save_candidate(candidate_data: dict) -> dict:
    """
    Saves a candidate to the database.

    Args:
        candidate_data: Dictionary containing candidate information:
            - resume_file_path: Path to the uploaded resume
            - skills: List of candidate skills (stored as JSONB)
            - experience_level: Candidate's experience level
            - experience_summary: Summary of candidate's experience
            - resume_score: Calculated resume score

    Returns:
        The inserted row data if successful, or an error dictionary.
    """
    data = {
        "resume_file_path": candidate_data.get("resume_file_path"),
        "skills": candidate_data.get("skills", []),
        "experience_level": candidate_data.get("experience_level"),
        "experience_summary": candidate_data.get("experience_summary"),
        "resume_score": candidate_data.get("resume_score"),
    }

    return await supabase_insert("candidates", data)


async def save_evaluation(evaluation_data: dict) -> dict:
    """
    Saves an evaluation result to the database.

    Args:
        evaluation_data: Dictionary containing evaluation information:
            - candidate_id: UUID of the candidate
            - role_id: UUID of the job role
            - qualified: Boolean indicating if candidate is qualified
            - matched_skills: List of matched skills (stored as JSONB)
            - missing_skills: List of missing skills (stored as JSONB)
            - feedback: Feedback message for the candidate

    Returns:
        The inserted row data if successful, or an error dictionary.
    """
    data = {
        "candidate_id": evaluation_data.get("candidate_id"),
        "role_id": evaluation_data.get("role_id"),
        "qualified": evaluation_data.get("qualified"),
        "matched_skills": evaluation_data.get("matched_skills", []),
        "missing_skills": evaluation_data.get("missing_skills", []),
        "feedback": evaluation_data.get("feedback"),
    }

    return await supabase_insert("evaluations", data)
