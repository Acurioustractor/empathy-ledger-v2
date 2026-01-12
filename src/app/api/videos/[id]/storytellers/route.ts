/**
 * Video Storytellers API
 * GET /api/videos/[id]/storytellers - Get all linked storytellers
 * POST /api/videos/[id]/storytellers - Link storytellers to a video
 * DELETE /api/videos/[id]/storytellers - Remove storyteller links
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
      .from('video_link_storytellers')
      .select(`
        id,
        relationship,
        consent_status,
        source,
        created_at,
        storytellers:storyteller_id(id, display_name, avatar_url, bio)
      `)
      .eq('video_link_id', id)

    if (error) throw error

    return NextResponse.json({
      storytellers: (data || []).map(vs => ({
        id: vs.storytellers?.id,
        name: vs.storytellers?.display_name,
        imageUrl: vs.storytellers?.avatar_url,
        bio: vs.storytellers?.bio,
        relationship: vs.relationship,
        consentStatus: vs.consent_status,
        source: vs.source
      })).filter(s => s.id)
    })

  } catch (error) {
    console.error('Error fetching video storytellers:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch storytellers' },
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

    const { storytellers, source = 'manual' } = body

    if (!storytellers || !Array.isArray(storytellers) || storytellers.length === 0) {
      return NextResponse.json(
        { error: 'Storytellers array is required' },
        { status: 400 }
      )
    }

    // Insert storytellers
    const records = storytellers.map((s: any) => ({
      video_link_id: id,
      storyteller_id: s.id,
      relationship: s.relationship || 'appears_in',
      consent_status: s.consentStatus || 'pending',
      source
    }))

    const { data, error } = await supabase
      .from('video_link_storytellers')
      .upsert(records, { onConflict: 'video_link_id,storyteller_id,relationship' })
      .select(`
        id,
        relationship,
        consent_status,
        storytellers:storyteller_id(id, display_name, avatar_url)
      `)

    if (error) throw error

    return NextResponse.json({
      storytellers: (data || []).map(vs => ({
        id: vs.storytellers?.id,
        name: vs.storytellers?.display_name,
        imageUrl: vs.storytellers?.avatar_url,
        relationship: vs.relationship,
        consentStatus: vs.consent_status
      })).filter(s => s.id)
    })

  } catch (error) {
    console.error('Error linking storytellers:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to link storytellers' },
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

    const { storytellerId, relationship, consentStatus } = body

    if (!storytellerId) {
      return NextResponse.json(
        { error: 'Storyteller ID is required' },
        { status: 400 }
      )
    }

    const updates: Record<string, any> = {}
    if (relationship !== undefined) updates.relationship = relationship
    if (consentStatus !== undefined) updates.consent_status = consentStatus

    const { error } = await supabase
      .from('video_link_storytellers')
      .update(updates)
      .eq('video_link_id', id)
      .eq('storyteller_id', storytellerId)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating storyteller link:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update' },
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

    const storytellerId = searchParams.get('storytellerId')

    if (storytellerId) {
      // Delete specific link
      const { error } = await supabase
        .from('video_link_storytellers')
        .delete()
        .eq('video_link_id', id)
        .eq('storyteller_id', storytellerId)

      if (error) throw error
    } else {
      // Delete all links
      const { error } = await supabase
        .from('video_link_storytellers')
        .delete()
        .eq('video_link_id', id)

      if (error) throw error
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error removing storyteller link:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove' },
      { status: 500 }
    )
  }
}
