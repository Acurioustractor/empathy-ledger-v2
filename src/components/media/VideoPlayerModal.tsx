'use client'

import { useState, useEffect, useRef } from 'react'
import { ExternalLink, Download } from 'lucide-react'
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

// Check if URL is a direct video file (not an embed)
function isDirectVideoFile(url: string): boolean {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.ogg', '.m4v']
  const lowerUrl = url.toLowerCase()
  return videoExtensions.some(ext => lowerUrl.includes(ext)) ||
    url.includes('supabase.co/storage') ||
    url.includes('/storage/v1/object')
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
  const [isDirectVideo, setIsDirectVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoUrl) return

    // Check if this is a direct video file
    if (isDirectVideoFile(videoUrl)) {
      setIsDirectVideo(true)
      setEmbedUrl(null)
      return
    }

    setIsDirectVideo(false)

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

  // Auto-play when modal opens with direct video
  useEffect(() => {
    if (isOpen && isDirectVideo && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked, that's fine
      })
    }
  }, [isOpen, isDirectVideo])

  const handleOpenExternal = () => {
    window.open(videoUrl, '_blank')
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = videoUrl
    link.download = title || 'video'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex items-center gap-2">
              {isDirectVideo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              )}
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
            {isDirectVideo ? (
              // Native HTML5 video player for direct files (MP4, WebM, etc.)
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full"
                controls
                autoPlay
                playsInline
                title={title}
              >
                Your browser does not support the video tag.
              </video>
            ) : embedUrl ? (
              // Iframe embed for YouTube, Vimeo, Descript, etc.
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
