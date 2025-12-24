'use client'

import { useState, useMemo, useCallback } from 'react'
import { Calendar, Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TimelineData {
  storiesByMonth: Array<{ month: string; stories: number; storytellers: number }>
  firstStoryDate: string
  latestStoryDate: string
}

interface TimelineScrubberProps {
  data: TimelineData | null
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void
  className?: string
}

export function TimelineScrubber({ data, onDateRangeChange, className }: TimelineScrubberProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)

  const months = useMemo(() => {
    if (!data?.storiesByMonth) return []
    return data.storiesByMonth
  }, [data])

  const maxStories = useMemo(() => {
    if (months.length === 0) return 1
    return Math.max(...months.map(m => m.stories), 1)
  }, [months])

  const handleSliderChange = useCallback((values: number[]) => {
    const idx = values[0]
    setCurrentIndex(idx)

    if (idx === null || idx >= months.length) {
      onDateRangeChange(null, null)
      return
    }

    const month = months[idx]
    if (month) {
      const startDate = new Date(month.month + '-01')
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(0) // Last day of the month
      onDateRangeChange(startDate, endDate)
    }
  }, [months, onDateRangeChange])

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      return
    }

    setIsPlaying(true)
    let idx = currentIndex === null ? 0 : currentIndex

    const interval = setInterval(() => {
      idx++
      if (idx >= months.length) {
        setIsPlaying(false)
        clearInterval(interval)
        return
      }
      setCurrentIndex(idx)
      handleSliderChange([idx])
    }, 1500)

    // Cleanup on unmount
    return () => clearInterval(interval)
  }, [isPlaying, currentIndex, months.length, handleSliderChange])

  const handleSkipBack = useCallback(() => {
    const newIdx = Math.max(0, (currentIndex || 0) - 1)
    setCurrentIndex(newIdx)
    handleSliderChange([newIdx])
  }, [currentIndex, handleSliderChange])

  const handleSkipForward = useCallback(() => {
    const newIdx = Math.min(months.length - 1, (currentIndex || 0) + 1)
    setCurrentIndex(newIdx)
    handleSliderChange([newIdx])
  }, [currentIndex, months.length, handleSliderChange])

  const handleReset = useCallback(() => {
    setCurrentIndex(null)
    setIsPlaying(false)
    onDateRangeChange(null, null)
  }, [onDateRangeChange])

  if (!data || months.length === 0) {
    return null
  }

  const currentMonth = currentIndex !== null ? months[currentIndex] : null

  return (
    <Card className={cn("bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-clay-500" />
          <span className="font-medium">Timeline Scrubber</span>
          {currentMonth && (
            <Badge variant="secondary" className="ml-auto">
              {formatMonth(currentMonth.month)}
            </Badge>
          )}
        </div>

        {/* Timeline visualization */}
        <div className="relative h-16 mb-4">
          <div className="absolute inset-0 flex items-end gap-px">
            {months.map((month, idx) => {
              const height = (month.stories / maxStories) * 100
              const isActive = currentIndex !== null && idx <= currentIndex
              const isCurrent = idx === currentIndex

              return (
                <div
                  key={month.month}
                  className="flex-1 relative cursor-pointer group"
                  onClick={() => handleSliderChange([idx])}
                >
                  <div
                    className={cn(
                      "absolute bottom-0 w-full rounded-t transition-all duration-300",
                      isActive ? "bg-clay-500" : "bg-stone-200 dark:bg-stone-700",
                      isCurrent && "ring-2 ring-clay-300 dark:ring-clay-700",
                      "group-hover:opacity-80"
                    )}
                    style={{ height: `${Math.max(height, 8)}%` }}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-stone-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {formatMonth(month.month)}: {month.stories} stories
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleSkipBack}
              disabled={currentIndex === null || currentIndex === 0}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleSkipForward}
              disabled={currentIndex === null || currentIndex >= months.length - 1}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1">
            <Slider
              value={currentIndex !== null ? [currentIndex] : [0]}
              min={0}
              max={months.length - 1}
              step={1}
              onValueChange={handleSliderChange}
              className="w-full"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs"
          >
            <Clock className="w-3 h-3 mr-1" />
            All Time
          </Button>
        </div>

        {/* Current stats */}
        {currentMonth && (
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-clay-600">{currentMonth.stories}</div>
              <div className="text-xs text-muted-foreground">Stories</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{currentMonth.storytellers}</div>
              <div className="text-xs text-muted-foreground">Storytellers</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatMonth(monthStr: string): string {
  const date = new Date(monthStr + '-01')
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
