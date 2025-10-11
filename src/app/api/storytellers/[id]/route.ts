import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params

    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Fetch comprehensive storyteller profile with all related data
    const [
      profileResult,
      storiesResult,
      transcriptsResult,
      organizationsResult,
      projectsResult,
      galleriesResult,
      mediaResult,
      impactMetricsResult,
      analysisResult,
      quotesResult
    ] = await Promise.all([
      // 1. Core profile data
      supabase
        .from('profiles')
        .select(`
          *,
          profile_locations(
            locations(*)
          )
        `)
        .eq('id', storytellerId)
        .single(),

      // 2. Stories with full metadata
      supabase
        .from('stories')
        .select(`
          *,
          projects:project_id(
            id,
            name,
            description,
            organization_id
          )
        `)
        .eq('author_id', storytellerId)
        .order('created_at', { ascending: false }),

      // 3. Transcripts with analysis
      supabase
        .from('transcripts')
        .select(`
          *,
          projects:project_id(
            id,
            name,
            organization_id
          )
        `)
        .eq('storyteller_id', storytellerId)
        .order('created_at', { ascending: false }),

      // 4. Organization memberships
      supabase
        .from('profile_organizations')
        .select(`
          *,
          organisations(
            id,
            name,
            display_name,
            description,
            website_url,
            logo_url,
            sector_focus,
            organization_type
          )
        `)
        .eq('profile_id', storytellerId)
        .eq('is_active', true),

      // 5. Project participations
      supabase
        .from('profile_projects')
        .select(`
          *,
          projects(
            id,
            name,
            description,
            status,
            start_date,
            end_date,
            organization_id,
            organisations(name, display_name)
          )
        `)
        .eq('profile_id', storytellerId)
        .eq('is_active', true),

      // 6. Gallery associations
      supabase
        .from('galleries')
        .select(`
          *,
          organisations(name, display_name)
        `)
        .eq('created_by', storytellerId)
        .order('created_at', { ascending: false }),

      // 7. Media assets
      supabase
        .from('media_assets')
        .select(`
          id,
          display_name,
          description,
          media_type,
          file_size,
          duration,
          cultural_sensitivity_level,
          created_at,
          view_count,
          download_count
        `)
        .eq('created_by', storytellerId)
        .order('created_at', { ascending: false })
        .limit(20),

      // 8. Impact metrics
      supabase
        .from('storyteller_impact_metrics')
        .select('*')
        .eq('storyteller_id', storytellerId)
        .order('measurement_period_end', { ascending: false })
        .limit(1),

      // 9. AI analysis results
      supabase
        .from('analysis_jobs')
        .select(`
          id,
          job_type,
          status,
          results_data,
          completed_at,
          ai_model_used
        `)
        .eq('profile_id', storytellerId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false }),

      // 10. Extracted quotes
      supabase
        .from('extracted_quotes')
        .select(`
          id,
          quote_text,
          context,
          themes,
          sentiment,
          impact_score,
          source_type,
          created_at
        `)
        .eq('author_id', storytellerId)
        .order('impact_score', { ascending: false })
        .limit(10)
    ])

    if (profileResult.error) {
      if (profileResult.error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Storyteller not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching storyteller profile:', profileResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch storyteller profile' },
        { status: 500 }
      )
    }

    const profile = profileResult.data
    const stories = storiesResult.data || []
    const transcripts = transcriptsResult.data || []
    const organisations = organizationsResult.data || []
    const projects = projectsResult.data || []
    const galleries = galleriesResult.data || []
    const mediaAssets = mediaResult.data || []
    const impactMetrics = impactMetricsResult.data?.[0] || null
    const analysisJobs = analysisResult.data || []
    const quotes = quotesResult.data || []

    // Helper functions for data processing
    const extractThemesFromContent = (stories: any[], transcripts: any[]): string[] => {
      const allThemes = new Set<string>()

      // From stories
      stories.forEach(story => {
        if (story.themes) {
          story.themes.forEach((theme: string) => allThemes.add(theme))
        }
        if (story.cultural_tags) {
          story.cultural_tags.forEach((tag: string) => allThemes.add(tag))
        }
      })

      // From transcripts cultural context
      transcripts.forEach(transcript => {
        if (transcript.cultural_context?.themes) {
          transcript.cultural_context.themes.forEach((theme: string) => allThemes.add(theme))
        }
      })

      // From quotes
      quotes.forEach(quote => {
        if (quote.themes) {
          quote.themes.forEach((theme: string) => allThemes.add(theme))
        }
      })

      return Array.from(allThemes)
    }

    const calculateEngagementMetrics = () => {
      const totalViews = stories.reduce((sum, story) => sum + (story.view_count || 0), 0)
      const totalShares = stories.reduce((sum, story) => sum + (story.share_count || 0), 0)
      const avgStoryLength = stories.length > 0
        ? stories.reduce((sum, story) => sum + (story.length || 0), 0) / stories.length
        : 0

      return {
        total_views: totalViews,
        total_shares: totalShares,
        avg_story_length: Math.round(avgStoryLength),
        engagement_rate: stories.length > 0 ? (totalViews + totalShares) / stories.length : 0
      }
    }

    const getLatestAnalysisInsights = () => {
      if (analysisJobs.length === 0) return null

      const recentAnalysis = analysisJobs[0]
      return {
        analysis_type: recentAnalysis.job_type,
        completion_date: recentAnalysis.completed_at,
        insights: recentAnalysis.results_data,
        ai_model: recentAnalysis.ai_model_used
      }
    }

    // Build comprehensive storyteller profile
    const themes = extractThemesFromContent(stories, transcripts)
    const engagementMetrics = calculateEngagementMetrics()
    const latestInsights = getLatestAnalysisInsights()

    let resolvedAvatarUrl = profile.profile_image_url || profile.avatar_url || null

    if (!resolvedAvatarUrl && profile.avatar_media_id) {
      const { data: avatarMedia, error: avatarError } = await supabase
        .from('media_assets')
        .select('cdn_url')
        .eq('id', profile.avatar_media_id)
        .single()

      if (avatarError) {
        console.error('⚠️  Failed to resolve avatar media asset:', avatarError)
      } else if (avatarMedia?.cdn_url) {
        resolvedAvatarUrl = avatarMedia.cdn_url
      }
    }

    const comprehensiveStorytellerProfile = {
      // Core profile information
      id: profile.id,
      display_name: profile.display_name || profile.preferred_name || 'Unknown Storyteller',
      bio: profile.bio,
      cultural_background: profile.cultural_background,
      cultural_affiliations: profile.cultural_affiliations,
      languages_spoken: profile.languages_spoken,
      specialties: themes,
      years_of_experience: null, // Could be calculated from earliest story/transcript date
      preferred_topics: profile.interests || [],
      status: 'active' as const,
      elder_status: false, // Could be derived from age or community recognition
      featured: stories.length > 0 || impactMetrics?.community_engagement_score > 70,
      avatar_url: resolvedAvatarUrl,

      // Enhanced profile data
      profile: {
        avatar_url: resolvedAvatarUrl,
        profile_image_url: resolvedAvatarUrl,
        pronouns: profile.preferred_pronouns,
        phone: profile.phone_number,
        social_links: profile.social_links,
        preferred_communication: profile.preferred_communication,
        occupation: profile.current_role,
        timezone: profile.timezone,
        locations: profile.profile_locations?.map((pl: any) => pl.locations) || [],
        created_at: profile.created_at,
        last_active: profile.last_sign_in_at
      },

      // Content statistics
      content_stats: {
        story_count: stories.length,
        transcript_count: transcripts.length,
        gallery_count: galleries.length,
        media_count: mediaAssets.length,
        quote_count: quotes.length,
        total_content_pieces: stories.length + transcripts.length + galleries.length
      },

      // Stories collection with metadata
      stories: stories.map(story => ({
        id: story.id,
        title: story.title,
        description: story.description,
        content: story.content?.substring(0, 500) + '...', // Truncated for API response
        themes: story.themes || [],
        cultural_tags: story.cultural_tags || [],
        created_at: story.created_at,
        published_at: story.published_at,
        is_featured: story.is_featured,
        language: story.language,
        cultural_sensitivity_level: story.cultural_sensitivity_level,
        project: story.projects ? {
          id: story.projects.id,
          name: story.projects.name,
          organization_id: story.projects.organization_id
        } : null
      })),

      // Transcripts with analysis
      transcripts: transcripts.map(transcript => ({
        id: transcript.id,
        title: transcript.title,
        status: transcript.status,
        created_at: transcript.created_at,
        word_count: transcript.word_count,
        metadata: transcript.metadata,
        organisation: transcript.organisation,
        storyteller: transcript.storyteller,
        transcript_content: transcript.transcript_content?.substring(0, 500) + '...', // Truncated
        project: transcript.projects ? {
          id: transcript.projects.id,
          name: transcript.projects.name,
          organization_id: transcript.projects.organization_id
        } : null
      })),

      // Organization memberships and roles
      organisations: organisations.map(org => ({
        id: org.organisations.id,
        name: org.organisations.name,
        display_name: org.organisations.display_name,
        description: org.organisations.description,
        website_url: org.organisations.website_url,
        logo_url: org.organisations.logo_url,
        sector_focus: org.organisations.sector_focus,
        organization_type: org.organisations.organization_type,
        role: org.role,
        joined_at: org.joined_at,
        is_active: org.is_active
      })),

      // Project participations
      projects: projects.map(proj => ({
        id: proj.projects.id,
        name: proj.projects.name,
        description: proj.projects.description,
        status: proj.projects.status,
        start_date: proj.projects.start_date,
        end_date: proj.projects.end_date,
        organization_id: proj.projects.organization_id,
        role: proj.role,
        joined_at: proj.joined_at
      })),

      // Media galleries
      galleries: galleries.map(gallery => ({
        id: gallery.id,
        title: gallery.title,
        description: gallery.description,
        photo_count: gallery.photo_count,
        cover_image: gallery.cover_image,
        cultural_theme: gallery.cultural_theme,
        cultural_significance: gallery.cultural_significance,
        created_at: gallery.created_at,
        organization_id: gallery.organization_id
      })),

      // Media assets
      media_assets: mediaAssets.map(asset => ({
        id: asset.id,
        display_name: asset.display_name,
        description: asset.description,
        media_type: asset.media_type,
        file_size: asset.file_size,
        duration: asset.duration,
        cultural_sensitivity_level: asset.cultural_sensitivity_level,
        created_at: asset.created_at,
        view_count: asset.view_count,
        download_count: asset.download_count
      })),

      // Impact metrics and analytics
      impact_metrics: impactMetrics ? {
        community_engagement_score: impactMetrics.community_engagement_score,
        cultural_preservation_score: impactMetrics.cultural_preservation_score,
        system_change_influence_score: impactMetrics.system_change_influence_score,
        mentorship_impact_score: impactMetrics.mentorship_impact_score,
        cross_sector_collaboration_score: impactMetrics.cross_sector_collaboration_score,
        stories_created_count: impactMetrics.stories_created_count,
        transcripts_analyzed_count: impactMetrics.transcripts_analyzed_count,
        communities_reached_count: impactMetrics.communities_reached_count,
        organizations_collaborated_count: impactMetrics.organizations_collaborated_count,
        mentees_supported_count: impactMetrics.mentees_supported_count,
        speaking_engagements_count: impactMetrics.speaking_engagements_count,
        documented_outcomes: impactMetrics.documented_outcomes,
        policy_influences: impactMetrics.policy_influences,
        community_feedback: impactMetrics.community_feedback,
        measurement_period: {
          start: impactMetrics.measurement_period_start,
          end: impactMetrics.measurement_period_end
        }
      } : null,

      // Engagement metrics
      engagement_metrics: engagementMetrics,

      // AI analysis insights
      ai_insights: latestInsights,

      // Featured quotes and highlights
      featured_quotes: quotes.map(quote => ({
        id: quote.id,
        text: quote.quote_text,
        context: quote.context,
        themes: quote.themes,
        sentiment: quote.sentiment,
        impact_score: quote.impact_score,
        source_type: quote.source_type,
        created_at: quote.created_at
      })),

      // Network and connections summary
      network_summary: {
        organization_count: organisations.length,
        project_count: projects.length,
        active_collaborations: projects.filter(p => p.projects.status === 'active').length,
        cross_sector_reach: [...new Set(organisations.map(o => o.organisations.sector_focus))].filter(Boolean).length
      },

      // Activity timeline markers
      activity_timeline: {
        first_story: stories.length > 0 ? stories[stories.length - 1].created_at : null,
        latest_story: stories.length > 0 ? stories[0].created_at : null,
        first_transcript: transcripts.length > 0 ? transcripts[transcripts.length - 1].created_at : null,
        latest_transcript: transcripts.length > 0 ? transcripts[0].created_at : null,
        profile_created: profile.created_at,
        last_active: profile.last_sign_in_at
      }
    }

    return NextResponse.json(comprehensiveStorytellerProfile)

  } catch (error) {
    console.error('Comprehensive storyteller API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params
    const body = await request.json()
    
    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Extract storyteller fields vs profile fields
    const storytellerFields = {
      display_name: body.display_name,
      bio: body.bio,
      cultural_background: body.cultural_background,
      specialties: body.specialties,
      years_of_experience: body.years_of_experience,
      preferred_topics: body.preferred_topics,
      featured: body.featured,
      status: body.status,
      availability: body.availability,
      cultural_protocols: body.cultural_protocols,
      elder_status: body.elder_status,
      community_recognition: body.community_recognition,
      storytelling_style: body.storytelling_style,
      performance_preferences: body.performance_preferences,
      compensation_preferences: body.compensation_preferences,
      travel_availability: body.travel_availability,
      technical_requirements: body.technical_requirements
    }

    // Filter out undefined values
    const filteredStorytellerFields = Object.fromEntries(
      Object.entries(storytellerFields).filter(([_, v]) => v !== undefined)
    )

    // Update storyteller
    const { data: storyteller, error } = await supabase
      .from('storytellers')
      .update({
        ...filteredStorytellerFields,
        updated_at: new Date().toISOString()
      })
      .eq('id', storytellerId)
      .select(`
        *,
        profile:profiles(
          avatar_url,
          cultural_affiliations,
          pronouns,
          display_name,
          bio,
          phone,
          social_links,
          languages_spoken,
          interests,
          preferred_communication,
          occupation,
          timezone
        )
      `)
      .single()

    if (error) {
      console.error('Error updating storyteller:', error)
      return NextResponse.json(
        { error: 'Failed to update storyteller' },
        { status: 500 }
      )
    }

    return NextResponse.json(storyteller)

  } catch (error) {
    console.error('Storyteller update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params
    
    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Soft delete by setting status to inactive
    const { error } = await supabase
      .from('storytellers')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', storytellerId)

    if (error) {
      console.error('Error deleting storyteller:', error)
      return NextResponse.json(
        { error: 'Failed to delete storyteller' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Storyteller deactivated successfully' })

  } catch (error) {
    console.error('Storyteller deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
