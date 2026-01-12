import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * GET /api/search/semantic
 * Semantic search using vector embeddings for meaning-based matching
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('query')
    const organizationId = searchParams.get('organization_id')
    const projectId = searchParams.get('project_id')
    const threshold = parseFloat(searchParams.get('threshold') || '0.7')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query || !organizationId) {
      return NextResponse.json(
        { error: 'query and organization_id required' },
        { status: 400 }
      )
    }

    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    })

    const queryEmbedding = embeddingResponse.data[0].embedding

    // Search stories with embeddings (if story embeddings exist)
    const { data: stories, error: storiesError } = await supabase.rpc(
      'match_stories_semantic',
      {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        filter_org_id: organizationId,
        filter_project_id: projectId
      }
    )

    // Search themes with embeddings
    const { data: themes, error: themesError } = await supabase.rpc(
      'match_themes_semantic',
      {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: 10
      }
    )

    // Combine results
    const results: any[] = []

    stories?.forEach((story: any) => {
      results.push({
        id: story.id,
        title: story.title || 'Untitled Story',
        content: story.story_arc?.substring(0, 200) || '',
        similarity_score: story.similarity,
        type: 'story',
        metadata: {
          storyteller: story.storyteller_name,
          themes: story.themes,
          created_at: story.created_at
        }
      })
    })

    // Extract similar theme names for suggestions
    const similarThemes = themes?.map((t: any) => t.theme_name).slice(0, 5) || []

    return NextResponse.json({
      success: true,
      query,
      results,
      similar_themes: similarThemes,
      count: results.length
    })

  } catch (error) {
    console.error('Error in semantic search API:', error)

    // Return helpful error if embeddings aren't set up
    if (error instanceof Error && error.message.includes('function')) {
      return NextResponse.json({
        error: 'Semantic search not yet configured. Database functions needed.',
        results: [],
        similar_themes: []
      }, { status: 200 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
