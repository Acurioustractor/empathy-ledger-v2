import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Browser-side Supabase client that uses cookies (works with middleware)
// When no cookies option is provided, createBrowserClient uses document.cookie automatically
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        // Ensure cookies work with the app domain
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    }
  )
}

// Singleton for reuse across components
let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null

export function getSupabaseBrowser() {
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient()
  }
  return browserClient
}

// Reset the singleton (useful for testing or when cookie settings change)
export function resetSupabaseBrowser() {
  browserClient = null
}
