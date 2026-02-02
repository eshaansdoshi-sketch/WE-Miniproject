-- Complete Candidates Table Setup
-- Run this SQL in your Supabase SQL Editor to create/fix the candidates table

-- Create candidates table if it doesn't exist
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_file_path TEXT,
    skills JSONB DEFAULT '[]',
    experience_level TEXT,
    experience_summary TEXT,
    resume_score INTEGER,
    status TEXT DEFAULT 'applied',
    user_id UUID,
    role_id UUID REFERENCES job_roles(id),
    email TEXT,
    admin_notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if they don't exist (for existing tables)
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_file_path TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS experience_level TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS experience_summary TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_score INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'applied';
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS role_id UUID;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix the status constraint to include all statuses used by the application
-- First, update any invalid statuses to 'applied'
UPDATE candidates SET status = 'applied' 
WHERE status IS NULL OR status NOT IN ('applied', 'qualified', 'rejected', 'approved', 'interview', 'hired');

-- Drop and recreate the constraint
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_status_check;
ALTER TABLE candidates ADD CONSTRAINT candidates_status_check 
  CHECK (status IN ('applied', 'qualified', 'rejected', 'approved', 'interview', 'hired'));

-- Create index for duplicate check performance
CREATE INDEX IF NOT EXISTS idx_candidates_user_role ON candidates(user_id, role_id);

-- Enable Row Level Security
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Service role can manage candidates" ON candidates;
CREATE POLICY "Service role can manage candidates" ON candidates
    FOR ALL
    USING (true)
    WITH CHECK (true);
