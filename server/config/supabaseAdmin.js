import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[supabaseAdmin] Warning: SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to anon key or placeholder.')
}

// Service-role Supabase client (bypasses RLS - server side only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export default supabaseAdmin
