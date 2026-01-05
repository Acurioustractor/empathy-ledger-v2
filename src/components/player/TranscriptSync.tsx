'use client'

import React, { useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TranscriptSegment {
  id: string
  start: number
  end: number
  text: string
  speaker?: string
}

interface TranscriptSyncProps {
  segments: TranscriptSegment[]
  currentTime: number
  onSegmentClick: (time: number) => void
  className?: string
}

export function TranscriptSync({
  segments,
  currentTime,
  onSegmentClick,
  className
}: TranscriptSyncProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeSegmentRef = useRef<HTMLDivElement>(null)

  // Find currently active segment
  const activeSegmentIndex = segments.findIndex(
    (segment) => currentTime >= segment.start && currentTime < segment.end
  )

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentRef.current && containerRef.current) {
      const container = containerRef.current
      const activeElement = activeSegmentRef.current

      const containerTop = container.scrollTop
      const containerBottom = containerTop + container.clientHeight
      const elementTop = activeElement.offsetTop
      const elementBottom = elementTop + activeElement.clientHeight

      // Scroll if element is not fully visible
      if (elementTop < containerTop || elementBottom > containerBottom) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    }
  }, [activeSegmentIndex])

  if (!segments || segments.length === 0) {
    return null
  }

  // Group segments by speaker for better readability
  const groupedSegments: Array<{ speaker?: string; segments: TranscriptSegment[] }> = []
  let currentGroup: { speaker?: string; segments: TranscriptSegment[] } | null = null

  segments.forEach((segment) => {
    if (!currentGroup || currentGroup.speaker !== segment.speaker) {
      currentGroup = { speaker: segment.speaker, segments: [segment] }
      groupedSegments.push(currentGroup)
    } else {
      currentGroup.segments.push(segment)
    }
  })

  return (
    <Card className={cn("overflow-hidden border-2 border-[#2C2C2C]/10", className)}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#2D5F4F] to-[#2D5F4F]/90 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold">Transcript</h3>
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            {segments.length} segments
          </Badge>
        </div>
        <p className="text-sm text-white/80 mt-1">
          Click any segment to jump to that point in the story
        </p>
      </div>

      {/* Transcript content */}
      <div
        ref={containerRef}
        className="max-h-[500px] overflow-y-auto p-6 space-y-6 bg-white"
      >
        {groupedSegments.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-2">
            {/* Speaker label */}
            {group.speaker && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#D4A373]/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#D97757]">
                    {group.speaker.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-[#2C2C2C]">{group.speaker}</span>
              </div>
            )}

            {/* Segments */}
            <div className="space-y-1 pl-10">
              {group.segments.map((segment, segmentIndex) => {
                const isActive = segments.indexOf(segment) === activeSegmentIndex
                const isPast = currentTime > segment.end

                return (
                  <div
                    key={segment.id}
                    ref={isActive ? activeSegmentRef : null}
                    onClick={() => onSegmentClick(segment.start)}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all duration-200",
                      "hover:bg-[#D97757]/5 hover:border-l-4 hover:border-[#D97757] hover:pl-5",
                      isActive && "bg-[#D97757]/10 border-l-4 border-[#D97757] pl-5 shadow-sm",
                      isPast && !isActive && "text-[#2C2C2C]/50"
                    )}
                  >
                    {/* Timestamp */}
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "text-xs font-mono flex-shrink-0 mt-0.5",
                          isActive ? "text-[#D97757] font-bold" : "text-[#2C2C2C]/40"
                        )}
                      >
                        {formatTime(segment.start)}
                      </span>

                      {/* Text */}
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          isActive && "text-[#2C2C2C] font-medium"
                        )}
                      >
                        {segment.text}
                      </p>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-[#D97757]">
                        <div className="w-2 h-2 rounded-full bg-[#D97757] animate-pulse" />
                        <span className="font-medium">Currently playing</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* End indicator */}
        {currentTime >= segments[segments.length - 1].end && (
          <div className="text-center py-8 text-sm text-[#2C2C2C]/60">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#2D5F4F]/10 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <p className="font-medium">End of transcript</p>
          </div>
        )}
      </div>

      {/* Footer with keyboard hints */}
      <div className="p-3 bg-[#F8F6F1] border-t border-[#2C2C2C]/10">
        <div className="flex items-center gap-4 text-xs text-[#2C2C2C]/60">
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-white rounded border border-[#2C2C2C]/20">Space</kbd>
            Play/Pause
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-white rounded border border-[#2C2C2C]/20">← →</kbd>
            Seek 15s
          </span>
        </div>
      </div>
    </Card>
  )
}

// Helper function to format time (MM:SS)
function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
