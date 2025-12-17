// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { createAdminClient } from '@/lib/supabase/server'
import { getThemeColor, type MapStory, type ThematicConnection, type TrendingTheme } from '@/app/world-tour/components/types/map-types'

// Extended types for richer data
interface MapStoryteller {
  id: string
  name: string
  avatarUrl: string | null
  location: string | null
  isElder: boolean
  isFeatured: boolean
  impactScore: number
  storyCount: number
  communityRoles: string[]
  visibility: string
}

interface EnhancedMapStory extends MapStory {
  storyteller: MapStoryteller
  aiAnalysis?: {
    sentiment: number
    confidence: number
    keyInsights: string[]
  }
  hasTranscript: boolean
  transcriptAnalyzed: boolean
  isPublic: boolean
  consentVerified: boolean
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    // Use admin client for queries that need to bypass RLS for accurate counts
    const adminClient = createAdminClient()

    // Fetch tour stops (confirmed locations)
    const { data: stops, error: stopsError } = await supabase
      .from('tour_stops')
      .select('*')
      .order('date_start', { ascending: true })

    if (stopsError) {
      console.error('Error fetching tour stops:', stopsError)
    }

    // Fetch tour requests (community nominations) - only ones with coordinates
    const { data: requests, error: requestsError } = await supabase
      .from('tour_requests')
      .select('id, location_text, city, country, latitude, longitude, name, why_visit, status, created_at')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('Error fetching tour requests:', requestsError)
    }

    // Anonymize requests - first name only, truncate why_visit
    const anonymizedRequests = (requests || []).map(req => ({
      id: req.id,
      location_text: req.location_text,
      city: req.city,
      country: req.country,
      latitude: req.latitude,
      longitude: req.longitude,
      name: req.name?.split(' ')[0] || 'Anonymous',
      why_visit: req.why_visit?.substring(0, 150) + (req.why_visit?.length > 150 ? '...' : '') || '',
      status: req.status
    }))

    // Fetch dream organizations
    const { data: dreamOrgs, error: dreamOrgsError } = await supabase
      .from('dream_organizations')
      .select('*')
      .order('priority', { ascending: true })

    if (dreamOrgsError) {
      console.error('Error fetching dream organizations:', dreamOrgsError)
    }

    // ============================================
    // STORYTELLERS WITH LOCATIONS & IMPACT DATA
    // ============================================

    // Fetch storytellers using admin client to bypass RLS for accurate counts
    const { data: storytellersWithLocations, error: storytellerError } = await adminClient
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        display_name,
        profile_image_url,
        location,
        is_storyteller,
        is_elder,
        is_featured,
        profile_visibility,
        community_roles,
        impact_focus_areas,
        expertise_areas,
        cultural_affiliations,
        bio,
        profile_locations (
          is_primary,
          locations (
            id,
            latitude,
            longitude,
            name,
            city,
            country
          )
        )
      `)
      .eq('is_storyteller', true)
      .in('profile_visibility', ['public', 'community'])
      .limit(200)

    if (storytellerError) {
      console.error('Error fetching storytellers:', storytellerError)
    }

    // Fetch storyteller impact metrics
    const storytellerIds = (storytellersWithLocations || []).map(s => s.id)
    let impactMetrics: Record<string, any> = {}

    if (storytellerIds.length > 0) {
      const { data: metrics } = await supabase
        .from('storyteller_impact_metrics')
        .select('*')
        .in('profile_id', storytellerIds)

      if (metrics) {
        for (const m of metrics) {
          impactMetrics[m.profile_id] = m
        }
      }
    }

    // ============================================
    // STORIES WITH AI ANALYSIS & CONSENT STATUS
    // ============================================

    // Fetch published stories using admin client to bypass RLS for accurate counts
    const { data: allStories, error: storiesError } = await adminClient
      .from('stories')
      .select(`
        id,
        title,
        content,
        storyteller_id,
        transcript_id,
        created_at,
        status,
        has_explicit_consent,
        consent_details,
        profiles!stories_storyteller_id_fkey (
          id,
          first_name,
          last_name,
          display_name,
          profile_image_url,
          location,
          is_elder,
          is_featured,
          profile_visibility,
          community_roles,
          profile_locations (
            is_primary,
            locations (
              latitude,
              longitude,
              name,
              city,
              country
            )
          )
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(500)

    if (storiesError) {
      console.error('Error fetching stories:', storiesError)
    }

    // ============================================
    // AI ANALYZED THEMES FROM narrative_themes
    // ============================================

    const { data: aiThemes, error: aiThemesError } = await supabase
      .from('narrative_themes')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(100)

    if (aiThemesError) {
      console.error('Error fetching AI themes:', aiThemesError)
    }

    // ============================================
    // TRANSCRIPTS WITH ANALYSIS STATUS
    // ============================================

    // Fetch ALL transcripts to get accurate metrics (bypasses RLS via adminClient)
    const { data: allTranscripts } = await adminClient
      .from('transcripts')
      .select('id, ai_processing_status, themes, storyteller_id')

    // Calculate transcript-level metrics
    const allTranscriptThemes = new Set<string>()
    let totalAnalyzedTranscripts = 0
    let totalTranscriptCount = allTranscripts?.length || 0

    for (const t of (allTranscripts || [])) {
      // Count analyzed
      const isAnalyzed = t.ai_processing_status === 'completed' ||
                        t.ai_processing_status === 'deep_analyzed' ||
                        (t.themes && t.themes.length > 0)
      if (isAnalyzed) totalAnalyzedTranscripts++

      // Collect all themes
      for (const theme of (t.themes || [])) {
        allTranscriptThemes.add(theme.toLowerCase())
      }
    }

    // Stories have transcript_id field - get the transcript IDs from stories
    const transcriptIds = (allStories || [])
      .map(s => s.transcript_id)
      .filter(Boolean) as string[]

    let transcriptStatus: Record<string, { hasTranscript: boolean; analyzed: boolean; themes: string[] }> = {}

    // Create a map of transcript_id -> status and themes from allTranscripts
    const transcriptMap = new Map<string, { analyzed: boolean; themes: string[] }>()
    if (allTranscripts) {
      for (const t of allTranscripts) {
        // Consider 'completed' or 'deep_analyzed' as analyzed
        const isAnalyzed = t.ai_processing_status === 'completed' ||
                          t.ai_processing_status === 'deep_analyzed' ||
                          (t.themes && t.themes.length > 0)
        transcriptMap.set(t.id, {
          analyzed: isAnalyzed,
          themes: t.themes || []
        })
      }
    }

    // Now map back to stories by their transcript_id
    for (const story of (allStories || [])) {
      if (story.transcript_id && transcriptMap.has(story.transcript_id)) {
        const tData = transcriptMap.get(story.transcript_id)!
        transcriptStatus[story.id] = {
          hasTranscript: true,
          analyzed: tData.analyzed,
          themes: tData.themes
        }
      }
    }

    // ============================================
    // EXTRACTED QUOTES
    // ============================================

    const storyIds = (allStories || []).map(s => s.id)
    let storyQuotes: Record<string, string[]> = {}
    if (storyIds.length > 0) {
      const { data: quotes } = await supabase
        .from('extracted_quotes')
        .select('story_id, quote_text, impact_score')
        .in('story_id', storyIds)
        .order('impact_score', { ascending: false })
        .limit(200)

      if (quotes) {
        for (const q of quotes) {
          if (!storyQuotes[q.story_id]) storyQuotes[q.story_id] = []
          if (storyQuotes[q.story_id].length < 3) {
            storyQuotes[q.story_id].push(q.quote_text)
          }
        }
      }
    }

    // ============================================
    // BUILD LOCATION LOOKUP MAPS
    // ============================================

    // Build storyteller location map from profile_locations
    const storytellerCoords: Record<string, { lat: number; lng: number; name: string }> = {}
    for (const storyteller of (storytellersWithLocations || [])) {
      const primaryLoc = storyteller.profile_locations?.find((pl: any) => pl.is_primary)
      if (primaryLoc?.locations) {
        const loc = primaryLoc.locations as any
        if (loc.latitude && loc.longitude) {
          storytellerCoords[storyteller.id] = {
            lat: loc.latitude,
            lng: loc.longitude,
            name: loc.name || loc.city || loc.country || 'Unknown'
          }
        }
      }
    }

    // Fetch media with coordinates for stories that have linked_media
    const mediaIds = (allStories || [])
      .flatMap(s => s.linked_media || [])
      .filter(Boolean)

    let mediaWithCoords: Record<string, { lat: number; lng: number; name: string }> = {}
    if (mediaIds.length > 0) {
      const { data: media } = await supabase
        .from('media')
        .select('id, latitude, longitude, location_name')
        .in('id', mediaIds.slice(0, 100))
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      if (media) {
        for (const m of media) {
          mediaWithCoords[m.id] = {
            lat: m.latitude,
            lng: m.longitude,
            name: m.location_name || 'Unknown'
          }
        }
      }
    }

    // ============================================
    // TRANSFORM STORIES TO MAP FORMAT
    // ============================================

    const mapStories: EnhancedMapStory[] = (allStories || [])
      .map(story => {
        let coords: { lat: number; lng: number; name: string } | null = null
        const profile = story.profiles as any

        // Priority 1: Get location from profile.location JSON field (most common format)
        if (!coords && profile?.location) {
          try {
            const loc = typeof profile.location === 'string' ? JSON.parse(profile.location) : profile.location
            if (loc?.lat && (loc?.lng || loc?.lon)) {
              coords = {
                lat: parseFloat(loc.lat),
                lng: parseFloat(loc.lng || loc.lon),
                name: loc.name || loc.city || 'Unknown'
              }
            }
          } catch {
            // Location might be a plain string, not JSON
          }
        }

        // Priority 2: Get location from profile_locations join table
        if (!coords && profile?.profile_locations) {
          const primaryLoc = profile.profile_locations.find((pl: any) => pl.is_primary)
          if (primaryLoc?.locations?.latitude && primaryLoc?.locations?.longitude) {
            coords = {
              lat: primaryLoc.locations.latitude,
              lng: primaryLoc.locations.longitude,
              name: primaryLoc.locations.name || primaryLoc.locations.city || 'Unknown'
            }
          }
          // If no primary, try any location
          if (!coords && profile.profile_locations.length > 0) {
            const anyLoc = profile.profile_locations[0]?.locations
            if (anyLoc?.latitude && anyLoc?.longitude) {
              coords = {
                lat: anyLoc.latitude,
                lng: anyLoc.longitude,
                name: anyLoc.name || anyLoc.city || 'Unknown'
              }
            }
          }
        }

        // Priority 3: Fallback to pre-computed storyteller coords
        if (!coords && story.storyteller_id && storytellerCoords[story.storyteller_id]) {
          coords = storytellerCoords[story.storyteller_id]
        }

        // No coordinates found - mark for "without location" list
        if (!coords) {
          return {
            id: story.id,
            title: story.title || 'Untitled Story',
            excerpt: story.content?.substring(0, 200) || '',
            storyteller: {
              id: profile?.id || story.storyteller_id || '',
              name: profile?.display_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Anonymous',
              avatarUrl: profile?.profile_image_url || null,
              location: profile?.location || null,
              isElder: profile?.is_elder || false
            },
            createdAt: story.created_at,
            hasNoLocation: true  // Flag to identify these stories
          } as any
        }

        const metrics = story.storyteller_id ? impactMetrics[story.storyteller_id] : null
        const transcript = transcriptStatus[story.id]

        // Get themes from transcript if available
        const storyThemes = transcript?.themes || []

        // Check consent - published stories are considered consented
        // Use has_explicit_consent field if available
        const hasConsent = story.has_explicit_consent !== false // null/undefined/true = consented

        // Calculate overall impact score
        const impactScore = metrics ? Math.round(
          (metrics.community_engagement_score || 0) * 0.3 +
          (metrics.cultural_preservation_score || 0) * 0.3 +
          (metrics.system_change_influence_score || 0) * 0.2 +
          (metrics.mentorship_impact_score || 0) * 0.1 +
          (metrics.cross_sector_collaboration_score || 0) * 0.1
        ) : 0

        return {
          id: story.id,
          title: story.title || 'Untitled Story',
          excerpt: story.content?.substring(0, 200) || '',
          themes: storyThemes,
          dominantTheme: storyThemes[0] || 'story',
          location: coords,
          storyteller: {
            id: profile?.id || story.storyteller_id || '',
            name: profile?.display_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Anonymous',
            avatarUrl: profile?.profile_image_url || null,
            location: profile?.location || null,
            isElder: profile?.is_elder || false,
            isFeatured: profile?.is_featured || false,
            impactScore,
            storyCount: metrics?.stories_created_count || 1,
            communityRoles: profile?.community_roles || [],
            visibility: profile?.profile_visibility || 'private'
          },
          keyQuotes: storyQuotes[story.id] || [],
          createdAt: story.created_at,
          culturalSensitivity: 'standard',
          hasTranscript: transcript?.hasTranscript || false,
          transcriptAnalyzed: transcript?.analyzed || false,
          isPublic: true,
          consentVerified: hasConsent
        }
      })

    // Separate stories with and without locations
    const storiesWithLocations = mapStories.filter((story): story is EnhancedMapStory =>
      story !== null && !story.hasNoLocation
    )
    const storiesWithoutLocations = mapStories.filter(story =>
      story !== null && story.hasNoLocation
    )

    // ============================================
    // ADD STORYTELLERS AS SEPARATE LAYER
    // ============================================

    const mapStorytellers = (storytellersWithLocations || [])
      .filter(s => storytellerCoords[s.id])
      .map(storyteller => {
        const coords = storytellerCoords[storyteller.id]
        const metrics = impactMetrics[storyteller.id]

        const impactScore = metrics ? Math.round(
          (metrics.community_engagement_score || 0) * 0.3 +
          (metrics.cultural_preservation_score || 0) * 0.3 +
          (metrics.system_change_influence_score || 0) * 0.2 +
          (metrics.mentorship_impact_score || 0) * 0.1 +
          (metrics.cross_sector_collaboration_score || 0) * 0.1
        ) : 0

        return {
          id: storyteller.id,
          name: storyteller.display_name || `${storyteller.first_name || ''} ${storyteller.last_name || ''}`.trim() || 'Anonymous',
          avatarUrl: storyteller.profile_image_url,
          location: coords,
          locationName: coords.name,
          isElder: storyteller.is_elder || false,
          isFeatured: storyteller.is_featured || false,
          impactScore,
          storyCount: metrics?.stories_created_count || 0,
          communityRoles: storyteller.community_roles || [],
          impactFocusAreas: storyteller.impact_focus_areas || [],
          expertiseAreas: storyteller.expertise_areas || [],
          culturalAffiliations: storyteller.cultural_affiliations || [],
          bio: storyteller.bio?.substring(0, 200) || '',
          visibility: storyteller.profile_visibility,
          metrics: metrics ? {
            communityEngagement: metrics.community_engagement_score,
            culturalPreservation: metrics.cultural_preservation_score,
            systemChangeInfluence: metrics.system_change_influence_score,
            mentorshipImpact: metrics.mentorship_impact_score,
            crossSectorCollaboration: metrics.cross_sector_collaboration_score,
            communitiesReached: metrics.communities_reached_count,
            documentedOutcomes: metrics.documented_outcomes || []
          } : null
        }
      })

    // ============================================
    // FALLBACK TO DEMO DATA IF NO REAL DATA
    // ============================================

    if (storiesWithLocations.length === 0 && mapStorytellers.length === 0) {
      // Use demo data fallback (keeping existing demo logic but shortened)
      const demoLocations = [
        { lat: -33.8688, lng: 151.2093, name: 'Sydney, Australia', region: 'Australia' },
        { lat: -37.8136, lng: 144.9631, name: 'Melbourne, Australia', region: 'Australia' },
        { lat: -23.6980, lng: 133.8807, name: 'Alice Springs, Australia', region: 'Australia' },
        { lat: 40.7128, lng: -74.0060, name: 'New York, USA', region: 'North America' },
        { lat: 51.5074, lng: -0.1278, name: 'London, UK', region: 'Europe' },
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan', region: 'Asia' },
      ]

      const demoThemes = [
        ['resilience', 'family', 'heritage', 'community'],
        ['identity', 'culture', 'tradition', 'belonging'],
        ['healing', 'growth', 'transformation', 'wisdom'],
      ]

      // Use real stories without coords, place them on demo locations
      const storiesWithoutCoords = (allStories || []).slice(0, 20)

      for (let i = 0; i < Math.max(storiesWithoutCoords.length, 6); i++) {
        const story = storiesWithoutCoords[i]
        const location = demoLocations[i % demoLocations.length]
        const themeSet = demoThemes[i % demoThemes.length]
        const profile = story?.profiles as any

        const latOffset = (Math.random() - 0.5) * 2
        const lngOffset = (Math.random() - 0.5) * 2

        storiesWithLocations.push({
          id: story?.id || `demo-${i}`,
          title: story?.title || `Demo Story ${i + 1}`,
          excerpt: story?.summary || 'This is a demonstration story showing how stories appear on the map.',
          themes: story?.themes?.length ? story.themes : themeSet,
          dominantTheme: story?.themes?.[0] || themeSet[0],
          location: {
            lat: location.lat + latOffset,
            lng: location.lng + lngOffset,
            name: location.name
          },
          storyteller: {
            id: profile?.id || `demo-storyteller-${i}`,
            name: profile?.display_name || 'Demo Storyteller',
            avatarUrl: profile?.profile_image_url || null,
            location: location.region,
            isElder: false,
            isFeatured: false,
            impactScore: Math.floor(Math.random() * 50) + 30,
            storyCount: 1,
            communityRoles: [],
            visibility: 'public'
          },
          keyQuotes: story?.id && storyQuotes[story.id] ? storyQuotes[story.id] : ['Every story matters.'],
          createdAt: story?.created_at || new Date().toISOString(),
          culturalSensitivity: story?.cultural_sensitivity_level || 'standard',
          hasTranscript: false,
          transcriptAnalyzed: false,
          isPublic: true,
          consentVerified: true
        })
      }
    }

    // ============================================
    // CALCULATE THEMATIC CONNECTIONS
    // ============================================

    const thematicConnections: ThematicConnection[] = []
    const connectionMap = new Map<string, ThematicConnection>()

    for (let i = 0; i < storiesWithLocations.length; i++) {
      for (let j = i + 1; j < storiesWithLocations.length; j++) {
        const storyA = storiesWithLocations[i]
        const storyB = storiesWithLocations[j]

        const sharedThemes = storyA.themes.filter(theme =>
          storyB.themes.some(t => t.toLowerCase() === theme.toLowerCase())
        )

        if (sharedThemes.length >= 2) {
          const maxThemes = Math.max(storyA.themes.length, storyB.themes.length)
          const strength = sharedThemes.length / maxThemes

          const key = [storyA.id, storyB.id].sort().join('-')

          if (!connectionMap.has(key)) {
            connectionMap.set(key, {
              sourceId: storyA.id,
              targetId: storyB.id,
              sourceCoords: [storyA.location.lat, storyA.location.lng],
              targetCoords: [storyB.location.lat, storyB.location.lng],
              sharedThemes,
              strength
            })
          }
        }
      }
    }

    thematicConnections.push(...connectionMap.values())
    thematicConnections.sort((a, b) => b.strength - a.strength)
    thematicConnections.splice(50)

    // ============================================
    // TRENDING THEMES (Prefer AI-analyzed)
    // ============================================

    const themeFrequency = new Map<string, { count: number; regions: Set<string>; sentiment?: number; confidence?: number }>()

    // Add AI-analyzed themes first
    for (const aiTheme of (aiThemes || [])) {
      themeFrequency.set(aiTheme.theme_name.toLowerCase(), {
        count: aiTheme.usage_count || 0,
        regions: new Set(),
        sentiment: aiTheme.sentiment_score,
        confidence: aiTheme.ai_confidence_score
      })
    }

    // Add themes from stories
    for (const story of storiesWithLocations) {
      const region = story.location.name
      for (const theme of story.themes) {
        const normalized = theme.toLowerCase()
        const existing = themeFrequency.get(normalized) || { count: 0, regions: new Set() }
        existing.count++
        existing.regions.add(region)
        themeFrequency.set(normalized, existing)
      }
    }

    const trendingThemes: TrendingTheme[] = Array.from(themeFrequency.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        trend: 'stable' as const,
        velocity: 0,
        regions: Array.from(data.regions),
        isNew: false,
        color: getThemeColor(name),
        sentiment: data.sentiment,
        confidence: data.confidence
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30)

    // Build theme color map
    const allThemes = new Set<string>()
    for (const story of storiesWithLocations) {
      for (const theme of story.themes) {
        allThemes.add(theme.toLowerCase())
      }
    }

    const themeColorMap: Record<string, string> = {}
    for (const theme of allThemes) {
      themeColorMap[theme] = getThemeColor(theme)
    }

    // ============================================
    // CALCULATE COMPREHENSIVE STATS
    // ============================================

    const stats = {
      totalStops: stops?.length || 0,
      confirmedStops: stops?.filter(s => s.status === 'confirmed' || s.status === 'in_progress').length || 0,
      completedStops: stops?.filter(s => s.status === 'completed').length || 0,
      totalRequests: requests?.length || 0,
      totalDreamOrgs: dreamOrgs?.length || 0,
      // Stories on map (with locations)
      totalStories: storiesWithLocations.length,
      totalStoriesWithoutLocation: storiesWithoutLocations.length,
      // Total published stories (regardless of location)
      totalPublishedStories: allStories?.length || 0,
      // Storytellers on map (with locations)
      totalStorytellers: mapStorytellers.length,
      countriesRequested: [...new Set(requests?.map(r => r.country).filter(Boolean))].length,
      // TRANSCRIPT-LEVEL METRICS (from all transcripts, not just story-linked)
      totalTranscripts: totalTranscriptCount,
      analyzedTranscripts: totalAnalyzedTranscripts,
      uniqueThemes: allTranscriptThemes.size, // Themes from ALL transcripts
      // Story-level metrics
      storiesWithTranscripts: storiesWithLocations.filter(s => s.hasTranscript).length,
      eldersCount: mapStorytellers.filter(s => s.isElder).length,
      featuredStorytellers: mapStorytellers.filter(s => s.isFeatured).length,
      averageImpactScore: mapStorytellers.length > 0
        ? Math.round(mapStorytellers.reduce((sum, s) => sum + s.impactScore, 0) / mapStorytellers.length)
        : 0,
      consentVerifiedStories: storiesWithLocations.filter(s => s.consentVerified).length,
      publicStories: storiesWithLocations.filter(s => s.isPublic).length,
      aiAnalyzedThemes: aiThemes?.length || 0
    }

    return NextResponse.json({
      stops: stops || [],
      requests: anonymizedRequests,
      dreamOrgs: dreamOrgs || [],
      stories: storiesWithLocations,
      storiesWithoutLocation: storiesWithoutLocations,
      storytellers: mapStorytellers,
      thematicConnections,
      trendingThemes,
      themeColorMap,
      stats
    })

  } catch (error) {
    console.error('Map data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch map data' },
      { status: 500 }
    )
  }
}
