import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()

    const { data: currentStory } = await supabase
      .from('stories')
      .select('storyteller_id, cultural_tags, story_type')
      .eq('id', id)
      .single()

    if (!currentStory) {
      return NextResponse.json({ stories: [] }, { status: 200 })
    }

    const { data: stories } = await supabase
      .from('stories')
      .select(`
        id, title, excerpt, story_type, featured_image_url,
        reading_time_minutes, views_count,
        storyteller:storytellers!storyteller_id (
          id, display_name, cultural_background
        )
      `)
      .eq('status', 'published')
      .eq('is_public', true)
      .neq('id', id)
      .limit(6)

    const transformedStories = (stories || []).map(story => ({
      id: story.id,
      title: story.title,
      excerpt: story.excerpt,
      story_type: story.story_type,
      featured_image_url: story.featured_image_url,
      reading_time_minutes: story.reading_time_minutes,
      views_count: story.views_count || 0,
      storyteller: {
        display_name: story.storyteller?.display_name || 'Anonymous',
        cultural_background: story.storyteller?.cultural_background
      }
    }))

    return NextResponse.json({ stories: transformedStories }, { status: 200 })
  } catch (error) {
    console.error('Error fetching related stories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
