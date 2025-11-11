import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    console.log('[Transcripts API] Fetching transcripts for project:', projectId)

    const supabase = createSupabaseServiceClient()

    // First test a simple query
    const { data: simpleTest, error: simpleError } = await supabase
      .from('transcripts')
      .select('id, title, project_id')
      .eq('project_id', projectId)

    console.log('[Transcripts API] Simple query result:', simpleTest?.length || 0, 'transcripts')
    if (simpleError) {
      console.error('[Transcripts API] Simple query error:', simpleError)
    }

    const { data: transcripts, error } = await supabase
      .from('transcripts')
      .select(`
        id,
        title,
        status,
        created_at,
        word_count,
        character_count,
        storyteller:profiles!transcripts_storyteller_id_fkey(
          id,
          display_name,
          full_name,
          profile_image_url,
          avatar_media_id
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Transcripts API] Full query error:', error)
      return NextResponse.json({ error: 'Failed to fetch transcripts' }, { status: 500 })
    }

    console.log(`[Transcripts API] Full query found ${transcripts?.length || 0} transcripts`)

    const avatarMediaIds = Array.from(new Set(
      (transcripts || [])
        .map(transcript => transcript.storyteller?.avatar_media_id)
        .filter(Boolean)
    ))

    let avatarUrlMap: Record<string, string> = {}

    if (avatarMediaIds.length > 0) {
      const { data: mediaAssets } = await supabase
        .from('media_assets')
        .select('id, cdn_url')
        .in('id', avatarMediaIds as string[])

      avatarUrlMap = Object.fromEntries((mediaAssets || []).map(asset => [asset.id, asset.cdn_url]))
    }

    return NextResponse.json({
      transcripts: (transcripts || []).map(transcript => {
        const storyteller = transcript.storyteller
        const displayName = storyteller?.display_name || storyteller?.full_name || 'Unknown Storyteller'

        return {
          id: transcript.id,
          title: transcript.title || 'Untitled Transcript',
          status: transcript.status || 'pending',
          createdAt: transcript.created_at,
          wordCount: transcript.word_count || 0,
          characterCount: transcript.character_count || 0,
          storyteller: storyteller ? {
            id: storyteller.id,
            displayName,
            avatarUrl: storyteller.profile_image_url || (storyteller.avatar_media_id ? avatarUrlMap[storyteller.avatar_media_id] || null : null)
          } : null
        }
      })
    })
  } catch (error) {
    console.error('Project transcripts API unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
