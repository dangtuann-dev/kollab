import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ProjectMember, UserRole } from '../types'
import { useAuthStore, useProjectStore } from '../stores'
import { useToast } from '../stores/toastStore'

export function useProjects() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { setProjects } = useProjectStore()
  const toast = useToast()

  const projectsQuery = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await (supabase
        .from('project_members')
        .select(`
          role,
          project:projects(*, project_members(*, profile:profiles(*)), sprints(*))
        `)
        .eq('user_id', user.id) as any)

      if (error) {
        console.error('Error fetching projects:', error.message)
        throw error
      }

      const formatted = (data || [])
        .filter((item: any) => item.project !== null)
        .map((item: any) => {
          const activeSprintsCount = (item.project.sprints || [])
            .filter((s: any) => s.status === 'active').length
          return {
            ...item.project,
            userRole: item.role as UserRole,
            activeSprintsCount,
            members: (item.project.project_members || []).map((m: any) => ({
              ...m,
              profile: m.profile
            }))
          }
        })

      setProjects(formatted)
      return formatted as any[]
    },
    enabled: !!user,
  })

  const createProjectMutation = useMutation<any, Error, { name: string; description: string; start_date?: string; end_date?: string }>({
    mutationFn: async (vars) => {
      if (!user) throw new Error('You must be signed in to create projects')

      const { data: project, error: projectError } = await ((supabase
        .from('projects') as any)
        .insert({
          name: vars.name,
          description: vars.description || '',
          owner_id: user.id,
          status: 'active',
          start_date: vars.start_date || null,
          end_date: vars.end_date || null,
        })
        .select()
        .single() as any)

      if (projectError) throw projectError

      const { error: memberError } = await (supabase
        .from('project_members') as any)
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: 'product_owner',
        })

      if (memberError) throw memberError

      return project
    },
    onSuccess: (project) => {
      toast.success(`Project "${project.name}" created successfully!`)
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create project')
    },
  })

  const archiveProjectMutation = useMutation<any, Error, string>({
    mutationFn: async (projectId) => {
      const { data, error } = await ((supabase
        .from('projects') as any)
        .update({ status: 'archived' })
        .eq('id', projectId)
        .select()
        .single() as any)

      if (error) throw error
      return data
    },
    onSuccess: (project) => {
      toast.success(`Project "${project.name}" archived successfully!`)
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to archive project')
    },
  })

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    createProject: createProjectMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
    archiveProject: archiveProjectMutation.mutateAsync,
    isArchiving: archiveProjectMutation.isPending,
  }
}

export function useProject(projectId?: string) {
  const { user, setProjectRole } = useAuthStore()
  const { setCurrentProject } = useProjectStore()

  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId || !user) return null

      const { data: project, error: projectError } = await (supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single() as any)

      if (projectError) throw projectError

      const { data: members, error: membersError } = await (supabase
        .from('project_members')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('project_id', projectId) as any)

      if (membersError) throw membersError

      const currentMember = members.find((m: any) => m.user_id === user.id)
      const userRole = currentMember ? (currentMember.role as UserRole) : null
      setProjectRole(userRole)

      const projectWithMembers = {
        ...project,
        members: members as ProjectMember[],
        userRole,
      }

      setCurrentProject(projectWithMembers)
      return projectWithMembers
    },
    enabled: !!projectId && !!user,
  })
}
