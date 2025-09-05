import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import type { Storyteller, StorytellerInsert } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'active'
    const featured = searchParams.get('featured')
    const elder = searchParams.get('elder')
    const culturalBackground = searchParams.get('cultural_background')

    const supabase = createSupabaseServerClient()

    let query = supabase
      .from('storytellers')
      .select(`
        *,
        profile:profiles(
          avatar_url,
          cultural_affiliations,
          pronouns,
          display_name,
          bio
        )
      `)

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (featured === 'true') {
      query = query.eq('featured', true)
    }
    
    if (elder === 'true') {
      query = query.eq('elder_status', true)
    }
    
    if (culturalBackground) {
      query = query.ilike('cultural_background', `%${culturalBackground}%`)
    }

    // Apply search
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,bio.ilike.%${search}%,cultural_background.ilike.%${search}%`)
    }

    // Apply pagination and ordering
    const offset = (page - 1) * limit
    query = query
      .order('display_name', { ascending: true })
      .range(offset, offset + limit - 1)

    const { data: storytellers, error, count } = await query

    if (error) {
      console.error('Error fetching storytellers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch storytellers' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      storytellers: storytellers || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Storytellers API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.display_name || !body.profile_id) {
      return NextResponse.json(
        { error: 'Missing required fields: display_name, profile_id' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    const storytellerData: StorytellerInsert = {
      profile_id: body.profile_id,
      display_name: body.display_name,
      bio: body.bio || null,
      cultural_background: body.cultural_background || null,
      specialties: body.specialties || null,
      years_of_experience: body.years_of_experience || null,
      preferred_topics: body.preferred_topics || null,
      story_count: 0,
      featured: body.featured || false,
      status: body.status || 'active',
      availability: body.availability || null,
      cultural_protocols: body.cultural_protocols || null,
      elder_status: body.elder_status || false,
      community_recognition: body.community_recognition || null,
      storytelling_style: body.storytelling_style || null,
      performance_preferences: body.performance_preferences || null,
      compensation_preferences: body.compensation_preferences || null,
      travel_availability: body.travel_availability || null,
      technical_requirements: body.technical_requirements || null
    }

    const { data: storyteller, error } = await supabase
      .from('storytellers')
      .insert([storytellerData])
      .select(`
        *,
        profile:profiles(
          avatar_url,
          cultural_affiliations,
          pronouns,
          display_name,
          bio
        )
      `)
      .single()

    if (error) {
      console.error('Error creating storyteller:', error)
      return NextResponse.json(
        { error: 'Failed to create storyteller' },
        { status: 500 }
      )
    }

    return NextResponse.json(storyteller, { status: 201 })

  } catch (error) {
    console.error('Storyteller creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}