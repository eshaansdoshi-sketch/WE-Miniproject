-- Job Roles Table for Company Requirements (Updated)
-- Run this SQL in your Supabase SQL Editor
-- If table exists, use ALTER TABLE commands at the bottom

CREATE TABLE IF NOT EXISTS job_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name TEXT NOT NULL,
    required_skills JSONB NOT NULL,
    preferred_skills JSONB DEFAULT '[]',
    min_experience_level TEXT NOT NULL DEFAULT 'junior' CHECK (min_experience_level IN ('junior', 'mid', 'senior')),
    min_resume_score INTEGER DEFAULT 50,
    skill_weights JSONB DEFAULT '{}',
    role_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE job_roles ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
DROP POLICY IF EXISTS "Service role can manage job_roles" ON job_roles;
CREATE POLICY "Service role can manage job_roles" ON job_roles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- If table already exists, run these ALTER commands instead:
-- ALTER TABLE job_roles ADD COLUMN IF NOT EXISTS preferred_skills JSONB DEFAULT '[]';
-- ALTER TABLE job_roles ADD COLUMN IF NOT EXISTS min_experience_level TEXT DEFAULT 'junior';
-- ALTER TABLE job_roles ADD COLUMN IF NOT EXISTS min_resume_score INTEGER DEFAULT 50;
-- ALTER TABLE job_roles DROP CONSTRAINT IF EXISTS job_roles_role_level_check;
-- ALTER TABLE job_roles ADD CONSTRAINT job_roles_min_exp_check CHECK (min_experience_level IN ('junior', 'mid', 'senior'));
