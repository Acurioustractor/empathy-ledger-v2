'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Calendar,
  MapPin,
  Globe,
  Eye,
  ArrowRight,
  AlertTriangle,
  Shield,
  Clock,
  BookOpen
} from 'lucide-react'

interface Story {
  id: string
  title: string
  content: string
  excerpt?: string
  story_type: string
  status: string
  cultural_sensitivity_level: string
  privacy_level: string
  created_at: string
  word_count?: number
  reading_time?: number
  location?: string
  cultural_tags?: string[]
  storyteller: {
    id: string
    display_name: string
    profile_image_url?: string
    cultural_background?: string
    is_elder?: boolean
  }
  review_submission?: {
    priority: string
    concerns?: string[]
    submitted_at: string
    notes?: string
  }
}

interface StoryPreviewProps {
  storyId: string
  elderId: string
  onNavigateToWorkflow: () => void
}

export function StoryPreview({ storyId, elderId, onNavigateToWorkflow }: StoryPreviewProps) {
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/stories/${storyId}`)
        if (response.ok) {
          const data = await response.json()
          setStory(data)
        }
      } catch (error) {
        console.error('Failed to fetch story:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStory()
  }, [storyId])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading story...</p>
        </CardContent>
      </Card>
    )
  }

  if (!story) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-20 text-red-500" />
          <p>Story not found</p>
        </CardContent>
      </Card>
    )
  }

  const getSensitivityColor = (level: string) => {
    switch (level) {
      case 'sacred': return 'border-amber-600 bg-amber-50'
      case 'high': return 'border-clay-600 bg-clay-50'
      case 'moderate': return 'border-sky-600 bg-sky-50'
      default: return 'border-sage-600 bg-sage-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{story.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{story.storyteller.display_name}</span>
                  {story.storyteller.is_elder && (
                    <Shield className="h-4 w-4 text-amber-600 ml-1" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(story.created_at).toLocaleDateString()}</span>
                </div>
                {story.word_count && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{story.word_count} words</span>
                  </div>
                )}
                {story.reading_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{story.reading_time} min read</span>
                  </div>
                )}
              </div>
            </div>
            <Button onClick={onNavigateToWorkflow}>
              Review Story
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getSensitivityColor(story.cultural_sensitivity_level)}>
              {story.cultural_sensitivity_level} sensitivity
            </Badge>
            <Badge variant="outline">{story.privacy_level}</Badge>
            <Badge variant="outline">{story.story_type}</Badge>
            {story.location && (
              <Badge variant="outline">
                <MapPin className="h-3 w-3 mr-1" />
                {story.location}
              </Badge>
            )}
          </div>

          {/* Cultural Tags */}
          {story.cultural_tags && story.cultural_tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Cultural Tags</h4>
              <div className="flex flex-wrap gap-2">
                {story.cultural_tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Storyteller Background */}
          {story.storyteller.cultural_background && (
            <div>
              <h4 className="text-sm font-medium mb-1">Storyteller Background</h4>
              <p className="text-sm text-muted-foreground">{story.storyteller.cultural_background}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Details (if in review queue) */}
      {story.review_submission && (
        <Card className="border-amber-600 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Review Request Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Priority:</span>
                <Badge className="ml-2" variant={story.review_submission.priority === 'urgent' ? 'destructive' : 'outline'}>
                  {story.review_submission.priority}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Submitted:</span>
                <span className="ml-2">{new Date(story.review_submission.submitted_at).toLocaleString()}</span>
              </div>
            </div>

            {story.review_submission.concerns && story.review_submission.concerns.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Cultural Concerns Flagged
                </h5>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {story.review_submission.concerns.map((concern, index) => (
                    <li key={index} className="text-amber-900">{concern}</li>
                  ))}
                </ul>
              </div>
            )}

            {story.review_submission.notes && (
              <div>
                <h5 className="text-sm font-medium mb-1">Submission Notes</h5>
                <p className="text-sm text-muted-foreground">{story.review_submission.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Story Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Story Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed">
              {story.content}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cultural Safety Reminder */}
      <Card className="bg-gradient-to-r from-sage-50 to-sky-50 border-sage-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-sage-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-sage-900">Review Considerations</p>
              <ul className="mt-2 space-y-1 text-sage-700">
                <li>• Does this story respect cultural protocols?</li>
                <li>• Is sacred knowledge being shared appropriately?</li>
                <li>• Are proper permissions and attributions in place?</li>
                <li>• Could this content cause harm or misunderstanding?</li>
                <li>• Should this be escalated to the Elder Council?</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-end">
        <Button size="lg" onClick={onNavigateToWorkflow}>
          Proceed to Review Workflow
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
