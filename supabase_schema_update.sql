-- SQL Migration for Agile PM System updates
-- Run this script in the Supabase SQL Editor to update your database schema.

--------------------------------------------------------------------------------
-- 1. Alter tasks table to support priority, labels, story points, and deadlines
--------------------------------------------------------------------------------
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS story_points integer CHECK (story_points >= 0);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS priority text CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS labels text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS deadline date;

--------------------------------------------------------------------------------
-- 2. Alter comments table to support comments on tasks
--------------------------------------------------------------------------------
ALTER TABLE public.comments ALTER COLUMN user_story_id DROP NOT NULL;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE;

--------------------------------------------------------------------------------
-- 3. Create Daily Standup Logs table
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.standup_logs (
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

-- Enable RLS for standup_logs
ALTER TABLE public.standup_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow members to view standup logs" ON public.standup_logs;
CREATE POLICY "Allow members to view standup logs" 
    ON public.standup_logs FOR SELECT 
    USING (auth.role() = 'authenticated' AND public.is_project_member(project_id, auth.uid()));

DROP POLICY IF EXISTS "Allow members to insert standup logs" ON public.standup_logs;
CREATE POLICY "Allow members to insert standup logs" 
    ON public.standup_logs FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id AND public.is_project_member(project_id, auth.uid()));

--------------------------------------------------------------------------------
-- 4. Create Notifications table
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('assignment', 'comment', 'sprint_warning', 'other')) DEFAULT 'other',
    title text NOT NULL,
    body text,
    link text,
    read_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to view own notifications" ON public.notifications;
CREATE POLICY "Allow users to view own notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update own notifications" ON public.notifications;
CREATE POLICY "Allow users to update own notifications" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow system/users to insert notifications" ON public.notifications;
CREATE POLICY "Allow system/users to insert notifications" 
    ON public.notifications FOR INSERT 
    WITH CHECK (true);

--------------------------------------------------------------------------------
-- 5. Create Activity Logs table
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    action text NOT NULL CHECK (action IN ('created', 'status_changed', 'assigned', 'commented', 'field_updated')),
    old_value jsonb,
    new_value jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow members to view activity logs" ON public.activity_logs;
CREATE POLICY "Allow members to view activity logs" 
    ON public.activity_logs FOR SELECT 
    USING (auth.role() = 'authenticated');

--------------------------------------------------------------------------------
-- Helper Triggers & Functions
--------------------------------------------------------------------------------

-- Trigger for task assignment notification
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

DROP TRIGGER IF EXISTS on_task_assigned ON public.tasks;
CREATE TRIGGER on_task_assigned
    AFTER INSERT OR UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_task_assignment_notification();


-- Trigger for comment notifications
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

DROP TRIGGER IF EXISTS on_comment_added ON public.comments;
CREATE TRIGGER on_comment_added
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_comment_notification();


-- Trigger for logging task updates
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
        -- If run in backend or triggers without explicit auth, try getting it from profiles if possible
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

DROP TRIGGER IF EXISTS on_task_updated ON public.tasks;
CREATE TRIGGER on_task_updated
    AFTER UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.log_task_updates();


-- Trigger for logging task creation
CREATE OR REPLACE FUNCTION public.log_task_creation()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.activity_logs (task_id, user_id, action, new_value)
    VALUES (new.id, auth.uid(), 'created', jsonb_build_object('title', new.title, 'status', new.status));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_task_created ON public.tasks;
CREATE TRIGGER on_task_created
    AFTER INSERT ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.log_task_creation();


-- Trigger for logging comments
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

DROP TRIGGER IF EXISTS on_comment_logged ON public.comments;
CREATE TRIGGER on_comment_logged
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.log_comment_creation();
