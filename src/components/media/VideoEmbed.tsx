'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  Pause,
  Volume2, 
  VolumeX,
  Maximize,
  ExternalLink,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Video
} from 'lucide-react'

interface VideoEmbedProps {
  videoUrl?: string
  videoPlatform?: string
  videoEmbedCode?: string
  videoThumbnail?: string
  title?: string
  showControls?: boolean
  autoplay?: boolean
  muted?: boolean
  className?: string
  onError?: (error: string) => void
  onLoad?: () => void
}

export function VideoEmbed({
  videoUrl,
  videoPlatform,
  videoEmbedCode,
  videoThumbnail,
  title,
  showControls = true,
  autoplay = false,
  muted = true,
  className = '',
  onError,
  onLoad
}: VideoEmbedProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
  }, [videoUrl, videoEmbedCode])

  const handleIframeLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleIframeError = () => {
    const errorMsg = 'Failed to load video content'
    setError(errorMsg)
    setIsLoading(false)
    onError?.(errorMsg)
  }

  const openExternalVideo = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const retryLoad = () => {
    setError(null)
    setIsLoading(true)
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const renderDescriptEmbed = () => {
    if (!videoEmbedCode) return null

    return (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
            <div className="text-center p-4">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive mb-3">{error}</p>
              <Button onClick={retryLoad} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={videoEmbedCode}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={title || 'Video content'}
          />
        )}
      </div>
    )
  }

  const renderGenericEmbed = () => {
    if (!videoUrl) return null

    const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
    const isVimeo = videoUrl.includes('vimeo.com')
    
    let embedUrl = videoUrl
    
    if (isYouTube) {
      // Convert YouTube URLs to embed format
      const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
      if (videoId) {
        embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}${muted ? '&mute=1' : ''}`
      }
    } else if (isVimeo) {
      // Convert Vimeo URLs to embed format
      const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1]
      if (videoId) {
        embedUrl = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0${autoplay ? '&autoplay=1' : ''}${muted ? '&muted=1' : ''}`
      }
    }

    return (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {videoThumbnail && !isPlaying && (
          <div className="absolute inset-0 cursor-pointer group" onClick={() => setIsPlaying(true)}>
            <img
              src={videoThumbnail}
              alt={title || 'Video thumbnail'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-colours">
              <Button size="lg" className="rounded-full w-16 h-16 p-0">
                <Play className="h-8 w-8 ml-1" />
              </Button>
            </div>
          </div>
        )}
        
        {(isPlaying || !videoThumbnail) && (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
                <div className="text-center p-4">
                  <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
                  <p className="text-sm text-destructive mb-3">{error}</p>
                  <div className="space-x-2">
                    <Button onClick={retryLoad} size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                    <Button onClick={openExternalVideo} size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Original
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={embedUrl}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title={title || 'Video content'}
              />
            )}
          </>
        )}
      </div>
    )
  }

  if (!videoUrl && !videoEmbedCode) {
    // Show a more informative message when we have platform info but no URL
    if (videoPlatform) {
      return (
        <Alert>
          <Video className="h-4 w-4" />
          <AlertDescription>
            {videoPlatform === 'descript' 
              ? 'Descript video available - URL not configured yet' 
              : `${videoPlatform} video available - URL not configured yet`
            }
          </AlertDescription>
        </Alert>
      )
    }
    
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No video content available to display.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="flex items-center gap-2">
              {videoPlatform && (
                <Badge variant="secondary">
                  {videoPlatform}
                </Badge>
              )}
              {videoUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openExternalVideo}
                  className="gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="p-4">
        {videoPlatform === 'descript' ? renderDescriptEmbed() : renderGenericEmbed()}
        
        {showControls && !error && (
          <div className="flex items-center justify-between mt-4 p-2 bg-muted/50 rounded">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="gap-1"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Play
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
                className="gap-1"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-4 w-4" />
                    Unmute
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" />
                    Mute
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {videoPlatform && (
                <span className="capitalize">{videoPlatform}</span>
              )}
              {videoUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openExternalVideo}
                  className="gap-1 text-xs"
                >
                  <Maximize className="h-3 w-3" />
                  Fullscreen
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}