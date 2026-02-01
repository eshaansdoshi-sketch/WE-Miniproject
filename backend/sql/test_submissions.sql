-- Test Submissions Tables
-- Run this SQL in Supabase SQL Editor

-- Table to store test attempts/submissions
CREATE TABLE test_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id uuid,
    test_id text,
    score int,
    total_questions int,
    created_at timestamp DEFAULT now()
);

-- Table to store individual question answers
CREATE TABLE test_answers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id uuid REFERENCES test_attempts(id),
    question_id uuid,
    selected_option text,
    is_correct boolean
);

-- Index for faster lookups
CREATE INDEX idx_test_attempts_candidate ON test_attempts(candidate_id);
CREATE INDEX idx_test_answers_attempt ON test_answers(attempt_id);
