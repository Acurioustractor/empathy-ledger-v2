'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentFormProps {
  storyId: string
  parentCommentId?: string
  onCommentAdded: (comment: any) => void
  onCancel?: () => void
  requiresModeration?: boolean
  placeholder?: string
  className?: string
}

export function CommentForm({
  storyId,
  parentCommentId,
  onCommentAdded,
  onCancel,
  requiresModeration = false,
  placeholder = 'Share your thoughts on this story...',
  className
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError('Please enter a comment')
      return
    }

    if (content.length > 2000) {
      setError('Comment is too long (maximum 2000 characters)')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch(`/api/stories/${storyId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          parent_comment_id: parentCommentId || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to post comment')
      }

      const data = await response.json()

      // Show success state
      setSuccess(true)
      setContent('')

      // Call callback
      onCommentAdded(data.comment)

      // Reset success state after 3 seconds
      setTimeout(() => setSuccess(false), 3000)

      // Close reply form if applicable
      if (onCancel) {
        setTimeout(() => onCancel(), 1500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const characterCount = content.length
  const isNearLimit = characterCount > 1800
  const isOverLimit = characterCount > 2000

  return (
    <Card className={cn("p-4 border-2 border-[#2C2C2C]/10", className)}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Text area */}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          disabled={submitting || success}
          className={cn(
            "min-h-[100px] resize-none border-[#2C2C2C]/20",
            "focus:border-[#D97757] focus:ring-[#D97757]/20",
            isOverLimit && "border-red-500 focus:border-red-500"
          )}
        />

        {/* Character count */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-xs",
              isOverLimit ? "text-red-600 font-medium" :
              isNearLimit ? "text-amber-600" :
              "text-[#2C2C2C]/40"
            )}
          >
            {characterCount} / 2000 characters
          </span>

          {/* Cultural reminder */}
          <span className="text-xs text-[#2C2C2C]/60 italic">
            Please be respectful and mindful
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5">✓</div>
            <div className="text-sm text-green-800">
              <p className="font-medium">
                {requiresModeration
                  ? 'Comment submitted for Elder review'
                  : 'Comment posted successfully'}
              </p>
              {requiresModeration && (
                <p className="text-green-700 mt-1">
                  Your comment will appear after it has been reviewed and approved.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={submitting || success || isOverLimit || !content.trim()}
            className="bg-[#D97757] hover:bg-[#D97757]/90"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : success ? (
              <>
                <span className="mr-2">✓</span>
                Posted
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {parentCommentId ? 'Post Reply' : 'Post Comment'}
              </>
            )}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
