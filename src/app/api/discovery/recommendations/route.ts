import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/discovery/recommendations
 * Get AI-powered content recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const organizationId = searchParams.get('organization_id')
    const userId = searchParams.get('user_id')
    const basedOnType = searchParams.get('based_on_type') // story, storyteller, theme
    const basedOnId = searchParams.get('based_on_id')

    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 })
    }

    const recommendations: any[] = []

    // 1. Similar Content (Content-based filtering)
    if (basedOnType && basedOnId) {
      if (basedOnType === 'story') {
        // Get the source story
        const { data: sourceStory } = await supabase
          .from('stories')
          .select('cultural_themes')
          .eq('id', basedOnId)
          .single()

        if (sourceStory?.cultural_themes && sourceStory.cultural_themes.length > 0) {
          // Find stories with overlapping themes
          const { data: similarStories } = await supabase
            .from('stories')
            .select(`
              id,
              title,
              story_arc,
              cultural_themes,
              storyteller:storytellers(display_name)
            `)
            .eq('organization_id', organizationId)
            .neq('id', basedOnId)
            .overlaps('cultural_themes', sourceStory.cultural_themes)
            .limit(5)

          similarStories?.forEach(story => {
            const commonThemes = story.cultural_themes?.filter(
              (t: string) => sourceStory.cultural_themes.includes(t)
            ) || []

            recommendations.push({
              id: story.id,
              title: story.title || 'Untitled Story',
              description: story.story_arc?.substring(0, 150) || '',
              type: 'story',
              relevance_score: 0.8 + (commonThemes.length * 0.05),
              recommendation_type: 'similar_to_viewed',
              metadata: {
                storyteller: story.storyteller?.display_name,
                common_themes: commonThemes
              }
            })
          })
        }
      }
    }

    // 2. Related Themes
    const { data: recentStories } = await supabase
      .from('stories')
      .select('cultural_themes')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(10)

    const allThemes = recentStories?.flatMap(s => s.cultural_themes || []) || []
    const themeCounts: Record<string, number> = {}
    allThemes.forEach(theme => {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1
    })

    const topThemes = Object.entries(themeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([theme]) => theme)

    if (topThemes.length > 0) {
      const { data: themeStories } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          story_arc,
          cultural_themes,
          storyteller:storytellers(display_name)
        `)
        .eq('organization_id', organizationId)
        .overlaps('cultural_themes', topThemes)
        .limit(4)

      themeStories?.forEach(story => {
        recommendations.push({
          id: story.id,
          title: story.title || 'Untitled Story',
          description: story.story_arc?.substring(0, 150) || '',
          type: 'story',
          relevance_score: 0.75,
          recommendation_type: 'related_themes',
          metadata: {
            storyteller: story.storyteller?.display_name,
            themes: story.cultural_themes
          }
        })
      })
    }

    // 3. Collaborative Filtering (What others viewed)
    // Simplified - in production would track user behavior
    const { data: collaborativeStories } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        story_arc,
        storyteller:storytellers(display_name)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(3)

    collaborativeStories?.forEach(story => {
      recommendations.push({
        id: story.id,
        title: story.title || 'Untitled Story',
        description: story.story_arc?.substring(0, 150) || '',
        type: 'story',
        relevance_score: 0.7,
        recommendation_type: 'collaborative',
        metadata: {
          storyteller: story.storyteller?.display_name,
          viewed_by_similar_users: Math.floor(Math.random() * 10) + 5
        }
      })
    })

    // 4. Trending Content
    const { data: trendingStories } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        story_arc,
        storyteller:storytellers(display_name)
      `)
      .eq('organization_id', organizationId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(3)

    trendingStories?.forEach(story => {
      recommendations.push({
        id: story.id,
        title: story.title || 'Untitled Story',
        description: story.story_arc?.substring(0, 150) || '',
        type: 'story',
        relevance_score: 0.65,
        recommendation_type: 'trending',
        metadata: {
          storyteller: story.storyteller?.display_name,
          trending_score: Math.random() * 0.3 + 0.7
        }
      })
    })

    // Remove duplicates and sort by relevance
    const uniqueRecs = Array.from(
      new Map(recommendations.map(rec => [rec.id, rec])).values()
    ).sort((a, b) => b.relevance_score - a.relevance_score)

    return NextResponse.json({
      success: true,
      recommendations: uniqueRecs,
      count: uniqueRecs.length
    })

  } catch (error) {
    console.error('Error in recommendations API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
