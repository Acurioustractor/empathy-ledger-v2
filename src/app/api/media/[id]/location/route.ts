/**
 * Media Location API
 * GET /api/media/[id]/location - Get location for a media item
 * PUT /api/media/[id]/location - Set/update location
 * DELETE /api/media/[id]/location - Remove location
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface LocationData {
  latitude: number
  longitude: number
  placeName?: string
  placeId?: string
  indigenousTerritory?: string
  traditionalName?: string
  source?: 'manual' | 'exif' | 'mapbox_search' | 'mapbox_click'
}

// GET - Get location for a media item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient()
    const { id: mediaId } = params

    const { data: location, error } = await supabase
      .from('media_locations')
      .select('*')
      .eq('media_asset_id', mediaId)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!location) {
      return NextResponse.json({ location: null })
    }

    return NextResponse.json({
      location: {
        id: location.id,
        latitude: location.latitude,
        longitude: location.longitude,
        placeName: location.mapbox_place_name,
        placeId: location.mapbox_place_id,
        indigenousTerritory: location.indigenous_territory,
        traditionalName: location.traditional_name,
        source: location.source,
        createdAt: location.created_at,
        updatedAt: location.updated_at
      }
    })

  } catch (error) {
    console.error('Error in GET /api/media/[id]/location:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch location' },
      { status: 500 }
    )
  }
}

// PUT - Set or update location
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient()
    const { id: mediaId } = params
    const body: LocationData = await request.json()

    const {
      latitude,
      longitude,
      placeName,
      placeId,
      indigenousTerritory,
      traditionalName,
      source = 'manual'
    } = body

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    // Check if location already exists
    const { data: existing } = await supabase
      .from('media_locations')
      .select('id')
      .eq('media_asset_id', mediaId)
      .single()

    const locationData = {
      media_asset_id: mediaId,
      latitude,
      longitude,
      mapbox_place_name: placeName || null,
      mapbox_place_id: placeId || null,
      indigenous_territory: indigenousTerritory || null,
      traditional_name: traditionalName || null,
      source,
      updated_at: new Date().toISOString()
    }

    let result
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('media_locations')
        .update(locationData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('media_locations')
        .insert(locationData)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({
      success: true,
      location: {
        id: result.id,
        latitude: result.latitude,
        longitude: result.longitude,
        placeName: result.mapbox_place_name,
        placeId: result.mapbox_place_id,
        indigenousTerritory: result.indigenous_territory,
        traditionalName: result.traditional_name,
        source: result.source
      }
    })

  } catch (error) {
    console.error('Error in PUT /api/media/[id]/location:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update location' },
      { status: 500 }
    )
  }
}

// DELETE - Remove location
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient()
    const { id: mediaId } = params

    const { error } = await supabase
      .from('media_locations')
      .delete()
      .eq('media_asset_id', mediaId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Location removed'
    })

  } catch (error) {
    console.error('Error in DELETE /api/media/[id]/location:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete location' },
      { status: 500 }
    )
  }
}
