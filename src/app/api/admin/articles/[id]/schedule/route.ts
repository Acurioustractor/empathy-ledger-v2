// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

/**
 * POST /api/admin/articles/:id/schedule
 * Schedule an article for future publication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params
    const body = await request.json()

    const { scheduledPublishAt } = body

    if (!scheduledPublishAt) {
      return NextResponse.json(
        { error: 'scheduledPublishAt is required' },
        { status: 400 }
      )
    }

    const scheduleDate = new Date(scheduledPublishAt)
    if (scheduleDate <= new Date()) {
      return NextResponse.json(
        { error: 'Schedule date must be in the future' },
        { status: 400 }
      )
    }

    // Update article with scheduled date
    const { data: article, error } = await supabase
      .from('stories')
      .update({
        scheduled_publish_at: scheduleDate.toISOString(),
        status: 'approved' // Set to approved, will publish at scheduled time
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error scheduling article:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        status: article.status,
        scheduledPublishAt: article.scheduled_publish_at
      },
      message: `Article scheduled for publication on ${scheduleDate.toLocaleDateString()}`
    })

  } catch (error) {
    console.error('Error scheduling article:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to schedule article' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/articles/:id/schedule
 * Cancel scheduled publication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params

    const { data: article, error } = await supabase
      .from('stories')
      .update({
        scheduled_publish_at: null,
        status: 'draft'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error canceling schedule:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        status: article.status
      },
      message: 'Scheduled publication canceled'
    })

  } catch (error) {
    console.error('Error canceling schedule:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel schedule' },
      { status: 500 }
    )
  }
}
