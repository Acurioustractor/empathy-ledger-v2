'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { StoryCard } from '@/components/story/story-card'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import type { Story } from '@/types/database'
import { cn } from '@/lib/utils'
import {
  Search,
  Filter,
  BookOpen,
  Users,
  Crown,
  MapPin,
  Star,
  Grid3X3,
  List,
  Loader2,
  Mic,
  Heart,
  Tag
} from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import Link from 'next/link'
import {
  STORY_TYPES as THEME_STORY_TYPES,
  THEME_CATEGORIES,
  SENSITIVITY_LEVELS,
  formatThemeLabel
} from '@/lib/constants/themes'

interface StoryWithRelations extends Story {
  storyteller?: {
    id: string
    display_name: string
    bio?: string
    cultural_background?: string
    elder_status: boolean
    profile?: {
      avatar_url?: string
      cultural_affiliations?: string[]
    }
  }
  author?: {
    id: string
    display_name: string
    first_name?: string
    last_name?: string
    avatar_url?: string
  }
}

interface StoriesResponse {
  stories: StoryWithRelations[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const STORY_TYPES = [
  { value: 'personal', label: 'Personal Journey' },
  { value: 'family', label: 'Family Stories' },
  { value: 'community', label: 'Community Stories' },
  { value: 'cultural', label: 'Cultural Heritage' },
  { value: 'professional', label: 'Professional Life' },
  { value: 'historical', label: 'Historical Events' },
  { value: 'educational', label: 'Educational' },
  { value: 'healing', label: 'Healing & Recovery' }
]

const AUDIENCES = [
  { value: 'all', label: 'All Ages' },
  { value: 'children', label: 'Children' },
  { value: 'youth', label: 'Youth' },
  { value: 'adults', label: 'Adults' },
  { value: 'elders', label: 'Elders' }
]

const CONTENT_LEVELS = [
  { value: 'public', label: 'Public Stories' },
  { value: 'sensitive', label: 'Culturally Sensitive' },
  { value: 'community', label: 'Community Only' }
]

export default function StoriesPage() {
  const [stories, setStories] = useState<StoryWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: 'all',
    theme: 'all',
    audience: 'all',
    cultural_sensitivity: 'all',
    featured: 'all',
    location: '',
    tag: ''
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [showFilters, setShowFilters] = useState(false)

  const fetchStories = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: 'published'
      })

      if (searchTerm) params.append('search', searchTerm)
      if (filters.type && filters.type !== 'all') params.append('type', filters.type)
      if (filters.theme && filters.theme !== 'all') params.append('theme', filters.theme)
      if (filters.audience && filters.audience !== 'all') params.append('audience', filters.audience)
      if (filters.cultural_sensitivity && filters.cultural_sensitivity !== 'all') params.append('cultural_sensitivity', filters.cultural_sensitivity)
      if (filters.featured && filters.featured !== 'all') params.append('featured', filters.featured)
      if (filters.location) params.append('location', filters.location)
      if (filters.tag) params.append('tag', filters.tag)

      const response = await fetch(`/api/stories?${params}`)
      if (!response.ok) throw new Error('Failed to fetch stories')

      const data: StoriesResponse = await response.json()
      setStories(data.stories)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [pagination.page, searchTerm, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      type: 'all',
      theme: 'all',
      audience: 'all',
      cultural_sensitivity: 'all',
      featured: 'all',
      location: '',
      tag: ''
    })
    setSearchTerm('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => 
    value && value !== 'all'
  ).length

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section - Mobile First */}
      <div className="bg-gradient-to-br from-earth-800 via-earth-700 to-clay-800 dark:from-earth-900 dark:via-earth-800 dark:to-clay-900 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 flex items-center justify-center">
                <Heart className="h-8 w-8 md:h-10 md:w-10 text-earth-200" />
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-6">
              Stories That Shape Us
            </h1>
            <p className="text-earth-200 max-w-3xl mx-auto mb-6 md:mb-8 text-sm md:text-base lg:text-lg">
              Discover the rich tapestry of human experience through personal journeys, family histories,
              community tales, and cultural wisdom from storytellers around the world.
            </p>

            {/* Stats - Responsive Grid */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-earth-200">
              <div className="flex items-center gap-2 text-sm md:text-base">
                <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                <span className="font-semibold">{pagination.total}</span>
                <span className="hidden sm:inline">Stories</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <Users className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Global Contributors</span>
                <span className="sm:hidden">Contributors</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base">
                <Star className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Featured Stories</span>
                <span className="sm:hidden">Featured</span>
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="mt-6 md:hidden">
              <Link href="/capture">
                <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Mic className="w-4 h-4 mr-2" />
                  Share Your Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search stories, themes, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* View Toggle and Filter Button */}
            <div className="flex items-center gap-2">
              <div className="flex border border-border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none border-l border-border"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "relative transition-all duration-200",
                  showFilters && "bg-muted border-primary/30"
                )}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs bg-primary text-primary-foreground">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="p-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-2 block">Story Type</label>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any type</SelectItem>
                      {STORY_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-2 block">
                    <Tag className="w-3.5 h-3.5 inline mr-1" />
                    Theme
                  </label>
                  <Select value={filters.theme} onValueChange={(value) => handleFilterChange('theme', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any theme</SelectItem>
                      {Object.entries(THEME_CATEGORIES).map(([category, data]) => (
                        <React.Fragment key={category}>
                          <SelectItem value={`__category_${category}`} disabled className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                            {data.label}
                          </SelectItem>
                          {data.themes.map((theme) => (
                            <SelectItem key={theme} value={theme} className="pl-6">
                              {formatThemeLabel(theme)}
                            </SelectItem>
                          ))}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-2 block">Audience</label>
                  <Select value={filters.audience} onValueChange={(value) => handleFilterChange('audience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {AUDIENCES.map(audience => (
                        <SelectItem key={audience.value} value={audience.value}>
                          {audience.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-2 block">Content Level</label>
                  <Select value={filters.cultural_sensitivity} onValueChange={(value) => handleFilterChange('cultural_sensitivity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any level</SelectItem>
                      {SENSITIVITY_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground/80 mb-2 block">Featured</label>
                  <Select value={filters.featured} onValueChange={(value) => handleFilterChange('featured', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All stories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All stories</SelectItem>
                      <SelectItem value="true">Featured only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                <Typography variant="small" className="text-muted-foreground">
                  {pagination.total} stories found
                </Typography>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <Typography variant="body" className="text-muted-foreground">
                Loading stories...
              </Typography>
            </div>
          </div>
        )}

        {/* Stories Grid */}
        {!loading && (
          <>
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                : 'space-y-4'
            )}>
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                />
              ))}
            </div>

            {/* Empty State */}
            {stories.length === 0 && (
              <div className="text-center py-20">
                <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <Typography variant="h3" className="text-muted-foreground mb-2">
                  No stories found
                </Typography>
                <Typography variant="body" className="text-muted-foreground/70 mb-6">
                  Try adjusting your search terms or filters to find more stories.
                </Typography>
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={pagination.page === page ? 'default' : 'outline'}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
                
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Mobile spacer */}
      <div className="h-20 md:hidden" />
    </div>
  )
}