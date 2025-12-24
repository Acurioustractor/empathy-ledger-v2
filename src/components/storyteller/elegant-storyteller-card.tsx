'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Typography } from '@/components/ui/typography'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  Crown,
  MapPin,
  Star,
  Heart,
  ArrowRight,
  Building2,
  Target,
  Sparkles,
  Calendar,
  Trash2,
  FileText
} from 'lucide-react'
import { getCardDisplayBio } from '@/lib/utils/bio-extractors'

export interface ElegantStorytellerCardProps {
  storyteller: {
    id: string
    display_name: string
    bio?: string | null
    avatar_url?: string | null

    // Status indicators
    featured: boolean
    elder_status: boolean
    status: 'active' | 'inactive' | 'pending'

    // Essential metrics
    story_count: number
    transcript_count?: number
    last_active?: string

    // Location (simplified)
    location?: string | null
    traditional_territory?: string | null

    // Primary affiliations
    primary_organization?: {
      name: string
      role: string
      type?: 'nonprofit' | 'community' | 'government' | 'tribal'
    }
    primary_project?: {
      name: string
      role: string
      type?: 'cultural' | 'educational' | 'community' | 'research'
    }

    // AI insights (minimal)
    profile_completeness?: number
    top_theme?: string
    top_themes?: string[]
  }
  variant?: 'default' | 'featured' | 'compact'
  className?: string
  onDelete?: (storytellerId: string) => void
  showDelete?: boolean
  onAddTranscript?: (storytellerId: string) => void
  showAddTranscript?: boolean
}

export function ElegantStorytellerCard({
  storyteller,
  variant = 'default',
  className,
  onDelete,
  showDelete = false,
  onAddTranscript,
  showAddTranscript = false
}: ElegantStorytellerCardProps) {
  const isCompact = variant === 'compact'
  const isFeatured = storyteller.featured
  const isElder = storyteller.elder_status

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const truncateBio = (bio: string, maxLength: number = 100) => {
    if (bio.length <= maxLength) return bio
    return bio.substring(0, maxLength) + '...'
  }

  const formatLastActive = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  const getOrgTypeColor = (type?: string) => {
    switch (type) {
      case 'tribal': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'nonprofit': return 'bg-earth-50 text-earth-700 border-earth-200'
      case 'government': return 'bg-stone-50 text-stone-700 border-stone-200'
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  }

  const getProjectTypeColor = (type?: string) => {
    switch (type) {
      case 'cultural': return 'bg-earth-50 text-earth-700 border-earth-200'
      case 'educational': return 'bg-sage-50 text-sage-700 border-sage-200'
      case 'research': return 'bg-stone-50 text-stone-700 border-stone-200'
      default: return 'bg-clay-50 text-clay-700 border-clay-200'
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete) {
      onDelete(storyteller.id)
    }
  }

  const handleAddTranscriptClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onAddTranscript) {
      onAddTranscript(storyteller.id)
    }
  }

  return (
    <div className="relative">
      <Link href={`/storytellers/${storyteller.id}`}>
        <Card
          className={cn(
            'group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
            'bg-white border-0 shadow-lg rounded-2xl overflow-hidden relative',
            'min-h-[400px]',
            isFeatured && 'ring-2 ring-amber-300/50',
            isElder && 'ring-2 ring-purple-300/50',
            className
          )}
        >
        {/* Large Portrait Section */}
        <div className="relative h-64 bg-gradient-to-br from-warm-50 via-earth-50 to-sage-50">
          {storyteller.avatar_url ? (
            <img
              src={storyteller.avatar_url}
              alt={storyteller.display_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Avatar className="w-24 h-24 ring-4 ring-white shadow-xl">
                <AvatarImage src={storyteller.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-earth-200 to-sage-200 text-earth-800 text-2xl font-bold">
                  {getInitials(storyteller.display_name || 'Unknown')}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Status Badges - Top Right */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {isFeatured && (
              <Badge className="bg-white/90 backdrop-blur-sm text-amber-700 border-amber-200 shadow-lg touch-target">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {isElder && (
              <Badge className="bg-white/90 backdrop-blur-sm text-purple-700 border-purple-200 shadow-lg touch-target">
                <Crown className="w-3 h-3 mr-1" />
                Elder
              </Badge>
            )}
          </div>

          {/* Profile Completeness - Top Left */}
          {storyteller.profile_completeness && storyteller.profile_completeness < 90 && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/90 backdrop-blur-sm text-accent-foreground border-accent/30 shadow-lg text-xs touch-target">
                <Sparkles className="w-3 h-3 mr-1 text-accent" />
                {storyteller.profile_completeness}% complete
              </Badge>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Name Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <Typography variant="h3" className="text-white font-bold text-xl mb-1 drop-shadow-lg">
              {storyteller.display_name || 'Unknown Storyteller'}
            </Typography>
            {storyteller.location && (
              <div className="flex items-center text-white/90 text-sm drop-shadow">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{storyteller.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Traditional Territory */}
          {storyteller.traditional_territory && (
            <div className="flex items-center gap-1 text-sm text-earth-600 bg-earth-50 px-3 py-1 rounded-full">
              <span className="font-medium">{storyteller.traditional_territory}</span>
            </div>
          )}

          {/* Bio */}
          {storyteller.bio && (
            <Typography variant="p" className="text-grey-700 leading-relaxed text-sm">
              {getCardDisplayBio(storyteller.bio, 150)}
            </Typography>
          )}

          {/* Primary Organization */}
          {storyteller.primary_organization && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-grey-500" />
              <Badge
                variant="outline"
                className={cn("text-xs touch-target", getOrgTypeColor(storyteller.primary_organization.type))}
              >
                {storyteller.primary_organization.name}
              </Badge>
            </div>
          )}

          {/* Primary Project */}
          {storyteller.primary_project && (
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-grey-500" />
              <Badge
                variant="outline"
                className={cn("text-xs touch-target", getProjectTypeColor(storyteller.primary_project.type))}
              >
                {storyteller.primary_project.name}
              </Badge>
            </div>
          )}

          {/* Top 3 Themes */}
          {storyteller.top_themes && storyteller.top_themes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {storyteller.top_themes.slice(0, 3).map((theme, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-earth-50 text-earth-700 border-earth-200 touch-target">
                  {theme}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-grey-100">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Transcript Count */}
              {storyteller.transcript_count !== undefined && storyteller.transcript_count > 0 && (
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-earth-600" />
                  <Typography variant="small" className="text-grey-700 font-medium">
                    {storyteller.transcript_count} {storyteller.transcript_count === 1 ? 'transcript' : 'transcripts'}
                  </Typography>
                </div>
              )}

              {/* Story Count */}
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-earth-600" />
                <Typography variant="small" className="text-grey-700 font-medium">
                  {storyteller.story_count} {storyteller.story_count === 1 ? 'story' : 'stories'}
                </Typography>
              </div>

              {storyteller.last_active && (
                <div className="flex items-center gap-1 text-xs text-grey-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatLastActive(storyteller.last_active)}</span>
                </div>
              )}
            </div>

            <div className="text-earth-500 group-hover:text-earth-700 group-hover:translate-x-1 transition-all duration-300">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </Card>
    </Link>

    {/* Action Buttons */}
    <div className="absolute top-2 right-2 z-10 flex gap-2">
      {showAddTranscript && onAddTranscript && (
        <button
          onClick={handleAddTranscriptClick}
          className="bg-earth-500 hover:bg-earth-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
          title="Add transcript for this storyteller"
        >
          <FileText className="w-4 h-4" />
        </button>
      )}
      {showDelete && onDelete && (
        <button
          onClick={handleDeleteClick}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
          title="Delete storyteller"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
  )
}

// Simplified data transformer for elegant cards
export function transformToElegantCard(storyteller: any): ElegantStorytellerCardProps['storyteller'] {
  // Extract primary organisation
  const primaryOrg = storyteller.organisations?.[0]

  // Extract primary project - get the first project directly from the array
  const primaryProject = storyteller.projects?.[0]

  // Extract location info - use the location from API
  const location = storyteller.location

  // Extract specialties as themes array
  const themes = storyteller.specialties || []

  const result = {
    id: storyteller.id,
    display_name: storyteller.display_name?.trim() || storyteller.displayName?.trim() || storyteller.fullName?.trim() || 'Unknown',
    bio: storyteller.profile?.bio || storyteller.bio || null,
    avatar_url: storyteller.avatar_url || storyteller.profile?.avatar_url || null,
    featured: storyteller.featured || storyteller.isFeatured || false,
    elder_status: storyteller.elder_status || storyteller.isElder || false,
    status: storyteller.status || 'active',
    story_count: storyteller.story_count || storyteller.storyCount || storyteller.stats?.totalStories || 0,
    transcript_count: storyteller.transcript_count || storyteller.transcriptCount || storyteller.stats?.totalTranscripts || 0,
    last_active: storyteller.last_active || storyteller.lastActive,
    location,
    traditional_territory: storyteller.traditional_territory || storyteller.culturalBackground,
    primary_organization: primaryOrg ? {
      name: primaryOrg.name,
      role: primaryOrg.role,
      type: 'community' as const
    } : undefined,
    primary_project: primaryProject ? {
      name: primaryProject.name,
      role: primaryProject.role,
      type: 'community' as const
    } : undefined,
    profile_completeness: storyteller.profile_completeness,
    top_theme: themes[0],
    top_themes: themes
  }

  return result
}