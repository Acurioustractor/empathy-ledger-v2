import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params
    
    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Fetch profile information (treating it as storyteller)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        stories!stories_author_id_fkey(count)
      `)
      .eq('id', storytellerId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Storyteller not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching storyteller:', error)
      return NextResponse.json(
        { error: 'Failed to fetch storyteller' },
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
      return [...new Set(themes)]
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

    // Transform profile to storyteller format
    const bio = profile.bio || ''
    const themes = extractThemesFromBio(bio)
    const location = extractLocationFromBio(bio)
    const storyCount = profile.stories ? profile.stories.length : 0

    const storyteller = {
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
      availability: null,
      cultural_protocols: null,
      community_recognition: null,
      performance_preferences: null,
      compensation_preferences: null,
      travel_availability: null,
      technical_requirements: null,
      profile: {
        avatar_url: profile.profile_image_url,
        cultural_affiliations: profile.cultural_affiliations,
        pronouns: profile.preferred_pronouns,
        display_name: profile.display_name,
        bio: profile.bio,
        phone: profile.phone_number,
        social_links: profile.social_links,
        languages_spoken: profile.languages_spoken,
        interests: profile.interests,
        preferred_communication: profile.preferred_communication,
        occupation: profile.current_role,
        timezone: profile.timezone
      }
    }

    return NextResponse.json(storyteller)

  } catch (error) {
    console.error('Storyteller API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params
    const body = await request.json()
    
    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Extract storyteller fields vs profile fields
    const storytellerFields = {
      display_name: body.display_name,
      bio: body.bio,
      cultural_background: body.cultural_background,
      specialties: body.specialties,
      years_of_experience: body.years_of_experience,
      preferred_topics: body.preferred_topics,
      featured: body.featured,
      status: body.status,
      availability: body.availability,
      cultural_protocols: body.cultural_protocols,
      elder_status: body.elder_status,
      community_recognition: body.community_recognition,
      storytelling_style: body.storytelling_style,
      performance_preferences: body.performance_preferences,
      compensation_preferences: body.compensation_preferences,
      travel_availability: body.travel_availability,
      technical_requirements: body.technical_requirements
    }

    // Filter out undefined values
    const filteredStorytellerFields = Object.fromEntries(
      Object.entries(storytellerFields).filter(([_, v]) => v !== undefined)
    )

    // Update storyteller
    const { data: storyteller, error } = await supabase
      .from('storytellers')
      .update({
        ...filteredStorytellerFields,
        updated_at: new Date().toISOString()
      })
      .eq('id', storytellerId)
      .select(`
        *,
        profile:profiles(
          avatar_url,
          cultural_affiliations,
          pronouns,
          display_name,
          bio,
          phone,
          social_links,
          languages_spoken,
          interests,
          preferred_communication,
          occupation,
          timezone
        )
      `)
      .single()

    if (error) {
      console.error('Error updating storyteller:', error)
      return NextResponse.json(
        { error: 'Failed to update storyteller' },
        { status: 500 }
      )
    }

    return NextResponse.json(storyteller)

  } catch (error) {
    console.error('Storyteller update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params
    
    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()

    // Soft delete by setting status to inactive
    const { error } = await supabase
      .from('storytellers')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', storytellerId)

    if (error) {
      console.error('Error deleting storyteller:', error)
      return NextResponse.json(
        { error: 'Failed to delete storyteller' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Storyteller deactivated successfully' })

  } catch (error) {
    console.error('Storyteller deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}