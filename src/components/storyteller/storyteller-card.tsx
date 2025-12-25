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
  Shield,
  Tag
} from 'lucide-react'
import { formatThemeLabel, getThemeColor } from '@/lib/constants/themes'

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
    // AI-enriched fields
    themes?: string[] | null
    ai_summary?: string | null
    profile_completeness?: number | null
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
  showThemes?: boolean
  className?: string
}

export function StorytellerCard({
  storyteller,
  variant = 'default',
  showStories = true,
  showActions = true,
  showThemes = true,
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
          'bg-card border border-border shadow-md rounded-2xl relative',
          'hover:shadow-xl hover:-translate-y-1',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          // Subtle featured effect
          isFeatured && 'ring-1 ring-amber-200/80 dark:ring-amber-700/50',
          // Subtle elder status
          isElder && 'ring-1 ring-amber-200/80 dark:ring-amber-700/50',
          !isActive && 'opacity-75 grayscale-[0.3]',
          className
        )}
      >
        {/* Large Portrait Image - Hero Style */}
        <div
          className="relative h-80 overflow-hidden bg-gradient-to-br from-muted via-muted/80 to-muted/60"
          role="img"
          aria-label={`Profile photo of ${storyteller.display_name}`}
        >
          {storyteller.avatar_url || storyteller.profile?.avatar_url ? (
            <img
              src={storyteller.avatar_url || storyteller.profile?.avatar_url}
              alt={`Portrait of ${storyteller.display_name}${storyteller.cultural_background ? `, ${storyteller.cultural_background} storyteller` : ''}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
              onError={(e) => {
                console.error('Image failed to load:', storyteller.avatar_url || storyteller.profile?.avatar_url);
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-earth-100 via-sage-100 to-clay-100 dark:from-earth-900/50 dark:via-sage-900/50 dark:to-clay-900/50"><div class="w-32 h-32 rounded-full bg-gradient-to-br from-earth-200 to-sage-200 dark:from-earth-700 dark:to-sage-700 flex items-center justify-center shadow-2xl"><span class="text-4xl font-bold text-earth-800 dark:text-earth-100">${getInitials(storyteller.display_name)}</span></div></div>`;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-earth-100 via-sage-100 to-clay-100 dark:from-earth-900/50 dark:via-sage-900/50 dark:to-clay-900/50">
              <div
                className="w-32 h-32 rounded-full bg-gradient-to-br from-earth-200 to-sage-200 dark:from-earth-700 dark:to-sage-700 flex items-center justify-center shadow-2xl"
                role="img"
                aria-label={`Initials for ${storyteller.display_name}`}
              >
                <span className="text-4xl font-bold text-earth-800 dark:text-earth-100" aria-hidden="true">
                  {getInitials(storyteller.display_name)}
                </span>
              </div>
            </div>
          )}

          {/* Refined Status Indicators */}
          <div className="absolute top-5 right-5 flex flex-col gap-2 z-10" role="list" aria-label="Storyteller status badges">
            {isFeatured && (
              <div
                className="bg-background/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center shadow-md border border-amber-200 dark:border-amber-700 touch-target"
                role="listitem"
                aria-label="Featured storyteller"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 mr-1" aria-hidden="true" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Featured</span>
              </div>
            )}
            {isElder && (
              <div
                className="bg-background/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center shadow-md border border-clay-200 dark:border-clay-700 touch-target"
                role="listitem"
                aria-label="Recognized Elder"
              >
                <Crown className="w-3.5 h-3.5 text-clay-500 mr-1" aria-hidden="true" />
                <span className="text-xs font-medium text-clay-700 dark:text-clay-300">Elder</span>
              </div>
            )}
          </div>

          {/* AI Enrichment Indicator */}
          {storyteller.ai_summary && (
            <div className="absolute top-5 left-5">
              <div className="bg-background/95 backdrop-blur-sm rounded-full px-2 py-1 flex items-center shadow-md border border-accent/30 touch-target">
                <Sparkles className="w-3 h-3 text-accent" />
              </div>
            </div>
          )}

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
            <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
              {truncateBio(storyteller.ai_summary || storyteller.bio, 100)}
            </p>
          )}

          {/* Simplified Story Indicator */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              {storyteller.story_count > 0 && (
                <div className="flex items-center text-rose-600 dark:text-rose-400">
                  <Heart className="w-4 h-4 mr-1.5" />
                  <span className="text-sm font-medium">
                    {storyteller.story_count} {storyteller.story_count === 1 ? 'story' : 'stories'}
                  </span>
                </div>
              )}

              {/* Cleaner Experience Badge */}
              {storyteller.years_of_experience && getExperienceLabel(storyteller.years_of_experience) && (
                <Badge variant="secondary" className="text-xs touch-target">
                  {getExperienceLabel(storyteller.years_of_experience)}
                </Badge>
              )}
            </div>

            {/* Simple Arrow - Touch target increased to 44px */}
            <div className="touch-target flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </div>

          {/* Theme Tags (AI-enriched) */}
          {showThemes && storyteller.themes && storyteller.themes.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-1.5">
              {storyteller.themes.slice(0, 3).map((theme, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-earth-50 text-earth-700 border-earth-200 dark:bg-earth-900/30 dark:text-earth-300 dark:border-earth-700 touch-target"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {formatThemeLabel(theme)}
                </Badge>
              ))}
              {storyteller.themes.length > 3 && (
                <Badge variant="outline" className="text-xs text-muted-foreground touch-target">
                  +{storyteller.themes.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Cultural & Language Markers */}
          {((storyteller.cultural_background || storyteller.profile?.cultural_affiliations?.length) ||
            (storyteller.languages?.length || storyteller.profile?.languages_spoken?.length) ||
            storyteller.traditional_knowledge_keeper) && (
            <div className="mb-5 flex flex-wrap gap-2">
              {/* Cultural Background */}
              {storyteller.cultural_background && (
                <div
                  className="flex items-center text-xs px-3 py-1.5 rounded-lg bg-earth-50 text-earth-700 border border-earth-200 dark:bg-earth-900/30 dark:text-earth-300 dark:border-earth-700 touch-target"
                  title={`Cultural Background: ${storyteller.cultural_background}`}
                >
                  <Globe2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>{storyteller.cultural_background}</span>
                </div>
              )}

              {/* Languages - Using cultural earth tones */}
              {(storyteller.languages?.length || storyteller.profile?.languages_spoken?.length) && (
                <div
                  className="flex items-center text-xs px-3 py-1.5 rounded-lg bg-earth-50 text-earth-700 border border-earth-200 dark:bg-earth-900/30 dark:text-earth-300 dark:border-earth-700 touch-target"
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
                  className="flex items-center text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700 touch-target"
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
            <div className="pt-5 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {storyteller.organisations?.slice(0, 1).map((org, index) => (
                  <div
                    key={`org-${index}`}
                    className="flex items-center text-xs px-3 py-1.5 rounded-lg bg-earth-50 text-earth-700 border border-earth-200 dark:bg-earth-900/30 dark:text-earth-300 dark:border-earth-700 touch-target"
                  >
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    {org.name}
                  </div>
                ))}
                {storyteller.projects?.slice(0, 1).map((project, index) => (
                  <div
                    key={`project-${index}`}
                    className="flex items-center text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700 touch-target"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                    {project.name}
                  </div>
                ))}
                {(storyteller.organisations?.length || 0) + (storyteller.projects?.length || 0) > 2 && (
                  <span className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground border border-border">
                    +{((storyteller.organisations?.length || 0) + (storyteller.projects?.length || 0)) - 2} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Key Specialties - Only if no org/project tags */}
          {!(storyteller.organisations?.length || storyteller.projects?.length) &&
           storyteller.specialties && storyteller.specialties.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {storyteller.specialties.slice(0, 2).map((specialty, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-earth-50 text-earth-700 rounded-full dark:bg-earth-900/30 dark:text-earth-300 touch-target"
                  >
                    {specialty}
                  </span>
                ))}
                {storyteller.specialties.length > 2 && (
                  <span className="text-xs text-muted-foreground">
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
