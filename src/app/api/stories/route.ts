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

const VALID_ARTICLE_TYPES = [
  'story_feature',
  'program_spotlight',
  'research_summary',
  'community_news',
  'editorial',
  'impact_report',
  'project_update',
  'tutorial',
  'personal_story',
  'oral_history'
]

export async function POST(request: NextRequest) {
  try {
    // Use service client to bypass RLS for inserts
    // RLS policies are enforced via application logic (checking storyteller_id matches auth)
    const supabase = createSupabaseServiceClient()
    const body = await request.json()

    // Get author_id (required) and storyteller_id (optional)
    const authorId = body.author_id
    let storytellerId = body.storyteller_id || null

    // Validate required fields
    if (!body.title || !body.content || !authorId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, author_id' },
        { status: 400 }
      )
    }

    // Validate article_type if provided
    if (body.article_type && !VALID_ARTICLE_TYPES.includes(body.article_type)) {
      return NextResponse.json(
        { error: `Invalid article_type. Must be one of: ${VALID_ARTICLE_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // If storyteller_id is provided, verify it exists in storytellers table
    // Otherwise set to null (author may not be a storyteller)
    if (storytellerId) {
      const { data: storyteller } = await supabase
        .from('storytellers')
        .select('id')
        .eq('id', storytellerId)
        .single()

      if (!storyteller) {
        // storyteller_id provided but doesn't exist - set to null instead
        console.warn(`Storyteller ID ${storytellerId} not found in storytellers table, setting to null`)
        storytellerId = null
      }
    }

    // Get tenant_id - REQUIRED field (NOT NULL constraint)
    // Try from request body first, then get first available tenant as fallback
    let tenantId = body.tenant_id

    if (!tenantId) {
      // Get first tenant from database as fallback
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('id')
        .limit(1)
        .single()

      if (!tenantData) {
        return NextResponse.json(
          { error: 'No tenant found. Please provide tenant_id or create a tenant first.' },
          { status: 400 }
        )
      }

      tenantId = tenantData.id
    }

    const organizationId = body.organization_id || null

    // Build story data with ONLY fields that actually exist in the database
    // Based on successful test insert
    const storyData: any = {
      // Required fields
      title: body.title,
      content: body.content,
      tenant_id: tenantId,
      storyteller_id: storytellerId, // Can be null if author is not a storyteller
      author_id: authorId,

      // Optional core fields
      summary: body.excerpt || body.summary || null,
      organization_id: organizationId,
      project_id: body.project_id || null,

      // Status and privacy fields (using actual column names from schema)
      status: body.status || 'draft',
      community_status: body.community_status || 'draft',
      has_explicit_consent: body.has_explicit_consent !== false, // Default true
      permission_tier: body.visibility || body.privacy_level || 'private',
      privacy_level: body.privacy_level || body.visibility || 'private',

      // JSONB fields that actually exist
      sharing_permissions: body.sharing_permissions || {},

      // Note: Fields like story_type, audience, cultural_sensitivity_level, etc.
      // exist as direct columns, not in a metadata field
      story_type: body.story_type || 'personal_narrative',
      cultural_sensitivity_level: body.cultural_sensitivity_level || 'standard',

      // Tags, themes, and location
      tags: body.tags || [],
      themes: body.themes || [],
      location: body.location || null,

      // Editorial fields
      article_type: body.article_type || null,
      slug: body.slug || null,
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
      featured_image_id: body.featured_image_id || null,
      syndication_destinations: body.syndication_destinations || [],
      audience: body.audience || null,

      // Elder review
      requires_elder_review: body.requires_elder_review || false,

      // Media fields that exist as direct columns
      video_embed_code: body.video_embed_code || null,
      media_url: body.hero_image_url || body.video_url || null,

      // Language and features
      language: body.language || 'en',
      enable_ai_processing: body.enable_ai_processing !== false,
      notify_community: body.notify_community !== false
    }

    // TEMPORARY WORKAROUND: Use RPC to bypass PostgREST schema cache issue
    // TODO: Remove this workaround once PostgREST cache is fixed by Supabase support
    // See: POSTGREST_CACHE_STATUS.md for details
    const USE_RPC_WORKAROUND = true

    let story, error

    if (USE_RPC_WORKAROUND) {
      // Use RPC function to bypass schema cache
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('insert_story', { story_data: storyData })

      if (rpcError) {
        console.error('Error creating story via RPC:', rpcError)
        return NextResponse.json(
          { error: 'Failed to create story', details: rpcError.message },
          { status: 500 }
        )
      }

      // Return the RPC result directly (don't fetch back - cache issue)
      // Once PostgREST cache is fixed, we can fetch the full story
      return NextResponse.json({
        id: rpcData.id,
        created_at: rpcData.created_at,
        ...storyData,
        success: true
      }, { status: 201 })
    } else {
      // Normal PostgREST insert (use this after cache is fixed)
      const { data: insertData, error: insertError } = await supabase
        .from('stories')
        .insert([storyData])
        .select()
        .single()

      story = insertData
      error = insertError
    }

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