import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/stories/images
 * Get all stories with their image status for admin management
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)

    const limit = parseInt(searchParams.get('limit') || '500')
    const hasImage = searchParams.get('hasImage') // 'true', 'false', or null for all

    let query = supabase
      .from('stories')
      .select(`
        id,
        title,
        story_image_url,
        status,
        is_featured,
        is_public,
        created_at,
        storyteller:storytellers!storyteller_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filter by image presence if specified
    if (hasImage === 'true') {
      query = query.not('story_image_url', 'is', null)
    } else if (hasImage === 'false') {
      query = query.is('story_image_url', null)
    }

    const { data: stories, error } = await query

    if (error) {
      console.error('Error fetching stories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch stories' },
        { status: 500 }
      )
    }

    // Calculate stats
    const withImages = (stories || []).filter(s => s.story_image_url).length
    const withoutImages = (stories || []).filter(s => !s.story_image_url).length
    const featured = (stories || []).filter(s => s.is_featured).length
    const featuredWithoutImages = (stories || []).filter(s => s.is_featured && !s.story_image_url).length

    return NextResponse.json({
      stories: stories || [],
      stats: {
        total: (stories || []).length,
        withImages,
        withoutImages,
        featured,
        featuredWithoutImages
      }
    })
  } catch (error) {
    console.error('Error in GET /api/admin/stories/images:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
