'use client'

import React, { useEffect, useState } from 'react'
import { HeroSection } from './HeroSection'
import { TerritoryAcknowledgment } from './TerritoryAcknowledgment'
import { FeaturedStoriesGrid } from './FeaturedStoriesGrid'
import { BrowseByTheme } from './BrowseByTheme'
import { RecentStoriesCarousel } from './RecentStoriesCarousel'
import { StorytellerSpotlight } from './StorytellerSpotlight'
import { PlatformStats } from './PlatformStats'
import { OCAPCallout } from './OCAPCallout'

interface Story {
  id: string
  title: string
  excerpt: string
  storyteller: {
    display_name: string
    cultural_background?: string
    avatar_url?: string
  }
  featured_image_url?: string
  story_type: 'text' | 'audio' | 'video' | 'mixed'
  reading_time_minutes?: number
  views_count?: number
  likes_count?: number
  cultural_tags?: string[]
  cultural_territory?: string
  created_at: string
}

interface Theme {
  id: string
  name: string
  slug: string
  description: string
  story_count: number
  icon?: string
  color?: string
}

interface Storyteller {
  id: string
  display_name: string
  cultural_background?: string
  cultural_affiliations?: string[]
  bio?: string
  avatar_url?: string
  location?: string
  story_count: number
  elder_status?: boolean
  featured?: boolean
}

interface PlatformData {
  totalStories: number
  activeStorytellers: number
  culturalCommunities: number
  countriesReached: number
}

export function PublicHomepage() {
  const [featuredStory, setFeaturedStory] = useState<Story | null>(null)
  const [featuredStories, setFeaturedStories] = useState<Story[]>([])
  const [recentStories, setRecentStories] = useState<Story[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [stats, setStats] = useState<PlatformData>({
    totalStories: 0,
    activeStorytellers: 0,
    culturalCommunities: 0,
    countriesReached: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHomepageData() {
      try {
        setLoading(true)

        // Fetch all data in parallel
        const [
          featuredStoriesRes,
          recentStoriesRes,
          featuredStorytellersRes,
          statsRes
        ] = await Promise.all([
          fetch('/api/public/featured-stories'),
          fetch('/api/public/recent-stories'),
          fetch('/api/public/storytellers/featured'),
          fetch('/api/public/stats')
        ])

        if (featuredStoriesRes.ok) {
          const data = await featuredStoriesRes.json()
          setFeaturedStory(data.stories[0] || null)
          setFeaturedStories(data.stories || [])
        }

        if (recentStoriesRes.ok) {
          const data = await recentStoriesRes.json()
          setRecentStories(data.stories || [])
        }

        if (featuredStorytellersRes.ok) {
          const data = await featuredStorytellersRes.json()
          setStorytellers(data.storytellers || [])
        }

        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data.stats || stats)
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHomepageData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-pulse">🌾</div>
          <p className="text-lg text-[#2C2C2C]/60">Loading stories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <HeroSection featuredStory={featuredStory || undefined} />

      <TerritoryAcknowledgment />

      {featuredStories.length > 0 && (
        <FeaturedStoriesGrid stories={featuredStories} />
      )}

      <BrowseByTheme themes={themes} />

      {recentStories.length > 0 && (
        <RecentStoriesCarousel stories={recentStories} />
      )}

      {storytellers.length > 0 && (
        <StorytellerSpotlight storytellers={storytellers} />
      )}

      <PlatformStats
        totalStories={stats.totalStories}
        activeStorytellers={stats.activeStorytellers}
        culturalCommunities={stats.culturalCommunities}
        countriesReached={stats.countriesReached}
      />

      <OCAPCallout />
    </div>
  )
}
