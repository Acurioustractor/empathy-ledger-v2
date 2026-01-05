'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Clock,
  Edit,
  Eye,
  MoreVertical,
  Trash2,
  Archive,
  Copy,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DraftCardProps {
  draft: {
    id: string
    title: string
    excerpt?: string
    status: 'draft' | 'published' | 'archived' | 'scheduled'
    updated_at: string
    created_at: string
    featured_image_url?: string
    cultural_tags?: string[]
    word_count?: number
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onArchive?: (id: string) => void
  onDuplicate?: (id: string) => void
  className?: string
}

export function DraftCard({
  draft,
  onEdit,
  onDelete,
  onArchive,
  onDuplicate,
  className
}: DraftCardProps) {
  const router = useRouter()

  const handleCardClick = () => {
    if (draft.status === 'published') {
      router.push(`/stories/${draft.id}`)
    } else {
      router.push(`/stories/${draft.id}/edit`)
    }
  }

  const getStatusColor = () => {
    switch (draft.status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-amber-100 text-amber-800 border-amber-200'
    }
  }

  const getStatusLabel = () => {
    switch (draft.status) {
      case 'published': return 'Published'
      case 'scheduled': return 'Scheduled'
      case 'archived': return 'Archived'
      default: return 'Draft'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }

  const readingTime = draft.word_count ? Math.ceil(draft.word_count / 200) : null

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-2 hover:border-[#D97757] hover:shadow-lg transition-all cursor-pointer",
        className
      )}
      onClick={handleCardClick}
    >
      <div className="flex gap-4">
        {/* Featured Image */}
        {draft.featured_image_url ? (
          <div className="relative w-48 h-32 flex-shrink-0 bg-[#F8F6F1]">
            <img
              src={draft.featured_image_url}
              alt={draft.title || 'Story preview'}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="relative w-48 h-32 flex-shrink-0 bg-[#F8F6F1] flex items-center justify-center">
            <FileText className="w-12 h-12 text-[#2C2C2C]/20" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-serif text-xl font-bold text-[#2C2C2C] truncate">
              {draft.title || 'Untitled Story'}
            </h3>
            <Badge className={cn("border", getStatusColor())}>
              {getStatusLabel()}
            </Badge>
          </div>

          {draft.excerpt && (
            <p className="text-sm text-[#2C2C2C]/70 line-clamp-2 mb-3">
              {draft.excerpt}
            </p>
          )}

          {/* Tags */}
          {draft.cultural_tags && draft.cultural_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {draft.cultural_tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {draft.cultural_tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{draft.cultural_tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-[#2C2C2C]/60">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Updated {formatDate(draft.updated_at)}</span>
            </div>
            {readingTime && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{readingTime} min read</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-white shadow-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onEdit?.(draft.id)
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>

              {draft.status === 'published' && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/stories/${draft.id}`)
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Published
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onDuplicate?.(draft.id)
              }}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {draft.status !== 'archived' && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  onArchive?.(draft.id)
                }}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(draft.id)
                }}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  )
}
