import { createClient } from '@supabase/supabase-js'
import type { Session, User } from '@supabase/supabase-js'
import type { Database } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export async function getSession(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error fetching Supabase session:', error.message)
    return null
  }
  return session
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error fetching current user:', error.message)
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
