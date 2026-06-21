import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores'

export function useAuth() {
  const { setSession, setLoading, clearAuth } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    // 1. Lấy session ban đầu
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        setSession(session)
      } catch (err) {
        console.error('Error getting initial session:', err)
        clearAuth()
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 2. Thiết lập trình lắng nghe sự kiện thay đổi trạng thái xác thực
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
        if (!session) {
          clearAuth()
          queryClient.clear()
        }
      }
    )

    // Dọn dẹp listener khi unmount component
    return () => {
      subscription.unsubscribe()
    }
  }, [setSession, setLoading, clearAuth, queryClient])
}
