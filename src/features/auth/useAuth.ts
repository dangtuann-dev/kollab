import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores'

export function useAuth() {
  const queryClient = useQueryClient()
  const { setSession, setLoading, clearAuth } = useAuthStore()

  // Hook to monitor session updates on mount
  useEffect(() => {
    // 1. Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        setSession(session)
      } catch (err: any) {
        console.error('Error fetching initial session:', err.message)
        clearAuth()
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 2. Subscribe to auth state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setLoading(false)

      if (event === 'SIGNED_OUT') {
        clearAuth()
        queryClient.clear()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setSession, setLoading, clearAuth, queryClient])

  return {}
}
