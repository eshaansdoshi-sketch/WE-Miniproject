"""
Test Scorer - Scores test submissions by comparing answers.
"""
from services.supabase_client import supabase_select_where_in


async def score_test_submission(candidate_id: str, answers: list) -> dict:
    """
    Scores a test submission by comparing answers to correct answers.

    Args:
        candidate_id: The ID of the candidate submitting the test.
        answers: List of answer dictionaries in format:
            [
                {"question_id": "uuid", "selected_option": "A"},
                ...
            ]

    Returns:
        Dictionary with scoring results:
        {
            "score": int (0-100),
            "correct_answers": int,
            "total_questions": int,
            "answer_results": [
                {"question_id": "...", "selected_option": "...", "is_correct": bool},
                ...
            ]
        }
    """
    if not answers:
        return {
            "score": 0,
            "correct_answers": 0,
            "total_questions": 0,
            "answer_results": [],
        }

    # Extract question IDs from submitted answers
    question_ids = [answer.get("question_id") for answer in answers if answer.get("question_id")]

    if not question_ids:
        return {
            "score": 0,
            "correct_answers": 0,
            "total_questions": 0,
            "answer_results": [],
        }

    # Fetch correct answers from test_questions table
    questions = await supabase_select_where_in(
        "test_questions",
        "id",
        question_ids
    )

    if isinstance(questions, dict) and questions.get("error"):
        return {
            "error": True,
            "details": questions,
        }

    # Build a map of question_id -> correct_answer
    correct_answer_map = {}
    for question in questions:
        q_id = question.get("id")
        correct_answer_map[q_id] = question.get("correct_answer")

    # Compare each answer and count correct
    correct_count = 0
    answer_results = []

    for answer in answers:
        question_id = answer.get("question_id")
        selected_option = answer.get("selected_option")
        correct_answer = correct_answer_map.get(question_id)

        is_correct = selected_option == correct_answer

        if is_correct:
            correct_count += 1

        answer_results.append({
            "question_id": question_id,
            "selected_option": selected_option,
            "is_correct": is_correct,
        })

    # Calculate score as percentage
    total_questions = len(answers)
    score = round((correct_count / total_questions) * 100) if total_questions > 0 else 0

    return {
        "score": score,
        "correct_answers": correct_count,
        "total_questions": total_questions,
        "answer_results": answer_results,
    }
