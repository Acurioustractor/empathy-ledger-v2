import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Get environment variables - validation deferred to runtime
const getSupabaseEnv = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  return { supabaseUrl, supabaseAnonKey }
}

// Lazy initialization of Supabase client
let _supabase: ReturnType<typeof createClient<Database>> | null = null

const getSupabaseClient = () => {
  if (!_supabase) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-application-name': 'empathy-ledger',
        },
      },
    })
  }
  return _supabase
}

// Client-side Supabase client for browser usage with proper auth configuration
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createClient<Database>>]
  }
})

// Alternative: export a getter function
export const getSupabase = () => getSupabaseClient()

// Create a function to get a fresh client instance (for special cases)
export const createSupabaseClient = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'empathy-ledger-fresh',
      },
    },
  })
}

export type SupabaseClient = typeof supabase