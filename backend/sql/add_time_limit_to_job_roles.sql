-- Add time_limit column to job_roles table

ALTER TABLE job_roles 
ADD COLUMN IF NOT EXISTS time_limit INTEGER DEFAULT 3;
