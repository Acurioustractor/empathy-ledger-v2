import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface StorytellerData {
  id: string
  fullName: string
  displayName: string
  bio?: string
  avatarUrl?: string
  location?: string
  culturalBackground?: string
  isElder?: boolean
  isFeatured?: boolean
  videoIntroductionUrl?: string
  featuredVideoUrl?: string
  transcripts: TranscriptSummary[]
  stories: StorySummary[]
  stats: {
    totalTranscripts: number
    totalStories: number
    totalVideos: number
    totalCharacters: number
    analyzedContent: number
  }
  aiInsights?: {
    topThemes: Array<{ theme: string; count: number }>
    culturalMarkers?: string[]
    lastAnalyzed?: string
  }
  primaryProject?: string
  lastActive?: string
  // Enhanced storyteller properties
  impactFocusAreas?: string[]
  expertiseAreas?: string[]
  storytellingMethods?: string[]
  communityRoles?: string[]
  changeMakerType?: string
  geographicScope?: string
  yearsOfCommunityWork?: number
  mentorAvailability?: boolean
  speakingAvailability?: boolean
}

interface TranscriptSummary {
  id: string
  title: string
  wordCount: number
  characterCount: number
  hasVideo: boolean
  videoUrl?: string
  videoPlatform?: string
  status: string
  createdAt: string
}

interface StorySummary {
  id: string
  title: string
  status: string
  hasVideo: boolean
  themes: string[]
  createdAt: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    console.log('🔍 Fetching storytellers for organisation:', organizationId)

    // Strategy: Find storytellers through multiple connection points
    // 1. Direct tenant connection (same tenant as organisation)
    // 2. Stories/transcripts mentioning organisation projects
    // 3. Content with relevant themes

    // Get organisation details first
    const { data: organisation, error: orgError } = await supabase
      .from('organisations')
      .select('id, name, tenant_id')
      .eq('id', organizationId)
      .single()

    if (orgError || !organisation) {
      console.error('❌ Organization not found:', orgError?.message)
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      )
    }

    console.log('✅ Organization found:', organisation.name, 'Tenant:', organisation.tenant_id)

    // Get storytellers directly by tenant_id (organization_members table doesn't exist)
    console.log('🔍 Fetching storytellers by tenant_id:', organisation.tenant_id)
    
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        display_name,
        bio,
        avatar_url,
        profile_image_url,
        video_introduction_url,
        featured_video_url,
        is_storyteller,
        is_elder,
        is_featured,
        tenant_id,
        tenant_roles,
        impact_focus_areas,
        expertise_areas,
        storytelling_methods,
        community_roles,
        change_maker_type,
        geographic_scope,
        years_of_community_work,
        mentor_availability,
        speaking_availability
      `)
      .eq('tenant_id', organisation.tenant_id)
      .contains('tenant_roles', ['storyteller'])
      .order('full_name', { ascending: true })

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      throw profilesError
    }


    console.log('📊 Found', allProfiles?.length || 0, 'total storytellers')

    // Get all transcripts
    const { data: allTranscripts, error: transcriptsError } = await supabase
      .from('transcripts')
      .select(`
        id,
        storyteller_id,
        title,
        word_count,
        character_count,
        source_video_url,
        source_video_platform,
        status,
        created_at,
        metadata
      `)
      .order('created_at', { ascending: false })

    if (transcriptsError) {
      console.error('❌ Error fetching transcripts:', transcriptsError)
      throw transcriptsError
    }

    // Get all stories  
    const { data: allStories, error: storiesError } = await supabase
      .from('stories')
      .select(`
        id,
        storyteller_id,
        author_id,
        title,
        themes,
        status,
        video_embed_code,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (storiesError) {
      console.error('❌ Error fetching stories:', storiesError)
      throw storiesError
    }

    // Process storytellers and their content
    const storytellers: StorytellerData[] = []

    for (const profile of allProfiles || []) {
      // Get transcripts for this storyteller
      const storytellerTranscripts = (allTranscripts || []).filter(t => 
        t.storyteller_id === profile.id
      )

      // Get stories for this storyteller (check both storyteller_id and author_id)
      const storytellerStories = (allStories || []).filter(s => 
        s.storyteller_id === profile.id || s.author_id === profile.id
      )

      // Since we've already filtered by tenant_id, all profiles are connected to this organisation
      // No additional filtering needed - they're all relevant storytellers for this organisation

      // Build transcript summaries
      const transcripts: TranscriptSummary[] = storytellerTranscripts.map(t => ({
        id: t.id,
        title: t.title || 'Untitled Transcript',
        wordCount: t.word_count || 0,
        characterCount: t.character_count || 0,
        hasVideo: !!(t.source_video_url || t.source_video_platform),
        videoUrl: t.source_video_url,
        videoPlatform: t.source_video_platform,
        status: t.status || 'pending',
        createdAt: t.created_at
      }))

      // Build story summaries
      const stories: StorySummary[] = storytellerStories.map(s => ({
        id: s.id,
        title: s.title || 'Untitled Story',
        status: s.status || 'draft',
        hasVideo: !!s.video_embed_code,
        themes: s.themes || [],
        createdAt: s.created_at
      }))

      // Calculate analysed content count
      const analyzedTranscripts = transcripts.filter(t => t.status === 'analysed' || t.status === 'approved')
      const analyzedCount = analyzedTranscripts.length

      // Generate AI insights from transcript AI analysis (not story themes)
      const allThemes: string[] = []

      // Extract themes from AI-analysed transcripts (high quality)
      storytellerTranscripts.forEach(transcript => {
        // Check if transcript has AI analysis metadata
        if (transcript.metadata &&
            typeof transcript.metadata === 'object' &&
            transcript.metadata !== null &&
            'analysis' in transcript.metadata &&
            transcript.metadata.analysis &&
            'themes' in transcript.metadata.analysis &&
            Array.isArray(transcript.metadata.analysis.themes)) {
          allThemes.push(...transcript.metadata.analysis.themes)
        }
      })

      // Fallback to story themes only if no AI themes available
      if (allThemes.length === 0) {
        stories.forEach(story => {
          if (story.themes && story.themes.length > 0) {
            allThemes.push(...story.themes)
          }
        })
      }

      // Count theme frequency and filter out low-quality single words
      const themeCount: Record<string, number> = {}
      const stopWords = ['think', 'people', 'there', 'that', 'this', 'they', 'with', 'from', 'have', 'been', 'were', 'said', 'each', 'would', 'their']

      allThemes.forEach(theme => {
        // Filter out single words and common stop words
        if (theme &&
            theme.length > 3 &&
            (theme.includes(' ') || theme.includes('-')) &&
            !stopWords.includes(theme.toLowerCase())) {
          themeCount[theme] = (themeCount[theme] || 0) + 1
        }
      })

      // Get top themes
      const topThemes = Object.entries(themeCount)
        .map(([theme, count]) => ({ theme, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)

      // Calculate stats
      const stats = {
        totalTranscripts: transcripts.length,
        totalStories: stories.length,
        totalVideos: transcripts.filter(t => t.hasVideo).length + stories.filter(s => s.hasVideo).length,
        totalCharacters: transcripts.reduce((sum, t) => sum + t.characterCount, 0),
        analyzedContent: analyzedCount
      }

      // Determine primary project (Snow Foundation for this org)
      const primaryProject = organisation.name || 'Snow Foundation'

      // Get last activity date
      const allDates = [
        ...transcripts.map(t => t.createdAt),
        ...stories.map(s => s.createdAt)
      ].filter(Boolean)
      const lastActive = allDates.length > 0 ? allDates.sort().reverse()[0] : undefined

      storytellers.push({
        id: profile.id,
        fullName: profile.full_name || '',
        displayName: profile.display_name || '',
        bio: profile.bio,
        avatarUrl: profile.profile_image_url || profile.avatar_url,
        location: profile.location || profile.current_location,
        culturalBackground: profile.cultural_background,
        isElder: profile.is_elder || false,
        isFeatured: profile.is_featured || false,
        videoIntroductionUrl: profile.video_introduction_url,
        featuredVideoUrl: profile.featured_video_url,
        transcripts,
        stories,
        stats,
        aiInsights: topThemes.length > 0 ? {
          topThemes,
          culturalMarkers: profile.cultural_background ? [profile.cultural_background] : [],
          lastAnalyzed: analyzedCount > 0 ? new Date().toISOString() : undefined
        } : undefined,
        primaryProject,
        lastActive,
        // Enhanced storyteller properties
        impactFocusAreas: profile.impact_focus_areas || [],
        expertiseAreas: profile.expertise_areas || [],
        storytellingMethods: profile.storytelling_methods || [],
        communityRoles: profile.community_roles || [],
        changeMakerType: profile.change_maker_type,
        geographicScope: profile.geographic_scope,
        yearsOfCommunityWork: profile.years_of_community_work,
        mentorAvailability: profile.mentor_availability || false,
        speakingAvailability: profile.speaking_availability || false
      })
    }

    // Sort by most content first
    storytellers.sort((a, b) => {
      const aContent = a.stats.totalTranscripts + a.stats.totalStories
      const bContent = b.stats.totalTranscripts + b.stats.totalStories
      return bContent - aContent
    })

    console.log('✅ Processed', storytellers.length, 'connected storytellers')

    // Calculate overall stats
    const overallStats = {
      totalStorytellers: storytellers.length,
      totalTranscripts: storytellers.reduce((sum, s) => sum + s.stats.totalTranscripts, 0),
      totalStories: storytellers.reduce((sum, s) => sum + s.stats.totalStories, 0),
      totalVideos: storytellers.reduce((sum, s) => sum + s.stats.totalVideos, 0),
      storytellersWithTranscripts: storytellers.filter(s => s.stats.totalTranscripts > 0).length,
      storytellersWithStories: storytellers.filter(s => s.stats.totalStories > 0).length,
      storytellersWithVideos: storytellers.filter(s => s.stats.totalVideos > 0).length
    }

    return NextResponse.json({
      success: true,
      organisation: {
        id: organisation.id,
        name: organisation.name
      },
      storytellers,
      stats: overallStats
    })

  } catch (error) {
    console.error('❌ Error in storytellers API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch storytellers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('➕ Adding storyteller:', userId, 'to organisation:', organizationId)

    // Get organisation details
    const { data: organisation, error: orgError } = await supabase
      .from('organisations')
      .select('id, name, tenant_id')
      .eq('id', organizationId)
      .single()

    if (orgError || !organisation) {
      console.error('❌ Organization not found:', orgError?.message)
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('display_name, full_name, tenant_roles, tenant_id')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('❌ User not found:', userError?.message)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const userName = user.display_name || user.full_name || 'User'

    // Check if user is already a storyteller for this organisation
    const currentRoles = user.tenant_roles || []
    if (currentRoles.includes('storyteller') && user.tenant_id === organisation.tenant_id) {
      return NextResponse.json(
        { success: false, error: `${userName} is already a storyteller for ${organisation.name}` },
        { status: 400 }
      )
    }

    // Add 'storyteller' to tenant_roles array
    const updatedRoles = [...currentRoles]
    if (!updatedRoles.includes('storyteller')) {
      updatedRoles.push('storyteller')
    }

    // Update the profile to add storyteller role and set tenant_id
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tenant_roles: updatedRoles,
        tenant_id: organisation.tenant_id
      })
      .eq('id', userId)

    if (updateError) {
      console.error('❌ Error updating profile:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to add storyteller role' },
        { status: 500 }
      )
    }

    // Also add to profile_organizations relationships
    const { error: orgRelationError } = await supabase
      .from('profile_organizations')
      .upsert({
        profile_id: userId,
        organization_id: organizationId,
        role: 'storyteller',
        is_active: true,
        joined_at: new Date().toISOString()
      }, {
        onConflict: 'profile_id,organization_id'
      })

    if (orgRelationError) {
      console.log('⚠️ Warning: Could not update profile_organizations:', orgRelationError)
      // This is not critical as the tenant_roles system is primary
    }

    console.log('✅ Successfully added storyteller role to:', userName)

    return NextResponse.json({
      success: true,
      message: `${userName} has been added as a storyteller for ${organisation.name}`
    })

  } catch (error) {
    console.error('❌ Error adding storyteller:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add storyteller',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}