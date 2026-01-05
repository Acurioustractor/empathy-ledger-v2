'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Crown, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Storyteller {
  id: string
  display_name: string
  cultural_background?: string
  cultural_affiliations?: string[]
  bio?: string
  avatar_url?: string
  location?: string
  story_count: number
  elder_status?: boolean
  featured?: boolean
}

interface StorytellerSpotlightProps {
  storytellers: Storyteller[]
  className?: string
}

export function StorytellerSpotlight({ storytellers, className }: StorytellerSpotlightProps) {
  if (!storytellers || storytellers.length === 0) {
    return null
  }

  return (
    <section className={cn("py-16 md:py-20 bg-[#F8F6F1]", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge
            variant="outline"
            className="border-[#2D5F4F] text-[#2D5F4F] bg-[#2D5F4F]/5"
          >
            Featured Storytellers
          </Badge>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2C2C2C]">
            Meet Our Storytellers
          </h2>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
            Voices from diverse communities sharing their knowledge and experiences
          </p>
        </div>

        {/* Storytellers Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {storytellers.slice(0, 4).map((storyteller) => (
            <Link
              key={storyteller.id}
              href={`/storytellers/${storyteller.id}/public`}
              className="group"
            >
              <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl border-2 hover:border-[#D97757] bg-white">
                {/* Avatar */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#D97757]/20 via-[#D4A373]/20 to-[#2D5F4F]/20">
                  {storyteller.avatar_url ? (
                    <Image
                      src={storyteller.avatar_url}
                      alt={storyteller.display_name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-white/80 flex items-center justify-center">
                        <span className="text-4xl font-bold text-[#D97757]">
                          {storyteller.display_name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Elder Badge */}
                  {storyteller.elder_status && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-[#D4A373] text-[#2C2C2C] shadow-lg">
                        <Crown className="w-3 h-3 mr-1" />
                        Elder
                      </Badge>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {storyteller.featured && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 text-[#D97757] shadow-lg">
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  {/* Name */}
                  <h3 className="font-serif text-xl font-bold text-[#2C2C2C] group-hover:text-[#D97757] transition-colors">
                    {storyteller.display_name}
                  </h3>

                  {/* Cultural Background */}
                  {storyteller.cultural_background && (
                    <p className="text-sm font-medium text-[#2D5F4F]">
                      {storyteller.cultural_background}
                    </p>
                  )}

                  {/* Cultural Affiliations */}
                  {storyteller.cultural_affiliations && storyteller.cultural_affiliations.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {storyteller.cultural_affiliations.slice(0, 2).map((affiliation, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs bg-[#F8F6F1] text-[#2C2C2C]"
                        >
                          {affiliation}
                        </Badge>
                      ))}
                      {storyteller.cultural_affiliations.length > 2 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-[#F8F6F1] text-[#2C2C2C]/60"
                        >
                          +{storyteller.cultural_affiliations.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Bio */}
                  {storyteller.bio && (
                    <p className="text-sm text-[#2C2C2C]/70 line-clamp-2 leading-relaxed">
                      {storyteller.bio}
                    </p>
                  )}

                  {/* Location */}
                  {storyteller.location && (
                    <div className="flex items-center gap-1 text-xs text-[#2C2C2C]/60">
                      <MapPin className="w-3 h-3" />
                      <span>{storyteller.location}</span>
                    </div>
                  )}

                  {/* Story Count */}
                  <div className="pt-3 border-t border-[#F8F6F1]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-[#D97757]" />
                        <span className="font-medium text-[#2C2C2C]">
                          {storyteller.story_count} {storyteller.story_count === 1 ? 'Story' : 'Stories'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#D97757] hover:text-[#D97757]/80 hover:bg-[#D97757]/5 -mr-2"
                      >
                        View Profile →
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        {storytellers.length > 4 && (
          <div className="text-center mt-12">
            <Link
              href="/storytellers"
              className="inline-flex items-center gap-2 text-[#D97757] hover:text-[#D97757]/80 font-medium transition-colors"
            >
              Meet All Storytellers
              <span className="text-2xl">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
