'use client'

import React, { useState } from 'react'
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
  CheckCircle,
  BookmarkPlus,
  MessageCircle
} from 'lucide-react'

interface StoryCardProps {
  story: Story & {
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
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  high: 'bg-red-100 text-red-800 border-red-200'
}

const storyTypeColors = {
  traditional: 'bg-purple-100 text-purple-800',
  personal: 'bg-blue-100 text-blue-800',
  historical: 'bg-indigo-100 text-indigo-800',
  educational: 'bg-emerald-100 text-emerald-800',
  healing: 'bg-rose-100 text-rose-800'
}

const statusColors = {
  draft: 'bg-grey-100 text-grey-800',
  review: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-grey-100 text-grey-600'
}

export function StoryCard({
  story,
  variant = 'default',
  showActions = true,
  className
}: StoryCardProps) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(story.likes_count || 0)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const isPublished = story.status === 'published'
  const isFeatured = story.featured
  const hasElderApproval = story.elder_approval
  const isCulturallyReviewed = story.cultural_review_status === 'approved'

  const getInitials = (name?: string) => {
    if (!name) return 'ST'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(!liked)
    setLikesCount(prev => liked ? prev - 1 : prev + 1)
    // TODO: Call API to save like
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      // Call the share API to track the share and verify permissions
      const response = await fetch(`/api/stories/${story.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: 'link',
          platform: navigator.share ? 'native_share' : 'copy_link'
        })
      })

      const data = await response.json()

      // Handle cultural sensitivity warning
      if (data.requiresConfirmation) {
        const confirmed = window.confirm(
          `⚠️ Cultural Sensitivity Notice\n\n${data.warning}\n\nDo you want to continue sharing this story?`
        )
        if (!confirmed) return

        // Re-submit with confirmation
        const confirmedResponse = await fetch(`/api/stories/${story.id}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            method: 'link',
            platform: navigator.share ? 'native_share' : 'copy_link',
            confirmed: true
          })
        })
        const confirmedData = await confirmedResponse.json()
        if (!confirmedData.success) {
          alert(confirmedData.error || 'Failed to share story')
          return
        }
      }

      // Handle permission errors
      if (!response.ok) {
        alert(data.error || 'This story cannot be shared at this time.')
        return
      }

      if (!data.success) {
        alert(data.error || 'Failed to share story')
        return
      }

      // Use native share if available
      const shareUrl = data.shareUrl || `${window.location.origin}/stories/${story.id}`
      if (navigator.share) {
        try {
          await navigator.share({
            title: data.shareTitle || story.title,
            text: data.shareText || truncateContent(story.content, 100),
            url: shareUrl
          })
        } catch (error) {
          console.log('Share cancelled')
        }
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl)
        alert(`Link copied! This story has been shared ${data.shareCount} times.`)
      }
    } catch (error) {
      console.error('Share error:', error)
      alert('Failed to share story. Please try again.')
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  // Render different layouts for grid vs list view
  if (variant === 'compact') {
    // List view with left image and content on the right
    return (
      <Card className={cn(
        'group transition-all duration-300 hover:shadow-lg overflow-hidden',
        isFeatured && 'ring-2 ring-amber-200',
        className
      )}>
        <div className="flex">
          {/* Left: Profile Image */}
          <div className="relative w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0">
            {story.author?.profile_image_url ? (
              <img
                src={story.author.profile_image_url}
                alt={story.author?.display_name || story.author?.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
                  <span className="text-lg font-bold text-blue-700">
                    {getInitials(story.author?.display_name || story.author?.full_name)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Content */}
          <div className="flex-1 p-4">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-2">
              {isFeatured && (
                <Badge className="bg-amber-100 text-amber-800 text-xs">
                  ⭐ Featured
                </Badge>
              )}
              <Badge variant="outline" className="text-xs capitalize">
                {story.story_type?.replace('_', ' ')}
              </Badge>
            </div>

            {/* Author */}
            <Typography variant="small" className="font-semibold text-grey-900 mb-1">
              {story.author?.display_name || story.author?.full_name || 'Unknown Author'}
            </Typography>

            {/* Title */}
            <Link href={`/stories/${story.id}`}>
              <Typography 
                variant="h4" 
                className="group-hover:text-blue-700 transition-colours cursor-pointer line-clamp-1 mb-2 text-base font-bold"
              >
                {story.title}
              </Typography>
            </Link>

            {/* Content Preview */}
            <Typography variant="body" className="text-grey-600 line-clamp-2 text-sm mb-3">
              {truncateContent(story.content, 100)}
            </Typography>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-grey-500">
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
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 w-7 p-0"
                    onClick={handleShare}
                  >
                    <Share2 className="w-3 h-3" />
                  </Button>
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
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Default grid view
  return (
    <Card className={cn(
      'group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden',
      isFeatured && 'ring-2 ring-amber-200',
      className
    )}>
      {/* Profile Image Header */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100">
        {story.author?.profile_image_url ? (
          <img
            src={story.author.profile_image_url}
            alt={story.author?.display_name || story.author?.full_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            <div className="w-20 h-20 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-blue-700">
                {getInitials(story.author?.display_name || story.author?.full_name)}
              </span>
            </div>
          </div>
        )}
        
        {/* Overlay for badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isFeatured && (
            <Badge className="bg-amber-500/90 text-white text-xs shadow-lg backdrop-blur-sm">
              ⭐ Featured
            </Badge>
          )}
          <Badge variant="secondary" className="bg-white/90 text-grey-700 text-xs shadow-lg backdrop-blur-sm capitalize">
            {story.story_type?.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="p-6">
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <Typography variant="small" className="font-semibold text-grey-900">
              {story.author?.display_name || story.author?.full_name || 'Unknown Author'}
            </Typography>
            {story.author?.cultural_background && (
              <Typography variant="small" className="text-grey-500 mt-1">
                {story.author.cultural_background}
              </Typography>
            )}
          </div>
        </div>

        {/* Title */}
        <Link href={`/stories/${story.id}`}>
          <Typography 
            variant="h3" 
            className="group-hover:text-blue-700 transition-colours cursor-pointer line-clamp-2 mb-3 text-lg font-bold"
          >
            {story.title}
          </Typography>
        </Link>

        {/* Content Preview */}
        <div className="mb-4">
          <Typography variant="body" className="text-grey-600 leading-relaxed line-clamp-3">
            {truncateContent(story.content, 120)}
          </Typography>
        </div>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {story.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {story.tags.length > 2 && (
              <Badge variant="outline" className="text-xs text-grey-500">
                +{story.tags.length - 2} more
              </Badge>
            )}
          </div>
        )}

        {/* Story Info */}
        <div className="flex items-center gap-4 text-sm text-grey-500 mb-4">
          {story.reading_time_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{story.reading_time_minutes} min read</span>
            </div>
          )}
          {story.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-32">{story.location}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-grey-100">
          {showActions && (
            <>
              <Button
                variant="default"
                size="sm"
                className="flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                asChild
              >
                <Link href={`/stories/${story.id}`}>
                  Read Story
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}