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
        'group transition-all duration-300 hover:shadow-xl border-l-4 overflow-hidden',
        isFeatured && 'border-l-amber-400 bg-gradient-to-br from-amber-50 to-white shadow-lg',
        !isFeatured && isElder && 'border-l-purple-400 bg-gradient-to-br from-purple-50 to-white',
        !isFeatured && !isElder && 'border-l-earth-400 hover:border-l-earth-500',
        variant === 'compact' && 'p-4',
        !isActive && 'opacity-75',
        className
      )}
    >
      <div className="p-6">
        {/* Header with Avatar and Status */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={storyteller.profile?.avatar_url} 
                alt={storyteller.display_name}
              />
              <AvatarFallback className="bg-earth-200 text-earth-700 text-lg">
                {getInitials(storyteller.display_name)}
              </AvatarFallback>
            </Avatar>
            
            {/* Status Indicators */}
            <div className="absolute -top-1 -right-1 flex flex-col gap-1">
              {isFeatured && (
                <div className="bg-amber-400 rounded-full p-1">
                  <Star className="w-3 h-3 text-white" />
                </div>
              )}
              {isElder && (
                <div className="bg-purple-500 rounded-full p-1">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/storytellers/${storyteller.id}`}>
                  <Typography 
                    variant="h4" 
                    className="group-hover:text-earth-700 transition-colors cursor-pointer"
                  >
                    {storyteller.display_name}
                  </Typography>
                </Link>
                
                {storyteller.profile?.pronouns && (
                  <Typography variant="small" className="text-gray-500 mb-1">
                    {storyteller.profile.pronouns}
                  </Typography>
                )}

                {storyteller.cultural_background && (
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <Typography variant="small" className="text-gray-600">
                      {storyteller.cultural_background}
                    </Typography>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-col gap-1 items-end">
                {isFeatured && (
                  <Badge className="bg-amber-100 text-amber-800 text-xs">
                    Featured
                  </Badge>
                )}
                {isElder && (
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Elder
                  </Badge>
                )}
                <Badge className={cn('text-xs', statusColors[storyteller.status])}>
                  {storyteller.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {storyteller.bio && (
          <div className="mb-4">
            <Typography variant="body" className="text-gray-600 leading-relaxed text-sm">
              {truncateBio(storyteller.bio)}
            </Typography>
          </div>
        )}

        {/* Experience and Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <BookOpen className="w-4 h-4 text-earth-600" />
            </div>
            <Typography variant="h4" className="text-earth-800">
              {storyteller.story_count}
            </Typography>
            <Typography variant="small" className="text-gray-600">
              {storyteller.story_count === 1 ? 'Story' : 'Stories'}
            </Typography>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-earth-600" />
            </div>
            <Typography variant="h4" className="text-earth-800">
              {storyteller.years_of_experience || 'New'}
            </Typography>
            <Typography variant="small" className="text-gray-600">
              {storyteller.years_of_experience ? 
                (storyteller.years_of_experience === 1 ? 'Year' : 'Years') : 
                'Storyteller'
              }
            </Typography>
          </div>
        </div>

        {/* Experience Level Badge */}
        {storyteller.years_of_experience && (
          <div className="mb-4">
            <Badge variant="outline" className="text-xs bg-earth-50 text-earth-700">
              <Award className="w-3 h-3 mr-1" />
              {getExperienceLabel(storyteller.years_of_experience)}
            </Badge>
          </div>
        )}

        {/* Specialties */}
        {storyteller.specialties && storyteller.specialties.length > 0 && (
          <div className="mb-4">
            <Typography variant="small" className="text-gray-700 mb-2 font-medium">
              Specialties
            </Typography>
            <div className="flex flex-wrap gap-1">
              {storyteller.specialties.slice(0, 3).map((specialty, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className={cn('text-xs', specialtyColors[index % specialtyColors.length])}
                >
                  {specialty}
                </Badge>
              ))}
              {storyteller.specialties.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                  +{storyteller.specialties.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Storytelling Styles */}
        {storyteller.storytelling_style && storyteller.storytelling_style.length > 0 && (
          <div className="mb-4">
            <Typography variant="small" className="text-gray-700 mb-2 font-medium">
              Storytelling Style
            </Typography>
            <div className="flex flex-wrap gap-1">
              {storyteller.storytelling_style.slice(0, 2).map((style, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {style}
                </Badge>
              ))}
              {storyteller.storytelling_style.length > 2 && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +{storyteller.storytelling_style.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Cultural Affiliations */}
        {storyteller.profile?.cultural_affiliations && storyteller.profile.cultural_affiliations.length > 0 && (
          <div className="mb-4">
            <Typography variant="small" className="text-gray-700 mb-2 font-medium">
              Cultural Affiliations
            </Typography>
            <div className="flex flex-wrap gap-1">
              {storyteller.profile.cultural_affiliations.slice(0, 2).map((affiliation, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-sage-50 text-sage-700">
                  <Users className="w-3 h-3 mr-1" />
                  {affiliation}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100">
            <Button 
              variant="default" 
              size="sm"
              className="flex-1 group/button"
              asChild
            >
              <Link href={`/storytellers/${storyteller.id}`} className="flex items-center justify-center">
                View Profile
                <ChevronRight className="w-4 h-4 ml-1 group-hover/button:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
            
            {showStories && storyteller.story_count > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                asChild
              >
                <Link href={`/storytellers/${storyteller.id}/stories`} className="flex items-center justify-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  View Stories ({storyteller.story_count})
                </Link>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              className="flex-1"
              asChild
            >
              <Link href={`/storytellers/${storyteller.id}/contact`} className="flex items-center justify-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                Contact
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}