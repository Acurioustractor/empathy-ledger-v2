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
    const supabase = await createSupabaseServerClient()
    
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

    // Increment view count
    await supabase
      .from('stories')
      .update({ views_count: (story.views_count || 0) + 1 })
      .eq('id', id)

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
    const supabase = await createSupabaseServerClient()
    
    // Calculate reading time if content is being updated
    let readingTimeMinutes = body.reading_time_minutes
    if (body.content) {
      const wordCount = body.content.split(/\s+/).length
      readingTimeMinutes = Math.ceil(wordCount / 200)
    }

    const updateData: StoryUpdate = {
      updated_at: new Date().toISOString(),
      ...body,
      reading_time_minutes: readingTimeMinutes
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.id
    delete updateData.created_at
    delete updateData.views_count
    delete updateData.likes_count
    delete updateData.shares_count

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
    const supabase = await createSupabaseServerClient()
    
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