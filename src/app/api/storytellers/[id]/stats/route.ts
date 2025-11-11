import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id: storytellerId } = await params

    // Get story statistics
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, status, created_at')
      .eq('author_id', storytellerId)

    if (storiesError) {
      console.error('Error fetching stories:', storiesError)
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
    }

    // Get media assets count
    const { data: media, error: mediaError } = await supabase
      .from('media_assets')
      .select('id')
      .eq('uploader_id', storytellerId)

    if (mediaError) {
      console.error('Error fetching media:', mediaError)
    }

    // Get galleries count
    const { data: galleries, error: galleriesError } = await supabase
      .from('galleries')
      .select('id')
      .eq('created_by', storytellerId)

    if (galleriesError) {
      console.error('Error fetching galleries:', galleriesError)
    }

    // Calculate statistics
    const publishedStories = stories?.filter(s => s.status === 'published') || []
    const draftStories = stories?.filter(s => s.status === 'draft') || []
    const totalStories = stories?.length || 0
    
    // Calculate total views (mock for now)
    const totalViews = publishedStories.length * 50 + Math.floor(Math.random() * 500)
    
    // Calculate engagement score (mock for now)
    const engagementScore = Math.min(95, 60 + (publishedStories.length * 5))

    const stats = {
      totalStories,
      publishedStories: publishedStories.length,
      draftStories: draftStories.length,
      totalViews,
      engagementScore,
      mediaAssets: media?.length || 0,
      galleries: galleries?.length || 0,
      lastPublished: publishedStories.length > 0 
        ? publishedStories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : null
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error in storyteller stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}