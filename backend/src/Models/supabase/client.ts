import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
}

// Debug: Log which key is being used (first/last 10 chars only for security)
const keyPreview = supabaseServiceRoleKey
  ? `${supabaseServiceRoleKey.substring(0, 20)}...${supabaseServiceRoleKey.substring(supabaseServiceRoleKey.length - 10)}`
  : 'NOT SET'
console.log(`[Supabase] Initializing client with URL: ${supabaseUrl}`)
console.log(`[Supabase] Using service role key: ${keyPreview}`)

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
})
