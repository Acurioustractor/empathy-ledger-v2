'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/lib/context/auth.context'
import { useRouter } from 'next/navigation'

export default function DashboardRedirectPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [waitedForAuth, setWaitedForAuth] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Give auth context time to initialize before making redirect decision
  // This prevents race condition where we redirect to signin before auth loads
  useEffect(() => {
    // Wait a brief moment for auth to settle after initial load
    if (!isLoading && !waitedForAuth) {
      timerRef.current = setTimeout(() => {
        setWaitedForAuth(true)
      }, 500) // Give auth 500ms to fully initialize
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isLoading, waitedForAuth])

  useEffect(() => {
    // Don't redirect until we've waited for auth to settle
    if (isLoading || !waitedForAuth) return

    console.log('🔀 Dashboard redirect check:', {
      isAuthenticated,
      userId: user?.id,
      userEmail: user?.email,
      waitedForAuth
    })

    if (isAuthenticated && user?.id) {
      // Redirect to user's storyteller dashboard
      console.log('🔀 Redirecting to storyteller dashboard:', user.id)
      router.replace(`/storytellers/${user.id}/dashboard`)
    } else {
      // Not authenticated after waiting, redirect to sign in
      console.log('🔀 Not authenticated after auth check, redirecting to signin')
      router.replace('/auth/signin?redirect=/dashboard')
    }
  }, [isLoading, isAuthenticated, user?.id, user?.email, router, waitedForAuth])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading your dashboard...</p>
      </div>
    </div>
  )
}
