'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, MapPin, Play, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryHeaderProps {
  title: string
  storyteller: {
    id: string
    display_name: string
    cultural_background?: string
    avatar_url?: string
  }
  publishedDate: string
  readingTime?: number
  culturalTags?: string[]
  location?: string
  storyType: 'text' | 'audio' | 'video' | 'mixed'
  className?: string
}

const getStoryTypeIcon = (type: string) => {
  switch (type) {
    case 'video':
    case 'audio':
      return <Play className="w-4 h-4" />
    default:
      return <FileText className="w-4 h-4" />
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

export function StoryHeader({
  title,
  storyteller,
  publishedDate,
  readingTime,
  culturalTags,
  location,
  storyType,
  className
}: StoryHeaderProps) {
  return (
    <header className={cn("space-y-6", className)}>
      {/* Title */}
      <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#2C2C2C] leading-tight">
        {title}
      </h1>

      {/* Storyteller Info */}
      <div className="flex items-center gap-4">
        <Link
          href={`/storytellers/${storyteller.id}/public`}
          className="group flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          {storyteller.avatar_url ? (
            <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#D97757]/20">
              <Image
                src={storyteller.avatar_url}
                alt={storyteller.display_name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#D97757]/20 flex items-center justify-center ring-2 ring-[#D97757]/20">
              <span className="text-[#D97757] font-semibold text-lg">
                {storyteller.display_name.charAt(0)}
              </span>
            </div>
          )}

          <div>
            <p className="font-medium text-[#2C2C2C] group-hover:text-[#D97757] transition-colors">
              {storyteller.display_name}
            </p>
            {storyteller.cultural_background && (
              <p className="text-sm text-[#2C2C2C]/60">
                {storyteller.cultural_background}
              </p>
            )}
          </div>
        </Link>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-[#2C2C2C]/70">
        {/* Story Type */}
        <Badge className={cn("text-xs", getStoryTypeColor(storyType))}>
          {getStoryTypeIcon(storyType)}
          <span className="ml-1 capitalize">{storyType}</span>
        </Badge>

        {/* Published Date */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>{new Date(publishedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>

        {/* Reading Time */}
        {readingTime && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{readingTime} min read</span>
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        )}
      </div>

      {/* Cultural Tags */}
      {culturalTags && culturalTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {culturalTags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-[#F8F6F1] text-[#2C2C2C] hover:bg-[#D97757]/10 transition-colors"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </header>
  )
}
