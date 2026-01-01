// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'



/**
 * GET /api/storytellers/search?name=Kristy
 * Search for storytellers by name and get complete profile data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    if (!name) {
      return NextResponse.json(
        { error: 'name parameter is required' },
        { status: 400 }
      )
    }

    // Search profiles by display name
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        bio,
        avatar_url,
        cultural_background,
        cultural_affiliations,
        languages_spoken,
        is_storyteller,
        is_elder,
        traditional_knowledge_keeper,
        storytelling_experience,
        occupation,
        phone,
        social_links,
        created_at,
        updated_at
      `)
      .ilike('display_name', `%${name}%`)
      .limit(10)

    if (error) {
      console.error('Error searching profiles:', error)
      return NextResponse.json(
        { error: 'Failed to search profiles' },
        { status: 500 }
      )
    }

    // For each profile found, get their related data
    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        // Get locations
        const { data: locations } = await supabase
          .from('profile_locations')
          .select(`
            id,
            location_type,
            is_primary,
            location:locations(
              id,
              name,
              city,
              state,
              country,
              traditional_territory
            )
          `)
          .eq('profile_id', profile.id)

        // Get organizations
        const { data: organizations } = await supabase
          .from('profile_organizations')
          .select(`
            id,
            role,
            joined_at,
            is_active,
            organization:organisations(
              id,
              name,
              logo_url
            )
          `)
          .eq('profile_id', profile.id)

        // Get projects
        const { data: projects } = await supabase
          .from('profile_projects')
          .select(`
            id,
            role,
            joined_at,
            is_active,
            project:projects(
              id,
              name,
              status,
              organisation:organisations(name)
            )
          `)
          .eq('profile_id', profile.id)

        // Get transcripts (stories)
        const { data: transcripts, count: transcriptCount } = await supabase
          .from('transcripts')
          .select('*', { count: 'exact' })
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false })

        // Get media
        const { data: media, count: mediaCount } = await supabase
          .from('media')
          .select('*', { count: 'exact' })
          .eq('profile_id', profile.id)

        return {
          ...profile,
          locations: locations || [],
          organizations: organizations || [],
          projects: projects || [],
          transcripts: transcripts || [],
          transcript_count: transcriptCount || 0,
          media: media || [],
          media_count: mediaCount || 0
        }
      })
    )

    return NextResponse.json({
      found: enrichedProfiles.length,
      profiles: enrichedProfiles
    })

  } catch (error) {
    console.error('Error in /api/storytellers/search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
