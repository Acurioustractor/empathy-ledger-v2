import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/comments/[id]/like - Like/unlike a comment
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

    // Check if comment exists
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id, likes_count')
      .eq('id', id)
      .single()

    if (commentError || !comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Check if user already liked this comment
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', id)
      .eq('liker_id', user.id)
      .single()

    if (existingLike) {
      // Unlike - remove the like
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', id)
        .eq('liker_id', user.id)

      if (deleteError) throw deleteError

      // Decrement likes_count
      await supabase.rpc('decrement_comment_likes', { comment_id: id })

      return NextResponse.json({ 
        liked: false, 
        likes_count: Math.max(0, comment.likes_count - 1)
      })
    } else {
      // Like - add the like
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: id,
          liker_id: user.id,
          liked_at: new Date().toISOString()
        })

      if (insertError) throw insertError

      // Increment likes_count
      await supabase.rpc('increment_comment_likes', { comment_id: id })

      return NextResponse.json({ 
        liked: true, 
        likes_count: comment.likes_count + 1
      })
    }
  } catch (error) {
    console.error('Error liking comment:', error)
    return NextResponse.json(
      { error: 'Failed to like comment' },
      { status: 500 }
    )
  }
}
