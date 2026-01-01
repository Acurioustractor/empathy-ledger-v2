'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface VideoPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
  description?: string
  storytellerName?: string
}

export function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  title,
  description,
  storytellerName
}: VideoPlayerModalProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!videoUrl) return

    // Convert various video URLs to embeddable format
    const getEmbedUrl = (url: string) => {
      // YouTube
      const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`
      }

      // Vimeo
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
      if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
      }

      // For other platforms (like Descript), return the original URL
      return url
    }

    setEmbedUrl(getEmbedUrl(videoUrl))
  }, [videoUrl])

  const handleOpenExternal = () => {
    window.open(videoUrl, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenExternal}
                className="text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open in New Tab
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col">
          {storytellerName && (
            <p className="text-sm text-muted-foreground mb-2">
              By {storytellerName}
            </p>
          )}

          {description && (
            <p className="text-sm text-muted-foreground mb-4">
              {description}
            </p>
          )}

          {/* Video container */}
          <div className="flex-1 bg-black rounded-lg overflow-hidden">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white">
                <p className="mb-4">Unable to embed this video</p>
                <Button onClick={handleOpenExternal} variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View in Original Platform
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}