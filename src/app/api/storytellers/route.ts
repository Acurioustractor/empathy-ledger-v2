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

    // Query profiles table with organisation, project, and location data
    let query = supabase
      .from('profiles')
      .select(`
        *,
        stories!stories_author_id_fkey(count),
        profile_locations!profile_locations_profile_id_fkey(
          is_primary,
          location:locations(name, city, state, country)
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
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'Failed to fetch storytellers', details: error.message },
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

      // Skip extraction from obviously AI-generated content
      if (bio.includes('Growing up in testing') ||
          bio.includes('would suit me') ||
          bio.includes('work etc')) {
        return null
      }

      const locationMatch = bio.match(/Growing up in ([^,]+)/i)
      if (locationMatch && locationMatch[1] &&
          locationMatch[1].trim() !== 'na' &&
          locationMatch[1].trim().length > 2) {
        return locationMatch[1].trim()
      }
      return null
    }

    // Helper function to clean AI-generated bios
    const cleanBio = (bio: string): string => {
      if (!bio) return ''

      // Detect AI-generated bio patterns
      const aiPatterns = [
        'shares their journey from community member',
        'carrying forward the wisdom of their ancestors',
        'Growing up in testing',
        'their story is woven with their life journey',
        'has become a voice for community values',
        'always honouring their cultural roots'
      ]

      // If bio contains AI patterns, return a shorter, more natural version
      if (aiPatterns.some(pattern => bio.includes(pattern))) {
        // Extract just the first sentence or return empty for better user experience
        const firstSentence = bio.split('.')[0]
        if (firstSentence && firstSentence.length < 100 && !firstSentence.includes('testing')) {
          return firstSentence.trim() + '.'
        }
        return ''
      }

      return bio
    }

    // Resolve avatar URLs for profiles that only have media references
    const profilesNeedingAvatars = (profiles || [])
      .filter(profile => !profile.profile_image_url && !profile.avatar_url && profile.avatar_media_id)
      .map(profile => profile.avatar_media_id)

    const avatarUrlMap: Record<string, string> = {}

    if (profilesNeedingAvatars.length > 0) {
      const { data: avatarMedia, error: avatarError } = await supabase
        .from('media_assets')
        .select('id, cdn_url')
        .in('id', profilesNeedingAvatars)

      if (avatarError) {
        console.error('⚠️  Failed to resolve avatar media assets:', avatarError)
      } else {
        avatarMedia?.forEach(media => {
          if (media.cdn_url) {
            avatarUrlMap[media.id] = media.cdn_url
          }
        })
      }
    }

    // Transform profiles to storyteller format
    const storytellers = await Promise.all((profiles || []).map(async profile => {
      const rawBio = profile.bio || ''
      const bio = cleanBio(rawBio)
      const themes = extractThemesFromBio(rawBio)
      const storyCount = profile.stories ? profile.stories.length : 0

      // Get organization data from profile's current_organization field
      let organisations = []
      if (profile.current_organization) {
        // Try to find the organization by name first
        const { data: org } = await supabase
          .from('tenants')
          .select('id, name')
          .eq('name', profile.current_organization)
          .single()

        if (org) {
          organisations = [{
            id: org.id,
            name: org.name,
            role: 'Member' // Default role since we don't have specific role data
          }]
        } else {
          // If no organization found by name, just use the text as organization name
          organisations = [{
            id: null,
            name: profile.current_organization,
            role: 'Member'
          }]
        }
      }

      // Get real project data for this profile (try both tables)
      const { data: projectParticipants } = await supabase
        .from('project_participants')
        .select(`
          storyteller_id,
          role,
          project:projects (
            id,
            name
          )
        `)
        .eq('storyteller_id', profile.id)

      const projects = projectParticipants?.map(pp => ({
        id: pp.project.id,
        name: pp.project.name,
        role: pp.role
      })) || []

      // Get location from profile_locations relationship
      const primaryLocation = profile.profile_locations?.find(pl => pl.is_primary)
      const locationString = primaryLocation?.location?.name || null

      const resolvedAvatarUrl = profile.profile_image_url || profile.avatar_url || (profile.avatar_media_id ? avatarUrlMap[profile.avatar_media_id] : null)

      return {
        id: profile.id,
        display_name: profile.display_name || profile.preferred_name || 'Unknown Storyteller',
        bio: profile.summary || bio,
        cultural_background: profile.cultural_background,
        specialties: themes,
        years_of_experience: null,
        preferred_topics: profile.interests || [],
        story_count: storyCount,
        featured: profile.featured || false,
        status: 'active' as const,
        elder_status: profile.is_elder || false,
        storytelling_style: null,
        location: locationString,
        occupation: profile.occupation,
        languages: profile.languages_spoken,
        organisations: organisations,
        projects: projects,
        profile: {
          avatar_url: resolvedAvatarUrl || null,
          profile_image_url: resolvedAvatarUrl || null,
          cultural_affiliations: profile.cultural_affiliations,
          pronouns: profile.preferred_pronouns,
          display_name: profile.display_name,
          bio: profile.bio
        },
        avatar_url: resolvedAvatarUrl || null
      }
    }))

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
