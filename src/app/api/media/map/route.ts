/**
 * Media Map API
 * GET /api/media/map - Get all media with location data for map visualization
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface MapMediaItem {
  id: string
  title: string
  thumbnail_url: string
  media_type: string
  latitude: number
  longitude: number
  place_name?: string
  indigenous_territory?: string
  created_at: string
  tags?: string[]
  storytellers?: Array<{
    id: string
    name: string
  }>
}

export interface MapCluster {
  id: string
  latitude: number
  longitude: number
  count: number
  place_name?: string
  indigenous_territory?: string
  media: MapMediaItem[]
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)

    // Filtering options
    const bounds = searchParams.get('bounds') // sw_lat,sw_lng,ne_lat,ne_lng
    const projectCode = searchParams.get('project')
    const tagId = searchParams.get('tag')
    const storytellerId = searchParams.get('storyteller')
    const cluster = searchParams.get('cluster') === 'true'
    const clusterPrecision = parseInt(searchParams.get('precision') || '2') // Decimal places for clustering

    // Base query - get all media with locations
    let query = supabase
      .from('media_locations')
      .select(`
        id,
        media_asset_id,
        latitude,
        longitude,
        mapbox_place_name,
        indigenous_territory,
        locality,
        region,
        country,
        media_asset:media_assets!inner(
          id,
          title,
          thumbnail_url,
          media_type,
          created_at,
          project_code
        )
      `)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    // Apply bounds filter
    if (bounds) {
      const [swLat, swLng, neLat, neLng] = bounds.split(',').map(Number)
      query = query
        .gte('latitude', swLat)
        .lte('latitude', neLat)
        .gte('longitude', swLng)
        .lte('longitude', neLng)
    }

    const { data: locationData, error: locationError } = await query

    if (locationError) {
      console.error('Error fetching locations:', locationError)
      return NextResponse.json(
        { error: 'Failed to fetch media locations' },
        { status: 500 }
      )
    }

    // Get additional data (tags and storytellers) for each media
    const mediaIds = (locationData || []).map(l => l.media_asset_id)

    // Get tags for all media
    const { data: tagsData } = await supabase
      .from('media_tags')
      .select(`
        media_asset_id,
        tag:tags(id, name)
      `)
      .in('media_asset_id', mediaIds)

    // Get storytellers for all media
    const { data: storytellersData } = await supabase
      .from('media_storytellers')
      .select(`
        media_asset_id,
        storyteller:storytellers(id, display_name)
      `)
      .in('media_asset_id', mediaIds)
      .eq('consent_status', 'granted')

    // Build tag and storyteller maps
    const tagMap = new Map<string, string[]>()
    for (const row of tagsData || []) {
      const existing = tagMap.get(row.media_asset_id) || []
      if (row.tag) {
        existing.push((row.tag as any).name)
      }
      tagMap.set(row.media_asset_id, existing)
    }

    const storytellerMap = new Map<string, Array<{ id: string; name: string }>>()
    for (const row of storytellersData || []) {
      const existing = storytellerMap.get(row.media_asset_id) || []
      if (row.storyteller) {
        existing.push({
          id: (row.storyteller as any).id,
          name: (row.storyteller as any).display_name
        })
      }
      storytellerMap.set(row.media_asset_id, existing)
    }

    // Transform to map items
    let mapItems: MapMediaItem[] = (locationData || [])
      .filter(loc => loc.media_asset)
      .map(loc => {
        const media = loc.media_asset as any
        return {
          id: media.id,
          title: media.title || 'Untitled',
          thumbnail_url: media.thumbnail_url,
          media_type: media.media_type,
          latitude: loc.latitude,
          longitude: loc.longitude,
          place_name: loc.mapbox_place_name || loc.locality,
          indigenous_territory: loc.indigenous_territory,
          created_at: media.created_at,
          tags: tagMap.get(media.id) || [],
          storytellers: storytellerMap.get(media.id) || []
        }
      })

    // Apply additional filters
    if (projectCode) {
      const { data: projectMedia } = await supabase
        .from('media_assets')
        .select('id')
        .eq('project_code', projectCode)

      const projectIds = new Set((projectMedia || []).map(m => m.id))
      mapItems = mapItems.filter(item => projectIds.has(item.id))
    }

    if (tagId) {
      const { data: tagMedia } = await supabase
        .from('media_tags')
        .select('media_asset_id')
        .eq('tag_id', tagId)

      const tagMediaIds = new Set((tagMedia || []).map(m => m.media_asset_id))
      mapItems = mapItems.filter(item => tagMediaIds.has(item.id))
    }

    if (storytellerId) {
      const { data: storytellerMedia } = await supabase
        .from('media_storytellers')
        .select('media_asset_id')
        .eq('storyteller_id', storytellerId)
        .eq('consent_status', 'granted')

      const storytellerMediaIds = new Set((storytellerMedia || []).map(m => m.media_asset_id))
      mapItems = mapItems.filter(item => storytellerMediaIds.has(item.id))
    }

    // Cluster if requested
    if (cluster && mapItems.length > 0) {
      const clusters = clusterMediaByLocation(mapItems, clusterPrecision)

      return NextResponse.json({
        type: 'clustered',
        clusters,
        total_items: mapItems.length,
        total_clusters: clusters.length
      })
    }

    // Return individual items
    return NextResponse.json({
      type: 'items',
      items: mapItems,
      total: mapItems.length,
      bounds: mapItems.length > 0 ? calculateBounds(mapItems) : null
    })

  } catch (error) {
    console.error('Error in GET /api/media/map:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch map data' },
      { status: 500 }
    )
  }
}

// Helper to cluster media by rounded coordinates
function clusterMediaByLocation(items: MapMediaItem[], precision: number): MapCluster[] {
  const clusterMap = new Map<string, MapMediaItem[]>()

  for (const item of items) {
    // Round coordinates to create cluster keys
    const lat = item.latitude.toFixed(precision)
    const lng = item.longitude.toFixed(precision)
    const key = `${lat},${lng}`

    const existing = clusterMap.get(key) || []
    existing.push(item)
    clusterMap.set(key, existing)
  }

  const clusters: MapCluster[] = []
  let clusterId = 0

  for (const [key, media] of clusterMap) {
    // Calculate centroid
    const avgLat = media.reduce((sum, m) => sum + m.latitude, 0) / media.length
    const avgLng = media.reduce((sum, m) => sum + m.longitude, 0) / media.length

    // Get most common place name and indigenous territory
    const placeCounts = new Map<string, number>()
    const territoryCounts = new Map<string, number>()

    for (const m of media) {
      if (m.place_name) {
        placeCounts.set(m.place_name, (placeCounts.get(m.place_name) || 0) + 1)
      }
      if (m.indigenous_territory) {
        territoryCounts.set(m.indigenous_territory, (territoryCounts.get(m.indigenous_territory) || 0) + 1)
      }
    }

    const topPlace = Array.from(placeCounts.entries()).sort((a, b) => b[1] - a[1])[0]
    const topTerritory = Array.from(territoryCounts.entries()).sort((a, b) => b[1] - a[1])[0]

    clusters.push({
      id: `cluster-${clusterId++}`,
      latitude: avgLat,
      longitude: avgLng,
      count: media.length,
      place_name: topPlace?.[0],
      indigenous_territory: topTerritory?.[0],
      media: media.slice(0, 10) // Limit preview media
    })
  }

  return clusters.sort((a, b) => b.count - a.count)
}

// Helper to calculate bounding box
function calculateBounds(items: MapMediaItem[]) {
  if (items.length === 0) return null

  let minLat = Infinity, maxLat = -Infinity
  let minLng = Infinity, maxLng = -Infinity

  for (const item of items) {
    minLat = Math.min(minLat, item.latitude)
    maxLat = Math.max(maxLat, item.latitude)
    minLng = Math.min(minLng, item.longitude)
    maxLng = Math.max(maxLng, item.longitude)
  }

  return {
    southwest: { lat: minLat, lng: minLng },
    northeast: { lat: maxLat, lng: maxLng }
  }
}
