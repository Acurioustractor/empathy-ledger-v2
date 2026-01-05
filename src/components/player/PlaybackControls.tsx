'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlaybackControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playbackRate: number
  isMuted: boolean
  onTogglePlayPause: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onPlaybackRateChange: (rate: number) => void
  onToggleMute: () => void
  onToggleFullscreen?: () => void
  className?: string
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

export function PlaybackControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackRate,
  isMuted,
  onTogglePlayPause,
  onSeek,
  onVolumeChange,
  onPlaybackRateChange,
  onToggleMute,
  onToggleFullscreen,
  className
}: PlaybackControlsProps) {
  const handleSeekChange = (values: number[]) => {
    onSeek(values[0])
  }

  const handleVolumeChange = (values: number[]) => {
    onVolumeChange(values[0])
  }

  const skipBackward = () => {
    onSeek(Math.max(0, currentTime - 15))
  }

  const skipForward = () => {
    onSeek(Math.min(duration, currentTime + 15))
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Progress bar */}
      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeekChange}
          className="cursor-pointer"
        />
        <div className="flex justify-between items-center text-xs text-[#2C2C2C]/60">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Playback controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={skipBackward}
            className="hover:bg-[#D97757]/10"
            title="Skip backward 15s (←)"
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            variant="default"
            size="icon"
            onClick={onTogglePlayPause}
            className="bg-[#D97757] hover:bg-[#D97757]/90 w-12 h-12"
            title="Play/Pause (Space)"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={skipForward}
            className="hover:bg-[#D97757]/10"
            title="Skip forward 15s (→)"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Center: Time display */}
        <div className="hidden md:flex items-center gap-2 text-sm text-[#2C2C2C]/70">
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors",
            isPlaying ? "bg-[#D97757] animate-pulse" : "bg-[#2C2C2C]/20"
          )} />
          <span className="font-medium">
            {isPlaying ? 'Playing' : 'Paused'}
          </span>
        </div>

        {/* Right: Volume, speed, fullscreen */}
        <div className="flex items-center gap-2">
          {/* Volume */}
          <div className="hidden md:flex items-center gap-2 min-w-[120px]">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMute}
              className="hover:bg-[#D97757]/10 flex-shrink-0"
              title="Mute/Unmute (M)"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>

          {/* Playback speed */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-[#D97757]/10 hidden sm:flex"
                title="Playback speed"
              >
                <Settings className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">{playbackRate}x</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {PLAYBACK_RATES.map((rate) => (
                <DropdownMenuItem
                  key={rate}
                  onClick={() => onPlaybackRateChange(rate)}
                  className={cn(
                    playbackRate === rate && "bg-[#D97757]/10 text-[#D97757]"
                  )}
                >
                  {rate === 1 ? 'Normal' : `${rate}x`}
                  {playbackRate === rate && ' ✓'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fullscreen (video only) */}
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="hover:bg-[#D97757]/10"
              title="Fullscreen (F)"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to format time (MM:SS)
function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
