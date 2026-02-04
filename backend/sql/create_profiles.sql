-- Create Profiles Table for User Information
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'manager', 'employee', 'applicant')),
    department TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users (so Admin/Manager can see lists)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Update user_roles check constraint to allow new roles
-- Note: Modifying constraints in Postgres usually requires dropping the old one.
-- DO THIS CAREFULLY. If constraint name is unknown, we might just skip or rely on profiles.
-- Assuming 'user_roles_role_check' is the name.
-- ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
-- ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('admin', 'manager', 'employee', 'applicant'));

-- SEED DATA for Demo (Optional, assuming these UUIDs exist or just for structure)
-- In a real app, these would be inserted on Register trigger.
