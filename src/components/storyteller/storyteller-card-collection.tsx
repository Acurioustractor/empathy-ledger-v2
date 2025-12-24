'use client'

import React, { useState, useMemo } from 'react'
import { UnifiedStorytellerCard } from './unified-storyteller-card'
import { StorytellerCardAdapter } from '@/lib/adapters/storyteller-card-adapter'
import { Typography } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Users,
  Star,
  Crown,
  MapPin,
  Building2,
  Target
} from 'lucide-react'
import type {
  EnhancedStorytellerProfile,
  StorytellerCardFilter,
  StorytellerCardSortOption,
  StorytellerCardCollectionProps,
  AISuggestionAction
} from '@/types/storyteller-card'

interface StorytellerCardCollectionState {
  viewMode: 'grid' | 'list'
  searchTerm: string
  filter: StorytellerCardFilter
  sortBy: StorytellerCardSortOption
  sortDirection: 'asc' | 'desc'
  showFilters: boolean
}

export function StorytellerCardCollection({
  storytellers,
  variant = 'default',
  displayOptions = {},
  callbacks = {},
  filter: initialFilter = {},
  sortBy: initialSortBy = 'display_name',
  sortDirection: initialSortDirection = 'asc',
  pagination,
  loading = false,
  error,
  className
}: StorytellerCardCollectionProps) {

  const [state, setState] = useState<StorytellerCardCollectionState>({
    viewMode: 'grid',
    searchTerm: '',
    filter: initialFilter,
    sortBy: initialSortBy,
    sortDirection: initialSortDirection,
    showFilters: false
  })

  // Transform legacy data if needed
  const enhancedStorytellers = useMemo(() => {
    return storytellers.map(storyteller => {
      // If data is already in enhanced format, return as-is
      if ('location_context' in storyteller && 'organisations' in storyteller) {
        return storyteller as EnhancedStorytellerProfile
      }
      // Otherwise, transform legacy data
      return StorytellerCardAdapter.transformLegacyCardData(storyteller)
    })
  }, [storytellers])

  // Filter storytellers based on search and filters
  const filteredStorytellers = useMemo(() => {
    let filtered = enhancedStorytellers

    // Apply search filter
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase()
      filtered = filtered.filter(storyteller =>
        storyteller.display_name.toLowerCase().includes(searchLower) ||
        storyteller.bio?.toLowerCase().includes(searchLower) ||
        storyteller.cultural_background?.toLowerCase().includes(searchLower) ||
        storyteller.specialties?.some(s => s.toLowerCase().includes(searchLower)) ||
        storyteller.organisations.some(org => org.name.toLowerCase().includes(searchLower)) ||
        storyteller.projects.some(proj => proj.name.toLowerCase().includes(searchLower))
      )
    }

    // Apply filters
    const filter = state.filter

    if (filter.status?.length) {
      filtered = filtered.filter(s => filter.status!.includes(s.status))
    }

    if (filter.elder_status !== undefined) {
      filtered = filtered.filter(s => s.elder_status === filter.elder_status)
    }

    if (filter.featured !== undefined) {
      filtered = filtered.filter(s => s.featured === filter.featured)
    }

    if (filter.has_ai_insights !== undefined) {
      filtered = filtered.filter(s => (!!s.ai_insights) === filter.has_ai_insights)
    }

    if (filter.profile_completeness_min !== undefined) {
      filtered = filtered.filter(s =>
        (s.ai_insights?.profile_completeness || 0) >= filter.profile_completeness_min!
      )
    }

    if (filter.organization_types?.length) {
      filtered = filtered.filter(s =>
        s.organisations.some(org => filter.organization_types!.includes(org.type || 'community'))
      )
    }

    if (filter.project_types?.length) {
      filtered = filtered.filter(s =>
        s.projects.some(proj => filter.project_types!.includes(proj.type || 'community'))
      )
    }

    if (filter.geographic_scope?.length) {
      filtered = filtered.filter(s =>
        filter.geographic_scope!.includes(s.location_context.geographic_scope || 'local')
      )
    }

    if (filter.story_count_min !== undefined) {
      filtered = filtered.filter(s => s.story_count >= filter.story_count_min!)
    }

    if (filter.years_experience_min !== undefined) {
      filtered = filtered.filter(s => (s.years_of_experience || 0) >= filter.years_experience_min!)
    }

    if (filter.last_active_within_days !== undefined) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - filter.last_active_within_days)
      filtered = filtered.filter(s => {
        if (!s.last_active) return false
        return new Date(s.last_active) >= cutoffDate
      })
    }

    return filtered
  }, [enhancedStorytellers, state.searchTerm, state.filter])

  // Sort storytellers
  const sortedStorytellers = useMemo(() => {
    const sorted = [...filteredStorytellers]

    sorted.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (state.sortBy) {
        case 'display_name':
          aValue = a.display_name.toLowerCase()
          bValue = b.display_name.toLowerCase()
          break
        case 'story_count':
          aValue = a.story_count
          bValue = b.story_count
          break
        case 'years_of_experience':
          aValue = a.years_of_experience || 0
          bValue = b.years_of_experience || 0
          break
        case 'last_active':
          aValue = new Date(a.last_active || 0).getTime()
          bValue = new Date(b.last_active || 0).getTime()
          break
        case 'profile_completeness':
          aValue = a.ai_insights?.profile_completeness || 0
          bValue = b.ai_insights?.profile_completeness || 0
          break
        case 'engagement_rate':
          aValue = a.engagement_metrics?.engagement_rate || 0
          bValue = b.engagement_metrics?.engagement_rate || 0
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return state.sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return state.sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [filteredStorytellers, state.sortBy, state.sortDirection])

  const handleAISuggestion = async (action: AISuggestionAction) => {
    if (callbacks.onApplyAISuggestion) {
      await callbacks.onApplyAISuggestion(action)
    }
  }

  const updateFilter = (updates: Partial<StorytellerCardFilter>) => {
    setState(prev => ({
      ...prev,
      filter: { ...prev.filter, ...updates }
    }))
  }

  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      filter: {},
      searchTerm: ''
    }))
  }

  const getActiveFilterCount = () => {
    return Object.keys(state.filter).length + (state.searchTerm ? 1 : 0)
  }

  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <StorytellerCardSkeleton key={i} variant={variant} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Typography variant="h3" className="text-red-600 mb-2">
          Error Loading Storytellers
        </Typography>
        <Typography variant="body" className="text-stone-600">
          {error}
        </Typography>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header Controls */}
      <div className="mb-6 space-y-4">
        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                type="text"
                placeholder="Search storytellers..."
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-sage-600 text-white text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>

            {/* Sort Control */}
            <Select
              value={`${state.sortBy}-${state.sortDirection}`}
              onValueChange={(value) => {
                const [sortBy, sortDirection] = value.split('-') as [StorytellerCardSortOption, 'asc' | 'desc']
                setState(prev => ({ ...prev, sortBy, sortDirection }))
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="display_name-asc">Name A-Z</SelectItem>
                <SelectItem value="display_name-desc">Name Z-A</SelectItem>
                <SelectItem value="story_count-desc">Most Stories</SelectItem>
                <SelectItem value="story_count-asc">Least Stories</SelectItem>
                <SelectItem value="years_of_experience-desc">Most Experience</SelectItem>
                <SelectItem value="last_active-desc">Recently Active</SelectItem>
                <SelectItem value="profile_completeness-desc">Profile Complete</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={state.viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={state.viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {state.showFilters && (
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1 block">Status</label>
                <Select
                  value={state.filter.status?.[0] || 'all'}
                  onValueChange={(value) =>
                    updateFilter({ status: value === 'all' ? undefined : [value as any] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Special Status */}
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1 block">Special Status</label>
                <div className="flex gap-2">
                  <Button
                    variant={state.filter.elder_status === true ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilter({
                      elder_status: state.filter.elder_status === true ? undefined : true
                    })}
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Elders
                  </Button>
                  <Button
                    variant={state.filter.featured === true ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilter({
                      featured: state.filter.featured === true ? undefined : true
                    })}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Button>
                </div>
              </div>

              {/* Geographic Scope */}
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1 block">Geographic Scope</label>
                <Select
                  value={state.filter.geographic_scope?.[0] || 'all'}
                  onValueChange={(value) =>
                    updateFilter({ geographic_scope: value === 'all' ? undefined : [value as any] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* AI Insights */}
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1 block">AI Analysis</label>
                <Button
                  variant={state.filter.has_ai_insights === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter({
                    has_ai_insights: state.filter.has_ai_insights === true ? undefined : true
                  })}
                  className="w-full"
                >
                  Has AI Insights
                </Button>
              </div>
            </div>

            <div className="flex justify-between">
              <Typography variant="small" className="text-stone-600">
                {sortedStorytellers.length} of {enhancedStorytellers.length} storytellers
              </Typography>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {sortedStorytellers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <Typography variant="h3" className="text-stone-600 mb-2">
            No storytellers found
          </Typography>
          <Typography variant="body" className="text-stone-500">
            Try adjusting your search or filters
          </Typography>
        </div>
      ) : (
        <div className={
          state.viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {sortedStorytellers.map((storyteller) => (
            <UnifiedStorytellerCard
              key={storyteller.id}
              storyteller={storyteller}
              variant={state.viewMode === 'list' ? 'compact' : variant}
              showActions={displayOptions.showActions}
              showAIInsights={displayOptions.showActions !== false && variant !== 'compact'}
              onApplyAISuggestion={handleAISuggestion}
              className={state.viewMode === 'list' ? 'max-w-none' : undefined}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <div className="mt-8 flex items-center justify-between">
          <Typography variant="small" className="text-stone-600">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
          </Typography>
          {/* Add pagination controls here */}
        </div>
      )}
    </div>
  )
}

function StorytellerCardSkeleton({ variant }: { variant?: string }) {
  const isCompact = variant === 'compact'

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className={`rounded-full ${isCompact ? 'w-12 h-12' : 'w-16 h-16'}`} />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {!isCompact && (
        <>
          <Skeleton className="h-16 w-full mb-4" />
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}