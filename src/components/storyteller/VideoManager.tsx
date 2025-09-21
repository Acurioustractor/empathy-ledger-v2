'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Video, Save, Loader2 } from 'lucide-react'

interface VideoManagerProps {
  storytellerId: string
  storytellerName: string
  currentVideoIntroUrl?: string
  currentFeaturedVideoUrl?: string
  onClose: () => void
  onSave: (videos: { videoIntroUrl: string; featuredVideoUrl: string }) => void
}

export function VideoManager({
  storytellerId,
  storytellerName,
  currentVideoIntroUrl = '',
  currentFeaturedVideoUrl = '',
  onClose,
  onSave
}: VideoManagerProps) {
  const [videoIntroUrl, setVideoIntroUrl] = useState(currentVideoIntroUrl)
  const [featuredVideoUrl, setFeaturedVideoUrl] = useState(currentFeaturedVideoUrl)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const response = await fetch(`/api/storytellers/${storytellerId}/videos`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video_introduction_url: videoIntroUrl || null,
          featured_video_url: featuredVideoUrl || null
        })
      })

      const result = await response.json()

      if (response.ok) {
        onSave({
          videoIntroUrl: videoIntroUrl,
          featuredVideoUrl: featuredVideoUrl
        })
        onClose()
      } else {
        alert(`Error: ${result.error || 'Failed to update videos'}`)
      }
    } catch (error) {
      console.error('Error updating videos:', error)
      alert('Failed to update video links')
    } finally {
      setIsSaving(false)
    }
  }

  const isValidUrl = (url: string) => {
    if (!url) return true // Empty URLs are valid (will be cleared)
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const hasChanges =
    videoIntroUrl !== currentVideoIntroUrl ||
    featuredVideoUrl !== currentFeaturedVideoUrl

  const canSave =
    hasChanges &&
    isValidUrl(videoIntroUrl) &&
    isValidUrl(featuredVideoUrl) &&
    !isSaving

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Manage Videos
          </DialogTitle>
          <DialogDescription>
            Add or update video links for {storytellerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transcript/Introduction Video */}
          <div className="space-y-2">
            <label htmlFor="video-intro" className="text-sm font-medium">
              Transcript Video URL
              <span className="text-sm text-muted-foreground ml-1">(Introduction/Interview)</span>
            </label>
            <Input
              id="video-intro"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={videoIntroUrl}
              onChange={(e) => setVideoIntroUrl(e.target.value)}
              className={!isValidUrl(videoIntroUrl) ? 'border-red-500' : ''}
            />
            {!isValidUrl(videoIntroUrl) && (
              <p className="text-sm text-red-600">Please enter a valid URL</p>
            )}
          </div>

          {/* Featured/Story Video */}
          <div className="space-y-2">
            <label htmlFor="video-featured" className="text-sm font-medium">
              Featured Video URL
              <span className="text-sm text-muted-foreground ml-1">(Story/Portfolio)</span>
            </label>
            <Input
              id="video-featured"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={featuredVideoUrl}
              onChange={(e) => setFeaturedVideoUrl(e.target.value)}
              className={!isValidUrl(featuredVideoUrl) ? 'border-red-500' : ''}
            />
            {!isValidUrl(featuredVideoUrl) && (
              <p className="text-sm text-red-600">Please enter a valid URL</p>
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Supported platforms:</strong> YouTube, Vimeo, and other video platforms.
              Leave blank to remove existing video links.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Videos
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}