'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Eye, Play, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Story {
  id: string
  title: string
  excerpt: string
  storyteller: {
    id: string
    display_name: string
    cultural_background?: string
    avatar_url?: string
  }
  featured_image_url?: string
  story_type: 'text' | 'audio' | 'video' | 'mixed'
  reading_time_minutes?: number
  views_count?: number
  cultural_tags?: string[]
  language?: string
  created_at: string
}

interface StoryPreviewCardProps {
  story: Story
  viewMode: 'grid' | 'list'
}

const getStoryTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
    case 'audio':
      return <Play className="w-3 h-3" />
    default:
      return <FileText className="w-3 h-3" />
  }
}

const getStoryTypeColor = (type: string) => {
  switch (type) {
    case 'video':
      return 'bg-[#D97757] text-white'
    case 'audio':
      return 'bg-[#D4A373] text-[#2C2C2C]'
    default:
      return 'bg-[#2D5F4F] text-white'
  }
}

export function StoryPreviewCard({ story, viewMode }: StoryPreviewCardProps) {
  if (viewMode === 'list') {
    return (
      <Link href={`/stories/${story.id}`} className="group">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border-2 hover:border-[#D97757]">
          <div className="flex flex-col sm:flex-row gap-4 p-5">
            {/* Image */}
            <div className="relative w-full sm:w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-[#F8F6F1]">
              {story.featured_image_url ? (
                <Image
                  src={story.featured_image_url}
                  alt={story.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#D97757]/20 via-[#D4A373]/20 to-[#2D5F4F]/20 flex items-center justify-center">
                  <div className="text-4xl opacity-40">🌾</div>
                </div>
              )}

              {/* Story Type Badge */}
              <div className="absolute top-2 right-2">
                <Badge className={cn("text-xs", getStoryTypeColor(story.story_type))}>
                  {getStoryTypeIcon(story.story_type)}
                  <span className="ml-1 capitalize">{story.story_type}</span>
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <h3 className="font-serif text-xl font-bold text-[#2C2C2C] line-clamp-2 group-hover:text-[#D97757] transition-colors">
                {story.title}
              </h3>

              <p className="text-[#2C2C2C]/70 text-sm line-clamp-2 leading-relaxed">
                {story.excerpt}
              </p>

              {/* Cultural Tags */}
              {story.cultural_tags && story.cultural_tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {story.cultural_tags.slice(0, 3).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-[#F8F6F1] text-[#2C2C2C]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Storyteller & Meta */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F8F6F1]">
                <div className="flex items-center gap-2">
                  {story.storyteller.avatar_url ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={story.storyteller.avatar_url}
                        alt={story.storyteller.display_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#D97757]/20 flex items-center justify-center">
                      <span className="text-[#D97757] font-medium text-xs">
                        {story.storyteller.display_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#2C2C2C]">
                      {story.storyteller.display_name}
                    </p>
                    {story.storyteller.cultural_background && (
                      <p className="text-xs text-[#2C2C2C]/60">
                        {story.storyteller.cultural_background}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#2C2C2C]/60">
                  {story.reading_time_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{story.reading_time_minutes} min</span>
                    </div>
                  )}
                  {story.views_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{story.views_count}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  // Grid view (same as FeaturedStoriesGrid cards)
  return (
    <Link href={`/stories/${story.id}`} className="group">
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl border-2 hover:border-[#D97757]">
        {/* Story Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F8F6F1]">
          {story.featured_image_url ? (
            <Image
              src={story.featured_image_url}
              alt={story.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#D97757]/20 via-[#D4A373]/20 to-[#2D5F4F]/20 flex items-center justify-center">
              <div className="text-6xl opacity-40">🌾</div>
            </div>
          )}

          {/* Story Type Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={cn("text-xs", getStoryTypeColor(story.story_type))}>
              {getStoryTypeIcon(story.story_type)}
              <span className="ml-1 capitalize">{story.story_type}</span>
            </Badge>
          </div>

          {/* Cultural Tags */}
          {story.cultural_tags && story.cultural_tags.length > 0 && (
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
              {story.cultural_tags.slice(0, 2).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs bg-white/90 text-[#2C2C2C] backdrop-blur-sm"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Story Content */}
        <div className="p-5 space-y-3">
          <h3 className="font-serif text-xl font-bold text-[#2C2C2C] line-clamp-2 group-hover:text-[#D97757] transition-colors">
            {story.title}
          </h3>

          <p className="text-[#2C2C2C]/70 text-sm line-clamp-3 leading-relaxed">
            {story.excerpt}
          </p>

          {/* Storyteller Info */}
          <div className="flex items-center gap-3 pt-2 border-t border-[#F8F6F1]">
            <div className="flex-shrink-0">
              {story.storyteller.avatar_url ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={story.storyteller.avatar_url}
                    alt={story.storyteller.display_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#D97757]/20 flex items-center justify-center">
                  <span className="text-[#D97757] font-medium text-sm">
                    {story.storyteller.display_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#2C2C2C] truncate">
                {story.storyteller.display_name}
              </p>
              {story.storyteller.cultural_background && (
                <p className="text-xs text-[#2C2C2C]/60 truncate">
                  {story.storyteller.cultural_background}
                </p>
              )}
            </div>
          </div>

          {/* Story Meta */}
          <div className="flex items-center gap-4 text-xs text-[#2C2C2C]/60 pt-2">
            {story.reading_time_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{story.reading_time_minutes} min</span>
              </div>
            )}
            {story.views_count !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{story.views_count}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
