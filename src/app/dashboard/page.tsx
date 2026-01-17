'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/auth.context'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase/browser'

export default function DashboardRedirectPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [directUserId, setDirectUserId] = useState<string | null>(null)
  const [checkingDirect, setCheckingDirect] = useState(true)

  // Direct session check - bypasses auth context race condition
  // Middleware already validated auth, so if we're here, user IS authenticated
  useEffect(() => {
    const checkSessionDirect = async () => {
      try {
        console.log('🔍 Dashboard: Checking session directly...')
        const { data: { session }, error } = await getSupabaseBrowser().auth.getSession()

        if (error) {
          console.log('⚠️ Dashboard: Session check error:', error.message)
        }

        if (session?.user?.id) {
          console.log('✅ Dashboard: Found user directly:', session.user.email)
          setDirectUserId(session.user.id)
        } else {
          console.log('⚠️ Dashboard: No session found in direct check')
        }
      } catch (err) {
        console.log('⚠️ Dashboard: Direct check failed:', err)
      } finally {
        setCheckingDirect(false)
      }
    }

    checkSessionDirect()
  }, [])

  // Redirect logic - use direct user ID or auth context user
  useEffect(() => {
    // Still checking direct session
    if (checkingDirect) return

    // Got user from direct check - redirect immediately
    if (directUserId) {
      console.log('🔀 Redirecting to storyteller dashboard (direct):', directUserId)
      router.replace(`/storytellers/${directUserId}/dashboard`)
      return
    }

    // Fall back to auth context if direct check failed but context has user
    if (!isLoading && isAuthenticated && user?.id) {
      console.log('🔀 Redirecting to storyteller dashboard (context):', user.id)
      router.replace(`/storytellers/${user.id}/dashboard`)
      return
    }

    // Both checks complete with no user - this shouldn't happen since middleware
    // should have redirected, but handle it just in case
    if (!checkingDirect && !isLoading && !directUserId && !user?.id) {
      console.log('🔀 No user found after all checks, redirecting to signin')
      router.replace('/auth/signin?redirect=/dashboard')
    }
  }, [checkingDirect, directUserId, isLoading, isAuthenticated, user?.id, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading your dashboard...</p>
      </div>
    </div>
  )
}
