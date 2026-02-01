"""
Resume scoring service for pre-test evaluation.
Calculates a numeric score (0-100) based on AI resume analysis.
"""


def calculate_resume_score(ai_data: dict) -> dict:
    """
    Calculates a resume score based on AI-extracted data.

    Args:
        ai_data: Dictionary containing skills, experience_level, experience_summary

    Returns:
        Dictionary with total score and breakdown by category.
    """
    # Skills score (0-50)
    skills = ai_data.get("skills", [])
    skills_count = len(skills) if isinstance(skills, list) else 0

    if skills_count >= 16:
        skills_score = 50
    elif skills_count >= 11:
        skills_score = 40
    elif skills_count >= 6:
        skills_score = 25
    else:
        skills_score = 10

    # Experience level score (0-30)
    experience_level = ai_data.get("experience_level", "").lower().strip()
    experience_level_map = {
        "fresher": 10,
        "junior": 18,
        "mid": 24,
        "senior": 30,
    }
    experience_level_score = experience_level_map.get(experience_level, 10)

    # Summary quality score (0-20)
    experience_summary = ai_data.get("experience_summary", "")
    summary_length = len(experience_summary) if isinstance(experience_summary, str) else 0

    if summary_length > 150:
        summary_quality_score = 20
    elif summary_length > 80:
        summary_quality_score = 12
    else:
        summary_quality_score = 5

    # Total score
    total_score = skills_score + experience_level_score + summary_quality_score

    return {
        "resume_score": total_score,
        "breakdown": {
            "skills_score": skills_score,
            "experience_level_score": experience_level_score,
            "summary_quality_score": summary_quality_score,
        },
    }
