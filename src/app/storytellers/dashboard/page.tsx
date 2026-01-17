'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/context/auth.context'
import { useRouter } from 'next/navigation'

export default function DashboardRedirectPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('🔀 Dashboard redirect check:', {
      isAuthenticated,
      userId: user?.id,
      userEmail: user?.email
    })
    if (isAuthenticated && user?.id) {
      // Redirect to user's specific storyteller dashboard
      console.log('🔀 Redirecting to:', `/storytellers/${user.id}/dashboard`)
      router.replace(`/storytellers/${user.id}/dashboard`)
    } else if (!isAuthenticated) {
      // Redirect to sign in if not authenticated
      console.log('🔀 Not authenticated, redirecting to signin')
      router.replace('/auth/signin')
    }
  }, [isAuthenticated, user?.id, user?.email, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading your dashboard...</p>
      </div>
    </div>
  )
}