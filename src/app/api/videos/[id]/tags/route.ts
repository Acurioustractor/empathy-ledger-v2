/**
 * Video Tags API
 * GET /api/videos/[id]/tags - Get all tags for a video
 * POST /api/videos/[id]/tags - Add tags to a video
 * DELETE /api/videos/[id]/tags - Remove tags from a video
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
      .from('video_link_tags')
      .select(`
        id,
        source,
        created_at,
        tags:tag_id(id, name, slug, category, description)
      `)
      .eq('video_link_id', id)

    if (error) throw error

    return NextResponse.json({
      tags: (data || []).map(vt => ({
        id: vt.tags?.id,
        name: vt.tags?.name,
        slug: vt.tags?.slug,
        category: vt.tags?.category,
        description: vt.tags?.description,
        source: vt.source
      })).filter(t => t.id)
    })

  } catch (error) {
    console.error('Error fetching video tags:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseClient()
    const body = await request.json()

    const { tagIds, source = 'manual' } = body

    if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
      return NextResponse.json(
        { error: 'Tag IDs array is required' },
        { status: 400 }
      )
    }

    // Insert tags (ignore duplicates)
    const records = tagIds.map((tagId: string) => ({
      video_link_id: id,
      tag_id: tagId,
      source
    }))

    const { data, error } = await supabase
      .from('video_link_tags')
      .upsert(records, { onConflict: 'video_link_id,tag_id' })
      .select(`
        id,
        source,
        tags:tag_id(id, name, slug, category)
      `)

    if (error) throw error

    // Update tag usage counts
    await supabase.rpc('increment_tag_usage', { tag_ids: tagIds }).catch(() => {
      // Ignore if function doesn't exist
    })

    return NextResponse.json({
      tags: (data || []).map(vt => ({
        id: vt.tags?.id,
        name: vt.tags?.name,
        slug: vt.tags?.slug,
        category: vt.tags?.category,
        source: vt.source
      })).filter(t => t.id)
    })

  } catch (error) {
    console.error('Error adding video tags:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add tags' },
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
    const { searchParams } = new URL(request.url)

    const tagId = searchParams.get('tagId')

    if (tagId) {
      // Delete specific tag
      const { error } = await supabase
        .from('video_link_tags')
        .delete()
        .eq('video_link_id', id)
        .eq('tag_id', tagId)

      if (error) throw error
    } else {
      // Delete all tags
      const { error } = await supabase
        .from('video_link_tags')
        .delete()
        .eq('video_link_id', id)

      if (error) throw error
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error removing video tags:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove tags' },
      { status: 500 }
    )
  }
}
