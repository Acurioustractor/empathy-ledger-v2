// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

import type { Storyteller, StorytellerInsert } from '@/types/database'



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '1000')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'active'
    const featured = searchParams.get('featured')
    const elder = searchParams.get('elder')
    const culturalBackground = searchParams.get('cultural_background')

    const supabase = createSupabaseServerClient()

    // Query storytellers table with profile and story data
    let query = supabase
      .from('storytellers')
      .select(`
        id,
        profile_id,
        display_name,
        bio,
        cultural_background,
        language_skills,
        avatar_url,
        is_active,
        created_at,
        updated_at,
        profiles!storytellers_profile_id_fkey(
          occupation,
          interests,
          current_organization,
          cultural_affiliations,
          preferred_pronouns,
          languages_spoken
        )
      `, { count: 'exact' })

    // Apply elder filter (skip for now until we know database schema)
    // if (elder === 'true') {
    //   query = query.eq('is_elder', true)
    // } else if (elder === 'false') {
    //   query = query.eq('is_elder', false)
    // }

    // Apply cultural background filter
    if (culturalBackground && culturalBackground !== 'all') {
      query = query.contains('cultural_background', [culturalBackground])
    }

    // Apply search
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,bio.ilike.%${search}%`)
    }

    // Apply status filter
    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    // Apply pagination and ordering
    const offset = (page - 1) * limit
    query = query
      .order('display_name', { ascending: true })
      .range(offset, offset + limit - 1)

    // Get count and data
    const { data: storytellers, error, count } = await query

    if (error) {
      console.error('Error fetching storytellers:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'Failed to fetch storytellers', details: error.message },
        { status: 500 }
      )
    }

    // Transform storytellers to response format
    const transformedStorytellers = await Promise.all((storytellers || []).map(async storyteller => {
      // Get story count for this storyteller
      const { count: storyCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('storyteller_id', storyteller.id)
        .eq('status', 'published')

      // Get organization from profile if available
      const profile = storyteller.profiles
      let organisations = []
      if (profile?.current_organization) {
        organisations = [{
          id: null,
          name: profile.current_organization,
          role: 'Member'
        }]
      }

      return {
        id: storyteller.id,
        display_name: storyteller.display_name,
        bio: storyteller.bio,
        cultural_background: storyteller.cultural_background,
        specialties: [],
        years_of_experience: null,
        preferred_topics: profile?.interests || [],
        story_count: storyCount || 0,
        featured: false,
        status: storyteller.is_active ? 'active' as const : 'inactive' as const,
        elder_status: false,
        storytelling_style: null,
        location: null,
        occupation: profile?.occupation,
        languages: storyteller.language_skills || profile?.languages_spoken || [],
        organisations: organisations,
        projects: [],
        profile: {
          avatar_url: storyteller.avatar_url,
          profile_image_url: storyteller.avatar_url,
          cultural_affiliations: profile?.cultural_affiliations || [],
          pronouns: profile?.preferred_pronouns,
          display_name: storyteller.display_name,
          bio: storyteller.bio
        },
        avatar_url: storyteller.avatar_url
      }
    }))

    return NextResponse.json({
      storytellers: transformedStorytellers,
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

    // Update the profile to become a storyteller - using only confirmed working fields
    const profileUpdateData = {
      display_name: body.display_name,
      bio: body.bio || null,
      cultural_background: body.cultural_background || null,
      is_storyteller: true // Mark as storyteller in profiles table
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', body.profile_id)
      .select('*')
      .single()

    if (error) {
      console.error('Error creating storyteller:', error)
      return NextResponse.json(
        { error: 'Failed to create storyteller' },
        { status: 500 }
      )
    }

    // Format the response as a storyteller object
    const storytellerResponse = {
      id: profile.id,
      display_name: profile.display_name,
      bio: profile.bio,
      cultural_background: profile.cultural_background,
      is_storyteller: profile.is_storyteller,
      interests: profile.interests,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    }

    return NextResponse.json(storytellerResponse, { status: 201 })

  } catch (error) {
    console.error('Storyteller creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
