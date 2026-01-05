'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, AlertCircle } from 'lucide-react'
import { CommentForm } from './CommentForm'
import { CommentThread } from './CommentThread'
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

interface CommentsSectionProps {
  storyId: string
  allowComments: boolean
  requiresModeration: boolean
  className?: string
}

export function CommentsSection({
  storyId,
  allowComments,
  requiresModeration,
  className
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'popular'>('recent')

  useEffect(() => {
    fetchComments()
  }, [storyId, sortBy])

  const fetchComments = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/stories/${storyId}/comments?sort=${sortBy}`)
      if (!response.ok) throw new Error('Failed to load comments')

      const data = await response.json()
      setComments(data.comments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleCommentAdded = (newComment: Comment) => {
    if (requiresModeration) {
      // Show pending message instead of adding to list
      return
    }
    // Add to top of list for immediate feedback
    setComments([newComment, ...comments])
  }

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(comments.map(c => c.id === updatedComment.id ? updatedComment : c))
  }

  const handleCommentDeleted = (commentId: string) => {
    setComments(comments.filter(c => c.id !== commentId))
  }

  if (!allowComments) {
    return (
      <Card className="p-6 bg-[#F8F6F1] border-2 border-[#2C2C2C]/10">
        <div className="text-center text-sm text-[#2C2C2C]/60">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>Comments are not enabled for this story.</p>
        </div>
      </Card>
    )
  }

  // Organize comments into threads (top-level + replies)
  const topLevelComments = comments.filter(c => !c.parent_comment_id)
  const totalComments = comments.length

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-2xl font-bold text-[#2C2C2C]">
            Comments
          </h2>
          <Badge variant="secondary" className="bg-[#D97757]/10 text-[#D97757] border-[#D97757]/20">
            {totalComments}
          </Badge>
        </div>

        {/* Sort options */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#2C2C2C]/60">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-[#2C2C2C]/20 rounded-lg px-3 py-1.5 bg-white hover:border-[#D97757] focus:outline-none focus:ring-2 focus:ring-[#D97757]/20"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Moderation notice */}
      {requiresModeration && (
        <Card className="p-4 bg-blue-50 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-blue-800">
              <p className="font-medium">Elder Moderation Active</p>
              <p className="text-blue-700 mt-1">
                Comments on this story are reviewed by community Elders before being published.
                This ensures respectful dialogue and cultural safety.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Comment form */}
      <CommentForm
        storyId={storyId}
        onCommentAdded={handleCommentAdded}
        requiresModeration={requiresModeration}
      />

      {/* Comments list */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-8">
            <div className="text-center text-sm text-[#2C2C2C]/60">
              <div className="w-8 h-8 mx-auto mb-3 border-2 border-[#D97757] border-t-transparent rounded-full animate-spin" />
              <p>Loading comments...</p>
            </div>
          </Card>
        ) : error ? (
          <Card className="p-6 bg-red-50 border-2 border-red-200">
            <div className="text-center text-sm text-red-800">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <p className="font-medium">{error}</p>
              <button
                onClick={fetchComments}
                className="mt-2 text-xs text-red-600 hover:text-red-700 underline"
              >
                Try again
              </button>
            </div>
          </Card>
        ) : topLevelComments.length === 0 ? (
          <Card className="p-8 bg-[#F8F6F1] border-2 border-[#2C2C2C]/10">
            <div className="text-center text-sm text-[#2C2C2C]/60">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No comments yet</p>
              <p className="mt-1">Be the first to share your thoughts on this story.</p>
            </div>
          </Card>
        ) : (
          topLevelComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              storyId={storyId}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
              onReplyAdded={handleCommentAdded}
            />
          ))
        )}
      </div>
    </div>
  )
}
