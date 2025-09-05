'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { StoryCard } from '@/components/story/story-card'
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
  Loader2
} from 'lucide-react'

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
  { value: 'traditional', label: 'Traditional' },
  { value: 'personal', label: 'Personal' },
  { value: 'historical', label: 'Historical' },
  { value: 'educational', label: 'Educational' },
  { value: 'healing', label: 'Healing' }
]

const AUDIENCES = [
  { value: 'all', label: 'All Ages' },
  { value: 'children', label: 'Children' },
  { value: 'youth', label: 'Youth' },
  { value: 'adults', label: 'Adults' },
  { value: 'elders', label: 'Elders' }
]

const CULTURAL_SENSITIVITY = [
  { value: 'low', label: 'Low Sensitivity' },
  { value: 'medium', label: 'Medium Sensitivity' },
  { value: 'high', label: 'High Sensitivity' }
]

export default function StoriesPage() {
  const [stories, setStories] = useState<StoryWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    audience: '',
    cultural_sensitivity: '',
    featured: '',
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
      if (filters.type) params.append('type', filters.type)
      if (filters.audience) params.append('audience', filters.audience)
      if (filters.cultural_sensitivity) params.append('cultural_sensitivity', filters.cultural_sensitivity)
      if (filters.featured) params.append('featured', filters.featured)
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
      type: '',
      audience: '',
      cultural_sensitivity: '',
      featured: '',
      location: '',
      tag: ''
    })
    setSearchTerm('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-earth-50 to-white">
      {/* Hero Section */}
      <div className="bg-earth-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-12 w-12 text-earth-300" />
            </div>
            <Typography variant="h1" className="text-white mb-4">
              Cultural Stories
            </Typography>
            <Typography variant="large" className="text-earth-200 max-w-2xl mx-auto">
              Discover the rich tapestry of cultural narratives, traditional wisdom, 
              and personal stories from our diverse community of storytellers.
            </Typography>
            <div className="flex justify-center mt-6 gap-6 text-earth-300">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span>{pagination.total} Stories</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Community Contributors</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                <span>Elder Approved</span>
              </div>
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search stories, themes, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* View Toggle and Filter Button */}
            <div className="flex items-center gap-2">
              <div className="flex border border-gray-300 rounded-md">
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
                  className="rounded-l-none border-l"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Story Type</label>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any type</SelectItem>
                      {STORY_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Audience</label>
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
                  <label className="text-sm font-medium mb-2 block">Cultural Sensitivity</label>
                  <Select value={filters.cultural_sensitivity} onValueChange={(value) => handleFilterChange('cultural_sensitivity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any level</SelectItem>
                      {CULTURAL_SENSITIVITY.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Featured</label>
                  <Select value={filters.featured} onValueChange={(value) => handleFilterChange('featured', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All stories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All stories</SelectItem>
                      <SelectItem value="true">Featured only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <Typography variant="small" className="text-gray-600">
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
              <Loader2 className="h-8 w-8 animate-spin text-earth-600 mx-auto mb-4" />
              <Typography variant="body" className="text-gray-600">
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
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <Typography variant="h3" className="text-gray-600 mb-2">
                  No stories found
                </Typography>
                <Typography variant="body" className="text-gray-500 mb-6">
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
    </div>
  )
}