/**
 * JusticeHub Story Card Component
 *
 * Example implementation for displaying Empathy Ledger syndicated stories
 * on JusticeHub website.
 *
 * Features:
 * - Fetches story from Empathy Ledger Content Access API
 * - Displays with required attribution
 * - Tracks engagement (views, clicks)
 * - Handles revocation gracefully (shows removed message)
 * - Responsive design
 * - Accessible (ARIA labels, keyboard navigation)
 *
 * Usage:
 *   <JusticeHubStoryCard
 *     storyId="story-uuid"
 *     embedToken="token-from-consent-approval"
 *   />
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Heart,
  Eye,
  Share2,
  ExternalLink,
  AlertCircle
} from 'lucide-react'

interface EmpathyLedgerStory {
  id: string
  title: string
  excerpt: string
  content: string
  themes: string[]
  createdAt: string
  storyteller: {
    id: string
    displayName: string
    avatarUrl?: string
  }
  mediaAssets: Array<{
    id: string
    filename: string
    mediaType: string
    thumbnailUrl: string
  }>
}

interface Attribution {
  platform: string
  url: string
  message: string
}

interface StoryCardProps {
  storyId: string
  embedToken: string
  showFullContent?: boolean
  className?: string
  onView?: () => void
  onClick?: () => void
  onRemoved?: () => void
}

export default function JusticeHubStoryCard({
  storyId,
  embedToken,
  showFullContent = false,
  className = '',
  onView,
  onClick,
  onRemoved
}: StoryCardProps) {
  const [story, setStory] = useState<EmpathyLedgerStory | null>(null)
  const [attribution, setAttribution] = useState<Attribution | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewTracked, setViewTracked] = useState(false)

  useEffect(() => {
    fetchStory()
  }, [storyId, embedToken])

  useEffect(() => {
    if (story && !viewTracked) {
      trackEngagement('view')
      setViewTracked(true)
      onView?.()
    }
  }, [story, viewTracked])

  const fetchStory = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch from Empathy Ledger Content Access API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_EMPATHY_LEDGER_API_URL}/syndication/content/${storyId}`,
        {
          headers: {
            'Authorization': `Bearer ${embedToken}`,
            'X-Site-ID': process.env.NEXT_PUBLIC_EMPATHY_LEDGER_SITE_ID!
          }
        }
      )

      // Handle revocation (404)
      if (response.status === 404) {
        setError('This story has been removed by the storyteller')
        onRemoved?.()
        return
      }

      // Handle forbidden (sacred content, permissions changed)
      if (response.status === 403) {
        const data = await response.json()
        setError(data.message || 'This story is no longer available for sharing')
        onRemoved?.()
        return
      }

      // Handle unauthorized (token expired/revoked)
      if (response.status === 401) {
        setError('Access to this story has expired')
        onRemoved?.()
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch story: ${response.statusText}`)
      }

      const data = await response.json()
      setStory(data.story)
      setAttribution(data.attribution)

    } catch (err) {
      console.error('Error fetching story:', err)
      setError(err instanceof Error ? err.message : 'Failed to load story')
    } finally {
      setLoading(false)
    }
  }

  const trackEngagement = async (eventType: 'view' | 'click' | 'share') => {
    try {
      await fetch('/api/empathy-ledger/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          embedToken,
          eventType,
          timestamp: new Date().toISOString()
        })
      })
    } catch (err) {
      // Fail silently - don't break UX for tracking failures
      console.error('Failed to track engagement:', err)
    }
  }

  const handleReadMore = () => {
    trackEngagement('click')
    onClick?.()
  }

  const handleShare = async () => {
    trackEngagement('share')

    // Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: story?.title,
          text: story?.excerpt,
          url: attribution?.url
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${className}`}>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900 mb-1">
              Story No Longer Available
            </h3>
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!story) return null

  return (
    <article
      className={`bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow ${className}`}
      aria-label={`Story: ${story.title}`}
    >
      {/* Featured Image */}
      {story.mediaAssets[0] && (
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={story.mediaAssets[0].thumbnailUrl}
            alt={`Image for ${story.title}`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Storyteller */}
        <div className="flex items-center gap-3 mb-4">
          {story.storyteller.avatarUrl ? (
            <Image
              src={story.storyteller.avatarUrl}
              alt={story.storyteller.displayName}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium text-lg">
                {story.storyteller.displayName[0]}
              </span>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Story by</p>
            <p className="font-medium text-gray-900">{story.storyteller.displayName}</p>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
          {story.title}
        </h2>

        {/* Themes */}
        {story.themes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {story.themes.slice(0, 3).map(theme => (
              <span
                key={theme}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
              >
                {theme}
              </span>
            ))}
            {story.themes.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                +{story.themes.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Excerpt or Full Content */}
        <div className="text-gray-700 mb-6">
          {showFullContent ? (
            <div className="prose max-w-none">
              {story.content}
            </div>
          ) : (
            <p className="line-clamp-3">{story.excerpt}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Read More */}
          {!showFullContent && (
            <a
              href={attribution?.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleReadMore}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Read Full Story</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Share this story"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Attribution Footer (REQUIRED) */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 mb-1">
              {attribution?.message || 'This story is shared with permission via Empathy Ledger'}
            </p>
            <a
              href="https://empathyledger.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
            >
              <Heart className="h-3 w-3" />
              <span>Empathy Ledger</span>
            </a>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Shared Story
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
