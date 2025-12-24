'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { Story } from '@/types/database'
import { cn } from '@/lib/utils'
import {
  Clock,
  Eye,
  Heart,
  Share2,
  User,
  MapPin,
  Shield,
  Crown,
  CheckCircle
} from 'lucide-react'
import TrustBadges from './trust-badges'
import type { PermissionTier } from '@/types/database/permission-tiers'

interface StoryCardProps {
  story: Story & {
    permission_tier?: PermissionTier
    consent_verified_at?: string | null
    elder_reviewed?: boolean
    elder_reviewed_at?: string | null
    storyteller?: {
      id: string
      display_name: string
      bio?: string
      cultural_background?: string
      elder_status: boolean
      profile?: {
        avatar_url?: string
        cultural_affiliations?: string[]
      }
    }
    author?: {
      id: string
      display_name: string
      first_name?: string
      last_name?: string
      avatar_url?: string
    }
  }
  variant?: 'default' | 'featured' | 'compact'
  showActions?: boolean
  className?: string
}

const culturalColors = {
  low: 'bg-sage-100 text-sage-800 border-sage-200 dark:bg-sage-900/30 dark:text-sage-300 dark:border-sage-700',
  medium: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  high: 'bg-terracotta-100 text-terracotta-800 border-terracotta-200 dark:bg-terracotta-900/30 dark:text-terracotta-300 dark:border-terracotta-700'
}

const storyTypeColors = {
  traditional: 'bg-clay-100 text-clay-800 dark:bg-clay-900/30 dark:text-clay-300',
  personal: 'bg-earth-100 text-earth-800 dark:bg-earth-900/30 dark:text-earth-300',
  historical: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300',
  educational: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  healing: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
}

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  archived: 'bg-muted text-muted-foreground'
}

export function StoryCard({
  story,
  variant = 'default',
  showActions = true,
  className
}: StoryCardProps) {
  const isPublished = story.status === 'published'
  const isFeatured = story.featured
  const hasElderApproval = story.elder_approval
  const isCulturallyReviewed = story.cultural_review_status === 'approved'

  // Use storyteller data if author is not available (API returns storyteller)
  const author = story.author || (story.storyteller ? {
    id: story.storyteller.id,
    display_name: story.storyteller.display_name,
    full_name: story.storyteller.display_name,
    profile_image_url: (story.storyteller as Record<string, unknown>).profile_image_url as string | undefined,
    cultural_background: story.storyteller.cultural_background
  } : undefined)

  const getInitials = (name?: string) => {
    if (!name) return 'ST'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  // Build accessible description
  const ariaLabel = `Story: ${story.title}${isFeatured ? ', Featured' : ''}${hasElderApproval ? ', Elder Approved' : ''} by ${author?.display_name || author?.full_name || 'Unknown'}${story.story_type ? `, ${story.story_type.replace('_', ' ')} story` : ''}`

  // Render different layouts for grid vs list view
  if (variant === 'compact') {
    // List view with left image and content on the right
    return (
      <Card
        className={cn(
          'group transition-all duration-300 hover:shadow-lg overflow-hidden bg-card border-border',
          isFeatured && 'ring-2 ring-amber-200 dark:ring-amber-700',
          className
        )}
        role="article"
        aria-label={ariaLabel}
      >
        <div className="flex">
          {/* Left: Profile Image */}
          <div
            className="relative w-32 h-32 bg-gradient-to-br from-sage-50 to-terracotta-100 dark:from-sage-900/30 dark:to-terracotta-900/30 flex-shrink-0"
            role="img"
            aria-label={`Author photo: ${author?.display_name || author?.full_name || 'Unknown author'}`}
          >
            {author?.profile_image_url ? (
              <img
                src={author.profile_image_url}
                alt={`Portrait of ${author?.display_name || author?.full_name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-earth-100 to-sage-100 dark:from-earth-900/50 dark:to-sage-900/50">
                <div className="w-12 h-12 rounded-full bg-white/80 dark:bg-background/80 flex items-center justify-center shadow-lg">
                  <span className="text-lg font-bold text-earth-700 dark:text-earth-300">
                    {getInitials(author?.display_name || author?.full_name)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Content */}
          <div className="flex-1 p-4">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-2" role="list" aria-label="Story attributes">
              {isFeatured && (
                <Badge
                  className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs touch-target"
                  role="listitem"
                  aria-label="Featured story"
                >
                  Featured
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-xs capitalize touch-target"
                role="listitem"
                aria-label={`Story type: ${story.story_type?.replace('_', ' ')}`}
              >
                {story.story_type?.replace('_', ' ')}
              </Badge>
            </div>

            {/* Author */}
            <Typography variant="small" className="font-semibold text-foreground mb-1">
              {author?.display_name || author?.full_name || 'Unknown Author'}
            </Typography>

            {/* Title */}
            <Link href={`/stories/${story.id}`}>
              <Typography
                variant="h4"
                className="group-hover:text-primary transition-colours cursor-pointer line-clamp-1 mb-2 text-base font-bold"
              >
                {story.title}
              </Typography>
            </Link>

            {/* Content Preview */}
            <Typography variant="body" className="text-muted-foreground line-clamp-2 text-sm mb-3">
              {truncateContent(story.content, 100)}
            </Typography>

            {/* Trust Badges */}
            {story.permission_tier && (
              <div className="mb-3">
                <TrustBadges
                  permissionTier={story.permission_tier}
                  elderReviewed={story.elder_reviewed}
                  elderReviewedAt={story.elder_reviewed_at}
                  consentVerifiedAt={story.consent_verified_at}
                  status={story.status}
                  variant="compact"
                />
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {story.reading_time_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{story.reading_time_minutes} min</span>
                  </div>
                )}
                {story.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-16">{story.location}</span>
                  </div>
                )}
              </div>

              {showActions && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs h-7"
                  asChild
                >
                  <Link href={`/stories/${story.id}`}>
                    Read
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Default grid view
  return (
    <Card
      className={cn(
        'group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden bg-card border-border',
        isFeatured && 'ring-2 ring-amber-200 dark:ring-amber-700',
        className
      )}
      role="article"
      aria-label={ariaLabel}
    >
      {/* Profile Image Header */}
      <div className="relative h-48 bg-gradient-to-br from-sage-50 to-terracotta-100 dark:from-sage-900/30 dark:to-terracotta-900/30">
        {author?.profile_image_url ? (
          <img
            src={author.profile_image_url}
            alt={author?.display_name || author?.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-earth-100 to-sage-100 dark:from-earth-900/50 dark:to-sage-900/50">
            <div className="w-20 h-20 rounded-full bg-white/80 dark:bg-background/80 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-earth-700 dark:text-earth-300">
                {getInitials(author?.display_name || author?.full_name)}
              </span>
            </div>
          </div>
        )}

        {/* Overlay for badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isFeatured && (
            <Badge className="bg-amber-500/90 text-white text-xs shadow-lg backdrop-blur-sm touch-target">
              Featured
            </Badge>
          )}
          <Badge variant="secondary" className="bg-background/90 text-foreground text-xs shadow-lg backdrop-blur-sm capitalize touch-target">
            {story.story_type?.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="p-6">
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <Typography variant="small" className="font-semibold text-foreground">
              {author?.display_name || author?.full_name || 'Unknown Author'}
            </Typography>
            {author?.cultural_background && (
              <Typography variant="small" className="text-muted-foreground mt-1">
                {author.cultural_background}
              </Typography>
            )}
          </div>
        </div>

        {/* Title */}
        <Link href={`/stories/${story.id}`}>
          <Typography
            variant="h3"
            className="group-hover:text-primary transition-colours cursor-pointer line-clamp-2 mb-3 text-lg font-bold"
          >
            {story.title}
          </Typography>
        </Link>

        {/* Content Preview */}
        <div className="mb-4">
          <Typography variant="body" className="text-muted-foreground leading-relaxed line-clamp-3">
            {truncateContent(story.content, 120)}
          </Typography>
        </div>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {story.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-earth-50 text-earth-700 border-earth-200 dark:bg-earth-900/30 dark:text-earth-300 dark:border-earth-700 touch-target">
                {tag}
              </Badge>
            ))}
            {story.tags.length > 2 && (
              <Badge variant="outline" className="text-xs text-muted-foreground touch-target">
                +{story.tags.length - 2} more
              </Badge>
            )}
          </div>
        )}

        {/* Trust Badges */}
        {story.permission_tier && (
          <div className="mb-4">
            <TrustBadges
              permissionTier={story.permission_tier}
              elderReviewed={story.elder_reviewed}
              elderReviewedAt={story.elder_reviewed_at}
              consentVerifiedAt={story.consent_verified_at}
              status={story.status}
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {story.reading_time_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{story.reading_time_minutes} min</span>
              </div>
            )}
            {story.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-20">{story.location}</span>
              </div>
            )}
          </div>

          {showActions && (
            <Button
              variant="default"
              size="sm"
              className="text-xs"
              asChild
            >
              <Link href={`/stories/${story.id}`}>
                Read Story
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}