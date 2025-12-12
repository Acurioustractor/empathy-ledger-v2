import { createBrowserClient } from '@supabase/ssr'
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

// Lazy initialization of Supabase browser client
// Using @supabase/ssr for proper cookie-based session handling
let _supabase: ReturnType<typeof createBrowserClient<Database>> | null = null

const getSupabaseClient = () => {
  if (!_supabase) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()
    _supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

// Client-side Supabase client for browser usage with cookie-based auth
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient<Database>>, {
  get(_, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createBrowserClient<Database>>]
  }
})

// Alternative: export a getter function
export const getSupabase = () => getSupabaseClient()

// Create a function to get a fresh client instance (for special cases)
export const createSupabaseClient = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

export type SupabaseClient = typeof supabase