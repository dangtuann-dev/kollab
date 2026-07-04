import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useToast } from '../stores/toastStore'

interface StartSprintParams {
  sprintId: string
  startDate: string
  endDate: string
}

export function useStartSprint(projectId: string) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<any, Error, StartSprintParams>({
    mutationFn: async ({ sprintId, startDate, endDate }) => {
      const { data: activeSprints, error: checkError } = await (supabase
        .from('sprints') as any)
        .select('id, name')
        .eq('project_id', projectId)
        .eq('status', 'active')

      if (checkError) throw checkError

      if (activeSprints && activeSprints.length > 0) {
        throw new Error(
          `Không thể bắt đầu sprint. Sprint "${activeSprints[0].name}" hiện đang hoạt động. Chỉ có thể có tối đa 1 sprint hoạt động tại một thời điểm.`
        )
      }

      const { data, error } = await (supabase
        .from('sprints') as any)

        .update({
          status: 'active',
          start_date: startDate,
          end_date: endDate,
        })
        .eq('id', sprintId)
        .select()
        .single() as any

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Bắt đầu Sprint thành công!')
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] })
      queryClient.invalidateQueries({ queryKey: ['activeSprint', projectId] })
      queryClient.invalidateQueries({ queryKey: ['stories', projectId] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Bắt đầu Sprint thất bại')
    },
  })
}
