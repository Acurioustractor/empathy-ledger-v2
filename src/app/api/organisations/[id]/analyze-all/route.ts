import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


/**
 * POST /api/organisations/[id]/analyze-all
 * Trigger comprehensive AI analysis for all storytellers in an organization
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params

    console.log(`🔬 Starting comprehensive analysis for organization: ${organizationId}`)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get organization and tenant
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, tenant_id')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Get all storytellers for this organization
    const { data: storytellers, error: storytellersError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name, bio')
      .eq('tenant_id', org.tenant_id)
      .contains('tenant_roles', ['storyteller'])

    if (storytellersError) {
      return NextResponse.json(
        { error: 'Failed to fetch storytellers' },
        { status: 500 }
      )
    }

    console.log(`📊 Found ${storytellers?.length || 0} storytellers`)

    const results = {
      organization: org.name,
      storytellers_analyzed: 0,
      transcripts_queued: 0,
      bios_updated: 0,
      errors: [] as string[]
    }

    // For each storyteller, get their transcripts and trigger analysis
    for (const storyteller of storytellers || []) {
      console.log(`\n👤 Processing: ${storyteller.display_name || storyteller.full_name}`)

      // Get transcripts for this storyteller
      const { data: transcripts, error: transcriptsError } = await supabase
        .from('transcripts')
        .select('id, title, ai_processing_status')
        .eq('storyteller_id', storyteller.id)

      if (transcriptsError) {
        results.errors.push(`Failed to fetch transcripts for ${storyteller.display_name}: ${transcriptsError.message}`)
        continue
      }

      if (!transcripts || transcripts.length === 0) {
        console.log(`  ⏭️  No transcripts found, skipping`)
        continue
      }

      console.log(`  📄 Found ${transcripts.length} transcript(s)`)

      // Trigger analysis for each transcript
      for (const transcript of transcripts) {
        try {
          // Call the analyze endpoint
          const analyzeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3030'}/api/transcripts/${transcript.id}/analyze`

          const response = await fetch(analyzeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })

          const result = await response.json()

          if (result.success) {
            console.log(`  ✅ Queued: ${transcript.title || transcript.id}`)
            results.transcripts_queued++
          } else {
            console.log(`  ⚠️  Already processing: ${transcript.title || transcript.id}`)
          }

        } catch (error) {
          const errorMsg = `Failed to queue transcript ${transcript.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          results.errors.push(errorMsg)
          console.error(`  ❌ ${errorMsg}`)
        }
      }

      results.storytellers_analyzed++
    }

    console.log(`\n✨ Analysis queued for ${results.transcripts_queued} transcripts across ${results.storytellers_analyzed} storytellers`)

    return NextResponse.json({
      success: true,
      ...results,
      message: `Queued AI analysis for ${results.transcripts_queued} transcripts. This will take 2-5 minutes per transcript.`,
      estimatedCompletionMinutes: Math.ceil(results.transcripts_queued * 3)
    })

  } catch (error) {
    console.error('Error in comprehensive analysis:', error)
    return NextResponse.json(
      { error: 'Failed to trigger analysis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/organisations/[id]/analyze-all
 * Check status of comprehensive analysis
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get organization
    const { data: org } = await supabase
      .from('organizations')
      .select('tenant_id, name')
      .eq('id', organizationId)
      .single()

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get all storytellers
    const { data: storytellers } = await supabase
      .from('profiles')
      .select('id, display_name, full_name, bio, cultural_background, expertise_areas, community_roles')
      .eq('tenant_id', org.tenant_id)
      .contains('tenant_roles', ['storyteller'])

    // Get transcript analysis status
    const storytellerIds = storytellers?.map(s => s.id) || []

    const { data: transcripts } = await supabase
      .from('transcripts')
      .select('storyteller_id, ai_processing_status, themes, key_quotes')
      .in('storyteller_id', storytellerIds)

    // Aggregate status
    const status = {
      organization: org.name,
      total_storytellers: storytellers?.length || 0,
      storytellers_with_bios: storytellers?.filter(s => s.bio && s.bio.length > 100).length || 0,
      storytellers_with_cultural_bg: storytellers?.filter(s => s.cultural_background).length || 0,
      total_transcripts: transcripts?.length || 0,
      transcripts_completed: transcripts?.filter(t => t.ai_processing_status === 'completed').length || 0,
      transcripts_processing: transcripts?.filter(t => t.ai_processing_status === 'processing').length || 0,
      transcripts_queued: transcripts?.filter(t => t.ai_processing_status === 'queued').length || 0,
      transcripts_pending: transcripts?.filter(t => !t.ai_processing_status || t.ai_processing_status === 'pending').length || 0,
      storytellers: storytellers?.map(s => {
        const stTranscripts = transcripts?.filter(t => t.storyteller_id === s.id) || []
        return {
          name: s.display_name || s.full_name,
          bio_status: s.bio && s.bio.length > 100 ? 'complete' : 'missing',
          bio_length: s.bio?.length || 0,
          cultural_background: s.cultural_background || 'not extracted',
          expertise_areas: s.expertise_areas || [],
          community_roles: s.community_roles || [],
          transcripts: stTranscripts.length,
          transcripts_analyzed: stTranscripts.filter(t => t.ai_processing_status === 'completed').length,
          themes_extracted: stTranscripts.reduce((acc, t) => acc + (t.themes?.length || 0), 0),
          quotes_extracted: stTranscripts.reduce((acc, t) => acc + (t.key_quotes?.length || 0), 0)
        }
      }) || []
    }

    return NextResponse.json(status)

  } catch (error) {
    console.error('Error checking analysis status:', error)
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
