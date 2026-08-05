import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase, damBaoHoSoNguoiDung } from '../../lib/supabase'
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
        if (session?.user) {
          damBaoHoSoNguoiDung(session.user)
        }
      } catch (err) {
        console.error('Lỗi khi khởi tạo phiên làm việc:', err)
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
        if (session?.user) {
          damBaoHoSoNguoiDung(session.user)
        } else {
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

export async function capNhatHoSoCaNhan(data: { full_name?: string; avatar_url?: string }) {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    throw new Error('Người dùng chưa đăng nhập hoặc phiên đã hết hạn')
  }

  const userId = userData.user.id

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      ...(data.full_name !== undefined && { full_name: data.full_name }),
      ...(data.avatar_url !== undefined && { avatar_url: data.avatar_url }),
    },
  })
  if (authError) throw authError

  const updatePayload: any = {
    updated_at: new Date().toISOString(),
  }
  if (data.full_name !== undefined) updatePayload.full_name = data.full_name
  if (data.avatar_url !== undefined) updatePayload.avatar_url = data.avatar_url

  const { error: profileError } = await (supabase
    .from('profiles') as any)
    .update(updatePayload)
    .eq('id', userId)

  if (profileError) throw profileError

  const { data: refreshSession } = await supabase.auth.refreshSession()
  if (refreshSession?.session) {
    useAuthStore.getState().setSession(refreshSession.session)
  }

  return { success: true }
}

export async function doiMatKhauTaikhoan(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (error) throw error
  return { success: true }
}
