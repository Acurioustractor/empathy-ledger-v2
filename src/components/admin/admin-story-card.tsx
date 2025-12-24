'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  Crown,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Share2,
  Clock,
  BookOpen,
  User,
  Shield,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react'

interface AdminStoryCardProps {
  story: {
    id: string
    title: string
    content: string
    excerpt?: string
    created_at: string
    updated_at: string
    status: 'published' | 'draft' | 'under_review' | 'flagged' | 'archived'
    visibility: 'public' | 'community' | 'organisation' | 'private'
    cultural_sensitivity_level: 'low' | 'medium' | 'high'
    story_type?: string
    themes?: string[]
    tags?: string[]
    location?: string
    reading_time_minutes?: number
    storyteller_id?: string
    author_id?: string
    featured?: boolean
    elder_approval?: boolean
    // Storyteller info
    storyteller?: {
      id: string
      display_name: string
      bio?: string
      cultural_background?: string
      elder_status?: boolean
      avatar_url?: string
      story_count?: number
    }
  }
  shareToActFarm?: boolean
  onShareToggle?: (storyId: string, share: boolean) => Promise<void>
  onView?: (storyId: string) => void
  onEdit?: (storyId: string) => void
  variant?: 'grid' | 'list'
  className?: string
}

const statusColors = {
  published: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
  draft: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300',
  under_review: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  flagged: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  archived: 'bg-muted text-muted-foreground'
}

const culturalSensitivityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
}

export function AdminStoryCard({
  story,
  shareToActFarm = false,
  onShareToggle,
  onView,
  onEdit,
  variant = 'grid',
  className
}: AdminStoryCardProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [shareEnabled, setShareEnabled] = useState(shareToActFarm)
  const [shareError, setShareError] = useState<string | null>(null)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trimEnd() + '...'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleShareToggle = async (checked: boolean) => {
    if (!onShareToggle) return

    setIsSharing(true)
    setShareError(null)

    try {
      await onShareToggle(story.id, checked)
      setShareEnabled(checked)
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Failed to update sharing')
      setShareEnabled(!checked)
    } finally {
      setIsSharing(false)
    }
  }

  // LIST VIEW - Horizontal layout
  if (variant === 'list') {
    return (
      <Card className={cn(
        'group transition-all duration-200 hover:shadow-md bg-card border-border',
        className
      )}>
        <div className="flex items-center gap-6 p-4">
          {/* Storyteller Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="w-16 h-16 border-2 border-background shadow-md">
              <AvatarImage
                src={story.storyteller?.avatar_url}
                alt={story.storyteller?.display_name}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300 font-semibold">
                {story.storyteller?.display_name ? getInitials(story.storyteller.display_name) : 'ST'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Story Info */}
          <div className="flex-1 min-w-0">
            {/* Top row: Title and badges */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                  {story.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-medium">{story.storyteller?.display_name || 'Unknown'}</span>
                  {story.storyteller?.elder_status && (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300">
                      <Crown className="w-3 h-3 mr-1" />
                      Elder
                    </Badge>
                  )}
                </div>
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs", statusColors[story.status])}>
                  {story.status.replace('_', ' ')}
                </Badge>
                {story.featured && (
                  <Badge className="bg-amber-500 text-white text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>

            {/* Middle row: Content preview and metadata */}
            <div className="flex items-center gap-6 mb-3">
              <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                {truncate(story.excerpt || story.content, 180)}
              </p>
            </div>

            {/* Bottom row: Metadata and actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(story.created_at)}</span>
                </div>
                {story.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{story.location}</span>
                  </div>
                )}
                {story.reading_time_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{story.reading_time_minutes} min</span>
                  </div>
                )}
                {story.storyteller?.cultural_background && (
                  <Badge variant="outline" className="text-xs">
                    {story.storyteller.cultural_background}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {/* ACT Farm Share Toggle */}
                {onShareToggle && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
                    <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">ACT Farm</span>
                    <Switch
                      checked={shareEnabled}
                      onCheckedChange={handleShareToggle}
                      disabled={isSharing}
                      className="scale-75"
                    />
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView?.(story.id)}
                  className="h-8"
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(story.id)}
                  className="h-8"
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Share error */}
            {shareError && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {shareError}
              </p>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // GRID VIEW - Vertical card layout
  return (
    <Card className={cn(
      'group transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-card border-border overflow-hidden',
      story.featured && 'ring-2 ring-amber-200 dark:ring-amber-700',
      className
    )}>
      {/* Header with storyteller */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
              <AvatarImage
                src={story.storyteller?.avatar_url}
                alt={story.storyteller?.display_name}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300 font-semibold text-sm">
                {story.storyteller?.display_name ? getInitials(story.storyteller.display_name) : 'ST'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-foreground truncate">
                  {story.storyteller?.display_name || 'Unknown'}
                </p>
                {story.storyteller?.elder_status && (
                  <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              {story.storyteller?.cultural_background && (
                <p className="text-xs text-muted-foreground truncate">
                  {story.storyteller.cultural_background}
                </p>
              )}
            </div>
          </div>

          {/* Status badge */}
          <Badge variant="outline" className={cn("text-xs whitespace-nowrap", statusColors[story.status])}>
            {story.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Title */}
        <div>
          <h3 className="font-bold text-lg text-foreground line-clamp-2 mb-2 leading-tight group-hover:text-primary transition-colors">
            {story.title}
          </h3>

          {/* Featured badge */}
          {story.featured && (
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs mb-2">
              <Sparkles className="w-3 h-3 mr-1" />
              Featured Story
            </Badge>
          )}
        </div>

        {/* Content preview */}
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {truncate(story.excerpt || story.content, 150)}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(story.created_at)}</span>
          </div>
          {story.reading_time_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{story.reading_time_minutes} min</span>
            </div>
          )}
          {story.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-24">{story.location}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {story.themes && story.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {story.themes.slice(0, 3).map((theme, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {theme}
              </Badge>
            ))}
            {story.themes.length > 3 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{story.themes.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* ACT Farm Sharing */}
        {onShareToggle && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Share to ACT Farm</p>
                  <p className="text-xs text-muted-foreground">
                    Public registry feed
                  </p>
                </div>
              </div>
              <Switch
                checked={shareEnabled}
                onCheckedChange={handleShareToggle}
                disabled={isSharing}
              />
            </div>
            {shareEnabled && !shareError && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Shared to registry
              </p>
            )}
            {shareError && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {shareError}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onView?.(story.id)}
            className="flex-1"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(story.id)}
            className="flex-1"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
