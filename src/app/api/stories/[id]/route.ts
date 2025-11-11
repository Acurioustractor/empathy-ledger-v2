// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

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
    const body = await request.json()
    const supabase = createSupabaseServerClient()
    
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
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Story not found' },
          { status: 404 }
        )
      }
      console.error('Error updating story:', error)
      return NextResponse.json(
        { error: 'Failed to update story' },
        { status: 500 }
      )
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
    const supabase = createSupabaseServerClient()
    
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting story:', error)
      return NextResponse.json(
        { error: 'Failed to delete story' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Story deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}