import { createClient } from '@supabase/supabase-js'
import type { Session, User } from '@supabase/supabase-js'
import type { Database } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Thiếu biến môi trường VITE_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Thiếu biến môi trường VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export async function getSession(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Lỗi khi lấy phiên làm việc Supabase:', error.message)
    return null
  }
  return session
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Lỗi khi lấy thông tin người dùng hiện tại:', error.message)
    return null
  }
  return user
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

export async function damBaoHoSoNguoiDung(user: User): Promise<void> {
  if (!user) return
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      const { error } = await (supabase
        .from('profiles') as any)
        .upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Thành viên',
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || null,
        })
      if (error) {
        console.error('Không thể tự động tạo hồ sơ người dùng:', error.message)
      }
    }
  } catch (err) {
    console.error('Lỗi trong hàm damBaoHoSoNguoiDung:', err)
  }
}

export const ensureUserProfile = damBaoHoSoNguoiDung
