'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Heart,
  MessageSquare,
  MoreVertical,
  Flag,
  Pencil,
  Trash2,
  Clock
} from 'lucide-react'
import { ReportDialog } from './ReportDialog'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  commenter_id: string
  commenter_name: string
  commenter_avatar?: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  likes_count: number
  replies_count: number
}

interface CommentItemProps {
  comment: Comment
  onReplyClick?: () => void
  onUpdate: (comment: Comment) => void
  onDelete: (commentId: string) => void
  depth?: number
  className?: string
}

export function CommentItem({
  comment,
  onReplyClick,
  onUpdate,
  onDelete,
  depth = 0,
  className
}: CommentItemProps) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(comment.likes_count)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // TODO: Check if current user is the commenter
  const isOwnComment = false

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/comments/${comment.id}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        setLiked(!liked)
        setLikesCount(liked ? likesCount - 1 : likesCount + 1)
      }
    } catch (error) {
      console.error('Failed to like comment:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onDelete(comment.id)
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const timeAgo = getTimeAgo(comment.created_at)
  const isEdited = comment.created_at !== comment.updated_at
  const isPending = comment.status === 'pending'

  return (
    <>
      <Card className={cn(
        "p-4 border-2 transition-all duration-200",
        isPending ? "bg-amber-50/50 border-amber-200" : "border-[#2C2C2C]/10 hover:border-[#D97757]/30",
        className
      )}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#D4A373]/20 overflow-hidden ring-2 ring-[#D97757]/20">
              {comment.commenter_avatar ? (
                <Image
                  src={comment.commenter_avatar}
                  alt={comment.commenter_name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#D97757] font-bold text-lg">
                  {comment.commenter_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-[#2C2C2C]">
                    {comment.commenter_name}
                  </span>
                  {isPending && (
                    <Badge variant="outline" className="bg-amber-100 border-amber-300 text-amber-800 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Review
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#2C2C2C]/60 mt-1">
                  <span>{timeAgo}</span>
                  {isEdited && <span>• edited</span>}
                </div>
              </div>

              {/* Actions menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-[#D97757]/10"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwnComment ? (
                    <>
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Comment
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Comment
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                      <Flag className="w-4 h-4 mr-2" />
                      Report Comment
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Comment text */}
            <p className="text-sm text-[#2C2C2C] leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  "h-8 px-3 hover:bg-[#D97757]/10",
                  liked && "text-[#D97757]"
                )}
              >
                <Heart className={cn("w-4 h-4 mr-1", liked && "fill-current")} />
                <span className="text-xs font-medium">{likesCount}</span>
              </Button>

              {onReplyClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReplyClick}
                  className="h-8 px-3 hover:bg-[#D97757]/10"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  <span className="text-xs font-medium">Reply</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Report dialog */}
      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        commentId={comment.id}
      />
    </>
  )
}

// Helper to format time ago
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`
  return date.toLocaleDateString()
}
