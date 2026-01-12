/**
 * Link Faces API
 * POST /api/media/faces/link - Link detected faces to storytellers
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface LinkFacesRequest {
  storytellerId: string
  faceIds: string[] // These are actually media_asset_ids in our simplified model
  relationship?: 'appears_in' | 'photographer' | 'subject' | 'owner' | 'tagged_by_face'
  consentStatus?: 'pending' | 'granted' | 'not_required'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body: LinkFacesRequest = await request.json()

    const {
      storytellerId,
      faceIds = [],
      relationship = 'appears_in',
      consentStatus = 'pending'
    } = body

    if (!storytellerId) {
      return NextResponse.json(
        { error: 'storytellerId is required' },
        { status: 400 }
      )
    }

    if (!faceIds.length) {
      return NextResponse.json(
        { error: 'faceIds array is required' },
        { status: 400 }
      )
    }

    // Verify storyteller exists
    const { data: storyteller, error: storytellerError } = await supabase
      .from('storytellers')
      .select('id, display_name, is_elder')
      .eq('id', storytellerId)
      .single()

    if (storytellerError || !storyteller) {
      return NextResponse.json(
        { error: 'Storyteller not found' },
        { status: 404 }
      )
    }

    const results = {
      linked: 0,
      skipped: 0,
      errors: [] as string[]
    }

    // Link each face/media to the storyteller
    for (const mediaAssetId of faceIds) {
      // Check if already linked
      const { data: existing } = await supabase
        .from('media_storytellers')
        .select('id')
        .eq('media_asset_id', mediaAssetId)
        .eq('storyteller_id', storytellerId)
        .eq('relationship', relationship)
        .single()

      if (existing) {
        results.skipped++
        continue
      }

      // Create the link
      const { error } = await supabase
        .from('media_storytellers')
        .insert({
          media_asset_id: mediaAssetId,
          storyteller_id: storytellerId,
          relationship,
          consent_status: consentStatus,
          source: 'face_detection'
        })

      if (error) {
        results.errors.push(`Failed to link ${mediaAssetId}: ${error.message}`)
      } else {
        results.linked++
      }
    }

    // If this is an elder, they might need special handling
    // For now, we'll just note it in the response
    const requiresElderReview = storyteller.is_elder

    return NextResponse.json({
      success: true,
      results,
      storyteller: {
        id: storyteller.id,
        name: storyteller.display_name
      },
      requires_elder_review: requiresElderReview,
      message: `Linked ${results.linked} media items to ${storyteller.display_name}. ${results.skipped} were already linked.`
    })

  } catch (error) {
    console.error('Error in POST /api/media/faces/link:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to link faces' },
      { status: 500 }
    )
  }
}
