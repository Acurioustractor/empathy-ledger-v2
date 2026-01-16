import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

/**
 * PATCH /api/admin/stories/[id]/image
 * Update story featured image (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()

    const body = await request.json()
    const { story_image_url } = body

    // Update story with new image
    const { data: story, error } = await supabase
      .from('stories')
      .update({
        story_image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id,
        title,
        story_image_url,
        storyteller:storytellers!storyteller_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error updating story image:', error)
      return NextResponse.json(
        { error: 'Failed to update story image' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      story
    })
  } catch (error) {
    console.error('Error in PATCH /api/admin/stories/[id]/image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/stories/[id]/image
 * Remove story featured image (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()

    const { data: story, error } = await supabase
      .from('stories')
      .update({
        story_image_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, title')
      .single()

    if (error) {
      console.error('Error removing story image:', error)
      return NextResponse.json(
        { error: 'Failed to remove story image' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      story
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/stories/[id]/image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
