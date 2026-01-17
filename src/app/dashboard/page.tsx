import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * Server-side dashboard redirect page.
 *
 * This is a SERVER COMPONENT that redirects on the server before any
 * client-side JavaScript runs. This eliminates the race condition where
 * client-side auth checks get aborted during navigation.
 *
 * The middleware already validates auth, so if user reaches this page,
 * they ARE authenticated. We just need to get their user ID and redirect.
 */
export default async function DashboardRedirectPage() {
  const supabase = await createSupabaseServerClient()

  // Get user from server-side session (no client-side race condition)
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.log('🔀 Dashboard server: Auth error, redirecting to signin:', error.message)
    redirect('/auth/signin?redirect=/dashboard')
  }

  if (!user) {
    console.log('🔀 Dashboard server: No user found, redirecting to signin')
    redirect('/auth/signin?redirect=/dashboard')
  }

  console.log('🔀 Dashboard server: Redirecting to storyteller dashboard:', user.id)
  redirect(`/storytellers/${user.id}/dashboard`)
}
