"""
AI-Powered Hiring Evaluation System - Backend API
"""
import os
import uuid
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone

from services.supabase_client import (
    supabase_select, 
    supabase_select_by_id, 
    supabase_insert, 
    supabase_update_by_id,
    supabase_select_where_in,
    supabase_select_where,
)
from services.qualification_engine import evaluate_candidate_for_role
from services.candidate_repository import save_candidate, save_evaluation
from services.feedback_generator import generate_candidate_feedback
from services.storage_client import upload_resume
from services.resume_parser import extract_text_from_pdf
from services.ai_resume_analyzer import analyze_resume_with_ai
from services.resume_scorer import calculate_resume_score
from services.test_scorer import score_test_submission
from services.test_generator import generate_questions_for_test
from services.interview_scorer import calculate_interview_readiness
from services.performance_report import generate_candidate_report
from services.candidate_feedback import generate_candidate_feedback as get_candidate_feedback

# Load environment variables from .env file
load_dotenv()

# Environment configuration
AI_BASE_URL = os.getenv("AI_BASE_URL")
AI_API_KEY = os.getenv("AI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler for startup and shutdown events.
    """
    # Startup: Validate required environment variables
    required_vars = {
        "AI_BASE_URL": AI_BASE_URL,
        "AI_API_KEY": AI_API_KEY,
        "SUPABASE_URL": SUPABASE_URL,
        "SUPABASE_KEY": SUPABASE_KEY,
    }
    
    missing_vars = [name for name, value in required_vars.items() if not value]
    if missing_vars:
        print(f"[WARNING] Missing environment variables: {', '.join(missing_vars)}")
    else:
        print("[OK] All environment variables loaded successfully")
    
    yield
    
    # Shutdown: Cleanup resources if needed
    print("[INFO] Application shutting down...")


# Initialize FastAPI app
app = FastAPI(
    title="Hiring Evaluation System API",
    description="AI-powered system for evaluating job applicants using resume analysis and MCQ assessments",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint to verify the API is running.
    Returns the status of the service and environment configuration state.
    """
    env_status = {
        "ai_configured": bool(AI_BASE_URL and AI_API_KEY),
        "supabase_configured": bool(SUPABASE_URL and SUPABASE_KEY),
    }
    
    return {
        "status": "healthy",
        "service": "Hiring Evaluation System API",
        "version": "1.0.0",
        "environment": env_status,
    }


# Pydantic models
class JobRoleCreate(BaseModel):
    role_name: str
    required_skills: list[str]
    preferred_skills: list[str] = []
    min_experience_level: str = "junior"  # junior/mid/senior
    min_resume_score: int = 50
    time_limit: int = 3  # Test time limit in minutes
    # Legacy fields for backward compatibility
    skill_weights: dict[str, float] | None = None
    role_level: str | None = None


class CandidateData(BaseModel):
    skills: list[str]
    experience_level: str  # fresher/junior/mid/senior


class CandidateEvalRequest(BaseModel):
    candidate_id: str
    skills: list[str]
    experience_level: str  # fresher/junior/mid/senior


class JobRoleUpdate(BaseModel):
    required_skills: list[str] | None = None
    preferred_skills: list[str] | None = None
    min_experience_level: str | None = None
    min_resume_score: int | None = None
    time_limit: int | None = None


class TestAnswer(BaseModel):
    question_id: str
    selected_option: str


class TestSubmission(BaseModel):
    test_id: str
    answers: list[TestAnswer]


class CandidateStatusUpdate(BaseModel):
    """Request body for updating candidate status by admin."""
    status: str  # applied, qualified, rejected, approved, interview, hired
    notes: str | None = None


@app.post("/job-role", tags=["Job Roles"])
async def create_job_role(job_role: JobRoleCreate):
    """
    Create a new job role with required skills and role level.
    """
    # Build data with new field names
    data = {
        "role_name": job_role.role_name,
        "required_skills": job_role.required_skills,
        "preferred_skills": job_role.preferred_skills,
        "min_experience_level": job_role.min_experience_level,
        "min_resume_score": job_role.min_resume_score,
        "time_limit": job_role.time_limit,
    }
    
    # Add legacy fields if provided
    if job_role.skill_weights:
        data["skill_weights"] = job_role.skill_weights
    if job_role.role_level:
        data["role_level"] = job_role.role_level

    try:
        result = await supabase_insert("job_roles", data)

        if isinstance(result, dict) and result.get("error"):
            print(f"[JobRole] Insert error: {result}")
            return {
                "success": False,
                "error": str(result.get("error", "Unknown error")),
            }

        return {
            "success": True,
            "job_role_id": result.get("id") if result else None,
            "created": result,
        }
    except Exception as e:
        print(f"[JobRole] Exception: {e}")
        return {
            "success": False,
            "error": str(e),
        }


@app.put("/job-role/{role_id}", tags=["Job Roles"])
async def update_job_role(role_id: str, updates: JobRoleUpdate):
    """
    Update an existing job role's requirements.
    Only provided fields will be updated.
    """
    # Fetch existing role
    existing_role = await supabase_select_by_id("job_roles", role_id)

    if existing_role is None:
        return {
            "success": False,
            "error": f"Job role with id {role_id} not found",
        }

    if isinstance(existing_role, dict) and existing_role.get("error"):
        return {
            "success": False,
            "error": existing_role,
        }

    # Build update data with only provided fields
    update_data = {}
    if updates.required_skills is not None:
        update_data["required_skills"] = updates.required_skills
    if updates.preferred_skills is not None:
        update_data["preferred_skills"] = updates.preferred_skills
    if updates.min_experience_level is not None:
        update_data["min_experience_level"] = updates.min_experience_level
    if updates.min_resume_score is not None:
        update_data["min_resume_score"] = updates.min_resume_score
    if updates.time_limit is not None:
        update_data["time_limit"] = updates.time_limit

    if not update_data:
        return {
            "success": False,
            "error": "No fields provided to update",
        }

    # Update in Supabase
    result = await supabase_update_by_id("job_roles", role_id, update_data)

    if isinstance(result, dict) and result.get("error"):
        return {
            "success": False,
            "error": result,
        }

    return {
        "success": True,
        "role_id": role_id,
        "updated_fields": list(update_data.keys()),
        "job_role": result,
    }


@app.get("/candidates", tags=["Dashboard"])
async def get_all_candidates():
    """
    Fetch all candidates for the HR dashboard.
    """
    data = await supabase_select("candidates")
    
    if isinstance(data, dict) and data.get("error"):
        return {
            "success": False,
            "error": data,
        }
    
    return {
        "success": True,
        "count": len(data) if isinstance(data, list) else 0,
        "candidates": data,
    }


@app.get("/job-roles", tags=["Dashboard"])
async def get_all_job_roles():
    """
    Fetch all job roles for the HR dashboard.
    """
    data = await supabase_select("job_roles")
    
    if isinstance(data, dict) and data.get("error"):
        return {
            "success": False,
            "error": data,
        }
    
    return {
        "success": True,
        "count": len(data) if isinstance(data, list) else 0,
        "job_roles": data,
    }


@app.get("/evaluations", tags=["Dashboard"])
async def get_all_evaluations():
    """
    Fetch all evaluations for the HR dashboard.
    Includes candidate_id and role_id for linking.
    """
    data = await supabase_select("evaluations")
    
    if isinstance(data, dict) and data.get("error"):
        return {
            "success": False,
            "error": data,
        }
    
    return {
        "success": True,
        "count": len(data) if isinstance(data, list) else 0,
        "evaluations": data,
    }


# =============================================================================
# CANDIDATE LOOKUP BY USER
# =============================================================================


@app.get("/candidate/by-user/{user_id}", tags=["Candidate"])
async def get_candidate_by_user(user_id: str):
    """
    Fetch candidate record for an authenticated user.
    Used to restore application state after login.
    
    Returns the candidate record with role name if exists, None if new applicant.
    Includes: status, admin_notes, role_name for dashboard display.
    """
    print(f"[GetCandidateByUser] Looking up candidate for user_id={user_id}")
    
    try:
        # Use str(user_id) to be safe
        records = await supabase_select_where("candidates", {"user_id": str(user_id)})
        
        # Log the raw result to understand what we are getting
        print(f"[GetCandidateByUser] Raw records type: {type(records)}")
        
        if isinstance(records, dict) and records.get("error"):
            print(f"[GetCandidateByUser] API Error: {records}")
            return None
        
        if isinstance(records, list) and len(records) > 0:
            candidate = records[0]
            print(f"[GetCandidateByUser] Found candidate_id={candidate.get('id')}, status={candidate.get('status')}")
            
            # Fetch role name if role_id exists
            role_name = None
            role_id = candidate.get("role_id")
            if role_id:
                role = await supabase_select_by_id("job_roles", role_id)
                if role and not (isinstance(role, dict) and role.get("error")):
                    role_name = role.get("role_name")
            
            # Return enriched candidate data
            return {
                "id": candidate.get("id"),
                "user_id": candidate.get("user_id"),
                "status": candidate.get("status"),
                "admin_notes": candidate.get("admin_notes"),
                "role_id": role_id,
                "role_name": role_name,
                "email": candidate.get("email"),
                "resume_score": candidate.get("resume_score"),
                "skills": candidate.get("skills"),
                "experience_level": candidate.get("experience_level"),
                "qualified": candidate.get("qualified"),
                "applied_at": candidate.get("applied_at"),
            }
        
        if isinstance(records, list) and len(records) == 0:
             print(f"[GetCandidateByUser] No records found (empty list) for user_id={user_id}")
             return None

        print(f"[GetCandidateByUser] Unhandled records format: {records}")
        return None
        
    except Exception as e:
        print(f"[GetCandidateByUser] Exception: {e}")
        import traceback
        traceback.print_exc()
        return None


# =============================================================================
# ADMIN CANDIDATE MANAGEMENT ROUTES
# =============================================================================


@app.get("/admin/candidate/{candidate_id}", tags=["Admin"])
async def get_admin_candidate_details(candidate_id: str):
    """
    Get full candidate details for admin review.
    
    Returns:
        - Candidate basic info (email, experience level)
        - Applied role details
        - Resume extracted skills
        - AI resume summary
        - Test results (per skill + total score)
        - Current candidate status
        - Admin notes
    """
    # Fetch candidate
    candidate = await supabase_select_by_id("candidates", candidate_id)
    
    if candidate is None:
        raise HTTPException(status_code=404, detail=f"Candidate {candidate_id} not found")
    
    if isinstance(candidate, dict) and candidate.get("error"):
        raise HTTPException(status_code=500, detail="Failed to fetch candidate")
    
    # Fetch applied role details if role_id exists
    role_details = None
    if candidate.get("role_id"):
        role = await supabase_select_by_id("job_roles", candidate.get("role_id"))
        if role and not (isinstance(role, dict) and role.get("error")):
            role_details = {
                "role_id": role.get("id"),
                "role_name": role.get("role_name"),
                "required_skills": role.get("required_skills", []),
                "min_experience_level": role.get("min_experience_level"),
            }
    
    # Fetch test attempts and scores
    test_results = []
    total_score = None
    test_attempts = await supabase_select_where("test_attempts", {"candidate_id": candidate_id})
    
    if isinstance(test_attempts, list) and test_attempts:
        scores = []
        for attempt in test_attempts:
            test_results.append({
                "test_id": attempt.get("test_id"),
                "score": attempt.get("score"),
                "total_questions": attempt.get("total_questions"),
                "submitted_at": attempt.get("created_at"),
            })
            if attempt.get("score") is not None:
                scores.append(attempt.get("score"))
        
        if scores:
            total_score = round(sum(scores) / len(scores))
    
    # Fetch evaluation result if exists
    evaluation = None
    evaluations = await supabase_select_where("evaluations", {"candidate_id": candidate_id})
    if isinstance(evaluations, list) and evaluations:
        eval_data = evaluations[0]  # Get most recent
        evaluation = {
            "qualified": eval_data.get("qualified"),
            "matched_skills": eval_data.get("matched_skills", []),
            "missing_skills": eval_data.get("missing_skills", []),
            "feedback": eval_data.get("feedback"),
        }
    
    return {
        "success": True,
        "candidate": {
            "id": candidate.get("id"),
            "email": candidate.get("email"),
            "experience_level": candidate.get("experience_level"),
            "experience_summary": candidate.get("experience_summary"),
            "skills": candidate.get("skills", []),
            "resume_score": candidate.get("resume_score"),
            "resume_file_path": candidate.get("resume_file_path"),
            "status": candidate.get("status", "applied"),
            "admin_notes": candidate.get("admin_notes"),
            "applied_at": candidate.get("applied_at"),
        },
        "role": role_details,
        "test_results": test_results,
        "total_test_score": total_score,
        "evaluation": evaluation,
    }


@app.patch("/admin/candidate-status/{candidate_id}", tags=["Admin"])
async def update_candidate_status(candidate_id: str, update: CandidateStatusUpdate):
    """
    Update candidate status and admin notes.
    
    Allowed status values:
        - applied
        - qualified
        - rejected
        - approved
        - interview
        - hired
    """
    # Validate status value
    allowed_statuses = ["applied", "qualified", "rejected", "approved", "interview", "hired"]
    if update.status not in allowed_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid status. Must be one of: {', '.join(allowed_statuses)}"
        )
    
    # Verify candidate exists
    candidate = await supabase_select_by_id("candidates", candidate_id)
    if candidate is None:
        raise HTTPException(status_code=404, detail=f"Candidate {candidate_id} not found")
    
    if isinstance(candidate, dict) and candidate.get("error"):
        raise HTTPException(status_code=500, detail="Failed to fetch candidate")
    
    # Build update data
    update_data = {"status": update.status}
    if update.notes is not None:
        update_data["admin_notes"] = update.notes
    
    # Update candidate
    result = await supabase_update_by_id("candidates", candidate_id, update_data)
    
    if isinstance(result, dict) and result.get("error"):
        raise HTTPException(status_code=500, detail="Failed to update candidate status")
    
    return {
        "success": True,
        "candidate_id": candidate_id,
        "status": update.status,
        "admin_notes": update.notes,
        "message": f"Candidate status updated to '{update.status}'",
    }


@app.get("/candidate-feedback/{candidate_id}", tags=["Candidate"])
async def get_candidate_feedback_report(candidate_id: str):
    """
    Get personalized feedback for a candidate.
    Provides encouraging message for qualified candidates or constructive feedback for rejected ones.
    """
    result = await get_candidate_feedback(candidate_id)

    if isinstance(result, dict) and result.get("error"):
        return {
            "success": False,
            "error": result.get("message", "Failed to generate feedback"),
        }

    return {
        "success": True,
        "status": result.get("status"),
        "feedback_message": result.get("feedback_message"),
    }


@app.get("/hr/candidate-summary", tags=["Dashboard"])
async def get_hr_candidate_summary():
    """
    Get a summary of all candidates for HR dashboard.
    Includes resume score, qualification status, test scores, and interview readiness.
    """
    # Fetch all candidates
    candidates = await supabase_select("candidates")
    
    if isinstance(candidates, dict) and candidates.get("error"):
        return {
            "success": False,
            "error": candidates,
        }
    
    if not candidates:
        return {
            "success": True,
            "count": 0,
            "candidates": [],
        }
    
    # Fetch all evaluations
    evaluations = await supabase_select("evaluations")
    evaluation_map = {}
    if isinstance(evaluations, list):
        for ev in evaluations:
            cid = ev.get("candidate_id")
            # Keep the latest evaluation per candidate
            if cid:
                evaluation_map[cid] = ev.get("qualified", False)
    
    # Fetch all test attempts
    test_attempts = await supabase_select("test_attempts")
    test_scores_map = {}
    if isinstance(test_attempts, list):
        for attempt in test_attempts:
            cid = attempt.get("candidate_id")
            if cid:
                if cid not in test_scores_map:
                    test_scores_map[cid] = []
                score = attempt.get("score")
                if score is not None:
                    test_scores_map[cid].append(score)
    
    # Build summary for each candidate
    summary_list = []
    for candidate in candidates:
        candidate_id = candidate.get("id")
        resume_score = candidate.get("resume_score", 0) or 0
        qualified = evaluation_map.get(candidate_id, False)
        
        # Calculate average test score
        test_scores = test_scores_map.get(candidate_id, [])
        avg_test_score = round(sum(test_scores) / len(test_scores)) if test_scores else None
        
        # Calculate interview readiness score
        if test_scores:
            interview_readiness_score = round((resume_score * 0.4) + ((sum(test_scores) / len(test_scores)) * 0.6))
        else:
            interview_readiness_score = resume_score
        
        # Determine status
        if qualified and interview_readiness_score >= 70:
            status = "Shortlisted"
        elif qualified:
            status = "Under Review"
        elif interview_readiness_score >= 50:
            status = "Consider"
        else:
            status = "Not Qualified"
        
        summary_list.append({
            "candidate_id": candidate_id,
            "resume_score": resume_score,
            "qualified": qualified,
            "avg_test_score": avg_test_score,
            "interview_readiness_score": interview_readiness_score,
            "status": status,
        })
    
    return {
        "success": True,
        "count": len(summary_list),
        "candidates": summary_list,
    }


@app.get("/candidate-report/{candidate_id}", tags=["Dashboard"])
async def get_candidate_performance_report(candidate_id: str):
    """
    Get a comprehensive performance report for a candidate.
    Includes resume analysis, qualification status, test scores, and AI-generated insights.
    """
    report = await generate_candidate_report(candidate_id)

    if isinstance(report, dict) and report.get("error"):
        return {
            "success": False,
            "error": report.get("message", "Failed to generate report"),
        }

    return {
        "success": True,
        **report,
    }


@app.post("/assign-tests/{candidate_id}/{role_id}", tags=["Testing"])
async def assign_tests_to_candidate(candidate_id: str, role_id: str):
    """
    Assign standardized tests to a candidate based on job role's required_skills.
    Tests are ONLY assigned for skills listed in the job role, NOT resume skills.
    If a test doesn't exist for a required skill, it will be auto-generated using AI.
    """
    print(f"[AssignTests] Starting for candidate={candidate_id}, role_id={role_id}")
    
    # Fetch candidate (to verify they exist)
    candidate = await supabase_select_by_id("candidates", candidate_id)

    if candidate is None:
        return {
            "success": False,
            "error": f"Candidate with id {candidate_id} not found",
        }

    if isinstance(candidate, dict) and candidate.get("error"):
        return {
            "success": False,
            "error": candidate,
        }

    # Fetch job role to get required_skills
    job_role = await supabase_select_by_id("job_roles", role_id)
    
    if job_role is None:
        return {
            "success": False,
            "error": f"Job role with id {role_id} not found",
        }
    
    if isinstance(job_role, dict) and job_role.get("error"):
        return {
            "success": False,
            "error": job_role,
        }
    
    # Get ONLY required_skills from job role (NOT preferred_skills, NOT resume skills)
    required_skills = job_role.get("required_skills", [])
    print(f"[AssignTests] role_id={role_id}, required_skills={required_skills}")
    
    if not required_skills:
        return {
            "success": True,
            "candidate_id": candidate_id,
            "role_id": role_id,
            "message": "No required skills defined for this job role",
            "assigned_tests": [],
        }

    # Fetch all existing skill tests
    skill_tests = await supabase_select("skill_tests")
    
    if isinstance(skill_tests, dict) and skill_tests.get("error"):
        skill_tests = []  # Continue with empty list if fetch fails

    # Normalize skill names for matching
    def normalize(s: str) -> str:
        return s.lower().strip().replace(" ", "_")

    # Build a map of normalized skill name to test
    test_map = {}
    for test in skill_tests:
        skill_name = test.get("skill_name", "")
        test_map[normalize(skill_name)] = {
            "skill_name": skill_name,
            "test_id": test.get("test_id"),
        }

    # Process each REQUIRED SKILL from job role - assign existing test or generate new one
    assigned_tests = []
    generated_tests = []
    
    for skill in required_skills:
        normalized_skill = normalize(skill)
        test_id = f"{normalized_skill}_v1"
        
        # Check for exact match in existing tests
        if normalized_skill in test_map:
            assigned_tests.append({
                "skill": skill,
                "test_id": test_map[normalized_skill]["test_id"],
                "generated": False,
            })
        else:
            # Check for partial match
            found_match = False
            for test_skill, test_info in test_map.items():
                if normalized_skill in test_skill or test_skill in normalized_skill:
                    assigned_tests.append({
                        "skill": skill,
                        "test_id": test_info["test_id"],
                        "generated": False,
                    })
                    found_match = True
                    break
            
            # No existing test found - generate new one
            if not found_match:
                # Check if we already generated for this skill in this request
                if normalized_skill not in [normalize(t["skill"]) for t in generated_tests]:
                    # Generate questions using AI
                    questions = await generate_questions_for_test(skill, test_id)
                    
                    if isinstance(questions, list) and len(questions) > 0:
                        # Insert questions into test_questions table
                        inserted_count = 0
                        for question in questions:
                            result = await supabase_insert("test_questions", {
                                "test_id": test_id,
                                "question_text": question.get("question_text", ""),
                                "options": question.get("options", []),
                                "correct_answer": question.get("correct_answer", ""),
                            })
                            if not (isinstance(result, dict) and result.get("error")):
                                inserted_count += 1
                        
                        # Insert mapping into skill_tests table
                        await supabase_insert("skill_tests", {
                            "skill_name": skill,
                            "test_id": test_id,
                        })
                        
                        # Add to assigned tests
                        assigned_tests.append({
                            "skill": skill,
                            "test_id": test_id,
                            "generated": True,
                        })
                        
                        generated_tests.append({
                            "skill": skill,
                            "test_id": test_id,
                            "questions_inserted": inserted_count,
                        })
                        
                        # Also add to test_map so subsequent skills can match
                        test_map[normalized_skill] = {
                            "skill_name": skill,
                            "test_id": test_id,
                        }

    return {
        "success": True,
        "candidate_id": candidate_id,
        "role_id": role_id,
        "time_limit": job_role.get("time_limit", 3),  # Default to 3 minutes if not set
        "assigned_tests": assigned_tests,
    }

    test_ids_assigned = [t["test_id"] for t in assigned_tests]
    print(f"[AssignTests] test_ids_assigned={test_ids_assigned}")
    
    return {
        "success": True,
        "candidate_id": candidate_id,
        "role_id": role_id,
        "required_skills": required_skills,
        "assigned_tests": assigned_tests,
        "tests_assigned_count": len(assigned_tests),
        "tests_generated": generated_tests,
        "tests_generated_count": len(generated_tests),
    }


@app.post("/generate-test/{skill_name}", tags=["Testing"])
async def generate_test_for_skill(skill_name: str):
    """
    Generate MCQ questions for a skill test using AI.
    
    Creates a new test with 5 questions if it doesn't already exist.
    """
    # Create test_id from skill name
    test_id = skill_name.lower().replace(" ", "_") + "_v1"
    
    # Check if test already exists in test_questions
    existing_questions = await supabase_select_where_in(
        "test_questions",
        "test_id",
        [test_id]
    )
    
    if isinstance(existing_questions, list) and len(existing_questions) > 0:
        return {
            "success": True,
            "message": f"Test '{test_id}' already exists with {len(existing_questions)} questions",
            "test_id": test_id,
            "questions_count": len(existing_questions),
            "regenerated": False,
        }
    
    # Generate questions using AI
    questions = await generate_questions_for_test(skill_name, test_id)
    
    if isinstance(questions, dict) and questions.get("error"):
        return {
            "success": False,
            "error": "Failed to generate questions",
            "details": questions,
        }
    
    # Insert questions into test_questions table
    inserted_count = 0
    for question in questions:
        result = await supabase_insert("test_questions", {
            "test_id": test_id,
            "question_text": question["question_text"],
            "options": question["options"],
            "correct_answer": question["correct_answer"],
        })
        
        if not (isinstance(result, dict) and result.get("error")):
            inserted_count += 1
    
    # Insert mapping into skill_tests table
    skill_test_result = await supabase_insert("skill_tests", {
        "skill_name": skill_name,
        "test_id": test_id,
    })
    
    skill_test_created = not (isinstance(skill_test_result, dict) and skill_test_result.get("error"))
    
    return {
        "success": True,
        "test_id": test_id,
        "skill_name": skill_name,
        "questions_inserted": inserted_count,
        "skill_test_mapping_created": skill_test_created,
        "regenerated": True,
    }


@app.get("/candidate-tests/{candidate_id}/{role_id}", tags=["Testing"])
async def get_candidate_tests(candidate_id: str, role_id: str):
    """
    Get MCQ questions for all tests assigned to a candidate based on job role's required_skills.
    Returns questions without correct answers for security.
    """
    # Step 0: Check if candidate has already completed assessments
    candidate = await supabase_select_by_id("candidates", candidate_id)
    
    if candidate is None:
        return {
            "success": False,
            "error": f"Candidate with id {candidate_id} not found",
        }
    
    if isinstance(candidate, dict) and candidate.get("error"):
        return {
            "success": False,
            "error": candidate,
        }
    
    candidate_status = candidate.get("status", "applied")
    if candidate_status == "completed":
        print(f"[candidate-tests] Blocking - candidate already completed: {candidate_id}")
        return {
            "success": False,
            "error": "Assessments already completed. You cannot retake tests.",
            "status": candidate_status,
        }
    
    # Fetch job role to get required_skills
    job_role = await supabase_select_by_id("job_roles", role_id)
    
    if job_role is None:
        return {
            "success": False,
            "error": f"Job role with id {role_id} not found",
        }
    
    if isinstance(job_role, dict) and job_role.get("error"):
        return {
            "success": False,
            "error": job_role,
        }
    
    # Get ONLY required_skills from job role
    required_skills = job_role.get("required_skills", [])
    print(f"Role-based skills used for test assignment: {required_skills}")
    
    if not required_skills:
        return {
            "success": True,
            "candidate_id": candidate_id,
            "role_id": role_id,
            "message": "No required skills defined for this job role",
            "tests": [],
        }

    # Fetch all skill tests
    skill_tests = await supabase_select("skill_tests")

    if isinstance(skill_tests, dict) and skill_tests.get("error"):
        return {
            "success": False,
            "error": skill_tests,
        }

    # Normalize skill names for matching
    def normalize(s: str) -> str:
        return s.lower().strip()

    # Build a map of normalized skill name to test
    test_map = {}
    for test in skill_tests:
        skill_name = test.get("skill_name", "")
        test_map[normalize(skill_name)] = test.get("test_id")

    # Match required skills to test_ids
    matched_test_ids = set()
    for skill in required_skills:
        normalized_skill = normalize(skill)
        # Check for exact match
        if normalized_skill in test_map:
            matched_test_ids.add(test_map[normalized_skill])
        else:
            # Check for partial match
            for test_skill, test_id in test_map.items():
                if normalized_skill in test_skill or test_skill in normalized_skill:
                    matched_test_ids.add(test_id)
                    break

    if not matched_test_ids:
        return {
            "success": True,
            "candidate_id": candidate_id,
            "role_id": role_id,
            "message": "No matching tests found for required skills",
            "tests": [],
        }

    # Fetch questions for matched test_ids
    questions = await supabase_select_where_in(
        "test_questions",
        "test_id",
        list(matched_test_ids)
    )

    if isinstance(questions, dict) and questions.get("error"):
        return {
            "success": False,
            "error": questions,
        }

    # Group questions by test_id and remove correct_answer
    tests_dict = {}
    for q in questions:
        test_id = q.get("test_id")
        if test_id not in tests_dict:
            tests_dict[test_id] = []
        
        # Build question without correct_answer
        question_data = {
            "question_id": q.get("id"),
            "question_text": q.get("question_text"),
            "options": q.get("options", []),
        }
        tests_dict[test_id].append(question_data)

    # Format response
    tests_list = [
        {"test_id": test_id, "questions": questions}
        for test_id, questions in tests_dict.items()
    ]

    return {
        "success": True,
        "candidate_id": candidate_id,
        "role_id": role_id,
        "tests": tests_list,
        "total_questions": sum(len(t["questions"]) for t in tests_list),
        "time_limit": job_role.get("time_limit", 3),
    }


@app.post("/submit-test/{candidate_id}", tags=["Testing"])
async def submit_test(candidate_id: str, submission: TestSubmission):
    """
    Submit test answers and receive a score.
    
    Scores the submission, saves the attempt and individual answers to the database.
    """
    # Convert answers to dict format
    answers_list = [answer.model_dump() for answer in submission.answers]
    
    # Step 1: Score the submission
    score_result = await score_test_submission(candidate_id, answers_list)
    
    if isinstance(score_result, dict) and score_result.get("error"):
        return {
            "success": False,
            "error": "Failed to score submission",
            "details": score_result,
        }
    
    # Step 2: Save test attempt to database
    attempt_record = await supabase_insert("test_attempts", {
        "candidate_id": candidate_id,
        "test_id": submission.test_id,
        "score": score_result["score"],
        "total_questions": score_result["total_questions"],
    })
    
    if isinstance(attempt_record, dict) and attempt_record.get("error"):
        return {
            "success": False,
            "error": "Failed to save test attempt",
            "details": attempt_record,
        }
    
    attempt_id = attempt_record.get("id")
    
    # Step 3: Save individual answers to database
    answer_results = score_result.get("answer_results", [])
    saved_answers = []
    
    for answer in answer_results:
        answer_record = await supabase_insert("test_answers", {
            "attempt_id": attempt_id,
            "question_id": answer["question_id"],
            "selected_option": answer["selected_option"],
            "is_correct": answer["is_correct"],
        })
        
        if not (isinstance(answer_record, dict) and answer_record.get("error")):
            saved_answers.append(answer_record.get("id"))
    
    # Step 4: Calculate interview readiness and update candidate status
    # Fetch candidate to get resume_score
    candidate = await supabase_select_by_id("candidates", candidate_id)
    resume_score = candidate.get("resume_score", 0) if candidate else 0
    
    # Get all test scores for this candidate
    all_attempts = await supabase_select_where_in("test_attempts", "candidate_id", [candidate_id])
    all_test_scores = []
    if isinstance(all_attempts, list):
        all_test_scores = [a.get("score", 0) for a in all_attempts if a.get("score") is not None]
    
    # Calculate interview readiness (40% resume, 60% tests)
    if all_test_scores:
        test_avg = sum(all_test_scores) / len(all_test_scores)
        interview_readiness = round((resume_score * 0.4) + (test_avg * 0.6))
    else:
        interview_readiness = resume_score
    
    # Update status based on interview readiness
    new_status = "hired"  # One-time assessment, no retakes allowed - use 'hired' as completion status
    await supabase_update_by_id("candidates", candidate_id, {"status": new_status})
    
    return {
        "success": True,
        "attempt_id": attempt_id,
        "score": score_result["score"],
        "correct_answers": score_result["correct_answers"],
        "total_questions": score_result["total_questions"],
        "answers_saved": len(saved_answers),
        "interview_readiness_score": interview_readiness,
        "status": new_status,
    }


@app.post("/evaluate-candidate/{role_id}", tags=["Internal"])
async def evaluate_candidate(role_id: str, candidate_data: CandidateEvalRequest):
    """
    Evaluate a candidate against a specific job role.
    Fetches job role from Supabase and uses the qualification engine.
    Saves evaluation result to database.
    """
    # Fetch job role from Supabase
    job_role = await supabase_select_by_id("job_roles", role_id)

    if job_role is None:
        return {
            "success": False,
            "error": f"Job role with id {role_id} not found",
        }

    if isinstance(job_role, dict) and job_role.get("error"):
        return {
            "success": False,
            "error": job_role,
        }

    # Evaluate candidate
    result = evaluate_candidate_for_role(
        candidate_ai_data={
            "skills": candidate_data.skills,
            "experience_level": candidate_data.experience_level,
        },
        job_role=job_role,
    )

    # Generate AI-powered feedback message
    role_name = job_role.get("role_name", "the position")
    ai_feedback = await generate_candidate_feedback(result, role_name)
    result["feedback"] = ai_feedback

    # Save evaluation to database
    evaluation_record = await save_evaluation({
        "candidate_id": candidate_data.candidate_id,
        "role_id": role_id,
        "qualified": result["qualified"],
        "matched_skills": result["matched_skills"],
        "missing_skills": result["missing_skills"],
        "feedback": ai_feedback,
    })

    evaluation_id = None
    if isinstance(evaluation_record, dict) and not evaluation_record.get("error"):
        evaluation_id = evaluation_record.get("id")

    return {
        "success": True,
        "role_id": role_id,
        "role_name": job_role.get("role_name"),
        "evaluation_id": evaluation_id,
        "evaluation": result,
    }


# =============================================================================
# HIGH-LEVEL WORKFLOW ENDPOINTS
# These endpoints orchestrate multiple internal services into single API calls
# =============================================================================


@app.post("/process-resume", tags=["Workflow"])
async def process_resume(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    role_id: str = Form(...),
    email: str = Form(None),
):
    """
    High-level workflow endpoint to process a resume in one call.
    
    Orchestrates: duplicate check → upload → extract → AI analyze → score → save candidate
    """
    print("=" * 60)
    print("[PROCESS-RESUME] Upload started")
    print(f"[PROCESS-RESUME] File name: {file.filename}")
    print(f"[PROCESS-RESUME] Content type: {file.content_type}")
    print(f"[PROCESS-RESUME] User ID: {user_id}")
    print(f"[PROCESS-RESUME] Role ID: {role_id}")
    print(f"[PROCESS-RESUME] Email: {email}")
    print("=" * 60)
    
    # Step 0.1: Validate UUID format for user_id and role_id
    print("[STEP 0.1] Validating UUID format...")
    try:
        # Validate user_id is a valid UUID
        uuid.UUID(str(user_id))
        print(f"[STEP 0.1] user_id is valid UUID: {user_id}")
    except (ValueError, AttributeError) as e:
        print(f"[STEP 0.1] ERROR: Invalid user_id format: {user_id}")
        return {
            "success": False,
            "error": f"Invalid user ID format. Expected UUID, got: {user_id}",
        }
    
    try:
        # Validate role_id is a valid UUID
        uuid.UUID(str(role_id))
        print(f"[STEP 0.1] role_id is valid UUID: {role_id}")
    except (ValueError, AttributeError) as e:
        print(f"[STEP 0.1] ERROR: Invalid role_id format: {role_id}")
        return {
            "success": False,
            "error": f"Invalid role ID format. Expected UUID, got: {role_id}",
        }
    
    # Step 0.2: Verify role_id exists in job_roles table
    print("[STEP 0.2] Verifying role exists in job_roles...")
    try:
        role_check = await supabase_select_by_id("job_roles", role_id)
        print(f"[STEP 0.2] Role check result: {role_check}")
        
        if role_check is None:
            print(f"[STEP 0.2] ERROR: Role ID not found in job_roles: {role_id}")
            return {
                "success": False,
                "error": f"Selected role does not exist. Role ID: {role_id}",
            }
        
        if isinstance(role_check, dict) and role_check.get("error"):
            print(f"[STEP 0.2] ERROR: Failed to check role: {role_check}")
            return {
                "success": False,
                "error": f"Failed to verify role: {role_check.get('error')}",
            }
        
        print(f"[STEP 0.2] Role verified: {role_check.get('role_name', 'Unknown')}")
    except Exception as e:
        print(f"[STEP 0.2] EXCEPTION while checking role: {str(e)}")
        return {
            "success": False,
            "error": f"Role verification failed: {str(e)}",
        }
    
    # Step 0: Check application eligibility based on user's previous applications
    print("[STEP 0] Checking application eligibility...")
    
    # Fetch ALL candidate records for this user (across all roles)
    try:
        all_user_applications = await supabase_select_where("candidates", {
            "user_id": user_id,
        })
        print(f"[STEP 0] All user applications: {len(all_user_applications) if isinstance(all_user_applications, list) else 0}")
    except Exception as e:
        print(f"[STEP 0] ERROR fetching user applications: {str(e)}")
        return {
            "success": False,
            "error": f"Application check failed: {str(e)}",
        }
    
    # Check if user has any completed/approved/interview status (hiring process complete)
    if isinstance(all_user_applications, list) and all_user_applications:
        blocked_statuses = ["completed", "approved", "interview"]
        for app in all_user_applications:
            app_status = app.get("status", "applied")
            if app_status in blocked_statuses:
                print(f"[STEP 0] Blocking - user has completed hiring process with status: {app_status}")
                return {
                    "success": False,
                    "error": "You have already completed the hiring process.",
                    "existing_candidate_id": app.get("id"),
                    "current_status": app_status,
                }
    
    # Check if user has already applied for THIS specific role
    try:
        existing_role_application = await supabase_select_where("candidates", {
            "user_id": user_id,
            "role_id": role_id,
        })
        print(f"[STEP 0] Existing application for this role: {existing_role_application}")
    except Exception as e:
        print(f"[STEP 0] ERROR checking role application: {str(e)}")
        return {
            "success": False,
            "error": f"Role application check failed: {str(e)}",
        }
    
    if isinstance(existing_role_application, list) and existing_role_application:
        for app in existing_role_application:
            app_status = app.get("status", "applied")
            
            # Block if not rejected - already in progress or completed for this role
            if app_status != "rejected":
                print(f"[STEP 0] Blocking - already applied for this role with status: {app_status}")
                return {
                    "success": False,
                    "error": "You have already applied for this role.",
                    "existing_candidate_id": app.get("id"),
                    "current_status": app_status,
                }
            
            # If rejected for this role, block - can only apply to DIFFERENT roles
            print(f"[STEP 0] Blocking - already rejected for this same role")
            return {
                "success": False,
                "error": "You were previously rejected for this role. Please apply for a different role.",
                "existing_candidate_id": app.get("id"),
            }
    
    print("[STEP 0] Eligibility check passed - proceeding with new application...")
    
    # Step 1: Read file bytes
    print("[STEP 1] Reading file bytes...")
    try:
        file_bytes = await file.read()
        print(f"[STEP 1] File read successful, size: {len(file_bytes)} bytes")
        
        if len(file_bytes) == 0:
            print("[STEP 1] ERROR: File is empty!")
            return {
                "success": False,
                "error": "Uploaded file is empty or could not be read",
            }
    except Exception as e:
        print(f"[STEP 1] ERROR reading file: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to read uploaded file: {str(e)}",
        }

    # Step 2: Extract text from PDF
    print("[STEP 2] Extracting text from PDF...")
    try:
        resume_text = extract_text_from_pdf(file_bytes)
        print(f"[STEP 2] Extracted text length: {len(resume_text) if resume_text else 0} chars")
        print(f"[STEP 2] Text preview: {resume_text[:200] if resume_text else 'NONE'}...")
        
        if not resume_text or len(resume_text) < 10:
            print("[STEP 2] ERROR: Resume text extraction failed or returned empty")
            return {
                "success": False,
                "error": "Resume text extraction failed - could not read PDF content",
            }
    except Exception as e:
        print(f"[STEP 2] ERROR extracting text: {str(e)}")
        return {
            "success": False,
            "error": f"PDF text extraction failed: {str(e)}",
        }

    # Step 3: Analyze with AI
    print("[STEP 3] Analyzing resume with AI...")
    try:
        ai_data = await analyze_resume_with_ai(resume_text)
        print(f"[STEP 3] AI analysis result: {ai_data}")
        
        if isinstance(ai_data, dict) and ai_data.get("error"):
            print(f"[STEP 3] ERROR: AI analysis failed - {ai_data}")
            return {
                "success": False,
                "error": "AI analysis failed",
                "details": ai_data,
            }
    except Exception as e:
        print(f"[STEP 3] ERROR in AI analysis: {str(e)}")
        return {
            "success": False,
            "error": f"AI analysis exception: {str(e)}",
        }

    # Step 4: Calculate resume score
    print("[STEP 4] Calculating resume score...")
    try:
        score_data = calculate_resume_score(ai_data)
        print(f"[STEP 4] Score data: {score_data}")
    except Exception as e:
        print(f"[STEP 4] ERROR calculating score: {str(e)}")
        return {
            "success": False,
            "error": f"Resume scoring failed: {str(e)}",
        }

    # Step 5: Generate unique filename and upload to storage
    print("[STEP 5] Uploading file to storage...")
    try:
        file_extension = file.filename.split(".")[-1] if file.filename else "pdf"
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        print(f"[STEP 5] Generated filename: {unique_filename}")
        
        upload_result = await upload_resume(file_bytes, unique_filename)
        print(f"[STEP 5] Upload result: {upload_result}")

        if not isinstance(upload_result, str):
            print(f"[STEP 5] ERROR: File upload failed - {upload_result}")
            return {
                "success": False,
                "error": "File upload to storage failed",
                "details": upload_result,
            }
    except Exception as e:
        print(f"[STEP 5] ERROR uploading file: {str(e)}")
        return {
            "success": False,
            "error": f"File upload exception: {str(e)}",
        }

    # Step 6: Save candidate to database with all fields
    print("[STEP 6] Saving candidate to database...")
    candidate_payload = {
        "resume_file_path": upload_result,
        "skills": ai_data.get("skills", []),
        "experience_level": ai_data.get("experience_level"),
        "experience_summary": ai_data.get("experience_summary"),
        "resume_score": score_data.get("resume_score"),
        "status": "applied",
        "user_id": user_id,
        "role_id": role_id,
        # Note: email is NOT included - identity is based on user_id only
    }
    print(f"[STEP 6] Candidate payload: {candidate_payload}")
    
    try:
        candidate_record = await save_candidate(candidate_payload)
        print(f"[STEP 6] Save result: {candidate_record}")

        if isinstance(candidate_record, dict) and candidate_record.get("error"):
            error_details = candidate_record.get("details", candidate_record.get("error"))
            print(f"[STEP 6] ERROR: Failed to save candidate - {candidate_record}")
            return {
                "success": False,
                "error": f"Failed to save candidate: {error_details}",
                "details": candidate_record,
            }
    except Exception as e:
        print(f"[STEP 6] EXCEPTION saving candidate: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": f"Candidate save exception: {str(e)}",
        }

    print(f"[PROCESS-RESUME] SUCCESS! Candidate ID: {candidate_record.get('id')}")
    print("=" * 60)
    
    return {
        "success": True,
        "candidate_id": candidate_record.get("id"),
    }


@app.post("/screen-candidate/{candidate_id}/{role_id}", tags=["Workflow"])
async def screen_candidate(candidate_id: str, role_id: str):
    """
    High-level workflow endpoint to screen a candidate against a job role.
    
    Orchestrates: fetch candidate → fetch role → evaluate → generate feedback → save evaluation
    
    Returns qualification result with feedback.
    """
    # Step 1: Fetch candidate from database
    candidate = await supabase_select_by_id("candidates", candidate_id)

    if candidate is None:
        return {
            "success": False,
            "error": f"Candidate with id {candidate_id} not found",
        }

    if isinstance(candidate, dict) and candidate.get("error"):
        return {
            "success": False,
            "error": candidate,
        }

    # Step 2: Fetch job role from database
    job_role = await supabase_select_by_id("job_roles", role_id)

    if job_role is None:
        return {
            "success": False,
            "error": f"Job role with id {role_id} not found",
        }

    if isinstance(job_role, dict) and job_role.get("error"):
        return {
            "success": False,
            "error": job_role,
        }

    # Step 3: Run qualification evaluation
    evaluation_result = evaluate_candidate_for_role(
        candidate_ai_data={
            "skills": candidate.get("skills", []),
            "experience_level": candidate.get("experience_level", "fresher"),
            "resume_score": candidate.get("resume_score", 0),
        },
        job_role=job_role,
    )

    # Step 4: Generate AI-powered feedback
    role_name = job_role.get("role_name", "the position")
    ai_feedback = await generate_candidate_feedback(evaluation_result, role_name)
    evaluation_result["feedback"] = ai_feedback

    # Step 5: Save evaluation to database
    evaluation_record = await save_evaluation({
        "candidate_id": candidate_id,
        "role_id": role_id,
        "qualified": evaluation_result["qualified"],
        "matched_skills": evaluation_result["matched_skills"],
        "missing_skills": evaluation_result["missing_skills"],
        "feedback": ai_feedback,
    })

    evaluation_id = None
    if isinstance(evaluation_record, dict) and not evaluation_record.get("error"):
        evaluation_id = evaluation_record.get("id")

    # Step 6: Update candidate status based on qualification result
    new_status = "qualified" if evaluation_result["qualified"] else "rejected"
    await supabase_update_by_id("candidates", candidate_id, {"status": new_status})

    return {
        "success": True,
        "evaluation_id": evaluation_id,
        "qualified": evaluation_result["qualified"],
        "feedback": ai_feedback,
        "details": {
            "matched_skills": evaluation_result["matched_skills"],
            "missing_skills": evaluation_result["missing_skills"],
            "skill_match_ratio": evaluation_result["skill_match_ratio"],
            "candidate_level": evaluation_result["candidate_level"],
            "required_level": evaluation_result["required_level"],
        },
    }


# =============================================================================
# INTERNAL UTILITY ENDPOINTS
# These endpoints expose individual services for granular control
# =============================================================================


@app.post("/upload-resume", tags=["Internal"])
async def upload_resume_endpoint(file: UploadFile = File(...)):
    """
    Upload a resume PDF to Supabase Storage, extract text, and analyze with AI.
    """
    # Read file bytes
    file_bytes = await file.read()

    # Extract text from PDF
    resume_text = extract_text_from_pdf(file_bytes)

    # Analyze with AI
    ai_data = await analyze_resume_with_ai(resume_text)

    # Calculate resume score
    score_data = calculate_resume_score(ai_data)

    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if file.filename else "pdf"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"

    # Upload to storage
    result = await upload_resume(file_bytes, unique_filename)

    if isinstance(result, str):
        # Save candidate to database
        candidate_record = await save_candidate({
            "resume_file_path": result,
            "skills": ai_data.get("skills", []),
            "experience_level": ai_data.get("experience_level"),
            "experience_summary": ai_data.get("experience_summary"),
            "resume_score": score_data.get("total_score"),
        })

        candidate_id = None
        if isinstance(candidate_record, dict) and not candidate_record.get("error"):
            candidate_id = candidate_record.get("id")

        return {
            "success": True,
            "candidate_id": candidate_id,
            "file_path": result,
            "original_filename": file.filename,
            "extracted_text_preview": resume_text[:1000],
            "ai_analysis": ai_data,
            "resume_scoring": score_data,
        }
    else:
        return {
            "success": False,
            "error": result,
        }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
