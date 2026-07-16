import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually parse .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) {
    env[key.trim()] = val.join('=').trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log('Checking database tables & columns...');
  
  // Try to query schema structure via postgrest if possible, or just insert dummy data with unknown fields
  const { data: commentsData, error: commentsErr } = await supabase.from('comments').select('*').limit(1);
  if (commentsData) {
    console.log('Comments columns:', Object.keys(commentsData[0] || { 'no rows': true }));
  } else {
    console.log('Comments error:', commentsErr);
  }

  const { data: tasksData, error: tasksErr } = await supabase.from('tasks').select('*').limit(1);
  if (tasksData) {
    console.log('Tasks columns:', Object.keys(tasksData[0] || { 'no rows': true }));
  } else {
    console.log('Tasks error:', tasksErr);
  }

  const { data: sprintsData, error: sprintsErr } = await supabase.from('sprints').select('*').limit(1);
  if (sprintsData) {
    console.log('Sprints columns:', Object.keys(sprintsData[0] || { 'no rows': true }));
  } else {
    console.log('Sprints error:', sprintsErr);
  }
}

check();
