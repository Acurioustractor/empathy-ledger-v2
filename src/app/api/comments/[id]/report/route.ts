import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/comments/[id]/report - Report a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check authentication (optional - allow anonymous reports)
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { reason, details } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Report reason is required' },
        { status: 400 }
      )
    }

    const validReasons = [
      'spam',
      'harassment',
      'misinformation',
      'cultural-insensitivity',
      'inappropriate',
      'other'
    ]

    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid report reason' },
        { status: 400 }
      )
    }

    // Check if comment exists
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id, story_id')
      .eq('id', id)
      .single()

    if (commentError || !comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Create report
    const { error: insertError } = await supabase
      .from('comment_reports')
      .insert({
        comment_id: id,
        reporter_id: user?.id || null,
        reason,
        details: details || null,
        status: 'pending',
        reported_at: new Date().toISOString()
      })

    if (insertError) throw insertError

    // If this is a cultural-insensitivity report, flag for Elder review
    if (reason === 'cultural-insensitivity') {
      await supabase
        .from('comments')
        .update({ flagged_for_review: true })
        .eq('id', id)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Report submitted successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error reporting comment:', error)
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    )
  }
}
