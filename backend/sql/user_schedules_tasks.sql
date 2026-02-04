-- Create Enums if they don't exist
-- Note: Supabase/Postgres might need checking if type exists first, but for this script we assume fresh creation or manual execution.

-- Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')),
    assigned_by UUID REFERENCES auth.users(id), -- Assuming auth.users is the user table
    assigned_to UUID REFERENCES auth.users(id),
    start_datetime TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Submitted', 'Overdue')),
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedules Table
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES auth.users(id),
    manager_id UUID REFERENCES auth.users(id),
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    work_type TEXT CHECK (work_type IN ('Office', 'Remote', 'Field')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    message TEXT NOT NULL,
    type TEXT, -- e.g., 'task_assigned', 'schedule_update'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policies (Row Level Security) - Basic Setup
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own tasks/schedules/notifications
-- Note: You'll need to run specific Policy creation commands in Supabase SQL Editor as 'postgres' role.
-- Example:
-- CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = assigned_to);
