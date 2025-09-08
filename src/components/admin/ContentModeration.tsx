'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Flag, 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  Star,
  StarOff,
  Shield, 
  Heart, 
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  BookOpen,
  Users,
  Calendar,
  ThumbsUp,
  Share2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react'

interface Story {
  id: string
  title: string
  content: string
  status: 'draft' | 'review' | 'published' | 'archived'
  featured: boolean
  culturalContext: any
  tags: string[]
  storyType: 'traditional' | 'personal' | 'historical' | 'educational' | 'healing'
  audience: 'children' | 'youth' | 'adults' | 'elders' | 'all'
  culturalSensitivityLevel: 'low' | 'medium' | 'high'
  elderApproval: boolean | null
  culturalReviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_review'
  consentStatus: 'pending' | 'granted' | 'denied' | 'expired'
  views: number
  likes: number
  shares: number
  createdAt: string
  updatedAt: string
  publicationDate: string | null
  author: {
    id: string
    name: string
    culturalBackground?: string
  }
  storyteller?: {
    id: string
    name: string
    elderStatus: boolean
  } | null
  needsReview: boolean
  needsElderReview: boolean
  priority: 'low' | 'medium' | 'high'
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNext: boolean
  hasPrev: boolean
}

const ContentModeration: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  })

  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [culturalFilter, setCulturalFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Selected story for detailed view
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false)

  const fetchStories = async (page = 1) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(culturalFilter !== 'all' && { cultural_sensitivity: culturalFilter }),
        ...(typeFilter !== 'all' && { story_type: typeFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/content/stories?${params}`)
      const data = await response.json()

      if (response.ok) {
        setStories(data.stories || [])
        setPagination(data.pagination || pagination)
      } else {
        console.error('Failed to fetch stories:', data.error)
        setStories([])
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
      setStories([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [statusFilter, culturalFilter, typeFilter, searchTerm])

  const handleStoryAction = async (storyId: string, action: string) => {
    try {
      const response = await fetch('/api/admin/content/stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, adminAction: action })
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh the stories list
        fetchStories(pagination.currentPage)
        
        // Close dialog if story was updated
        if (selectedStory?.id === storyId) {
          setIsStoryDialogOpen(false)
          setSelectedStory(null)
        }
      } else {
        console.error('Failed to update story:', data.error)
      }
    } catch (error) {
      console.error('Error updating story:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'review': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'published': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'draft': return <XCircle className="w-4 h-4 text-gray-500" />
      case 'archived': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'archived': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getCulturalSensitivityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStoryTypeIcon = (type: string) => {
    switch (type) {
      case 'traditional': return <Shield className="w-4 h-4" />
      case 'personal': return <Heart className="w-4 h-4" />
      case 'historical': return <BookOpen className="w-4 h-4" />
      case 'educational': return <Users className="w-4 h-4" />
      case 'healing': return <Heart className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">Loading content...</div>
            <div className="text-muted-foreground">Please wait while we fetch stories</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Content Moderation</h3>
            <p className="text-muted-foreground">
              Review and moderate stories, manage cultural sensitivity, and approve content
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {pagination.totalCount} total stories
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search stories by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="review">Needs Review</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={culturalFilter} onValueChange={setCulturalFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Cultural Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="high">High Sensitivity</SelectItem>
              <SelectItem value="medium">Medium Sensitivity</SelectItem>
              <SelectItem value="low">Low Sensitivity</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Story Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="traditional">Traditional</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="historical">Historical</SelectItem>
              <SelectItem value="educational">Educational</SelectItem>
              <SelectItem value="healing">Healing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stories List */}
      <div className="space-y-4">
        {stories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No stories found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </CardContent>
          </Card>
        ) : (
          stories.map((story) => (
            <Card key={story.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <CardTitle className="text-lg">{story.title}</CardTitle>
                      <Badge className={getStatusColor(story.status)} variant="secondary">
                        {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
                      </Badge>
                      {story.featured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge className={getCulturalSensitivityColor(story.culturalSensitivityLevel)} variant="secondary">
                        <Shield className="w-3 h-3 mr-1" />
                        {story.culturalSensitivityLevel.charAt(0).toUpperCase() + story.culturalSensitivityLevel.slice(1)}
                      </Badge>
                      {story.needsElderReview && (
                        <Badge variant="secondary" className="bg-clay-100 text-clay-800">
                          <Heart className="w-3 h-3 mr-1" />
                          Elder Review
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4 text-xs">
                        <span>By {story.author.name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {getStoryTypeIcon(story.storyType)}
                          {story.storyType.charAt(0).toUpperCase() + story.storyType.slice(1)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(story.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {story.culturalContext && (
                        <div className="text-xs text-muted-foreground">
                          Cultural Context: {JSON.stringify(story.culturalContext).slice(0, 100)}...
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(story.status)}
                    <span className={`text-xs font-medium ${getPriorityColor(story.priority)}`}>
                      {story.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Story Preview */}
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {story.content.substring(0, 200)}...
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {story.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {story.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      {story.shares}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Dialog open={isStoryDialogOpen && selectedStory?.id === story.id} 
                              onOpenChange={(open) => {
                                setIsStoryDialogOpen(open)
                                if (!open) setSelectedStory(null)
                              }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedStory(story)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{selectedStory?.title}</DialogTitle>
                            <DialogDescription>
                              Full story content and moderation actions
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedStory && (
                            <div className="space-y-6">
                              {/* Story Metadata */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <div className="font-medium">Author</div>
                                  <div className="text-muted-foreground">{selectedStory.author.name}</div>
                                </div>
                                <div>
                                  <div className="font-medium">Type</div>
                                  <div className="text-muted-foreground">{selectedStory.storyType}</div>
                                </div>
                                <div>
                                  <div className="font-medium">Audience</div>
                                  <div className="text-muted-foreground">{selectedStory.audience}</div>
                                </div>
                                <div>
                                  <div className="font-medium">Sensitivity</div>
                                  <div className="text-muted-foreground">{selectedStory.culturalSensitivityLevel}</div>
                                </div>
                              </div>

                              {/* Story Content */}
                              <div className="space-y-4">
                                <div className="font-medium">Story Content</div>
                                <div className="prose prose-sm max-w-none p-4 bg-muted/50 rounded-lg">
                                  {selectedStory.content.split('\n').map((paragraph, idx) => (
                                    <p key={idx} className="mb-3 last:mb-0">{paragraph}</p>
                                  ))}
                                </div>
                              </div>

                              {/* Cultural Context */}
                              {selectedStory.culturalContext && (
                                <div className="space-y-4">
                                  <div className="font-medium">Cultural Context</div>
                                  <div className="text-sm bg-muted/50 p-4 rounded-lg">
                                    <pre className="whitespace-pre-wrap">
                                      {JSON.stringify(selectedStory.culturalContext, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {/* Admin Actions */}
                              <div className="flex flex-wrap gap-2 pt-4 border-t">
                                {selectedStory.status === 'review' && (
                                  <>
                                    <Button
                                      onClick={() => handleStoryAction(selectedStory.id, 'approve')}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="w-4 h-4 mr-2" />
                                      Approve & Publish
                                    </Button>
                                    <Button
                                      onClick={() => handleStoryAction(selectedStory.id, 'reject')}
                                      variant="destructive"
                                    >
                                      <X className="w-4 h-4 mr-2" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                
                                {selectedStory.needsElderReview && (
                                  <Button
                                    onClick={() => handleStoryAction(selectedStory.id, 'elder_approve')}
                                    className="bg-clay-600 hover:bg-clay-700"
                                  >
                                    <Heart className="w-4 h-4 mr-2" />
                                    Elder Approve
                                  </Button>
                                )}

                                <Button
                                  onClick={() => handleStoryAction(selectedStory.id, selectedStory.featured ? 'unfeature' : 'feature')}
                                  variant="outline"
                                >
                                  {selectedStory.featured ? (
                                    <>
                                      <StarOff className="w-4 h-4 mr-2" />
                                      Remove Feature
                                    </>
                                  ) : (
                                    <>
                                      <Star className="w-4 h-4 mr-2" />
                                      Feature Story
                                    </>
                                  )}
                                </Button>

                                <Button
                                  onClick={() => handleStoryAction(selectedStory.id, 'flag')}
                                  variant="outline"
                                >
                                  <Flag className="w-4 h-4 mr-2" />
                                  Flag for Review
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {story.status === 'review' && (
                        <>
                          <Button
                            onClick={() => handleStoryAction(story.id, 'approve')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleStoryAction(story.id, 'reject')}
                            size="sm"
                            variant="destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalCount)} of {pagination.totalCount} results
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStories(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <span className="text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStories(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentModeration