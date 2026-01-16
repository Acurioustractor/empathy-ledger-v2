import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// Get environment variables - validation deferred to runtime
const getSupabaseEnv = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  return { supabaseUrl, supabaseAnonKey, supabaseServiceKey }
}

// Server-side Supabase client for App Router (session-aware, uses anon key)
export const createSupabaseServerClient = async () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()
  const cookieStore = await cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
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

// For middleware usage
export const createSupabaseMiddlewareClient = (request: Request) => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv()
  const supabaseResponse = new Response()

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const cookies = request.headers.get('cookie')
        return cookies ? cookies.split(';').map(cookie => {
          const [name, value] = cookie.trim().split('=')
          return { name, value }
        }) : []
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.headers.append(
            'Set-Cookie',
            `${name}=${value}; ${Object.entries(options || {})
              .map(([key, val]) => `${key}=${val}`)
              .join('; ')}`
          )
        })
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'empathy-ledger-middleware',
      },
    },
  })

  return { supabase, supabaseResponse }
}

// Service client for development uploads (bypasses RLS)
export const createSupabaseServiceClient = () => {
  const { supabaseUrl, supabaseServiceKey } = getSupabaseEnv()

  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createServerClient<Database>(supabaseUrl, supabaseServiceKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'empathy-ledger-service',
      },
    },
  })
}