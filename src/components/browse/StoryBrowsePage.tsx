'use client'

import React, { useState, useEffect } from 'react'
import { FilterSidebar } from './FilterSidebar'
import { SortSelector } from './SortSelector'
import { ViewToggle } from './ViewToggle'
import { StoryPreviewCard } from './StoryPreviewCard'
import { Pagination } from './Pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Story {
  id: string
  title: string
  excerpt: string
  storyteller: {
    id: string
    display_name: string
    cultural_background?: string
    avatar_url?: string
  }
  featured_image_url?: string
  story_type: 'text' | 'audio' | 'video' | 'mixed'
  reading_time_minutes?: number
  views_count?: number
  cultural_tags?: string[]
  language?: string
  created_at: string
}

interface FilterState {
  themes: string[]
  culturalGroups: string[]
  mediaTypes: string[]
  languages: string[]
}

interface StoryBrowsePageProps {
  className?: string
}

export function StoryBrowsePage({ className }: StoryBrowsePageProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [filteredStories, setFilteredStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('recent')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<FilterState>({
    themes: [],
    culturalGroups: [],
    mediaTypes: [],
    languages: []
  })
  const [showFilters, setShowFilters] = useState(true)

  const storiesPerPage = viewMode === 'grid' ? 12 : 10

  // Fetch stories
  useEffect(() => {
    async function fetchStories() {
      try {
        setLoading(true)
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: storiesPerPage.toString(),
          sort: sortBy
        })

        // Add filters
        if (filters.themes.length > 0) {
          queryParams.append('themes', filters.themes.join(','))
        }
        if (filters.culturalGroups.length > 0) {
          queryParams.append('cultural_groups', filters.culturalGroups.join(','))
        }
        if (filters.mediaTypes.length > 0) {
          queryParams.append('media_types', filters.mediaTypes.join(','))
        }
        if (filters.languages.length > 0) {
          queryParams.append('languages', filters.languages.join(','))
        }

        const response = await fetch(`/api/stories/browse?${queryParams}`)
        if (!response.ok) throw new Error('Failed to fetch stories')

        const data = await response.json()
        setStories(data.stories || [])
        setFilteredStories(data.stories || [])
        setTotalPages(data.pagination?.pages || 1)
      } catch (error) {
        console.error('Error fetching stories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [currentPage, storiesPerPage, sortBy, filters])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleClearFilters = () => {
    setFilters({
      themes: [],
      culturalGroups: [],
      mediaTypes: [],
      languages: []
    })
    setCurrentPage(1)
  }

  const activeFilterCount =
    filters.themes.length +
    filters.culturalGroups.length +
    filters.mediaTypes.length +
    filters.languages.length

  return (
    <div className={cn("min-h-screen bg-[#F8F6F1]", className)}>
      {/* Header */}
      <div className="bg-white border-b border-[#2C2C2C]/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <Badge
              variant="outline"
              className="border-[#D97757] text-[#D97757] bg-[#D97757]/5"
            >
              Browse Stories
            </Badge>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2C2C2C]">
              Discover Stories
            </h1>
            <p className="text-lg text-[#2C2C2C]/70 max-w-2xl">
              Explore stories shared by Indigenous communities with respect, consent, and cultural protocols
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside
            className={cn(
              "lg:w-80 flex-shrink-0",
              !showFilters && "hidden lg:block"
            )}
          >
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              activeFilterCount={activeFilterCount}
            />
          </aside>

          {/* Stories */}
          <main className="flex-1 min-w-0">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  {showFilters ? 'Hide' : 'Show'} Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 bg-[#D97757] text-white">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
                <p className="text-sm text-[#2C2C2C]/60">
                  {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'} found
                </p>
              </div>

              <div className="flex items-center gap-3">
                <SortSelector value={sortBy} onChange={setSortBy} />
                <ViewToggle value={viewMode} onChange={setViewMode} />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-[#D97757] animate-spin mb-4" />
                <p className="text-[#2C2C2C]/60">Loading stories...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredStories.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <BookOpen className="w-16 h-16 text-[#2C2C2C]/20 mb-4" />
                <h3 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-2">
                  No Stories Found
                </h3>
                <p className="text-[#2C2C2C]/60 mb-6">
                  Try adjusting your filters to see more results
                </p>
                {activeFilterCount > 0 && (
                  <Button
                    onClick={handleClearFilters}
                    className="bg-[#D97757] hover:bg-[#D97757]/90 text-white"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}

            {/* Stories Grid/List */}
            {!loading && filteredStories.length > 0 && (
              <>
                <div
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-6'
                  )}
                >
                  {filteredStories.map((story) => (
                    <StoryPreviewCard
                      key={story.id}
                      story={story}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
