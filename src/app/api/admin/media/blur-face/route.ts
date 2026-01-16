// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

/**
 * POST /api/admin/media/blur-face
 *
 * Request blur for a detected face. This is used when:
 * 1. A person doesn't consent to being identified but wants to be blurred
 * 2. An admin needs to protect someone's identity
 * 3. Cultural/privacy requirements need blurring
 *
 * Request body:
 * - faceId: string - The face recognition record ID
 * - blur: boolean - Whether to apply blur (true) or remove blur (false)
 * - reason?: string - Optional reason for blurring
 *
 * Returns:
 * - Success status and updated face record details
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
    const { faceId, blur, reason } = body as {
      faceId: string
      blur: boolean
      reason?: string
    }

    if (!faceId) {
      return NextResponse.json(
        { error: 'faceId is required' },
        { status: 400 }
      )
    }

    // Get current face record
    const { data: face, error: fetchError } = await supabase
      .from('media_person_recognition')
      .select('id, media_asset_id, linked_storyteller_id, status')
      .eq('id', faceId)
      .single()

    if (fetchError || !face) {
      return NextResponse.json(
        { error: 'Face record not found' },
        { status: 404 }
      )
    }

    // Update blur status
    const updateData: Record<string, any> = {
      blur_requested: blur,
      status: blur ? 'blurred' : (face.linked_storyteller_id ? 'linked' : 'detected')
    }

    if (reason) {
      updateData.blur_reason = reason
    }

    if (blur) {
      updateData.blur_requested_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('media_person_recognition')
      .update(updateData)
      .eq('id', faceId)

    if (updateError) {
      console.error('Error updating blur status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update blur status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      faceId,
      blurred: blur,
      status: blur ? 'blurred' : 'unblurred',
      message: blur ? 'Face will be blurred in displays' : 'Blur removed from face'
    })

  } catch (error) {
    console.error('Error updating blur status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update blur status' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/media/blur-face
 *
 * Get all faces with blur requests for review
 */
export async function GET(request: NextRequest) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const supabase = await createSupabaseServerClient()

    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('mediaId')
    const status = searchParams.get('status') || 'all'

    let query = supabase
      .from('media_person_recognition')
      .select(`
        id,
        media_asset_id,
        face_location,
        linked_storyteller_id,
        blur_requested,
        blur_reason,
        blur_requested_at,
        status,
        storytellers:linked_storyteller_id(id, name)
      `)

    // Filter by media if provided
    if (mediaId) {
      query = query.eq('media_asset_id', mediaId)
    }

    // Filter by blur status
    if (status === 'blurred') {
      query = query.eq('blur_requested', true)
    } else if (status === 'not_blurred') {
      query = query.eq('blur_requested', false)
    }

    const { data: faces, error } = await query.order('blur_requested_at', { ascending: false })

    if (error) {
      console.error('Error fetching blur requests:', error)
      return NextResponse.json(
        { error: 'Failed to fetch blur requests' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      faces: faces?.map(face => ({
        id: face.id,
        mediaAssetId: face.media_asset_id,
        faceLocation: face.face_location,
        linkedStorytellerId: face.linked_storyteller_id,
        linkedStorytellerName: (face.storytellers as any)?.name,
        blurRequested: face.blur_requested,
        blurReason: face.blur_reason,
        blurRequestedAt: face.blur_requested_at,
        status: face.status
      })) || [],
      total: faces?.length || 0
    })

  } catch (error) {
    console.error('Error fetching blur requests:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch blur requests' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/media/blur-face
 *
 * Remove a face record entirely (admin only)
 *
 * Request body:
 * - faceId: string - The face recognition record ID to delete
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

    const { error } = await supabase
      .from('media_person_recognition')
      .delete()
      .eq('id', faceId)

    if (error) {
      console.error('Error deleting face record:', error)
      return NextResponse.json(
        { error: 'Failed to delete face record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      faceId,
      message: 'Face record deleted'
    })

  } catch (error) {
    console.error('Error deleting face record:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete face record' },
      { status: 500 }
    )
  }
}
