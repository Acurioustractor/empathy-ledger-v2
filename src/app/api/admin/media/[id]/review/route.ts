import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

interface Params {
  id: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const { id: mediaId } = await params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user has review permissions (elder or admin)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_elder, community_roles')
      .eq('id', user.id)
      .single()

    if (profileError || (!profile?.is_elder && !profile?.community_roles?.includes('admin'))) {
      return NextResponse.json({ 
        error: 'You do not have permission to review content. Only elders and admins can review media.' 
      }, { status: 403 })
    }

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

    // If approved, also update elder approval if reviewer is an elder
    if (decision === 'approved' && profile?.is_elder) {
      updateData.elder_approval = true
      updateData.elder_approved_by = user.id
      updateData.elder_approval_date = new Date().toISOString()
    }

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

    // Log the review action for audit purposes
    const { error: auditError } = await supabase
      .from('cultural_access_audit')
      .insert({
        user_id: user.id,
        table_name: 'media_assets',
        record_id: mediaId,
        action: 'REVIEW',
        cultural_sensitivity_level: cultural_sensitivity_level ? 
          (cultural_sensitivity_level === 'high' ? 4 : cultural_sensitivity_level === 'medium' ? 3 : 2) : null,
        access_granted: decision === 'approved',
        reason: `Media review: ${decision}${notes ? ` - ${notes.substring(0, 100)}` : ''}`
      })

    if (auditError) {
      console.warn('Failed to log review audit:', auditError)
      // Don't fail the request if audit logging fails
    }

    // Send notification to media uploader if review is rejected
    if (decision === 'rejected' && mediaAsset.uploaded_by !== user.id) {
      try {
        // This would be where you'd send a notification
        // For now, we'll just log it
        console.log(`Media review rejection notification should be sent to user ${mediaAsset.uploaded_by}`)
      } catch (notificationError) {
        console.warn('Failed to send notification:', notificationError)
      }
    }

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
    const supabase = await createSupabaseServerClient()
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

    // Check if user has permission to view review details
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_elder, community_roles')
      .eq('id', user.id)
      .single()

    const canViewReviews = 
      profile?.is_elder || 
      profile?.community_roles?.includes('admin') ||
      mediaAsset.uploaded_by === user.id

    if (!canViewReviews) {
      return NextResponse.json({ 
        error: 'Access denied. Only elders, admins, and the uploader can view review details.' 
      }, { status: 403 })
    }

    // Get audit log for this media asset's reviews
    const { data: auditLog, error: auditError } = await supabase
      .from('cultural_access_audit')
      .select(`
        id,
        action,
        access_granted,
        reason,
        created_at,
        user:profiles!cultural_access_audit_user_id_fkey(
          id,
          display_name,
          is_elder,
          avatar_url
        )
      `)
      .eq('table_name', 'media_assets')
      .eq('record_id', mediaId)
      .eq('action', 'REVIEW')
      .order('created_at', { ascending: false })

    if (auditError) {
      console.warn('Failed to fetch audit log:', auditError)
    }

    return NextResponse.json({
      media_asset: mediaAsset,
      review_history: auditLog || []
    })
  } catch (error) {
    console.error('Error fetching media review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}