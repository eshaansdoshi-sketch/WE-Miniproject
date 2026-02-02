-- Admin Candidate Review System - Database Migration
-- Run this SQL in your Supabase SQL Editor
-- Adds columns for admin review workflow and duplicate application prevention

-- Add status column with allowed values
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'applied';

-- Add admin notes for HR feedback
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add user_id for duplicate prevention (links to auth.users)
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add role_id to track which role the candidate applied for
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES job_roles(id);

-- Add applied_at timestamp for 30-day reapply policy
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add email for display purposes (optional, from auth user)
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS email TEXT;

-- Add status constraint (run separately if table has invalid data)
-- First update any existing invalid statuses
UPDATE candidates SET status = 'applied' WHERE status IS NULL OR status NOT IN ('applied', 'qualified', 'rejected', 'approved', 'interview', 'hired');

-- Drop constraint if exists and recreate
ALTER TABLE candidates DROP CONSTRAINT IF EXISTS candidates_status_check;
ALTER TABLE candidates ADD CONSTRAINT candidates_status_check 
  CHECK (status IN ('applied', 'qualified', 'rejected', 'approved', 'interview', 'hired'));

-- Create index for duplicate check performance
CREATE INDEX IF NOT EXISTS idx_candidates_user_role ON candidates(user_id, role_id);

-- Enable RLS policy updates for admin access
DROP POLICY IF EXISTS "Admin can manage candidates" ON candidates;
CREATE POLICY "Admin can manage candidates" ON candidates
    FOR ALL
    USING (true)
    WITH CHECK (true);
