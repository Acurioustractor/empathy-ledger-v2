import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const storytellerId = params.id
    
    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Fetch storyteller with profile information
    const { data: storyteller, error } = await supabase
      .from('storytellers')
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
          timezone,
          cultural_background,
          storytelling_experience,
          preferred_name,
          first_name,
          last_name
        )
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

    // Get story count for this storyteller
    const { count: storyCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('storyteller_id', storytellerId)
      .eq('status', 'published')

    // Update the storyteller object with the current story count
    const updatedStoryteller = {
      ...storyteller,
      story_count: storyCount || 0
    }

    return NextResponse.json(updatedStoryteller)

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
  { params }: { params: { id: string } }
) {
  try {
    const storytellerId = params.id
    
    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

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