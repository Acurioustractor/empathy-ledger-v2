// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { getThemeColor } from '@/app/world-tour/components/types/map-types'

interface StoryDetailResponse {
  story: {
    id: string
    title: string
    excerpt: string
    fullContent: string
    themes: string[]
    keyQuotes: { text: string; context: string }[]
    createdAt: string
    location: {
      name: string
      lat: number
      lng: number
    } | null
    culturalSensitivity: string | null
    storyType: string | null
  }
  storyteller: {
    id: string
    name: string
    avatarUrl: string | null
    bio: string
    otherStories: { id: string; title: string }[]
    profileUrl: string
  }
  connections: {
    storyId: string
    title: string
    sharedThemes: string[]
    location: string
    storytellerName: string
  }[]
  themeColors: Record<string, string>
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = createSupabaseServerClient()

    // Fetch the story with storyteller info
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        summary,
        content,
        location,
        cultural_themes,
        ai_themes,
        generated_themes,
        cultural_sensitivity_level,
        story_type,
        created_at,
        storyteller_id,
        profiles!stories_storyteller_id_fkey (
          id,
          first_name,
          last_name,
          display_name,
          bio,
          profile_image_url
        )
      `)
      .eq('id', id)
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Get storyteller's other stories
    const { data: otherStories } = await supabase
      .from('stories')
      .select('id, title')
      .eq('storyteller_id', story.storyteller_id)
      .neq('id', id)
      .eq('status', 'published')
      .limit(5)

    // Combine all themes
    const themes = [
      ...(story.cultural_themes || []),
      ...(story.ai_themes || []),
      ...(story.generated_themes || [])
    ].filter(Boolean)

    // Find connected stories (stories that share themes)
    let connections: StoryDetailResponse['connections'] = []

    if (themes.length > 0) {
      // Query for stories sharing themes
      const { data: relatedStories } = await supabase
        .from('stories')
        .select(`
          id,
          title,
          location,
          cultural_themes,
          ai_themes,
          generated_themes,
          profiles!stories_storyteller_id_fkey (
            display_name,
            first_name,
            last_name
          )
        `)
        .neq('id', id)
        .eq('status', 'published')
        .not('location', 'is', null)
        .limit(50)

      if (relatedStories) {
        connections = relatedStories
          .map(related => {
            const relatedThemes = [
              ...(related.cultural_themes || []),
              ...(related.ai_themes || []),
              ...(related.generated_themes || [])
            ].filter(Boolean)

            const sharedThemes = themes.filter(t =>
              relatedThemes.some(rt => rt.toLowerCase() === t.toLowerCase())
            )

            if (sharedThemes.length < 1) return null

            const loc = typeof related.location === 'string'
              ? JSON.parse(related.location)
              : related.location

            const profile = related.profiles as any

            return {
              storyId: related.id,
              title: related.title || 'Untitled',
              sharedThemes,
              location: loc?.name || loc?.city || 'Unknown',
              storytellerName: profile?.display_name ||
                `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
                'Anonymous'
            }
          })
          .filter(Boolean)
          .sort((a, b) => (b?.sharedThemes.length || 0) - (a?.sharedThemes.length || 0))
          .slice(0, 10) as StoryDetailResponse['connections']
      }
    }

    // Parse location
    const loc = story.location
      ? (typeof story.location === 'string' ? JSON.parse(story.location) : story.location)
      : null

    const profile = story.profiles as any

    // Build theme colors
    const themeColors: Record<string, string> = {}
    for (const theme of themes) {
      themeColors[theme.toLowerCase()] = getThemeColor(theme)
    }

    const response: StoryDetailResponse = {
      story: {
        id: story.id,
        title: story.title || 'Untitled Story',
        excerpt: story.summary || '',
        fullContent: story.content || '',
        themes,
        keyQuotes: [], // TODO: Extract from transcripts
        createdAt: story.created_at,
        location: loc ? {
          name: loc.name || loc.city || 'Unknown',
          lat: parseFloat(loc.lat),
          lng: parseFloat(loc.lng || loc.lon)
        } : null,
        culturalSensitivity: story.cultural_sensitivity_level,
        storyType: story.story_type
      },
      storyteller: {
        id: profile?.id || story.storyteller_id || '',
        name: profile?.display_name ||
          `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
          'Anonymous',
        avatarUrl: profile?.profile_image_url || null,
        bio: profile?.bio || '',
        otherStories: otherStories || [],
        profileUrl: `/storytellers/${profile?.id || story.storyteller_id}`
      },
      connections,
      themeColors
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Story detail error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch story details' },
      { status: 500 }
    )
  }
}
