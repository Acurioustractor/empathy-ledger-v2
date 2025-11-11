import { NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


interface Params {
  id: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: mediaId } = await params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // TODO: Implement proper permission check for media review
    // For now, all authenticated users can review (this should be restricted later)

    const body = await request.json()
    const {
      decision,
      notes,
      cultural_sensitivity_level,
      ceremonial_content,
      traditional_knowledge,
      reviewer_id
    } = body

    if (!decision || !['approved', 'rejected'].includes(decision)) {
      return NextResponse.json({ 
        error: 'Decision must be either "approved" or "rejected"' 
      }, { status: 400 })
    }

    // Verify the media asset exists
    const { data: mediaAsset, error: mediaError } = await supabase
      .from('media_assets')
      .select('id, uploaded_by, cultural_review_status')
      .eq('id', mediaId)
      .single()

    if (mediaError) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 })
    }

    // Prepare update data based on review decision
    const updateData: any = {
      cultural_review_status: decision === 'approved' ? 'approved' : 'rejected',
      cultural_reviewer_id: user.id,
      cultural_review_date: new Date().toISOString(),
      cultural_review_notes: notes || null,
      updated_at: new Date().toISOString()
    }

    // Update cultural sensitivity and flags if provided
    if (cultural_sensitivity_level) {
      updateData.cultural_sensitivity_level = cultural_sensitivity_level
    }
    if (ceremonial_content !== undefined) {
      updateData.ceremonial_content = ceremonial_content
    }
    if (traditional_knowledge !== undefined) {
      updateData.traditional_knowledge = traditional_knowledge
    }

    // TODO: If approved, check if reviewer is an elder and update elder approval
    // if (decision === 'approved' && profile?.is_elder) {
    //   updateData.elder_approval = true
    //   updateData.elder_approved_by = user.id
    //   updateData.elder_approval_date = new Date().toISOString()
    // }

    // Update the media asset
    const { data: updatedAsset, error: updateError } = await supabase
      .from('media_assets')
      .update(updateData)
      .eq('id', mediaId)
      .select(`
        *,
        reviewer:profiles!media_assets_cultural_reviewer_id_fkey(
          id,
          display_name,
          is_elder
        ),
        elder_reviewer:profiles!media_assets_elder_approved_by_fkey(
          id,
          display_name,
          is_elder
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating media asset review:', updateError)
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
    }

    // TODO: Log the review action for audit purposes
    // (cultural_access_audit table needs to be created first)

    // TODO: Send notification to media uploader if review is rejected
    // (need to implement notification system and fix uploaded_by column)

    return NextResponse.json({ 
      media_asset: updatedAsset,
      message: `Media review completed: ${decision}`
    })
  } catch (error) {
    console.error('Error in media review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: mediaId } = await params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get review history for this media asset
    const { data: mediaAsset, error: mediaError } = await supabase
      .from('media_assets')
      .select(`
        id,
        filename,
        title,
        cultural_review_status,
        cultural_sensitivity_level,
        ceremonial_content,
        traditional_knowledge,
        cultural_review_date,
        cultural_review_notes,
        elder_approval,
        elder_approval_date,
        uploaded_by,
        created_at,
        reviewer:profiles!media_assets_cultural_reviewer_id_fkey(
          id,
          display_name,
          is_elder,
          avatar_url
        ),
        elder_reviewer:profiles!media_assets_elder_approved_by_fkey(
          id,
          display_name,
          is_elder,
          avatar_url
        ),
        uploader:profiles!media_assets_uploaded_by_fkey(
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('id', mediaId)
      .single()

    if (mediaError) {
      return NextResponse.json({ error: 'Media asset not found' }, { status: 404 })
    }

    // TODO: Check if user has permission to view review details
    // For now, allow all authenticated users

    // TODO: Get audit log for this media asset's reviews
    // (cultural_access_audit table needs to be created first)
    const auditLog: any[] = []

    return NextResponse.json({
      media_asset: mediaAsset,
      review_history: auditLog || []
    })
  } catch (error) {
    console.error('Error fetching media review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}