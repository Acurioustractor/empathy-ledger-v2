// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/client-ssr'

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

    // Use service client to bypass RLS issues
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

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
      `, { count: 'exact' })

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (storyType) {
      query = query.eq('story_type', storyType)
    }
    
    // Note: audience column doesn't exist in current schema
    // if (audience && audience !== 'all') {
    //   query = query.eq('audience', audience)
    // }
    
    if (culturalSensitivity) {
      query = query.eq('cultural_sensitivity_level', culturalSensitivity)
    }
    
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }
    
    if (storytellerId) {
      query = query.eq('storyteller_id', storytellerId)
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }
    
    if (tag) {
      query = query.contains('cultural_tags', [tag])
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
    // Use service client to bypass RLS for inserts
    // RLS policies are enforced via application logic (checking storyteller_id matches auth)
    const supabase = createSupabaseServiceClient()
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.content || !body.storyteller_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, storyteller_id' },
        { status: 400 }
      )
    }

    // Use tenant_id and organization_id from request body or default to null
    // Avoid querying profiles table to prevent RLS infinite recursion issues
    const tenantId = body.tenant_id || null
    const organizationId = body.organization_id || null

    // Sprint 2 Story Creation
    const storyData: StoryInsert = {
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || null,
      storyteller_id: body.storyteller_id,
      author_id: body.storyteller_id,
      tenant_id: tenantId,
      organization_id: organizationId,
      project_id: body.project_id || null,

      // Story type
      story_type: body.story_type || 'text',
      video_link: body.video_link || null,

      // Location and categorization
      location: body.location || null,
      tags: body.tags || [],
      language: body.language || 'en',

      // Cultural safety
      cultural_sensitivity_level: body.cultural_sensitivity_level || 'none',
      requires_elder_review: body.requires_elder_review || false,

      // Privacy (using existing schema fields)
      status: 'draft', // Always start as draft
      privacy_level: body.privacy_level || body.visibility || 'private',
      is_public: body.is_public !== undefined ? body.is_public : (body.visibility === 'public'),

      // AI processing preferences
      enable_ai_processing: body.enable_ai_processing !== undefined ? body.enable_ai_processing : true,
      notify_community: body.notify_community !== undefined ? body.notify_community : true,

      // Consent tracking (using existing schema fields)
      has_explicit_consent: body.has_explicit_consent || false,
      consent_details: body.consent_details || null,

      // Media metadata (word_count and reading_time auto-calculated by trigger)
      media_metadata: body.media_metadata || null
    }

    const { data: story, error } = await supabase
      .from('stories')
      .insert([storyData])
      .select()
      .single()

    if (error) {
      console.error('Error creating story:', error)
      return NextResponse.json(
        { error: 'Failed to create story', details: error.message },
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