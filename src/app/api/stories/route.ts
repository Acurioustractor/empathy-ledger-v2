// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { getAuditService } from '@/lib/services/audit.service'

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

    const supabase = createSupabaseServerClient()
    
    let query = supabase
      .from('stories')
      .select(`
        *,
        storyteller:profiles!stories_storyteller_id_fkey(
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
    // Authenticate user
    const authSupabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await authSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const supabase = createSupabaseServerClient()
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 }
      )
    }

    // Use authenticated user as author
    const authorId = user.id

    // Get tenant_id from the author's profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', authorId)
      .single()

    const tenantId = body.tenant_id || userProfile?.tenant_id || null

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = body.content.split(/\s+/).length
    const readingTimeMinutes = Math.ceil(wordCount / 200)

    // Use fields that actually exist in the database - verified working
    const storyData = {
      title: body.title,
      content: body.content,
      storyteller_id: authorId,
      author_id: authorId,
      tenant_id: tenantId,
      status: body.status || 'draft',
      // Add optional fields that work
      is_featured: body.featured || false,
      cultural_sensitivity_level: body.cultural_sensitivity_level || 'standard',
      privacy_level: body.privacy_level || 'private',
      story_type: body.story_type || 'personal_narrative'
    }

    const { data: story, error } = await supabase
      .from('stories')
      .insert([storyData])
      .select(`
        *,
        storyteller:profiles!stories_storyteller_id_fkey(
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

    // GDPR: Create audit log for story creation
    try {
      const auditService = getAuditService()
      await auditService.log({
        tenant_id: tenantId,
        entity_type: 'story',
        entity_id: story.id,
        action: 'create',
        action_category: 'content',
        actor_id: authorId,
        actor_type: 'user',
        new_state: {
          title: story.title,
          status: story.status,
          cultural_sensitivity_level: story.cultural_sensitivity_level,
          privacy_level: story.privacy_level
        },
        change_summary: `Story "${story.title}" created`,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        user_agent: request.headers.get('user-agent') || null
      })
    } catch (auditError) {
      // Don't fail the request if audit logging fails
      console.error('Audit log creation failed:', auditError)
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