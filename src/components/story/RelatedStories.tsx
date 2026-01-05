'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Story {
  id: string
  title: string
  excerpt: string
  storyteller: {
    display_name: string
    cultural_background?: string
  }
  featured_image_url?: string
  story_type: 'text' | 'audio' | 'video' | 'mixed'
  reading_time_minutes?: number
  views_count?: number
}

interface RelatedStoriesProps {
  stories: Story[]
  className?: string
}

export function RelatedStories({ stories, className }: RelatedStoriesProps) {
  if (!stories || stories.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="font-serif text-3xl font-bold text-[#2C2C2C]">
        Related Stories
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <Link
            key={story.id}
            href={`/stories/${story.id}`}
            className="group"
          >
            <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl border-2 hover:border-[#D97757]">
              {/* Image */}
              <div className="relative aspect-video overflow-hidden bg-[#F8F6F1]">
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
              </div>

              {/* Content */}
              <div className="p-4 space-y-2">
                <h3 className="font-serif text-lg font-bold text-[#2C2C2C] line-clamp-2 group-hover:text-[#D97757] transition-colors">
                  {story.title}
                </h3>

                <p className="text-sm text-[#2C2C2C]/70 line-clamp-2 leading-relaxed">
                  {story.excerpt}
                </p>

                {/* Storyteller */}
                <div className="pt-2 border-t border-[#F8F6F1]">
                  <p className="text-sm font-medium text-[#2C2C2C]">
                    {story.storyteller.display_name}
                  </p>
                  {story.storyteller.cultural_background && (
                    <p className="text-xs text-[#2C2C2C]/60">
                      {story.storyteller.cultural_background}
                    </p>
                  )}
                </div>

                {/* Meta */}
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
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
