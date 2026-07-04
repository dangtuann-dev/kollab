import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useToast } from '../stores/toastStore'

export function useCompleteSprint(projectId: string) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<any, Error, string>({
    mutationFn: async (sprintId) => {
      const { data: stories, error: storiesError } = await (supabase
        .from('user_stories') as any)
        .select('id, status')
        .eq('sprint_id', sprintId)

      if (storiesError) throw storiesError

      const incompleteStories = stories?.filter((story: any) => story.status !== 'done') || []
      if (incompleteStories.length > 0) {
        const incompleteIds = incompleteStories.map((story: any) => story.id)
        const { error: moveError } = await (supabase
          .from('user_stories') as any)
          .update({
            sprint_id: null,
            status: 'backlog',
          })
          .in('id', incompleteIds)

        if (moveError) throw moveError
      }

      const { data, error } = await (supabase
        .from('sprints') as any)

        .update({ status: 'completed' })
        .eq('id', sprintId)
        .select()
        .single() as any

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Hoàn thành Sprint thành công!')
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] })
      queryClient.invalidateQueries({ queryKey: ['activeSprint', projectId] })
      queryClient.invalidateQueries({ queryKey: ['stories', projectId] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Hoàn thành Sprint thất bại')
    },
  })
}
