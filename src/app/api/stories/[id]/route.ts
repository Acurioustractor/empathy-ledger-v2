// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { getAuditService } from '@/lib/services/audit.service'

import type { StoryUpdate } from '@/types/database'



interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = createSupabaseServerClient()
    
    const { data: story, error } = await supabase
      .from('stories')
      .select(`
        *,
        author:profiles!stories_author_id_fkey(
          id,
          display_name,
          full_name,
          profile_image_url,
          cultural_background
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Story not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching story:', error)
      return NextResponse.json(
        { error: 'Failed to fetch story' },
        { status: 500 }
      )
    }

    // View counting functionality would need to be implemented with analytics table

    return NextResponse.json(story)

  } catch (error) {
    console.error('Story fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Authenticate user
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Verify story ownership and get current state for audit
    const { data: existingStory, error: fetchError } = await supabase
      .from('stories')
      .select('author_id, storyteller_id, tenant_id, title, status, content')
      .eq('id', id)
      .single()

    if (fetchError || !existingStory) {
      return NextResponse.json(
        { error: 'Story not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Check ownership - user must be author or storyteller
    if (existingStory.author_id !== user.id && existingStory.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this story', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Calculate reading time if content is being updated
    const updateData: StoryUpdate = {
      updated_at: new Date().toISOString(),
      ...body
    }

    // Remove fields that shouldn't be updated directly or don't exist in schema
    delete updateData.id
    delete updateData.created_at
    delete updateData.views_count
    delete updateData.likes_count
    delete updateData.shares_count
    delete updateData.reading_time_minutes
    // Prevent changing ownership
    delete updateData.author_id
    delete updateData.storyteller_id

    const { data: story, error } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:profiles!stories_author_id_fkey(
          id,
          display_name,
          full_name,
          profile_image_url,
          cultural_background
        )
      `)
      .single()

    if (error) {
      console.error('Error updating story:', error)
      return NextResponse.json(
        { error: 'Failed to update story' },
        { status: 500 }
      )
    }

    // GDPR: Create audit log for story update
    try {
      const auditService = getAuditService()
      await auditService.log({
        tenant_id: existingStory.tenant_id,
        entity_type: 'story',
        entity_id: id,
        action: 'update',
        action_category: 'content',
        actor_id: user.id,
        actor_type: 'user',
        previous_state: {
          title: existingStory.title,
          status: existingStory.status
        },
        new_state: {
          title: story.title,
          status: story.status
        },
        change_summary: `Story "${story.title}" updated`,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        user_agent: request.headers.get('user-agent') || null
      })
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError)
    }

    return NextResponse.json(story)

  } catch (error) {
    console.error('Story update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Authenticate user
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Verify story ownership
    const { data: existingStory, error: fetchError } = await supabase
      .from('stories')
      .select('author_id, storyteller_id, title, tenant_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !existingStory) {
      return NextResponse.json(
        { error: 'Story not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Check ownership - user must be author or storyteller
    if (existingStory.author_id !== user.id && existingStory.storyteller_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this story', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }

    // Soft delete by archiving (recommended for data retention / GDPR compliance)
    // If hard delete is required, change to .delete()
    const { error } = await supabase
      .from('stories')
      .update({
        is_archived: true,
        archived_at: new Date().toISOString(),
        archived_by: user.id,
        archive_reason: 'User deleted',
        status: 'archived'
      })
      .eq('id', id)

    if (error) {
      console.error('Error deleting story:', error)
      return NextResponse.json(
        { error: 'Failed to delete story' },
        { status: 500 }
      )
    }

    // GDPR: Create audit log for story deletion/archival
    try {
      const auditService = getAuditService()
      await auditService.log({
        tenant_id: existingStory.tenant_id,
        entity_type: 'story',
        entity_id: id,
        action: 'archive',
        action_category: 'gdpr',
        actor_id: user.id,
        actor_type: 'user',
        previous_state: {
          title: existingStory.title,
          status: existingStory.status,
          is_archived: false
        },
        new_state: {
          status: 'archived',
          is_archived: true,
          archive_reason: 'User deleted'
        },
        change_summary: `Story "${existingStory.title}" archived by user`,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        user_agent: request.headers.get('user-agent') || null
      })
    } catch (auditError) {
      console.error('Audit log creation failed:', auditError)
    }

    return NextResponse.json({ success: true, message: 'Story archived successfully' })

  } catch (error) {
    console.error('Story deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}