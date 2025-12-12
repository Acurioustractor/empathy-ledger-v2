'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ExternalLink } from 'lucide-react'

interface Story {
  id: string
  title: string
  summary: string
  featured_image: string | null
  storyteller: {
    display_name: string
    avatar_url: string | null
  } | null
  themes: string[]
  created_at: string
}

type Layout = 'grid' | 'list' | 'carousel'
type Theme = 'light' | 'dark' | 'earth'

export default function EmbedCatalogPage() {
  const searchParams = useSearchParams()

  // Config from query params
  const appId = searchParams?.get('app') || ''
  const layout = (searchParams?.get('layout') || 'grid') as Layout
  const columns = parseInt(searchParams?.get('columns') || '3')
  const limit = parseInt(searchParams?.get('limit') || '12')
  const theme = (searchParams?.get('theme') || 'light') as Theme
  const showAttribution = searchParams?.get('attribution') !== 'false'

  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStories() {
      if (!appId) {
        setError('Missing app ID')
        setLoading(false)
        return
      }

      try {
        // In production, this would use a public endpoint with app validation
        const res = await fetch(`/api/embed/catalog?app=${appId}&limit=${limit}`)
        if (!res.ok) throw new Error('Failed to fetch stories')

        const data = await res.json()
        setStories(data.stories || [])
      } catch (err) {
        console.error('Error fetching stories:', err)
        setError('Unable to load stories')
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [appId, limit])

  // Theme styles
  const themeStyles = {
    light: {
      background: 'bg-white',
      text: 'text-stone-900',
      subtext: 'text-stone-500',
      card: 'bg-stone-50 hover:bg-stone-100',
      border: 'border-stone-200'
    },
    dark: {
      background: 'bg-stone-950',
      text: 'text-white',
      subtext: 'text-stone-400',
      card: 'bg-stone-900 hover:bg-stone-800',
      border: 'border-stone-700'
    },
    earth: {
      background: 'bg-earth-50',
      text: 'text-earth-900',
      subtext: 'text-earth-600',
      card: 'bg-white hover:bg-earth-100',
      border: 'border-earth-200'
    }
  }

  const styles = themeStyles[theme]

  if (loading) {
    return (
      <div className={`min-h-screen ${styles.background} p-4`}>
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className={`${styles.card} rounded-lg animate-pulse`}>
              <div className="aspect-video bg-stone-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || stories.length === 0) {
    return (
      <div className={`min-h-screen ${styles.background} flex items-center justify-center`}>
        <p className={styles.subtext}>{error || 'No stories available'}</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${styles.background} p-4`}>
      {/* Grid layout */}
      {layout === 'grid' && (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${Math.min(columns, 4)}, 1fr)` }}
        >
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              appId={appId}
              styles={styles}
              showAttribution={showAttribution}
            />
          ))}
        </div>
      )}

      {/* List layout */}
      {layout === 'list' && (
        <div className="space-y-4">
          {stories.map((story) => (
            <StoryListItem
              key={story.id}
              story={story}
              appId={appId}
              styles={styles}
              showAttribution={showAttribution}
            />
          ))}
        </div>
      )}

      {/* Attribution footer */}
      {showAttribution && (
        <div className={`mt-6 pt-4 border-t ${styles.border} flex items-center justify-center gap-2 ${styles.subtext} text-sm`}>
          <span>Stories powered by</span>
          <a
            href="https://empathyledger.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline flex items-center gap-1"
          >
            Empathy Ledger
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  )
}

function StoryCard({
  story,
  appId,
  styles,
  showAttribution
}: {
  story: Story
  appId: string
  styles: Record<string, string>
  showAttribution: boolean
}) {
  const storyUrl = `https://empathyledger.com/stories/${story.id}`
  const trackingPixel = `/api/beacon?story=${story.id}&event=view&platform=${appId}`

  return (
    <a
      href={storyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`block ${styles.card} rounded-lg overflow-hidden border ${styles.border} transition-colors`}
    >
      {/* Featured image */}
      {story.featured_image ? (
        <div className="aspect-video relative overflow-hidden">
          <img
            src={story.featured_image}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-sage-100 to-earth-100" />
      )}

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className={`font-semibold line-clamp-2 ${styles.text}`}>
          {story.title}
        </h3>

        {story.summary && (
          <p className={`text-sm line-clamp-2 ${styles.subtext}`}>
            {story.summary}
          </p>
        )}

        {/* Storyteller attribution */}
        {story.storyteller && (
          <div className="flex items-center gap-2 pt-2">
            {story.storyteller.avatar_url ? (
              <img
                src={story.storyteller.avatar_url}
                alt={story.storyteller.display_name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-sage-200 flex items-center justify-center text-xs font-medium text-sage-700">
                {story.storyteller.display_name[0]}
              </div>
            )}
            <span className={`text-sm ${styles.subtext}`}>
              {story.storyteller.display_name}
            </span>
          </div>
        )}
      </div>

      {/* Tracking pixel */}
      <img
        src={trackingPixel}
        alt=""
        width="1"
        height="1"
        style={{ opacity: 0, position: 'absolute' }}
      />
    </a>
  )
}

function StoryListItem({
  story,
  appId,
  styles,
  showAttribution
}: {
  story: Story
  appId: string
  styles: Record<string, string>
  showAttribution: boolean
}) {
  const storyUrl = `https://empathyledger.com/stories/${story.id}`
  const trackingPixel = `/api/beacon?story=${story.id}&event=view&platform=${appId}`

  return (
    <a
      href={storyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex gap-4 ${styles.card} rounded-lg overflow-hidden border ${styles.border} p-4 transition-colors`}
    >
      {/* Thumbnail */}
      {story.featured_image && (
        <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden">
          <img
            src={story.featured_image}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold line-clamp-1 ${styles.text}`}>
          {story.title}
        </h3>

        {story.summary && (
          <p className={`text-sm line-clamp-2 mt-1 ${styles.subtext}`}>
            {story.summary}
          </p>
        )}

        {/* Storyteller */}
        {story.storyteller && (
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-sm ${styles.subtext}`}>
              by {story.storyteller.display_name}
            </span>
          </div>
        )}
      </div>

      {/* Tracking pixel */}
      <img
        src={trackingPixel}
        alt=""
        width="1"
        height="1"
        style={{ opacity: 0, position: 'absolute' }}
      />
    </a>
  )
}
