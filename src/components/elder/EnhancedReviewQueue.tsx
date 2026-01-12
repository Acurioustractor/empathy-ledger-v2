'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Clock,
  AlertTriangle,
  Flag,
  User,
  Calendar,
  Eye,
  Search,
  UserCheck,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Users
} from 'lucide-react'

interface ReviewQueueItem {
  id: string
  story_id: string
  storyteller_id: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  cultural_sensitivity_level: 'none' | 'moderate' | 'high' | 'sacred'
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'changes_requested' | 'escalated'
  submitted_at: string
  story: {
    title: string
    excerpt?: string
    cultural_tags?: string[]
    word_count?: number
    content_warnings?: string[]
  }
  storyteller: {
    display_name: string
    profile_image_url?: string
    is_elder?: boolean
  }
  concerns?: string[]
  assigned_elder_id?: string
  assigned_elder_name?: string
  consent_status?: 'complete' | 'pending' | 'missing'
  ai_analysis?: {
    summary?: string
    detected_themes?: string[]
    cultural_elements?: string[]
    sensitivity_score?: number
  }
  estimated_review_time?: number // minutes
}

interface ReviewQueueProps {
  elderId?: string
  onStorySelected: (storyId: string) => void
  onRefresh: () => void
  showAssignments?: boolean
  compact?: boolean
}

export function EnhancedReviewQueue({
  elderId,
  onStorySelected,
  onRefresh,
  showAssignments = true,
  compact = false
}: ReviewQueueProps) {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([])
  const [filteredQueue, setFilteredQueue] = useState<ReviewQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sensitivityFilter, setSensitivityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_review: 0,
    urgent: 0,
    assigned_to_me: 0
  })

  const fetchQueue = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (elderId) params.append('elder_id', elderId)

      const response = await fetch(`/api/admin/reviews/pending?${params}`)
      if (response.ok) {
        const data = await response.json()
        setQueue(data.queue || [])
        setFilteredQueue(data.queue || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Failed to fetch review queue:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueue()
    // Poll every 30 seconds for new submissions
    const interval = setInterval(fetchQueue, 30000)
    return () => clearInterval(interval)
  }, [])

  // Filter queue
  useEffect(() => {
    const filtered = queue.filter(item => {
      const matchesSearch = searchTerm === '' ||
        item.story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.storyteller.display_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter
      const matchesSensitivity = sensitivityFilter === 'all' || item.cultural_sensitivity_level === sensitivityFilter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter

      const matchesAssignment = assignmentFilter === 'all' ||
        (assignmentFilter === 'me' && item.assigned_elder_id === elderId) ||
        (assignmentFilter === 'unassigned' && !item.assigned_elder_id) ||
        (assignmentFilter === 'others' && item.assigned_elder_id && item.assigned_elder_id !== elderId)

      return matchesSearch && matchesPriority && matchesSensitivity && matchesStatus && matchesAssignment
    })

    // Sort by priority (urgent → high → medium → low) and date (oldest first)
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    filtered.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
    })

    setFilteredQueue(filtered)
  }, [queue, searchTerm, priorityFilter, sensitivityFilter, statusFilter, assignmentFilter, elderId])

  const assignToSelf = async (storyId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/admin/reviews/${storyId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elder_id: elderId })
      })
      if (response.ok) {
        fetchQueue()
      }
    } catch (error) {
      console.error('Failed to assign story:', error)
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="bg-red-600">Urgent</Badge>
      case 'high':
        return <Badge variant="outline" className="border-ember-600 text-ember-600">High</Badge>
      case 'medium':
        return <Badge variant="outline" className="border-amber-600 text-amber-600">Medium</Badge>
      case 'low':
        return <Badge variant="outline" className="border-sage-600 text-sage-600">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getSensitivityBadge = (level: string) => {
    switch (level) {
      case 'sacred':
        return <Badge className="bg-amber-600">Sacred</Badge>
      case 'high':
        return <Badge variant="outline" className="border-clay-600 text-clay-600">High Sensitivity</Badge>
      case 'moderate':
        return <Badge variant="outline" className="border-sky-600 text-sky-600">Moderate</Badge>
      case 'none':
        return <Badge variant="outline" className="border-sage-600 text-sage-600">General</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  const getConsentBadge = (status?: string) => {
    switch (status) {
      case 'complete':
        return <Badge variant="outline" className="border-green-600 text-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Consent OK</Badge>
      case 'pending':
        return <Badge variant="outline" className="border-amber-600 text-amber-600"><AlertCircle className="h-3 w-3 mr-1" />Consent Pending</Badge>
      case 'missing':
        return <Badge variant="outline" className="border-red-600 text-red-600"><XCircle className="h-3 w-3 mr-1" />No Consent</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading review queue...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Queue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.in_review}</div>
            <div className="text-xs text-muted-foreground">In Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
            <div className="text-xs text-muted-foreground">Urgent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.assigned_to_me}</div>
            <div className="text-xs text-muted-foreground">Assigned to Me</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Story or storyteller..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="changes_requested">Changes Requested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Sensitivity</label>
              <Select value={sensitivityFilter} onValueChange={setSensitivityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="sacred">Sacred</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="none">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showAssignments && (
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Assigned To</label>
                <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="me">Me</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Queue List */}
      <div className="space-y-3">
        {filteredQueue.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No stories in review queue</p>
              <p className="text-sm mt-1">
                {queue.length === 0
                  ? 'All stories have been reviewed'
                  : 'No stories match your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredQueue.map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onStorySelected(item.story_id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      {getPriorityBadge(item.priority)}
                      {getSensitivityBadge(item.cultural_sensitivity_level)}
                      {getConsentBadge(item.consent_status)}
                      {item.storyteller.is_elder && (
                        <Badge variant="outline" className="border-purple-600 text-purple-600">
                          <Users className="h-3 w-3 mr-1" />
                          Elder
                        </Badge>
                      )}
                      {item.concerns && item.concerns.length > 0 && (
                        <Badge variant="outline" className="border-red-600 text-red-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {item.concerns.length} concerns
                        </Badge>
                      )}
                      {item.ai_analysis && (
                        <Badge variant="outline" className="border-blue-600 text-blue-600">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          AI Analyzed
                        </Badge>
                      )}
                    </div>

                    {/* Story Title */}
                    <h3 className="font-semibold text-lg mb-1">{item.story.title}</h3>

                    {/* Storyteller Info & Metadata */}
                    <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{item.storyteller.display_name}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(item.submitted_at)}</span>
                      </div>
                      {item.story.word_count && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{item.story.word_count} words</span>
                          </div>
                        </>
                      )}
                      {item.estimated_review_time && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>~{item.estimated_review_time}min</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Assignment Status */}
                    {showAssignments && item.assigned_elder_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <UserCheck className="h-4 w-4" />
                        <span>Assigned to {item.assigned_elder_name}</span>
                      </div>
                    )}

                    {/* AI Analysis Summary */}
                    {item.ai_analysis?.summary && !compact && (
                      <div className="text-sm text-muted-foreground bg-muted p-2 rounded mt-2">
                        <span className="font-medium">AI Summary: </span>
                        {item.ai_analysis.summary}
                      </div>
                    )}

                    {/* Cultural Elements */}
                    {item.ai_analysis?.cultural_elements && item.ai_analysis.cultural_elements.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.ai_analysis.cultural_elements.slice(0, 3).map((element, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-amber-600 text-amber-600">
                            {element}
                          </Badge>
                        ))}
                        {item.ai_analysis.cultural_elements.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.ai_analysis.cultural_elements.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                    {showAssignments && !item.assigned_elder_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => assignToSelf(item.story_id, e)}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Assign to Me
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
