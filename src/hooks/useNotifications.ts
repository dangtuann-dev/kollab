import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores'
import { useToast } from '../stores/toastStore'
import type { Notification } from '../types'

export function useNotifications() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const toast = useToast()

  const userId = user?.id || ''

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await (supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }) as any)

      if (error) throw error
      return data as Notification[]
    },
    enabled: !!userId,
  })

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`realtime-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
          
          const newNotif = payload.new as Notification
          toast.info(newNotif.title || 'Thông báo mới')
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient, toast])

  const markAsReadMutation = useMutation<any, Error, string>({
    mutationFn: async (notificationId) => {
      const { data, error } = await ((supabase
        .from('notifications') as any)
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId) as any)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
    },
  })

  const markAllAsReadMutation = useMutation<any, Error, void>({
    mutationFn: async () => {
      if (!userId) return
      const { data, error } = await ((supabase
        .from('notifications') as any)
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('read_at', null) as any)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
    },
  })

  const unreadCount = notifications.filter((n) => !n.read_at).length

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
  }
}
export default useNotifications
