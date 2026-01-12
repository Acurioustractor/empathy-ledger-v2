/**
 * Media Storytellers API
 * GET /api/media/[id]/storytellers - Get linked storytellers for a media item
 * POST /api/media/[id]/storytellers - Link storytellers to media
 * DELETE /api/media/[id]/storytellers - Unlink storytellers from media
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type RelationshipType = 'appears_in' | 'photographer' | 'subject' | 'owner' | 'tagged_by_face'
type ConsentStatus = 'pending' | 'approved' | 'declined' | 'not_required'

interface LinkStoryteller {
  storytellerId: string
  relationship?: RelationshipType
  consentStatus?: ConsentStatus
  source?: 'manual' | 'face_detection'
  faceRegion?: {
    x: number
    y: number
    width: number
    height: number
  }
}

// GET - Get linked storytellers for a media item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient()
    const { id: mediaId } = params

    const { data, error } = await supabase
      .from('media_storytellers')
      .select(`
        id,
        relationship,
        consent_status,
        source,
        created_at,
        storyteller:storyteller_id(
          id,
          display_name,
          preferred_name,
          pronouns,
          photo_url,
          cultural_group,
          is_elder
        )
      `)
      .eq('media_asset_id', mediaId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const storytellers = (data || []).map((item: any) => ({
      linkId: item.id,
      relationship: item.relationship,
      consentStatus: item.consent_status,
      source: item.source,
      linkedAt: item.created_at,
      storyteller: item.storyteller ? {
        id: item.storyteller.id,
        displayName: item.storyteller.display_name,
        preferredName: item.storyteller.preferred_name,
        pronouns: item.storyteller.pronouns,
        photoUrl: item.storyteller.photo_url,
        culturalGroup: item.storyteller.cultural_group,
        isElder: item.storyteller.is_elder
      } : null
    }))

    return NextResponse.json({ storytellers })

  } catch (error) {
    console.error('Error in GET /api/media/[id]/storytellers:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch storytellers' },
      { status: 500 }
    )
  }
}

// POST - Link storytellers to media
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient()
    const { id: mediaId } = params
    const body = await request.json()

    const { storytellers = [] } = body as { storytellers: LinkStoryteller[] }

    if (!storytellers.length) {
      return NextResponse.json(
        { error: 'storytellers array is required' },
        { status: 400 }
      )
    }

    const results = {
      linked: 0,
      skipped: 0,
      errors: [] as string[]
    }

    for (const link of storytellers) {
      try {
        // Check if link already exists
        const { data: existing } = await supabase
          .from('media_storytellers')
          .select('id')
          .eq('media_asset_id', mediaId)
          .eq('storyteller_id', link.storytellerId)
          .eq('relationship', link.relationship || 'appears_in')
          .single()

        if (existing) {
          results.skipped++
          continue
        }

        // Get storyteller details to check if elder
        const { data: storyteller } = await supabase
          .from('storytellers')
          .select('is_elder, cultural_group')
          .eq('id', link.storytellerId)
          .single()

        // Auto-set consent for non-elder manual links
        let consentStatus = link.consentStatus || 'pending'
        if (link.source === 'manual' && !storyteller?.is_elder) {
          consentStatus = 'approved'
        }

        const { error: insertError } = await supabase
          .from('media_storytellers')
          .insert({
            media_asset_id: mediaId,
            storyteller_id: link.storytellerId,
            relationship: link.relationship || 'appears_in',
            consent_status: consentStatus,
            source: link.source || 'manual'
          })

        if (insertError) {
          results.errors.push(`Failed to link ${link.storytellerId}: ${insertError.message}`)
        } else {
          results.linked++
        }
      } catch (err) {
        results.errors.push(`Error linking ${link.storytellerId}: ${err}`)
      }
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('Error in POST /api/media/[id]/storytellers:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to link storytellers' },
      { status: 500 }
    )
  }
}

// DELETE - Unlink storytellers from media
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient()
    const { id: mediaId } = params
    const body = await request.json()

    const { storytellerIds = [], linkIds = [] } = body

    if (!storytellerIds.length && !linkIds.length) {
      return NextResponse.json(
        { error: 'storytellerIds or linkIds array is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('media_storytellers')
      .delete()

    if (linkIds.length > 0) {
      // Delete by link IDs
      query = query.in('id', linkIds)
    } else {
      // Delete by storyteller IDs for this media
      query = query
        .eq('media_asset_id', mediaId)
        .in('storyteller_id', storytellerIds)
    }

    const { error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Unlinked ${linkIds.length || storytellerIds.length} storyteller(s)`
    })

  } catch (error) {
    console.error('Error in DELETE /api/media/[id]/storytellers:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unlink storytellers' },
      { status: 500 }
    )
  }
}
