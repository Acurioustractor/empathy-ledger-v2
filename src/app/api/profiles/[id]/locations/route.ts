import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/profiles/[id]/locations
 * Fetch all locations for a profile
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: locations, error } = await supabase
      .from('profile_locations')
      .select(`
        *,
        location:locations(*)
      `)
      .eq('profile_id', id)
      .order('is_primary', { ascending: false })

    if (error) {
      console.error('Error fetching profile locations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch locations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      locations: locations || []
    })
  } catch (error) {
    console.error('Error in GET /api/profiles/[id]/locations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/profiles/[id]/locations
 * Add new locations to a profile
 * Body: { locations: Array<{ location_id, is_primary, location_type }> }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { locations } = body

    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return NextResponse.json(
        { error: 'Locations array is required' },
        { status: 400 }
      )
    }

    // Validate each location
    for (const loc of locations) {
      if (!loc.location_id) {
        return NextResponse.json(
          { error: 'Each location must have a location_id' },
          { status: 400 }
        )
      }
    }

    // Ensure only one primary location
    const primaryCount = locations.filter(l => l.is_primary).length
    if (primaryCount > 1) {
      return NextResponse.json(
        { error: 'Only one primary location is allowed' },
        { status: 400 }
      )
    }

    // Insert locations
    const locationsToInsert = locations.map(loc => ({
      profile_id: id,
      location_id: loc.location_id,
      is_primary: loc.is_primary ?? false,
      location_type: loc.location_type ?? 'current'
    }))

    const { data, error } = await supabase
      .from('profile_locations')
      .insert(locationsToInsert)
      .select()

    if (error) {
      console.error('Error inserting profile locations:', error)
      return NextResponse.json(
        { error: 'Failed to add locations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      locations: data
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/profiles/[id]/locations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/profiles/[id]/locations
 * Delete all locations for a profile (used before adding new ones)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('profile_locations')
      .delete()
      .eq('profile_id', id)

    if (error) {
      console.error('Error deleting profile locations:', error)
      return NextResponse.json(
        { error: 'Failed to delete locations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Locations deleted successfully'
    })

  } catch (error) {
    console.error('Error in DELETE /api/profiles/[id]/locations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}