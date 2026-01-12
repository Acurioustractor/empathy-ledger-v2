/**
 * Auto-Collections API
 * GET /api/media/collections - Get auto-generated collections by type
 *
 * Supports: people, places, projects, time (year/month), tags
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface CollectionItem {
  id: string
  name: string
  description?: string
  count: number
  thumbnail_url?: string
  metadata?: Record<string, any>
}

interface MediaPreview {
  id: string
  title: string
  thumbnail_url: string
  media_type: string
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)

    const type = searchParams.get('type') || 'all' // people, places, projects, time, tags, all
    const limit = parseInt(searchParams.get('limit') || '20')
    const includeMedia = searchParams.get('include_media') === 'true'
    const mediaLimit = parseInt(searchParams.get('media_limit') || '8')

    const collections: Record<string, CollectionItem[]> = {}

    // Helper to get media previews for a collection
    async function getMediaPreviews(mediaIds: string[]): Promise<MediaPreview[]> {
      if (!includeMedia || mediaIds.length === 0) return []

      const { data } = await supabase
        .from('media_assets')
        .select('id, title, thumbnail_url, media_type, created_at')
        .in('id', mediaIds.slice(0, mediaLimit))
        .order('created_at', { ascending: false })

      return (data || []).map(m => ({
        id: m.id,
        title: m.title || 'Untitled',
        thumbnail_url: m.thumbnail_url,
        media_type: m.media_type,
        created_at: m.created_at
      }))
    }

    // ========== PEOPLE COLLECTIONS ==========
    if (type === 'all' || type === 'people') {
      const { data: storytellerData } = await supabase
        .from('media_storytellers')
        .select(`
          storyteller_id,
          media_asset_id,
          storyteller:storytellers!inner(
            id,
            display_name,
            avatar_url,
            bio
          )
        `)
        .not('storyteller_id', 'is', null)
        .eq('consent_status', 'granted')

      // Group by storyteller
      const peopleMap = new Map<string, {
        storyteller: any
        mediaIds: string[]
      }>()

      for (const row of storytellerData || []) {
        const existing = peopleMap.get(row.storyteller_id) || {
          storyteller: row.storyteller,
          mediaIds: []
        }
        existing.mediaIds.push(row.media_asset_id)
        peopleMap.set(row.storyteller_id, existing)
      }

      const peopleCollections: CollectionItem[] = []
      for (const [id, data] of peopleMap) {
        const previews = await getMediaPreviews(data.mediaIds)
        peopleCollections.push({
          id,
          name: data.storyteller?.display_name || 'Unknown',
          description: data.storyteller?.bio,
          count: data.mediaIds.length,
          thumbnail_url: previews[0]?.thumbnail_url || data.storyteller?.avatar_url,
          metadata: {
            avatar_url: data.storyteller?.avatar_url,
            media: previews
          }
        })
      }

      collections.people = peopleCollections
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    }

    // ========== PLACES COLLECTIONS ==========
    if (type === 'all' || type === 'places') {
      const { data: locationData } = await supabase
        .from('media_locations')
        .select(`
          id,
          media_asset_id,
          mapbox_place_name,
          indigenous_territory,
          locality,
          region,
          country,
          latitude,
          longitude
        `)
        .not('mapbox_place_name', 'is', null)

      // Group by place name or indigenous territory
      const placesMap = new Map<string, {
        name: string
        indigenous_territory?: string
        latitude?: number
        longitude?: number
        mediaIds: string[]
      }>()

      for (const row of locationData || []) {
        // Use indigenous territory as primary grouping if available, else place name
        const key = row.indigenous_territory || row.mapbox_place_name || row.locality || 'Unknown'
        const existing = placesMap.get(key) || {
          name: key,
          indigenous_territory: row.indigenous_territory,
          latitude: row.latitude,
          longitude: row.longitude,
          mediaIds: []
        }
        existing.mediaIds.push(row.media_asset_id)
        placesMap.set(key, existing)
      }

      const placesCollections: CollectionItem[] = []
      for (const [key, data] of placesMap) {
        const previews = await getMediaPreviews(data.mediaIds)
        placesCollections.push({
          id: key,
          name: data.name,
          description: data.indigenous_territory ? `${data.indigenous_territory}` : undefined,
          count: data.mediaIds.length,
          thumbnail_url: previews[0]?.thumbnail_url,
          metadata: {
            indigenous_territory: data.indigenous_territory,
            latitude: data.latitude,
            longitude: data.longitude,
            media: previews
          }
        })
      }

      collections.places = placesCollections
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    }

    // ========== PROJECTS COLLECTIONS ==========
    if (type === 'all' || type === 'projects') {
      const { data: projectData } = await supabase
        .from('media_assets')
        .select('id, project_code, thumbnail_url')
        .not('project_code', 'is', null)

      // Group by project
      const projectsMap = new Map<string, string[]>()
      const projectThumbnails = new Map<string, string>()

      for (const row of projectData || []) {
        const existing = projectsMap.get(row.project_code) || []
        existing.push(row.id)
        projectsMap.set(row.project_code, existing)
        if (!projectThumbnails.has(row.project_code) && row.thumbnail_url) {
          projectThumbnails.set(row.project_code, row.thumbnail_url)
        }
      }

      // Project name mapping
      const projectNames: Record<string, { name: string; description: string }> = {
        'empathy-ledger': { name: 'Empathy Ledger', description: 'Digital storytelling platform' },
        'justicehub': { name: 'JusticeHub', description: 'Legal and justice advocacy' },
        'act-farm': { name: 'ACT Farm', description: 'Sustainable farming initiative' },
        'harvest': { name: 'The Harvest', description: 'Community food program' },
        'goods': { name: 'Goods on Country', description: 'Indigenous marketplace' },
        'placemat': { name: 'ACT Placemat', description: 'Cultural dining experience' },
        'studio': { name: 'ACT Studio', description: 'Creative content studio' }
      }

      const projectsCollections: CollectionItem[] = []
      for (const [code, mediaIds] of projectsMap) {
        const previews = await getMediaPreviews(mediaIds)
        const info = projectNames[code] || { name: code, description: '' }
        projectsCollections.push({
          id: code,
          name: info.name,
          description: info.description,
          count: mediaIds.length,
          thumbnail_url: previews[0]?.thumbnail_url || projectThumbnails.get(code),
          metadata: {
            project_code: code,
            media: previews
          }
        })
      }

      collections.projects = projectsCollections
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    }

    // ========== TIME COLLECTIONS (by month/year) ==========
    if (type === 'all' || type === 'time') {
      const { data: timeData } = await supabase
        .from('media_assets')
        .select('id, created_at, thumbnail_url')
        .not('created_at', 'is', null)
        .order('created_at', { ascending: false })

      // Group by year-month
      const timeMap = new Map<string, { year: number; month: number; mediaIds: string[]; thumbnail?: string }>()

      for (const row of timeData || []) {
        const date = new Date(row.created_at)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const key = `${year}-${month.toString().padStart(2, '0')}`

        const existing = timeMap.get(key) || { year, month, mediaIds: [], thumbnail: row.thumbnail_url }
        existing.mediaIds.push(row.id)
        timeMap.set(key, existing)
      }

      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December']

      const timeCollections: CollectionItem[] = []
      for (const [key, data] of timeMap) {
        const previews = await getMediaPreviews(data.mediaIds)
        timeCollections.push({
          id: key,
          name: `${monthNames[data.month - 1]} ${data.year}`,
          count: data.mediaIds.length,
          thumbnail_url: previews[0]?.thumbnail_url || data.thumbnail,
          metadata: {
            year: data.year,
            month: data.month,
            media: previews
          }
        })
      }

      collections.time = timeCollections.slice(0, limit)
    }

    // ========== TAG COLLECTIONS ==========
    if (type === 'all' || type === 'tags') {
      const { data: tagData } = await supabase
        .from('tags')
        .select(`
          id,
          name,
          slug,
          category,
          description,
          usage_count,
          cultural_sensitivity_level
        `)
        .gt('usage_count', 0)
        .order('usage_count', { ascending: false })
        .limit(limit)

      const tagsCollections: CollectionItem[] = []

      for (const tag of tagData || []) {
        // Get media for this tag
        const { data: mediaTagData } = await supabase
          .from('media_tags')
          .select('media_asset_id')
          .eq('tag_id', tag.id)
          .limit(mediaLimit)

        const mediaIds = (mediaTagData || []).map(mt => mt.media_asset_id)
        const previews = await getMediaPreviews(mediaIds)

        tagsCollections.push({
          id: tag.id,
          name: tag.name,
          description: tag.description,
          count: tag.usage_count,
          thumbnail_url: previews[0]?.thumbnail_url,
          metadata: {
            slug: tag.slug,
            category: tag.category,
            cultural_sensitivity_level: tag.cultural_sensitivity_level,
            media: previews
          }
        })
      }

      collections.tags = tagsCollections
    }

    // Calculate totals
    const totals = {
      people: collections.people?.length || 0,
      places: collections.places?.length || 0,
      projects: collections.projects?.length || 0,
      time: collections.time?.length || 0,
      tags: collections.tags?.length || 0
    }

    return NextResponse.json({
      collections,
      totals,
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in GET /api/media/collections:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch collections' },
      { status: 500 }
    )
  }
}
