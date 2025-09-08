import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import type { Story, StoryInsert } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'published'
    const storyType = searchParams.get('type')
    const audience = searchParams.get('audience')
    const culturalSensitivity = searchParams.get('cultural_sensitivity')
    const featured = searchParams.get('featured')
    const storytellerId = searchParams.get('storyteller_id')
    const tag = searchParams.get('tag')
    const location = searchParams.get('location')

    const supabase = await createSupabaseServerClient()
    
    let query = supabase
      .from('stories')
      .select(`
        *,
        author:profiles!stories_author_id_fkey(
          id,
          display_name,
          full_name,
          profile_image_url,
          cultural_background
        )
      `)

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (storyType) {
      query = query.eq('story_type', storyType)
    }
    
    if (audience && audience !== 'all') {
      query = query.eq('audience', audience)
    }
    
    if (culturalSensitivity) {
      query = query.eq('cultural_sensitivity_level', culturalSensitivity)
    }
    
    if (featured === 'true') {
      query = query.eq('featured', true)
    }
    
    if (storytellerId) {
      query = query.eq('storyteller_id', storytellerId)
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }
    
    if (tag) {
      query = query.contains('tags', [tag])
    }

    // Apply search
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    // Apply pagination and ordering
    const offset = (page - 1) * limit
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: stories, error, count } = await query

    if (error) {
      console.error('Error fetching stories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch stories' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      stories: stories || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Stories API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.content || !body.author_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, author_id' },
        { status: 400 }
      )
    }

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = body.content.split(/\s+/).length
    const readingTimeMinutes = Math.ceil(wordCount / 200)

    const storyData: StoryInsert = {
      title: body.title,
      content: body.content,
      author_id: body.author_id,
      storyteller_id: body.storyteller_id || null,
      status: body.status || 'draft',
      featured: body.featured || false,
      cultural_context: body.cultural_context || null,
      tags: body.tags || [],
      location: body.location || null,
      story_type: body.story_type || 'personal',
      audience: body.audience || 'all',
      cultural_permissions: body.cultural_permissions || null,
      consent_status: body.consent_status || 'pending',
      media_attachments: body.media_attachments || null,
      transcript_id: body.transcript_id || null,
      language: body.language || 'en',
      cultural_sensitivity_level: body.cultural_sensitivity_level || 'medium',
      elder_approval: body.elder_approval || null,
      cultural_review_status: body.cultural_review_status || 'pending',
      reading_time_minutes: readingTimeMinutes,
      views_count: 0,
      likes_count: 0,
      shares_count: 0
    }

    const supabase = await createSupabaseServerClient()
    
    const { data: story, error } = await supabase
      .from('stories')
      .insert([storyData])
      .select(`
        *,
        author:profiles!stories_author_id_fkey(
          id,
          display_name,
          full_name,
          profile_image_url,
          cultural_background
        )
      `)
      .single()

    if (error) {
      console.error('Error creating story:', error)
      return NextResponse.json(
        { error: 'Failed to create story' },
        { status: 500 }
      )
    }

    return NextResponse.json(story, { status: 201 })

  } catch (error) {
    console.error('Story creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}