import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { UserRole } from '../types'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  role: UserRole | null // Vai trò của người dùng trong dự án hiện tại
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (isLoading: boolean) => void
  setProjectRole: (role: UserRole | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        session: null,
        isLoading: true,
        role: null,
        setUser: (user) => set({ user }),
        setSession: (session) => set({ session, user: session?.user || null }),
        setLoading: (isLoading) => set({ isLoading }),
        setProjectRole: (role) => set({ role }),
        clearAuth: () => set({ user: null, session: null, role: null }),
      }),
      {
        name: 'agileflow-auth-storage',
        partialize: (state) => ({ session: state.session, user: state.user }), // Không lưu trữ role vì nó mang tính chất đặc thù của từng dự án
      }
    )
  )
)
