// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/middleware/admin-auth'



// Use service role to bypass RLS for admin seeding/testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create service client inside handlers, not at module level
function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

type CreateTranscriptBody = {
  storyteller_id: string
  title: string
  transcript_text?: string
  source_video_url?: string
  video_embed_code?: string
  audio_url?: string
  status?: string
  metadata?: Record<string, any>
}

function detectVideoPlatform(url?: string | null): string | null {
  if (!url) return null
  const u = url.toLowerCase()
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube'
  if (u.includes('vimeo.com')) return 'vimeo'
  if (u.includes('tiktok.com')) return 'tiktok'
  return 'external'
}

export async function GET(request: NextRequest) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  // Create service client after auth check
  const supabase = getServiceClient()

  try {
    const { searchParams } = new URL(request.url)
    const storytellerId = searchParams.get('storyteller_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const language = searchParams.get('language') || ''

    // If storyteller_id is provided, use the old behaviour for storyteller-specific requests
    if (storytellerId) {
      const { data, error } = await supabase
        .from('transcripts')
        .select('*')
        .eq('storyteller_id', storytellerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Admin transcripts GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch transcripts' }, { status: 500 })
      }

      return NextResponse.json({ transcripts: data || [] })
    }

    // Admin view - fetch all transcripts with pagination and filtering
    // First, try to get transcripts without the join to see if there's data
    let query = supabase
      .from('transcripts')
      .select('*', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,transcript_content.ilike.%${search}%`)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (language) {
      query = query.eq('language', language)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query
      .range(from, to)
      .order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error('Admin transcripts GET error:', error)
      return NextResponse.json({ error: 'Failed to fetch transcripts', details: error.message }, { status: 500 })
    }

    // Now fetch storyteller names separately if we have transcripts
    // Try matching by both id and auth_id since some transcripts may use old profile IDs
    const storytellerMap: Record<string, { display_name: string; email: string }> = {}
    if (data && data.length > 0) {
      const storytellerIds = [...new Set(data.map((t: any) => t.storyteller_id).filter(Boolean))]
      if (storytellerIds.length > 0) {
        // Try to find by id first
        const { data: storytellersById } = await supabase
          .from('storytellers')
          .select('id, display_name, email')
          .in('id', storytellerIds)

        if (storytellersById) {
          storytellersById.forEach((s: any) => {
            storytellerMap[s.id] = { display_name: s.display_name, email: s.email }
          })
        }

        // Also try to find by auth_id for backwards compatibility
        const unmatchedIds = storytellerIds.filter(id => !storytellerMap[id])
        if (unmatchedIds.length > 0) {
          const { data: storytellersByAuth } = await supabase
            .from('storytellers')
            .select('id, auth_id, display_name, email')
            .in('auth_id', unmatchedIds)

          if (storytellersByAuth) {
            storytellersByAuth.forEach((s: any) => {
              if (s.auth_id) {
                storytellerMap[s.auth_id] = { display_name: s.display_name, email: s.email }
              }
            })
          }
        }
      }
    }

    // Data successfully fetched

    // Transform the data to match the expected format
    const transcripts = (data || []).map((transcript: any) => {
      // Calculate word count from transcript text (check multiple possible fields)
      const textContent = transcript.transcript_content || transcript.text || ''
      const wordCount = textContent
        ? textContent.split(/\s+/).filter((word: string) => word.length > 0).length
        : 0

      const storyteller = storytellerMap[transcript.storyteller_id]

      // Try to extract name from title if it follows "Name - Date" pattern
      let extractedName = null
      if (transcript.title && transcript.title.includes(' - ')) {
        const parts = transcript.title.split(' - ')
        if (parts[0] && parts[0].length > 2 && parts[0].length < 50) {
          extractedName = parts[0].trim()
        }
      }

      return {
        id: transcript.id,
        title: transcript.title,
        storyteller_name: storyteller?.display_name ||
                         storyteller?.email ||
                         extractedName ||
                         (transcript.storyteller_id ? 'Unknown Storyteller' : 'No Storyteller'),
        storyteller_id: transcript.storyteller_id,
        status: transcript.status || 'pending',
        duration: transcript.duration_seconds || transcript.duration || 0,
        file_size: transcript.file_size || 0,
        word_count: wordCount,
        language: transcript.language || 'en',
        location: transcript.location || null,
        created_at: transcript.created_at,
        updated_at: transcript.updated_at,
        has_story: false,
        project_name: null,
        organization_name: null
      }
    })

    return NextResponse.json({
      transcripts,
      total: count || 0,
      page,
      limit
    })
  } catch (error) {
    console.error('Unexpected admin transcripts GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  // Create service client after auth check
  const supabase = getServiceClient()

  try {
    const body = (await request.json()) as CreateTranscriptBody
    const {
      storyteller_id,
      title,
      transcript_text = '',
      source_video_url,
      video_embed_code,
      audio_url,
      status = 'completed',
      metadata
    } = body

    if (!storyteller_id || !title) {
      return NextResponse.json(
        { error: 'storyteller_id and title are required' },
        { status: 400 }
      )
    }

    // Note: video embed functionality would need to be handled in a separate videos table

    // Get the storyteller's tenant_id from their profile
    const { data: storytellerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', storyteller_id)
      .single()

    if (profileError || !storytellerProfile) {
      console.error('Error fetching storyteller profile:', profileError)
      return NextResponse.json(
        { error: 'Storyteller not found' },
        { status: 404 }
      )
    }

    // Insert minimal fields aligned to live transcripts schema
    const insertData: any = {
      storyteller_id,
      title,
      transcript_content: transcript_text,
      status,
      tenant_id: storytellerProfile.tenant_id
    }

    if (audio_url) insertData.audio_url = audio_url
    if (source_video_url) insertData.source_video_url = source_video_url

    const { data, error } = await supabase
      .from('transcripts')
      .insert([insertData])
      .select('*')
      .single()

    if (error) {
      console.error('Admin transcripts POST error:', error)
      return NextResponse.json({ error: 'Failed to create transcript' }, { status: 500 })
    }

    return NextResponse.json({ success: true, transcript: data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected admin transcripts POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
