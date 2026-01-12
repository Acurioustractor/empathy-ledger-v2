/**
 * Video Link Detail API
 * GET /api/videos/[id] - Get a single video link with all metadata
 * PUT /api/videos/[id] - Update a video link
 * DELETE /api/videos/[id] - Delete a video link
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

    const { data: video, error } = await supabase
      .from('video_links')
      .select(`
        id,
        title,
        description,
        video_url,
        embed_url,
        platform,
        thumbnail_url,
        custom_thumbnail_url,
        duration,
        recorded_at,
        project_code,
        cultural_sensitivity_level,
        requires_elder_approval,
        status,
        processing_notes,
        created_at,
        updated_at,
        video_link_tags(
          id,
          tag_id,
          source,
          tags:tag_id(id, name, slug, category)
        ),
        video_link_storytellers(
          id,
          storyteller_id,
          relationship,
          consent_status,
          storytellers:storyteller_id(id, display_name, avatar_url)
        ),
        video_link_locations(
          id,
          latitude,
          longitude,
          mapbox_place_id,
          mapbox_place_name,
          indigenous_territory,
          traditional_name,
          locality,
          region,
          country
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Video not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.video_url,
        embedUrl: video.embed_url,
        platform: video.platform,
        thumbnailUrl: video.custom_thumbnail_url || video.thumbnail_url,
        customThumbnailUrl: video.custom_thumbnail_url,
        autoThumbnailUrl: video.thumbnail_url,
        duration: video.duration,
        recordedAt: video.recorded_at,
        project: video.project_code,
        sensitivityLevel: video.cultural_sensitivity_level,
        requiresElderApproval: video.requires_elder_approval,
        status: video.status,
        processingNotes: video.processing_notes,
        createdAt: video.created_at,
        updatedAt: video.updated_at,
        tags: (video.video_link_tags || []).map((vt: any) => ({
          id: vt.tags?.id,
          name: vt.tags?.name,
          slug: vt.tags?.slug,
          category: vt.tags?.category,
          source: vt.source
        })).filter((t: any) => t.id),
        storytellers: (video.video_link_storytellers || []).map((vs: any) => ({
          id: vs.storytellers?.id,
          name: vs.storytellers?.display_name,
          imageUrl: vs.storytellers?.avatar_url,
          relationship: vs.relationship,
          consentStatus: vs.consent_status
        })).filter((s: any) => s.id),
        location: video.video_link_locations?.[0] ? {
          placeName: video.video_link_locations[0].mapbox_place_name,
          locality: video.video_link_locations[0].locality,
          region: video.video_link_locations[0].region,
          country: video.video_link_locations[0].country,
          indigenousTerritory: video.video_link_locations[0].indigenous_territory,
          traditionalName: video.video_link_locations[0].traditional_name,
          latitude: video.video_link_locations[0].latitude,
          longitude: video.video_link_locations[0].longitude
        } : null
      }
    })

  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch video' },
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
      title,
      description,
      customThumbnailUrl,
      duration,
      recordedAt,
      projectCode,
      organizationId,
      projectId,
      culturalSensitivityLevel,
      requiresElderApproval,
      status,
      tags,
      storytellers,
      location
    } = body

    // Build update object (only include provided fields)
    const updates: Record<string, any> = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (customThumbnailUrl !== undefined) updates.custom_thumbnail_url = customThumbnailUrl
    if (duration !== undefined) updates.duration = duration
    if (recordedAt !== undefined) updates.recorded_at = recordedAt
    if (projectCode !== undefined) updates.project_code = projectCode
    if (organizationId !== undefined) updates.organization_id = organizationId || null
    if (projectId !== undefined) updates.project_id = projectId || null
    if (culturalSensitivityLevel !== undefined) updates.cultural_sensitivity_level = culturalSensitivityLevel
    if (requiresElderApproval !== undefined) updates.requires_elder_approval = requiresElderApproval
    if (status !== undefined) updates.status = status

    // Update video if there are changes
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('video_links')
        .update(updates)
        .eq('id', id)

      if (updateError) {
        throw updateError
      }
    }

    // Update tags if provided
    if (tags !== undefined) {
      // Remove existing tags
      await supabase.from('video_link_tags').delete().eq('video_link_id', id)

      // Add new tags
      if (tags.length > 0) {
        const tagRecords = tags.map((tagId: string) => ({
          video_link_id: id,
          tag_id: tagId,
          source: 'manual'
        }))
        await supabase.from('video_link_tags').insert(tagRecords)
      }
    }

    // Update storytellers if provided
    if (storytellers !== undefined) {
      // Remove existing storytellers
      await supabase.from('video_link_storytellers').delete().eq('video_link_id', id)

      // Add new storytellers
      if (storytellers.length > 0) {
        const storytellerRecords = storytellers.map((s: any) => ({
          video_link_id: id,
          storyteller_id: s.id,
          relationship: s.relationship || 'appears_in',
          consent_status: s.consentStatus || 'pending',
          source: 'manual'
        }))
        await supabase.from('video_link_storytellers').insert(storytellerRecords)
      }
    }

    // Update location if provided
    if (location !== undefined) {
      // Remove existing location
      await supabase.from('video_link_locations').delete().eq('video_link_id', id)

      // Add new location if not null
      if (location) {
        await supabase.from('video_link_locations').insert({
          video_link_id: id,
          latitude: location.latitude,
          longitude: location.longitude,
          mapbox_place_id: location.mapboxPlaceId,
          mapbox_place_name: location.placeName,
          indigenous_territory: location.indigenousTerritory,
          traditional_name: location.traditionalName,
          locality: location.locality,
          region: location.region,
          country: location.country,
          source: 'manual'
        })
      }
    }

    // Fetch and return updated video
    const { data: video, error: fetchError } = await supabase
      .from('video_links')
      .select(`
        id,
        title,
        description,
        video_url,
        embed_url,
        platform,
        thumbnail_url,
        custom_thumbnail_url,
        status,
        updated_at
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    return NextResponse.json({
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.video_url,
        embedUrl: video.embed_url,
        platform: video.platform,
        thumbnailUrl: video.custom_thumbnail_url || video.thumbnail_url,
        status: video.status,
        updatedAt: video.updated_at
      }
    })

  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update video' },
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

    // Check if video exists
    const { data: existing, error: checkError } = await supabase
      .from('video_links')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Delete video (cascade will handle junction tables)
    const { error: deleteError } = await supabase
      .from('video_links')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete video' },
      { status: 500 }
    )
  }
}
