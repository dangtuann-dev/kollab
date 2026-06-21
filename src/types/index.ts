import type { Database } from './database.types'

export type * from './database.types'

export type UserRole = 'product_owner' | 'scrum_master' | 'developer'
export type StoryStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
export type StoryPriority = 'critical' | 'high' | 'medium' | 'low'
export type SprintStatus = 'planning' | 'active' | 'completed'
export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectMember = Database['public']['Tables']['project_members']['Row'] & {
  profile?: Profile
}
export type Sprint = Database['public']['Tables']['sprints']['Row']
export type Story = Database['public']['Tables']['stories']['Row'] & {
  assignee?: Profile | null
  reporter?: Profile | null
}
export type Task = Database['public']['Tables']['tasks']['Row'] & {
  assignee?: Profile | null
}
export type Comment = Database['public']['Tables']['comments']['Row'] & {
  author?: Profile
}
