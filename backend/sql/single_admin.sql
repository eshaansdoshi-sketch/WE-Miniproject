-- Single Admin Enforcement
-- Run this SQL in your Supabase SQL Editor
-- This ensures that only one user can have the 'admin' role in the system.

CREATE UNIQUE INDEX IF NOT EXISTS idx_single_admin ON user_roles (role) WHERE (role = 'admin');
