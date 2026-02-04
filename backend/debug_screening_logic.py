
import sys
import os

# Add the current directory to sys.path to make imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.qualification_engine import evaluate_candidate_for_role

def run_debug():
    print("=== DEBUGGING QUALIFICATION LOGIC ===")

    # 1. Define a Mock Job Role
    job_role = {
        "title": "Software Engineer",
        "required_skills": ["Python", "React", "SQL"],
        "preferred_skills": ["Docker", "AWS"],
        "min_experience_level": "mid",
        "min_resume_score": 50,
        "skill_weights": {"Python": 2.0, "React": 1.5} # Optional
    }
    print(f"\nJob Role: {job_role}")

    # 2. Define a "Perfect" Mock Candidate (Should qualify)
    perfect_candidate = {
        "skills": ["Python", "React.js", "PostgreSQL", "Docker", "AWS", "Git"], # Variations to test normalization
        "experience_level": "mid",
        "resume_score": 80,
        "experience_summary": "3 years of experience in software development."
    }
    print(f"\nPerfect Candidate Input: {perfect_candidate}")

    # 3. Define a "Marginal" Mock Candidate (Should generic reject or pass?)
    # Missing SQL, Fresher vs Mid
    marginal_candidate = {
        "skills": ["Python", "JavaScript"], 
        "experience_level": "fresher",
        "resume_score": 40,
        "experience_summary": "New grad."
    }
    print(f"\nMarginal Candidate Input: {marginal_candidate}")

    # 4. Run Evaluation on Perfect Candidate
    print("\n--- Evaluating Perfect Candidate ---")
    result_perfect = evaluate_candidate_for_role(perfect_candidate, job_role)
    print(f"Result: {result_perfect}")
    
    if not result_perfect['qualified']:
        print("FAILED: Perfect candidate was REJECTED.")
        print(f"Reasons: {result_perfect.get('summary')}")
    else:
        print("SUCCESS: Perfect candidate was QUALIFIED.")
        print(f"Match Score: {result_perfect.get('match_score')}")

    # 5. Run Evaluation on Marginal Candidate
    print("\n--- Evaluating Marginal Candidate ---")
    result_marginal = evaluate_candidate_for_role(marginal_candidate, job_role)
    print(f"Result: {result_marginal}")

if __name__ == "__main__":
    run_debug()
