import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/locations
 * Search locations by name/city/region
 * Query params:
 *   - search: string (required, min 2 chars)
 *   - country: string (optional filter)
 *   - limit: number (default 10, max 50)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search')
    const country = searchParams.get('country')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    if (!search || search.length < 2) {
      return NextResponse.json(
        { error: 'Search term must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Build query with text search across name, city, state
    let query = supabase
      .from('locations')
      .select('*')
      .limit(limit)

    // Search across multiple fields using OR
    query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%`)

    // Filter by country if provided
    if (country) {
      query = query.eq('country', country)
    }

    // Order by relevance (exact name matches first)
    query = query.order('name', { ascending: true })

    const { data: locations, error } = await query

    if (error) {
      console.error('Error fetching locations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch locations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      locations: locations || [],
      count: locations?.length || 0
    })

  } catch (error) {
    console.error('Error in GET /api/locations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/locations
 * Create a new location record
 * Body: LocationInput
 */
export async function POST(request: NextRequest) {
  try {
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
      language_group
    } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      )
    }

    // Check for duplicate location (same name + city + country)
    const { data: existing } = await supabase
      .from('locations')
      .select('id')
      .eq('name', name.trim())
      .eq('city', city || null)
      .eq('country', country || null)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Location already exists', location_id: existing.id },
        { status: 409 }
      )
    }

    // Create new location
    const { data: location, error } = await supabase
      .from('locations')
      .insert({
        name: name.trim(),
        city: city?.trim() || null,
        state: state?.trim() || null,
        country: country?.trim() || 'Australia',
        postal_code: postal_code?.trim() || null,
        latitude: latitude || null,
        longitude: longitude || null,
        description: description?.trim() || null,
        indigenous_territory: indigenous_territory?.trim() || null,
        language_group: language_group?.trim() || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating location:', error)
      return NextResponse.json(
        { error: 'Failed to create location' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      location
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/locations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}