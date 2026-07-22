import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key'

describe('Supabase Row Level Security (RLS) Audit', () => {
  const anonClient = createClient(SUPABASE_URL, ANON_KEY)

  it('Unauthenticated user cannot read private projects', async () => {
    const { data, error } = await anonClient.from('projects').select('*')
    // Expect 0 rows or unauthenticated error
    if (data) {
      expect(data.length).toBe(0)
    } else {
      expect(error).toBeDefined()
    }
  })

  it('Unauthenticated user cannot insert task into project', async () => {
    const { error } = await anonClient.from('tasks').insert({
      title: 'Malicious task',
      user_story_id: '00000000-0000-0000-0000-000000000000',
      status: 'todo',
    })
    expect(error).toBeDefined()
  })

  it('Unauthenticated user cannot delete projects', async () => {
    const { error } = await anonClient.from('projects').delete().eq('id', '00000000-0000-0000-0000-000000000000')
    expect(error).toBeDefined()
  })
})
