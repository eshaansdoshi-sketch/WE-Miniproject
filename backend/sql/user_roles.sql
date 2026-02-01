-- User Roles Table for Authentication
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'applicant')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own role
CREATE POLICY "Users can read own role" ON user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can manage all
CREATE POLICY "Service role can manage user_roles" ON user_roles
    FOR ALL
    USING (true)
    WITH CHECK (true);
