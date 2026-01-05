'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Edit, Save, X, CheckCircle2, AlertCircle, Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaMetadata {
  title: string
  caption: string
  alt_text: string
  cultural_tags: string[]
  culturally_sensitive: boolean
  requires_attribution: boolean
  attribution_text?: string
}

interface MediaMetadataEditorProps {
  mediaId: string
  initialMetadata?: Partial<MediaMetadata>
  mediaUrl?: string
  mediaType?: 'image' | 'video'
  onSave?: (metadata: MediaMetadata) => Promise<void>
  onCancel?: () => void
  className?: string
  testMode?: boolean
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

export function MediaMetadataEditor({
  mediaId,
  initialMetadata = {},
  mediaUrl,
  mediaType = 'image',
  onSave,
  onCancel,
  className,
  testMode = false
}: MediaMetadataEditorProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const [metadata, setMetadata] = useState<MediaMetadata>({
    title: initialMetadata.title || '',
    caption: initialMetadata.caption || '',
    alt_text: initialMetadata.alt_text || '',
    cultural_tags: initialMetadata.cultural_tags || [],
    culturally_sensitive: initialMetadata.culturally_sensitive || false,
    requires_attribution: initialMetadata.requires_attribution || false,
    attribution_text: initialMetadata.attribution_text || ''
  })

  const [currentTag, setCurrentTag] = useState('')

  const handleChange = (field: keyof MediaMetadata, value: string | boolean | string[]) => {
    setMetadata(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !metadata.cultural_tags.includes(currentTag.trim())) {
      handleChange('cultural_tags', [...metadata.cultural_tags, currentTag.trim()])
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange('cultural_tags', metadata.cultural_tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async () => {
    // Validation
    if (!metadata.alt_text.trim()) {
      setErrorMessage('Alt text is required for accessibility')
      return
    }

    setSaveStatus('saving')
    setErrorMessage('')

    // Test mode simulation
    if (testMode) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveStatus('success')
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
      return
    }

    try {
      if (onSave) {
        await onSave(metadata)
      } else {
        // Default API call
        const response = await fetch(`/api/media/${mediaId}/metadata`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metadata)
        })

        if (!response.ok) {
          throw new Error('Failed to save metadata')
        }
      }

      setSaveStatus('success')
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('Metadata save error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save metadata')
      setSaveStatus('error')
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-clay-900 flex items-center gap-2">
          <Edit className="h-5 w-5 text-sky-600" />
          Edit Media Information
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add captions, alt text, and cultural context to your media
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {saveStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Metadata saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Media Preview */}
      {mediaUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden">
              {mediaType === 'image' ? (
                <img
                  src={mediaUrl}
                  alt={metadata.alt_text || 'Media preview'}
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  src={mediaUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Title and description for your media</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="media-title">
              Title
              <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
            </Label>
            <Input
              id="media-title"
              value={metadata.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Elder Grace at community gathering"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {metadata.title.length}/200 characters
            </p>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="media-caption">
              Caption
              <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
            </Label>
            <Textarea
              id="media-caption"
              value={metadata.caption}
              onChange={(e) => handleChange('caption', e.target.value)}
              placeholder="Describe what's happening in this image or video..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {metadata.caption.length}/500 characters
            </p>
          </div>

          {/* Alt Text (Required for accessibility) */}
          <div className="space-y-2">
            <Label htmlFor="media-alt" className="required flex items-center gap-2">
              Alt Text (for screen readers)
              <Badge variant="outline" className="bg-sky-50 text-sky-700">Required</Badge>
            </Label>
            <Textarea
              id="media-alt"
              value={metadata.alt_text}
              onChange={(e) => handleChange('alt_text', e.target.value)}
              placeholder="Describe this image for people who can't see it..."
              rows={2}
              required
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">
              {metadata.alt_text.length}/300 characters • Be descriptive but concise
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cultural Tags */}
      <Card className="border-clay-200 bg-clay-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-clay-600" />
            Cultural Context
          </CardTitle>
          <CardDescription>
            Add cultural tags and sensitivity settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cultural Tags */}
          <div className="space-y-2">
            <Label htmlFor="cultural-tags">
              Cultural Tags
              <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="cultural-tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="e.g., ceremony, traditional dress, sacred site"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {metadata.cultural_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {metadata.cultural_tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 bg-clay-100 text-clay-800">
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
            <p className="text-xs text-muted-foreground">
              Tags help organize and categorize media by cultural significance
            </p>
          </div>

          {/* Culturally Sensitive Toggle */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-clay-200">
            <div className="flex-1">
              <Label htmlFor="culturally-sensitive" className="cursor-pointer font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-clay-600" />
                Mark as Culturally Sensitive
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Content requires cultural context or has special protocols
              </p>
            </div>
            <Switch
              id="culturally-sensitive"
              checked={metadata.culturally_sensitive}
              onCheckedChange={(checked) => handleChange('culturally_sensitive', checked)}
              className="data-[state=checked]:bg-clay-600"
            />
          </div>

          {metadata.culturally_sensitive && (
            <Alert className="bg-amber-50 border-amber-300">
              <AlertCircle className="h-4 w-4 text-amber-700" />
              <AlertDescription className="text-amber-800 text-sm">
                <strong>Culturally Sensitive Content:</strong> This media will display with appropriate
                cultural context warnings and may require additional review before sharing.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Attribution */}
      <Card>
        <CardHeader>
          <CardTitle>Attribution & Credit</CardTitle>
          <CardDescription>
            Give credit to photographers, videographers, or content creators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Requires Attribution Toggle */}
          <div className="flex items-center justify-between p-4 bg-sage-50 rounded-lg border border-sage-200">
            <div className="flex-1">
              <Label htmlFor="requires-attribution" className="cursor-pointer font-medium">
                Credit Required
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Display attribution when this media is shown
              </p>
            </div>
            <Switch
              id="requires-attribution"
              checked={metadata.requires_attribution}
              onCheckedChange={(checked) => handleChange('requires_attribution', checked)}
              className="data-[state=checked]:bg-sage-600"
            />
          </div>

          {/* Attribution Text */}
          {metadata.requires_attribution && (
            <div className="space-y-2">
              <Label htmlFor="attribution-text">
                Attribution Text
              </Label>
              <Input
                id="attribution-text"
                value={metadata.attribution_text}
                onChange={(e) => handleChange('attribution_text', e.target.value)}
                placeholder="Photo by Jane Doe, © 2024"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                This will be displayed when the media is shown
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saveStatus === 'saving'}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          disabled={saveStatus === 'saving' || !metadata.alt_text.trim()}
          className="min-w-[120px]"
        >
          {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {saveStatus === 'success' && <CheckCircle2 className="h-4 w-4 mr-2" />}
          {saveStatus === 'idle' && <Save className="h-4 w-4 mr-2" />}
          {saveStatus === 'idle' && 'Save Metadata'}
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'success' && 'Saved!'}
          {saveStatus === 'error' && 'Try Again'}
        </Button>
      </div>

      {/* Helper Info */}
      <Alert className="bg-sky-50 border-sky-200">
        <AlertDescription className="text-sky-800 text-sm">
          <strong>Accessibility Tip:</strong> Alt text helps people using screen readers understand your images.
          Describe what's in the image as if you're explaining it to someone who can't see it.
        </AlertDescription>
      </Alert>
    </div>
  )
}
