'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AdminStoryCard } from '@/components/admin/admin-story-card'
import { useAuth } from '@/lib/context/auth.context'
import { createClient } from '@/lib/supabase/client-ssr'
import {
  Search,
  Grid3x3,
  List,
  SlidersHorizontal,
  Download,
  Plus,
  RefreshCw
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Story {
  id: string
  title: string
  content: string
  excerpt?: string
  created_at: string
  updated_at: string
  status: 'published' | 'draft' | 'under_review' | 'flagged' | 'archived'
  visibility: 'public' | 'community' | 'organisation' | 'private'
  cultural_sensitivity_level: 'low' | 'medium' | 'high'
  story_type?: string
  themes?: string[]
  tags?: string[]
  location?: string
  reading_time_minutes?: number
  storyteller_id?: string
  author_id?: string
  featured?: boolean
  elder_approval?: boolean
  storyteller?: {
    id: string
    display_name: string
    bio?: string
    cultural_background?: string
    elder_status?: boolean
    avatar_url?: string
    story_count?: number
  }
}

type ViewMode = 'grid' | 'list'
type StatusFilter = 'all' | 'published' | 'draft' | 'under_review' | 'flagged' | 'archived'
type SortBy = 'newest' | 'oldest' | 'title' | 'storyteller'

export default function AdminStoriesPage() {
  const { isSuperAdmin, isLoading: authLoading } = useAuth()
  const [stories, setStories] = useState<Story[]>([])
  const [filteredStories, setFilteredStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [shareStatuses, setShareStatuses] = useState<Record<string, boolean>>({})

  // Fetch stories
  useEffect(() => {
    fetchStories()
    fetchShareStatuses()
  }, [])

  // Filter and sort stories
  useEffect(() => {
    let result = [...stories]

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(story =>
        story.title.toLowerCase().includes(query) ||
        story.content.toLowerCase().includes(query) ||
        story.storyteller?.display_name.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(story => story.status === statusFilter)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'storyteller':
          return (a.storyteller?.display_name || '').localeCompare(b.storyteller?.display_name || '')
        default:
          return 0
      }
    })

    setFilteredStories(result)
  }, [stories, searchQuery, statusFilter, sortBy])

  const fetchStories = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          storyteller:profiles!stories_storyteller_id_fkey(
            id,
            display_name,
            bio,
            cultural_background,
            is_elder,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedStories: Story[] = (data || []).map((story: any) => ({
        ...story,
        storyteller: story.storyteller ? {
          id: story.storyteller.id,
          display_name: story.storyteller.display_name,
          bio: story.storyteller.bio,
          cultural_background: story.storyteller.cultural_background,
          elder_status: story.storyteller.is_elder,
          avatar_url: story.storyteller.avatar_url
        } : undefined
      }))

      setStories(formattedStories)
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchShareStatuses = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('story_syndication_consent')
        .select('story_id, consent_granted')
        .eq('consent_granted', true)

      if (error) throw error

      const statuses: Record<string, boolean> = {}
      data?.forEach(item => {
        statuses[item.story_id] = item.consent_granted
      })
      setShareStatuses(statuses)
    } catch (error) {
      console.error('Error fetching share statuses:', error)
    }
  }

  const handleShareToggle = async (storyId: string, share: boolean) => {
    try {
      const response = await fetch('/api/admin/story-sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_id: storyId,
          share,
          share_media: true
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update sharing')
      }

      setShareStatuses(prev => ({ ...prev, [storyId]: share }))
    } catch (error) {
      throw error
    }
  }

  const handleView = (storyId: string) => {
    window.location.href = `/stories/${storyId}`
  }

  const handleEdit = (storyId: string) => {
    // Navigate to edit page
    window.location.href = `/admin/stories/${storyId}/edit`
  }

  const statusCounts = {
    all: stories.length,
    published: stories.filter(s => s.status === 'published').length,
    draft: stories.filter(s => s.status === 'draft').length,
    under_review: stories.filter(s => s.status === 'under_review').length,
    flagged: stories.filter(s => s.status === 'flagged').length,
    archived: stories.filter(s => s.status === 'archived').length
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need super admin permissions to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Story Management</h1>
              <p className="text-muted-foreground">
                Manage, review, and share stories from the Empathy Ledger
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchStories}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Story
              </Button>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search stories, storytellers, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Stories ({statusCounts.all})
                </SelectItem>
                <SelectItem value="published">
                  Published ({statusCounts.published})
                </SelectItem>
                <SelectItem value="draft">
                  Draft ({statusCounts.draft})
                </SelectItem>
                <SelectItem value="under_review">
                  Under Review ({statusCounts.under_review})
                </SelectItem>
                <SelectItem value="flagged">
                  Flagged ({statusCounts.flagged})
                </SelectItem>
                <SelectItem value="archived">
                  Archived ({statusCounts.archived})
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="storyteller">Storyteller</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border border-border rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{filteredStories.length}</strong> of{' '}
              <strong className="text-foreground">{stories.length}</strong> stories
            </span>
            <span>•</span>
            <span>
              <strong className="text-foreground">{Object.keys(shareStatuses).length}</strong> shared to ACT Farm
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading stories...</p>
            </div>
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-2">No stories found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search' : 'Get started by creating a new story'}
              </p>
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredStories.map((story) => (
              <AdminStoryCard
                key={story.id}
                story={story}
                shareToActFarm={shareStatuses[story.id] || false}
                onShareToggle={handleShareToggle}
                onView={handleView}
                onEdit={handleEdit}
                variant={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
