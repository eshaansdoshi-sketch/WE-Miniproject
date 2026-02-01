"""
Interview Readiness Scorer - Combines resume and test performance into a single score.
"""


def calculate_interview_readiness(resume_score: int, test_scores: list) -> int:
    """
    Calculates interview readiness score combining resume and test performance.

    Args:
        resume_score: The candidate's resume score (0-100)
        test_scores: List of test scores (0-100 each)

    Returns:
        Interview readiness score (0-100)
        
    Weights:
        - Resume: 40%
        - Test average: 60%
    """
    # Ensure resume_score is valid
    resume_score = max(0, min(100, resume_score or 0))
    
    # If no test scores, return resume_score only
    if not test_scores or len(test_scores) == 0:
        return resume_score
    
    # Calculate test average
    valid_scores = [max(0, min(100, s)) for s in test_scores if isinstance(s, (int, float))]
    
    if not valid_scores:
        return resume_score
    
    test_average = sum(valid_scores) / len(valid_scores)
    
    # Calculate weighted score
    # Resume weight = 40%, Test weight = 60%
    weighted_score = (resume_score * 0.4) + (test_average * 0.6)
    
    # Clamp between 0 and 100 and round
    return max(0, min(100, round(weighted_score)))
