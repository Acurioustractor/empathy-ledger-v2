import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


/**
 * POST /api/profiles/me/locations
 * Add a location to the current user's profile
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { location_id, location_type, is_public, is_primary } = body

    if (!location_id) {
      return NextResponse.json(
        { error: 'location_id is required' },
        { status: 400 }
      )
    }

    // If setting as primary, unset other primary locations
    if (is_primary) {
      await supabase
        .from('profile_locations')
        .update({ is_primary: false })
        .eq('profile_id', user.id)
    }

    // Add the location
    const { data, error } = await supabase
      .from('profile_locations')
      .insert({
        profile_id: user.id,
        location_id,
        location_type: location_type || 'current',
        is_primary: is_primary || false,
        // Note: is_public field doesn't exist yet in schema
        // Will be added in future migration
      })
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
      .single()

    if (error) {
      console.error('Error adding location:', error)
      return NextResponse.json(
        { error: 'Failed to add location' },
        { status: 500 }
      )
    }

    // Format the response
    const formattedLocation = {
      id: data.id,
      name: data.location?.name || '',
      city: data.location?.city,
      state: data.location?.state,
      country: data.location?.country,
      type: data.location_type || 'current',
      isPublic: is_public !== false, // Default to public
      isPrimary: data.is_primary || false,
      coordinates: data.location?.coordinates,
      traditional_territory: data.location?.traditional_territory
    }

    return NextResponse.json(formattedLocation)

  } catch (error) {
    console.error('Error in POST /api/profiles/me/locations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/profiles/me/locations
 * Remove a location from the current user's profile
 */
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('id')

    if (!locationId) {
      return NextResponse.json(
        { error: 'location id is required' },
        { status: 400 }
      )
    }

    // Delete the location link (not the location itself, just the profile_locations record)
    const { error } = await supabase
      .from('profile_locations')
      .delete()
      .eq('id', locationId)
      .eq('profile_id', user.id) // Security: only delete own locations

    if (error) {
      console.error('Error deleting location:', error)
      return NextResponse.json(
        { error: 'Failed to delete location' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in DELETE /api/profiles/me/locations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/profiles/me/locations
 * Update a location's visibility or primary status
 */
export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const { id, is_public, is_primary } = body

    if (!id) {
      return NextResponse.json(
        { error: 'location id is required' },
        { status: 400 }
      )
    }

    // If setting as primary, unset other primary locations
    if (is_primary) {
      await supabase
        .from('profile_locations')
        .update({ is_primary: false })
        .eq('profile_id', user.id)
    }

    const updates: any = {}
    if (typeof is_primary === 'boolean') {
      updates.is_primary = is_primary
    }
    // Note: is_public will be added when schema is updated

    // Update the location
    const { data, error } = await supabase
      .from('profile_locations')
      .update(updates)
      .eq('id', id)
      .eq('profile_id', user.id) // Security: only update own locations
      .select()
      .single()

    if (error) {
      console.error('Error updating location:', error)
      return NextResponse.json(
        { error: 'Failed to update location' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Error in PATCH /api/profiles/me/locations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
