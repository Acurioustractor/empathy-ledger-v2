// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for admin stats
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Get pending stories (stories that need review)
    const { count: pendingReviews } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get stories marked as culturally sensitive
    const { count: culturallySensitive } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('cultural_sensitivity_level', 'high')

    // Get featured stories without images (needs attention)
    const { count: featuredWithoutImages } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('is_featured', true)
      .is('story_image_url', null)

    // Get transcripts that don't have stories yet
    const { count: transcriptsWithoutStories } = await supabase
      .from('transcripts')
      .select('*', { count: 'exact', head: true })
      .is('story_id', null)

    return NextResponse.json({
      pending: pendingReviews || 0,
      culturallySensitive: culturallySensitive || 0,
      featuredWithoutImages: featuredWithoutImages || 0,
      transcriptsWithoutStories: transcriptsWithoutStories || 0
    })

  } catch (error) {
    console.error('Admin reviews stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews stats' }, { status: 500 })
  }
}