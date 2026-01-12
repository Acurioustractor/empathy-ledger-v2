import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/discovery/feed
 * Get discovery feed with personalized, trending, new, or popular content
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const organizationId = searchParams.get('organization_id')
    const userId = searchParams.get('user_id')
    const feedType = searchParams.get('feed_type') || 'personalized' // personalized, trending, new, popular

    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 })
    }

    const items: any[] = []

    switch (feedType) {
      case 'new':
        // Recently added content
        const { data: newStories } = await supabase
          .from('stories')
          .select(`
            id,
            title,
            story_arc,
            cultural_themes,
            created_at,
            storyteller:storytellers(display_name)
          `)
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(12)

        newStories?.forEach(story => {
          items.push({
            id: story.id,
            type: 'story',
            title: story.title || 'Untitled Story',
            description: story.story_arc?.substring(0, 150) || '',
            reason: `Added ${new Date(story.created_at).toLocaleDateString()}`,
            score: 1.0,
            metadata: {
              storyteller: story.storyteller?.display_name,
              themes: story.cultural_themes
            }
          })
        })
        break

      case 'trending':
        // Content with recent engagement (simplified - would track views/likes in production)
        const { data: trendingStories } = await supabase
          .from('stories')
          .select(`
            id,
            title,
            story_arc,
            cultural_themes,
            created_at,
            storyteller:storytellers(display_name)
          `)
          .eq('organization_id', organizationId)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
          .order('created_at', { ascending: false })
          .limit(12)

        trendingStories?.forEach(story => {
          items.push({
            id: story.id,
            type: 'story',
            title: story.title || 'Untitled Story',
            description: story.story_arc?.substring(0, 150) || '',
            reason: 'Gaining traction in your community',
            score: 0.9,
            metadata: {
              storyteller: story.storyteller?.display_name,
              themes: story.cultural_themes,
              views: Math.floor(Math.random() * 100) + 20 // Mock data
            }
          })
        })
        break

      case 'popular':
        // Most viewed/liked content (simplified - would use actual engagement metrics)
        const { data: popularStories } = await supabase
          .from('stories')
          .select(`
            id,
            title,
            story_arc,
            cultural_themes,
            created_at,
            storyteller:storytellers(display_name)
          `)
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(12)

        popularStories?.forEach(story => {
          items.push({
            id: story.id,
            type: 'story',
            title: story.title || 'Untitled Story',
            description: story.story_arc?.substring(0, 150) || '',
            reason: 'Highly engaged with by your community',
            score: 0.95,
            metadata: {
              storyteller: story.storyteller?.display_name,
              themes: story.cultural_themes,
              views: Math.floor(Math.random() * 200) + 50,
              likes: Math.floor(Math.random() * 50) + 10
            }
          })
        })
        break

      case 'personalized':
      default:
        // Personalized recommendations based on user preferences
        // In production, this would use ML model or collaborative filtering
        const { data: personalizedStories } = await supabase
          .from('stories')
          .select(`
            id,
            title,
            story_arc,
            cultural_themes,
            created_at,
            storyteller:storytellers(display_name, cultural_background)
          `)
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false })
          .limit(12)

        personalizedStories?.forEach(story => {
          items.push({
            id: story.id,
            type: 'story',
            title: story.title || 'Untitled Story',
            description: story.story_arc?.substring(0, 150) || '',
            reason: 'Based on your interests and viewing history',
            score: 0.85 + Math.random() * 0.15, // Random score between 0.85-1.0
            metadata: {
              storyteller: story.storyteller?.display_name,
              themes: story.cultural_themes,
              contributors: 1
            }
          })
        })
        break
    }

    return NextResponse.json({
      success: true,
      items,
      feed_type: feedType,
      count: items.length
    })

  } catch (error) {
    console.error('Error in discovery feed API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
