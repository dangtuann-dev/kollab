import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ProjectMember, UserRole } from '../types'
import { useToast } from '../stores/toastStore'

export function useMembers(projectId: string) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const membersQuery = useQuery({
    queryKey: ['members', projectId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('project_members')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('project_id', projectId) as any)

      if (error) throw error
      return data as ProjectMember[]
    },
    enabled: !!projectId,
  })

  const inviteMemberMutation = useMutation<any, Error, { email: string; role: UserRole }>({
    mutationFn: async (vars) => {
      
      const { data: profile, error: profileError } = await (supabase
        .from('profiles')
        .select('id, full_name')
        .eq('email', vars.email)
        .maybeSingle() as any)

      if (profileError) throw profileError
      if (!profile) {
        throw new Error('Người dùng không tồn tại trong hệ thống')
      }

      const { data, error } = await ((supabase
        .from('project_members') as any)
        .insert({
          project_id: projectId,
          user_id: profile.id,
          role: vars.role,
        })
        .select()
        .single() as any)

      if (error) {
        if (error.code === '23505') {
          throw new Error('Người dùng đã là thành viên của dự án này')
        }
        throw error
      }
      return { data, profile }
    },
    onSuccess: (result) => {
      toast.success(`Đã mời thành viên ${result.profile.full_name} thành công!`)
      queryClient.invalidateQueries({ queryKey: ['members', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Mời thành viên thất bại')
    },
  })

  const updateMemberRoleMutation = useMutation<any, Error, { memberId: string; role: UserRole }>({
    mutationFn: async (vars) => {
      const { data, error } = await ((supabase
        .from('project_members') as any)
        .update({ role: vars.role })
        .eq('id', vars.memberId)
        .select()
        .single() as any)

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Đã cập nhật vai trò của thành viên')
      queryClient.invalidateQueries({ queryKey: ['members', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Cập nhật vai trò thành viên thất bại')
    },
  })

  const removeMemberMutation = useMutation<any, Error, string>({
    mutationFn: async (memberId) => {
      const { error } = await (supabase.from('project_members') as any).delete().eq('id', memberId)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Đã xóa thành viên khỏi dự án')
      queryClient.invalidateQueries({ queryKey: ['members', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
    onError: (err: any) => {
      toast.error(err.message || 'Xóa thành viên thất bại')
    },
  })

  return {
    members: membersQuery.data || [],
    isLoading: membersQuery.isLoading,
    inviteMember: inviteMemberMutation.mutateAsync,
    isInviting: inviteMemberMutation.isPending,
    updateMemberRole: updateMemberRoleMutation.mutateAsync,
    removeMember: removeMemberMutation.mutateAsync,
  }
}
