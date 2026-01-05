'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Users, Lock, Globe2, Shield, AlertCircle, Calendar, Clock, MapPin, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryPreviewProps {
  story: {
    title: string
    content: string
    excerpt?: string
    storyteller_name?: string
    storyteller_avatar?: string
    visibility: 'public' | 'community' | 'private' | 'restricted'
    cultural_sensitivity_level: 'none' | 'moderate' | 'high' | 'sacred'
    requires_elder_review: boolean
    location?: string
    tags?: string[]
    created_at?: string
    reading_time?: number
    media?: Array<{
      id: string
      url: string
      type: 'image' | 'video'
      alt_text?: string
    }>
  }
  onEdit?: () => void
  onPublish?: () => void
  className?: string
}

export function StoryPreview({
  story,
  onEdit,
  onPublish,
  className
}: StoryPreviewProps) {
  const visibilityConfig = {
    public: {
      icon: Globe2,
      label: 'Public',
      description: 'Anyone can see',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200'
    },
    community: {
      icon: Users,
      label: 'Community',
      description: 'Members only',
      color: 'text-sage-600',
      bgColor: 'bg-sage-50',
      borderColor: 'border-sage-200'
    },
    private: {
      icon: EyeOff,
      label: 'Private',
      description: 'Only you',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    restricted: {
      icon: Lock,
      label: 'Restricted',
      description: 'Approved viewers',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  }

  const culturalSensitivityConfig = {
    none: { level: 'None', color: 'text-gray-600' },
    moderate: { level: 'Moderate', color: 'text-blue-600' },
    high: { level: 'High', color: 'text-clay-600' },
    sacred: { level: 'Sacred', color: 'text-ember-600' }
  }

  const visibilityInfo = visibilityConfig[story.visibility]
  const VisibilityIcon = visibilityInfo.icon
  const culturalInfo = culturalSensitivityConfig[story.cultural_sensitivity_level]

  const wordCount = story.content.trim().split(/\s+/).filter(Boolean).length
  const readingTime = story.reading_time || Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-clay-900 flex items-center gap-2">
            <Eye className="h-6 w-6 text-sky-600" />
            Story Preview
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            See how your story will appear to readers
          </p>
        </div>

        {onEdit && (
          <Button variant="outline" onClick={onEdit}>
            Edit Story
          </Button>
        )}
      </div>

      {/* Settings Summary */}
      <Card className="border-clay-200 bg-clay-50/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-clay-600" />
            Privacy & Cultural Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Visibility */}
            <div className={cn(
              'flex items-start gap-3 p-3 rounded-lg border',
              visibilityInfo.bgColor,
              visibilityInfo.borderColor
            )}>
              <VisibilityIcon className={cn('h-5 w-5 mt-0.5', visibilityInfo.color)} />
              <div>
                <p className="font-medium text-sm">{visibilityInfo.label}</p>
                <p className="text-xs text-muted-foreground">{visibilityInfo.description}</p>
              </div>
            </div>

            {/* Cultural Sensitivity */}
            <div className="flex items-start gap-3 p-3 rounded-lg border border-clay-200 bg-white">
              <Shield className={cn('h-5 w-5 mt-0.5', culturalInfo.color)} />
              <div>
                <p className="font-medium text-sm">Cultural Sensitivity: {culturalInfo.level}</p>
                {story.requires_elder_review && (
                  <Badge variant="outline" className="mt-1 bg-sage-50 text-sage-700 border-sage-300">
                    Elder Review Required
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {story.cultural_sensitivity_level === 'sacred' && (
            <Alert className="bg-ember-50 border-ember-300">
              <Shield className="h-4 w-4 text-ember-700" />
              <AlertDescription className="text-ember-800 text-sm">
                <strong>Sacred Content:</strong> This story requires Elder approval before publication
                and will not be processed by AI systems.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Story Display */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            {/* Title */}
            <CardTitle className="text-3xl font-bold text-clay-900 leading-tight">
              {story.title}
            </CardTitle>

            {/* Excerpt */}
            {story.excerpt && (
              <CardDescription className="text-lg text-clay-700">
                {story.excerpt}
              </CardDescription>
            )}

            {/* Storyteller Info */}
            {story.storyteller_name && (
              <div className="flex items-center gap-3 pt-2">
                {story.storyteller_avatar && (
                  <img
                    src={story.storyteller_avatar}
                    alt={story.storyteller_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-clay-900">{story.storyteller_name}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {story.created_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(story.created_at).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {readingTime} min read
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
              {story.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {story.location}
                </div>
              )}
              {story.tags && story.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {story.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Featured Media */}
          {story.media && story.media.length > 0 && (
            <div className="space-y-4">
              {story.media.map((media, idx) => (
                <div key={media.id} className="rounded-lg overflow-hidden">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={media.alt_text || `Story image ${idx + 1}`}
                      className="w-full h-auto"
                    />
                  ) : (
                    <video
                      src={media.url}
                      controls
                      className="w-full h-auto"
                    />
                  )}
                  {media.alt_text && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      {media.alt_text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Story Content */}
          <div className="prose prose-lg max-w-none">
            <div
              className="whitespace-pre-wrap font-serif text-clay-900 leading-relaxed"
              style={{ fontSize: '1.125rem', lineHeight: '1.75' }}
            >
              {story.content}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publish Actions */}
      {onPublish && (
        <Card className="border-2 border-dashed border-sky-300 bg-sky-50/30">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-clay-900">Ready to share your story?</h3>
                <p className="text-sm text-muted-foreground">
                  {story.requires_elder_review
                    ? 'Your story will be sent to Elders for review before publication'
                    : 'Your story will be visible according to your privacy settings'}
                </p>
              </div>
              <Button onClick={onPublish} size="lg" className="min-w-[160px]">
                {story.requires_elder_review ? 'Submit for Review' : 'Publish Story'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Notice */}
      <Alert className="bg-sage-50 border-sage-200">
        <Eye className="h-4 w-4 text-sage-600" />
        <AlertDescription className="text-sage-800 text-sm">
          <strong>Preview Mode:</strong> This is how your story will appear to readers with your
          selected privacy level. You can edit or publish from here.
        </AlertDescription>
      </Alert>
    </div>
  )
}
