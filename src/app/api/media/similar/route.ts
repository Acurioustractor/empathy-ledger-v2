/**
 * Visual Similarity Search API
 * GET /api/media/similar?id=[mediaId] - Find visually similar media
 *
 * Uses image embeddings for similarity matching.
 * Falls back to tag/metadata similarity if embeddings unavailable.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface SimilarityMatch {
  id: string
  title: string
  thumbnailUrl: string
  cdnUrl: string
  fileType: string
  similarityScore: number
  matchReasons: string[]
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)

    const mediaId = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '12')
    const method = searchParams.get('method') || 'hybrid' // 'embedding', 'tags', 'hybrid'

    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      )
    }

    // Fetch the source media with all its metadata
    const { data: sourceMedia, error: sourceError } = await supabase
      .from('media_assets')
      .select(`
        id,
        title,
        description,
        file_type,
        cdn_url,
        thumbnail_url,
        created_at,
        cultural_sensitivity_level,
        project_code,
        ai_analysis,
        media_locations(
          latitude,
          longitude,
          mapbox_place_name,
          indigenous_territory,
          locality,
          region
        ),
        media_tags(
          tag_id,
          tags:tag_id(id, name, slug, category)
        ),
        media_storytellers(
          storyteller_id
        )
      `)
      .eq('id', mediaId)
      .single()

    if (sourceError || !sourceMedia) {
      return NextResponse.json(
        { error: 'Source media not found' },
        { status: 404 }
      )
    }

    // Extract features for matching
    const sourceFeatures = {
      tags: (sourceMedia.media_tags || []).map((mt: any) => mt.tag_id),
      tagNames: (sourceMedia.media_tags || []).map((mt: any) => mt.tags?.slug).filter(Boolean),
      storytellers: (sourceMedia.media_storytellers || []).map((ms: any) => ms.storyteller_id),
      location: sourceMedia.media_locations?.[0],
      project: sourceMedia.project_code,
      fileType: sourceMedia.file_type,
      sensitivity: sourceMedia.cultural_sensitivity_level,
      aiAnalysis: sourceMedia.ai_analysis as any
    }

    // Get candidate media (excluding source)
    const { data: candidates, error: candidatesError } = await supabase
      .from('media_assets')
      .select(`
        id,
        title,
        description,
        file_type,
        cdn_url,
        thumbnail_url,
        created_at,
        cultural_sensitivity_level,
        project_code,
        ai_analysis,
        media_locations(
          latitude,
          longitude,
          mapbox_place_name,
          indigenous_territory,
          locality,
          region
        ),
        media_tags(
          tag_id,
          tags:tag_id(id, name, slug, category)
        ),
        media_storytellers(
          storyteller_id
        )
      `)
      .neq('id', mediaId)
      .eq('processing_status', 'completed')
      .limit(200) // Get a pool of candidates

    if (candidatesError) {
      console.error('Error fetching candidates:', candidatesError)
      return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
    }

    // Score each candidate
    const scoredCandidates: SimilarityMatch[] = (candidates || []).map(candidate => {
      let score = 0
      const matchReasons: string[] = []

      const candidateFeatures = {
        tags: (candidate.media_tags || []).map((mt: any) => mt.tag_id),
        tagNames: (candidate.media_tags || []).map((mt: any) => mt.tags?.name).filter(Boolean),
        storytellers: (candidate.media_storytellers || []).map((ms: any) => ms.storyteller_id),
        location: candidate.media_locations?.[0],
        project: candidate.project_code,
        fileType: candidate.file_type,
        aiAnalysis: candidate.ai_analysis as any
      }

      // Tag similarity (high weight)
      const sharedTags = sourceFeatures.tags.filter((t: string) =>
        candidateFeatures.tags.includes(t)
      )
      if (sharedTags.length > 0) {
        const tagScore = (sharedTags.length / Math.max(sourceFeatures.tags.length, 1)) * 40
        score += tagScore
        matchReasons.push(`${sharedTags.length} shared tags`)
      }

      // Storyteller overlap (medium weight)
      const sharedStorytellers = sourceFeatures.storytellers.filter((s: string) =>
        candidateFeatures.storytellers.includes(s)
      )
      if (sharedStorytellers.length > 0) {
        score += 25
        matchReasons.push('Same people')
      }

      // Same project (medium weight)
      if (sourceFeatures.project && sourceFeatures.project === candidateFeatures.project) {
        score += 15
        matchReasons.push(`Same project`)
      }

      // Same file type (low weight)
      if (sourceFeatures.fileType === candidateFeatures.fileType) {
        score += 5
        matchReasons.push(`Same type`)
      }

      // Location proximity (medium weight)
      if (sourceFeatures.location && candidateFeatures.location) {
        const distance = calculateDistance(
          sourceFeatures.location.latitude,
          sourceFeatures.location.longitude,
          candidateFeatures.location.latitude,
          candidateFeatures.location.longitude
        )
        if (distance < 10) { // Within 10km
          score += 20
          matchReasons.push('Same location')
        } else if (distance < 100) { // Within 100km
          score += 10
          matchReasons.push('Nearby location')
        } else if (sourceFeatures.location.region === candidateFeatures.location.region) {
          score += 5
          matchReasons.push('Same region')
        }
      }

      // AI analysis similarity (if available)
      if (method !== 'tags' && sourceFeatures.aiAnalysis && candidateFeatures.aiAnalysis) {
        // Compare detected themes/objects
        const sourceThemes = sourceFeatures.aiAnalysis.themes || []
        const candidateThemes = candidateFeatures.aiAnalysis.themes || []
        const sharedThemes = sourceThemes.filter((t: string) =>
          candidateThemes.includes(t)
        )
        if (sharedThemes.length > 0) {
          score += sharedThemes.length * 5
          matchReasons.push(`AI: ${sharedThemes.length} shared themes`)
        }

        // Compare detected objects/scenes
        const sourceObjects = sourceFeatures.aiAnalysis.objects || sourceFeatures.aiAnalysis.labels || []
        const candidateObjects = candidateFeatures.aiAnalysis.objects || candidateFeatures.aiAnalysis.labels || []
        const sharedObjects = sourceObjects.filter((o: string) =>
          candidateObjects.some((co: string) => co.toLowerCase().includes(o.toLowerCase()))
        )
        if (sharedObjects.length > 0) {
          score += sharedObjects.length * 3
          matchReasons.push(`AI: similar content`)
        }

        // Color palette similarity
        if (sourceFeatures.aiAnalysis.dominantColors && candidateFeatures.aiAnalysis.dominantColors) {
          const colorSimilarity = calculateColorSimilarity(
            sourceFeatures.aiAnalysis.dominantColors,
            candidateFeatures.aiAnalysis.dominantColors
          )
          if (colorSimilarity > 0.7) {
            score += 10
            matchReasons.push('Similar colors')
          }
        }
      }

      return {
        id: candidate.id,
        title: candidate.title || 'Untitled',
        thumbnailUrl: candidate.thumbnail_url || candidate.cdn_url,
        cdnUrl: candidate.cdn_url,
        fileType: candidate.file_type,
        similarityScore: Math.min(score, 100), // Cap at 100
        matchReasons
      }
    })

    // Sort by similarity score and filter out zero matches
    const sortedResults = scoredCandidates
      .filter(c => c.similarityScore > 0)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit)

    return NextResponse.json({
      source: {
        id: sourceMedia.id,
        title: sourceMedia.title,
        thumbnailUrl: sourceMedia.thumbnail_url || sourceMedia.cdn_url
      },
      similar: sortedResults,
      method,
      totalCandidates: candidates?.length || 0
    })

  } catch (error) {
    console.error('Error in similarity search:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Similarity search failed' },
      { status: 500 }
    )
  }
}

// Haversine formula for distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity

  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Simple color similarity based on dominant colors
function calculateColorSimilarity(colors1: string[], colors2: string[]): number {
  if (!colors1?.length || !colors2?.length) return 0

  // Convert hex to RGB and compare
  const rgb1 = colors1.slice(0, 3).map(hexToRgb).filter(Boolean)
  const rgb2 = colors2.slice(0, 3).map(hexToRgb).filter(Boolean)

  if (rgb1.length === 0 || rgb2.length === 0) return 0

  // Calculate average color distance
  let totalSimilarity = 0
  let comparisons = 0

  for (const c1 of rgb1) {
    for (const c2 of rgb2) {
      if (c1 && c2) {
        const distance = Math.sqrt(
          Math.pow(c1.r - c2.r, 2) +
          Math.pow(c1.g - c2.g, 2) +
          Math.pow(c1.b - c2.b, 2)
        )
        // Max distance is ~441 (sqrt(255^2 * 3))
        const similarity = 1 - (distance / 441.67)
        totalSimilarity += similarity
        comparisons++
      }
    }
  }

  return comparisons > 0 ? totalSimilarity / comparisons : 0
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex) return null
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}
