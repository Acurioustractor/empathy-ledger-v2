// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'



/**
 * GET /api/locations/[id]
 * Fetch a single location by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: location, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching location:', error)
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      location
    })

  } catch (error) {
    console.error('Error in GET /api/locations/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/locations/[id]
 * Update a location record
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const {
      name,
      city,
      state,
      country,
      postal_code,
      latitude,
      longitude,
      description,
      indigenous_territory,
      language_group,
      cultural_significance,
      timezone,
      region_type
    } = body

    // Validate required fields
    if (name && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Location name cannot be empty' },
        { status: 400 }
      )
    }

    // Update location
    const { data: location, error } = await supabase
      .from('locations')
      .update({
        ...(name && { name: name.trim() }),
        ...(city !== undefined && { city: city?.trim() || null }),
        ...(state !== undefined && { state: state?.trim() || null }),
        ...(country !== undefined && { country: country?.trim() || null }),
        ...(postal_code !== undefined && { postal_code: postal_code?.trim() || null }),
        ...(latitude !== undefined && { latitude: latitude || null }),
        ...(longitude !== undefined && { longitude: longitude || null }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(indigenous_territory !== undefined && { indigenous_territory: indigenous_territory?.trim() || null }),
        ...(language_group !== undefined && { language_group: language_group?.trim() || null }),
        ...(cultural_significance !== undefined && { cultural_significance: cultural_significance?.trim() || null }),
        ...(timezone !== undefined && { timezone: timezone?.trim() || null }),
        ...(region_type !== undefined && { region_type: region_type?.trim() || null }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating location:', error)
      return NextResponse.json(
        { error: 'Failed to update location' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      location
    })

  } catch (error) {
    console.error('Error in PUT /api/locations/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/locations/[id]
 * Delete a location record
 * Note: Will fail if location is referenced by other records (FK constraint)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check if location is in use
    const [
      { count: storiesCount },
      { count: transcriptsCount },
      { count: profilesCount },
      { count: orgsCount },
      { count: projectsCount }
    ] = await Promise.all([
      supabase.from('stories').select('*', { count: 'exact', head: true }).eq('location_id', id),
      supabase.from('transcripts').select('*', { count: 'exact', head: true }).eq('location_id', id),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('location_id', id),
      supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('location_id', id),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('location_id', id)
    ])

    const totalUsage = (storiesCount || 0) + (transcriptsCount || 0) + (profilesCount || 0) + (orgsCount || 0) + (projectsCount || 0)

    if (totalUsage > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete location that is in use',
          usage: {
            stories: storiesCount || 0,
            transcripts: transcriptsCount || 0,
            profiles: profilesCount || 0,
            organizations: orgsCount || 0,
            projects: projectsCount || 0
          }
        },
        { status: 409 }
      )
    }

    // Delete location
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting location:', error)
      return NextResponse.json(
        { error: 'Failed to delete location' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Location deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/locations/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}