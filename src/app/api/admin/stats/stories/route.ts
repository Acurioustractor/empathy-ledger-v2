// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/middleware/admin-auth'

// Use service role to bypass RLS for admin stats
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create service client inside handlers, not at module level
function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  // Admin authentication check
  const authResult = await requireAdminAuth(request)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  // Create service client after auth check
  const supabase = getServiceClient()

  try {
    // Get total stories count
    const { count: totalStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })

    // Get published stories count
    const { count: publishedStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // Get draft stories count
    const { count: draftStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft')

    // Get featured stories count
    const { count: featuredStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('is_featured', true)

    // Get stories with images
    const { count: storiesWithImages } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .not('story_image_url', 'is', null)

    // Get total transcripts
    const { count: totalTranscripts } = await supabase
      .from('transcripts')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      total: totalStories || 0,
      published: publishedStories || 0,
      draft: draftStories || 0,
      featured: featuredStories || 0,
      withImages: storiesWithImages || 0,
      transcripts: totalTranscripts || 0
    })

  } catch (error) {
    console.error('Admin stories stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stories stats' }, { status: 500 })
  }
}