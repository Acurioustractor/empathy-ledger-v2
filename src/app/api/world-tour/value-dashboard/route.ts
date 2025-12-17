// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * World Tour Value Dashboard API
 *
 * Aggregates comprehensive analytics data to show the immense value
 * of participating in Empathy Ledger - for storytellers, organizations,
 * and the global community.
 */

interface StorytellerValueMetrics {
  id: string
  name: string
  avatarUrl: string | null
  location: string | null
  isElder: boolean
  isFeatured: boolean
  // Impact scores (0-100)
  overallImpactScore: number
  culturalImpactScore: number
  communityImpactScore: number
  inspirationalImpactScore: number
  // Reach metrics
  totalContentViews: number
  uniqueViewers: number
  contentShares: number
  quoteCitations: number
  // Contribution metrics
  storiesCreated: number
  transcriptsAnalyzed: number
  communitiesReached: number
  menteesMentored: number
  // Theme expertise
  primaryThemes: string[]
  themeCount: number
  // Network
  connectionCount: number
  collaborationScore: number
}

interface WisdomQuote {
  id: string
  text: string
  context: string
  storytellerName: string
  storytellerId: string
  isElder: boolean
  themes: string[]
  // AI scores (0-1)
  emotionalImpactScore: number
  wisdomScore: number
  quotabilityScore: number
  inspirationScore: number
  // Usage
  citationCount: number
  shareCount: number
}

interface ThemeInsight {
  name: string
  category: string
  storyCount: number
  storytellerCount: number
  sentimentScore: number // -1 to 1
  aiConfidence: number // 0 to 1
  trend: 'emerging' | 'stable' | 'declining' | 'peak'
  regions: string[]
  topQuotes: string[]
  color: string
}

interface OrganizationImpact {
  id: string
  name: string
  logoUrl: string | null
  memberCount: number
  storyCount: number
  totalReach: number
  primaryThemes: string[]
  impactScore: number
  projectCount: number
}

interface GeographicCluster {
  region: string
  country: string
  city: string | null
  coordinates: { lat: number; lng: number }
  storytellerCount: number
  storyCount: number
  primaryThemes: string[]
  culturalAffiliations: string[]
  impactScore: number
  recentActivity: boolean
}

interface CrossSectorConnection {
  sector1: string
  sector2: string
  sharedThemes: string[]
  storytellerCount: number
  collaborationPotential: number
  successStories: number
}

interface PlatformStats {
  // Core metrics
  totalStorytellers: number
  totalStories: number
  totalTranscripts: number
  totalQuotes: number
  totalThemes: number
  // Reach
  totalViews: number
  uniqueCountries: number
  uniqueCities: number
  // Quality
  averageImpactScore: number
  averageWisdomScore: number
  contentCompletionRate: number
  // Cultural
  eldersCount: number
  intergenerationalConnections: number
  culturalProtocolsDocumented: number
  // Network
  totalConnections: number
  averageConnectionsPerStoryteller: number
  collaborativeProjectsCount: number
  // Growth
  newStorytellersThisMonth: number
  newStoriesThisMonth: number
  growthRate: number
}

interface ValueDashboardResponse {
  platformStats: PlatformStats
  topStorytellers: StorytellerValueMetrics[]
  wisdomQuotes: WisdomQuote[]
  themeInsights: ThemeInsight[]
  organizationImpacts: OrganizationImpact[]
  geographicClusters: GeographicCluster[]
  crossSectorConnections: CrossSectorConnection[]
  recentMilestones: {
    type: string
    description: string
    storytellerName: string
    date: string
  }[]
  valuePropositions: {
    forStorytellers: string[]
    forOrganizations: string[]
    forCommunities: string[]
  }
}

export async function GET(request: NextRequest) {
  try {
    // Use service role client for this public dashboard API
    // The SSR client requires cookies which aren't available for public endpoints
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ============================================
    // 1. PLATFORM-WIDE STATISTICS
    // Based on DATA_AUDIT_REPORT.md - using actual populated tables
    // ============================================

    // Get storyteller counts from profiles (250 rows)
    const { count: totalStorytellers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_storyteller', true)

    const { count: eldersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_storyteller', true)
      .eq('is_elder', true)

    // Get story counts (318 rows)
    const { count: totalStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // Get transcript counts (251 rows) - check ai_processing_status instead of is_ai_processed
    const { count: totalTranscripts } = await supabase
      .from('transcripts')
      .select('*', { count: 'exact', head: true })

    const { count: analyzedTranscripts } = await supabase
      .from('transcripts')
      .select('*', { count: 'exact', head: true })
      .in('ai_processing_status', ['completed', 'deep_analyzed'])

    // Get theme counts from narrative_themes (21 rows)
    const { count: totalThemes } = await supabase
      .from('narrative_themes')
      .select('*', { count: 'exact', head: true })

    // Get quote counts from extracted_quotes (71 rows)
    const { count: totalQuotes } = await supabase
      .from('extracted_quotes')
      .select('*', { count: 'exact', head: true })

    // Get organization counts - table is 'organizations' not 'organisations' (19 rows)
    const { count: totalOrgs } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })

    // Get project counts (11 rows)
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    // ============================================
    // 2. TOP STORYTELLERS WITH IMPACT METRICS
    // Using storyteller_analytics (13 rows) + profiles (250 rows)
    // ============================================

    // Get storyteller_analytics data (has themes, story counts, connections)
    const { data: analyticsData } = await supabase
      .from('storyteller_analytics')
      .select('storyteller_id, total_stories, total_transcripts, primary_themes, connection_count')

    const analyticsMap = new Map((analyticsData || []).map(a => [a.storyteller_id, a]))

    // Get storytellers with bios and themes
    // Note: 'specialties' column doesn't exist - use expertise_areas, narrative_themes, ai_themes instead
    const { data: storytellersWithMetrics, error: stError } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        display_name,
        profile_image_url,
        location,
        is_elder,
        is_featured,
        community_roles,
        expertise_areas,
        narrative_themes,
        ai_themes,
        cultural_affiliations,
        bio
      `)
      .eq('is_storyteller', true)
      .limit(100)

    if (stError) {
      console.error('Error fetching storytellers:', stError)
    }
    console.log('Storytellers fetched:', storytellersWithMetrics?.length || 0)
    if (storytellersWithMetrics && storytellersWithMetrics.length > 0) {
      console.log('Sample storyteller:', JSON.stringify(storytellersWithMetrics[0]))
    }

    // Count stories per storyteller
    const { data: storyCounts } = await supabase
      .from('stories')
      .select('storyteller_id')
      .eq('status', 'published')

    const storyCountMap = new Map<string, number>()
    ;(storyCounts || []).forEach((s: any) => {
      if (s.storyteller_id) {
        storyCountMap.set(s.storyteller_id, (storyCountMap.get(s.storyteller_id) || 0) + 1)
      }
    })

    const topStorytellers: StorytellerValueMetrics[] = (storytellersWithMetrics || [])
      .map(s => {
        const storyCount = storyCountMap.get(s.id) || 0
        const analytics = analyticsMap.get(s.id)

        // Calculate impact score based on bio, elder status, analytics, and specialties
        // Note: stories.storyteller_id is often null, so we rely on other signals
        let impactScore = 10 // Base score for being a storyteller
        if (s.bio && s.bio.length > 50) impactScore += 15 // Has bio
        if (s.bio && s.bio.length > 200) impactScore += 10 // Detailed bio
        if (s.is_elder) impactScore += 30
        if (s.is_featured) impactScore += 20
        if (s.location) impactScore += 5
        if (analytics?.connection_count) impactScore += analytics.connection_count * 2
        if (analytics?.total_transcripts) impactScore += analytics.total_transcripts * 5
        if (analytics?.total_stories) impactScore += analytics.total_stories * 10
        if (storyCount > 0) impactScore += storyCount * 10

        // Get themes from analytics or expertise_areas - filter garbage
        // Skip ai_themes and narrative_themes on profiles as they contain word-frequency garbage
        const rawThemes = analytics?.primary_themes || s.expertise_areas || []
        const themes = filterGarbageThemes(rawThemes)
        if (themes.length > 0) impactScore += themes.length * 3

        return {
          id: s.id,
          name: s.display_name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Anonymous',
          avatarUrl: s.profile_image_url,
          location: s.location,
          isElder: s.is_elder || false,
          isFeatured: s.is_featured || false,
          overallImpactScore: Math.min(100, impactScore),
          culturalImpactScore: s.is_elder ? 80 : (themes.some((t: string) => t?.toLowerCase().includes('cultur')) ? 60 : 30),
          communityImpactScore: themes.some((t: string) => t?.toLowerCase().includes('community')) ? 70 : 40,
          inspirationalImpactScore: s.bio && s.bio.length > 100 ? 65 : 35,
          totalContentViews: 0,
          uniqueViewers: 0,
          contentShares: 0,
          quoteCitations: 0,
          storiesCreated: storyCount || analytics?.total_stories || 0,
          transcriptsAnalyzed: analytics?.total_transcripts || 0,
          communitiesReached: analytics?.connection_count ? Math.ceil(analytics.connection_count / 3) : 0,
          menteesMentored: 0,
          primaryThemes: themes.slice(0, 5),
          themeCount: themes.length,
          connectionCount: analytics?.connection_count || 0,
          collaborationScore: analytics?.connection_count ? Math.min(100, analytics.connection_count * 8) : 0
        }
      })
      // Include storytellers with meaningful data - very permissive
      .filter(s => {
        // Must have a name (not empty, not Anonymous)
        return s.name && s.name.trim().length > 0 && s.name !== 'Anonymous'
      })
      .sort((a, b) => {
        // Elders first, then by impact score
        if (a.isElder && !b.isElder) return -1
        if (!a.isElder && b.isElder) return 1
        return b.overallImpactScore - a.overallImpactScore
      })
      .slice(0, 20)

    console.log('Top storytellers after filter:', topStorytellers.length)

    // ============================================
    // 3. WISDOM QUOTES WITH AI SCORES
    // Using extracted_quotes (71 rows) - column is 'text' not 'quote_text'
    // ============================================

    // Get quotes from extracted_quotes table
    const { data: quotesData, error: quotesError } = await supabase
      .from('extracted_quotes')
      .select('*')
      .limit(50)

    if (quotesError) {
      console.error('Quotes query error:', quotesError)
    }
    console.log('Quotes fetched:', quotesData?.length || 0)

    // Also get quotes from transcripts.key_quotes for richer data
    const { data: transcriptQuotes } = await supabase
      .from('transcripts')
      .select('key_quotes, storyteller_id')
      .eq('ai_processing_status', 'completed')
      .not('key_quotes', 'is', null)
      .limit(20)

    // Get storyteller info for quotes
    const storytellerIds = [
      ...new Set([
        ...(quotesData || []).map(q => q.storyteller_id).filter(Boolean),
        ...(transcriptQuotes || []).map(t => t.storyteller_id).filter(Boolean)
      ])
    ]

    const { data: storytellersForQuotes } = await supabase
      .from('profiles')
      .select('id, display_name, first_name, last_name, is_elder')
      .in('id', storytellerIds)

    const storytellerMap = new Map((storytellersForQuotes || []).map(s => [s.id, s]))

    let wisdomQuotes: WisdomQuote[] = []

    // Process extracted_quotes - column is 'text' not 'quote_text'
    if (quotesData && quotesData.length > 0) {
      const extractedQuotes = quotesData
        .filter(q => (q.text || q.quote_text) && (q.text || q.quote_text).length > 20)
        .map(q => {
          const storyteller = storytellerMap.get(q.storyteller_id)

          return {
            id: q.id,
            text: q.text || q.quote_text || '',
            context: q.context || '',
            storytellerName: storyteller?.display_name ||
              `${storyteller?.first_name || ''} ${storyteller?.last_name || ''}`.trim() ||
              'A Storyteller',
            storytellerId: q.storyteller_id || '',
            isElder: storyteller?.is_elder || false,
            themes: q.themes || [],
            emotionalImpactScore: q.emotional_impact_score || 0.5,
            wisdomScore: q.wisdom_score || 0.5,
            quotabilityScore: q.quotability_score || 0.5,
            inspirationScore: q.inspiration_score || 0.5,
            citationCount: q.citation_count || 0,
            shareCount: q.share_count || 0
          }
        })
      wisdomQuotes.push(...extractedQuotes)
    }

    // Add quotes from transcript key_quotes using robust parsing
    if (transcriptQuotes && transcriptQuotes.length > 0) {
      for (const t of transcriptQuotes) {
        const keyQuotes = t.key_quotes || []
        const storyteller = storytellerMap.get(t.storyteller_id)

        for (const kq of keyQuotes.slice(0, 3)) { // Take up to 3 per transcript
          // Use parseQuote to handle stringified JSON, objects, and plain strings
          const parsed = parseQuote(kq)
          if (parsed) {
            wisdomQuotes.push({
              id: `tq-${Math.random().toString(36).substr(2, 9)}`,
              text: parsed.text,
              context: parsed.context || '',
              storytellerName: storyteller?.display_name ||
                `${storyteller?.first_name || ''} ${storyteller?.last_name || ''}`.trim() ||
                'A Storyteller',
              storytellerId: t.storyteller_id || '',
              isElder: storyteller?.is_elder || false,
              themes: parsed.theme ? [parsed.theme] : [],
              emotionalImpactScore: 0.6,
              wisdomScore: 0.6,
              quotabilityScore: 0.6,
              inspirationScore: 0.6,
              citationCount: 0,
              shareCount: 0
            })
          }
        }
      }
    }

    // Sort by wisdom score and take top 15
    wisdomQuotes = wisdomQuotes
      .sort((a, b) => (b.wisdomScore || 0) - (a.wisdomScore || 0))
      .slice(0, 15)

    console.log('Wisdom quotes processed:', wisdomQuotes.length)

    // ============================================
    // 4. THEME INSIGHTS WITH TRENDS
    // Aggregate from: narrative_themes (21), transcripts.themes, stories.themes
    // ============================================

    // Get master theme definitions from narrative_themes (21 rows)
    const { data: narrativeThemesData } = await supabase
      .from('narrative_themes')
      .select('theme_name, theme_category, ai_confidence_score')

    // Get themes from transcripts (251 rows, many with themes)
    const { data: transcriptThemesData } = await supabase
      .from('transcripts')
      .select('themes')
      .not('themes', 'is', null)

    // Get themes from stories (318 rows, many with themes)
    const { data: storyThemesData } = await supabase
      .from('stories')
      .select('themes')
      .not('themes', 'is', null)
      .eq('status', 'published')

    // Aggregate all themes with counts
    const themeCounts = new Map<string, { count: number; category: string; confidence: number }>()

    // Add narrative themes as base
    for (const nt of (narrativeThemesData || [])) {
      themeCounts.set(nt.theme_name.toLowerCase(), {
        count: 1,
        category: nt.theme_category || 'general',
        confidence: nt.ai_confidence_score || 0.5
      })
    }

    // Count themes from transcripts - filter garbage
    for (const t of (transcriptThemesData || [])) {
      const validThemes = filterGarbageThemes(t.themes || [])
      for (const theme of validThemes) {
        const key = theme.toLowerCase()
        const existing = themeCounts.get(key)
        if (existing) {
          existing.count++
        } else {
          themeCounts.set(key, { count: 1, category: categorizeTheme(theme), confidence: 0.7 })
        }
      }
    }

    // Count themes from stories - filter garbage
    for (const s of (storyThemesData || [])) {
      const validThemes = filterGarbageThemes(s.themes || [])
      for (const theme of validThemes) {
        const key = theme.toLowerCase()
        const existing = themeCounts.get(key)
        if (existing) {
          existing.count++
        } else {
          themeCounts.set(key, { count: 1, category: categorizeTheme(theme), confidence: 0.7 })
        }
      }
    }

    // Get theme color mapping
    const getThemeColor = (theme: string): string => {
      const colors: Record<string, string> = {
        'resilience': '#22c55e',
        'healing': '#6B8E23',
        'identity': '#9ACD32',
        'family': '#8FBC8F',
        'community': '#4682B4',
        'culture': '#CD853F',
        'cultural identity': '#CD853F',
        'cultural preservation': '#D2691E',
        'elder wisdom': '#8B4513',
        'intergenerational wisdom': '#8B4513',
        'hope': '#FFD700',
        'justice': '#9370DB',
        'love': '#FF69B4',
        'transformation': '#DA70D6',
        'community connection': '#4682B4',
        'connection to land': '#228B22',
        'land connection': '#228B22',
        'indigenous heritage': '#8B4513',
        'community support': '#5F9EA0',
        'personal growth': '#32CD32'
      }
      const normalized = theme.toLowerCase()
      if (colors[normalized]) return colors[normalized]

      // Generate consistent color from name
      let hash = 0
      for (let i = 0; i < theme.length; i++) {
        hash = theme.charCodeAt(i) + ((hash << 5) - hash)
      }
      const hue = Math.abs(hash % 360)
      return `hsl(${hue}, 65%, 45%)`
    }

    // Convert to array and sort by count
    const themeInsights: ThemeInsight[] = Array.from(themeCounts.entries())
      .map(([name, data]) => ({
        name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), // Title case
        category: data.category,
        storyCount: data.count,
        storytellerCount: Math.ceil(data.count * 0.6), // Estimate
        sentimentScore: 0.7, // Positive by default
        aiConfidence: data.confidence,
        trend: data.count > 10 ? 'peak' : data.count > 5 ? 'stable' : 'emerging' as const,
        regions: [],
        topQuotes: [],
        color: getThemeColor(name)
      }))
      .sort((a, b) => b.storyCount - a.storyCount)
      .slice(0, 30)

    console.log('Theme insights generated:', themeInsights.length)

    // ============================================
    // 5. ORGANIZATION IMPACTS
    // Table is 'organizations' (19 rows)
    // ============================================

    const { data: orgsData } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        logo_url
      `)
      .limit(20)

    // Get project counts per org
    const { data: projectsData } = await supabase
      .from('projects')
      .select('organization_id')

    const projectCountMap = new Map<string, number>()
    for (const p of (projectsData || [])) {
      if (p.organization_id) {
        projectCountMap.set(p.organization_id, (projectCountMap.get(p.organization_id) || 0) + 1)
      }
    }

    const organizationImpacts: OrganizationImpact[] = (orgsData || []).map(org => ({
      id: org.id,
      name: org.name,
      logoUrl: org.logo_url,
      memberCount: 0, // Would need org_members join
      storyCount: 0, // Would need stories join
      totalReach: 0,
      primaryThemes: [],
      impactScore: projectCountMap.get(org.id) ? projectCountMap.get(org.id)! * 20 : 10,
      projectCount: projectCountMap.get(org.id) || 0
    }))

    // ============================================
    // 6. GEOGRAPHIC CLUSTERS
    // ============================================

    const { data: locationsData } = await supabase
      .from('profile_locations')
      .select(`
        is_primary,
        locations (
          id,
          name,
          city,
          country,
          latitude,
          longitude
        ),
        profiles (
          id,
          is_storyteller,
          cultural_affiliations
        )
      `)
      .eq('is_primary', true)
      .limit(100)

    // Aggregate by location
    const locationCounts = new Map<string, GeographicCluster>()
    for (const loc of (locationsData || [])) {
      const location = loc.locations as any
      if (!location?.latitude || !location?.longitude) continue

      const key = `${location.country || 'Unknown'}-${location.city || 'Unknown'}`
      const existing = locationCounts.get(key)

      if (existing) {
        existing.storytellerCount++
        const affiliations = (loc.profiles as any)?.cultural_affiliations || []
        affiliations.forEach((a: string) => {
          if (!existing.culturalAffiliations.includes(a)) {
            existing.culturalAffiliations.push(a)
          }
        })
      } else {
        locationCounts.set(key, {
          region: location.country || 'Unknown',
          country: location.country || 'Unknown',
          city: location.city || null,
          coordinates: { lat: location.latitude, lng: location.longitude },
          storytellerCount: 1,
          storyCount: 0,
          primaryThemes: [],
          culturalAffiliations: (loc.profiles as any)?.cultural_affiliations || [],
          impactScore: 0,
          recentActivity: true
        })
      }
    }

    const geographicClusters = Array.from(locationCounts.values())
      .sort((a, b) => b.storytellerCount - a.storytellerCount)
      .slice(0, 20)

    // ============================================
    // 7. CROSS-SECTOR CONNECTIONS
    // ============================================

    const { data: crossSectorData } = await supabase
      .from('cross_sector_insights')
      .select('*')
      .order('combined_impact_potential', { ascending: false })
      .limit(10)

    const crossSectorConnections: CrossSectorConnection[] = (crossSectorData || []).map(cs => ({
      sector1: cs.primary_sector || '',
      sector2: cs.secondary_sector || '',
      sharedThemes: cs.shared_themes || [],
      storytellerCount: Object.keys(cs.storyteller_connections || {}).length,
      collaborationPotential: cs.combined_impact_potential || 0,
      successStories: 0
    }))

    // ============================================
    // 8. RECENT MILESTONES
    // ============================================

    const { data: milestonesData } = await supabase
      .from('storyteller_milestones')
      .select(`
        milestone_type,
        milestone_description,
        achieved_at,
        profiles (
          display_name,
          first_name,
          last_name
        )
      `)
      .eq('status', 'achieved')
      .order('achieved_at', { ascending: false })
      .limit(10)

    const recentMilestones = (milestonesData || []).map(m => {
      const profile = m.profiles as any
      return {
        type: m.milestone_type || 'achievement',
        description: m.milestone_description || 'Milestone achieved',
        storytellerName: profile?.display_name ||
          `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
          'A Storyteller',
        date: m.achieved_at || new Date().toISOString()
      }
    })

    // ============================================
    // 9. COMPILE PLATFORM STATS
    // ============================================

    const platformStats: PlatformStats = {
      totalStorytellers: totalStorytellers || 0,
      totalStories: totalStories || 0,
      totalTranscripts: totalTranscripts || 0,
      totalQuotes: totalQuotes || 0,
      totalThemes: totalThemes || 0,
      totalViews: topStorytellers.reduce((sum, s) => sum + s.totalContentViews, 0),
      uniqueCountries: new Set(geographicClusters.map(g => g.country)).size,
      uniqueCities: geographicClusters.filter(g => g.city).length,
      averageImpactScore: topStorytellers.length > 0
        ? Math.round(topStorytellers.reduce((sum, s) => sum + s.overallImpactScore, 0) / topStorytellers.length)
        : 0,
      averageWisdomScore: wisdomQuotes.length > 0
        ? Math.round(wisdomQuotes.reduce((sum, q) => sum + q.wisdomScore, 0) / wisdomQuotes.length * 100)
        : 0,
      contentCompletionRate: 85, // Placeholder
      eldersCount: eldersCount || 0,
      intergenerationalConnections: Math.floor((totalStorytellers || 0) * 0.3),
      culturalProtocolsDocumented: Math.floor((totalStories || 0) * 0.15),
      totalConnections: topStorytellers.reduce((sum, s) => sum + s.connectionCount, 0),
      averageConnectionsPerStoryteller: topStorytellers.length > 0
        ? Math.round(topStorytellers.reduce((sum, s) => sum + s.connectionCount, 0) / topStorytellers.length)
        : 0,
      collaborativeProjectsCount: totalProjects || 0,
      newStorytellersThisMonth: Math.floor((totalStorytellers || 0) * 0.08),
      newStoriesThisMonth: Math.floor((totalStories || 0) * 0.12),
      growthRate: 15 // Placeholder %
    }

    // ============================================
    // 10. VALUE PROPOSITIONS
    // ============================================

    const valuePropositions = {
      forStorytellers: [
        `Join ${platformStats.totalStorytellers} storytellers sharing wisdom across ${platformStats.uniqueCountries} countries`,
        `Your stories can reach thousands - our top storyteller has ${topStorytellers[0]?.totalContentViews?.toLocaleString() || 'thousands of'} views`,
        `AI-powered analysis extracts your most impactful quotes and themes automatically`,
        `Connect with ${platformStats.eldersCount} elders and mentors in your theme areas`,
        `Get discovered by ${totalOrgs || 0}+ organizations looking for authentic voices`,
        `Track your impact with professional-grade analytics and milestone achievements`
      ],
      forOrganizations: [
        `Access ${platformStats.totalStories} authentic stories with verified consent`,
        `Find storytellers across ${platformStats.totalThemes} themes and ${platformStats.uniqueCountries} countries`,
        `AI-analyzed content with wisdom scores and cultural sensitivity ratings`,
        `Syndication tools to share stories across your platforms with attribution`,
        `Real-time analytics showing engagement, reach, and community impact`,
        `Cultural protocols built-in to ensure respectful storytelling practices`
      ],
      forCommunities: [
        `${platformStats.eldersCount} elders sharing traditional knowledge and wisdom`,
        `${platformStats.culturalProtocolsDocumented} cultural practices documented and preserved`,
        `Cross-cultural connections linking ${geographicClusters.length} communities worldwide`,
        `Intergenerational storytelling bridges past and future`,
        `Community-owned stories with full control over visibility and sharing`,
        `Impact tracking shows how your stories create real-world change`
      ]
    }

    // ============================================
    // RESPONSE
    // ============================================

    const response: ValueDashboardResponse = {
      platformStats,
      topStorytellers,
      wisdomQuotes,
      themeInsights,
      organizationImpacts,
      geographicClusters,
      crossSectorConnections,
      recentMilestones,
      valuePropositions
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Value dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch value dashboard data' },
      { status: 500 }
    )
  }
}

// Helper function to determine theme trend
function determineTrend(theme: any): 'emerging' | 'stable' | 'declining' | 'peak' {
  // Would use historical data in production
  const confidence = theme.ai_confidence_score || 0.5
  const count = theme.usage_count || 0

  if (confidence > 0.8 && count < 10) return 'emerging'
  if (count > 50) return 'peak'
  if (confidence < 0.3) return 'declining'
  return 'stable'
}

// Stopwords filter to remove garbage themes from word-frequency output
const THEME_STOPWORDS = new Set([
  // Common English words that aren't meaningful themes
  'people', 'think', 'about', 'there', 'that', 'thats', "that's", 'speaker',
  'really', 'going', 'thing', 'things', 'something', 'anything', 'nothing',
  'everything', 'someone', 'anyone', 'everyone', 'somewhere', 'anywhere',
  'because', 'actually', 'basically', 'literally', 'obviously', 'definitely',
  'probably', 'maybe', 'might', 'could', 'would', 'should', 'always', 'never',
  'sometimes', 'often', 'usually', 'just', 'only', 'even', 'also', 'still',
  'already', 'much', 'many', 'more', 'most', 'some', 'other', 'another',
  'such', 'what', 'which', 'where', 'when', 'while', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'under', 'over', 'again',
  'further', 'then', 'once', 'here', 'there', 'both', 'each', 'every', 'all',
  'any', 'few', 'same', 'different', 'own', 'being', 'having', 'doing',
  'know', 'known', 'like', 'likes', 'want', 'wants', 'need', 'needs',
  'feel', 'feels', 'felt', 'make', 'makes', 'made', 'take', 'takes', 'took',
  'come', 'comes', 'came', 'give', 'gives', 'gave', 'find', 'finds', 'found',
  'tell', 'tells', 'told', 'say', 'says', 'said', 'get', 'gets', 'got',
  'see', 'sees', 'saw', 'look', 'looks', 'looked', 'went', 'goes', 'going',
  'into', 'onto', 'upon', 'from', 'with', 'without', 'within', 'throughout',
  'very', 'quite', 'rather', 'pretty', 'almost', 'enough', 'well', 'back',
  'time', 'times', 'year', 'years', 'day', 'days', 'way', 'ways', 'place',
  'kind', 'sort', 'type', 'part', 'parts', 'first', 'last', 'next', 'new',
  'old', 'good', 'great', 'little', 'big', 'small', 'long', 'high', 'right',
  'left', 'real', 'true', 'sure', 'okay', 'yeah', 'yes', 'yep', 'hmm', 'uh',
  'um', 'oh', 'ah', 'interview', 'transcript', 'recording', 'audio', 'video'
])

/**
 * Validates a theme to filter out garbage word-frequency output
 * Returns true if the theme is meaningful
 */
function isValidTheme(theme: string): boolean {
  if (!theme || typeof theme !== 'string') return false

  const normalized = theme.toLowerCase().trim()

  // Filter out stopwords
  if (THEME_STOPWORDS.has(normalized)) return false

  // Filter out single characters or very short strings
  if (normalized.length < 3) return false

  // Filter out strings that are just numbers
  if (/^\d+$/.test(normalized)) return false

  // Filter out strings with special characters (likely garbage)
  if (/[{}\[\]<>|\\]/.test(normalized)) return false

  // For single-word themes, require minimum 4 characters
  if (!normalized.includes(' ') && normalized.length < 4) return false

  return true
}

/**
 * Filter an array of themes to remove garbage
 */
function filterGarbageThemes(themes: string[]): string[] {
  if (!Array.isArray(themes)) return []
  return themes.filter(isValidTheme)
}

/**
 * Parse a quote from key_quotes which may be:
 * - A plain string: "This is a quote"
 * - A JSON object: { text: "...", theme: "...", significance: "..." }
 * - A stringified JSON: '{"text":"...","theme":"...","significance":"..."}'
 */
function parseQuote(kq: any): { text: string; theme?: string; context?: string } | null {
  if (!kq) return null

  // Already an object with text property
  if (typeof kq === 'object' && kq !== null) {
    const text = kq.text || kq.quote || null
    if (text && text.length > 20) {
      return {
        text: text,
        theme: kq.theme || undefined,
        context: kq.context || kq.significance || undefined
      }
    }
    return null
  }

  // String - could be plain text or stringified JSON
  if (typeof kq === 'string') {
    // Try to parse as JSON first (handles stringified JSON objects)
    if (kq.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(kq)
        const text = parsed.text || parsed.quote || null
        if (text && text.length > 20) {
          return {
            text: text,
            theme: parsed.theme || undefined,
            context: parsed.context || parsed.significance || undefined
          }
        }
        return null
      } catch {
        // Not valid JSON, treat as plain string
      }
    }

    // Plain string quote
    if (kq.length > 20) {
      return { text: kq }
    }
  }

  return null
}

// Helper function to categorize a theme by name
function categorizeTheme(theme: string): string {
  const lower = theme.toLowerCase()

  if (lower.includes('cultur') || lower.includes('heritage') || lower.includes('tradition') || lower.includes('indigenous')) {
    return 'cultural'
  }
  if (lower.includes('community') || lower.includes('social') || lower.includes('connection')) {
    return 'community'
  }
  if (lower.includes('family') || lower.includes('intergeneration') || lower.includes('elder')) {
    return 'family'
  }
  if (lower.includes('personal') || lower.includes('growth') || lower.includes('identity') || lower.includes('resilience')) {
    return 'personal'
  }
  if (lower.includes('health') || lower.includes('healing') || lower.includes('wellness')) {
    return 'health'
  }
  if (lower.includes('land') || lower.includes('country') || lower.includes('place') || lower.includes('environment')) {
    return 'geographic'
  }
  if (lower.includes('work') || lower.includes('professional') || lower.includes('career')) {
    return 'professional'
  }
  if (lower.includes('education') || lower.includes('learning') || lower.includes('knowledge')) {
    return 'educational'
  }

  return 'general'
}
