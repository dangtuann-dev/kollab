import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Sprint } from '../types'
import { useToast } from '../stores/toastStore'

export function useSprint(projectId: string) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const sprintsQuery = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('sprints')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }) as any)

      if (error) throw error
      return data as Sprint[]
    },
    enabled: !!projectId,
  })

  const activeSprintQuery = useQuery({
    queryKey: ['activeSprint', projectId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('sprints')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'active')
        .maybeSingle() as any)

      if (error && error.code !== 'PGRST116') throw error
      return data as Sprint | null
    },
    enabled: !!projectId,
  })

  const createSprintMutation = useMutation<any, Error, { name: string; goal?: string; start_date?: string; end_date?: string }>({
    mutationFn: async (vars) => {
      const { data, error } = await ((supabase
        .from('sprints') as any)
        .insert({
          project_id: projectId,
          name: vars.name,
          goal: vars.goal || '',
          start_date: vars.start_date || null,
          end_date: vars.end_date || null,
          status: 'planning',
        })
        .select()
        .single() as any)

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Sprint created successfully!')
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create sprint')
    },
  })

  const startSprintMutation = useMutation<any, Error, { sprintId: string; start_date: string; end_date: string }>({
    mutationFn: async (vars) => {
      // Đổi trạng thái sprint thành hoạt động (active)
      const { data, error } = await ((supabase
        .from('sprints') as any)
        .update({
          status: 'active',
          start_date: vars.start_date,
          end_date: vars.end_date,
        })
        .eq('id', vars.sprintId)
        .select()
        .single() as any)

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Sprint started!')
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] })
      queryClient.invalidateQueries({ queryKey: ['activeSprint', projectId] })
      queryClient.invalidateQueries({ queryKey: ['stories', projectId] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to start sprint')
    },
  })

  const completeSprintMutation = useMutation<any, Error, string>({
    mutationFn: async (sprintId) => {
      // Đổi trạng thái sprint thành đã hoàn thành (completed)
      const { data, error } = await ((supabase
        .from('sprints') as any)
        .update({ status: 'completed' })
        .eq('id', sprintId)
        .select()
        .single() as any)

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Sprint completed!')
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] })
      queryClient.invalidateQueries({ queryKey: ['activeSprint', projectId] })
      queryClient.invalidateQueries({ queryKey: ['stories', projectId] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to complete sprint')
    },
  })

  return {
    sprints: sprintsQuery.data || [],
    activeSprint: activeSprintQuery.data || null,
    isLoading: sprintsQuery.isLoading || activeSprintQuery.isLoading,
    createSprint: createSprintMutation.mutateAsync,
    startSprint: startSprintMutation.mutateAsync,
    completeSprint: completeSprintMutation.mutateAsync,
  }
}
