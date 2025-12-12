'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import StoryReviewModal from '@/components/admin/StoryReviewModal'
import { 
  Eye, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Heart, 
  Shield, 
  Calendar,
  User,
  FileText,
  Loader2,
  BarChart3
} from 'lucide-react'

interface PendingReview {
  id: string
  type: 'story' | 'transcript' | 'media'
  title: string
  author: string
  submittedAt: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  culturalSensitive: boolean
  requiresElderReview: boolean
  status: 'pending' | 'in_review' | 'escalated'
}

interface ReviewStats {
  pendingCount: number
  approvedToday: number
  rejectedToday: number
  elderReviewQueue: number
  avgReviewTime: number
}

export default function ContentReviewDashboard() {
  const [reviews, setReviews] = useState<PendingReview[]>([])
  const [filteredReviews, setFilteredReviews] = useState<PendingReview[]>([])
  const [stats, setStats] = useState<ReviewStats>({
    pendingCount: 0,
    approvedToday: 0,
    rejectedToday: 0,
    elderReviewQueue: 0,
    avgReviewTime: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Fetch pending reviews
  const fetchPendingReviews = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/reviews/pending')
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending reviews')
      }

      const data = await response.json()
      setReviews(data.reviews || [])
      setFilteredReviews(data.reviews || [])
      
      // Calculate stats
      const pendingCount = data.reviews?.length || 0
      const elderReviewQueue = data.reviews?.filter((r: PendingReview) => r.requiresElderReview).length || 0
      
      setStats({
        pendingCount,
        approvedToday: 0, // TODO: Fetch from API
        rejectedToday: 0, // TODO: Fetch from API
        elderReviewQueue,
        avgReviewTime: 2.5 // TODO: Calculate from API
      })

    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError('Failed to load pending reviews')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter reviews based on search and filters
  useEffect(() => {
    let filtered = reviews

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(review => 
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(review => review.priority === priorityFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(review => review.type === typeFilter)
    }

    setFilteredReviews(filtered)
  }, [reviews, searchTerm, priorityFilter, typeFilter])

  // Load data on mount
  useEffect(() => {
    fetchPendingReviews()
  }, [])

  // Handle review completion
  const handleReviewComplete = async (reviewId: string, action: any) => {
    try {
      console.log('Review completed:', { reviewId, action })
      
      // TODO: Send review decision to API
      const response = await fetch(`/api/admin/reviews/${reviewId}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action)
      })

      if (response.ok) {
        // Remove from pending reviews
        setReviews(prev => prev.filter(r => r.id !== reviewId))
        // Refresh stats
        fetchPendingReviews()
      }
    } catch (err) {
      console.error('Error submitting review:', err)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-grey-100 text-grey-800 border-grey-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'story': return <FileText className="w-4 h-4" />
      case 'transcript': return <FileText className="w-4 h-4" />
      case 'media': return <Eye className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading pending reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Content Review Dashboard</h1>
          <p className="text-grey-600 mt-2">
            Review and moderate community-submitted content
          </p>
        </div>
        <Button onClick={fetchPendingReviews} variant="outline">
          <Clock className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-grey-600">Pending Reviews</p>
                <p className="text-2xl font-bold">{stats.pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-grey-600">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedToday}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-grey-600">Rejected Today</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejectedToday}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-grey-600">Elder Review Queue</p>
                <p className="text-2xl font-bold text-clay-600">{stats.elderReviewQueue}</p>
              </div>
              <Heart className="w-8 h-8 text-clay-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-grey-600">Avg Review Time</p>
                <p className="text-2xl font-bold">{stats.avgReviewTime}h</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-400" />
                <Input
                  placeholder="Search by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="story">Stories</SelectItem>
                <SelectItem value="transcript">Transcripts</SelectItem>
                <SelectItem value="media">Media</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || priorityFilter !== 'all' || typeFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setPriorityFilter('all')
                  setTypeFilter('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews ({filteredReviews.length})</CardTitle>
          <CardDescription>
            Content awaiting moderation approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
              <p className="text-grey-600">No pending reviews at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-4 hover:bg-grey-50 transition-colours"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(review.type)}
                        <h3 className="font-semibold">{review.title}</h3>
                        <Badge className={getPriorityColor(review.priority)}>
                          {review.priority}
                        </Badge>
                        {review.culturalSensitive && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Cultural
                          </Badge>
                        )}
                        {review.requiresElderReview && (
                          <Badge variant="outline" className="text-xs">
                            <Heart className="w-3 h-3 mr-1" />
                            Elder Review
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-grey-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {review.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(review.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <StoryReviewModal
                        story={{
                          id: review.id,
                          title: review.title,
                          content: '', // TODO: Fetch full content
                          author: {
                            name: review.author,
                            id: 'unknown', // TODO: Get actual author ID
                          },
                          submittedAt: review.submittedAt,
                          type: 'personal', // TODO: Map review type to story type
                          tags: [],
                          culturalSensitive: review.culturalSensitive,
                          requiresElderReview: review.requiresElderReview,
                          status: review.status === 'pending' ? 'pending' : 'in_review',
                          priority: review.priority,
                          language: 'en', // TODO: Get actual language
                          visibility: 'community' // TODO: Get actual visibility setting
                        }}
                        onReviewComplete={(action) => handleReviewComplete(review.id, action)}
                      >
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </StoryReviewModal>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}