"""
AI-Powered Hiring Evaluation System - Backend API
"""
import os
import uuid
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.supabase_client import (
    supabase_select, 
    supabase_select_by_id, 
    supabase_insert, 
    supabase_update_by_id,
    supabase_select_where_in,
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
        print(f"⚠️  Warning: Missing environment variables: {', '.join(missing_vars)}")
    else:
        print("✅ All environment variables loaded successfully")
    
    yield
    
    # Shutdown: Cleanup resources if needed
    print("🛑 Application shutting down...")


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


class TestAnswer(BaseModel):
    question_id: str
    selected_option: str


class TestSubmission(BaseModel):
    test_id: str
    answers: list[TestAnswer]


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
    new_status = "Shortlisted" if interview_readiness >= 75 else "Tested"
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
async def process_resume(file: UploadFile = File(...)):
    """
    High-level workflow endpoint to process a resume in one call.
    
    Orchestrates: upload → extract → AI analyze → score → save candidate
    
    Returns only the candidate_id for subsequent operations.
    """
    # Step 1: Read file bytes
    file_bytes = await file.read()

    # Step 2: Extract text from PDF
    resume_text = extract_text_from_pdf(file_bytes)

    # Step 3: Analyze with AI
    ai_data = await analyze_resume_with_ai(resume_text)
    
    if isinstance(ai_data, dict) and ai_data.get("error"):
        return {
            "success": False,
            "error": "AI analysis failed",
            "details": ai_data,
        }

    # Step 4: Calculate resume score
    score_data = calculate_resume_score(ai_data)

    # Step 5: Generate unique filename and upload to storage
    file_extension = file.filename.split(".")[-1] if file.filename else "pdf"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    upload_result = await upload_resume(file_bytes, unique_filename)

    if not isinstance(upload_result, str):
        return {
            "success": False,
            "error": "File upload failed",
            "details": upload_result,
        }

    # Step 6: Save candidate to database with status "Applied"
    candidate_record = await save_candidate({
        "resume_file_path": upload_result,
        "skills": ai_data.get("skills", []),
        "experience_level": ai_data.get("experience_level"),
        "experience_summary": ai_data.get("experience_summary"),
        "resume_score": score_data.get("resume_score"),
        "status": "Applied",
    })

    if isinstance(candidate_record, dict) and candidate_record.get("error"):
        return {
            "success": False,
            "error": "Failed to save candidate",
            "details": candidate_record,
        }

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
    new_status = "Screened" if evaluation_result["qualified"] else "Rejected"
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
