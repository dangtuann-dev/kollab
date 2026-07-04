import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ictckqmehilowtsxrfri.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljdGNrcW1laGlsb3d0c3hyZnJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMjA0NDUsImV4cCI6MjA5NzU5NjQ0NX0.5SDxTBL5dQDaPnmttT-EMzHHINr4ui1XRiY5lrEiYiw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testJoinQuery() {
  console.log('--- TESTING USER STORIES JOIN QUERY WITH COLUMN HINTS ---')
  const { data, error } = await supabase
    .from('user_stories')
    .select(`
      *,
      assignee:profiles!assignee_id(*),
      reporter:profiles!reporter_id(*)
    `)
  
  if (error) {
    console.error('Join Query Error:', error)
  } else {
    console.log('Join Query Success! Count:', data.length)
    console.log('Data:', data)
  }
}

testJoinQuery()
