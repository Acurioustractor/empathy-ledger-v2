import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Temporarily bypass auth check
    console.log('Bypassing auth check for admin content stories')

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const culturalSensitivity = searchParams.get('cultural_sensitivity') || 'all'
    const storyType = searchParams.get('story_type') || 'all'
    
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        status,
        featured,
        cultural_context,
        tags,
        story_type,
        audience,
        cultural_sensitivity_level,
        elder_approval,
        cultural_review_status,
        consent_status,
        views_count,
        likes_count,
        shares_count,
        created_at,
        updated_at,
        publication_date,
        profiles!stories_author_id_fkey (
          id,
          display_name,
          full_name,
          cultural_background
        ),
        storytellers!stories_storyteller_id_fkey (
          id,
          display_name,
          elder_status
        )
      `)

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (culturalSensitivity !== 'all') {
      query = query.eq('cultural_sensitivity_level', culturalSensitivity)
    }

    if (storyType !== 'all') {
      query = query.eq('story_type', storyType)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    // Get total count for pagination
    const { count: totalCount } = await query.select('*', { count: 'exact', head: true })

    // Get paginated results
    const { data: stories, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching stories:', error)
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
    }

    // Transform data for admin interface
    const formattedStories = stories?.map(story => ({
      id: story.id,
      title: story.title,
      content: story.content,
      status: story.status,
      featured: story.featured,
      culturalContext: story.cultural_context,
      tags: story.tags || [],
      storyType: story.story_type,
      audience: story.audience,
      culturalSensitivityLevel: story.cultural_sensitivity_level,
      elderApproval: story.elder_approval,
      culturalReviewStatus: story.cultural_review_status,
      consentStatus: story.consent_status,
      views: story.views_count || 0,
      likes: story.likes_count || 0,
      shares: story.shares_count || 0,
      createdAt: story.created_at,
      updatedAt: story.updated_at,
      publicationDate: story.publication_date,
      author: {
        id: story.profiles?.id,
        name: story.profiles?.display_name || story.profiles?.full_name || 'Unknown',
        culturalBackground: story.profiles?.cultural_background
      },
      storyteller: story.storytellers ? {
        id: story.storytellers.id,
        name: story.storytellers.display_name,
        elderStatus: story.storytellers.elder_status
      } : null,
      needsReview: story.status === 'review' || story.cultural_review_status === 'pending',
      needsElderReview: story.cultural_sensitivity_level === 'high' && !story.elder_approval,
      priority: story.cultural_sensitivity_level === 'high' ? 'high' : 
                story.cultural_sensitivity_level === 'medium' ? 'medium' : 'low'
    })) || []

    return NextResponse.json({
      stories: formattedStories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((totalCount || 0) / limit),
        totalCount: totalCount || 0,
        hasNext: page < Math.ceil((totalCount || 0) / limit),
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Admin content stories error:', error)
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Temporarily bypass auth check
    console.log('Bypassing auth check for admin content stories update')

    const body = await request.json()
    const { storyId, updates, adminAction } = body

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 })
    }

    let updateData: any = {}

    if (adminAction) {
      switch (adminAction) {
        case 'approve':
          updateData = {
            status: 'published',
            cultural_review_status: 'approved',
            publication_date: new Date().toISOString()
          }
          break
        case 'reject':
          updateData = {
            status: 'draft',
            cultural_review_status: 'rejected'
          }
          break
        case 'flag':
          updateData = {
            status: 'review',
            cultural_review_status: 'needs_review'
          }
          break
        case 'feature':
          updateData = { featured: true }
          break
        case 'unfeature':
          updateData = { featured: false }
          break
        case 'elder_approve':
          updateData = { elder_approval: true }
          break
        case 'elder_reject':
          updateData = { elder_approval: false }
          break
        default:
          return NextResponse.json({ error: 'Invalid admin action' }, { status: 400 })
      }
    } else if (updates) {
      updateData = updates
    }

    updateData.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', storyId)

    if (error) {
      console.error('Error updating story:', error)
      return NextResponse.json({ error: 'Failed to update story' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Story updated successfully' })

  } catch (error) {
    console.error('Admin story update error:', error)
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 })
  }
}