'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/context/auth.context'
import { useRouter } from 'next/navigation'

export default function DashboardRedirectPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated && user?.id) {
      // Redirect to user's storyteller dashboard
      console.log('🔀 Redirecting to storyteller dashboard:', user.id)
      router.replace(`/storytellers/${user.id}/dashboard`)
    } else {
      // Not authenticated, redirect to sign in
      console.log('🔀 Not authenticated, redirecting to signin')
      router.replace('/auth/signin?redirect=/dashboard')
    }
  }, [isLoading, isAuthenticated, user?.id, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading your dashboard...</p>
      </div>
    </div>
  )
}
