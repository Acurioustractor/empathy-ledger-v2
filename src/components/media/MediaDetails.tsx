'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Image as ImageIcon, Video, Music, FileText, X, Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaAsset {
  id: string
  url: string
  type: 'image' | 'audio' | 'video' | 'document'
  title?: string
  caption?: string
  alt_text?: string
  cultural_tags?: string[]
  cultural_sensitivity?: 'public' | 'sensitive' | 'sacred'
  file_size: number
  duration?: number
  width?: number
  height?: number
  created_at: string
}

interface MediaDetailsProps {
  media: MediaAsset
  isOpen: boolean
  onClose: () => void
  onSave: (updated: MediaAsset) => void
}

const CULTURAL_THEMES = [
  'Land & Territory', 'Elders & Wisdom', 'Language & Culture',
  'Healing & Wellness', 'Youth & Education', 'Traditional Knowledge',
  'Art & Storytelling', 'Community & Family', 'Ceremonies & Protocols',
  'Water & Resources', 'Food Sovereignty', 'Justice & Rights'
]

export function MediaDetails({ media, isOpen, onClose, onSave }: MediaDetailsProps) {
  const [formData, setFormData] = useState({
    title: media.title || '',
    caption: media.caption || '',
    alt_text: media.alt_text || '',
    cultural_tags: media.cultural_tags || [],
    cultural_sensitivity: media.cultural_sensitivity || 'public'
  })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAddTag = () => {
    if (tagInput && !formData.cultural_tags.includes(tagInput)) {
      setFormData(prev => ({
        ...prev,
        cultural_tags: [...prev.cultural_tags, tagInput]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      cultural_tags: prev.cultural_tags.filter(t => t !== tag)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/media/${media.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to update media')

      const data = await response.json()
      onSave(data.media)
      onClose()
    } catch (error) {
      console.error('Error updating media:', error)
      alert('Failed to update media. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getMediaIcon = () => {
    switch (media.type) {
      case 'image': return <ImageIcon className="w-8 h-8 text-[#D97757]" />
      case 'video': return <Video className="w-8 h-8 text-[#D97757]" />
      case 'audio': return <Music className="w-8 h-8 text-[#D97757]" />
      case 'document': return <FileText className="w-8 h-8 text-[#D97757]" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif text-2xl">Media Details</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Preview */}
          <div className="bg-[#F8F6F1] rounded-lg p-6 flex items-center justify-center min-h-[300px]">
            {media.type === 'image' ? (
              <img
                src={media.url}
                alt={media.alt_text || 'Media preview'}
                className="max-w-full max-h-[400px] object-contain rounded"
              />
            ) : media.type === 'video' ? (
              <video
                src={media.url}
                controls
                className="max-w-full max-h-[400px] rounded"
              />
            ) : media.type === 'audio' ? (
              <div className="text-center">
                {getMediaIcon()}
                <audio src={media.url} controls className="mt-4" />
              </div>
            ) : (
              <div className="text-center">
                {getMediaIcon()}
                <p className="mt-2 text-sm text-[#2C2C2C]/60">Document preview not available</p>
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-[#F8F6F1] rounded-lg">
            <div>
              <p className="text-xs text-[#2C2C2C]/60 mb-1">File Size</p>
              <p className="text-sm font-medium">{formatFileSize(media.file_size)}</p>
            </div>
            <div>
              <p className="text-xs text-[#2C2C2C]/60 mb-1">Type</p>
              <p className="text-sm font-medium capitalize">{media.type}</p>
            </div>
            {media.width && media.height && (
              <div>
                <p className="text-xs text-[#2C2C2C]/60 mb-1">Dimensions</p>
                <p className="text-sm font-medium">{media.width} × {media.height}</p>
              </div>
            )}
            {media.duration && (
              <div>
                <p className="text-xs text-[#2C2C2C]/60 mb-1">Duration</p>
                <p className="text-sm font-medium">{formatDuration(media.duration)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-[#2C2C2C]/60 mb-1">Uploaded</p>
              <p className="text-sm font-medium">{new Date(media.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive title"
              />
            </div>

            {/* Caption */}
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={formData.caption}
                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="Add a caption for this media"
                rows={3}
              />
            </div>

            {/* Alt Text */}
            {media.type === 'image' && (
              <div>
                <Label htmlFor="alt-text">Alt Text (for accessibility)</Label>
                <Input
                  id="alt-text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                  placeholder="Describe the image for screen readers"
                />
              </div>
            )}

            {/* Cultural Sensitivity */}
            <div>
              <Label>Cultural Sensitivity Level</Label>
              <Select
                value={formData.cultural_sensitivity}
                onValueChange={(value) => setFormData(prev => ({ ...prev, cultural_sensitivity: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Open to all</SelectItem>
                  <SelectItem value="sensitive">Sensitive - Requires cultural awareness</SelectItem>
                  <SelectItem value="sacred">Sacred - Elder approval required</SelectItem>
                </SelectContent>
              </Select>
              {formData.cultural_sensitivity === 'sacred' && (
                <p className="text-xs text-amber-600 mt-1">
                  Sacred content requires Elder review before use
                </p>
              )}
            </div>

            {/* Cultural Tags */}
            <div>
              <Label>Cultural Themes</Label>
              <div className="flex gap-2 mb-2">
                <Select value={tagInput} onValueChange={setTagInput}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {CULTURAL_THEMES.map(theme => (
                      <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddTag} disabled={!tagInput}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.cultural_tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#D97757] hover:bg-[#D97757]/90"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
