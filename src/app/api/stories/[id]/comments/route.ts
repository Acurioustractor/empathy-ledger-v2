import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/stories/[id]/comments - Get comments for a story
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    
    const sort = searchParams.get('sort') || 'recent'
    const parentId = searchParams.get('parent_id')

    let query = supabase
      .from('comments')
      .select(`
        id,
        story_id,
        commenter_id,
        content,
        parent_comment_id,
        status,
        created_at,
        updated_at,
        likes_count,
        replies_count,
        profiles!inner (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('story_id', id)
      .eq('status', 'approved') // Only show approved comments to public

    // Filter by parent comment if specified
    if (parentId) {
      query = query.eq('parent_comment_id', parentId)
    } else {
      query = query.is('parent_comment_id', null) // Top-level comments only
    }

    // Apply sorting
    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'popular':
        query = query.order('likes_count', { ascending: false })
        break
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data: comments, error } = await query

    if (error) throw error

    // Transform data to flatten profile info
    const transformedComments = comments?.map(comment => ({
      id: comment.id,
      story_id: comment.story_id,
      commenter_id: comment.commenter_id,
      commenter_name: (comment.profiles as any).display_name,
      commenter_avatar: (comment.profiles as any).avatar_url,
      content: comment.content,
      parent_comment_id: comment.parent_comment_id,
      status: comment.status,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      likes_count: comment.likes_count,
      replies_count: comment.replies_count
    })) || []

    return NextResponse.json({ comments: transformedComments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/stories/[id]/comments - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, parent_comment_id } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Comment is too long (maximum 2000 characters)' },
        { status: 400 }
      )
    }

    // Check if story exists and allows comments
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, allow_comments, requires_moderation')
      .eq('id', id)
      .eq('status', 'published')
      .single()

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    if (!story.allow_comments) {
      return NextResponse.json(
        { error: 'Comments are not enabled for this story' },
        { status: 403 }
      )
    }

    // Create comment
    const { data: comment, error: insertError } = await supabase
      .from('comments')
      .insert({
        story_id: id,
        commenter_id: user.id,
        content: content.trim(),
        parent_comment_id: parent_comment_id || null,
        status: story.requires_moderation ? 'pending' : 'approved'
      })
      .select(`
        id,
        story_id,
        commenter_id,
        content,
        parent_comment_id,
        status,
        created_at,
        updated_at,
        likes_count,
        replies_count
      `)
      .single()

    if (insertError) throw insertError

    // Get commenter profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .single()

    const responseComment = {
      ...comment,
      commenter_name: profile?.display_name || 'Anonymous',
      commenter_avatar: profile?.avatar_url
    }

    return NextResponse.json({ comment: responseComment }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
