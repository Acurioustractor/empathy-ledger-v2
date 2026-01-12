// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServiceClient } from '@/lib/supabase/client-ssr'



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Use service client to avoid RLS recursion issues
    const supabase = createSupabaseServiceClient()
    const { id: storytellerId } = await params

    // Simple query with just essential fields that we know exist
    const query = supabase
      .from('transcripts')
      .select(`
        id,
        title,
        word_count,
        duration,
        created_at,
        updated_at,
        status
      `)
      .eq('storyteller_id', storytellerId)
      .order('created_at', { ascending: false })

    if (limit > 0) {
      query.limit(limit)
    }

    if (page > 1) {
      query.range((page - 1) * limit, page * limit - 1)
    }

    const { data: transcripts, error } = await query

    if (error) {
      console.error('Error fetching storyteller transcripts:', error)
      return NextResponse.json({ error: 'Failed to fetch transcripts' }, { status: 500 })
    }

    return NextResponse.json({
      transcripts: transcripts || [],
      total: transcripts?.length || 0,
      page,
      limit
    })

  } catch (error) {
    console.error('Error in storyteller transcripts API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
