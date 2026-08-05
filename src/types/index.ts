import type { Database } from './database.types'

export type * from './database.types'

export type UserRole = 'product_owner' | 'scrum_master' | 'developer' | (string & {})
export type StoryStatus = 'backlog' | 'sprint' | 'done'
export type StoryPriority = 'critical' | 'high' | 'medium' | 'low'
export type SprintStatus = 'planning' | 'active' | 'completed'
export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectMember = Database['public']['Tables']['project_members']['Row'] & {
  profile?: Profile
}
export type Sprint = Database['public']['Tables']['sprints']['Row']
export type Story = Database['public']['Tables']['user_stories']['Row'] & {
  assignee?: Profile | null
  reporter?: Profile | null
}
export type Task = Database['public']['Tables']['tasks']['Row'] & {
  assignee?: Profile | null
  user_story?: Story | null
}
export type Comment = Database['public']['Tables']['comments']['Row'] & {
  author?: Profile
}
export type Notification = Database['public']['Tables']['notifications']['Row']
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row'] & {
  profile?: Profile | null
}
export type StandupLog = Database['public']['Tables']['standup_logs']['Row'] & {
  profile?: Profile
}

