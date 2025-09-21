'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Typography } from '@/components/ui/typography'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { StoryCard } from '@/components/story/story-card'
import { cn } from '@/lib/utils'
import { 
  ArrowLeft,
  BookOpen,
  Crown,
  Filter,
  Star,
  Calendar,
  Eye,
  User,
  Plus
} from 'lucide-react'

interface Story {
  id: string
  title: string
  content: string
  status: 'draft' | 'review' | 'published' | 'archived'
  featured: boolean
  story_type: 'traditional' | 'personal' | 'historical' | 'educational' | 'healing'
  audience: 'children' | 'youth' | 'adults' | 'elders' | 'all'
  cultural_sensitivity_level: 'low' | 'medium' | 'high'
  elder_approval: boolean | null
  cultural_review_status: 'pending' | 'approved' | 'rejected' | 'needs_changes'
  views_count: number
  likes_count: number
  shares_count: number
  reading_time_minutes: number | null
  tags: string[] | null
  location: string | null
  created_at: string
  storyteller?: {
    id: string
    display_name: string
    elder_status: boolean
    cultural_background: string
    profile?: {
      avatar_url?: string
      cultural_affiliations?: string[]
    }
  }
}

interface Storyteller {
  id: string
  display_name: string
  elder_status: boolean
  cultural_background: string
  story_count: number
}

interface StoryFilters {
  status: string
  story_type: string
  featured: string
  sortBy: string
}

const initialFilters: StoryFilters = {
  status: 'published',
  story_type: 'all',
  featured: 'all',
  sortBy: 'created_at'
}

const storyTypes = [
  { value: 'traditional', label: 'Traditional Stories' },
  { value: 'personal', label: 'Personal Narratives' },
  { value: 'historical', label: 'Historical Stories' },
  { value: 'educational', label: 'Educational Stories' },
  { value: 'healing', label: 'Healing Stories' }
]

const statusTypes = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Under Review' },
  { value: 'archived', label: 'Archived' }
]

const sortOptions = [
  { value: 'created_at', label: 'Most Recent' },
  { value: 'views_count', label: 'Most Viewed' },
  { value: 'likes_count', label: 'Most Liked' },
  { value: 'title', label: 'Alphabetical' }
]

export default function StorytellerStoriesPage() {
  const params = useParams()
  const storytellerId = params.id as string

  const [stories, setStories] = useState<Story[]>([])
  const [storyteller, setStoryteller] = useState<Storyteller | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<StoryFilters>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch data
  useEffect(() => {
    async function fetchStories() {
      try {
        setLoading(true)
        const queryParams = new URLSearchParams({
          status: filters.status,
          ...(filters.story_type !== 'all' && { story_type: filters.story_type }),
          ...(filters.featured !== 'all' && { featured: filters.featured }),
          limit: '50'
        })

        const response = await fetch(`/api/storytellers/${storytellerId}/stories?${queryParams}`)
        if (!response.ok) {
          throw new Error('Failed to fetch stories')
        }

        const data = await response.json()
        setStories(data.stories || [])
        setStoryteller(data.storyteller)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (storytellerId) {
      fetchStories()
    }
  }, [storytellerId, filters])

  // Filter and sort stories
  const filteredAndSortedStories = useMemo(() => {
    return stories.sort((a, b) => {
      switch (filters.sortBy) {
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'views_count':
          return (b.views_count || 0) - (a.views_count || 0)
        case 'likes_count':
          return (b.likes_count || 0) - (a.likes_count || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })
  }, [stories, filters.sortBy])

  const updateFilter = (key: keyof StoryFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getStoryTypeColor = (type: string) => {
    const colours = {
      traditional: 'bg-purple-100 text-purple-800',
      personal: 'bg-blue-100 text-blue-800',
      historical: 'bg-indigo-100 text-indigo-800',
      educational: 'bg-green-100 text-green-800',
      healing: 'bg-rose-100 text-rose-800'
    }
    return colours[type as keyof typeof colours] || 'bg-grey-100 text-grey-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-earth-200 rounded w-64 mb-4"></div>
            <div className="h-32 bg-earth-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-earth-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Typography variant="h2" className="text-red-600 mb-4">
              Unable to Load Stories
            </Typography>
            <Typography variant="body" className="text-grey-600 mb-6">
              {error}
            </Typography>
            <Button asChild>
              <Link href={`/storytellers/${storytellerId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-earth-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/storytellers/${storytellerId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-6">
              {storyteller && (
                <>
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={stories[0]?.storyteller?.profile?.avatar_url} 
                      alt={storyteller.display_name}
                    />
                    <AvatarFallback className="bg-earth-200 text-earth-700 text-lg">
                      {getInitials(storyteller.display_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Typography variant="h1" className="text-earth-800">
                        Stories by {storyteller.display_name}
                      </Typography>
                      {storyteller.elder_status && (
                        <Crown className="w-6 h-6 text-purple-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-grey-600">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{storyteller.story_count} total stories</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{storyteller.cultural_background}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{filteredAndSortedStories.length} {filters.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/storytellers/${storytellerId}/galleries`}>
                        View Galleries
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/stories/create?storyteller=${storytellerId}`}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Story
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Card className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-grey-400" />
                <Typography variant="small" className="font-medium">
                  Filter Stories:
                </Typography>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger className="w-full sm:w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusTypes.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="all">All Status</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.story_type} onValueChange={(value) => updateFilter('story_type', value)}>
                  <SelectTrigger className="w-full sm:w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {storyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.featured} onValueChange={(value) => updateFilter('featured', value)}>
                  <SelectTrigger className="w-full sm:w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stories</SelectItem>
                    <SelectItem value="true">Featured Only</SelectItem>
                    <SelectItem value="false">Regular Stories</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger className="w-full sm:w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>

        {/* Story Stats */}
        {filteredAndSortedStories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 text-center">
              <Typography variant="h3" className="text-earth-800 mb-1">
                {filteredAndSortedStories.length}
              </Typography>
              <Typography variant="small" className="text-grey-600">
                {filters.status} Stories
              </Typography>
            </Card>

            <Card className="p-4 text-center">
              <Typography variant="h3" className="text-green-600 mb-1">
                {filteredAndSortedStories.filter(s => s.featured).length}
              </Typography>
              <Typography variant="small" className="text-grey-600">
                Featured
              </Typography>
            </Card>

            <Card className="p-4 text-center">
              <Typography variant="h3" className="text-blue-600 mb-1">
                {filteredAndSortedStories.reduce((sum, s) => sum + (s.views_count || 0), 0)}
              </Typography>
              <Typography variant="small" className="text-grey-600">
                Total Views
              </Typography>
            </Card>

            <Card className="p-4 text-center">
              <Typography variant="h3" className="text-red-600 mb-1">
                {filteredAndSortedStories.reduce((sum, s) => sum + (s.likes_count || 0), 0)}
              </Typography>
              <Typography variant="small" className="text-grey-600">
                Total Likes
              </Typography>
            </Card>
          </div>
        )}

        {/* Story Types Summary */}
        {filteredAndSortedStories.length > 0 && (
          <div className="mb-8">
            <Typography variant="h3" className="mb-4">Story Types</Typography>
            <div className="flex flex-wrap gap-2">
              {storyTypes.map((type) => {
                const count = filteredAndSortedStories.filter(s => s.story_type === type.value).length
                if (count === 0) return null
                return (
                  <Badge 
                    key={type.value} 
                    className={cn('text-xs', getStoryTypeColor(type.value))}
                  >
                    {type.label} ({count})
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {/* Stories Grid */}
        {filteredAndSortedStories.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-grey-300 mx-auto mb-4" />
            <Typography variant="h3" className="text-grey-600 mb-2">
              No Stories Found
            </Typography>
            <Typography variant="body" className="text-grey-500 mb-6">
              {storyteller?.display_name || 'This storyteller'} hasn't {filters.status === 'published' ? 'published' : 'created'} any stories yet.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" onClick={() => updateFilter('status', 'all')}>
                View All Stories
              </Button>
              <Button asChild>
                <Link href={`/stories/create?storyteller=${storytellerId}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Story
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                variant="default"
                showActions={true}
              />
            ))}
          </div>
        )}

        {/* Load More (if implementing pagination later) */}
        {filteredAndSortedStories.length >= 50 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Stories
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}