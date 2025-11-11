import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


/**
 * GET /api/profiles/me
 * Fetches the current user's profile with all relationships:
 * - Organizations
 * - Projects
 * - Locations
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    // Fetch organizations
    const { data: organizations, error: orgsError } = await supabase
      .from('profile_organizations')
      .select(`
        id,
        role,
        joined_at,
        is_active,
        organization:organisations!profile_organizations_organization_id_fkey(
          id,
          name,
          logo_url
        )
      `)
      .eq('profile_id', user.id)
      .order('joined_at', { ascending: false })

    if (orgsError) {
      console.error('Error fetching organizations:', orgsError)
    }

    // Fetch projects
    const { data: projects, error: projectsError } = await supabase
      .from('profile_projects')
      .select(`
        id,
        role,
        joined_at,
        is_active,
        project:projects!profile_projects_project_id_fkey(
          id,
          name,
          status,
          organisation:organisations!projects_organisation_id_fkey(
            name
          )
        )
      `)
      .eq('profile_id', user.id)
      .order('joined_at', { ascending: false })

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
    }

    // Fetch locations
    const { data: locations, error: locationsError } = await supabase
      .from('profile_locations')
      .select(`
        id,
        location_type,
        is_primary,
        created_at,
        location:locations!profile_locations_location_id_fkey(
          id,
          name,
          city,
          state,
          country,
          coordinates,
          traditional_territory
        )
      `)
      .eq('profile_id', user.id)
      .order('is_primary', { ascending: false })

    if (locationsError) {
      console.error('Error fetching locations:', locationsError)
    }

    // Fetch story count (transcripts)
    const { count: storyCount } = await supabase
      .from('transcripts')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id)
      .in('status', ['completed', 'published'])

    // Format the response
    const formattedOrganizations = organizations?.map(org => ({
      id: org.organization?.id || '',
      name: org.organization?.name || '',
      role: org.role || 'member',
      joined_at: org.joined_at,
      is_active: org.is_active,
      logo_url: org.organization?.logo_url
    })) || []

    const formattedProjects = projects?.map(proj => ({
      id: proj.project?.id || '',
      name: proj.project?.name || '',
      organization_name: proj.project?.organisation?.name || '',
      role: proj.role || 'member',
      joined_at: proj.joined_at,
      is_active: proj.is_active,
      status: proj.project?.status || 'active'
    })) || []

    const formattedLocations = locations?.map(loc => ({
      id: loc.id,
      name: loc.location?.name || '',
      city: loc.location?.city,
      state: loc.location?.state,
      country: loc.location?.country,
      type: loc.location_type || 'current',
      isPublic: true, // TODO: Add visibility field to profile_locations
      isPrimary: loc.is_primary || false,
      coordinates: loc.location?.coordinates,
      traditional_territory: loc.location?.traditional_territory
    })) || []

    return NextResponse.json({
      profile,
      organizations: formattedOrganizations,
      projects: formattedProjects,
      locations: formattedLocations,
      storyCount: storyCount || 0
    })

  } catch (error) {
    console.error('Error in /api/profiles/me:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
