import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { query, threshold = 0.5, limit = 5, category, culturalSensitivity } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    })

    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    })

    const queryEmbedding = embeddingResponse.data[0].embedding

    // Search knowledge base
    const { data, error } = await supabase.rpc('search_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_category: category || null,
      filter_cultural_sensitivity: culturalSensitivity || null
    })

    if (error) {
      console.error('Search error:', error)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    // Format results
    const results = data.map((result: {
      chunk_id: string
      document_id: string
      document_title: string
      document_category: string
      chunk_content: string
      chunk_summary: string | null
      similarity: number
      cultural_sensitivity: string
      section_path: string[] | null
    }) => ({
      id: result.chunk_id,
      documentId: result.document_id,
      title: result.document_title,
      category: result.document_category,
      content: result.chunk_content,
      summary: result.chunk_summary,
      similarity: Math.round(result.similarity * 100),
      culturalSensitivity: result.cultural_sensitivity,
      sectionPath: result.section_path
    }))

    return NextResponse.json({
      query,
      results,
      totalResults: results.length
    })
  } catch (error) {
    console.error('Knowledge base search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
