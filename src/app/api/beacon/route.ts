export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

/**
 * Engagement Tracking Beacon
 *
 * Tracks story views, reads, shares, and actions across all platforms.
 * Returns a 1x1 transparent GIF for pixel tracking or JSON for JS beacons.
 *
 * GET  /api/beacon?story=xxx&event=view&platform=justicehub
 * POST /api/beacon (JSON body with rich engagement data)
 */

// 1x1 transparent GIF
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

interface BeaconData {
  storyId: string
  eventType: 'view' | 'read' | 'share' | 'click' | 'action'
  platform?: string
  readTimeSeconds?: number
  scrollDepth?: number
  sessionId?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

/**
 * GET /api/beacon
 *
 * Simple pixel tracking for basic view counts.
 * Used in img tags and oEmbed embeds.
 *
 * Query params:
 *   - story: Story ID (required)
 *   - event: Event type (default: view)
 *   - platform: Platform name (default: unknown)
 *   - session: Session ID for deduplication
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const storyId = searchParams.get('story')
    const eventType = (searchParams.get('event') || 'view') as BeaconData['eventType']
    const platform = searchParams.get('platform') || 'unknown'
    const sessionId = searchParams.get('session')

    if (storyId) {
      // Extract additional data from headers
      const referrer = request.headers.get('referer') || undefined
      const userAgent = request.headers.get('user-agent') || ''

      // Detect device type
      const deviceType = detectDeviceType(userAgent)

      // Get geographic data from Vercel headers (if available)
      const country = request.headers.get('x-vercel-ip-country') || undefined
      const region = request.headers.get('x-vercel-ip-country-region') || undefined
      const city = request.headers.get('x-vercel-ip-city') || undefined

      // Record the event
      await recordEngagement({
        storyId,
        eventType,
        platform,
        sessionId: sessionId || undefined,
        referrer,
        deviceType,
        country,
        region,
        city,
        browser: detectBrowser(userAgent)
      })
    }

    // Return tracking pixel
    return new NextResponse(TRACKING_PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Beacon GET error:', error)
    // Still return pixel even on error
    return new NextResponse(TRACKING_PIXEL, {
      headers: { 'Content-Type': 'image/gif' }
    })
  }
}

/**
 * POST /api/beacon
 *
 * Rich engagement tracking from JavaScript.
 * Captures read time, scroll depth, and more.
 *
 * Body:
 * {
 *   "storyId": "abc123",
 *   "eventType": "read",
 *   "platform": "justicehub",
 *   "readTimeSeconds": 45,
 *   "scrollDepth": 80,
 *   "sessionId": "xyz789"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      storyId,
      eventType = 'view',
      platform = 'unknown',
      readTimeSeconds,
      scrollDepth,
      sessionId,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign
    } = body

    if (!storyId) {
      return NextResponse.json({ error: 'Missing storyId' }, { status: 400 })
    }

    // Extract additional data from headers
    const userAgent = request.headers.get('user-agent') || ''
    const headerReferrer = request.headers.get('referer') || undefined

    // Get geographic data
    const country = request.headers.get('x-vercel-ip-country') || undefined
    const region = request.headers.get('x-vercel-ip-country-region') || undefined
    const city = request.headers.get('x-vercel-ip-city') || undefined

    await recordEngagement({
      storyId,
      eventType,
      platform,
      readTimeSeconds,
      scrollDepth,
      sessionId,
      referrer: referrer || headerReferrer,
      utmSource,
      utmMedium,
      utmCampaign,
      deviceType: detectDeviceType(userAgent),
      country,
      region,
      city,
      browser: detectBrowser(userAgent)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Beacon POST error:', error)
    return NextResponse.json({ error: 'Failed to record' }, { status: 500 })
  }
}

/**
 * Record engagement event to database
 */
async function recordEngagement(data: {
  storyId: string
  eventType: string
  platform: string
  readTimeSeconds?: number
  scrollDepth?: number
  sessionId?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  deviceType?: string
  country?: string
  region?: string
  city?: string
  browser?: string
}) {
  const supabase = createSupabaseServiceClient()

  try {
    // Get story to find storyteller_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: story } = await (supabase as any)
      .from('stories')
      .select('storyteller_id')
      .eq('id', data.storyId)
      .single()

    // Insert engagement event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('story_engagement_events')
      .insert({
        story_id: data.storyId,
        storyteller_id: story?.storyteller_id || null,
        platform_name: data.platform,
        event_type: data.eventType,
        read_time_seconds: data.readTimeSeconds || null,
        scroll_depth: data.scrollDepth || null,
        session_id: data.sessionId || null,
        referrer: data.referrer || null,
        utm_source: data.utmSource || null,
        utm_medium: data.utmMedium || null,
        utm_campaign: data.utmCampaign || null,
        device_type: data.deviceType || 'unknown',
        country_code: data.country || null,
        region: data.region || null,
        city: data.city || null,
        browser: data.browser || null
      })

    if (error) {
      console.error('Error recording engagement:', error)
    }
  } catch (error) {
    console.error('Error in recordEngagement:', error)
  }
}

/**
 * Detect device type from user agent
 */
function detectDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' | 'unknown' {
  const ua = userAgent.toLowerCase()

  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
    return 'mobile'
  }
  if (/tablet|ipad|android(?!.*mobile)|kindle|silk/i.test(ua)) {
    return 'tablet'
  }
  if (/windows|macintosh|linux|x11/i.test(ua)) {
    return 'desktop'
  }
  return 'unknown'
}

/**
 * Detect browser from user agent
 */
function detectBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase()

  if (ua.includes('firefox')) return 'Firefox'
  if (ua.includes('edg')) return 'Edge'
  if (ua.includes('chrome')) return 'Chrome'
  if (ua.includes('safari')) return 'Safari'
  if (ua.includes('opera') || ua.includes('opr')) return 'Opera'
  return 'Other'
}
