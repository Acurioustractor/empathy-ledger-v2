// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/server'

import { ApiErrors, createSuccessResponse } from '@/lib/utils/api-responses'



export async function GET(request: NextRequest) {
  try {
    // Use admin client to bypass RLS (avoids profiles table recursion)
    const supabase = createAdminClient()

    // Get pending stories with storyteller information (via storyteller_id, not author_id)
    const { data: pendingStories, error } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        content,
        status,
        created_at,
        cultural_sensitivity_level,
        requires_elder_approval,
        storyteller:storytellers!storyteller_id (
          id,
          display_name
        )
      `)
      .in('status', ['pending', 'draft', 'in_review'])
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching pending reviews:', error)
      return ApiErrors.InternalError('Failed to fetch pending reviews', error)
    }

    // Transform the data to match the expected format
    const reviews = pendingStories?.map(story => ({
      id: story.id,
      type: 'story' as const,
      title: story.title || 'Untitled Story',
      author: story.storyteller?.display_name || 'Unknown Author',
      submittedAt: story.created_at,
      priority: story.cultural_sensitivity_level === 'high' || story.cultural_sensitivity_level === 'sacred' ? 'high' :
                story.requires_elder_approval ? 'high' : 'medium',
      culturalSensitive: story.cultural_sensitivity_level === 'high' || story.cultural_sensitivity_level === 'sacred',
      requiresElderReview: story.requires_elder_approval || story.cultural_sensitivity_level === 'sacred',
      status: story.status === 'in_review' ? 'in_review' : 'pending' as const
    })) || []

    return createSuccessResponse({
      reviews,
      total: reviews.length
    })

  } catch (error) {
    console.error('Admin pending reviews error:', error)
    return NextResponse.json({ error: 'Failed to fetch pending reviews' }, { status: 500 })
  }
}