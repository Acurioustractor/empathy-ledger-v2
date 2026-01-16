import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Browser-side Supabase client that uses cookies (works with middleware)
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
