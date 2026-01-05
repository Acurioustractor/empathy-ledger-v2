'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Image, Video, MapPin, Globe2, Shield, AlertCircle, Loader2, CheckCircle2, Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryEditorProps {
  storyId: string
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
  testMode?: boolean
}

type StoryType = 'text' | 'video' | 'mixed'
type VisibilityLevel = 'public' | 'community' | 'private' | 'restricted'
type CulturalSensitivityLevel = 'none' | 'moderate' | 'high' | 'sacred'
type SaveStatus = 'idle' | 'saving' | 'success' | 'error'
type LoadStatus = 'loading' | 'loaded' | 'error'

interface StoryData {
  title: string
  content: string
  excerpt: string
  storyType: StoryType
  visibility: VisibilityLevel
  culturalSensitivityLevel: CulturalSensitivityLevel
  requiresElderReview: boolean
  location: string
  language: string
  tags: string[]
  videoLink: string
  status: string
  updated_at: string
}

export function StoryEditor({
  storyId,
  onSuccess,
  onCancel,
  className,
  testMode = false
}: StoryEditorProps) {
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [formData, setFormData] = useState<StoryData>({
    title: '',
    content: '',
    excerpt: '',
    storyType: 'text',
    visibility: 'community',
    culturalSensitivityLevel: 'none',
    requiresElderReview: false,
    location: '',
    language: 'en',
    tags: [],
    videoLink: '',
    status: 'draft',
    updated_at: new Date().toISOString(),
  })

  const [currentTag, setCurrentTag] = useState('')

  // Load story data
  useEffect(() => {
    const loadStory = async () => {
      if (testMode) {
        // Mock data for testing
        await new Promise(resolve => setTimeout(resolve, 500))
        setFormData({
          title: 'Sample Story Title',
          content: 'This is sample story content for testing the editor.',
          excerpt: 'A sample story',
          storyType: 'text',
          visibility: 'community',
          culturalSensitivityLevel: 'none',
          requiresElderReview: false,
          location: 'Sample Location',
          language: 'en',
          tags: ['sample', 'test'],
          videoLink: '',
          status: 'draft',
          updated_at: new Date().toISOString(),
        })
        setLoadStatus('loaded')
        return
      }

      try {
        const response = await fetch(`/api/stories/${storyId}`)
        if (!response.ok) {
          throw new Error('Failed to load story')
        }
        const story = await response.json()
        setFormData({
          title: story.title || '',
          content: story.content || '',
          excerpt: story.excerpt || '',
          storyType: story.story_type || 'text',
          visibility: story.visibility || 'community',
          culturalSensitivityLevel: story.cultural_sensitivity_level || 'none',
          requiresElderReview: story.requires_elder_review || false,
          location: story.location || '',
          language: story.language || 'en',
          tags: story.tags || [],
          videoLink: story.video_story_link || '',
          status: story.status || 'draft',
          updated_at: story.updated_at,
        })
        setLoadStatus('loaded')
      } catch (error) {
        console.error('Story load error:', error)
        setErrorMessage('Failed to load story')
        setLoadStatus('error')
      }
    }

    loadStory()
  }, [storyId, testMode])

  const handleInputChange = (field: keyof StoryData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      handleInputChange('tags', [...formData.tags, currentTag.trim()])
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      setErrorMessage('Title is required')
      return
    }

    if (!formData.content.trim()) {
      setErrorMessage('Story content is required')
      return
    }

    setSaveStatus('saving')
    setErrorMessage('')

    // Test mode simulation
    if (testMode) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveStatus('success')
      setHasUnsavedChanges(false)
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
      return
    }

    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          story_type: formData.storyType,
          visibility: formData.visibility,
          cultural_sensitivity_level: formData.culturalSensitivityLevel,
          requires_elder_review: formData.requiresElderReview,
          location: formData.location,
          language: formData.language,
          tags: formData.tags,
          video_story_link: formData.videoLink,
          updated_at: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save story')
      }

      setSaveStatus('success')
      setHasUnsavedChanges(false)
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('Story save error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save story')
      setSaveStatus('error')
    }
  }

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  if (loadStatus === 'loading') {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-clay-600" />
        <span className="ml-3 text-clay-700">Loading story...</span>
      </div>
    )
  }

  if (loadStatus === 'error') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Save Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-clay-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-sky-600" />
            Edit Story
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {new Date(formData.updated_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-sm text-amber-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Unsaved changes
            </span>
          )}
          {saveStatus === 'success' && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Story Details</CardTitle>
          <CardDescription>Edit your story information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="required">
              Story Title
            </Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Story title"
              maxLength={200}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Story Type */}
          <div className="space-y-2">
            <Label htmlFor="edit-story-type">Story Type</Label>
            <Select
              value={formData.storyType}
              onValueChange={(value: StoryType) => handleInputChange('storyType', value)}
            >
              <SelectTrigger id="edit-story-type">
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
                    Mixed Media
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Video Link */}
          {(formData.storyType === 'video' || formData.storyType === 'mixed') && (
            <div className="space-y-2">
              <Label htmlFor="edit-video-link">Video Link</Label>
              <Input
                id="edit-video-link"
                type="url"
                value={formData.videoLink}
                onChange={(e) => handleInputChange('videoLink', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          )}

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="edit-excerpt">Short Summary</Label>
            <Textarea
              id="edit-excerpt"
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              placeholder="Brief summary (1-2 sentences)"
              rows={2}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">
              {formData.excerpt.length}/300 characters
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="edit-content" className="required">
              Your Story
            </Label>
            <Textarea
              id="edit-content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Story content..."
              rows={12}
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
          <div className="space-y-2">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Story location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-language">Language</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => handleInputChange('language', value)}
            >
              <SelectTrigger id="edit-language">
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
            <Label htmlFor="edit-tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="edit-tags"
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
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cultural Safety & Privacy */}
      <Card className="border-2 border-clay-200 bg-clay-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-clay-600" />
            Cultural Safety & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-cultural-sensitivity">Cultural Sensitivity Level</Label>
            <Select
              value={formData.culturalSensitivityLevel}
              onValueChange={(value: CulturalSensitivityLevel) =>
                handleInputChange('culturalSensitivityLevel', value)
              }
            >
              <SelectTrigger id="edit-cultural-sensitivity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None - General audience</SelectItem>
                <SelectItem value="moderate">Moderate - Cultural context needed</SelectItem>
                <SelectItem value="high">High - Culturally significant</SelectItem>
                <SelectItem value="sacred">Sacred - Ceremonial/sacred knowledge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-visibility">Visibility</Label>
            <Select
              value={formData.visibility}
              onValueChange={(value: VisibilityLevel) => handleInputChange('visibility', value)}
            >
              <SelectTrigger id="edit-visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Anyone can see</SelectItem>
                <SelectItem value="community">Community - Members only</SelectItem>
                <SelectItem value="private">Private - Only you</SelectItem>
                <SelectItem value="restricted">Restricted - Approved viewers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-clay-200">
            <div className="flex-1">
              <Label htmlFor="edit-elder-review" className="cursor-pointer font-medium">
                Request Elder Review
              </Label>
              <p className="text-sm text-muted-foreground">
                Have Elders review before sharing
              </p>
            </div>
            <Switch
              id="edit-elder-review"
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          disabled={saveStatus === 'saving' || !hasUnsavedChanges}
          className="min-w-[140px]"
        >
          {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {saveStatus === 'success' && <CheckCircle2 className="h-4 w-4 mr-2" />}
          {saveStatus === 'idle' && <Save className="h-4 w-4 mr-2" />}
          {saveStatus === 'idle' && 'Save Changes'}
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'success' && 'Saved!'}
          {saveStatus === 'error' && 'Try Again'}
        </Button>
      </div>
    </div>
  )
}
