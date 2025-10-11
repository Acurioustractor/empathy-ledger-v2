'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import {
  Crown,
  MapPin,
  Star,
  Heart,
  ArrowRight,
  BookOpen,
  Users,
  Sparkles,
  Globe2,
  Languages,
  Landmark,
  Shield
} from 'lucide-react'

interface StorytellerCardProps {
  storyteller: {
    id: string
    display_name: string
    bio: string | null
    cultural_background: string | null
    specialties: string[] | null
    years_of_experience: number | null
    preferred_topics: string[] | null
    story_count: number
    featured: boolean
    status: 'active' | 'inactive' | 'pending'
    elder_status: boolean
    storytelling_style: string[] | null
    location?: string | null
    traditional_territory?: string | null
    geographic_scope?: 'local' | 'regional' | 'national' | 'international'
    occupation?: string | null
    languages?: string[] | null
    traditional_knowledge_keeper?: boolean
    community_recognition?: any | null
    organisations?: Array<{
      id: string
      name: string
      role: string
    }>
    projects?: Array<{
      id: string
      name: string
      role: string
    }>
    profile?: {
      avatar_url?: string
      cultural_affiliations?: string[]
      pronouns?: string
      display_name?: string
      bio?: string
      languages_spoken?: string[]
    }
  }
  variant?: 'default' | 'featured' | 'compact'
  showStories?: boolean
  showActions?: boolean
  className?: string
}

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-grey-100 text-grey-600 border-grey-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
}

const specialtyColors = [
  'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800',
  'bg-green-100 text-green-800',
  'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800'
]

export function StorytellerCard({
  storyteller,
  variant = 'default',
  showStories = true,
  showActions = true,
  className
}: StorytellerCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isFeatured = storyteller.featured
  const isElder = storyteller.elder_status
  const isActive = storyteller.status === 'active'

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const truncateBio = (bio: string, maxLength: number = 120) => {
    if (bio.length <= maxLength) return bio
    return bio.substring(0, maxLength) + '...'
  }

  const getExperienceLabel = (years: number | null) => {
    if (!years) return null
    if (years < 2) return 'New Storyteller'
    if (years < 5) return 'Emerging Voice'
    if (years < 10) return 'Experienced Storyteller'
    if (years < 20) return 'Veteran Storyteller'
    return 'Master Storyteller'
  }

  const getExperienceColor = (years: number | null) => {
    if (!years || years < 2) return 'from-blue-400 to-blue-600'
    if (years < 5) return 'from-green-400 to-green-600'
    if (years < 10) return 'from-purple-400 to-purple-600'
    if (years < 20) return 'from-orange-400 to-orange-600'
    return 'from-amber-400 to-amber-600'
  }

  // Build accessible description
  const ariaLabel = `${storyteller.display_name}${isElder ? ', Elder' : ''}${isFeatured ? ', Featured Storyteller' : ''}, ${storyteller.story_count} ${storyteller.story_count === 1 ? 'story' : 'stories'}${storyteller.location ? `, from ${storyteller.location}` : ''}${storyteller.cultural_background ? `, ${storyteller.cultural_background}` : ''}`

  return (
    <Link
      href={`/storytellers/${storyteller.id}`}
      aria-label={ariaLabel}
    >
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="article"
        aria-label={`Storyteller profile card for ${storyteller.display_name}`}
        tabIndex={0}
        className={cn(
          'group cursor-pointer transition-all duration-500 overflow-hidden',
          'bg-white border border-grey-100 shadow-md rounded-2xl relative',
          'hover:shadow-xl hover:-translate-y-1',
          'focus:outline-none focus:ring-2 focus:ring-earth-500 focus:ring-offset-2',
          // Subtle featured effect
          isFeatured && 'ring-1 ring-amber-200/80',
          // Subtle elder status
          isElder && 'ring-1 ring-purple-200/80',
          !isActive && 'opacity-75 grayscale-[0.3]',
          className
        )}
      >
        {/* Large Portrait Image - Hero Style */}
        <div
          className="relative h-80 overflow-hidden bg-gradient-to-br from-warm-50 via-earth-50 to-sage-50"
          role="img"
          aria-label={`Profile photo of ${storyteller.display_name}`}
        >
          {storyteller.profile?.avatar_url ? (
            <img
              src={storyteller.profile.avatar_url}
              alt={`Portrait of ${storyteller.display_name}${storyteller.cultural_background ? `, ${storyteller.cultural_background} storyteller` : ''}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative">
              <div
                className="w-32 h-32 rounded-full bg-gradient-to-br from-earth-200 to-sage-200 flex items-center justify-center shadow-2xl"
                role="img"
                aria-label={`Initials for ${storyteller.display_name}`}
              >
                <span className="text-4xl font-bold text-earth-800" aria-hidden="true">
                  {getInitials(storyteller.display_name)}
                </span>
              </div>
              {/* Soft background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-earth-100/20 to-sage-100/20" aria-hidden="true"></div>
            </div>
          )}

          {/* Refined Status Indicators */}
          <div className="absolute top-5 right-5 flex flex-col gap-2 z-10" role="list" aria-label="Storyteller status badges">
            {isFeatured && (
              <div
                className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center shadow-md border border-amber-200"
                role="listitem"
                aria-label="Featured storyteller"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 mr-1" aria-hidden="true" />
                <span className="text-xs font-medium text-amber-700">Featured</span>
              </div>
            )}
            {isElder && (
              <div
                className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center shadow-md border border-purple-200"
                role="listitem"
                aria-label="Recognized Elder"
              >
                <Crown className="w-3.5 h-3.5 text-purple-500 mr-1" aria-hidden="true" />
                <span className="text-xs font-medium text-purple-700">Elder</span>
              </div>
            )}
          </div>

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          {/* Name Overlay on Image */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white text-xl font-bold mb-2 drop-shadow-lg">
              {storyteller.display_name}
            </h3>

            {/* Enhanced Location Context */}
            <div className="space-y-1.5">
              {storyteller.location && (
                <div className="flex items-center text-white/95 text-sm drop-shadow">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                  <span>{storyteller.location}</span>
                  {storyteller.geographic_scope && (
                    <Badge variant="secondary" className="ml-2 text-xs bg-white/20 text-white border-white/30">
                      {storyteller.geographic_scope}
                    </Badge>
                  )}
                </div>
              )}

              {storyteller.traditional_territory && (
                <div className="flex items-center text-white/90 text-xs drop-shadow">
                  <Landmark className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                  <span className="italic">{storyteller.traditional_territory}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Story Content - Clean and Spacious */}
        <div className="p-7">
          {/* Bio - Focus on the Story */}
          {storyteller.bio && (
            <p className="text-grey-600 leading-relaxed mb-6 text-sm">
              {truncateBio(storyteller.bio, 100)}
            </p>
          )}

          {/* Simplified Story Indicator */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              {storyteller.story_count > 0 && (
                <div className="flex items-center text-rose-600">
                  <Heart className="w-4 h-4 mr-1.5" />
                  <span className="text-sm font-medium">
                    {storyteller.story_count} {storyteller.story_count === 1 ? 'story' : 'stories'}
                  </span>
                </div>
              )}

              {/* Cleaner Experience Badge */}
              {storyteller.years_of_experience && getExperienceLabel(storyteller.years_of_experience) && (
                <Badge variant="secondary" className="text-xs">
                  {getExperienceLabel(storyteller.years_of_experience)}
                </Badge>
              )}
            </div>

            {/* Simple Arrow */}
            <ArrowRight className="w-5 h-5 text-grey-400 group-hover:text-earth-600 group-hover:translate-x-1 transition-all duration-300" />
          </div>

          {/* Cultural & Language Markers */}
          {((storyteller.cultural_background || storyteller.profile?.cultural_affiliations?.length) ||
            (storyteller.languages?.length || storyteller.profile?.languages_spoken?.length) ||
            storyteller.traditional_knowledge_keeper) && (
            <div className="mb-5 flex flex-wrap gap-2">
              {/* Cultural Background */}
              {storyteller.cultural_background && (
                <div
                  className="flex items-center text-xs px-3 py-1.5 rounded-lg bg-earth-50 text-earth-700 border border-earth-200"
                  title={`Cultural Background: ${storyteller.cultural_background}`}
                >
                  <Globe2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>{storyteller.cultural_background}</span>
                </div>
              )}

              {/* Languages */}
              {(storyteller.languages?.length || storyteller.profile?.languages_spoken?.length) && (
                <div
                  className="flex items-center text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200"
                  title={`Languages: ${(storyteller.languages || storyteller.profile?.languages_spoken)?.join(', ')}`}
                >
                  <Languages className="w-3.5 h-3.5 mr-1.5" />
                  <span>{(storyteller.languages || storyteller.profile?.languages_spoken)?.slice(0, 2).join(', ')}</span>
                  {(storyteller.languages || storyteller.profile?.languages_spoken)!.length > 2 && (
                    <span className="ml-1">+{(storyteller.languages || storyteller.profile?.languages_spoken)!.length - 2}</span>
                  )}
                </div>
              )}

              {/* Traditional Knowledge Keeper */}
              {storyteller.traditional_knowledge_keeper && (
                <div
                  className="flex items-center text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200"
                  title="Traditional Knowledge Keeper"
                >
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  <span>Knowledge Keeper</span>
                </div>
              )}
            </div>
          )}

          {/* Cleaner Organization and Project Tags */}
          {(storyteller.organisations?.length || storyteller.projects?.length) && (
            <div className="pt-5 border-t border-grey-100">
              <div className="flex flex-wrap gap-2">
                {storyteller.organisations?.slice(0, 1).map((org, index) => (
                  <div
                    key={`org-${index}`}
                    className="flex items-center text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    {org.name}
                  </div>
                ))}
                {storyteller.projects?.slice(0, 1).map((project, index) => (
                  <div
                    key={`project-${index}`}
                    className="flex items-center text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-100"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                    {project.name}
                  </div>
                ))}
                {(storyteller.organisations?.length || 0) + (storyteller.projects?.length || 0) > 2 && (
                  <span className="text-xs px-3 py-1.5 rounded-lg bg-grey-50 text-grey-500 border border-grey-100">
                    +{((storyteller.organisations?.length || 0) + (storyteller.projects?.length || 0)) - 2} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Key Specialties - Only if no org/project tags */}
          {!(storyteller.organisations?.length || storyteller.projects?.length) &&
           storyteller.specialties && storyteller.specialties.length > 0 && (
            <div className="mt-3 pt-3 border-t border-grey-100">
              <div className="flex flex-wrap gap-2">
                {storyteller.specialties.slice(0, 2).map((specialty, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-earth-50 text-earth-700 rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
                {storyteller.specialties.length > 2 && (
                  <span className="text-xs text-grey-500">
                    +{storyteller.specialties.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}