'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  BookOpen,
  FileText,
  ThumbsUp,
  MessageSquare,
  Shield
} from 'lucide-react'

interface Story {
  id: string
  title: string
  storyteller_name: string
  content: string
  excerpt: string
  submitted_at: string
  word_count: number
  themes?: string[]
  project_name?: string
  quality_issues?: string[]
}

interface QualityReviewQueueProps {
  organizationId: string
  projectId?: string
  onReviewComplete: () => void
}

export function QualityReviewQueue({ organizationId, projectId, onReviewComplete }: QualityReviewQueueProps) {
  const { toast } = useToast()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'minor_edits' | 'major_revision' | 'decline'>('approve')
  const [reviewNotes, setReviewNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchStories()
  }, [organizationId, projectId])

  const fetchStories = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        organization_id: organizationId,
        status: 'pending_review'
      })
      if (projectId) params.set('project_id', projectId)

      const response = await fetch(`/api/curation/review-queue?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setStories(data.stories || [])
        if (data.stories && data.stories.length > 0 && !selectedStory) {
          setSelectedStory(data.stories[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch review queue:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!selectedStory) return

    try {
      setSubmitting(true)

      const response = await fetch('/api/curation/review-queue/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          story_id: selectedStory.id,
          decision: reviewDecision,
          notes: reviewNotes.trim() || undefined,
          reviewed_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      toast({
        title: 'Review Submitted',
        description: `Quality review for "${selectedStory.title}" has been recorded.`,
      })

      // Move to next story or clear selection
      const currentIndex = stories.findIndex(s => s.id === selectedStory.id)
      const nextStory = stories[currentIndex + 1] || null

      setStories(stories.filter(s => s.id !== selectedStory.id))
      setSelectedStory(nextStory)
      setReviewDecision('approve')
      setReviewNotes('')
      onReviewComplete()
    } catch (error) {
      console.error('Failed to submit review:', error)
      toast({
        title: 'Review Failed',
        description: 'Unable to submit review. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkipStory = () => {
    const currentIndex = stories.findIndex(s => s.id === selectedStory?.id)
    const nextStory = stories[(currentIndex + 1) % stories.length] || null
    setSelectedStory(nextStory)
    setReviewDecision('approve')
    setReviewNotes('')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading review queue...</p>
        </CardContent>
      </Card>
    )
  }

  if (stories.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-sage-600 opacity-20" />
          <p className="text-lg font-medium">Review Queue Empty</p>
          <p className="text-sm mt-1">All stories have been reviewed!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Queue Status */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium">
                  {stories.length} {stories.length === 1 ? 'story' : 'stories'} awaiting review
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedStory && `Reviewing: ${selectedStory.title}`}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-600 text-amber-600">
              {stories.findIndex(s => s.id === selectedStory?.id) + 1} / {stories.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Story Preview */}
        <div className="lg:col-span-2 space-y-4">
          {selectedStory && (
            <>
              {/* Story Header */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedStory.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{selectedStory.storyteller_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(selectedStory.submitted_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{selectedStory.word_count.toLocaleString()} words</span>
                      </div>
                    </div>
                  </div>

                  {selectedStory.project_name && (
                    <div className="flex items-center gap-2 p-3 bg-sage-50 border border-sage-200 rounded-lg">
                      <Shield className="h-4 w-4 text-sage-600" />
                      <span className="text-sm font-medium text-sage-900">
                        Project: {selectedStory.project_name}
                      </span>
                    </div>
                  )}

                  {selectedStory.themes && selectedStory.themes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedStory.themes.map((theme, index) => (
                        <Badge key={index} variant="outline">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Story Content */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Story Content</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {selectedStory.content}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quality Checklist */}
              <Card className="bg-gradient-to-r from-sky-50 to-sage-50 border-sky-200">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-sky-600" />
                    Quality Checklist
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-sage-600 mt-0.5 flex-shrink-0" />
                      <span>Story is complete and coherent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-sage-600 mt-0.5 flex-shrink-0" />
                      <span>Grammar and spelling are acceptable</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-sage-600 mt-0.5 flex-shrink-0" />
                      <span>Content respects cultural protocols</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-sage-600 mt-0.5 flex-shrink-0" />
                      <span>Themes are appropriately tagged</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-sage-600 mt-0.5 flex-shrink-0" />
                      <span>Story length is appropriate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-sage-600 mt-0.5 flex-shrink-0" />
                      <span>No harmful or inappropriate content</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Review Form */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Review Decision</h3>
                <RadioGroup value={reviewDecision} onValueChange={(value: any) => setReviewDecision(value)}>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-sage-50 cursor-pointer">
                      <RadioGroupItem value="approve" id="approve" className="mt-0.5" />
                      <Label htmlFor="approve" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <ThumbsUp className="h-4 w-4 text-sage-600" />
                          <span className="font-medium">Approve</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Story is ready for publication
                        </p>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-sky-50 cursor-pointer">
                      <RadioGroupItem value="minor_edits" id="minor_edits" className="mt-0.5" />
                      <Label htmlFor="minor_edits" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-sky-600" />
                          <span className="font-medium">Minor Edits</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Small changes needed (typos, formatting)
                        </p>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-amber-50 cursor-pointer">
                      <RadioGroupItem value="major_revision" id="major_revision" className="mt-0.5" />
                      <Label htmlFor="major_revision" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span className="font-medium">Major Revision</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Significant changes required
                        </p>
                      </Label>
                    </div>

                    <div className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-ember-50 cursor-pointer">
                      <RadioGroupItem value="decline" id="decline" className="mt-0.5" />
                      <Label htmlFor="decline" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="h-4 w-4 text-ember-600" />
                          <span className="font-medium">Decline</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Not suitable for publication
                        </p>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="notes" className="mb-2 block">
                  Review Notes {reviewDecision !== 'approve' && <span className="text-ember-600">*</span>}
                </Label>
                <Textarea
                  id="notes"
                  placeholder={
                    reviewDecision === 'approve'
                      ? 'Optional notes or feedback...'
                      : 'Explain what needs to be changed...'
                  }
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={handleSubmitReview}
                  disabled={submitting || (reviewDecision !== 'approve' && !reviewNotes.trim())}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
                {stories.length > 1 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSkipStory}
                  >
                    Skip to Next Story
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
