import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface TranscriptData {
  id: string
  title: string
  storyteller: {
    id: string
    name: string
    avatarUrl?: string
  }
  wordCount: number
  characterCount: number
  status: string
  hasVideo: boolean
  videoUrl?: string
  videoPlatform?: string
  createdAt: string
  updatedAt: string
  project?: {
    id: string
    name: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params
    console.log('🔍 Fetching transcripts for organisation:', organizationId)

    // Get organisation details first
    const { data: organisation, error: orgError } = await supabase
      .from('organizations')
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

    // Get all storytellers in this organisation's tenant (regardless of membership status)
    // This ensures storyteller content remains visible even if they're removed as members
    const { data: storytellers, error: storytellersError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        profile_image_url,
        avatar_media_id,
        is_storyteller,
        tenant_roles
      `)
      .eq('tenant_id', organisation.tenant_id)
      .contains('tenant_roles', ['storyteller'])

    if (storytellersError) {
      console.error('❌ Error fetching storytellers:', storytellersError)
      throw storytellersError
    }

    console.log(`📊 Found ${storytellers?.length || 0} storytellers in tenant with potential transcripts`)
    console.log('📝 Tenant storytellers:', storytellers?.map(s => s.full_name))

    if (!storytellers || storytellers.length === 0) {
      return NextResponse.json({
        success: true,
        transcripts: [],
        stats: {
          total: 0,
          pending: 0,
          reviewed: 0,
          approved: 0,
          published: 0,
          withVideo: 0
        },
        organisation: {
          id: organisation.id,
          name: organisation.name
        }
      })
    }

    const storytellerIds = storytellers.map(st => st.id)

    // Get transcripts by storyteller_id AND by name matching for organisation members
    let transcripts: any[] = []

    // First, get transcripts directly linked to storyteller IDs
    if (storytellerIds.length > 0) {
      const { data: linkedTranscripts, error: linkedError } = await supabase
        .from('transcripts')
        .select(`
          id,
          title,
          storyteller_id,
          word_count,
          character_count,
          status,
          source_video_url,
          source_video_platform,
          created_at,
          updated_at,
          project_id,
          metadata,
          ai_processing_date,
          ai_confidence_score
        `)
        .in('storyteller_id', storytellerIds)
        .order('created_at', { ascending: false })

      if (!linkedError && linkedTranscripts) {
        transcripts = [...linkedTranscripts]
      }
    }

    // Also get transcripts that mention organisation member names in title
    const memberNames = storytellers.map(s => s.full_name.trim())
    if (memberNames.length > 0) {
      const { data: nameMatchedTranscripts, error: nameError } = await supabase
        .from('transcripts')
        .select(`
          id,
          title,
          storyteller_id,
          word_count,
          character_count,
          status,
          source_video_url,
          source_video_platform,
          created_at,
          updated_at,
          project_id,
          metadata,
          ai_processing_date,
          ai_confidence_score
        `)
        .or(memberNames.map(name => `title.ilike.%${name}%`).join(','))
        .order('created_at', { ascending: false })

      if (!nameError && nameMatchedTranscripts) {
        // Add transcripts that aren't already included
        const existingIds = new Set(transcripts.map(t => t.id))
        const newTranscripts = nameMatchedTranscripts.filter(t => !existingIds.has(t.id))
        transcripts = [...transcripts, ...newTranscripts]
      }
    }

    console.log(`📝 Found ${transcripts?.length || 0} transcripts total for ${storytellers?.length || 0} storytellers`)

    const transcriptsError = null

    if (transcriptsError) {
      console.error('❌ Error fetching transcripts:', transcriptsError)
      throw transcriptsError
    }

    console.log(`📝 Found ${transcripts?.length || 0} transcripts`)

    // Get project information for transcripts that have project_id
    const projectIds = [...new Set(transcripts?.map(t => t.project_id).filter(Boolean) || [])]
    let projects: any[] = []
    
    if (projectIds.length > 0) {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .in('id', projectIds)

      if (!projectsError) {
        projects = projectsData || []
      }
    }

    // Check for generated stories for these transcripts
    const transcriptIds = (transcripts || []).map(t => t.id)
    let generatedStories: any[] = []

    if (transcriptIds.length > 0) {
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select('transcript_id')
        .in('transcript_id', transcriptIds)
        .not('transcript_id', 'is', null)

      if (!storiesError) {
        generatedStories = storiesData || []
      }
    }

    // Transform transcripts data
    const transformedTranscripts: TranscriptData[] = (transcripts || []).map(transcript => {
      // Find storyteller by ID first, then by name matching
      let storyteller = storytellers.find(st => st.id === transcript.storyteller_id)

      // If no direct match, try to find by name in title
      if (!storyteller) {
        storyteller = storytellers.find(st =>
          transcript.title.toLowerCase().includes(st.full_name.toLowerCase().trim())
        )
      }

      const project = projects.find(p => p.id === transcript.project_id)
      const hasGeneratedStory = generatedStories.some(s => s.transcript_id === transcript.id)
      const analysis = transcript.metadata?.analysis

      const avatarUrl = storyteller?.profile_image_url || null

      return {
        id: transcript.id,
        title: transcript.title || 'Untitled Transcript',
        storyteller: {
          id: storyteller?.id || transcript.storyteller_id || '',
          name: storyteller?.full_name || extractNameFromTitle(transcript.title) || 'Unknown Storyteller',
          avatarUrl: avatarUrl
        },
        wordCount: transcript.word_count || 0,
        characterCount: transcript.character_count || 0,
        status: transcript.status || 'pending',
        hasVideo: !!(transcript.source_video_url || transcript.source_video_platform),
        videoUrl: transcript.source_video_url,
        videoPlatform: transcript.source_video_platform,
        createdAt: transcript.created_at,
        updatedAt: transcript.updated_at,
        project: project ? {
          id: project.id,
          name: project.name
        } : undefined,
        analysis: analysis ? {
          themes: analysis.themes || [],
          emotionalTone: analysis.emotionalTone || '',
          suggestedTitle: analysis.suggestedTitle || '',
          suggestedSummary: analysis.suggestedSummary || '',
          analyzedAt: analysis.analyzedAt || transcript.ai_processing_date
        } : undefined,
        isAnalyzed: !!(analysis && transcript.ai_processing_date),
        hasGeneratedStory
      }
    })

    // Helper function to extract name from transcript title
    function extractNameFromTitle(title: string): string {
      // Look for patterns like "Name - something" or "Name Interview"
      const patterns = [
        /^([^-]+)\s*-\s*.*$/,  // "Name - Description"
        /^([^:]+)\s*:\s*.*$/,  // "Name: Description"
        /^(.+?)\s+(Interview|Transcript|Story|Talk).*$/i  // "Name Interview/Transcript/etc"
      ]

      for (const pattern of patterns) {
        const match = title.match(pattern)
        if (match) {
          return match[1].trim()
        }
      }

      return ''
    }

    // Calculate stats
    const stats = {
      total: transformedTranscripts.length,
      pending: transformedTranscripts.filter(t => t.status === 'pending').length,
      reviewed: transformedTranscripts.filter(t => t.status === 'reviewed').length,
      approved: transformedTranscripts.filter(t => t.status === 'approved').length,
      published: transformedTranscripts.filter(t => t.status === 'published').length,
      withVideo: transformedTranscripts.filter(t => t.hasVideo).length
    }

    console.log('📊 Transcript stats:', stats)

    return NextResponse.json({
      success: true,
      transcripts: transformedTranscripts,
      stats,
      organisation: {
        id: organisation.id,
        name: organisation.name
      }
    })

  } catch (error) {
    console.error('❌ Error in transcripts API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch transcripts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
