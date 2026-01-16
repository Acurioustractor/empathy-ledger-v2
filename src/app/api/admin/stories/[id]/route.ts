// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdminAuth } from '@/lib/middleware/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

/**
 * GET /api/admin/stories/[id]
 *
 * Returns a single story with full details including author info
 * Super admin only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require super admin authentication (includes admin check)
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()
  const { id: storyId } = await params

  try {
    console.log(`📖 Fetching story: ${storyId}`)

    // Fetch the story with author info
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select(`
        *,
        organization:organization_id(id, name, slug)
      `)
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      console.error('❌ Story not found:', storyError)
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Fetch author info from storytellers table
    let author = null
    if (story.storyteller_id) {
      const { data: storyteller } = await supabase
        .from('storytellers')
        .select('id, profile_id, display_name, avatar_url, cultural_background, bio, language_skills, is_active')
        .eq('id', story.storyteller_id)
        .single()

      if (storyteller) {
        author = {
          ...storyteller,
          // Map for backward compatibility with frontend
          cultural_affiliations: storyteller.cultural_background
        }
      }
    } else if (story.author_id) {
      // Fallback to profiles if no storyteller_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, cultural_affiliations')
        .eq('id', story.author_id)
        .single()

      author = profile
    }

    // Fetch transcript info if linked
    let transcript = null
    if (story.transcript_id) {
      const { data: transcriptData } = await supabase
        .from('transcripts')
        .select(`
          id,
          title,
          word_count,
          duration,
          ai_summary,
          themes,
          project:project_id(name)
        `)
        .eq('id', story.transcript_id)
        .single()

      if (transcriptData) {
        transcript = {
          ...transcriptData,
          project_name: (transcriptData.project as any)?.name
        }
      }
    }

    // Fetch transcript analysis if available
    let transcript_analysis = null
    if (story.transcript_id) {
      const { data: analysisData } = await supabase
        .from('transcript_analysis_results')
        .select('themes, key_concepts, cultural_elements, sentiment, key_quotes')
        .eq('transcript_id', story.transcript_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      transcript_analysis = analysisData
    }

    // Build stats object
    const stats = {
      views_count: story.views_count || 0,
      likes_count: story.likes_count || 0,
      comments_count: story.comments_count || 0,
      shares_count: story.shares_count || 0,
      reading_time: story.reading_time_minutes || Math.ceil((story.content?.split(' ').length || 0) / 200)
    }

    // Return enriched story object
    const enrichedStory = {
      ...story,
      author_id: story.storyteller_id || story.author_id,
      author,
      transcript,
      transcript_analysis,
      stats
    }

    console.log(`✅ Story fetched successfully: ${story.title}`)

    return NextResponse.json(enrichedStory)

  } catch (error) {
    console.error('❌ Error fetching story:', error)
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/stories/[id]
 *
 * Updates a story
 * Super admin only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require super admin authentication (includes admin check)
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()
  const { id: storyId } = await params

  try {
    const body = await request.json()

    console.log(`✏️ Updating story: ${storyId}`)

    // Allowed fields to update
    const allowedFields = [
      'title',
      'content',
      'excerpt',
      'status',
      'visibility',
      'story_type',
      'cultural_sensitivity_level',
      'themes',
      'tags',
      'featured',
      'is_featured',
      'justicehub_featured',
      'elder_approved',
      'ceremonial_content',
      'traditional_knowledge',
      'consent_status',
      'cultural_context',
      'location',
      // Media fields
      'hero_image_url',
      'hero_image_caption',
      'video_url',
      'video_platform',
      'video_embed_code',
      'inline_media'
    ]

    // Filter to only allowed fields
    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    const { data: updatedStory, error } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', storyId)
      .select(`
        *,
        organization:organization_id(id, name, slug)
      `)
      .single()

    if (error) {
      console.error('❌ Error updating story:', error)
      return NextResponse.json(
        { error: 'Failed to update story' },
        { status: 500 }
      )
    }

    console.log(`✅ Story updated successfully: ${updatedStory.title}`)

    return NextResponse.json(updatedStory)

  } catch (error) {
    console.error('❌ Error updating story:', error)
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/stories/[id]
 *
 * Deletes a story (soft delete by setting status to 'archived')
 * Super admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require super admin authentication (includes admin check)
  const authResult = await requireSuperAdminAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const supabase = createServiceRoleClient()
  const { id: storyId } = await params

  try {
    console.log(`🗑️ Archiving story: ${storyId}`)

    // Soft delete - set status to archived
    const { error } = await supabase
      .from('stories')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId)

    if (error) {
      console.error('❌ Error archiving story:', error)
      return NextResponse.json(
        { error: 'Failed to archive story' },
        { status: 500 }
      )
    }

    console.log(`✅ Story archived successfully`)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Error archiving story:', error)
    return NextResponse.json(
      { error: 'Failed to archive story' },
      { status: 500 }
    )
  }
}
