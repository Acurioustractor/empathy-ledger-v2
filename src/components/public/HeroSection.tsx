'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeaturedStory {
  id: string
  title: string
  excerpt: string
  storyteller: {
    display_name: string
    cultural_background?: string
  }
  featured_image_url?: string
  story_type: 'text' | 'audio' | 'video' | 'mixed'
  cultural_territory?: string
}

interface HeroSectionProps {
  featuredStory?: FeaturedStory
  className?: string
}

export function HeroSection({ featuredStory, className }: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-[#F8F6F1] via-cream-50 to-[#D4A373]/10",
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #2D5F4F 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-6 lg:space-y-8">
            {featuredStory?.cultural_territory && (
              <Badge
                variant="outline"
                className="w-fit border-[#2D5F4F] text-[#2D5F4F] bg-[#2D5F4F]/5"
              >
                {featuredStory.cultural_territory}
              </Badge>
            )}

            <div className="space-y-4">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#2C2C2C]">
                {featuredStory ? (
                  <>
                    Featured Story:{' '}
                    <span className="text-[#D97757]">
                      {featuredStory.title}
                    </span>
                  </>
                ) : (
                  <>
                    Stories That{' '}
                    <span className="text-[#D97757]">
                      Connect Us All
                    </span>
                  </>
                )}
              </h1>

              <p className="text-lg md:text-xl text-[#2C2C2C]/70 max-w-xl leading-relaxed">
                {featuredStory?.excerpt ||
                  'Discover powerful stories from Indigenous communities, shared with respect, consent, and cultural protocols.'}
              </p>

              {featuredStory?.storyteller && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#2C2C2C]">
                      {featuredStory.storyteller.display_name}
                    </span>
                    {featuredStory.storyteller.cultural_background && (
                      <span className="text-sm text-[#2C2C2C]/60">
                        {featuredStory.storyteller.cultural_background}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {featuredStory ? (
                <>
                  <Button
                    size="lg"
                    asChild
                    className="bg-[#D97757] hover:bg-[#D97757]/90 text-white"
                  >
                    <Link href={`/stories/${featuredStory.id}`} className="group">
                      {featuredStory.story_type === 'video' || featuredStory.story_type === 'audio' ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Listen to This Story
                        </>
                      ) : (
                        <>
                          Read This Story
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="border-[#2D5F4F] text-[#2D5F4F] hover:bg-[#2D5F4F]/5"
                  >
                    <Link href="/stories">
                      Explore All Stories
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    asChild
                    className="bg-[#D97757] hover:bg-[#D97757]/90 text-white"
                  >
                    <Link href="/stories" className="group">
                      Explore Stories
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="border-[#2D5F4F] text-[#2D5F4F] hover:bg-[#2D5F4F]/5"
                  >
                    <Link href="/about">
                      Learn More
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              {featuredStory?.featured_image_url ? (
                <div className="aspect-[4/3] relative">
                  <Image
                    src={featuredStory.featured_image_url}
                    alt={featuredStory.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  {(featuredStory.story_type === 'video' || featuredStory.story_type === 'audio') && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="w-8 h-8 text-[#D97757] ml-1" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[4/3] bg-gradient-to-br from-[#D97757]/20 via-[#D4A373]/20 to-[#2D5F4F]/20 flex items-center justify-center">
                  <div className="text-center space-y-2 p-8">
                    <div className="text-6xl mb-4">🌾</div>
                    <p className="text-lg font-medium text-[#2C2C2C]/60">
                      Stories of Connection
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#D4A373] rounded-full blur-3xl opacity-20" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#2D5F4F] rounded-full blur-3xl opacity-20" />
          </div>
        </div>
      </div>
    </section>
  )
}
