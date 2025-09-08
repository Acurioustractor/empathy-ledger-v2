'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import AdminNavigation from '@/components/admin/AdminNavigation'
import MediaLinkingManager from '@/components/media/MediaLinkingManager'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  AlertTriangle
} from 'lucide-react'

interface Story {
  id: string
  title: string
  content: string
  excerpt?: string
  created_at: string
  updated_at: string
  author_id: string
  status: 'published' | 'draft' | 'under_review' | 'flagged' | 'archived'
  visibility: 'public' | 'community' | 'organization' | 'private'
  cultural_sensitivity_level: 'low' | 'medium' | 'high'
  tags: string[]
  location?: string
  featured: boolean
  
  // Legacy fields (migrated)
  story_image_url?: string
  video_story_link?: string
  linked_media: string[]
  
  // New media fields
  cover_media_id?: string
  hero_media_id?: string
  
  // Author info
  author?: {
    id: string
    display_name: string
    community_roles: string[]
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
  elder_approved: boolean
  ceremonial_content: boolean
  traditional_knowledge: boolean
  consent_status: 'granted' | 'pending' | 'denied'
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
  const [stories, setStories] = useState<Story[]>([])
  const [filteredStories, setFilteredStories] = useState<Story[]>([])
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all')
  const [sensitivityFilter, setSensitivityFilter] = useState<string>('all')
  const [editingStory, setEditingStory] = useState<Partial<Story>>({})
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchStories()
  }, [])

  useEffect(() => {
    filterStories()
  }, [stories, searchTerm, statusFilter, visibilityFilter, sensitivityFilter])

  const fetchStories = async () => {
    try {
      setLoading(true)
      
      // Fetch real stories from API
      const response = await fetch('/api/admin/content/stories?limit=50')
      if (response.ok) {
        const data = await response.json()
        // Transform API data to match Story interface
        const transformedStories = data.stories?.map((story: any) => ({
          id: story.id,
          title: story.title || 'Untitled Story',
          content: story.content || '',
          excerpt: story.content ? story.content.substring(0, 150) + '...' : '',
          created_at: story.createdAt,
          updated_at: story.updatedAt,
          author_id: story.author?.id,
          status: story.status || 'draft',
          visibility: story.audience || 'public',
          cultural_sensitivity_level: story.culturalSensitivityLevel || 'low',
          tags: story.tags || [],
          location: undefined,
          featured: story.featured || false,
          
          // Legacy fields
          story_image_url: undefined,
          video_story_link: undefined,
          linked_media: [],
          
          // New media fields
          cover_media_id: undefined,
          hero_media_id: undefined,
          
          // Author info
          author: story.author ? {
            id: story.author.id,
            display_name: story.author.name,
            community_roles: story.storyteller?.elderStatus ? ['elder', 'storyteller'] : ['storyteller']
          } : undefined,
          
          // Statistics
          stats: {
            views_count: story.views || 0,
            likes_count: story.likes || 0,
            comments_count: 0, // Not available from API
            shares_count: story.shares || 0,
            reading_time: Math.ceil((story.content?.length || 0) / 250) // Estimate reading time
          },
          
          // Cultural protocols
          elder_approved: story.elderApproval || false,
          ceremonial_content: story.culturalSensitivityLevel === 'high',
          traditional_knowledge: story.culturalSensitivityLevel !== 'low',
          consent_status: story.consentStatus as 'granted' | 'pending' | 'denied' || 'granted',
          cultural_context: story.culturalContext,
          
          // Transcript analysis (not available from API - would be undefined)
          transcript_analysis: undefined
        })) || []
        
        setStories(transformedStories)
      } else {
        console.error('Failed to fetch stories')
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
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        story.author?.display_name.toLowerCase().includes(searchTerm.toLowerCase())
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

    setFilteredStories(filtered)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'flagged': return 'bg-red-100 text-red-800'
      case 'archived': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-blue-100 text-blue-800'
      case 'community': return 'bg-purple-100 text-purple-800'
      case 'organization': return 'bg-indigo-100 text-indigo-800'
      case 'private': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalStories = stories.length
  const publishedStories = stories.filter(s => s.status === 'published').length
  const flaggedStories = stories.filter(s => s.status === 'flagged').length
  const underReview = stories.filter(s => s.status === 'under_review').length
  const highSensitivity = stories.filter(s => s.cultural_sensitivity_level === 'high').length
  const elderApproved = stories.filter(s => s.elder_approved).length

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <AdminNavigation className="mb-8" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-2">Loading stories...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminNavigation className="mb-8" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stories Admin</h1>
        <p className="text-gray-600">
          Manage community stories with cultural sensitivity and elder review protocols
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalStories}</p>
              <p className="text-xs text-gray-600">Total Stories</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{publishedStories}</p>
              <p className="text-xs text-gray-600">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{flaggedStories}</p>
              <p className="text-xs text-gray-600">Flagged</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{underReview}</p>
              <p className="text-xs text-gray-600">Under Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{elderApproved}</p>
              <p className="text-xs text-gray-600">Elder Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{highSensitivity}</p>
              <p className="text-xs text-gray-600">High Sensitivity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public</option>
              <option value="community">Community</option>
              <option value="organization">Organization</option>
              <option value="private">Private</option>
            </select>

            <select
              value={sensitivityFilter}
              onChange={(e) => setSensitivityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Sensitivity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="mt-4">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Story
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stories List */}
      <div className="space-y-4">
        {filteredStories.map((story) => (
          <Card key={story.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold line-clamp-1">{story.title}</h3>
                    {story.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Flag className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {story.status === 'flagged' && (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge className={getStatusColor(story.status)}>
                      {story.status}
                    </Badge>
                    <Badge className={getVisibilityColor(story.visibility)}>
                      {story.visibility}
                    </Badge>
                    <Badge className={getSensitivityColor(story.cultural_sensitivity_level)}>
                      {story.cultural_sensitivity_level} sensitivity
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {story.author?.display_name}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(story.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {story.stats?.reading_time}min read
                    </span>
                    {story.location && (
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {story.location}
                      </span>
                    )}
                  </div>

                  {story.excerpt && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {story.excerpt}
                    </p>
                  )}

                  {/* Cultural Indicators */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {story.elder_approved && (
                      <Badge className="bg-purple-100 text-purple-800" size="sm">
                        <Shield className="w-3 h-3 mr-1" />
                        Elder Approved
                      </Badge>
                    )}
                    {story.ceremonial_content && (
                      <Badge className="bg-indigo-100 text-indigo-800" size="sm">
                        Ceremonial
                      </Badge>
                    )}
                    {story.traditional_knowledge && (
                      <Badge className="bg-violet-100 text-violet-800" size="sm">
                        Traditional Knowledge
                      </Badge>
                    )}
                    <Badge className={
                      story.consent_status === 'granted' ? 'bg-green-100 text-green-800' :
                      story.consent_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    } size="sm">
                      Consent: {story.consent_status}
                    </Badge>
                  </div>

                  {/* Tags */}
                  {story.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {story.tags.slice(0, 4).map(tag => (
                        <Badge key={tag} variant="outline" size="sm">
                          #{tag}
                        </Badge>
                      ))}
                      {story.tags.length > 4 && (
                        <Badge variant="outline" size="sm">
                          +{story.tags.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Cultural Context Warning */}
                  {story.cultural_context && story.status === 'flagged' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-3">
                      <p className="text-sm text-red-700">
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        {story.cultural_context}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 text-center text-sm">
                    <div>
                      <p className="font-bold">{story.stats?.views_count || 0}</p>
                      <p className="text-gray-600 text-xs">Views</p>
                    </div>
                    <div>
                      <p className="font-bold">{story.stats?.likes_count || 0}</p>
                      <p className="text-gray-600 text-xs">Likes</p>
                    </div>
                    <div>
                      <p className="font-bold">{story.stats?.comments_count || 0}</p>
                      <p className="text-gray-600 text-xs">Comments</p>
                    </div>
                    <div>
                      <p className="font-bold">{story.stats?.shares_count || 0}</p>
                      <p className="text-gray-600 text-xs">Shares</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    onClick={() => handleViewStory(story)}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    onClick={() => handleDeleteStory(story.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Story Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Story Details: {selectedStory?.title}</DialogTitle>
              <div className="flex space-x-2">
                {!isEditing ? (
                  <Button onClick={handleEditStory} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveStory}
                      className="bg-orange-600 hover:bg-orange-700"
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
                <Card>
                  <CardHeader>
                    <CardTitle>Story Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">Title</label>
                          <Input
                            value={editingStory.title || ''}
                            onChange={(e) => setEditingStory(prev => ({
                              ...prev,
                              title: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Excerpt</label>
                          <textarea
                            value={editingStory.excerpt || ''}
                            onChange={(e) => setEditingStory(prev => ({
                              ...prev,
                              excerpt: e.target.value
                            }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Content</label>
                          <textarea
                            value={editingStory.content || ''}
                            onChange={(e) => setEditingStory(prev => ({
                              ...prev,
                              content: e.target.value
                            }))}
                            rows={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <strong className="text-sm">Title:</strong>
                          <p className="text-sm text-gray-600">{selectedStory.title}</p>
                        </div>
                        {selectedStory.excerpt && (
                          <div>
                            <strong className="text-sm">Excerpt:</strong>
                            <p className="text-sm text-gray-600">{selectedStory.excerpt}</p>
                          </div>
                        )}
                        <div>
                          <strong className="text-sm">Content Preview:</strong>
                          <div className="max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">{selectedStory.content}</p>
                          </div>
                        </div>
                        <div>
                          <strong className="text-sm">Author:</strong>
                          <p className="text-sm text-gray-600">{selectedStory.author?.display_name}</p>
                        </div>
                        <div>
                          <strong className="text-sm">Reading Time:</strong>
                          <p className="text-sm text-gray-600">{selectedStory.stats?.reading_time} minutes</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Transcript Analysis */}
                {selectedStory.transcript_analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <strong className="text-sm">Themes:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedStory.transcript_analysis.themes.map(theme => (
                            <Badge key={theme} variant="outline" size="sm">{theme}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <strong className="text-sm">Key Concepts:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedStory.transcript_analysis.key_concepts.map(concept => (
                            <Badge key={concept} className="bg-blue-100 text-blue-800" size="sm">{concept}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <strong className="text-sm">Cultural Elements:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedStory.transcript_analysis.cultural_elements.map(element => (
                            <Badge key={element} className="bg-purple-100 text-purple-800" size="sm">{element}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <strong className="text-sm">Sentiment:</strong>
                        <Badge className={
                          selectedStory.transcript_analysis.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                          selectedStory.transcript_analysis.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
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
                <Card>
                  <CardHeader>
                    <CardTitle>Story Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge className={getStatusColor(selectedStory.status)}>
                        {selectedStory.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Visibility:</span>
                      <Badge className={getVisibilityColor(selectedStory.visibility)}>
                        {selectedStory.visibility}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Featured:</span>
                      <Badge className={selectedStory.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
                        {selectedStory.featured ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cultural Sensitivity:</span>
                      <Badge className={getSensitivityColor(selectedStory.cultural_sensitivity_level)}>
                        {selectedStory.cultural_sensitivity_level}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cultural Protocols</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Elder Approved:</span>
                      <Badge className={selectedStory.elder_approved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {selectedStory.elder_approved ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ceremonial Content:</span>
                      <Badge className={selectedStory.ceremonial_content ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
                        {selectedStory.ceremonial_content ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Traditional Knowledge:</span>
                      <Badge className={selectedStory.traditional_knowledge ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}>
                        {selectedStory.traditional_knowledge ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Consent Status:</span>
                      <Badge className={
                        selectedStory.consent_status === 'granted' ? 'bg-green-100 text-green-800' :
                        selectedStory.consent_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {selectedStory.consent_status}
                      </Badge>
                    </div>
                    {selectedStory.cultural_context && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">{selectedStory.cultural_context}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Story Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{selectedStory.stats?.views_count || 0}</p>
                        <p className="text-sm text-gray-600">Views</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{selectedStory.stats?.likes_count || 0}</p>
                        <p className="text-sm text-gray-600">Likes</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{selectedStory.stats?.comments_count || 0}</p>
                        <p className="text-sm text-gray-600">Comments</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{selectedStory.stats?.shares_count || 0}</p>
                        <p className="text-sm text-gray-600">Shares</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedStory.tags.map(tag => (
                        <Badge key={tag} variant="outline">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Media Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Story Media</CardTitle>
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