"""
Qualification Engine - Evaluates candidate fitness for job roles.

Enhanced with:
- Required vs Preferred skills
- Normalized skill matching (case-insensitive, partial matches)
- Weighted skill importance scoring
- Experience level with resume score flexibility
- Minimum resume score threshold
- Structured feedback details
"""

# Experience level hierarchy (lower index = less experience)
EXPERIENCE_LEVELS = ["fresher", "junior", "mid", "senior"]

# Default weight for skills without explicit weight
DEFAULT_SKILL_WEIGHT = 1.0

# Threshold for critical skill (high weight)
CRITICAL_SKILL_WEIGHT_THRESHOLD = 0.3

# Resume score threshold for experience flexibility
RESUME_SCORE_EXPERIENCE_FLEXIBILITY = 75


def get_experience_level_index(level: str) -> int:
    """
    Returns the index of an experience level in the hierarchy.
    Returns -1 if the level is not recognized.
    """
    level_lower = level.lower().strip()
    if level_lower in EXPERIENCE_LEVELS:
        return EXPERIENCE_LEVELS.index(level_lower)
    return -1


def normalize_skill(skill: str) -> str:
    """
    Normalizes a skill name for matching.
    """
    return skill.lower().strip().replace("-", "").replace("_", "").replace(".", "").replace(" ", "")


def skills_match(candidate_skill: str, required_skill: str) -> bool:
    """
    Checks if a candidate skill matches a required skill.
    Uses normalized comparison for partial/fuzzy matching.
    """
    norm_candidate = normalize_skill(candidate_skill)
    norm_required = normalize_skill(required_skill)
    
    # Exact match after normalization
    if norm_candidate == norm_required:
        return True
    
    # Partial match (one contains the other)
    if norm_candidate in norm_required or norm_required in norm_candidate:
        return True
    
    return False


def find_matching_skill(target_skill: str, candidate_skills: list[str]) -> str | None:
    """
    Finds a matching skill from candidate's skills for a target skill.
    Returns the original candidate skill if found, None otherwise.
    """
    for candidate_skill in candidate_skills:
        if skills_match(candidate_skill, target_skill):
            return candidate_skill
    return None


def match_skills_list(skills_list: list[str], candidate_skills: list[str]) -> tuple[list[str], list[str]]:
    """
    Matches a list of skills against candidate's skills.
    
    Returns:
        Tuple of (matched_skills, missing_skills) with original skill names
    """
    matched = []
    missing = []
    
    for skill in skills_list:
        if find_matching_skill(skill, candidate_skills):
            matched.append(skill)
        else:
            missing.append(skill)
    
    return matched, missing


def calculate_weighted_score(
    matched_skills: list[str],
    missing_skills: list[str],
    skill_weights: dict[str, float]
) -> float:
    """
    Calculates a weighted skill match score.
    
    Args:
        matched_skills: List of matched skill names (original case)
        missing_skills: List of missing skill names (original case)
        skill_weights: Dictionary of skill -> weight mappings
    
    Returns:
        Weighted score between 0.0 and 1.0
    """
    total_weight = 0.0
    matched_weight = 0.0
    
    for skill in matched_skills:
        weight = skill_weights.get(skill, DEFAULT_SKILL_WEIGHT)
        total_weight += weight
        matched_weight += weight
    
    for skill in missing_skills:
        weight = skill_weights.get(skill, DEFAULT_SKILL_WEIGHT)
        total_weight += weight
    
    if total_weight == 0:
        return 1.0  # No skills required means auto-match
    
    return matched_weight / total_weight


def get_experience_gap_category(gap: int) -> str:
    """
    Categorizes the experience gap.
    """
    if gap <= 0:
        return "none"
    elif gap == 1:
        return "minor"
    else:
        return "major"


def evaluate_candidate_for_role(candidate_ai_data: dict, job_role: dict) -> dict:
    """
    Evaluates whether a candidate is qualified for a specific job role.

    Args:
        candidate_ai_data: Dictionary containing candidate's extracted data.
            - skills: list of candidate's skills
            - experience_level: candidate's experience level (fresher/junior/mid/senior)
            - resume_score: candidate's resume score (0-100)
        job_role: Dictionary containing job role requirements from Supabase.
            - required_skills: list of must-have skills
            - preferred_skills: list of nice-to-have skills (optional)
            - min_experience_level: minimum required experience level
            - min_resume_score: minimum required resume score (optional)
            - skill_weights: optional dict of skill -> weight (0.0 to 1.0)

    Returns:
        Dictionary with qualification decision and structured feedback.
    """
    # Extract candidate data
    candidate_skills_raw = candidate_ai_data.get("skills", [])
    candidate_level = candidate_ai_data.get("experience_level", "fresher").lower().strip()
    candidate_resume_score = candidate_ai_data.get("resume_score", 0) or 0
    
    # Extract job role data
    required_skills_raw = job_role.get("required_skills", [])
    preferred_skills_raw = job_role.get("preferred_skills", [])
    # Support both 'role_level' (legacy) and 'min_experience_level' (new)
    min_experience_level = job_role.get("min_experience_level") or job_role.get("role_level", "junior")
    min_experience_level = min_experience_level.lower().strip()
    min_resume_score = job_role.get("min_resume_score", 0) or 0
    skill_weights = job_role.get("skill_weights", {})
    
    # ===== A) Required Skills Matching =====
    matched_required, missing_required = match_skills_list(required_skills_raw, candidate_skills_raw)
    
    # Calculate required skill match ratio
    if len(required_skills_raw) > 0:
        required_match_ratio = len(matched_required) / len(required_skills_raw)
    else:
        required_match_ratio = 1.0
    
    # Calculate weighted score for required skills
    if skill_weights:
        weighted_score = calculate_weighted_score(matched_required, missing_required, skill_weights)
    else:
        weighted_score = required_match_ratio
    
    # ===== B) Preferred Skills Matching =====
    matched_preferred, missing_preferred = match_skills_list(preferred_skills_raw, candidate_skills_raw)
    
    # ===== C) Experience Level Check =====
    candidate_level_index = get_experience_level_index(candidate_level)
    required_level_index = get_experience_level_index(min_experience_level)
    
    if candidate_level_index != -1 and required_level_index != -1:
        experience_gap = required_level_index - candidate_level_index
    else:
        experience_gap = 0  # Unknown levels, assume no gap
    
    experience_gap_category = get_experience_gap_category(experience_gap)
    
    # ===== Qualification Decision =====
    qualified = True
    reject_reasons = []
    issues = {
        "missing_required_skills": None,
        "missing_preferred_skills": None,
        "experience_gap": None,
        "resume_score_issue": None,
    }
    
    # Rule A: Missing >50% of required skills → reject
    if required_match_ratio < 0.5:
        qualified = False
        issues["missing_required_skills"] = missing_required
        reject_reasons.append(
            f"Missing {len(missing_required)}/{len(required_skills_raw)} required skills: {', '.join(missing_required)}"
        )
    
    # Rule B: Missing preferred skills - note but don't reject
    if missing_preferred:
        issues["missing_preferred_skills"] = missing_preferred
    
    # Rule C: Experience level check with resume score flexibility
    if experience_gap > 0:
        # Candidate is one level below required
        if experience_gap == 1:
            # Allow if resume_score >= 75
            if candidate_resume_score < RESUME_SCORE_EXPERIENCE_FLEXIBILITY:
                qualified = False
                issues["experience_gap"] = experience_gap_category
                reject_reasons.append(
                    f"Experience level ({candidate_level}) is below requirement ({min_experience_level}). "
                    f"Resume score of {RESUME_SCORE_EXPERIENCE_FLEXIBILITY}+ could compensate, but yours is {candidate_resume_score}."
                )
            else:
                # Allowed due to high resume score
                issues["experience_gap"] = "minor (compensated by resume score)"
        else:
            # Gap > 1 level - reject regardless of score
            qualified = False
            issues["experience_gap"] = experience_gap_category
            reject_reasons.append(
                f"Experience level ({candidate_level}) is significantly below requirement ({min_experience_level})"
            )
    
    # Rule D: Resume score check
    if min_resume_score > 0 and candidate_resume_score < min_resume_score:
        qualified = False
        issues["resume_score_issue"] = {
            "candidate_score": candidate_resume_score,
            "min_required": min_resume_score,
        }
        reject_reasons.append(
            f"Resume score ({candidate_resume_score}) is below minimum requirement ({min_resume_score})"
        )

    # ===== Calculate Match Score (Job Fit) =====
    # Weights:
    # - Required Skills: 60%
    # - Experience Fit: 20%
    # - Preferred Skills: 10%
    # - Resume Quality: 10%
    
    # 1. Required Skills Score (0-100)
    # Using weighted_score calculated earlier (0.0 to 1.0)
    req_skill_score = weighted_score * 100
    
    # 2. Experience Fit Score (0-100)
    if experience_gap <= 0:
        exp_score = 100 # Meets or exceeds
    elif experience_gap == 1:
        exp_score = 50  # One level below
    else:
        exp_score = 0   # Significant gap
        
    # 3. Preferred Skills Score (0-100)
    if len(preferred_skills_raw) > 0:
        pref_ratio = len(matched_preferred) / len(preferred_skills_raw)
        pref_score = pref_ratio * 100
    else:
        pref_score = 100 # No preferences = full points
        
    # 4. Resume Quality Score (0-100)
    # Already have candidate_resume_score
    
    # Final Match Score Calculation
    match_score = (
        (req_skill_score * 0.6) +
        (exp_score * 0.2) +
        (pref_score * 0.1) +
        (candidate_resume_score * 0.1)
    )
    
    match_score = round(match_score)
    
    feedback_notes = []
    if missing_preferred:
        feedback_notes.append(f"Consider developing these preferred skills: {', '.join(missing_preferred)}")
    
    return {
        "qualified": qualified,
        "match_score": match_score, 
        "summary": "; ".join(reject_reasons) if reject_reasons else "Candidate meets requirements.",
        "required_skill_match_ratio": round(required_match_ratio, 2),
        "weighted_score": round(weighted_score, 2),
        "candidate_level": candidate_level,
        "required_level": min_experience_level,
        "candidate_resume_score": candidate_resume_score,
        "min_resume_score": min_resume_score,
        "details": {
            "matched_required_skills": matched_required,
            "missing_required_skills": missing_required,
            "matched_preferred_skills": matched_preferred,
            "missing_preferred_skills": missing_preferred,
            "experience_gap": experience_gap_category,
            "resume_score_issue": issues["resume_score_issue"],
        },
        "issues": issues,
        "feedback_notes": feedback_notes,
        # Backward compatibility fields
        "matched_skills": matched_required,
        "missing_skills": missing_required,
        "skill_match_ratio": round(required_match_ratio, 2),
        "feedback": "; ".join(reject_reasons) if reject_reasons else "Candidate meets requirements.",
    }
