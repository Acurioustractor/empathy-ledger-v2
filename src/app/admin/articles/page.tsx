'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Redirect page: Articles are now managed in the unified Content & Stories admin.
 *
 * As of January 2026, articles and stories are consolidated into a single
 * 'stories' table with article_type field to distinguish content types.
 *
 * This page redirects to /admin/stories?contentType=articles
 */
export default function ArticlesRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to stories admin with articles filter pre-selected
    router.replace('/admin/stories')
  }, [router])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Redirecting to unified Content & Stories admin...</p>
          <p className="text-sm text-stone-400 mt-2">Articles are now managed alongside stories</p>
        </div>
      </div>
    </div>
  )
}
