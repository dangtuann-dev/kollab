import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, TaskStatus } from '../types'
import { useToast } from '../stores/toastStore'

export function useRealtimeBoard(sprintId: string, storyIds: string[]) {
  const queryClient = useQueryClient()
  const toast = useToast()

  // 1. Fetch all tasks for stories in the active sprint
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks-board', sprintId],
    queryFn: async () => {
      if (!sprintId || storyIds.length === 0) return []

      const { data, error } = await (supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles(*),
          user_story:user_stories(*)
        `)
        .in('user_story_id', storyIds)
        .order('created_at', { ascending: true }) as any)

      if (error) {
        console.error('Error fetching board tasks:', error.message)
        throw error
      }
      return data as Task[]
    },
    enabled: !!sprintId && storyIds.length > 0,
  })

  // 2. Realtime sync subscription
  useEffect(() => {
    if (!sprintId) return

    const channel = supabase
      .channel(`realtime-tasks-sprint-${sprintId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks-board', sprintId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sprintId, queryClient])

  // 3. Mutation to update task details/status (Optimistic UI)
  const updateTaskMutation = useMutation<any, Error, Partial<Task> & { id: string }, { previousTasks: Task[] | undefined }>({
    mutationFn: async (vars) => {
      const { id, assignee: _assignee, user_story: _user_story, ...updates } = vars
      
      const { data, error } = await ((supabase
        .from('tasks') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single() as any)

      if (error) throw error
      return data
    },
    onMutate: async (updatedTask) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks-board', sprintId] })

      // Snapshot current value
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks-board', sprintId])

      // Optimistically update
      queryClient.setQueryData<Task[]>(['tasks-board', sprintId], (oldTasks) => {
        if (!oldTasks) return []
        return oldTasks.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
      })

      return { previousTasks }
    },
    onError: (err, _vars, context) => {
      // Rollback
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks-board', sprintId], context.previousTasks)
      }
      toast.error(err.message || 'Lỗi khi cập nhật công việc. Đã khôi phục trạng thái cũ.')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-board', sprintId] })
    },
  })

  // 4. Mutation to create task
  const createTaskMutation = useMutation<any, Error, {
    user_story_id: string
    title: string
    status: TaskStatus
    assignee_id?: string | null
    priority?: 'critical' | 'high' | 'medium' | 'low'
    story_points?: number
    deadline?: string | null
  }>({
    mutationFn: async (vars) => {
      const { data, error } = await ((supabase
        .from('tasks') as any)
        .insert(vars)
        .select()
        .single() as any)

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Đã thêm công việc mới!')
      queryClient.invalidateQueries({ queryKey: ['tasks-board', sprintId] })
    },
    onError: (err) => {
      toast.error(err.message || 'Không thể tạo công việc mới')
    },
  })

  return {
    tasks,
    isLoading,
    updateTask: updateTaskMutation.mutateAsync,
    createTask: createTaskMutation.mutateAsync,
  }
}
