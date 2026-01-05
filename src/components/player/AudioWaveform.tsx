'use client'

import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface AudioWaveformProps {
  src: string
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  className?: string
}

export const AudioWaveform = forwardRef<HTMLAudioElement, AudioWaveformProps>(
  ({ src, currentTime, duration, onSeek, className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [waveformData, setWaveformData] = useState<number[]>([])

    // Generate waveform visualization data
    useEffect(() => {
      // Create a simple waveform pattern (in production, use Web Audio API to analyze actual audio)
      const bars = 100
      const data = Array.from({ length: bars }, (_, i) => {
        // Create a natural-looking waveform with varying heights
        const base = Math.sin(i / 10) * 0.3 + 0.5
        const variation = Math.random() * 0.3
        return Math.max(0.1, Math.min(1, base + variation))
      })
      setWaveformData(data)
    }, [src])

    // Draw waveform on canvas
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas || waveformData.length === 0) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const width = canvas.width
      const height = canvas.height
      const barWidth = width / waveformData.length
      const progress = duration > 0 ? currentTime / duration : 0

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw waveform bars
      waveformData.forEach((amplitude, index) => {
        const x = index * barWidth
        const barHeight = amplitude * height * 0.8
        const y = (height - barHeight) / 2

        // Color based on progress (played vs unplayed)
        const isPlayed = index / waveformData.length < progress
        ctx.fillStyle = isPlayed ? '#D97757' : '#D4A373' // Terracotta vs Ochre
        ctx.fillRect(x, y, barWidth - 1, barHeight)
      })

      // Draw progress indicator
      const progressX = width * progress
      ctx.strokeStyle = '#2D5F4F' // Forest Green
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(progressX, 0)
      ctx.lineTo(progressX, height)
      ctx.stroke()
    }, [waveformData, currentTime, duration])

    // Handle canvas click for seeking
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas || duration === 0) return

      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const progress = clickX / rect.width
      const seekTime = progress * duration
      onSeek(seekTime)
    }

    // Resize canvas to container width
    useEffect(() => {
      const resizeCanvas = () => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const rect = container.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = 120 // Fixed height for waveform
      }

      resizeCanvas()
      window.addEventListener('resize', resizeCanvas)
      return () => window.removeEventListener('resize', resizeCanvas)
    }, [])

    return (
      <div className={cn("space-y-4", className)}>
        {/* Hidden audio element */}
        <audio
          ref={ref}
          src={src}
          preload="metadata"
          className="hidden"
        />

        {/* Waveform visualization */}
        <div ref={containerRef} className="relative w-full">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full cursor-pointer rounded-lg bg-[#F8F6F1]"
            style={{ height: '120px' }}
          />

          {/* Time labels */}
          <div className="flex justify-between items-center mt-2 text-xs text-[#2C2C2C]/60">
            <span>{formatTime(currentTime)}</span>
            <span className="text-[#D97757] font-medium">Click waveform to seek</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Audio info */}
        <div className="flex items-center gap-2 text-sm text-[#2C2C2C]/70">
          <div className="w-2 h-2 rounded-full bg-[#D97757] animate-pulse" />
          <span>Audio Story</span>
        </div>
      </div>
    )
  }
)

AudioWaveform.displayName = 'AudioWaveform'

// Helper function to format time (MM:SS)
function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
