import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores'

export function useAuth() {
  const { setSession, setLoading, clearAuth } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    
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

    return () => {
      subscription.unsubscribe()
    }
  }, [setSession, setLoading, clearAuth, queryClient])
}
