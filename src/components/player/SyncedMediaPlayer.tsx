'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { PlaybackControls } from './PlaybackControls'
import { TranscriptSync } from './TranscriptSync'
import { AudioWaveform } from './AudioWaveform'
import { VideoPlayer } from './VideoPlayer'
import { DownloadButton } from './DownloadButton'
import { cn } from '@/lib/utils'

interface TranscriptSegment {
  id: string
  start: number
  end: number
  text: string
  speaker?: string
}

interface SyncedMediaPlayerProps {
  mediaUrl: string
  mediaType: 'audio' | 'video'
  transcript?: TranscriptSegment[]
  title: string
  allowDownload?: boolean
  className?: string
}

export function SyncedMediaPlayer({
  mediaUrl,
  mediaType,
  transcript,
  title,
  allowDownload = false,
  className
}: SyncedMediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update current time
  useEffect(() => {
    const media = mediaRef.current
    if (!media) return

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(media.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    media.addEventListener('timeupdate', handleTimeUpdate)
    media.addEventListener('loadedmetadata', handleLoadedMetadata)
    media.addEventListener('ended', handleEnded)

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate)
      media.removeEventListener('loadedmetadata', handleLoadedMetadata)
      media.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!mediaRef.current) return

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault()
          togglePlayPause()
          break
        case 'arrowleft':
          e.preventDefault()
          seek(currentTime - 15)
          break
        case 'arrowright':
          e.preventDefault()
          seek(currentTime + 15)
          break
        case 'arrowup':
          e.preventDefault()
          setVolume(Math.min(1, volume + 0.1))
          break
        case 'arrowdown':
          e.preventDefault()
          setVolume(Math.max(0, volume - 0.1))
          break
        case 'm':
          e.preventDefault()
          setIsMuted(!isMuted)
          break
        case 'f':
          if (mediaType === 'video') {
            e.preventDefault()
            toggleFullscreen()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentTime, volume, isMuted, mediaType])

  const togglePlayPause = () => {
    if (!mediaRef.current) return

    if (isPlaying) {
      mediaRef.current.pause()
    } else {
      mediaRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const seek = (time: number) => {
    if (!mediaRef.current) return
    const clampedTime = Math.max(0, Math.min(time, duration))
    mediaRef.current.currentTime = clampedTime
    setCurrentTime(clampedTime)
  }

  const handleVolumeChange = (newVolume: number) => {
    if (!mediaRef.current) return
    setVolume(newVolume)
    mediaRef.current.volume = newVolume
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
      mediaRef.current.muted = false
    }
  }

  const handlePlaybackRateChange = (rate: number) => {
    if (!mediaRef.current) return
    setPlaybackRate(rate)
    mediaRef.current.playbackRate = rate
  }

  const toggleMute = () => {
    if (!mediaRef.current) return
    const newMuted = !isMuted
    setIsMuted(newMuted)
    mediaRef.current.muted = newMuted
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const handleTranscriptClick = (time: number) => {
    seek(time)
    if (!isPlaying) {
      togglePlayPause()
    }
  }

  return (
    <div ref={containerRef} className={cn("space-y-4", className)}>
      <Card className="overflow-hidden bg-white border-2 border-[#2C2C2C]/10">
        {/* Media Player */}
        {mediaType === 'video' ? (
          <VideoPlayer
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={mediaUrl}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onToggleFullscreen={toggleFullscreen}
          />
        ) : (
          <div className="p-6 bg-gradient-to-br from-[#D97757]/10 via-[#D4A373]/10 to-[#2D5F4F]/10">
            <AudioWaveform
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={mediaUrl}
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
            />
          </div>
        )}

        {/* Playback Controls */}
        <div className="p-4 bg-white border-t border-[#2C2C2C]/10">
          <PlaybackControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            playbackRate={playbackRate}
            isMuted={isMuted}
            onTogglePlayPause={togglePlayPause}
            onSeek={seek}
            onVolumeChange={handleVolumeChange}
            onPlaybackRateChange={handlePlaybackRateChange}
            onToggleMute={toggleMute}
            onToggleFullscreen={mediaType === 'video' ? toggleFullscreen : undefined}
          />

          {/* Download Button */}
          {allowDownload && (
            <div className="mt-4 pt-4 border-t border-[#2C2C2C]/10 flex justify-between items-center">
              <p className="text-sm text-[#2C2C2C]/60">
                Keyboard shortcuts: Space (play/pause), ← → (seek), ↑ ↓ (volume), M (mute)
                {mediaType === 'video' && ', F (fullscreen)'}
              </p>
              <DownloadButton
                mediaUrl={mediaUrl}
                mediaType={mediaType}
                title={title}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Transcript Sync */}
      {transcript && transcript.length > 0 && (
        <TranscriptSync
          segments={transcript}
          currentTime={currentTime}
          onSegmentClick={handleTranscriptClick}
        />
      )}
    </div>
  )
}
