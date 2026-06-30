-- Supabase Migration Script for Agile/Scrum Project Management System (AgileFlow)
-- Run this script in the Supabase SQL Editor.

-- Drop tables in reverse dependency order for idempotency
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.is_project_member(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_project_role(uuid, uuid);

DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.user_stories CASCADE;
DROP TABLE IF EXISTS public.sprints CASCADE;
DROP TABLE IF EXISTS public.project_members CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

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
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

--------------------------------------------------------------------------------
-- 7. Comments Table
--------------------------------------------------------------------------------
CREATE TABLE public.comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_story_id uuid NOT NULL REFERENCES public.user_stories(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
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
-- Performance Indexes
--------------------------------------------------------------------------------
CREATE INDEX idx_project_members_user ON public.project_members(user_id);
CREATE INDEX idx_project_members_project ON public.project_members(project_id);
CREATE INDEX idx_sprints_project ON public.sprints(project_id);
CREATE INDEX idx_user_stories_project ON public.user_stories(project_id);
CREATE INDEX idx_user_stories_sprint ON public.user_stories(sprint_id);
CREATE INDEX idx_user_stories_assignee ON public.user_stories(assignee_id);
CREATE INDEX idx_tasks_user_story ON public.tasks(user_story_id);
CREATE INDEX idx_comments_user_story ON public.comments(user_story_id);

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

-- 1. Profiles Policies
CREATE POLICY "Allow public read access to profiles" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow individual update to own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Projects Policies
CREATE POLICY "Allow members to view project" 
    ON public.projects FOR SELECT 
    USING (auth.role() = 'authenticated' AND (owner_id = auth.uid() OR public.is_project_member(id, auth.uid())));

CREATE POLICY "Allow authenticated users to create project" 
    ON public.projects FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated' AND owner_id = auth.uid());

CREATE POLICY "Allow owner to update project" 
    ON public.projects FOR UPDATE 
    USING (auth.uid() = owner_id);

CREATE POLICY "Allow owner to delete project" 
    ON public.projects FOR DELETE 
    USING (auth.uid() = owner_id);

-- 3. Project Members Policies
CREATE POLICY "Allow members to view team list" 
    ON public.project_members FOR SELECT 
    USING (auth.role() = 'authenticated' AND public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Allow Product Owners to manage project members" 
    ON public.project_members FOR ALL 
    USING (auth.role() = 'authenticated' AND (
        -- Either the creator of the project or a PO in the project
        EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid()) OR
        public.get_project_role(project_id, auth.uid()) = 'product_owner'
    ));

-- 4. Sprints Policies
CREATE POLICY "Allow members to view sprints" 
    ON public.sprints FOR SELECT 
    USING (auth.role() = 'authenticated' AND public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Allow Scrum Master and Product Owner to manage sprints" 
    ON public.sprints FOR ALL 
    USING (auth.role() = 'authenticated' AND (
        public.get_project_role(project_id, auth.uid()) IN ('scrum_master', 'product_owner') OR
        EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
    ));

-- 5. User Stories Policies
CREATE POLICY "Allow members to view user_stories" 
    ON public.user_stories FOR SELECT 
    USING (auth.role() = 'authenticated' AND public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Allow PO to insert/delete user_stories" 
    ON public.user_stories FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated' AND (
        public.get_project_role(project_id, auth.uid()) = 'product_owner' OR
        EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
    ));

CREATE POLICY "Allow members to update user_stories" 
    ON public.user_stories FOR UPDATE 
    USING (auth.role() = 'authenticated' AND public.is_project_member(project_id, auth.uid()));

CREATE POLICY "Allow PO to delete user_stories" 
    ON public.user_stories FOR DELETE 
    USING (auth.role() = 'authenticated' AND (
        public.get_project_role(project_id, auth.uid()) = 'product_owner' OR
        EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
    ));

-- 6. Tasks Policies
CREATE POLICY "Allow members to view tasks" 
    ON public.tasks FOR SELECT 
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM public.user_stories s 
        WHERE s.id = user_story_id AND public.is_project_member(s.project_id, auth.uid())
    ));

CREATE POLICY "Allow members to manage tasks" 
    ON public.tasks FOR ALL 
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM public.user_stories s 
        WHERE s.id = user_story_id AND public.is_project_member(s.project_id, auth.uid())
    ));

-- 7. Comments Policies
CREATE POLICY "Allow members to view comments" 
    ON public.comments FOR SELECT 
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM public.user_stories s 
        WHERE s.id = user_story_id AND public.is_project_member(s.project_id, auth.uid())
    ));

CREATE POLICY "Allow members to create comments" 
    ON public.comments FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid() AND EXISTS (
        SELECT 1 FROM public.user_stories s 
        WHERE s.id = user_story_id AND public.is_project_member(s.project_id, auth.uid())
    ));

CREATE POLICY "Allow author to update their comments" 
    ON public.comments FOR UPDATE 
    USING (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Allow author or PO to delete comments" 
    ON public.comments FOR DELETE 
    USING (auth.role() = 'authenticated' AND (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_stories s 
            JOIN public.projects p ON s.project_id = p.id
            WHERE s.id = user_story_id AND (p.owner_id = auth.uid() OR public.get_project_role(p.id, auth.uid()) = 'product_owner')
        )
    ));
