/**
 * Video Location API
 * GET /api/videos/[id]/location - Get video location
 * PUT /api/videos/[id]/location - Set or update video location
 * DELETE /api/videos/[id]/location - Remove video location
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('video_link_locations')
      .select('*')
      .eq('video_link_id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ location: null })
      }
      throw error
    }

    return NextResponse.json({
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        mapboxPlaceId: data.mapbox_place_id,
        placeName: data.mapbox_place_name,
        indigenousTerritory: data.indigenous_territory,
        traditionalName: data.traditional_name,
        locality: data.locality,
        region: data.region,
        country: data.country,
        source: data.source
      }
    })

  } catch (error) {
    console.error('Error fetching video location:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch location' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseClient()
    const body = await request.json()

    const {
      latitude,
      longitude,
      mapboxPlaceId,
      placeName,
      indigenousTerritory,
      traditionalName,
      locality,
      region,
      country,
      source = 'manual'
    } = body

    // Delete existing location first (upsert on unique constraint)
    await supabase
      .from('video_link_locations')
      .delete()
      .eq('video_link_id', id)

    // Insert new location
    const { data, error } = await supabase
      .from('video_link_locations')
      .insert({
        video_link_id: id,
        latitude,
        longitude,
        mapbox_place_id: mapboxPlaceId,
        mapbox_place_name: placeName,
        indigenous_territory: indigenousTerritory,
        traditional_name: traditionalName,
        locality,
        region,
        country,
        source
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        mapboxPlaceId: data.mapbox_place_id,
        placeName: data.mapbox_place_name,
        indigenousTerritory: data.indigenous_territory,
        traditionalName: data.traditional_name,
        locality: data.locality,
        region: data.region,
        country: data.country,
        source: data.source
      }
    })

  } catch (error) {
    console.error('Error setting video location:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to set location' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseClient()

    const { error } = await supabase
      .from('video_link_locations')
      .delete()
      .eq('video_link_id', id)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error removing video location:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove location' },
      { status: 500 }
    )
  }
}
