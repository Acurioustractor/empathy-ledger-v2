'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import MediaLinkingManager from '@/components/media/MediaLinkingManager'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Image from 'next/image'
import {
  Search,
  BookOpen,
  Edit,
  Eye,
  Calendar,
  User,
  MapPin,
  Flag,
  Shield,
  Trash2,
  Plus,
  FileText,
  Heart,
  MessageCircle,
  Share,
  Clock,
  AlertTriangle,
  ExternalLink,
  Pencil,
  Crown,
  Building2
} from 'lucide-react'

interface Story {
  id: string
  title: string
  content: string
  excerpt?: string
  created_at: string
  updated_at: string
  storyteller_id?: string
  author_id?: string
  status: 'published' | 'draft' | 'under_review' | 'flagged' | 'archived'
  visibility: 'public' | 'community' | 'organisation' | 'private'
  cultural_sensitivity_level: 'low' | 'medium' | 'high'
  themes?: string[]
  tags?: string[]
  location?: string
  featured?: boolean
  justicehub_featured?: boolean

  // Article fields (unified content)
  article_type?: string
  slug?: string
  primary_project?: string
  related_projects?: string[]
  syndication_destinations?: string[]
  featured_image_url?: string
  source_platform?: string
  source_url?: string
  author_name?: string
  author_storyteller_id?: string

  // Media fields
  hero_image_url?: string
  video_url?: string

  // Organization
  organization?: {
    id: string
    name: string
    slug: string
  }

  // Storyteller info (from storytellers table join)
  storyteller?: {
    id: string
    profile_id?: string
    display_name: string
    avatar_url?: string
    cultural_background?: string[]  // Array of cultural backgrounds
    bio?: string
    language_skills?: string[]
    is_active?: boolean
  }

  // Statistics
  stats?: {
    views_count: number
    likes_count: number
    comments_count: number
    shares_count: number
    reading_time: number
  }

  // Cultural protocols
  elder_approved?: boolean
  ceremonial_content?: boolean
  traditional_knowledge?: boolean
  consent_status?: 'granted' | 'pending' | 'denied'
  cultural_context?: string

  // Transcript analysis (if available)
  transcript_analysis?: {
    themes: string[]
    sentiment: 'positive' | 'neutral' | 'negative'
    key_concepts: string[]
    cultural_elements: string[]
  }
}

export default function StoriesAdminPage() {
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [filteredStories, setFilteredStories] = useState<Story[]>([])
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all')
  const [sensitivityFilter, setSensitivityFilter] = useState<string>('all')
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all')
  const [editingStory, setEditingStory] = useState<Partial<Story>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [totalDatabaseCount, setTotalDatabaseCount] = useState(0)

  useEffect(() => {
    fetchStories()
  }, [])

  useEffect(() => {
    filterStories()
  }, [stories, searchTerm, statusFilter, visibilityFilter, sensitivityFilter, contentTypeFilter])

  const fetchStories = async () => {
    try {
      setLoading(true)

      // Fetch stories from the admin API (includes storyteller join)
      console.log('📚 Fetching stories from admin API...')
      const response = await fetch('/api/admin/stories?limit=500')
      if (response.ok) {
        const data = await response.json()
        console.log('📚 Stories API response:', data)
        // Store total database count for accurate display
        setTotalDatabaseCount(data.pagination?.total || 0)

        // Stories come directly with storyteller data from the API
        const transformedStories: Story[] = (data.stories || []).map((story: any) => ({
          ...story,
          // Ensure consistent field names
          cultural_sensitivity_level: story.cultural_sensitivity_level || 'low',
          themes: story.themes || [],
          tags: story.tags || [],
          featured: story.featured || story.is_featured || false,
          // Stats are now included from API
          stats: story.stats || {
            views_count: story.views_count || 0,
            likes_count: story.likes_count || 0,
            comments_count: story.comments_count || 0,
            shares_count: story.shares_count || 0,
            reading_time: story.reading_time_minutes || Math.ceil((story.content?.split(/\s+/).length || 0) / 200)
          }
        }))

        console.log('📚 Loaded', transformedStories.length, 'stories')
        console.log('📚 Total in database:', data.pagination?.total || 0)
        if (transformedStories[0]) {
          console.log('📚 First story storyteller:', transformedStories[0].storyteller)
        }
        setStories(transformedStories)
      } else {
        console.error('Failed to fetch stories - Response not OK:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('API Error:', errorText)
        setStories([])
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
      setStories([])
    } finally {
      setLoading(false)
    }
  }

  const filterStories = () => {
    let filtered = stories

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(search) ||
        story.content?.toLowerCase().includes(search) ||
        story.excerpt?.toLowerCase().includes(search) ||
        story.themes?.some(theme => theme.toLowerCase().includes(search)) ||
        story.tags?.some(tag => tag.toLowerCase().includes(search)) ||
        story.storyteller?.display_name?.toLowerCase().includes(search) ||
        story.storyteller?.cultural_background?.some(bg => bg.toLowerCase().includes(search)) ||
        story.organization?.name?.toLowerCase().includes(search)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(story => story.status === statusFilter)
    }

    if (visibilityFilter !== 'all') {
      filtered = filtered.filter(story => story.visibility === visibilityFilter)
    }

    if (sensitivityFilter !== 'all') {
      filtered = filtered.filter(story => story.cultural_sensitivity_level === sensitivityFilter)
    }

    if (contentTypeFilter !== 'all') {
      if (contentTypeFilter === 'stories') {
        // Stories = no article_type set
        filtered = filtered.filter(story => !story.article_type)
      } else if (contentTypeFilter === 'articles') {
        // Articles = any article_type set
        filtered = filtered.filter(story => !!story.article_type)
      } else {
        // Specific article type
        filtered = filtered.filter(story => story.article_type === contentTypeFilter)
      }
    }

    setFilteredStories(filtered)
  }

  // Article type labels for display
  const articleTypeLabels: Record<string, string> = {
    story_feature: 'Story Feature',
    program_spotlight: 'Program Spotlight',
    research_summary: 'Research',
    community_news: 'News',
    editorial: 'Editorial',
    impact_report: 'Impact Report',
    project_update: 'Project Update',
    tutorial: 'Tutorial'
  }

  const handleViewStory = (story: Story) => {
    setSelectedStory(story)
    setEditingStory(story)
    setIsEditing(false)
    setIsDetailModalOpen(true)
  }

  const handleEditStory = () => {
    setIsEditing(true)
  }

  const handleSaveStory = async () => {
    console.log('Saving story:', editingStory)
    // Add API call here
    setIsEditing(false)
    fetchStories()
  }

  const handleDeleteStory = async (storyId: string) => {
    if (confirm('Are you sure you want to delete this story?')) {
      console.log('Deleting story:', storyId)
      // Add API call here
      fetchStories()
    }
  }

  const handleFeaturedUpdate = async (storyId: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/admin/stories/${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: featured })
      })
      if (response.ok) {
        setStories(prev => prev.map(s =>
          s.id === storyId ? { ...s, featured } : s
        ))
      }
    } catch (error) {
      console.error('Error updating featured status:', error)
    }
  }

  const handleJusticeHubFeaturedUpdate = async (storyId: string, justicehub_featured: boolean) => {
    try {
      const response = await fetch(`/api/admin/stories/${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ justicehub_featured })
      })
      if (response.ok) {
        setStories(prev => prev.map(s =>
          s.id === storyId ? { ...s, justicehub_featured } : s
        ))
      }
    } catch (error) {
      console.error('Error updating JusticeHub featured status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-sage-100 text-sage-700 border-sage-200'
      case 'draft': return 'bg-stone-100 text-stone-700 border-stone-200'
      case 'under_review': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'flagged': return 'bg-clay-100 text-clay-700 border-clay-200'
      case 'archived': return 'bg-stone-100 text-stone-600 border-stone-200'
      default: return 'bg-stone-100 text-stone-600 border-stone-200'
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-sage-100 text-sage-700 border-sage-200'
      case 'community': return 'bg-earth-100 text-earth-700 border-earth-200'
      case 'organisation': return 'bg-earth-100 text-earth-700 border-earth-200'
      case 'private': return 'bg-stone-100 text-stone-600 border-stone-200'
      default: return 'bg-stone-100 text-stone-600 border-stone-200'
    }
  }

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-clay-100 text-clay-700 border-clay-200'
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'low': return 'bg-sage-100 text-sage-700 border-sage-200'
      default: return 'bg-stone-100 text-stone-600 border-stone-200'
    }
  }

  // Use database count for total, local count for filtered views
  const totalStories = totalDatabaseCount || stories.length
  const publishedStories = stories.filter(s => s.status === 'published').length
  const flaggedStories = stories.filter(s => s.status === 'flagged').length
  const underReview = stories.filter(s => s.status === 'under_review').length
  const highSensitivity = stories.filter(s => s.cultural_sensitivity_level === 'high').length
  const elderApproved = stories.filter(s => s.elder_approved).length

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
          <span className="ml-2 text-stone-600">Loading stories...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-stone-50 via-sage-50/30 to-earth-50/20 border border-stone-200 rounded-xl px-6 py-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-display-sm font-bold tracking-tight text-stone-900">Content & Stories</h1>
            <p className="text-body-md text-stone-600 mt-1">
              Unified content management: stories, articles, and editorial with cultural sensitivity protocols
            </p>
            <div className="mt-3 text-body-sm text-stone-500">
              Showing {stories.length} of {totalStories} total stories {filteredStories.length !== stories.length && `(${filteredStories.length} filtered)`}
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-sage-500 to-earth-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-stone-50 to-stone-100/50 border-stone-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-stone-800">{totalStories}</p>
              <p className="text-xs text-stone-600">Total Stories</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-sage-50 to-sage-100/50 border-sage-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-sage-700">{publishedStories}</p>
              <p className="text-xs text-stone-600">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-clay-50 to-clay-100/50 border-clay-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-clay-700">{flaggedStories}</p>
              <p className="text-xs text-stone-600">Flagged</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-700">{underReview}</p>
              <p className="text-xs text-stone-600">Under Review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-earth-50 to-earth-100/50 border-earth-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-earth-700">{elderApproved}</p>
              <p className="text-xs text-stone-600">Elder Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-clay-50 to-clay-100/50 border-clay-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-clay-700">{highSensitivity}</p>
              <p className="text-xs text-stone-600">High Sensitivity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8 border-stone-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-stone-300 focus:ring-sage-500 focus:border-sage-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500 text-stone-700"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="under_review">Under Review</option>
              <option value="flagged">Flagged</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="px-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500 text-stone-700"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public</option>
              <option value="community">Community</option>
              <option value="organisation">Organization</option>
              <option value="private">Private</option>
            </select>

            <select
              value={sensitivityFilter}
              onChange={(e) => setSensitivityFilter(e.target.value)}
              className="px-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500 text-stone-700"
            >
              <option value="all">All Sensitivity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Content Type Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <select
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value)}
              className="px-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500 text-stone-700"
            >
              <option value="all">All Content Types</option>
              <option value="stories">Stories Only</option>
              <option value="articles">Articles Only</option>
              <option value="story_feature">— Story Feature</option>
              <option value="program_spotlight">— Program Spotlight</option>
              <option value="research_summary">— Research</option>
              <option value="community_news">— News</option>
              <option value="editorial">— Editorial</option>
              <option value="impact_report">— Impact Report</option>
              <option value="project_update">— Project Update</option>
              <option value="tutorial">— Tutorial</option>
            </select>
          </div>

          <div className="mt-4">
            <Button
              className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800"
              onClick={() => router.push('/stories/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Story
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stories List */}
      <div className="space-y-4">
        {filteredStories.map((story) => (
          <Card key={story.id} className="overflow-hidden border-stone-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex gap-6">
                {/* Storyteller Avatar & Info Column */}
                <div className="flex-shrink-0 w-32">
                  <Link href={story.storyteller?.id ? `/storytellers/${story.storyteller.id}` : '#'} className="block group">
                    <div className="relative">
                      {story.storyteller?.avatar_url ? (
                        <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-stone-200 group-hover:ring-sage-300 transition-all mx-auto">
                          <Image
                            src={story.storyteller.avatar_url}
                            alt={story.storyteller.display_name || 'Storyteller'}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sage-100 to-earth-100 flex items-center justify-center ring-2 ring-stone-200 group-hover:ring-sage-300 transition-all mx-auto">
                          <span className="text-lg font-bold text-sage-600">
                            {story.storyteller?.display_name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      {/* Elder status badge would go here if available */}
                    </div>
                    <p className="text-sm font-medium text-stone-800 group-hover:text-sage-700 transition-colors text-center mt-2 line-clamp-2">
                      {story.storyteller?.display_name || 'Unknown Storyteller'}
                    </p>
                  </Link>
                  {story.storyteller?.cultural_background && story.storyteller.cultural_background.length > 0 && (
                    <p className="text-xs text-stone-500 text-center mt-1 line-clamp-1">
                      {story.storyteller.cultural_background.join(', ')}
                    </p>
                  )}
                  {story.organization && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs text-stone-400">
                      <Building2 className="w-3 h-3" />
                      <span className="line-clamp-1">{story.organization.name}</span>
                    </div>
                  )}
                </div>

                {/* Main Content Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title & Badges */}
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-stone-900 line-clamp-1">{story.title}</h3>
                        {story.featured && (
                          <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
                            <Flag className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {story.status === 'flagged' && (
                          <Badge className="bg-clay-100 text-clay-700 border border-clay-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Flagged
                          </Badge>
                        )}
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <Badge className={getStatusColor(story.status)}>
                          {story.status}
                        </Badge>
                        <Badge className={getVisibilityColor(story.visibility)}>
                          {story.visibility}
                        </Badge>
                        <Badge className={getSensitivityColor(story.cultural_sensitivity_level)}>
                          {story.cultural_sensitivity_level} sensitivity
                        </Badge>
                        {story.article_type && (
                          <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
                            {articleTypeLabels[story.article_type] || story.article_type}
                          </Badge>
                        )}
                        {story.source_platform && story.source_platform !== 'empathy_ledger' && (
                          <Badge className="bg-purple-100 text-purple-700 border border-purple-200">
                            {story.source_platform}
                          </Badge>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center flex-wrap gap-4 text-sm text-stone-600 mb-3">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(story.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {story.stats?.reading_time || 1}min read
                        </span>
                        {story.location && (
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {story.location}
                          </span>
                        )}
                      </div>

                      {/* Excerpt */}
                      {story.content && (
                        <p className="text-sm text-stone-700 mb-3 line-clamp-2">
                          {story.excerpt || story.content.substring(0, 200) + '...'}
                        </p>
                      )}

                      {/* Themes */}
                      {story.themes && story.themes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {story.themes.slice(0, 4).map((theme, idx) => (
                            <Badge key={idx} className="bg-sage-50 text-sage-700 border border-sage-200" size="sm">
                              {theme}
                            </Badge>
                          ))}
                          {story.themes.length > 4 && (
                            <Badge variant="outline" size="sm">
                              +{story.themes.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Cultural Indicators */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {story.elder_approved && (
                          <Badge className="bg-earth-100 text-earth-700 border border-earth-200" size="sm">
                            <Shield className="w-3 h-3 mr-1" />
                            Elder Approved
                          </Badge>
                        )}
                        {story.traditional_knowledge && (
                          <Badge className="bg-earth-100 text-earth-700 border border-earth-200" size="sm">
                            Traditional Knowledge
                          </Badge>
                        )}
                        {story.consent_status && (
                          <Badge className={
                            story.consent_status === 'granted' ? 'bg-sage-100 text-sage-700 border border-sage-200' :
                            story.consent_status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            'bg-clay-100 text-clay-700 border border-clay-200'
                          } size="sm">
                            Consent: {story.consent_status}
                          </Badge>
                        )}
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1 text-stone-600">
                          <Eye className="w-4 h-4" />
                          <span>{story.stats?.views_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sage-600">
                          <Heart className="w-4 h-4" />
                          <span>{story.stats?.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-earth-600">
                          <MessageCircle className="w-4 h-4" />
                          <span>{story.stats?.comments_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-600">
                          <Share className="w-4 h-4" />
                          <span>{story.stats?.shares_count || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {/* Quick toggles */}
                      <div className="flex flex-col gap-1 p-2 bg-stone-50 rounded-md border border-stone-200 mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={story.featured || false}
                            onChange={(e) => handleFeaturedUpdate(story.id, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                          />
                          <span className="text-xs text-stone-600">Featured</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={story.justicehub_featured || false}
                            onChange={(e) => handleJusticeHubFeaturedUpdate(story.id, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-stone-600">JusticeHub</span>
                        </label>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800"
                      >
                        <Link href={`/admin/stories/${story.id}`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        onClick={() => handleViewStory(story)}
                        variant="outline"
                        size="sm"
                        className="border-stone-300 text-stone-700 hover:bg-stone-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Quick View
                      </Button>
                      <Button
                        onClick={() => handleDeleteStory(story.id)}
                        variant="outline"
                        size="sm"
                        className="text-clay-600 border-clay-300 hover:bg-clay-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2">No stories found</h3>
          <p className="text-stone-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Story Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-stone-900">Quick View: {selectedStory?.title}</DialogTitle>
              <div className="flex space-x-2">
                <Button asChild className="bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800" size="sm">
                  <Link href={selectedStory ? `/admin/stories/${selectedStory.id}` : '#'}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Full Editor
                  </Link>
                </Button>
                {!isEditing ? (
                  <Button onClick={handleEditStory} variant="outline" size="sm" className="border-stone-300">
                    <Pencil className="w-4 h-4 mr-2" />
                    Quick Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="sm"
                      className="border-stone-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveStory}
                      className="bg-gradient-to-r from-earth-600 to-earth-700 hover:from-earth-700 hover:to-earth-800"
                      size="sm"
                    >
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>
          
          {selectedStory && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Story Content */}
              <div className="space-y-6">
                <Card className="border-stone-200">
                  <CardHeader>
                    <CardTitle className="text-stone-900">Story Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                          <Input
                            value={editingStory.title || ''}
                            onChange={(e) => setEditingStory(prev => ({
                              ...prev,
                              title: e.target.value
                            }))}
                            className="border-stone-300 focus:ring-sage-500 focus:border-sage-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Excerpt</label>
                          <textarea
                            value={editingStory.excerpt || ''}
                            onChange={(e) => setEditingStory(prev => ({
                              ...prev,
                              excerpt: e.target.value
                            }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Content</label>
                          <textarea
                            value={editingStory.content || ''}
                            onChange={(e) => setEditingStory(prev => ({
                              ...prev,
                              content: e.target.value
                            }))}
                            rows={10}
                            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-500"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <strong className="text-sm text-stone-700">Title:</strong>
                          <p className="text-sm text-stone-600">{selectedStory.title}</p>
                        </div>
                        {selectedStory.excerpt && (
                          <div>
                            <strong className="text-sm text-stone-700">Excerpt:</strong>
                            <p className="text-sm text-stone-600">{selectedStory.excerpt}</p>
                          </div>
                        )}
                        <div>
                          <strong className="text-sm text-stone-700">Content Preview:</strong>
                          <div className="max-h-64 overflow-y-auto p-3 bg-stone-50 rounded-md border border-stone-200">
                            <p className="text-sm text-stone-700">{selectedStory.content}</p>
                          </div>
                        </div>
                        <div>
                          <strong className="text-sm text-stone-700">Author:</strong>
                          <p className="text-sm text-stone-600">{selectedStory.storyteller?.display_name || selectedStory.author_name || 'Unknown'}</p>
                        </div>
                        <div>
                          <strong className="text-sm text-stone-700">Reading Time:</strong>
                          <p className="text-sm text-stone-600">{selectedStory.stats?.reading_time} minutes</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Transcript Analysis */}
                {selectedStory.transcript_analysis && (
                  <Card className="border-stone-200">
                    <CardHeader>
                      <CardTitle className="text-stone-900">AI Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <strong className="text-sm text-stone-700">Themes:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedStory.transcript_analysis.themes.map(theme => (
                            <Badge key={theme} variant="outline" size="sm" className="border-stone-300">{theme}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <strong className="text-sm text-stone-700">Key Concepts:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedStory.transcript_analysis.key_concepts.map(concept => (
                            <Badge key={concept} className="bg-sage-100 text-sage-700 border border-sage-200" size="sm">{concept}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <strong className="text-sm text-stone-700">Cultural Elements:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedStory.transcript_analysis.cultural_elements.map(element => (
                            <Badge key={element} className="bg-earth-100 text-earth-700 border border-earth-200" size="sm">{element}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <strong className="text-sm text-stone-700">Sentiment:</strong>
                        <Badge className={
                          selectedStory.transcript_analysis.sentiment === 'positive' ? 'bg-sage-100 text-sage-700 border border-sage-200' :
                          selectedStory.transcript_analysis.sentiment === 'negative' ? 'bg-clay-100 text-clay-700 border border-clay-200' :
                          'bg-stone-100 text-stone-600 border border-stone-200'
                        }>
                          {selectedStory.transcript_analysis.sentiment}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Settings & Media */}
              <div className="space-y-6">
                <Card className="border-stone-200">
                  <CardHeader>
                    <CardTitle className="text-stone-900">Story Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Status:</span>
                      <Badge className={getStatusColor(selectedStory.status)}>
                        {selectedStory.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Visibility:</span>
                      <Badge className={getVisibilityColor(selectedStory.visibility)}>
                        {selectedStory.visibility}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Featured:</span>
                      <Badge className={selectedStory.featured ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-stone-100 text-stone-600 border border-stone-200'}>
                        {selectedStory.featured ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Cultural Sensitivity:</span>
                      <Badge className={getSensitivityColor(selectedStory.cultural_sensitivity_level)}>
                        {selectedStory.cultural_sensitivity_level}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-stone-200">
                  <CardHeader>
                    <CardTitle className="text-stone-900">Cultural Protocols</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Elder Approved:</span>
                      <Badge className={selectedStory.elder_approved ? 'bg-sage-100 text-sage-700 border border-sage-200' : 'bg-stone-100 text-stone-600 border border-stone-200'}>
                        {selectedStory.elder_approved ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Ceremonial Content:</span>
                      <Badge className={selectedStory.ceremonial_content ? 'bg-earth-100 text-earth-700 border border-earth-200' : 'bg-stone-100 text-stone-600 border border-stone-200'}>
                        {selectedStory.ceremonial_content ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Traditional Knowledge:</span>
                      <Badge className={selectedStory.traditional_knowledge ? 'bg-earth-100 text-earth-700 border border-earth-200' : 'bg-stone-100 text-stone-600 border border-stone-200'}>
                        {selectedStory.traditional_knowledge ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-stone-600">Consent Status:</span>
                      <Badge className={
                        selectedStory.consent_status === 'granted' ? 'bg-sage-100 text-sage-700 border border-sage-200' :
                        selectedStory.consent_status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-clay-100 text-clay-700 border border-clay-200'
                      }>
                        {selectedStory.consent_status}
                      </Badge>
                    </div>
                    {selectedStory.cultural_context && (
                      <div className="p-3 bg-earth-50 border border-earth-200 rounded-md">
                        <p className="text-sm text-earth-800">{selectedStory.cultural_context}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-stone-200">
                  <CardHeader>
                    <CardTitle className="text-stone-900">Story Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-stone-800">{selectedStory.stats?.views_count || 0}</p>
                        <p className="text-sm text-stone-500">Views</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-sage-700">{selectedStory.stats?.likes_count || 0}</p>
                        <p className="text-sm text-stone-500">Likes</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-earth-700">{selectedStory.stats?.comments_count || 0}</p>
                        <p className="text-sm text-stone-500">Comments</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-amber-700">{selectedStory.stats?.shares_count || 0}</p>
                        <p className="text-sm text-stone-500">Shares</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-stone-200">
                  <CardHeader>
                    <CardTitle className="text-stone-900">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(selectedStory.tags || []).map(tag => (
                        <Badge key={tag} variant="outline" className="border-stone-300">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Media Management */}
                <Card className="border-stone-200">
                  <CardHeader>
                    <CardTitle className="text-stone-900">Story Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MediaLinkingManager
                      contentType="story"
                      contentId={selectedStory.id}
                      contentTitle={selectedStory.title}
                      className="max-h-96"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}