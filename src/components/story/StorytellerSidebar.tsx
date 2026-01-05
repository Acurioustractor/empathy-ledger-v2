'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Crown, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StorytellerSidebarProps {
  storyteller: {
    id: string
    display_name: string
    cultural_background?: string
    cultural_affiliations?: string[]
    bio?: string
    avatar_url?: string
    story_count: number
    elder_status?: boolean
  }
  className?: string
}

export function StorytellerSidebar({ storyteller, className }: StorytellerSidebarProps) {
  return (
    <Card className={cn("p-6 bg-white border-2 border-[#2C2C2C]/10 sticky top-24", className)}>
      <div className="space-y-5">
        {/* Header */}
        <div className="text-center">
          {/* Avatar */}
          <Link
            href={`/storytellers/${storyteller.id}/public`}
            className="inline-block group"
          >
            <div className="relative">
              {storyteller.avatar_url ? (
                <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-[#D97757]/20 group-hover:ring-[#D97757]/40 transition-all">
                  <Image
                    src={storyteller.avatar_url}
                    alt={storyteller.display_name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 mx-auto rounded-full bg-[#D97757]/20 flex items-center justify-center ring-4 ring-[#D97757]/20 group-hover:ring-[#D97757]/40 transition-all">
                  <span className="text-3xl font-bold text-[#D97757]">
                    {storyteller.display_name.charAt(0)}
                  </span>
                </div>
              )}

              {/* Elder Badge */}
              {storyteller.elder_status && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-[#D4A373] text-[#2C2C2C] shadow-lg">
                    <Crown className="w-3 h-3 mr-1" />
                    Elder
                  </Badge>
                </div>
              )}
            </div>
          </Link>

          {/* Name */}
          <Link
            href={`/storytellers/${storyteller.id}/public`}
            className="block mt-4 group"
          >
            <h3 className="font-serif text-xl font-bold text-[#2C2C2C] group-hover:text-[#D97757] transition-colors">
              {storyteller.display_name}
            </h3>
          </Link>

          {/* Cultural Background */}
          {storyteller.cultural_background && (
            <p className="text-sm text-[#2D5F4F] font-medium mt-1">
              {storyteller.cultural_background}
            </p>
          )}
        </div>

        {/* Cultural Affiliations */}
        {storyteller.cultural_affiliations && storyteller.cultural_affiliations.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {storyteller.cultural_affiliations.map((affiliation, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-[#F8F6F1] text-[#2C2C2C]"
              >
                {affiliation}
              </Badge>
            ))}
          </div>
        )}

        {/* Bio */}
        {storyteller.bio && (
          <div className="pt-4 border-t border-[#2C2C2C]/10">
            <p className="text-sm text-[#2C2C2C]/70 leading-relaxed line-clamp-4">
              {storyteller.bio}
            </p>
          </div>
        )}

        {/* Story Count */}
        <div className="pt-4 border-t border-[#2C2C2C]/10">
          <div className="flex items-center justify-center gap-2 text-[#2C2C2C]/70">
            <BookOpen className="w-4 h-4 text-[#D97757]" />
            <span className="text-sm">
              <span className="font-bold text-[#2C2C2C]">{storyteller.story_count}</span>
              {' '}{storyteller.story_count === 1 ? 'Story' : 'Stories'} Shared
            </span>
          </div>
        </div>

        {/* View Profile Button */}
        <Button
          asChild
          className="w-full bg-[#D97757] hover:bg-[#D97757]/90 text-white"
        >
          <Link href={`/storytellers/${storyteller.id}/public`} className="group">
            View Full Profile
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </Card>
  )
}
