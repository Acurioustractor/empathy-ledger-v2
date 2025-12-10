'use client'

import { useEffect, useRef } from 'react'
import { getTrackingPixelUrl, getPlatformName } from '@/lib/empathy-ledger'

interface TrackingPixelProps {
  storyId: string
  trackReadTime?: boolean
}

/**
 * Invisible tracking component that reports engagement back to Empathy Ledger.
 * Ensures storytellers see the impact of their stories on act.place.
 */
export function TrackingPixel({ storyId, trackReadTime = false }: TrackingPixelProps) {
  const hasTracked = useRef(false)
  const startTime = useRef(Date.now())

  useEffect(() => {
    // Only track once per mount
    if (hasTracked.current) return
    hasTracked.current = true

    // Fire tracking pixel on view
    const img = new Image()
    img.src = getTrackingPixelUrl(storyId)

    // If tracking read time, send beacon on unmount
    if (trackReadTime) {
      return () => {
        const readTime = Math.round((Date.now() - startTime.current) / 1000)

        // Send engagement data
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            `${process.env.NEXT_PUBLIC_EMPATHY_LEDGER_API_URL || 'https://empathyledger.com'}/api/beacon`,
            JSON.stringify({
              storyId,
              eventType: readTime > 30 ? 'read' : 'view',
              platform: getPlatformName(),
              readTimeSeconds: readTime
            })
          )
        }
      }
    }
  }, [storyId, trackReadTime])

  // Render nothing visible
  return null
}

/**
 * Enhanced tracking for story detail pages
 */
export function DetailPageTracking({ storyId }: { storyId: string }) {
  const maxScroll = useRef(0)
  const startTime = useRef(Date.now())

  useEffect(() => {
    // Track scroll depth
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.round((scrollTop / docHeight) * 100)
      if (scrollPercent > maxScroll.current) {
        maxScroll.current = scrollPercent
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Send data on page leave
    const sendEngagement = () => {
      const readTime = Math.round((Date.now() - startTime.current) / 1000)

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_EMPATHY_LEDGER_API_URL || 'https://empathyledger.com'}/api/beacon`,
          JSON.stringify({
            storyId,
            eventType: readTime > 30 || maxScroll.current > 50 ? 'read' : 'view',
            platform: getPlatformName(),
            readTimeSeconds: readTime,
            scrollDepth: maxScroll.current
          })
        )
      }
    }

    window.addEventListener('beforeunload', sendEngagement)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', sendEngagement)
      sendEngagement() // Also send on route change
    }
  }, [storyId])

  return null
}

export default TrackingPixel
