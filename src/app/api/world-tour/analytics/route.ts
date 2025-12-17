// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { createAdminClient } from '@/lib/supabase/server'

export interface AnalyticsData {
  // Consent & Privacy Metrics
  consent: {
    totalStorytellers: number
    consentedToPublic: number
    consentedToCommunity: number
    consentedToPrivate: number
    pendingConsent: number
    consentByMonth: Array<{ month: string; consented: number; pending: number }>
    consentTypes: Record<string, number>
  }

  // Engagement Metrics
  engagement: {
    totalViews: number
    totalShares: number
    totalComments: number
    averageViewsPerStory: number
    topViewedStories: Array<{ id: string; title: string; views: number; storyteller: string }>
    engagementTrend: Array<{ date: string; views: number; shares: number; comments: number }>
    engagementByRegion: Array<{ region: string; views: number; shares: number }>
  }

  // Story Quality Metrics
  quality: {
    totalStories: number
    totalTranscripts: number
    transcriptsWithStoryteller: number
    withTranscripts: number
    aiAnalyzed: number
    withThemes: number
    withMedia: number
    averageCompleteness: number
    qualityDistribution: Array<{ score: string; count: number }>
    incompleteStories: Array<{ id: string; title: string; missingFields: string[] }>
    averageWordCount: number
    averageThemeCount: number
  }

  // Interview Pipeline Metrics (NEW - shows how interviews become insights)
  interviewPipeline: {
    totalInterviews: number              // Total transcripts
    analyzedInterviews: number           // Transcripts with AI analysis
    pendingAnalysis: number              // Transcripts awaiting analysis
    storiesGenerated: number             // Stories created from transcripts
    uniqueThemesDiscovered: number       // Themes extracted from transcript analysis
    wisdomMomentsExtracted: number       // Key quotes/moments captured
    voicesPreserved: number              // Unique storytellers with analyzed transcripts
    averageConfidence: number            // Avg AI confidence score
    recentAnalyses: Array<{              // Recent transcript analyses
      id: string
      title: string
      storyteller: string
      analyzedAt: string
      themes: string[]
      keyMomentsCount: number
    }>
    themesBySource: {
      fromTranscripts: number            // Themes from AI transcript analysis
      fromStories: number                // Themes manually tagged on stories
    }
  }

  // Equity & Representation Metrics
  equity: {
    totalStorytellers: number
    elderCount: number
    youthCount: number
    genderDistribution: Record<string, number>
    culturalAffiliations: Array<{ affiliation: string; count: number }>
    regionDistribution: Array<{ region: string; count: number; percentage: number }>
    underrepresentedRegions: string[]
    diversityIndex: number
    representationGoals: Array<{ goal: string; current: number; target: number }>
  }

  // Timeline Data
  timeline: {
    storiesByMonth: Array<{ month: string; stories: number; storytellers: number }>
    storiesByYear: Array<{ year: number; stories: number }>
    firstStoryDate: string
    latestStoryDate: string
    growthRate: number
  }

  // Comparison Data
  comparison: {
    regions: Array<{
      name: string
      stories: number
      storytellers: number
      themes: number
      avgQuality: number
      avgEngagement: number
    }>
    themes: Array<{
      name: string
      stories: number
      regions: number
      growth: number
      sentiment: number
    }>
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '90d'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    switch (timeRange) {
      case '7d': startDate.setDate(now.getDate() - 7); break
      case '30d': startDate.setDate(now.getDate() - 30); break
      case '90d': startDate.setDate(now.getDate() - 90); break
      case '1y': startDate.setFullYear(now.getFullYear() - 1); break
      default: startDate = new Date('2020-01-01')
    }

    // ============================================
    // FETCH ALL REQUIRED DATA
    // ============================================

    // Fetch profiles with consent and demographic data
    const { data: profiles } = await supabase
      .from('profiles')
      .select(`
        id,
        profile_visibility,
        is_storyteller,
        is_elder,
        gender,
        age_range,
        cultural_affiliations,
        location,
        created_at,
        profile_locations (
          locations (
            country,
            city,
            name
          )
        )
      `)
      .eq('is_storyteller', true)

    // Fetch stories with engagement data (include draft and published)
    // Note: view_count and share_count columns don't exist yet in the schema
    // Use admin client to bypass RLS for accurate counts
    const adminClient = createAdminClient()
    const { data: stories, error: storiesError } = await adminClient
      .from('stories')
      .select(`
        id,
        title,
        content,
        status,
        themes,
        created_at,
        published_at,
        storyteller_id,
        transcript_id,
        profiles!stories_storyteller_id_fkey (
          display_name,
          first_name,
          last_name,
          location
        )
      `)
      .in('status', ['published', 'draft'])
      .gte('created_at', startDate.toISOString())

    // Fetch all transcripts with analysis data (bypasses RLS)
    const { data: transcripts } = await adminClient
      .from('transcripts')
      .select(`
        id,
        storyteller_id,
        title,
        ai_processing_status,
        themes,
        metadata,
        story_id,
        created_at,
        updated_at,
        profiles:storyteller_id (
          display_name,
          first_name,
          last_name
        )
      `)
      .order('updated_at', { ascending: false, nullsFirst: false })

    // Fetch media for quality analysis (using media_assets table)
    const { data: media } = await adminClient
      .from('media_assets')
      .select('id, story_id')
      .not('story_id', 'is', null)

    // Fetch narrative themes from transcript analysis
    const { data: narrativeThemes } = await supabase
      .from('narrative_themes')
      .select('theme_name, usage_count, sentiment_score, ai_confidence_score')
      .order('usage_count', { ascending: false })
      .limit(50)

    // Fetch wisdom quotes/moments extracted from transcripts
    const { data: wisdomQuotes } = await adminClient
      .from('storyteller_quotes')
      .select('id, quote_text, source_type, themes, emotional_impact_score, wisdom_score')
      .eq('source_type', 'transcript')

    // Fetch storyteller-theme connections for richer analysis
    const { data: storytellerThemes } = await adminClient
      .from('storyteller_themes')
      .select('theme_id, storyteller_id, prominence_score, key_quotes')

    // ============================================
    // CALCULATE CONSENT METRICS
    // ============================================

    const consentMetrics = calculateConsentMetrics(profiles || [])

    // ============================================
    // CALCULATE ENGAGEMENT METRICS
    // ============================================

    const engagementMetrics = calculateEngagementMetrics(stories || [])

    // ============================================
    // CALCULATE QUALITY METRICS
    // ============================================

    const qualityMetrics = calculateQualityMetrics(
      stories || [],
      transcripts || [],
      media || []
    )

    // ============================================
    // CALCULATE EQUITY METRICS
    // ============================================

    const equityMetrics = calculateEquityMetrics(profiles || [], stories || [])

    // ============================================
    // CALCULATE TIMELINE DATA
    // ============================================

    const timelineData = calculateTimelineData(stories || [])

    // ============================================
    // CALCULATE COMPARISON DATA
    // ============================================

    const comparisonData = calculateComparisonData(
      stories || [],
      profiles || [],
      narrativeThemes || []
    )

    // ============================================
    // CALCULATE INTERVIEW PIPELINE METRICS (NEW)
    // ============================================

    const interviewPipelineMetrics = calculateInterviewPipelineMetrics(
      transcripts || [],
      stories || [],
      narrativeThemes || [],
      wisdomQuotes || []
    )

    return NextResponse.json({
      consent: consentMetrics,
      engagement: engagementMetrics,
      quality: qualityMetrics,
      equity: equityMetrics,
      timeline: timelineData,
      comparison: comparisonData,
      interviewPipeline: interviewPipelineMetrics,
      lastUpdated: new Date().toISOString()
    } as AnalyticsData)

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

// Helper functions

function calculateConsentMetrics(profiles: any[]) {
  const byVisibility = {
    public: profiles.filter(p => p.profile_visibility === 'public').length,
    community: profiles.filter(p => p.profile_visibility === 'community').length,
    private: profiles.filter(p => p.profile_visibility === 'private').length,
    pending: profiles.filter(p => !p.profile_visibility).length
  }

  // Group by month for trend
  const byMonth = new Map<string, { consented: number; pending: number }>()
  profiles.forEach(p => {
    const month = new Date(p.created_at).toISOString().substring(0, 7)
    const existing = byMonth.get(month) || { consented: 0, pending: 0 }
    if (p.profile_visibility && p.profile_visibility !== 'private') {
      existing.consented++
    } else {
      existing.pending++
    }
    byMonth.set(month, existing)
  })

  return {
    totalStorytellers: profiles.length,
    consentedToPublic: byVisibility.public,
    consentedToCommunity: byVisibility.community,
    consentedToPrivate: byVisibility.private,
    pendingConsent: byVisibility.pending,
    consentByMonth: Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([month, data]) => ({ month, ...data })),
    consentTypes: byVisibility
  }
}

function calculateEngagementMetrics(stories: any[]) {
  // Note: view_count and share_count columns don't exist in schema yet
  // Using story count per date as a proxy for engagement activity
  const totalStories = stories.length

  // Featured stories (based on recent activity and content length)
  const featuredStories = stories
    .filter(s => s.content && s.content.length > 200)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map(s => ({
      id: s.id,
      title: s.title || 'Untitled',
      views: 0, // Would need view tracking
      storyteller: s.profiles?.display_name ||
        `${s.profiles?.first_name || ''} ${s.profiles?.last_name || ''}`.trim() ||
        'Anonymous'
    }))

  // Group by date for trend (story creation activity)
  const byDate = new Map<string, { views: number; shares: number; comments: number }>()
  stories.forEach(s => {
    const date = new Date(s.created_at).toISOString().substring(0, 10)
    const existing = byDate.get(date) || { views: 0, shares: 0, comments: 0 }
    existing.views += 1 // Count stories created as activity metric
    byDate.set(date, existing)
  })

  // Group by region
  const byRegion = new Map<string, { views: number; shares: number }>()
  stories.forEach(s => {
    let region = 'Unknown'
    try {
      const loc = s.profiles?.location
      if (loc) {
        const parsed = typeof loc === 'string' ? JSON.parse(loc) : loc
        region = parsed?.country || parsed?.name?.split(',').pop()?.trim() || 'Unknown'
      }
    } catch {}
    const existing = byRegion.get(region) || { views: 0, shares: 0 }
    existing.views += 1 // Count stories as activity
    byRegion.set(region, existing)
  })

  return {
    totalViews: 0, // Would need view tracking table
    totalShares: 0, // Would need share tracking table
    totalComments: 0, // Would need comments table
    averageViewsPerStory: 0,
    topViewedStories: featuredStories,
    engagementTrend: Array.from(byDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([date, data]) => ({ date, ...data })),
    engagementByRegion: Array.from(byRegion.entries())
      .sort((a, b) => b[1].views - a[1].views)
      .slice(0, 10)
      .map(([region, data]) => ({ region, ...data }))
  }
}

function calculateQualityMetrics(stories: any[], transcripts: any[], media: any[]) {
  // Map transcripts by their ID (stories have transcript_id pointing to transcript.id)
  const transcriptMap = new Map(transcripts.map(t => [t.id, t]))
  const mediaByStory = new Map<string, any[]>()
  media.forEach(m => {
    const existing = mediaByStory.get(m.story_id) || []
    existing.push(m)
    mediaByStory.set(m.story_id, existing)
  })

  let totalWordCount = 0
  let totalThemeCount = 0
  const qualityScores: number[] = []
  const incompleteStories: Array<{ id: string; title: string; missingFields: string[] }> = []

  stories.forEach(s => {
    // Look up transcript by story's transcript_id field
    const transcript = s.transcript_id ? transcriptMap.get(s.transcript_id) : null
    const storyMedia = mediaByStory.get(s.id) || []
    const missingFields: string[] = []

    // Calculate completeness score
    let score = 0
    const maxScore = 5

    // Has content (1 point)
    if (s.content && s.content.length > 100) {
      score += 1
      totalWordCount += s.content.split(/\s+/).length
    } else {
      missingFields.push('content')
    }

    // Has themes (1 point)
    if (s.themes && s.themes.length > 0) {
      score += 1
      totalThemeCount += s.themes.length
    } else {
      missingFields.push('themes')
    }

    // Has transcript (1 point)
    if (transcript) score += 1
    else missingFields.push('transcript')

    // Has AI analysis (1 point) - use themes as proxy since is_ai_processed column may not exist
    if (s.themes && s.themes.length > 0) score += 1
    else missingFields.push('ai_analysis')

    // Has media (1 point)
    if (storyMedia.length > 0) score += 1
    else missingFields.push('media')

    qualityScores.push((score / maxScore) * 100)

    if (missingFields.length > 0) {
      incompleteStories.push({
        id: s.id,
        title: s.title || 'Untitled',
        missingFields
      })
    }
  })

  // Quality distribution
  const distribution = [
    { score: '0-20%', count: qualityScores.filter(s => s <= 20).length },
    { score: '21-40%', count: qualityScores.filter(s => s > 20 && s <= 40).length },
    { score: '41-60%', count: qualityScores.filter(s => s > 40 && s <= 60).length },
    { score: '61-80%', count: qualityScores.filter(s => s > 60 && s <= 80).length },
    { score: '81-100%', count: qualityScores.filter(s => s > 80).length }
  ]

  // Count transcripts independently (interviews)
  const totalTranscripts = transcripts.length
  const transcriptsWithStoryteller = transcripts.filter(t => t.storyteller_id).length
  // Count AI analyzed using stories with themes as proxy
  const aiAnalyzedStories = stories.filter(s => s.themes && s.themes.length > 0).length
  const storiesWithTranscriptId = stories.filter(s => s.transcript_id).length

  return {
    totalStories: stories.length,
    totalTranscripts,
    transcriptsWithStoryteller,
    withTranscripts: storiesWithTranscriptId,
    aiAnalyzed: aiAnalyzedStories,
    withThemes: stories.filter(s => s.themes?.length > 0).length,
    withMedia: stories.filter(s => mediaByStory.has(s.id)).length,
    averageCompleteness: qualityScores.length > 0
      ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
      : 0,
    qualityDistribution: distribution,
    incompleteStories: incompleteStories
      .sort((a, b) => b.missingFields.length - a.missingFields.length)
      .slice(0, 20),
    averageWordCount: stories.length > 0 ? Math.round(totalWordCount / stories.length) : 0,
    averageThemeCount: stories.length > 0
      ? Math.round((totalThemeCount / stories.length) * 10) / 10
      : 0
  }
}

function calculateEquityMetrics(profiles: any[], stories: any[]) {
  // Gender distribution
  const genderDist: Record<string, number> = {}
  profiles.forEach(p => {
    const gender = p.gender || 'Not specified'
    genderDist[gender] = (genderDist[gender] || 0) + 1
  })

  // Cultural affiliations
  const culturalMap = new Map<string, number>()
  profiles.forEach(p => {
    const affiliations = p.cultural_affiliations || []
    affiliations.forEach((a: string) => {
      culturalMap.set(a, (culturalMap.get(a) || 0) + 1)
    })
  })

  // Region distribution
  const regionMap = new Map<string, number>()
  profiles.forEach(p => {
    let region = 'Unknown'
    try {
      if (p.location) {
        const loc = typeof p.location === 'string' ? JSON.parse(p.location) : p.location
        region = loc?.country || loc?.name?.split(',').pop()?.trim() || 'Unknown'
      } else if (p.profile_locations?.[0]?.locations) {
        region = p.profile_locations[0].locations.country || 'Unknown'
      }
    } catch {}
    regionMap.set(region, (regionMap.get(region) || 0) + 1)
  })

  const regionDist = Array.from(regionMap.entries())
    .map(([region, count]) => ({
      region,
      count,
      percentage: Math.round((count / profiles.length) * 100)
    }))
    .sort((a, b) => b.count - a.count)

  // Calculate diversity index (Simpson's)
  const totalProfiles = profiles.length
  let diversitySum = 0
  regionMap.forEach(count => {
    diversitySum += (count * (count - 1))
  })
  const diversityIndex = totalProfiles > 1
    ? Math.round((1 - diversitySum / (totalProfiles * (totalProfiles - 1))) * 100)
    : 0

  // Identify underrepresented regions (less than 5% representation)
  const underrepresented = regionDist
    .filter(r => r.percentage < 5 && r.region !== 'Unknown')
    .map(r => r.region)

  // Elder/Youth counts
  const elderCount = profiles.filter(p => p.is_elder).length
  const youthCount = profiles.filter(p => {
    const age = p.age_range
    return age === '18-24' || age === 'under-18'
  }).length

  return {
    totalStorytellers: profiles.length,
    elderCount,
    youthCount,
    genderDistribution: genderDist,
    culturalAffiliations: Array.from(culturalMap.entries())
      .map(([affiliation, count]) => ({ affiliation, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    regionDistribution: regionDist.slice(0, 15),
    underrepresentedRegions: underrepresented,
    diversityIndex,
    representationGoals: [
      { goal: 'Elder Stories', current: elderCount, target: Math.ceil(profiles.length * 0.2) },
      { goal: 'Youth Voices', current: youthCount, target: Math.ceil(profiles.length * 0.15) },
      { goal: 'Regional Diversity', current: regionMap.size, target: 20 },
      { goal: 'Cultural Groups', current: culturalMap.size, target: 15 }
    ]
  }
}

function calculateTimelineData(stories: any[]) {
  if (stories.length === 0) {
    return {
      storiesByMonth: [],
      storiesByYear: [],
      firstStoryDate: '',
      latestStoryDate: '',
      growthRate: 0
    }
  }

  // Group by month
  const byMonth = new Map<string, { stories: number; storytellers: Set<string> }>()
  stories.forEach(s => {
    const month = new Date(s.created_at).toISOString().substring(0, 7)
    const existing = byMonth.get(month) || { stories: 0, storytellers: new Set() }
    existing.stories++
    if (s.storyteller_id) existing.storytellers.add(s.storyteller_id)
    byMonth.set(month, existing)
  })

  // Group by year
  const byYear = new Map<number, number>()
  stories.forEach(s => {
    const year = new Date(s.created_at).getFullYear()
    byYear.set(year, (byYear.get(year) || 0) + 1)
  })

  // Calculate growth rate (last 3 months vs previous 3 months)
  const months = Array.from(byMonth.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  let growthRate = 0
  if (months.length >= 6) {
    const recent = months.slice(-3).reduce((sum, [, data]) => sum + data.stories, 0)
    const previous = months.slice(-6, -3).reduce((sum, [, data]) => sum + data.stories, 0)
    if (previous > 0) {
      growthRate = Math.round(((recent - previous) / previous) * 100)
    }
  }

  const sortedStories = [...stories].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return {
    storiesByMonth: Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-24)
      .map(([month, data]) => ({
        month,
        stories: data.stories,
        storytellers: data.storytellers.size
      })),
    storiesByYear: Array.from(byYear.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([year, stories]) => ({ year, stories })),
    firstStoryDate: sortedStories[0]?.created_at || '',
    latestStoryDate: sortedStories[sortedStories.length - 1]?.created_at || '',
    growthRate
  }
}

function calculateComparisonData(stories: any[], profiles: any[], themes: any[]) {
  // Region comparison
  const regionStats = new Map<string, {
    stories: number
    storytellers: Set<string>
    themes: Set<string>
    views: number
  }>()

  stories.forEach(s => {
    let region = 'Unknown'
    try {
      const loc = s.profiles?.location
      if (loc) {
        const parsed = typeof loc === 'string' ? JSON.parse(loc) : loc
        region = parsed?.country || 'Unknown'
      }
    } catch {}

    const existing = regionStats.get(region) || {
      stories: 0,
      storytellers: new Set(),
      themes: new Set(),
      views: 0
    }
    existing.stories++
    if (s.storyteller_id) existing.storytellers.add(s.storyteller_id)
    ;(s.themes || []).forEach((t: string) => existing.themes.add(t))
    existing.views += s.view_count || 0
    regionStats.set(region, existing)
  })

  // Theme comparison
  const themeData = themes.map(t => ({
    name: t.theme_name,
    stories: t.usage_count || 0,
    regions: 0, // Would need to calculate from stories
    growth: 0, // Would need historical data
    sentiment: t.sentiment_score || 0
  }))

  return {
    regions: Array.from(regionStats.entries())
      .map(([name, data]) => ({
        name,
        stories: data.stories,
        storytellers: data.storytellers.size,
        themes: data.themes.size,
        avgQuality: 0, // Would need quality scores per story
        avgEngagement: data.stories > 0 ? Math.round(data.views / data.stories) : 0
      }))
      .sort((a, b) => b.stories - a.stories)
      .slice(0, 15),
    themes: themeData.slice(0, 20)
  }
}

/**
 * Calculate Interview Pipeline Metrics
 * Shows how interviews flow through to insights - the heart of the World Tour impact
 */
function calculateInterviewPipelineMetrics(
  transcripts: any[],
  stories: any[],
  narrativeThemes: any[],
  wisdomQuotes: any[]
) {
  // Transcripts with AI analysis (ai_processing_status = 'completed'/'deep_analyzed' or has themes)
  const analyzedTranscripts = transcripts.filter(t => {
    if (t.ai_processing_status === 'completed') return true
    if (t.ai_processing_status === 'deep_analyzed') return true
    if (t.themes && t.themes.length > 0) return true
    if (t.metadata?.analysis?.themes?.length > 0) return true
    return false
  })

  // Unique storytellers with analyzed transcripts
  const voicesWithAnalysis = new Set(
    analyzedTranscripts
      .filter(t => t.storyteller_id)
      .map(t => t.storyteller_id)
  )

  // Stories generated from transcripts
  const storiesFromTranscripts = stories.filter(s => s.transcript_id)

  // Calculate average confidence score from narrative themes
  const confidenceScores = narrativeThemes
    .map(t => t.ai_confidence_score)
    .filter(c => c && c > 0)
  const avgConfidence = confidenceScores.length > 0
    ? Math.round((confidenceScores.reduce((a: number, b: number) => a + b, 0) / confidenceScores.length) * 100)
    : 0

  // Count themes from transcript analysis vs story tags
  const themesFromTranscriptAnalysis = new Set(
    analyzedTranscripts.flatMap(t => t.themes || [])
  ).size
  const themesFromStories = new Set(
    stories.flatMap(s => s.themes || [])
  ).size

  // Count key moments (wisdom quotes from transcripts)
  const keyMomentsCount = wisdomQuotes.length

  // Build recent analyses list
  const recentAnalyses = analyzedTranscripts
    .slice(0, 10)
    .map(t => {
      const transcriptThemes = t.themes || t.metadata?.analysis?.themes || []
      const profile = t.profiles as any
      const storytellerName = profile?.display_name ||
        `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
        'Anonymous'

      return {
        id: t.id,
        title: t.title || 'Untitled Interview',
        storyteller: storytellerName,
        analyzedAt: t.updated_at || t.created_at,
        themes: transcriptThemes,
        keyMomentsCount: (t.metadata?.analysis?.keyMoments || []).length
      }
    })

  return {
    totalInterviews: transcripts.length,
    analyzedInterviews: analyzedTranscripts.length,
    pendingAnalysis: transcripts.length - analyzedTranscripts.length,
    storiesGenerated: storiesFromTranscripts.length,
    uniqueThemesDiscovered: narrativeThemes.length,
    wisdomMomentsExtracted: keyMomentsCount,
    voicesPreserved: voicesWithAnalysis.size,
    averageConfidence: avgConfidence,
    recentAnalyses,
    themesBySource: {
      fromTranscripts: themesFromTranscriptAnalysis,
      fromStories: themesFromStories
    }
  }
}
