// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { createFaceRecognition } from '@/lib/media-intelligence/face-recognition'
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

/**
 * POST /api/admin/media/tag-person
 *
 * Tag a detected face with a storyteller identity.
 * This is the first step of the two-party consent process:
 * 1. Uploader/admin tags a face -> pending consent
 * 2. Tagged person grants consent -> linked
 *
 * Request body:
 * - faceId: string - The face recognition record ID
 * - storytellerId: string - The storyteller to link to this face
 * - mediaId: string - The media asset ID (for creating new face records)
 * - faceLocation?: object - Face bounding box (for creating new face records)
 *
 * Returns:
 * - Success status and face record details
 */
export async function POST(request: NextRequest) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const supabase = await createSupabaseServerClient()

    const body = await request.json()
    const { faceId, storytellerId, mediaId, faceLocation } = body as {
      faceId?: string
      storytellerId: string
      mediaId?: string
      faceLocation?: {
        x: number
        y: number
        width: number
        height: number
      }
    }

    if (!storytellerId) {
      return NextResponse.json(
        { error: 'storytellerId is required' },
        { status: 400 }
      )
    }

    if (!faceId && !mediaId) {
      return NextResponse.json(
        { error: 'Either faceId or mediaId is required' },
        { status: 400 }
      )
    }

    // Verify storyteller exists
    const { data: storyteller, error: storytellerError } = await supabase
      .from('storytellers')
      .select('id, name, user_id')
      .eq('id', storytellerId)
      .single()

    if (storytellerError || !storyteller) {
      return NextResponse.json(
        { error: 'Storyteller not found' },
        { status: 404 }
      )
    }

    let recognitionId = faceId

    // If no faceId provided, create a new face record (manual tagging)
    if (!faceId && mediaId) {
      const { data: newFace, error: createError } = await supabase
        .from('media_person_recognition')
        .insert({
          media_asset_id: mediaId,
          face_location: faceLocation || { x: 0, y: 0, width: 100, height: 100 },
          linked_storyteller_id: storytellerId,
          recognition_consent_granted: false, // Will be granted when person consents
          uploader_consent_granted: true, // Admin tagging implies uploader consent
          uploader_consent_at: new Date().toISOString(),
          status: 'pending_consent',
          can_be_public: false,
          blur_requested: false
        })
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating face record:', createError)
        return NextResponse.json(
          { error: 'Failed to create face tag' },
          { status: 500 }
        )
      }

      recognitionId = newFace.id
    } else {
      // Update existing face record with storyteller link
      const { error: updateError } = await supabase
        .from('media_person_recognition')
        .update({
          linked_storyteller_id: storytellerId,
          uploader_consent_granted: true,
          uploader_consent_at: new Date().toISOString(),
          status: 'pending_consent'
        })
        .eq('id', faceId)

      if (updateError) {
        console.error('Error updating face record:', updateError)
        return NextResponse.json(
          { error: 'Failed to tag person' },
          { status: 500 }
        )
      }
    }

    // Create a consent request notification for the tagged person
    // This would typically send an email/notification to the storyteller
    if (storyteller.user_id) {
      // TODO: Create notification for the tagged person
      // await createNotification({
      //   userId: storyteller.user_id,
      //   type: 'face_tag_consent_request',
      //   title: 'You were tagged in a photo',
      //   body: 'Someone tagged you in a photo. Please review and provide consent.',
      //   data: { recognitionId, storytellerId }
      // })
    }

    return NextResponse.json({
      success: true,
      faceId: recognitionId,
      storytellerId,
      storytellerName: storyteller.name,
      status: 'pending_consent',
      message: `Tagged as ${storyteller.name}. Awaiting their consent.`
    })

  } catch (error) {
    console.error('Error tagging person:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to tag person' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/media/tag-person
 *
 * Remove a person tag (untag)
 *
 * Request body:
 * - faceId: string - The face recognition record ID to untag
 */
export async function DELETE(request: NextRequest) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const supabase = await createSupabaseServerClient()

    const body = await request.json()
    const { faceId } = body as { faceId: string }

    if (!faceId) {
      return NextResponse.json(
        { error: 'faceId is required' },
        { status: 400 }
      )
    }

    // Update face record to remove storyteller link
    const { error } = await supabase
      .from('media_person_recognition')
      .update({
        linked_storyteller_id: null,
        recognition_consent_granted: false,
        status: 'detected'
      })
      .eq('id', faceId)

    if (error) {
      console.error('Error untagging person:', error)
      return NextResponse.json(
        { error: 'Failed to untag person' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      faceId,
      message: 'Person untagged successfully'
    })

  } catch (error) {
    console.error('Error untagging person:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to untag person' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/media/tag-person
 *
 * Grant consent for a face tag (called by the tagged person)
 *
 * Request body:
 * - faceId: string - The face recognition record ID
 * - consent: boolean - Whether consent is granted
 * - canBePublic: boolean - Whether face can be shown in public view
 */
export async function PATCH(request: NextRequest) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const supabase = await createSupabaseServerClient()

    const body = await request.json()
    const { faceId, consent, canBePublic } = body as {
      faceId: string
      consent: boolean
      canBePublic?: boolean
    }

    if (!faceId) {
      return NextResponse.json(
        { error: 'faceId is required' },
        { status: 400 }
      )
    }

    if (consent) {
      // Grant consent
      const { error } = await supabase
        .from('media_person_recognition')
        .update({
          recognition_consent_granted: true,
          person_consent_at: new Date().toISOString(),
          can_be_public: canBePublic ?? false,
          status: 'linked'
        })
        .eq('id', faceId)

      if (error) {
        console.error('Error granting consent:', error)
        return NextResponse.json(
          { error: 'Failed to grant consent' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        faceId,
        status: 'linked',
        message: 'Consent granted. Face is now linked.'
      })
    } else {
      // Reject/revoke consent
      const { error } = await supabase
        .from('media_person_recognition')
        .update({
          recognition_consent_granted: false,
          status: 'rejected'
        })
        .eq('id', faceId)

      if (error) {
        console.error('Error revoking consent:', error)
        return NextResponse.json(
          { error: 'Failed to revoke consent' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        faceId,
        status: 'rejected',
        message: 'Consent rejected.'
      })
    }

  } catch (error) {
    console.error('Error updating consent:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update consent' },
      { status: 500 }
    )
  }
}
