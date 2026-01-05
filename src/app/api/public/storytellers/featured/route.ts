import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * GET /api/public/storytellers/featured
 * Get featured storytellers for homepage
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '4')

    // Fetch featured storytellers with story counts
    const { data: storytellers, error } = await supabase
      .from('storytellers')
      .select(`
        id,
        display_name,
        cultural_background,
        bio,
        avatar_url,
        is_active,
        created_at
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching featured storytellers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch featured storytellers' },
        { status: 500 }
      )
    }

    // Transform the data
    const transformedStorytellers = await Promise.all(
      (storytellers || []).map(async (storyteller) => {
        // Get story count for this storyteller
        const { count } = await supabase
          .from('stories')
          .select('*', { count: 'exact', head: true })
          .eq('storyteller_id', storyteller.id)
          .eq('status', 'published')

        return {
          id: storyteller.id,
          display_name: storyteller.display_name,
          cultural_background: storyteller.cultural_background,
          bio: storyteller.bio,
          avatar_url: storyteller.avatar_url,
          story_count: count || 0
        }
      })
    )

    return NextResponse.json(
      {
        storytellers: transformedStorytellers,
        count: transformedStorytellers.length
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in featured storytellers API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
