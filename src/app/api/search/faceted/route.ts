import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/search/faceted
 * Search with faceted filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('query') || ''
    const organizationId = searchParams.get('organization_id')
    const projectId = searchParams.get('project_id')
    const filtersJson = searchParams.get('filters') || '{}'
    const filters = JSON.parse(filtersJson)

    if (!organizationId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 })
    }

    const results: any[] = []

    // Determine which content types to search
    const contentTypes = filters.contentType || ['Stories', 'Storytellers', 'Transcripts', 'Media']

    // Search Stories
    if (contentTypes.includes('Stories')) {
      let storiesQuery = supabase
        .from('stories')
        .select(`
          id,
          title,
          story_arc,
          cultural_themes,
          language,
          created_at,
          storyteller:storytellers(display_name, cultural_background)
        `)
        .eq('organization_id', organizationId)

      // Apply query filter
      if (query) {
        storiesQuery = storiesQuery.or(`title.ilike.%${query}%,story_arc.ilike.%${query}%`)
      }

      // Apply theme filter
      if (filters.themes && filters.themes.length > 0) {
        storiesQuery = storiesQuery.overlaps('cultural_themes', filters.themes)
      }

      // Apply language filter
      if (filters.languages && filters.languages.length > 0) {
        storiesQuery = storiesQuery.in('language', filters.languages)
      }

      // Apply project filter
      if (projectId) {
        storiesQuery = storiesQuery.eq('project_id', projectId)
      }

      const { data: stories } = await storiesQuery.limit(50)

      stories?.forEach(story => {
        // Apply cultural group filter (post-query since it's on related table)
        if (filters.culturalGroups && filters.culturalGroups.length > 0) {
          const hasCulturalMatch = filters.culturalGroups.some((group: string) =>
            story.storyteller?.cultural_background?.includes(group)
          )
          if (!hasCulturalMatch) return
        }

        results.push({
          id: story.id,
          type: 'story',
          title: story.title || 'Untitled Story',
          description: story.story_arc?.substring(0, 200) || '',
          metadata: {
            storyteller: story.storyteller?.display_name,
            themes: story.cultural_themes,
            language: story.language,
            created_at: story.created_at
          }
        })
      })
    }

    // Search Storytellers
    if (contentTypes.includes('Storytellers')) {
      let storytellersQuery = supabase
        .from('storytellers')
        .select('id, display_name, bio, cultural_background, created_at')
        .eq('organization_id', organizationId)

      if (query) {
        storytellersQuery = storytellersQuery.or(`display_name.ilike.%${query}%,bio.ilike.%${query}%`)
      }

      const { data: storytellers } = await storytellersQuery.limit(50)

      storytellers?.forEach(storyteller => {
        // Apply cultural group filter
        if (filters.culturalGroups && filters.culturalGroups.length > 0) {
          const hasCulturalMatch = filters.culturalGroups.some((group: string) =>
            storyteller.cultural_background?.includes(group)
          )
          if (!hasCulturalMatch) return
        }

        results.push({
          id: storyteller.id,
          type: 'storyteller',
          title: storyteller.display_name || 'Unknown',
          description: storyteller.bio?.substring(0, 200) || '',
          metadata: {
            cultural_background: storyteller.cultural_background,
            created_at: storyteller.created_at
          }
        })
      })
    }

    // Search Transcripts
    if (contentTypes.includes('Transcripts')) {
      let transcriptsQuery = supabase
        .from('transcripts')
        .select('id, title, content, themes, created_at')
        .eq('organization_id', organizationId)

      if (query) {
        transcriptsQuery = transcriptsQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      }

      if (filters.themes && filters.themes.length > 0) {
        transcriptsQuery = transcriptsQuery.overlaps('themes', filters.themes)
      }

      const { data: transcripts } = await transcriptsQuery.limit(50)

      transcripts?.forEach(transcript => {
        results.push({
          id: transcript.id,
          type: 'transcript',
          title: transcript.title || 'Untitled Transcript',
          description: transcript.content?.substring(0, 200) || '',
          metadata: {
            themes: transcript.themes,
            created_at: transcript.created_at
          }
        })
      })
    }

    // Search Media
    if (contentTypes.includes('Media')) {
      let mediaQuery = supabase
        .from('media')
        .select('id, file_name, title, description, media_type, created_at')
        .eq('organization_id', organizationId)

      if (query) {
        mediaQuery = mediaQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      }

      if (filters.mediaTypes && filters.mediaTypes.length > 0) {
        mediaQuery = mediaQuery.in('media_type', filters.mediaTypes)
      }

      const { data: media } = await mediaQuery.limit(50)

      media?.forEach(item => {
        results.push({
          id: item.id,
          type: 'media',
          title: item.title || item.file_name || 'Untitled Media',
          description: item.description?.substring(0, 200) || '',
          metadata: {
            media_type: item.media_type,
            created_at: item.created_at
          }
        })
      })
    }

    // Fetch updated facet counts based on current results
    // (This would ideally update the facet counts dynamically)

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
      query,
      filters
    })

  } catch (error) {
    console.error('Error in faceted search:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
