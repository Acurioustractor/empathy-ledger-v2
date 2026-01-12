'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Clock, Eye, Play, FileText } from 'lucide-react'
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
  created_at: string
}

interface RecentStoriesCarouselProps {
  stories: Story[]
  autoRotate?: boolean
  rotationInterval?: number
  className?: string
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

export function RecentStoriesCarousel({
  stories,
  autoRotate = true,
  rotationInterval = 5000,
  className
}: RecentStoriesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, stories.length - 2))
  }, [stories.length])

  const previousSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, stories.length - 3) : prev - 1
    )
  }, [stories.length])

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate || isHovered || stories.length <= 3) return

    const interval = setInterval(() => {
      nextSlide()
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [autoRotate, isHovered, rotationInterval, nextSlide, stories.length])

  if (!stories || stories.length === 0) {
    return null
  }

  const visibleStories = stories.slice(currentIndex, currentIndex + 3)

  return (
    <section className={cn("py-16 md:py-20 bg-white", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div className="space-y-2">
            <Badge
              variant="outline"
              className="border-[#D4A373] text-[#D4A373] bg-[#D4A373]/5"
            >
              Recently Shared
            </Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2C2C2C]">
              Latest Stories
            </h2>
          </div>

          {/* Navigation */}
          {stories.length > 3 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={previousSlide}
                disabled={currentIndex === 0}
                className="border-[#2D5F4F] text-[#2D5F4F] hover:bg-[#2D5F4F]/5"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                disabled={currentIndex >= stories.length - 3}
                className="border-[#2D5F4F] text-[#2D5F4F] hover:bg-[#2D5F4F]/5"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleStories.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="group"
              >
                <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl border-2 hover:border-[#D97757]">
                  {/* Story Image - falls back to storyteller avatar */}
                  <div className="relative aspect-video overflow-hidden bg-[#F8F6F1]">
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
                      <div className="w-full h-full bg-gradient-to-br from-[#D97757]/20 via-[#D4A373]/20 to-[#2D5F4F]/20 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
                          <span className="text-xl font-bold text-[#D4A373]">
                            {story.storyteller.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
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

                  {/* Story Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-serif text-lg font-bold text-[#2C2C2C] line-clamp-2 group-hover:text-[#D97757] transition-colors">
                      {story.title}
                    </h3>

                    <p className="text-[#2C2C2C]/70 text-sm line-clamp-2 leading-relaxed">
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

          {/* Pagination Dots */}
          {stories.length > 3 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({
                length: Math.ceil(stories.length / 3)
              }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * 3)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    Math.floor(currentIndex / 3) === index
                      ? "bg-[#D97757] w-8"
                      : "bg-[#D97757]/30 hover:bg-[#D97757]/50"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-[#D97757] hover:text-[#D97757]/80 font-medium transition-colors"
          >
            View All Recent Stories
            <span className="text-2xl">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
