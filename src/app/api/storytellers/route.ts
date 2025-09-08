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

    const supabase = await createSupabaseServerClient()

    // Query profiles table for all profiles (treating them as storytellers)
    let query = supabase
      .from('profiles')
      .select(`
        *,
        stories!stories_author_id_fkey(count)
      `, { count: 'exact' })

    // Apply elder filter (skip for now until we know database schema)
    // if (elder === 'true') {
    //   query = query.eq('is_elder', true)
    // } else if (elder === 'false') {
    //   query = query.eq('is_elder', false)
    // }

    // Apply cultural background filter
    if (culturalBackground && culturalBackground !== 'all') {
      query = query.eq('cultural_background', culturalBackground)
    }

    // Apply search
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,bio.ilike.%${search}%`)
    }

    // Apply pagination and ordering
    const offset = (page - 1) * limit
    query = query
      .order('display_name', { ascending: true })
      .range(offset, offset + limit - 1)

    // Get count and data
    const { data: profiles, error, count } = await query

    if (error) {
      console.error('Error fetching storytellers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch storytellers' },
        { status: 500 }
      )
    }

    // Helper function to extract themes from bio text
    const extractThemesFromBio = (bio: string): string[] => {
      if (!bio) return []
      const themes = []
      const keywords = ['family', 'community', 'health', 'business', 'environment', 'education', 'culture', 'tradition', 'healing', 'land', 'country', 'elders', 'youth', 'stories', 'wisdom', 'connection', 'identity', 'heritage', 'language', 'ceremony']
      keywords.forEach(keyword => {
        if (bio.toLowerCase().includes(keyword)) {
          themes.push(keyword.charAt(0).toUpperCase() + keyword.slice(1))
        }
      })
      return [...new Set(themes)] // Remove duplicates
    }

    // Helper function to extract location mentions from bio
    const extractLocationFromBio = (bio: string): string | null => {
      if (!bio) return null
      const locationMatch = bio.match(/Growing up in ([^,]+)/i)
      if (locationMatch && locationMatch[1] && locationMatch[1].trim() !== 'na') {
        return locationMatch[1].trim()
      }
      return null
    }

    // Transform profiles to storyteller format
    const storytellers = (profiles || []).map(profile => {
      const bio = profile.bio || ''
      const themes = extractThemesFromBio(bio)
      const location = extractLocationFromBio(bio)
      const storyCount = profile.stories ? profile.stories.length : 0
      
      return {
        id: profile.id,
        display_name: profile.display_name || profile.preferred_name || 'Unknown Storyteller',
        bio: bio,
        cultural_background: profile.cultural_background,
        specialties: themes,
        years_of_experience: null,
        preferred_topics: profile.interests || [],
        story_count: storyCount,
        featured: storyCount > 0,
        status: 'active' as const,
        elder_status: false,
        storytelling_style: null,
        location: location,
        occupation: profile.occupation,
        languages: profile.languages_spoken,
        profile: {
          avatar_url: profile.profile_image_url,
          cultural_affiliations: profile.cultural_affiliations,
          pronouns: profile.preferred_pronouns,
          display_name: profile.display_name,
          bio: profile.bio
        }
      }
    })

    return NextResponse.json({
      storytellers,
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

    const supabase = await createSupabaseServerClient()

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