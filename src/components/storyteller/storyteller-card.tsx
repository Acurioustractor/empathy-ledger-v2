'use client'

import React from 'react'
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
  ArrowRight
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
    occupation?: string | null
    languages?: string[] | null
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

  return (
    <Link href={`/storytellers/${storyteller.id}`}>
      <Card
        className={cn(
          'group cursor-pointer transition-all duration-500 hover:shadow-xl hover:-translate-y-1 overflow-hidden',
          'bg-white border-0 shadow-lg rounded-2xl relative',
          isFeatured && 'ring-2 ring-amber-300/50',
          isElder && 'ring-2 ring-purple-300/50',
          !isActive && 'opacity-80',
          className
        )}
      >
        {/* Large Portrait Image - Hero Style */}
        <div className="relative h-80 overflow-hidden bg-gradient-to-br from-warm-50 via-earth-50 to-sage-50">
          {storyteller.profile?.avatar_url ? (
            <img
              src={storyteller.profile.avatar_url}
              alt={storyteller.display_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-earth-200 to-sage-200 flex items-center justify-center shadow-2xl">
                <span className="text-4xl font-bold text-earth-800">
                  {getInitials(storyteller.display_name)}
                </span>
              </div>
              {/* Soft background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-earth-100/20 to-sage-100/20"></div>
            </div>
          )}

          {/* Elegant Status Indicators */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {isFeatured && (
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center shadow-lg">
                <Star className="w-4 h-4 text-amber-600 mr-1" />
                <span className="text-xs font-medium text-amber-800">Featured</span>
              </div>
            )}
            {isElder && (
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center shadow-lg">
                <Crown className="w-4 h-4 text-purple-600 mr-1" />
                <span className="text-xs font-medium text-purple-800">Elder</span>
              </div>
            )}
          </div>

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

          {/* Name Overlay on Image */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white text-xl font-bold mb-1 drop-shadow-lg">
              {storyteller.display_name}
            </h3>
            {(storyteller.location || storyteller.cultural_background) && (
              <div className="flex items-center text-white/90 text-sm drop-shadow">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{storyteller.location || storyteller.cultural_background}</span>
              </div>
            )}
          </div>
        </div>

        {/* Story Content - Minimal and Elegant */}
        <div className="p-6">
          {/* Bio - Focus on the Story */}
          {storyteller.bio && (
            <p className="text-grey-700 leading-relaxed mb-4 text-sm">
              {truncateBio(storyteller.bio, 100)}
            </p>
          )}

          {/* Soft Story Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {storyteller.story_count > 0 && (
                <div className="flex items-center text-earth-600">
                  <Heart className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">
                    {storyteller.story_count} {storyteller.story_count === 1 ? 'story' : 'stories'}
                  </span>
                </div>
              )}

              {/* Subtle Experience Indicator */}
              {storyteller.years_of_experience && getExperienceLabel(storyteller.years_of_experience) && (
                <Badge
                  variant="outline"
                  className="text-xs bg-sage-50 text-sage-700 border-sage-200"
                >
                  {getExperienceLabel(storyteller.years_of_experience)}
                </Badge>
              )}
            </div>

            {/* Discover More Arrow */}
            <div className="text-earth-500 group-hover:text-earth-700 group-hover:translate-x-1 transition-all duration-300">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          {/* Organization and Project Tags */}
          {(storyteller.organisations?.length || storyteller.projects?.length) && (
            <div className="mt-3 pt-3 border-t border-grey-100">
              <div className="flex flex-wrap gap-2">
                {storyteller.organisations?.slice(0, 1).map((org, index) => (
                  <span
                    key={`org-${index}`}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                  >
                    📋 {org.name}
                  </span>
                ))}
                {storyteller.projects?.slice(0, 1).map((project, index) => (
                  <span
                    key={`project-${index}`}
                    className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-200"
                  >
                    🎯 {project.name}
                  </span>
                ))}
                {(storyteller.organisations?.length || 0) + (storyteller.projects?.length || 0) > 2 && (
                  <span className="text-xs text-grey-500">
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