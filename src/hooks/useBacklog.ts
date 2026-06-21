import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Story, StoryPriority, StoryStatus } from '../types'
import { useToast } from '../stores/toastStore'

export function useBacklog(projectId: string) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const storiesQuery = useQuery({
    queryKey: ['stories', projectId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('stories')
        .select(`
          *,
          assignee:profiles!stories_assignee_id_fkey(*),
          reporter:profiles!stories_reporter_id_fkey(*)
        `)
        .eq('project_id', projectId)
        .order('order_index', { ascending: true }) as any)

      if (error) {
        console.error('Error fetching stories:', error.message)
        throw error
      }
      return data as Story[]
    },
    enabled: !!projectId,
  })

  const createStoryMutation = useMutation<any, Error, {
    title: string
    description?: string
    acceptance_criteria?: string
    story_points?: number
    priority: StoryPriority
    assignee_id?: string | null
    sprint_id?: string | null
  }>({
    mutationFn: async (vars) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Người dùng chưa đăng nhập')

      // Lấy chỉ số thứ tự (order index) tiếp theo
      const existingCount = storiesQuery.data?.length || 0

      const { data, error } = await ((supabase
        .from('stories') as any)
        .insert({
          project_id: projectId,
          title: vars.title,
          description: vars.description || '',
          acceptance_criteria: vars.acceptance_criteria || '',
          story_points: vars.story_points || null,
          priority: vars.priority,
          assignee_id: vars.assignee_id || null,
          sprint_id: vars.sprint_id || null,
          reporter_id: user.id,
          status: vars.sprint_id ? 'todo' : 'backlog',
          order_index: existingCount,
        })
        .select()
        .single() as any)

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Tạo User Story thành công!')
      queryClient.invalidateQueries({ queryKey: ['stories', projectId] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Tạo User Story thất bại')
    },
  })

  const updateStoryMutation = useMutation<any, Error, Partial<Story> & { id: string }>({
    mutationFn: async (vars) => {
      const { id, ...updates } = vars
      const { data, error } = await ((supabase
        .from('stories') as any)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single() as any)

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories', projectId] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Cập nhật story thất bại')
    },
  })

  const deleteStoryMutation = useMutation<any, Error, string>({
    mutationFn: async (storyId) => {
      const { error } = await (supabase.from('stories') as any).delete().eq('id', storyId)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Đã xóa story')
      queryClient.invalidateQueries({ queryKey: ['stories', projectId] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Xóa story thất bại')
    },
  })

  const moveStoryMutation = useMutation<any, Error, { storyId: string; sprintId: string | null; status?: StoryStatus }>({
    mutationFn: async (vars) => {
      const updates: any = { sprint_id: vars.sprintId }
      if (vars.status) {
        updates.status = vars.status
      } else {
        // Nếu chuyển về backlog, status chuyển thành backlog. Nếu chuyển vào sprint, status chuyển thành todo
        updates.status = vars.sprintId ? 'todo' : 'backlog'
      }

      const { data, error } = await ((supabase
        .from('stories') as any)
        .update(updates)
        .eq('id', vars.storyId)
        .select()
        .single() as any)

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories', projectId] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Di chuyển story thất bại')
    },
  })

  return {
    stories: storiesQuery.data || [],
    isLoading: storiesQuery.isLoading,
    createStory: createStoryMutation.mutateAsync,
    updateStory: updateStoryMutation.mutateAsync,
    deleteStory: deleteStoryMutation.mutateAsync,
    moveStory: moveStoryMutation.mutateAsync,
  }
}
