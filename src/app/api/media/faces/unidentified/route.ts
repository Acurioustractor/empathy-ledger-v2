/**
 * Unidentified Faces API
 * GET /api/media/faces/unidentified - Get faces not yet linked to storytellers
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()

    // Get all media with face detection that hasn't been linked
    const { data: mediaWithFaces, error } = await supabase
      .from('media_assets')
      .select(`
        id,
        title,
        thumbnail_url,
        face_detection_count,
        created_at
      `)
      .gt('face_detection_count', 0)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching media with faces:', error)
      return NextResponse.json(
        { error: 'Failed to fetch faces' },
        { status: 500 }
      )
    }

    // Get all linked storytellers for these media
    const mediaIds = (mediaWithFaces || []).map(m => m.id)

    const { data: linkedStorytellers } = await supabase
      .from('media_storytellers')
      .select('media_asset_id, storyteller_id')
      .in('media_asset_id', mediaIds)
      .in('relationship', ['appears_in', 'tagged_by_face', 'subject'])

    // Create a map of media_id -> linked count
    const linkedCounts = new Map<string, number>()
    for (const link of linkedStorytellers || []) {
      const count = linkedCounts.get(link.media_asset_id) || 0
      linkedCounts.set(link.media_asset_id, count + 1)
    }

    // Filter to media where face_detection_count > linked count
    // This means there are unidentified faces
    const unlinkedFaces = (mediaWithFaces || [])
      .filter(m => {
        const linked = linkedCounts.get(m.id) || 0
        return m.face_detection_count > linked
      })
      .map(m => ({
        id: m.id,
        media_asset_id: m.id,
        thumbnail_url: m.thumbnail_url,
        media_title: m.title || 'Untitled',
        face_location: { x: 0, y: 0, width: 100, height: 100 }, // Placeholder
        created_at: m.created_at,
        unidentified_count: m.face_detection_count - (linkedCounts.get(m.id) || 0)
      }))

    // Group similar faces (placeholder - would use face encodings in real implementation)
    // For now, we'll group by time proximity as a simple heuristic
    const groups = groupFacesByTime(unlinkedFaces)

    return NextResponse.json({
      groups,
      unlinked: unlinkedFaces.filter(f => !groups.some(g => g.faces.some(gf => gf.id === f.id))),
      total_unidentified: unlinkedFaces.reduce((sum, f) => sum + f.unidentified_count, 0)
    })

  } catch (error) {
    console.error('Error in GET /api/media/faces/unidentified:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch unidentified faces' },
      { status: 500 }
    )
  }
}

// Simple grouping by time proximity (placeholder for face encoding similarity)
function groupFacesByTime(faces: any[]): any[] {
  if (faces.length < 2) return []

  const groups: any[] = []
  const grouped = new Set<string>()

  // Sort by date
  const sorted = [...faces].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  for (let i = 0; i < sorted.length; i++) {
    if (grouped.has(sorted[i].id)) continue

    const group = {
      id: `group-${i}`,
      faces: [sorted[i]],
      suggested_storyteller: null
    }

    // Find faces within 1 hour
    for (let j = i + 1; j < sorted.length; j++) {
      if (grouped.has(sorted[j].id)) continue

      const timeDiff = Math.abs(
        new Date(sorted[i].created_at).getTime() -
        new Date(sorted[j].created_at).getTime()
      )

      if (timeDiff < 3600000) { // 1 hour
        group.faces.push(sorted[j])
        grouped.add(sorted[j].id)
      }
    }

    if (group.faces.length > 1) {
      grouped.add(sorted[i].id)
      groups.push(group)
    }
  }

  return groups
}
