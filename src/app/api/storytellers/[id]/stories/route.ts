import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storytellerId = params.id
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'published'
    const featured = searchParams.get('featured')
    const storyType = searchParams.get('story_type')

    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Build query
    let query = supabase
      .from('stories')
      .select(`
        *,
        storyteller:storytellers(
          id,
          display_name,
          elder_status,
          cultural_background,
          profile:profiles(
            avatar_url,
            cultural_affiliations
          )
        )
      `)
      .eq('storyteller_id', storytellerId)

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    if (storyType) {
      query = query.eq('story_type', storyType)
    }

    // Apply pagination and ordering
    const offset = (page - 1) * limit
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: stories, error, count } = await query

    if (error) {
      console.error('Error fetching storyteller stories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch stories' },
        { status: 500 }
      )
    }

    // Get storyteller info for context
    const { data: storyteller } = await supabase
      .from('storytellers')
      .select(`
        id,
        display_name,
        elder_status,
        cultural_background,
        story_count
      `)
      .eq('id', storytellerId)
      .single()

    return NextResponse.json({
      stories: stories || [],
      storyteller,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Storyteller stories API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create a new story for this storyteller
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storytellerId = params.id
    const body = await request.json()

    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Verify storyteller exists and user has permission
    const { data: storyteller, error: storytellerError } = await supabase
      .from('storytellers')
      .select('id, profile_id')
      .eq('id', storytellerId)
      .single()

    if (storytellerError) {
      return NextResponse.json(
        { error: 'Storyteller not found' },
        { status: 404 }
      )
    }

    // Create story
    const storyData = {
      ...body,
      storyteller_id: storytellerId,
      author_id: storyteller.profile_id,
      status: 'draft', // New stories start as drafts
      created_at: new Date().toISOString()
    }

    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert([storyData])
      .select(`
        *,
        storyteller:storytellers(
          id,
          display_name,
          elder_status,
          cultural_background
        )
      `)
      .single()

    if (storyError) {
      console.error('Error creating story:', storyError)
      return NextResponse.json(
        { error: 'Failed to create story' },
        { status: 500 }
      )
    }

    // Update storyteller story count
    await supabase
      .from('storytellers')
      .update({ 
        story_count: supabase.rpc('increment_story_count', { storyteller_id: storytellerId })
      })
      .eq('id', storytellerId)

    return NextResponse.json(story, { status: 201 })

  } catch (error) {
    console.error('Story creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}