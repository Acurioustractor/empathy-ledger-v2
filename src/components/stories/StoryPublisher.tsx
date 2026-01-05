'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Send, Shield, Eye, Users, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryPublisherProps {
  storyId: string
  story: {
    title: string
    visibility: 'public' | 'community' | 'private' | 'restricted'
    cultural_sensitivity_level: 'none' | 'moderate' | 'high' | 'sacred'
    requires_elder_review: boolean
    has_media: boolean
  }
  onPublish?: (publishOptions: PublishOptions) => Promise<void>
  onSuccess?: (storyUrl: string) => void
  onCancel?: () => void
  className?: string
  testMode?: boolean
}

interface PublishOptions {
  notify_community: boolean
  enable_ai_processing: boolean
  confirm_cultural_protocols: boolean
  confirm_consent: boolean
}

type PublishStatus = 'idle' | 'validating' | 'publishing' | 'success' | 'error'

export function StoryPublisher({
  storyId,
  story,
  onPublish,
  onSuccess,
  onCancel,
  className,
  testMode = false
}: StoryPublisherProps) {
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const [publishOptions, setPublishOptions] = useState<PublishOptions>({
    notify_community: true,
    enable_ai_processing: story.cultural_sensitivity_level !== 'sacred',
    confirm_cultural_protocols: false,
    confirm_consent: false
  })

  const handleOptionChange = (option: keyof PublishOptions, value: boolean) => {
    setPublishOptions(prev => ({ ...prev, [option]: value }))
  }

  const canPublish = () => {
    // Always require consent confirmation
    if (!publishOptions.confirm_consent) return false

    // Require cultural protocols confirmation for sensitive content
    if (story.cultural_sensitivity_level !== 'none' && !publishOptions.confirm_cultural_protocols) {
      return false
    }

    return true
  }

  const handlePublish = async () => {
    if (!canPublish()) {
      setErrorMessage('Please confirm all required checkboxes')
      return
    }

    setPublishStatus('validating')
    setErrorMessage('')

    // Test mode simulation
    if (testMode) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPublishStatus('publishing')
      await new Promise(resolve => setTimeout(resolve, 1500))
      setPublishStatus('success')
      setTimeout(() => {
        onSuccess?.(`/stories/${storyId}`)
      }, 1500)
      return
    }

    try {
      setPublishStatus('publishing')

      if (onPublish) {
        await onPublish(publishOptions)
      } else {
        // Default API call
        const response = await fetch(`/api/stories/${storyId}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(publishOptions)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to publish story')
        }

        const data = await response.json()
        setPublishStatus('success')

        setTimeout(() => {
          onSuccess?.(data.storyUrl)
        }, 1500)
      }
    } catch (error) {
      console.error('Publish error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to publish story')
      setPublishStatus('error')
    }
  }

  const isElderReview = story.requires_elder_review
  const isSacredContent = story.cultural_sensitivity_level === 'sacred'

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-clay-900 flex items-center gap-2">
          <Send className="h-6 w-6 text-sky-600" />
          {isElderReview ? 'Submit for Elder Review' : 'Publish Your Story'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isElderReview
            ? 'Your story will be sent to community Elders for review before publication'
            : 'Your story will be shared according to your privacy settings'}
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Success State */}
      {publishStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Success!</strong> {isElderReview
              ? 'Your story has been submitted for Elder review.'
              : 'Your story has been published.'} Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {/* Story Summary */}
      <Card className="border-clay-200">
        <CardHeader>
          <CardTitle className="text-base">Story Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-lg font-semibold text-clay-900">{story.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Visibility</p>
              <Badge variant="outline" className="mt-1 capitalize">
                {story.visibility}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cultural Sensitivity</p>
              <Badge variant="outline" className="mt-1 capitalize">
                {story.cultural_sensitivity_level}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sacred Content Notice */}
      {isSacredContent && (
        <Alert className="bg-ember-50 border-ember-300">
          <Shield className="h-4 w-4 text-ember-700" />
          <AlertDescription className="text-ember-800 text-sm">
            <strong>Sacred Content Protection:</strong> This story will require Elder approval and
            will not be processed by AI systems to protect its sacred nature.
          </AlertDescription>
        </Alert>
      )}

      {/* Publishing Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Publishing Options</CardTitle>
          <CardDescription>
            Choose how to share your story
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notify Community */}
          {(story.visibility === 'public' || story.visibility === 'community') && !isElderReview && (
            <div className="flex items-start gap-3 p-4 bg-sage-50 rounded-lg border border-sage-200">
              <Checkbox
                id="notify-community"
                checked={publishOptions.notify_community}
                onCheckedChange={(checked) => handleOptionChange('notify_community', checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="notify-community" className="cursor-pointer font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-sage-600" />
                  Notify Community Members
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Send a notification to your community when this story is published
                </p>
              </div>
            </div>
          )}

          {/* AI Processing */}
          {!isSacredContent && (
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Checkbox
                id="ai-processing"
                checked={publishOptions.enable_ai_processing}
                onCheckedChange={(checked) => handleOptionChange('enable_ai_processing', checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="ai-processing" className="cursor-pointer font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Enable AI Theme Extraction
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Allow AI to analyze themes and help connect your story with similar narratives
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Required Confirmations */}
      <Card className="border-2 border-clay-300 bg-clay-50/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-clay-600" />
            Required Confirmations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Consent Confirmation */}
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-clay-200">
            <Checkbox
              id="confirm-consent"
              checked={publishOptions.confirm_consent}
              onCheckedChange={(checked) => handleOptionChange('confirm_consent', checked as boolean)}
              required
            />
            <div className="flex-1">
              <Label htmlFor="confirm-consent" className="cursor-pointer font-medium text-clay-900">
                I have the right to share this story
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                I confirm that I have the necessary permissions and consent to publish this content,
                including any photos, videos, or quoted material.
              </p>
            </div>
          </div>

          {/* Cultural Protocols (for sensitive content) */}
          {story.cultural_sensitivity_level !== 'none' && (
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-clay-200">
              <Checkbox
                id="confirm-protocols"
                checked={publishOptions.confirm_cultural_protocols}
                onCheckedChange={(checked) => handleOptionChange('confirm_cultural_protocols', checked as boolean)}
                required
              />
              <div className="flex-1">
                <Label htmlFor="confirm-protocols" className="cursor-pointer font-medium text-clay-900">
                  I respect cultural protocols
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  I confirm that this content respects cultural protocols and has been reviewed according
                  to community guidelines for culturally sensitive material.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Elder Review Notice */}
      {isElderReview && (
        <Alert className="bg-sage-50 border-sage-200">
          <Users className="h-4 w-4 text-sage-600" />
          <AlertDescription className="text-sage-800 text-sm">
            <strong>Elder Review Process:</strong> Your story will be sent to designated Elders for
            review. They will assess cultural appropriateness and provide guidance before publication.
            You will be notified when the review is complete.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={publishStatus === 'publishing' || publishStatus === 'success'}
        >
          Cancel
        </Button>

        <Button
          onClick={handlePublish}
          disabled={!canPublish() || publishStatus === 'publishing' || publishStatus === 'success'}
          size="lg"
          className="min-w-[180px]"
        >
          {publishStatus === 'validating' && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
          {publishStatus === 'publishing' && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
          {publishStatus === 'success' && <CheckCircle2 className="h-5 w-5 mr-2" />}
          {publishStatus === 'idle' && <Send className="h-5 w-5 mr-2" />}

          {publishStatus === 'idle' && (isElderReview ? 'Submit for Review' : 'Publish Story')}
          {publishStatus === 'validating' && 'Validating...'}
          {publishStatus === 'publishing' && 'Publishing...'}
          {publishStatus === 'success' && 'Published!'}
          {publishStatus === 'error' && 'Try Again'}
        </Button>
      </div>

      {/* Privacy Reminder */}
      <Alert className="bg-sky-50 border-sky-200">
        <Eye className="h-4 w-4 text-sky-600" />
        <AlertDescription className="text-sky-800 text-sm">
          <strong>Privacy Reminder:</strong> This story will be visible to{' '}
          {story.visibility === 'public' && 'everyone'}
          {story.visibility === 'community' && 'your community members only'}
          {story.visibility === 'private' && 'only you'}
          {story.visibility === 'restricted' && 'approved viewers only'}
          . You can change this in your story settings at any time.
        </AlertDescription>
      </Alert>
    </div>
  )
}
