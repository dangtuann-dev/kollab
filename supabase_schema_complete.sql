-- Supabase Comprehensive Database Schema for Agile/Scrum System (AgileFlow)
-- Run this script in the Supabase SQL Editor.

--------------------------------------------------------------------------------
-- Drop existing tables and objects in reverse dependency order for clean setup
--------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.standup_logs CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.user_stories CASCADE;
DROP TABLE IF EXISTS public.sprints CASCADE;
DROP TABLE IF EXISTS public.project_members CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_project_member(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_project_role(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_task_assignment_notification() CASCADE;
DROP FUNCTION IF EXISTS public.handle_comment_notification() CASCADE;
DROP FUNCTION IF EXISTS public.log_task_updates() CASCADE;
DROP FUNCTION IF EXISTS public.log_task_creation() CASCADE;
DROP FUNCTION IF EXISTS public.log_comment_creation() CASCADE;
DROP FUNCTION IF EXISTS public.search_all(text, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_sprint_burndown(uuid) CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. Profiles Table (extends auth.users)
--------------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text,
    avatar_url text,
    bio text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url)
    VALUES (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.email,
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-backfill any existing auth users into public.profiles if missing
INSERT INTO public.profiles (id, full_name, email, avatar_url)
SELECT 
    id, 
    coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 
    email, 
    raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

--------------------------------------------------------------------------------
-- 2. Projects Table
--------------------------------------------------------------------------------
CREATE TABLE public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    color text NOT NULL DEFAULT '#3b82f6',
    owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status text NOT NULL CHECK (status IN ('active', 'archived')) DEFAULT 'active',
    start_date date,
    end_date date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

--------------------------------------------------------------------------------
-- 3. Project Members Table
--------------------------------------------------------------------------------
CREATE TABLE public.project_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('product_owner', 'scrum_master', 'developer')),
    joined_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT unique_project_member UNIQUE (project_id, user_id)
);

--------------------------------------------------------------------------------
-- Helper Functions for RLS Policies
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.project_members
        WHERE project_id = p_project_id AND user_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_project_role(p_project_id uuid, p_user_id uuid)
RETURNS text AS $$
DECLARE
    v_role text;
BEGIN
    SELECT role INTO v_role FROM public.project_members
    WHERE project_id = p_project_id AND user_id = p_user_id;
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--------------------------------------------------------------------------------
-- 4. Sprints Table
--------------------------------------------------------------------------------
CREATE TABLE public.sprints (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name text NOT NULL,
    goal text,
    status text NOT NULL CHECK (status IN ('planning', 'active', 'completed')) DEFAULT 'planning',
    start_date date,
    end_date date,
    velocity integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Constraint: Only 1 active sprint per project at a time
CREATE UNIQUE INDEX unique_active_sprint ON public.sprints (project_id) 
WHERE (status = 'active');

--------------------------------------------------------------------------------
-- 5. User Stories Table (User Stories / Product Backlog Items)
--------------------------------------------------------------------------------
CREATE TABLE public.user_stories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    sprint_id uuid REFERENCES public.sprints(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    acceptance_criteria text,
    story_points integer CHECK (story_points >= 0),
    priority text NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
    status text NOT NULL CHECK (status IN ('backlog', 'sprint', 'done')) DEFAULT 'backlog',
    assignee_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    order_index integer NOT NULL DEFAULT 0,
    labels text,
    fts tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))) STORED,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

--------------------------------------------------------------------------------
-- 6. Tasks Table (Sub-tasks of User Story)
--------------------------------------------------------------------------------
CREATE TABLE public.tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_story_id uuid NOT NULL REFERENCES public.user_stories(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    status text NOT NULL CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo',
    assignee_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    estimate_hours numeric(5,2) DEFAULT 0.00,
    actual_hours numeric(5,2) DEFAULT 0.00,
    story_points integer CHECK (story_points >= 0),
    priority text CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
    labels text,
    deadline date,
    fts tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))) STORED,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

--------------------------------------------------------------------------------
-- 7. Comments Table
--------------------------------------------------------------------------------
CREATE TABLE public.comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_story_id uuid REFERENCES public.user_stories(id) ON DELETE CASCADE,
    task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

--------------------------------------------------------------------------------
-- 8. Daily Standup Logs table
--------------------------------------------------------------------------------
CREATE TABLE public.standup_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    yesterday text NOT NULL,
    today text NOT NULL,
    blockers text,
    log_date date NOT NULL DEFAULT current_date,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT unique_project_user_date UNIQUE (project_id, user_id, log_date)
);

--------------------------------------------------------------------------------
-- 9. Notifications Table
--------------------------------------------------------------------------------
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('assignment', 'comment', 'sprint_warning', 'other')) DEFAULT 'other',
    title text NOT NULL,
    body text,
    link text,
    read_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

--------------------------------------------------------------------------------
-- 10. Activity Logs Table
--------------------------------------------------------------------------------
CREATE TABLE public.activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    action text NOT NULL CHECK (action IN ('created', 'status_changed', 'assigned', 'commented', 'field_updated')),
    old_value jsonb,
    new_value jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

--------------------------------------------------------------------------------
-- Auto-update updated_at triggers
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    new.updated_at = now();
    RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sprints_modtime BEFORE UPDATE ON public.sprints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stories_modtime BEFORE UPDATE ON public.user_stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_modtime BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_modtime BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------------------------------------
-- Performance & Full-Text Search Indexes
--------------------------------------------------------------------------------
CREATE INDEX idx_project_members_user ON public.project_members(user_id);
CREATE INDEX idx_project_members_project ON public.project_members(project_id);
CREATE INDEX idx_sprints_project ON public.sprints(project_id);
CREATE INDEX idx_user_stories_project ON public.user_stories(project_id);
CREATE INDEX idx_user_stories_sprint ON public.user_stories(sprint_id);
CREATE INDEX idx_user_stories_assignee ON public.user_stories(assignee_id);
CREATE INDEX idx_tasks_user_story ON public.tasks(user_story_id);
CREATE INDEX idx_comments_user_story ON public.comments(user_story_id);
CREATE INDEX idx_user_stories_fts ON public.user_stories USING gin(fts);
CREATE INDEX idx_tasks_fts ON public.tasks USING gin(fts);

--------------------------------------------------------------------------------
-- Triggers for Notifications and Activity Logs
--------------------------------------------------------------------------------

-- Task assignment notification trigger
CREATE OR REPLACE FUNCTION public.handle_task_assignment_notification()
RETURNS trigger AS $$
DECLARE
    v_project_id uuid;
BEGIN
    IF (TG_OP = 'INSERT' AND new.assignee_id IS NOT NULL) OR 
       (TG_OP = 'UPDATE' AND new.assignee_id IS NOT NULL AND (old.assignee_id IS NULL OR old.assignee_id != new.assignee_id)) THEN
        
        SELECT project_id INTO v_project_id FROM public.user_stories WHERE id = new.user_story_id;
        
        INSERT INTO public.notifications (user_id, type, title, body, link)
        VALUES (
            new.assignee_id,
            'assignment',
            'Bạn đã được phân công nhiệm vụ mới',
            'Nhiệm vụ "' || new.title || '" đã được phân công cho bạn.',
            '/projects/' || v_project_id || '/board'
        );
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_task_assigned
    AFTER INSERT OR UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_task_assignment_notification();


-- Comment added notification trigger
CREATE OR REPLACE FUNCTION public.handle_comment_notification()
RETURNS trigger AS $$
DECLARE
    v_recipient_id uuid;
    v_project_id uuid;
    v_task_title text;
BEGIN
    IF new.task_id IS NOT NULL THEN
        SELECT assignee_id, title, (SELECT project_id FROM public.user_stories WHERE id = user_story_id) 
        INTO v_recipient_id, v_task_title, v_project_id
        FROM public.tasks WHERE id = new.task_id;
        
        IF v_recipient_id IS NOT NULL AND v_recipient_id != new.user_id THEN
            INSERT INTO public.notifications (user_id, type, title, body, link)
            VALUES (
                v_recipient_id,
                'comment',
                'Bình luận mới trên công việc của bạn',
                'Một bình luận mới đã được thêm vào công việc "' || v_task_title || '".',
                '/projects/' || v_project_id || '/board'
            );
        END IF;
    ELSIF new.user_story_id IS NOT NULL THEN
        SELECT assignee_id, title, project_id 
        INTO v_recipient_id, v_task_title, v_project_id
        FROM public.user_stories WHERE id = new.user_story_id;
        
        IF v_recipient_id IS NOT NULL AND v_recipient_id != new.user_id THEN
            INSERT INTO public.notifications (user_id, type, title, body, link)
            VALUES (
                v_recipient_id,
                'comment',
                'Bình luận mới trên User Story của bạn',
                'Một bình luận mới đã được thêm vào story "' || v_task_title || '".',
                '/projects/' || v_project_id || '/backlog'
            );
        END IF;
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_added
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_comment_notification();


-- Log task updates trigger
CREATE OR REPLACE FUNCTION public.log_task_updates()
RETURNS trigger AS $$
DECLARE
    v_action text;
    v_old jsonb;
    v_new jsonb;
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        v_user_id := new.assignee_id;
    END IF;
    
    -- Status change logging
    IF old.status IS DISTINCT FROM new.status THEN
        INSERT INTO public.activity_logs (task_id, user_id, action, old_value, new_value)
        VALUES (new.id, v_user_id, 'status_changed', jsonb_build_object('status', old.status), jsonb_build_object('status', new.status));
    END IF;
    
    -- Assignee change logging
    IF old.assignee_id IS DISTINCT FROM new.assignee_id THEN
        INSERT INTO public.activity_logs (task_id, user_id, action, old_value, new_value)
        VALUES (new.id, v_user_id, 'assigned', jsonb_build_object('assignee_id', old.assignee_id), jsonb_build_object('assignee_id', new.assignee_id));
    END IF;

    -- Fields changes logging
    IF old.title IS DISTINCT FROM new.title OR
       old.description IS DISTINCT FROM new.description OR
       old.estimate_hours IS DISTINCT FROM new.estimate_hours OR
       old.actual_hours IS DISTINCT FROM new.actual_hours OR
       old.story_points IS DISTINCT FROM new.story_points OR
       old.priority IS DISTINCT FROM new.priority OR
       old.labels IS DISTINCT FROM new.labels OR
       old.deadline IS DISTINCT FROM new.deadline THEN
       
        INSERT INTO public.activity_logs (task_id, user_id, action, old_value, new_value)
        VALUES (
            new.id, 
            v_user_id, 
            'field_updated', 
            jsonb_build_object(
                'title', old.title,
                'description', old.description,
                'estimate_hours', old.estimate_hours,
                'actual_hours', old.actual_hours,
                'story_points', old.story_points,
                'priority', old.priority,
                'labels', old.labels,
                'deadline', old.deadline
            ), 
            jsonb_build_object(
                'title', new.title,
                'description', new.description,
                'estimate_hours', new.estimate_hours,
                'actual_hours', new.actual_hours,
                'story_points', new.story_points,
                'priority', new.priority,
                'labels', new.labels,
                'deadline', new.deadline
            )
        );
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_task_updated
    AFTER UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.log_task_updates();


-- Log task creation trigger
CREATE OR REPLACE FUNCTION public.log_task_creation()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.activity_logs (task_id, user_id, action, new_value)
    VALUES (new.id, auth.uid(), 'created', jsonb_build_object('title', new.title, 'status', new.status));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_task_created
    AFTER INSERT ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.log_task_creation();


-- Log comment creation trigger
CREATE OR REPLACE FUNCTION public.log_comment_creation()
RETURNS trigger AS $$
BEGIN
    IF new.task_id IS NOT NULL THEN
        INSERT INTO public.activity_logs (task_id, user_id, action, new_value)
        VALUES (new.task_id, new.user_id, 'commented', jsonb_build_object('comment_id', new.id, 'content', substring(new.content from 1 for 50)));
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_logged
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.log_comment_creation();

--------------------------------------------------------------------------------
-- Row Level Security (RLS) Policies
--------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow individual update to own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow individual insert to own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Projects Policies
CREATE POLICY "Allow members to view project" ON public.projects FOR SELECT USING (auth.role() = 'authenticated' AND (owner_id = auth.uid() OR public.is_project_member(id, auth.uid())));
CREATE POLICY "Allow authenticated users to create project" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND owner_id = auth.uid());
CREATE POLICY "Allow owner to update project" ON public.projects FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Allow owner to delete project" ON public.projects FOR DELETE USING (auth.uid() = owner_id);

-- 3. Project Members Policies
CREATE POLICY "Allow members to view team list" ON public.project_members FOR SELECT USING (auth.role() = 'authenticated' AND public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Allow Product Owners to manage project members" ON public.project_members FOR ALL USING (auth.role() = 'authenticated' AND (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()) OR public.get_project_role(project_id, auth.uid()) = 'product_owner'));

-- 4. Sprints Policies
CREATE POLICY "Allow members to view sprints" ON public.sprints FOR SELECT USING (auth.role() = 'authenticated' AND public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Allow Scrum Master and Product Owner to manage sprints" ON public.sprints FOR ALL USING (auth.role() = 'authenticated' AND (public.get_project_role(project_id, auth.uid()) IN ('scrum_master', 'product_owner') OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())));

-- 5. User Stories Policies
CREATE POLICY "Allow members to view user_stories" ON public.user_stories FOR SELECT USING (auth.role() = 'authenticated' AND public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Allow PO to insert/delete user_stories" ON public.user_stories FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND (public.get_project_role(project_id, auth.uid()) = 'product_owner' OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())));
CREATE POLICY "Allow members to update user_stories" ON public.user_stories FOR UPDATE USING (auth.role() = 'authenticated' AND public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Allow PO to delete user_stories" ON public.user_stories FOR DELETE USING (auth.role() = 'authenticated' AND (public.get_project_role(project_id, auth.uid()) = 'product_owner' OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())));

-- 6. Tasks Policies
CREATE POLICY "Allow members to view tasks" ON public.tasks FOR SELECT USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.user_stories s WHERE s.id = user_story_id AND public.is_project_member(s.project_id, auth.uid())));
CREATE POLICY "Allow members to manage tasks" ON public.tasks FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.user_stories s WHERE s.id = user_story_id AND public.is_project_member(s.project_id, auth.uid())));

-- 7. Comments Policies
CREATE POLICY "Allow members to view comments" ON public.comments FOR SELECT USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.user_stories s WHERE s.id = user_story_id AND public.is_project_member(s.project_id, auth.uid())));
CREATE POLICY "Allow members to create comments" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.user_stories s WHERE s.id = user_story_id AND public.is_project_member(s.project_id, auth.uid())));
CREATE POLICY "Allow author to update their comments" ON public.comments FOR UPDATE USING (auth.role() = 'authenticated' AND user_id = auth.uid());
CREATE POLICY "Allow author or PO to delete comments" ON public.comments FOR DELETE USING (auth.role() = 'authenticated' AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_stories s JOIN public.projects p ON s.project_id = p.id WHERE s.id = user_story_id AND (p.owner_id = auth.uid() OR public.get_project_role(p.id, auth.uid()) = 'product_owner'))));

-- 8. Standup Logs Policies
CREATE POLICY "Allow members to view standup logs" ON public.standup_logs FOR SELECT USING (auth.role() = 'authenticated' AND public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Allow members to insert standup logs" ON public.standup_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id AND public.is_project_member(project_id, auth.uid()));

-- 9. Notifications Policies
CREATE POLICY "Allow users to view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow system/users to insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- 10. Activity Logs Policies
CREATE POLICY "Allow members to view activity logs" ON public.activity_logs FOR SELECT USING (auth.role() = 'authenticated');

--------------------------------------------------------------------------------
-- Database RPC (Remote Procedure Call) Functions
--------------------------------------------------------------------------------

-- Global Search function
CREATE OR REPLACE FUNCTION public.search_all(search_query text, p_project_id uuid)
RETURNS TABLE (
    id uuid,
    type text,
    title text,
    description text,
    project_id uuid,
    extra_info jsonb
) AS $$
BEGIN
    RETURN QUERY
    -- Search Projects
    SELECT 
        p.id,
        'project'::text as type,
        p.name as title,
        p.description,
        p.id as project_id,
        jsonb_build_object('color', p.color) as extra_info
    FROM public.projects p
    WHERE p.id = p_project_id AND (p.name ILIKE '%' || search_query || '%')
    
    UNION ALL
    
    -- Search User Stories
    SELECT 
        us.id,
        'user_story'::text as type,
        us.title,
        us.description,
        us.project_id,
        jsonb_build_object('priority', us.priority, 'status', us.status, 'story_points', us.story_points) as extra_info
    FROM public.user_stories us
    WHERE us.project_id = p_project_id AND (us.fts @@ to_tsquery('simple', search_query) OR us.title ILIKE '%' || search_query || '%')
    
    UNION ALL
    
    -- Search Tasks
    SELECT 
        t.id,
        'task'::text as type,
        t.title,
        t.description,
        us.project_id,
        jsonb_build_object('status', t.status, 'story_title', us.title) as extra_info
    FROM public.tasks t
    JOIN public.user_stories us ON t.user_story_id = us.id
    WHERE us.project_id = p_project_id AND (t.fts @@ to_tsquery('simple', search_query) OR t.title ILIKE '%' || search_query || '%');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Sprint Burndown Data Generator function
CREATE OR REPLACE FUNCTION public.get_sprint_burndown(p_sprint_id uuid)
RETURNS TABLE (
    day text,
    ideal numeric,
    actual numeric
) AS $$
DECLARE
    v_start_date date;
    v_end_date date;
    v_total_points numeric;
    v_days_count integer;
    v_decrement numeric;
BEGIN
    -- Get sprint dates
    SELECT start_date, end_date INTO v_start_date, v_end_date
    FROM public.sprints
    WHERE id = p_sprint_id;
    
    IF v_start_date IS NULL OR v_end_date IS NULL THEN
        RETURN;
    END IF;
    
    -- Get total story points
    SELECT coalesce(sum(story_points), 0) INTO v_total_points
    FROM public.user_stories
    WHERE sprint_id = p_sprint_id;
    
    v_days_count := (v_end_date - v_start_date) + 1;
    IF v_days_count <= 1 THEN
        v_days_count := 2;
    END IF;
    
    v_decrement := v_total_points::numeric / (v_days_count - 1);
    
    RETURN QUERY
    WITH RECURSIVE calendar AS (
        SELECT v_start_date AS date_val, 0 AS idx
        UNION ALL
        SELECT (date_val + 1)::date, idx + 1
        FROM calendar
        WHERE date_val < v_end_date
    ),
    completed_points AS (
        SELECT 
            c.date_val,
            coalesce(sum(us.story_points), 0) as done_points
        FROM calendar c
        LEFT JOIN public.user_stories us ON us.sprint_id = p_sprint_id 
            AND us.status = 'done' 
            AND us.updated_at::date <= c.date_val
        GROUP BY c.date_val
    )
    SELECT 
        to_char(calendar.date_val, 'Mon DD') AS day,
        round(greatest(0, v_total_points - (calendar.idx * v_decrement)), 1) AS ideal,
        CASE 
            WHEN cp.date_val > current_date THEN NULL
            ELSE greatest(0, v_total_points - cp.done_points)::numeric
        END AS actual
    FROM calendar
    JOIN completed_points cp ON calendar.date_val = cp.date_val
    ORDER BY calendar.date_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
