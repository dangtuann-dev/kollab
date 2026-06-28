export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedSchema: "auth"
          }
        ]
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          status: 'active' | 'archived'
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          status?: 'active' | 'archived'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          status?: 'active' | 'archived'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedSchema: "public"
          }
        ]
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'product_owner' | 'scrum_master' | 'developer'
          joined_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: 'product_owner' | 'scrum_master' | 'developer'
          joined_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'product_owner' | 'scrum_master' | 'developer'
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedSchema: "public"
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedSchema: "public"
          }
        ]
      }
      sprints: {
        Row: {
          id: string
          project_id: string
          name: string
          goal: string | null
          status: 'planning' | 'active' | 'completed'
          start_date: string | null
          end_date: string | null
          velocity: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          goal?: string | null
          status?: 'planning' | 'active' | 'completed'
          start_date?: string | null
          end_date?: string | null
          velocity?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          goal?: string | null
          status?: 'planning' | 'active' | 'completed'
          start_date?: string | null
          end_date?: string | null
          velocity?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedSchema: "public"
          }
        ]
      }
      user_stories: {
        Row: {
          id: string
          project_id: string
          sprint_id: string | null
          title: string
          description: string | null
          acceptance_criteria: string | null
          story_points: number | null
          priority: 'critical' | 'high' | 'medium' | 'low'
          status: 'backlog' | 'sprint' | 'done'
          assignee_id: string | null
          reporter_id: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          sprint_id?: string | null
          title: string
          description?: string | null
          acceptance_criteria?: string | null
          story_points?: number | null
          priority?: 'critical' | 'high' | 'medium' | 'low'
          status?: 'backlog' | 'sprint' | 'done'
          assignee_id?: string | null
          reporter_id: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          sprint_id?: string | null
          title?: string
          description?: string | null
          acceptance_criteria?: string | null
          story_points?: number | null
          priority?: 'critical' | 'high' | 'medium' | 'low'
          status?: 'backlog' | 'sprint' | 'done'
          assignee_id?: string | null
          reporter_id?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedSchema: "public"
          },
          {
            foreignKeyName: "user_stories_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedSchema: "public"
          },
          {
            foreignKeyName: "user_stories_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedSchema: "public"
          },
          {
            foreignKeyName: "user_stories_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedSchema: "public"
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          user_story_id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'done'
          assignee_id: string | null
          estimate_hours: number
          actual_hours: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_story_id: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          assignee_id?: string | null
          estimate_hours?: number
          actual_hours?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_story_id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          assignee_id?: string | null
          estimate_hours?: number
          actual_hours?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_story_id_fkey"
            columns: ["user_story_id"]
            isOneToOne: false
            referencedRelation: "user_stories"
            referencedSchema: "public"
          },
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedSchema: "public"
          }
        ]
      }
      comments: {
        Row: {
          id: string
          user_story_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_story_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_story_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_story_id_fkey"
            columns: ["user_story_id"]
            isOneToOne: false
            referencedRelation: "user_stories"
            referencedSchema: "public"
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedSchema: "public"
          }
        ]
      }
    }
  }
}
