/**
 * Engagement Tracking Service
 *
 * Provides analytics and impact data for storytellers.
 * Aggregates engagement across all platforms where their stories appear.
 */

import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

export interface EngagementSummary {
  totalViews: number
  totalReads: number
  totalShares: number
  totalActions: number
  avgReadTimeSeconds: number
  avgScrollDepth: number
  viewsTrend: number  // Percentage change from previous period
}

export interface PlatformBreakdown {
  platform: string
  views: number
  reads: number
  shares: number
  percentage: number
}

export interface GeographicReach {
  country: string
  views: number
  percentage: number
}

export interface EngagementTimeSeries {
  date: string
  views: number
  reads: number
  shares: number
}

export interface StorytellerImpact {
  summary: EngagementSummary
  platformBreakdown: PlatformBreakdown[]
  geographicReach: GeographicReach[]
  timeSeries: EngagementTimeSeries[]
  topStories: Array<{
    storyId: string
    title: string
    views: number
    shares: number
  }>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

class EngagementTrackingService {
  /**
   * Get impact data for a storyteller
   */
  async getStorytellerImpact(
    storytellerId: string,
    days: number = 30
  ): Promise<StorytellerImpact> {
    const supabase = createSupabaseServiceClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get summary stats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: events } = await (supabase as any)
      .from('story_engagement_events')
      .select('event_type, read_time_seconds, scroll_depth, platform_name, country_code, story_id')
      .eq('storyteller_id', storytellerId)
      .gte('created_at', startDate.toISOString())

    // Get previous period for trend
    const previousStart = new Date(startDate)
    previousStart.setDate(previousStart.getDate() - days)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: previousEvents } = await (supabase as any)
      .from('story_engagement_events')
      .select('event_type')
      .eq('storyteller_id', storytellerId)
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', startDate.toISOString())

    // Calculate summary
    const summary = this.calculateSummary(events || [], previousEvents || [])

    // Platform breakdown
    const platformBreakdown = this.calculatePlatformBreakdown(events || [])

    // Geographic reach
    const geographicReach = this.calculateGeographicReach(events || [])

    // Time series (daily)
    const timeSeries = await this.getTimeSeries(storytellerId, days)

    // Top stories
    const topStories = await this.getTopStories(storytellerId, days)

    return {
      summary,
      platformBreakdown,
      geographicReach,
      timeSeries,
      topStories
    }
  }

  /**
   * Get impact data for a single story
   */
  async getStoryImpact(
    storyId: string,
    days: number = 30
  ): Promise<{
    summary: EngagementSummary
    platformBreakdown: PlatformBreakdown[]
    geographicReach: GeographicReach[]
    timeSeries: EngagementTimeSeries[]
  }> {
    const supabase = createSupabaseServiceClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: events } = await (supabase as any)
      .from('story_engagement_events')
      .select('event_type, read_time_seconds, scroll_depth, platform_name, country_code, created_at')
      .eq('story_id', storyId)
      .gte('created_at', startDate.toISOString())

    // Previous period
    const previousStart = new Date(startDate)
    previousStart.setDate(previousStart.getDate() - days)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: previousEvents } = await (supabase as any)
      .from('story_engagement_events')
      .select('event_type')
      .eq('story_id', storyId)
      .gte('created_at', previousStart.toISOString())
      .lt('created_at', startDate.toISOString())

    const summary = this.calculateSummary(events || [], previousEvents || [])
    const platformBreakdown = this.calculatePlatformBreakdown(events || [])
    const geographicReach = this.calculateGeographicReach(events || [])

    // Time series from events
    const timeSeries = this.aggregateTimeSeries(events || [], days)

    return { summary, platformBreakdown, geographicReach, timeSeries }
  }

  /**
   * Generate tracking pixel URL for a story
   */
  generateTrackingPixelUrl(
    storyId: string,
    platform: string = 'unknown',
    sessionId?: string
  ): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://empathyledger.com'
    const params = new URLSearchParams({
      story: storyId,
      event: 'view',
      platform
    })
    if (sessionId) {
      params.set('session', sessionId)
    }
    return `${baseUrl}/api/beacon?${params.toString()}`
  }

  /**
   * Generate tracking pixel HTML
   */
  generateTrackingPixelHtml(
    storyId: string,
    platform: string = 'unknown'
  ): string {
    const url = this.generateTrackingPixelUrl(storyId, platform)
    return `<img src="${url}" width="1" height="1" style="opacity:0;position:absolute" alt="" />`
  }

  /**
   * Generate JavaScript tracking snippet
   */
  generateTrackingScript(storyId: string, platform: string = 'unknown'): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://empathyledger.com'
    return `
<script>
(function() {
  var sessionId = 'el_' + Math.random().toString(36).substr(2, 9);
  var startTime = Date.now();
  var maxScroll = 0;

  // Track scroll depth
  document.addEventListener('scroll', function() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var scrollPercent = Math.round((scrollTop / docHeight) * 100);
    if (scrollPercent > maxScroll) maxScroll = scrollPercent;
  });

  // Send engagement on page leave
  window.addEventListener('beforeunload', function() {
    var readTime = Math.round((Date.now() - startTime) / 1000);
    navigator.sendBeacon('${baseUrl}/api/beacon', JSON.stringify({
      storyId: '${storyId}',
      eventType: readTime > 30 || maxScroll > 50 ? 'read' : 'view',
      platform: '${platform}',
      readTimeSeconds: readTime,
      scrollDepth: maxScroll,
      sessionId: sessionId
    }));
  });

  // Initial view
  new Image().src = '${baseUrl}/api/beacon?story=${storyId}&event=view&platform=${platform}&session=' + sessionId;
})();
</script>`.trim()
  }

  // Private helper methods

  private calculateSummary(
    events: AnyRecord[],
    previousEvents: AnyRecord[]
  ): EngagementSummary {
    const views = events.filter(e => e.event_type === 'view').length
    const reads = events.filter(e => e.event_type === 'read').length
    const shares = events.filter(e => e.event_type === 'share').length
    const actions = events.filter(e => e.event_type === 'action').length

    const previousViews = previousEvents.filter(e => e.event_type === 'view').length
    const viewsTrend = previousViews > 0
      ? Math.round(((views - previousViews) / previousViews) * 100)
      : 0

    const readTimes = events
      .filter(e => e.read_time_seconds)
      .map(e => e.read_time_seconds)
    const avgReadTimeSeconds = readTimes.length > 0
      ? Math.round(readTimes.reduce((a, b) => a + b, 0) / readTimes.length)
      : 0

    const scrollDepths = events
      .filter(e => e.scroll_depth)
      .map(e => e.scroll_depth)
    const avgScrollDepth = scrollDepths.length > 0
      ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length)
      : 0

    return {
      totalViews: views,
      totalReads: reads,
      totalShares: shares,
      totalActions: actions,
      avgReadTimeSeconds,
      avgScrollDepth,
      viewsTrend
    }
  }

  private calculatePlatformBreakdown(events: AnyRecord[]): PlatformBreakdown[] {
    const platformMap = new Map<string, { views: number; reads: number; shares: number }>()

    for (const event of events) {
      const platform = event.platform_name || 'unknown'
      if (!platformMap.has(platform)) {
        platformMap.set(platform, { views: 0, reads: 0, shares: 0 })
      }
      const stats = platformMap.get(platform)!
      if (event.event_type === 'view') stats.views++
      if (event.event_type === 'read') stats.reads++
      if (event.event_type === 'share') stats.shares++
    }

    const totalViews = events.filter(e => e.event_type === 'view').length

    return Array.from(platformMap.entries())
      .map(([platform, stats]) => ({
        platform,
        ...stats,
        percentage: totalViews > 0 ? Math.round((stats.views / totalViews) * 100) : 0
      }))
      .sort((a, b) => b.views - a.views)
  }

  private calculateGeographicReach(events: AnyRecord[]): GeographicReach[] {
    const countryMap = new Map<string, number>()

    for (const event of events) {
      if (event.country_code) {
        countryMap.set(
          event.country_code,
          (countryMap.get(event.country_code) || 0) + 1
        )
      }
    }

    const totalWithCountry = Array.from(countryMap.values()).reduce((a, b) => a + b, 0)

    return Array.from(countryMap.entries())
      .map(([country, views]) => ({
        country,
        views,
        percentage: totalWithCountry > 0 ? Math.round((views / totalWithCountry) * 100) : 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
  }

  private aggregateTimeSeries(events: AnyRecord[], days: number): EngagementTimeSeries[] {
    const dateMap = new Map<string, { views: number; reads: number; shares: number }>()

    // Initialize all days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dateMap.set(dateStr, { views: 0, reads: 0, shares: 0 })
    }

    // Aggregate events
    for (const event of events) {
      const dateStr = event.created_at.split('T')[0]
      if (dateMap.has(dateStr)) {
        const stats = dateMap.get(dateStr)!
        if (event.event_type === 'view') stats.views++
        if (event.event_type === 'read') stats.reads++
        if (event.event_type === 'share') stats.shares++
      }
    }

    return Array.from(dateMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private async getTimeSeries(
    storytellerId: string,
    days: number
  ): Promise<EngagementTimeSeries[]> {
    const supabase = createSupabaseServiceClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Try daily aggregates first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dailyStats } = await (supabase as any)
      .from('story_engagement_daily')
      .select('date, view_count, read_count, share_count')
      .eq('storyteller_id', storytellerId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (dailyStats && dailyStats.length > 0) {
      return dailyStats.map((day: AnyRecord) => ({
        date: day.date,
        views: day.view_count,
        reads: day.read_count,
        shares: day.share_count
      }))
    }

    // Fall back to raw events
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: events } = await (supabase as any)
      .from('story_engagement_events')
      .select('event_type, created_at')
      .eq('storyteller_id', storytellerId)
      .gte('created_at', startDate.toISOString())

    return this.aggregateTimeSeries(events || [], days)
  }

  private async getTopStories(
    storytellerId: string,
    days: number
  ): Promise<Array<{ storyId: string; title: string; views: number; shares: number }>> {
    const supabase = createSupabaseServiceClient()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get engagement grouped by story
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: events } = await (supabase as any)
      .from('story_engagement_events')
      .select('story_id, event_type')
      .eq('storyteller_id', storytellerId)
      .gte('created_at', startDate.toISOString())

    if (!events || events.length === 0) return []

    // Aggregate by story
    const storyMap = new Map<string, { views: number; shares: number }>()
    for (const event of events) {
      if (!storyMap.has(event.story_id)) {
        storyMap.set(event.story_id, { views: 0, shares: 0 })
      }
      const stats = storyMap.get(event.story_id)!
      if (event.event_type === 'view') stats.views++
      if (event.event_type === 'share') stats.shares++
    }

    // Get story titles
    const storyIds = Array.from(storyMap.keys())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: stories } = await (supabase as any)
      .from('stories')
      .select('id, title')
      .in('id', storyIds)

    const titleMap = new Map(stories?.map((s: AnyRecord) => [s.id, s.title]) || [])

    return Array.from(storyMap.entries())
      .map(([storyId, stats]) => ({
        storyId,
        title: (titleMap.get(storyId) as string) || 'Untitled',
        ...stats
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
  }
}

// Export singleton
export const engagementTrackingService = new EngagementTrackingService()
export default engagementTrackingService
