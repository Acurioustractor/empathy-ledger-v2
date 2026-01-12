'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Eye, Heart, Play, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Story {
  id: string
  title: string
  excerpt: string
  storyteller: {
    display_name: string
    cultural_background?: string
    avatar_url?: string
  }
  featured_image_url?: string
  story_type: 'text' | 'audio' | 'video' | 'mixed'
  reading_time_minutes?: number
  views_count?: number
  likes_count?: number
  cultural_tags?: string[]
  created_at: string
}

interface FeaturedStoriesGridProps {
  stories: Story[]
  className?: string
}

const getStoryTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Play className="w-4 h-4" />
    case 'audio':
      return <Play className="w-4 h-4" />
    default:
      return <FileText className="w-4 h-4" />
  }
}

const getStoryTypeColor = (type: string) => {
  switch (type) {
    case 'video':
      return 'bg-terracotta text-white'
    case 'audio':
      return 'bg-ochre text-charcoal'
    default:
      return 'bg-sage text-white'
  }
}

export function FeaturedStoriesGrid({ stories, className }: FeaturedStoriesGridProps) {
  if (!stories || stories.length === 0) {
    return null
  }

  return (
    <section className={cn("py-16 md:py-20 bg-white", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge
            variant="outline"
            className="border-terracotta text-terracotta bg-terracotta/5"
          >
            Featured Stories
          </Badge>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal">
            Stories That Inspire
          </h2>
          <p className="text-lg text-charcoal/70 max-w-2xl mx-auto">
            Curated stories from our community, shared with consent and cultural respect
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {stories.slice(0, 6).map((story) => (
            <Link
              key={story.id}
              href={`/stories/${story.id}`}
              className="group"
            >
              <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl border-2 hover:border-terracotta">
                {/* Story Image - falls back to storyteller avatar */}
                <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                  {story.featured_image_url ? (
                    <Image
                      src={story.featured_image_url}
                      alt={story.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : story.storyteller.avatar_url ? (
                    <Image
                      src={story.storyteller.avatar_url}
                      alt={story.storyteller.display_name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-terracotta/20 via-ochre/20 to-sage/20 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-bold text-ochre-700">
                          {story.storyteller.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
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
                          className="text-xs bg-white/90 text-charcoal backdrop-blur-sm"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Story Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-serif text-xl font-bold text-charcoal line-clamp-2 group-hover:text-terracotta transition-colors">
                    {story.title}
                  </h3>

                  <p className="text-charcoal/70 text-sm line-clamp-3 leading-relaxed">
                    {story.excerpt}
                  </p>

                  {/* Storyteller Info */}
                  <div className="flex items-center gap-3 pt-2 border-t border-cream">
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
                        <div className="w-10 h-10 rounded-full bg-terracotta/20 flex items-center justify-center">
                          <span className="text-terracotta font-medium text-sm">
                            {story.storyteller.display_name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate">
                        {story.storyteller.display_name}
                      </p>
                      {story.storyteller.cultural_background && (
                        <p className="text-xs text-charcoal/60 truncate">
                          {story.storyteller.cultural_background}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Story Meta */}
                  <div className="flex items-center gap-4 text-xs text-charcoal/60 pt-2">
                    {story.reading_time_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{story.reading_time_minutes} min read</span>
                      </div>
                    )}
                    {story.views_count !== undefined && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{story.views_count}</span>
                      </div>
                    )}
                    {story.likes_count !== undefined && (
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{story.likes_count}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        {stories.length > 6 && (
          <div className="text-center mt-12">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 text-terracotta hover:text-terracotta/80 font-medium transition-colors"
            >
              View All Stories
              <span className="text-2xl">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
