'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Image as ImageIcon,
  Camera,
  RefreshCw,
  Check,
  Loader2,
  AlertTriangle,
  Play,
  Pause,
  SkipBack,
  SkipForward
} from 'lucide-react'
import {
  extractVideoThumbnail,
  isDirectVideoUrl,
  getVideoDuration,
  ThumbnailResult
} from '@/lib/media/video-thumbnail'

interface VideoThumbnailSelectorProps {
  videoUrl: string
  currentThumbnail?: string
  onThumbnailSelected: (result: ThumbnailResult) => void
  onCancel?: () => void
}

export function VideoThumbnailSelector({
  videoUrl,
  currentThumbnail,
  onThumbnailSelected,
  onCancel
}: VideoThumbnailSelectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestedThumbnails, setSuggestedThumbnails] = useState<{ time: number; dataUrl: string }[]>([])

  // Check if this is a direct video file we can process
  const canExtractThumbnail = isDirectVideoUrl(videoUrl)

  // Load video duration and generate suggested thumbnails
  useEffect(() => {
    if (!canExtractThumbnail) return

    async function loadVideoInfo() {
      setIsLoading(true)
      setError(null)

      try {
        const dur = await getVideoDuration(videoUrl)
        setDuration(dur)

        // Generate suggested thumbnails at different points
        const suggestions: { time: number; dataUrl: string }[] = []
        const times = [
          1,
          dur * 0.25,
          dur * 0.5,
          dur * 0.75
        ].filter(t => t < dur - 0.1)

        for (const time of times) {
          try {
            const result = await extractVideoThumbnail(videoUrl, {
              timeInSeconds: time,
              maxWidth: 160,
              maxHeight: 90,
              quality: 0.7
            })
            suggestions.push({ time, dataUrl: result.dataUrl })
          } catch {
            // Skip failed extractions
          }
        }

        setSuggestedThumbnails(suggestions)
      } catch (err) {
        setError('Failed to load video. Make sure CORS is enabled for the video source.')
      } finally {
        setIsLoading(false)
      }
    }

    loadVideoInfo()
  }, [videoUrl, canExtractThumbnail])

  // Update preview when time changes
  const updatePreview = async (time: number) => {
    if (!canExtractThumbnail) return

    setIsExtracting(true)
    try {
      const result = await extractVideoThumbnail(videoUrl, {
        timeInSeconds: time,
        maxWidth: 320,
        maxHeight: 180
      })
      setPreviewThumbnail(result.dataUrl)
    } catch {
      // Keep previous preview
    } finally {
      setIsExtracting(false)
    }
  }

  // Handle slider change
  const handleTimeChange = (value: number[]) => {
    const time = value[0]
    setCurrentTime(time)

    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  // Handle slider release to update preview
  const handleTimeCommit = (value: number[]) => {
    updatePreview(value[0])
  }

  // Handle video scrubbing
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && !isPlaying) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Skip forward/back
  const skip = (seconds: number) => {
    if (!videoRef.current) return
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  // Select current frame as thumbnail
  const handleSelectThumbnail = async () => {
    setIsExtracting(true)
    setError(null)

    try {
      const result = await extractVideoThumbnail(videoUrl, {
        timeInSeconds: currentTime,
        maxWidth: 1280,
        maxHeight: 720,
        quality: 0.9
      })
      onThumbnailSelected(result)
    } catch (err) {
      setError('Failed to extract thumbnail. Please try a different time.')
    } finally {
      setIsExtracting(false)
    }
  }

  // Select a suggested thumbnail
  const handleSelectSuggested = async (time: number) => {
    setCurrentTime(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }

    setIsExtracting(true)
    try {
      const result = await extractVideoThumbnail(videoUrl, {
        timeInSeconds: time,
        maxWidth: 1280,
        maxHeight: 720,
        quality: 0.9
      })
      onThumbnailSelected(result)
    } catch (err) {
      setError('Failed to extract thumbnail.')
    } finally {
      setIsExtracting(false)
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!canExtractThumbnail) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Thumbnail extraction is only available for direct video files (MP4, WebM).
          External videos use their platform's thumbnail.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Select Thumbnail
        </CardTitle>
        <CardDescription>
          Choose a frame from your video to use as the thumbnail
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading video...</span>
          </div>
        ) : (
          <>
            {/* Video Preview */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full"
                onTimeUpdate={handleVideoTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                muted
              />

              {/* Playback controls overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center gap-2 mb-2">
                  <Button size="sm" variant="ghost" className="text-white" onClick={() => skip(-5)}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white" onClick={togglePlay}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white" onClick={() => skip(5)}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <span className="text-white text-sm ml-2">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleTimeChange}
                  onValueCommit={handleTimeCommit}
                  className="w-full"
                />
              </div>
            </div>

            {/* Current Frame Preview */}
            {previewThumbnail && (
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <p className="text-sm font-medium mb-2">Preview at {formatTime(currentTime)}</p>
                  <div className="w-40 aspect-video bg-slate-100 rounded overflow-hidden">
                    <img
                      src={previewThumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {currentThumbnail && (
                  <div className="flex-shrink-0">
                    <p className="text-sm font-medium mb-2">Current Thumbnail</p>
                    <div className="w-40 aspect-video bg-slate-100 rounded overflow-hidden">
                      <img
                        src={currentThumbnail}
                        alt="Current thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Suggested Thumbnails */}
            {suggestedThumbnails.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Suggested Thumbnails</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {suggestedThumbnails.map((thumb, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSuggested(thumb.time)}
                      className="flex-shrink-0 relative group"
                    >
                      <div className="w-32 aspect-video bg-slate-100 rounded overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors">
                        <img
                          src={thumb.dataUrl}
                          alt={`Thumbnail at ${formatTime(thumb.time)}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Badge
                        variant="secondary"
                        className="absolute bottom-1 right-1 text-xs bg-black/70 text-white"
                      >
                        {formatTime(thumb.time)}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleSelectThumbnail}
                disabled={isExtracting}
                className="flex-1"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Use Current Frame
                  </>
                )}
              </Button>

              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
