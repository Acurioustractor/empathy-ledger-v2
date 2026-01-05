import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Get media asset and verify ownership
    const { data: mediaAsset } = await supabase
      .from('media_assets')
      .select('uploader_id')
      .eq('id', id)
      .single()

    if (!mediaAsset) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Get user's storyteller profile
    const { data: profile } = await supabase
      .from('storytellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (mediaAsset.uploader_id !== profile?.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Update media asset
    const { data: updatedMedia, error: updateError } = await supabase
      .from('media_assets')
      .update({
        title: body.title,
        caption: body.caption,
        alt_text: body.alt_text,
        cultural_tags: body.cultural_tags,
        cultural_sensitivity: body.cultural_sensitivity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('Error updating media:', updateError)
      return NextResponse.json(
        { error: 'Failed to update media' },
        { status: 500 }
      )
    }

    return NextResponse.json({ media: updatedMedia })
  } catch (error) {
    console.error('Error in PATCH /api/media/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get media asset and verify ownership
    const { data: mediaAsset } = await supabase
      .from('media_assets')
      .select('uploader_id, storage_path, usage_count')
      .eq('id', id)
      .single()

    if (!mediaAsset) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Get user's storyteller profile
    const { data: profile } = await supabase
      .from('storytellers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (mediaAsset.uploader_id !== profile?.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Check if media is in use
    const { count: usageCount } = await supabase
      .from('story_media')
      .select('*', { count: 'exact', head: true })
      .eq('media_asset_id', id)

    if (usageCount && usageCount > 0) {
      // Remove from story_media first
      await supabase
        .from('story_media')
        .delete()
        .eq('media_asset_id', id)
    }

    // Delete from storage
    if (mediaAsset.storage_path) {
      await supabase.storage
        .from('media')
        .remove([mediaAsset.storage_path])
    }

    // Delete media asset record
    const { error: deleteError } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting media:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete media' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/media/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
