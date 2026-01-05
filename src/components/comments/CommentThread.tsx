'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  story_id: string
  commenter_id: string
  commenter_name: string
  commenter_avatar?: string
  content: string
  parent_comment_id?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  likes_count: number
  replies_count: number
  replies?: Comment[]
}

interface CommentThreadProps {
  comment: Comment
  storyId: string
  onCommentUpdated: (comment: Comment) => void
  onCommentDeleted: (commentId: string) => void
  onReplyAdded: (comment: Comment) => void
  depth?: number
  className?: string
}

export function CommentThread({
  comment,
  storyId,
  onCommentUpdated,
  onCommentDeleted,
  onReplyAdded,
  depth = 0,
  className
}: CommentThreadProps) {
  const [replies, setReplies] = useState<Comment[]>(comment.replies || [])
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [loadingReplies, setLoadingReplies] = useState(false)

  // Maximum nesting depth for replies
  const MAX_DEPTH = 3
  const canReply = depth < MAX_DEPTH

  // Fetch replies if they exist but aren't loaded
  useEffect(() => {
    if (comment.replies_count > 0 && replies.length === 0 && depth === 0) {
      fetchReplies()
    }
  }, [comment.id])

  const fetchReplies = async () => {
    try {
      setLoadingReplies(true)
      const response = await fetch(`/api/stories/${storyId}/comments?parent_id=${comment.id}`)
      if (!response.ok) throw new Error('Failed to load replies')

      const data = await response.json()
      setReplies(data.comments || [])
    } catch (err) {
      console.error('Failed to fetch replies:', err)
    } finally {
      setLoadingReplies(false)
    }
  }

  const handleReplyAdded = (newReply: Comment) => {
    setReplies([newReply, ...replies])
    setShowReplyForm(false)
    onReplyAdded(newReply)
  }

  const handleReplyUpdated = (updatedReply: Comment) => {
    setReplies(replies.map(r => r.id === updatedReply.id ? updatedReply : r))
    onCommentUpdated(updatedReply)
  }

  const handleReplyDeleted = (replyId: string) => {
    setReplies(replies.filter(r => r.id !== replyId))
    onCommentDeleted(replyId)
  }

  const handleReplyClick = () => {
    setShowReplyForm(!showReplyForm)
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main comment */}
      <CommentItem
        comment={comment}
        onReplyClick={canReply ? handleReplyClick : undefined}
        onUpdate={onCommentUpdated}
        onDelete={onCommentDeleted}
        depth={depth}
      />

      {/* Reply form */}
      {showReplyForm && canReply && (
        <div className="ml-12 md:ml-16">
          <CommentForm
            storyId={storyId}
            parentCommentId={comment.id}
            onCommentAdded={handleReplyAdded}
            onCancel={() => setShowReplyForm(false)}
            placeholder="Write a reply..."
          />
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-8 md:ml-12 space-y-3 border-l-2 border-[#D4A373]/30 pl-4 md:pl-6">
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              storyId={storyId}
              onCommentUpdated={handleReplyUpdated}
              onCommentDeleted={handleReplyDeleted}
              onReplyAdded={onReplyAdded}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {/* Load replies button */}
      {comment.replies_count > 0 && replies.length === 0 && depth === 0 && (
        <div className="ml-12 md:ml-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchReplies}
            disabled={loadingReplies}
            className="text-[#D97757] hover:text-[#D97757]/80 hover:bg-[#D97757]/5"
          >
            {loadingReplies ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-[#D97757] border-t-transparent rounded-full animate-spin" />
                Loading replies...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Show {comment.replies_count} {comment.replies_count === 1 ? 'reply' : 'replies'}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
