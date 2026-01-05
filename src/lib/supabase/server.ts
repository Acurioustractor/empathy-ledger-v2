import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Get environment variables - validation deferred to runtime
const getSupabaseEnv = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return { supabaseUrl, supabaseServiceKey }
}

// Server-side Supabase client with service role key for API routes
export const createClient = () => {
  const { supabaseUrl, supabaseServiceKey } = getSupabaseEnv()
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'empathy-ledger-server',
      },
    },
  })
}

// Admin client with service role permissions
export const createAdminClient = () => {
  const { supabaseUrl, supabaseServiceKey } = getSupabaseEnv()
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  })
}

// Alias for backwards compatibility with API routes
export const createSupabaseServerClient = createClient

export type SupabaseServerClient = ReturnType<typeof createClient>