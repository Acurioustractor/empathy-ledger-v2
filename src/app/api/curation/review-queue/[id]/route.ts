import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/curation/review-queue/[id]
 * Get detailed story information for quality review
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const storyId = params.id

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get story with full details
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        status,
        project_id,
        storyteller_id,
        created_at,
        updated_at,
        projects(id, name),
        profiles!storyteller_id(id, display_name)
      `)
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Get themes
    const { data: themes } = await supabase
      .from('story_themes')
      .select('theme, ai_suggested, created_at')
      .eq('story_id', storyId)

    // Get previous reviews
    const { data: reviews } = await supabase
      .from('story_reviews')
      .select(`
        id,
        decision,
        cultural_guidance,
        requested_changes,
        reviewed_at,
        profiles!reviewer_id(display_name)
      `)
      .eq('story_id', storyId)
      .order('reviewed_at', { ascending: false })

    return NextResponse.json({
      story: {
        ...story,
        themes: themes || [],
        previous_reviews: reviews || []
      }
    })
  } catch (error) {
    console.error('Error fetching story for review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
