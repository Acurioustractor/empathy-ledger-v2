'use client'

import React, { forwardRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Maximize, Minimize } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  src: string
  isPlaying: boolean
  currentTime: number
  onToggleFullscreen: () => void
  className?: string
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, isPlaying, currentTime, onToggleFullscreen, className }, ref) => {
    const [isHovering, setIsHovering] = useState(false)

    return (
      <div
        className={cn("relative aspect-video bg-black group", className)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Video element */}
        <video
          ref={ref}
          src={src}
          className="w-full h-full object-contain"
          preload="metadata"
          playsInline
        />

        {/* Overlay controls (show on hover) */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 transition-opacity duration-300",
            isHovering || !isPlaying ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Fullscreen button */}
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="bg-black/40 hover:bg-black/60 text-white border-0"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>

          {/* Play indicator (center) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#D97757] flex items-center justify-center shadow-xl">
                <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
              </div>
            </div>
          )}

          {/* Cultural watermark */}
          <div className="absolute bottom-4 left-4 text-white/80 text-xs font-medium">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-[#D97757]" />
              <span>Empathy Ledger Story</span>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {!src && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F8F6F1]">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#D97757]/20 flex items-center justify-center">
                <div className="text-2xl">🎥</div>
              </div>
              <p className="text-sm text-[#2C2C2C]/60">Loading video...</p>
            </div>
          </div>
        )}
      </div>
    )
  }
)

VideoPlayer.displayName = 'VideoPlayer'
