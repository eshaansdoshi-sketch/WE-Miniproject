"""
Candidate Repository - Database operations for candidates and evaluations.
"""
import uuid
from datetime import datetime, timezone
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
            - status: Application status (default: 'applied')
            - user_id: Supabase Auth user ID (REQUIRED)
            - role_id: Job role ID being applied for (REQUIRED)

    Returns:
        The inserted row data if successful, or an error dictionary.
    """
    user_id = candidate_data.get("user_id")
    role_id = candidate_data.get("role_id")
    
    print("=" * 60)
    print("=== INSERTING CANDIDATE ===")
    print(f"user_id: {user_id} (type: {type(user_id).__name__})")
    print(f"role_id: {role_id} (type: {type(role_id).__name__})")
    print("=" * 60)
    
    # Validate UUID format for required fields
    if not user_id:
        print("!!! ERROR: user_id is missing or None !!!")
        return {"error": "user_id is required", "details": "Missing user_id in candidate data"}
    
    if not role_id:
        print("!!! ERROR: role_id is missing or None !!!")
        return {"error": "role_id is required", "details": "Missing role_id in candidate data"}
    
    # Validate UUIDs
    try:
        uuid.UUID(str(user_id))
    except (ValueError, AttributeError):
        print(f"!!! ERROR: user_id is not a valid UUID: {user_id} !!!")
        return {"error": "Invalid user_id format", "details": f"Expected UUID, got: {user_id}"}
    
    try:
        uuid.UUID(str(role_id))
    except (ValueError, AttributeError):
        print(f"!!! ERROR: role_id is not a valid UUID: {role_id} !!!")
        return {"error": "Invalid role_id format", "details": f"Expected UUID, got: {role_id}"}
    
    # Build insert payload with ALL required fields explicitly
    # Convert UUIDs to strings to ensure consistency
    payload = {
        "resume_file_path": candidate_data.get("resume_file_path"),
        "skills": candidate_data.get("skills", []),
        "experience_level": candidate_data.get("experience_level"),
        "experience_summary": candidate_data.get("experience_summary"),
        "resume_score": candidate_data.get("resume_score"),
        # Required fields - explicitly set as strings
        "user_id": str(user_id),
        "role_id": str(role_id),
        "status": candidate_data.get("status", "applied"),
        "applied_at": datetime.now(timezone.utc).isoformat(),
    }
    
    # Remove None values from payload to avoid database issues
    payload = {k: v for k, v in payload.items() if v is not None}

    print("Final payload (None values removed):")
    for key, value in payload.items():
        print(f"  {key}: {value}")
    print("=" * 60)
    
    try:
        result = await supabase_insert("candidates", payload)
        
        print(f"Supabase raw response: {result}")
        
        # Check if result indicates an error
        if isinstance(result, dict) and result.get("error"):
            error_details = result.get("details", "No details")
            status_code = result.get("status_code", "Unknown")
            print("=" * 60)
            print("!!! SUPABASE INSERT ERROR !!!")
            print(f"Status Code: {status_code}")
            print(f"Error Details: {error_details}")
            print("=" * 60)
            # Return the error dict so caller can handle it
            return result
        
        print("=" * 60)
        print("Candidate insert SUCCESS")
        print(f"Candidate ID: {result.get('id') if isinstance(result, dict) else 'unknown'}")
        print("=" * 60)
        return result
        
    except Exception as e:
        print("=" * 60)
        print("!!! CANDIDATE INSERT EXCEPTION !!!")
        print(f"Exception type: {type(e).__name__}")
        print(f"Exception message: {str(e)}")
        import traceback
        traceback.print_exc()
        print("=" * 60)
        # Re-raise so caller sees the actual error
        raise


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
