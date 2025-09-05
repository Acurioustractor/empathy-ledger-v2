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
  draft: 'bg-gray-100 text-gray-800',
  review: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600'
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
  
  const getInitials = (name?: string) => {
    if (!name) return 'ST'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <Card className={cn(
      'group transition-all duration-200 hover:shadow-lg border-l-4',
      isFeatured && 'border-l-amber-400 bg-gradient-to-r from-amber-50 to-white',
      !isFeatured && 'border-l-earth-600',
      variant === 'compact' && 'p-3',
      className
    )}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isFeatured && (
                <Badge className="bg-amber-100 text-amber-800 text-xs">
                  Featured
                </Badge>
              )}
              <Badge 
                variant="outline" 
                className={cn('text-xs', storyTypeColors[story.story_type])}
              >
                {story.story_type}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn('text-xs', statusColors[story.status])}
              >
                {story.status}
              </Badge>
            </div>
            
            <Link href={`/stories/${story.id}`}>
              <Typography 
                variant="h3" 
                className="group-hover:text-earth-700 transition-colors cursor-pointer line-clamp-2"
              >
                {story.title}
              </Typography>
            </Link>
          </div>

          {/* Cultural Sensitivity Indicator */}
          <div className="ml-4 flex flex-col items-end gap-2">
            <Badge 
              className={cn('text-xs', culturalColors[story.cultural_sensitivity_level])}
            >
              <Shield className="w-3 h-3 mr-1" />
              {story.cultural_sensitivity_level} sensitivity
            </Badge>
            
            {/* Cultural Approval Indicators */}
            <div className="flex gap-1">
              {hasElderApproval && (
                <div className="flex items-center text-xs text-amber-600">
                  <Crown className="w-3 h-3" />
                </div>
              )}
              {isCulturallyReviewed && (
                <div className="flex items-center text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="mb-4">
          <Typography variant="body" className="text-gray-600 leading-relaxed">
            {truncateContent(story.content)}
          </Typography>
        </div>

        {/* Storyteller/Author Info */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-earth-50 rounded-lg">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={story.storyteller?.profile?.avatar_url || story.author?.avatar_url} 
              alt={story.storyteller?.display_name || story.author?.display_name}
            />
            <AvatarFallback className="bg-earth-200 text-earth-700 text-xs">
              {getInitials(story.storyteller?.display_name || story.author?.display_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Typography variant="small" className="font-medium">
                {story.storyteller?.display_name || `${story.author?.first_name} ${story.author?.last_name}`.trim() || story.author?.display_name}
              </Typography>
              {story.storyteller?.elder_status && (
                <Crown className="w-3 h-3 text-amber-500" />
              )}
            </div>
            {story.storyteller?.cultural_background && (
              <Typography variant="small" className="text-gray-500">
                {story.storyteller.cultural_background}
              </Typography>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          {story.reading_time_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{story.reading_time_minutes} min read</span>
            </div>
          )}
          
          {story.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{story.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{story.audience}</span>
          </div>
        </div>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {story.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {story.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{story.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer - Stats and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{story.views_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{story.likes_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              <span>{story.shares_count || 0}</span>
            </div>
          </div>

          {showActions && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                asChild
              >
                <Link href={`/stories/${story.id}`}>
                  Read Story
                </Link>
              </Button>
              
              {story.storyteller && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs text-earth-600 hover:text-earth-700"
                  asChild
                >
                  <Link href={`/storytellers/${story.storyteller.id}`}>
                    View Storyteller
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}