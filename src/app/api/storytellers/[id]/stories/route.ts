// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status') || 'published'
    
    const supabase = await createSupabaseServerClient()
    const { id: storytellerId } = await params

    let query = supabase
      .from('stories')
      .select(`
        id,
        title,
        excerpt,
        summary,
        created_at,
        updated_at,
        status,
        cultural_themes
      `)
      .eq('storyteller_id', storytellerId)
      .order('created_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (limit > 0) {
      query = query.limit(limit)
    }

    if (page > 1) {
      query = query.range((page - 1) * limit, page * limit - 1)
    }

    const { data: stories, error } = await query

    if (error) {
      console.error('Error fetching storyteller stories:', error)
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
    }

    return NextResponse.json({
      stories: stories || [],
      total: stories?.length || 0,
      page,
      limit
    })

  } catch (error) {
    console.error('Error in storyteller stories API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
