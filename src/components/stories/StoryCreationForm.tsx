'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Image, Video, MapPin, Globe2, Shield, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryCreationFormProps {
  storytellerId: string
  projectId?: string
  organizationId?: string
  onSuccess?: (storyId: string) => void
  onCancel?: () => void
  className?: string
  testMode?: boolean
}

type StoryType = 'text' | 'video' | 'mixed'
type VisibilityLevel = 'public' | 'community' | 'private' | 'restricted'
type CulturalSensitivityLevel = 'none' | 'moderate' | 'high' | 'sacred'
type SubmitStatus = 'idle' | 'saving' | 'success' | 'error'

export function StoryCreationForm({
  storytellerId,
  projectId,
  organizationId,
  onSuccess,
  onCancel,
  className,
  testMode = false
}: StoryCreationFormProps) {
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    storyType: 'text' as StoryType,
    visibility: 'community' as VisibilityLevel,
    culturalSensitivityLevel: 'none' as CulturalSensitivityLevel,
    requiresElderReview: false,
    location: '',
    language: 'en',
    tags: [] as string[],
    videoLink: '',
  })

  const [currentTag, setCurrentTag] = useState('')

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }))
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      setErrorMessage('Title is required')
      return
    }

    if (!formData.content.trim()) {
      setErrorMessage('Story content is required')
      return
    }

    setSubmitStatus('saving')
    setErrorMessage('')

    // Test mode simulation
    if (testMode) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmitStatus('success')
      setTimeout(() => {
        setSubmitStatus('idle')
        onSuccess?.('test-story-id')
      }, 2000)
      return
    }

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          storyteller_id: storytellerId,
          project_id: projectId,
          organization_id: organizationId,
          status: 'draft',
          created_at: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create story')
      }

      const { storyId } = await response.json()

      setSubmitStatus('success')
      setTimeout(() => {
        onSuccess?.(storyId)
      }, 1500)
    } catch (error) {
      console.error('Story creation error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create story')
      setSubmitStatus('error')
    }
  }

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)) // Average 200 words per minute

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-clay-900 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-sky-600" />
          Create New Story
        </h2>
        <p className="text-muted-foreground mt-1">
          Share your story with the community. Your voice matters.
        </p>
      </div>

      {/* Status Messages */}
      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {submitStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Story created successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Story Details</CardTitle>
          <CardDescription>Basic information about your story</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="story-title" className="required">
              Story Title
            </Label>
            <Input
              id="story-title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., My Journey Home"
              required
              maxLength={200}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Story Type */}
          <div className="space-y-2">
            <Label htmlFor="story-type">Story Type</Label>
            <Select
              value={formData.storyType}
              onValueChange={(value: StoryType) => handleInputChange('storyType', value)}
            >
              <SelectTrigger id="story-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Written Story
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video Story
                  </div>
                </SelectItem>
                <SelectItem value="mixed">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Mixed Media (Text + Video/Images)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Video Link (if video or mixed) */}
          {(formData.storyType === 'video' || formData.storyType === 'mixed') && (
            <div className="space-y-2">
              <Label htmlFor="video-link">Video Link (YouTube, Vimeo, etc.)</Label>
              <Input
                id="video-link"
                type="url"
                value={formData.videoLink}
                onChange={(e) => handleInputChange('videoLink', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          )}

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="story-excerpt">
              Short Summary
              <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
            </Label>
            <Textarea
              id="story-excerpt"
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder="A brief summary of your story (1-2 sentences)"
              rows={2}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">
              {formData.excerpt.length}/300 characters
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="story-content" className="required">
              Your Story
            </Label>
            <Textarea
              id="story-content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Tell your story here..."
              rows={12}
              required
              className="font-serif"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{wordCount} words</span>
              <span>~{readingTime} min read</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location & Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-sage-600" />
            Location & Language
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="story-location">
              <MapPin className="h-4 w-4 inline mr-1" />
              Location
              <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
            </Label>
            <Input
              id="story-location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Traditional lands, Community name"
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="story-language">Language</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => handleInputChange('language', value)}
            >
              <SelectTrigger id="story-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="indigenous">Indigenous Language</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="story-tags">
              Tags
              <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="story-tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Add a tag and press Enter"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cultural Sensitivity & Privacy */}
      <Card className="border-2 border-clay-200 bg-clay-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-clay-600" />
            Cultural Safety & Privacy
          </CardTitle>
          <CardDescription>
            Protect culturally sensitive content and control who can see your story
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cultural Sensitivity Level */}
          <div className="space-y-2">
            <Label htmlFor="cultural-sensitivity">Cultural Sensitivity Level</Label>
            <Select
              value={formData.culturalSensitivityLevel}
              onValueChange={(value: CulturalSensitivityLevel) =>
                handleInputChange('culturalSensitivityLevel', value)
              }
            >
              <SelectTrigger id="cultural-sensitivity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None - General audience content</SelectItem>
                <SelectItem value="moderate">Moderate - Some cultural context needed</SelectItem>
                <SelectItem value="high">High - Culturally significant content</SelectItem>
                <SelectItem value="sacred">Sacred - Ceremonial or sacred knowledge</SelectItem>
              </SelectContent>
            </Select>
            {formData.culturalSensitivityLevel === 'sacred' && (
              <Alert className="bg-clay-100 border-clay-300">
                <Shield className="h-4 w-4 text-clay-700" />
                <AlertDescription className="text-clay-800 text-sm">
                  <strong>Sacred content protection:</strong> This story will require Elder review before
                  sharing and will not be processed by AI systems.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label htmlFor="story-visibility">Who Can See This Story?</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value: VisibilityLevel) => handleInputChange('visibility', value)}
            >
              <SelectTrigger id="story-visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can discover and read</SelectItem>
                <SelectItem value="community">
                  Community - Only members of your communities
                </SelectItem>
                <SelectItem value="private">Private - Only you can see</SelectItem>
                <SelectItem value="restricted">
                  Restricted - You approve each person who can access
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Elder Review Toggle */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-clay-200">
            <div className="flex-1">
              <Label htmlFor="elder-review" className="cursor-pointer font-medium">
                Request Elder Review
              </Label>
              <p className="text-sm text-muted-foreground">
                Have community Elders review this story before sharing
              </p>
            </div>
            <Switch
              id="elder-review"
              checked={formData.requiresElderReview || formData.culturalSensitivityLevel === 'sacred'}
              onCheckedChange={(checked) => handleInputChange('requiresElderReview', checked)}
              disabled={formData.culturalSensitivityLevel === 'sacred'}
              className="data-[state=checked]:bg-clay-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitStatus === 'saving'}
        >
          Cancel
        </Button>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={submitStatus === 'saving' || submitStatus === 'success'}
            className="min-w-[120px]"
          >
            {submitStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {submitStatus === 'success' && <CheckCircle2 className="h-4 w-4 mr-2" />}
            {submitStatus === 'idle' && 'Create Story'}
            {submitStatus === 'saving' && 'Creating...'}
            {submitStatus === 'success' && 'Created!'}
            {submitStatus === 'error' && 'Try Again'}
          </Button>
        </div>
      </div>

      {/* Helper Note */}
      <Alert className="bg-sage-50 border-sage-200">
        <AlertDescription className="text-sage-800 text-sm">
          <strong>Note:</strong> This story will be saved as a draft. You can add photos, videos,
          and make changes before publishing.
        </AlertDescription>
      </Alert>
    </form>
  )
}
