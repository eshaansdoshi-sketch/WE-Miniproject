-- Add 'questions' column to 'test_attempts' table to store generated test questions as JSONB
ALTER TABLE test_attempts 
ADD COLUMN IF NOT EXISTS questions JSONB;

-- Comment on column
COMMENT ON COLUMN test_attempts.questions IS 'Stores the list of generated questions for this test attempt.';
