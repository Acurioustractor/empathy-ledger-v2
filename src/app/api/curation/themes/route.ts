import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/curation/themes
 * Add or update themes for a story
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { story_id, themes, ai_suggested } = body

    if (!story_id || !themes) {
      return NextResponse.json(
        { error: 'Missing required fields: story_id, themes' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify story exists and user has access
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, title')
      .eq('id', story_id)
      .single()

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Delete existing themes for this story
    await supabase
      .from('story_themes')
      .delete()
      .eq('story_id', story_id)

    // Insert new themes (if any provided)
    if (themes.length > 0) {
      const themeInserts = themes.map((theme: string) => ({
        story_id,
        theme: theme.trim(),
        added_by: user.id,
        ai_suggested: ai_suggested || false
      }))

      const { error: insertError } = await supabase
        .from('story_themes')
        .insert(themeInserts)

      if (insertError) {
        console.error('Error saving themes:', insertError)
        return NextResponse.json({ error: 'Failed to save themes' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      count: themes.length,
      message: `${themes.length} ${themes.length === 1 ? 'theme' : 'themes'} saved for "${story.title}"`
    })
  } catch (error) {
    console.error('Error in save themes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/curation/themes
 * Get themes for a story
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('story_id')

    if (!storyId) {
      return NextResponse.json({ error: 'Missing required parameter: story_id' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get themes
    const { data: themes, error: themesError } = await supabase
      .from('story_themes')
      .select('theme, ai_suggested, created_at')
      .eq('story_id', storyId)
      .order('created_at', { ascending: true })

    if (themesError) {
      console.error('Error fetching themes:', themesError)
      return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 })
    }

    return NextResponse.json({
      themes: themes || [],
      count: themes?.length || 0
    })
  } catch (error) {
    console.error('Error in get themes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
