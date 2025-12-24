'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  BookOpen,
  FileText,
  ChevronRight,
  Loader2,
  MessageSquare,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '@/lib/context/auth.context'

interface ReviewItem {
  id: string
  content_id: string
  content_type: 'story' | 'media' | 'gallery' | 'profile' | 'comment'
  title: string
  content_preview: string
  cultural_issues: Array<{
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    recommendation: string
  }>
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_elder_id?: string
  assigned_at?: string
  due_date: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_consultation'
  community_input_required: boolean
}

interface ModerationStats {
  total_reviewed: number
  approved: number
  flagged: number
  blocked: number
  elder_review_required: number
  pending_elder_review: number
}

interface QueueSummary {
  total_items: number
  pending: number
  in_review: number
  high_priority: number
  community_input_required: number
}

export function ElderReviewDashboard() {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('queue')
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [queueSummary, setQueueSummary] = useState<QueueSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewConditions, setReviewConditions] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const elderId = user?.id

  const fetchData = useCallback(async () => {
    if (!elderId) return

    setLoading(true)
    setError(null)

    try {
      // Fetch review queue and stats in parallel
      const [queueRes, statsRes] = await Promise.all([
        fetch(`/api/ai/cultural-safety?elder_id=${elderId}&action=queue`),
        fetch(`/api/ai/cultural-safety?elder_id=${elderId}&action=stats&timeframe=week`)
      ])

      if (!queueRes.ok) {
        throw new Error('Failed to fetch review queue')
      }

      const queueData = await queueRes.json()
      setReviewItems(queueData.review_queue || [])
      setQueueSummary(queueData.queue_summary || null)

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.moderation_stats || null)
      }
    } catch (err) {
      console.error('Error fetching elder dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [elderId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleStartReview = (item: ReviewItem) => {
    setSelectedItem(item)
    setReviewNotes('')
    setReviewConditions([])
    setShowReviewDialog(true)
  }

  const handleSubmitDecision = async (decision: 'approved' | 'rejected' | 'needs_consultation') => {
    if (!selectedItem || !elderId || !reviewNotes.trim()) {
      setMessage({ type: 'error', text: 'Please provide review notes' })
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/ai/cultural-safety', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_id: selectedItem.id,
          elder_id: elderId,
          decision,
          notes: reviewNotes,
          conditions: reviewConditions.filter(c => c.trim())
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit decision')
      }

      setMessage({ type: 'success', text: `Content ${decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'marked for consultation'}` })
      setShowReviewDialog(false)
      setSelectedItem(null)

      // Refresh the queue
      fetchData()
    } catch (err) {
      console.error('Error submitting review:', err)
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to submit decision' })
    } finally {
      setSubmitting(false)
    }
  }

  const getPriorityBadge = (priority: ReviewItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Urgent</Badge>
      case 'high':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">High</Badge>
      case 'medium':
        return <Badge className="bg-earth-100 text-earth-700 border-earth-200">Medium</Badge>
      default:
        return <Badge className="bg-stone-100 text-stone-600 border-stone-200">Low</Badge>
    }
  }

  const getContentTypeIcon = (type: ReviewItem['content_type']) => {
    switch (type) {
      case 'story':
        return <BookOpen className="w-4 h-4" />
      case 'media':
        return <FileText className="w-4 h-4" />
      case 'gallery':
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-amber-600 bg-amber-50'
      case 'medium': return 'text-earth-600 bg-earth-50'
      default: return 'text-stone-500 bg-stone-50'
    }
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return <span className="text-red-600">Overdue by {Math.abs(days)} days</span>
    if (days === 0) return <span className="text-amber-600">Due today</span>
    if (days === 1) return <span className="text-amber-600">Due tomorrow</span>
    return <span className="text-stone-600">Due in {days} days</span>
  }

  // Check if user is an elder
  if (!profile?.is_elder) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-stone-400" />
          <h3 className="text-lg font-medium text-stone-700 mb-2">Elder Access Required</h3>
          <p className="text-stone-500">
            This dashboard is only accessible to designated elders with cultural review permissions.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-earth-600" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-earth-100 rounded-lg">
                <Clock className="w-5 h-5 text-earth-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-earth-800">{queueSummary?.pending || 0}</p>
                <p className="text-xs text-stone-500">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{queueSummary?.high_priority || 0}</p>
                <p className="text-xs text-stone-500">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sage-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-sage-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-sage-700">{stats?.approved || 0}</p>
                <p className="text-xs text-stone-500">Approved (Week)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{queueSummary?.community_input_required || 0}</p>
                <p className="text-xs text-stone-500">Need Community Input</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {message && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Review Queue
            {queueSummary && queueSummary.pending > 0 && (
              <Badge variant="secondary" className="ml-1">{queueSummary.pending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Review Queue Tab */}
        <TabsContent value="queue" className="mt-4">
          {reviewItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-sage-500" />
                <h3 className="text-lg font-medium text-stone-700 mb-2">All Caught Up</h3>
                <p className="text-stone-500">No pending reviews at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviewItems.map(item => (
                <Card key={item.id} className="hover:border-earth-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2">
                          {getContentTypeIcon(item.content_type)}
                          <h3 className="font-medium text-earth-800 truncate">{item.title}</h3>
                          {getPriorityBadge(item.priority)}
                          {item.community_input_required && (
                            <Badge className="bg-clay-100 text-clay-700 border-clay-200">
                              <Users className="w-3 h-3 mr-1" />
                              Community Input
                            </Badge>
                          )}
                        </div>

                        {/* Preview */}
                        {item.content_preview && (
                          <p className="text-sm text-stone-600 line-clamp-2 mb-3">
                            {item.content_preview}
                          </p>
                        )}

                        {/* Cultural Issues */}
                        {item.cultural_issues.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.cultural_issues.slice(0, 3).map((issue, idx) => (
                              <span
                                key={idx}
                                className={`text-xs px-2 py-1 rounded ${getSeverityColor(issue.severity)}`}
                              >
                                {issue.type.replace(/_/g, ' ')}
                              </span>
                            ))}
                            {item.cultural_issues.length > 3 && (
                              <span className="text-xs text-stone-500">
                                +{item.cultural_issues.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Due Date */}
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-stone-400" />
                          {formatDueDate(item.due_date)}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => handleStartReview(item)}
                        className="bg-earth-600 hover:bg-earth-700 text-white"
                      >
                        Review
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Statistics (Past Week)</CardTitle>
              <CardDescription>Overview of content moderation activity</CardDescription>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-stone-50 rounded-lg">
                    <p className="text-3xl font-bold text-stone-700">{stats.total_reviewed}</p>
                    <p className="text-sm text-stone-500">Total Reviewed</p>
                  </div>
                  <div className="text-center p-4 bg-sage-50 rounded-lg">
                    <p className="text-3xl font-bold text-sage-700">{stats.approved}</p>
                    <p className="text-sm text-stone-500">Approved</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <p className="text-3xl font-bold text-amber-700">{stats.flagged}</p>
                    <p className="text-sm text-stone-500">Flagged</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-3xl font-bold text-red-700">{stats.blocked}</p>
                    <p className="text-sm text-stone-500">Blocked</p>
                  </div>
                  <div className="text-center p-4 bg-earth-50 rounded-lg">
                    <p className="text-3xl font-bold text-earth-700">{stats.elder_review_required}</p>
                    <p className="text-sm text-stone-500">Elder Review Required</p>
                  </div>
                  <div className="text-center p-4 bg-clay-50 rounded-lg">
                    <p className="text-3xl font-bold text-clay-700">{stats.pending_elder_review}</p>
                    <p className="text-sm text-stone-500">Pending Elder Review</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-stone-500 py-8">No statistics available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-earth-600" />
              Cultural Review: {selectedItem?.title}
            </DialogTitle>
            <DialogDescription>
              Review this content for cultural safety and protocol compliance
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* Content Preview */}
              <div className="p-4 bg-stone-50 rounded-lg">
                <h4 className="font-medium text-stone-700 mb-2">Content Preview</h4>
                <p className="text-sm text-stone-600">{selectedItem.content_preview || 'No preview available'}</p>
              </div>

              {/* Cultural Issues */}
              {selectedItem.cultural_issues.length > 0 && (
                <div>
                  <h4 className="font-medium text-stone-700 mb-2">Detected Cultural Issues</h4>
                  <div className="space-y-2">
                    {selectedItem.cultural_issues.map((issue, idx) => (
                      <div key={idx} className={`p-3 rounded-lg ${getSeverityColor(issue.severity)}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {issue.severity.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{issue.type.replace(/_/g, ' ')}</span>
                        </div>
                        <p className="text-sm mb-1">{issue.description}</p>
                        <p className="text-xs opacity-75">Recommendation: {issue.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Notes */}
              <div>
                <label className="block font-medium text-stone-700 mb-2">
                  Review Notes <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Provide your assessment and reasoning for your decision..."
                  rows={4}
                />
              </div>

              {/* Community Input Notice */}
              {selectedItem.community_input_required && (
                <Alert>
                  <Users className="w-4 h-4" />
                  <AlertDescription>
                    This content has been flagged as requiring community input. Consider consulting with community members before making a final decision.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmitDecision('needs_consultation')}
              disabled={submitting || !reviewNotes.trim()}
              className="text-clay-600 border-clay-200 hover:bg-clay-50"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Request Consultation
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleSubmitDecision('rejected')}
              disabled={submitting || !reviewNotes.trim()}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={() => handleSubmitDecision('approved')}
              disabled={submitting || !reviewNotes.trim()}
              className="bg-sage-600 hover:bg-sage-700"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-1" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
