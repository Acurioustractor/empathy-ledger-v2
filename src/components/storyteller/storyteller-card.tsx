'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { 
  Crown, 
  User, 
  MapPin, 
  BookOpen,
  Calendar,
  Star,
  MessageCircle,
  ChevronRight,
  Users,
  Award
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
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
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
    <Card 
      className={cn(
        'group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden bg-white border-0 shadow-lg',
        'rounded-2xl backdrop-blur-sm',
        isFeatured && 'ring-2 ring-amber-200 shadow-amber-100/50',
        isElder && 'ring-2 ring-purple-200 shadow-purple-100/50',
        !isActive && 'opacity-75',
        className
      )}
    >
      {/* Large Profile Image Header */}
      <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {storyteller.profile?.avatar_url ? (
          <img
            src={storyteller.profile.avatar_url}
            alt={storyteller.display_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-rose-100">
            <div className="w-32 h-32 rounded-full bg-white/90 flex items-center justify-center shadow-2xl backdrop-blur-sm">
              <span className="text-4xl font-bold text-slate-700">
                {getInitials(storyteller.display_name)}
              </span>
            </div>
          </div>
        )}
        
        {/* Elegant overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        {/* Status indicators - floating badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {isFeatured && (
            <div className="bg-amber-400/90 backdrop-blur-md rounded-full px-3 py-1 shadow-lg">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-white" />
                <span className="text-xs font-medium text-white">Featured</span>
              </div>
            </div>
          )}
          {isElder && (
            <div className="bg-purple-500/90 backdrop-blur-md rounded-full px-3 py-1 shadow-lg">
              <div className="flex items-center gap-1">
                <Crown className="w-3 h-3 text-white" />
                <span className="text-xs font-medium text-white">Elder</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Name overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-6">
          <Link href={`/storytellers/${storyteller.id}`}>
            <Typography 
              variant="h3" 
              className="text-white font-bold group-hover:text-amber-200 transition-colors cursor-pointer drop-shadow-lg"
            >
              {storyteller.display_name}
            </Typography>
          </Link>
          {(storyteller.location || storyteller.cultural_background) && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-white/80" />
              <Typography variant="small" className="text-white/90 font-medium">
                {storyteller.location || storyteller.cultural_background}
              </Typography>
            </div>
          )}
        </div>
      </div>

      {/* Content section */}
      <div className="p-6">
        {/* Pronouns and Occupation */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {storyteller.profile?.pronouns && (
            <span className="text-slate-500 text-sm font-medium">
              {storyteller.profile.pronouns}
            </span>
          )}
          {storyteller.occupation && (
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
              {storyteller.occupation}
            </span>
          )}
        </div>

        {/* Bio */}
        {storyteller.bio && (
          <div className="mb-6">
            <Typography variant="body" className="text-slate-600 leading-relaxed">
              {truncateBio(storyteller.bio, 140)}
            </Typography>
          </div>
        )}

        {/* Refined Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <Typography variant="h3" className="text-slate-800 font-bold">
              {storyteller.story_count}
            </Typography>
            <Typography variant="small" className="text-slate-500 font-medium">
              {storyteller.story_count === 1 ? 'Story' : 'Stories'}
            </Typography>
          </div>
          
          <div className="text-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <Typography variant="h3" className="text-slate-800 font-bold">
              {storyteller.years_of_experience || 'New'}
            </Typography>
            <Typography variant="small" className="text-slate-500 font-medium">
              {storyteller.years_of_experience ? 
                (storyteller.years_of_experience === 1 ? 'Year' : 'Years') : 
                'Storyteller'
              }
            </Typography>
          </div>
        </div>

        {/* Specialties - Only show if they exist */}
        {storyteller.specialties && storyteller.specialties.length > 0 && (
          <div className="mb-6">
            <Typography variant="small" className="text-slate-500 mb-3 font-semibold uppercase tracking-wide">
              Specialties
            </Typography>
            <div className="flex flex-wrap gap-2">
              {storyteller.specialties.slice(0, 3).map((specialty, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100"
                >
                  {specialty}
                </span>
              ))}
              {storyteller.specialties.length > 3 && (
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                  +{storyteller.specialties.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Cultural Affiliations - Only show if they exist */}
        {storyteller.profile?.cultural_affiliations && storyteller.profile.cultural_affiliations.length > 0 && (
          <div className="mb-6">
            <Typography variant="small" className="text-slate-500 mb-3 font-semibold uppercase tracking-wide">
              Cultural Connections
            </Typography>
            <div className="flex flex-wrap gap-2">
              {storyteller.profile.cultural_affiliations.slice(0, 2).map((affiliation, index) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {affiliation}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages - Only show if they exist */}
        {storyteller.languages && storyteller.languages.length > 0 && (
          <div className="mb-6">
            <Typography variant="small" className="text-slate-500 mb-3 font-semibold uppercase tracking-wide">
              Languages
            </Typography>
            <div className="flex flex-wrap gap-2">
              {storyteller.languages.slice(0, 3).map((language, index) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100">
                  {language}
                </span>
              ))}
              {storyteller.languages.length > 3 && (
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                  +{storyteller.languages.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Elegant Actions */}
        {showActions && (
          <div className="pt-6 border-t border-slate-100">
            <Button 
              className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white rounded-xl py-3 font-semibold transition-all duration-300 group"
              asChild
            >
              <Link href={`/storytellers/${storyteller.id}`} className="flex items-center justify-center">
                View Profile
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}