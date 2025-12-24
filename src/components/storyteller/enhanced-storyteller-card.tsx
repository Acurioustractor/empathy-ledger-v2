'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { getCardDisplayBio } from '@/lib/utils/bio-extractors'
import {
  Crown,
  MapPin,
  BookOpen,
  Star,
  MessageCircle,
  Video,
  FileText,
  Lightbulb,
  Calendar,
  Briefcase,
  Users,
  Target,
  Globe,
  Mic,
  GraduationCap,
  Heart,
  Building
} from 'lucide-react'

interface EnhancedStorytellerCardProps {
  storyteller: {
    id: string
    display_name: string
    bio?: string | null
    location?: string | null
    cultural_background?: string | null
    avatar_url?: string | null
    is_elder?: boolean
    is_featured?: boolean

    // Content metrics
    content_stats: {
      transcripts: number
      stories: number
      videos: number
      analyzed_content: number
    }

    // Project context
    primary_project?: string
    project_affiliations?: string[]

    // AI insights
    ai_insights?: {
      top_themes: Array<{ theme: string; count: number }>
      cultural_markers?: string[]
      last_analyzed?: string
    }

    // Enhanced storyteller properties
    impact_focus_areas?: string[] | null
    expertise_areas?: string[] | null
    storytelling_methods?: string[] | null
    community_roles?: string[] | null
    change_maker_type?: string | null
    geographic_scope?: string | null
    years_of_community_work?: number | null
    mentor_availability?: boolean | null
    speaking_availability?: boolean | null

    // Status
    last_active?: string
    years_active?: number
  }
  variant?: 'default' | 'featured' | 'compact'
  showActions?: boolean
  className?: string
}

export function EnhancedStorytellerCard({
  storyteller,
  variant = 'default',
  showActions = true,
  className
}: EnhancedStorytellerCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
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

  return (
    <Card
      className={cn(
        'group transition-all duration-300 hover:shadow-lg overflow-hidden bg-white border border-grey-200',
        'rounded-lg',
        storyteller.is_featured && 'ring-2 ring-amber-200',
        storyteller.is_elder && 'ring-2 ring-purple-200',
        className
      )}
    >
      {/* Header with avatar and basic info */}
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={storyteller.avatar_url || undefined} />
            <AvatarFallback className="bg-earth-100 text-earth-700 text-lg font-semibold">
              {getInitials(storyteller.display_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/storytellers/${storyteller.id}`}>
                  <Typography
                    variant="h3"
                    className="text-grey-900 font-bold group-hover:text-earth-700 transition-colours cursor-pointer"
                  >
                    {storyteller.display_name}
                  </Typography>
                </Link>

                {/* Location and Project Context */}
                <div className="flex flex-col gap-1 mt-1">
                  {storyteller.location && (
                    <div className="flex items-center gap-1 text-sm text-grey-600">
                      <MapPin className="w-3 h-3" />
                      <span>{storyteller.location}</span>
                    </div>
                  )}

                  {storyteller.primary_project && (
                    <div className="flex items-center gap-1 text-sm text-grey-600">
                      <Briefcase className="w-3 h-3" />
                      <span>{storyteller.primary_project}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status badges */}
              <div className="flex flex-col gap-1">
                {storyteller.is_featured && (
                  <Badge className="bg-amber-100 text-amber-800 text-xs font-medium touch-target">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {storyteller.is_elder && (
                  <Badge className="bg-purple-100 text-purple-800 text-xs font-medium touch-target">
                    <Crown className="w-3 h-3 mr-1" />
                    Elder
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Bio */}
        {storyteller.bio && (
          <div className="mb-4">
            <Typography variant="body" className="text-grey-700 leading-relaxed text-sm">
              {getCardDisplayBio(storyteller.bio, 120)}
            </Typography>
          </div>
        )}

        {/* Content Statistics - Clear Labels */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-grey-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-grey-600">
              <FileText className="w-4 h-4" />
              <span>Transcripts</span>
            </div>
            <div className="text-lg font-semibold text-grey-900">
              {storyteller.content_stats.transcripts}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-grey-600">
              <BookOpen className="w-4 h-4" />
              <span>Stories</span>
            </div>
            <div className="text-lg font-semibold text-grey-900">
              {storyteller.content_stats.stories}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-grey-600">
              <Video className="w-4 h-4" />
              <span>Videos</span>
            </div>
            <div className="text-lg font-semibold text-grey-900">
              {storyteller.content_stats.videos}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-grey-600">
              <Lightbulb className="w-4 h-4" />
              <span>AI Analyzed</span>
            </div>
            <div className="text-lg font-semibold text-grey-900">
              {storyteller.content_stats.analyzed_content}
            </div>
          </div>
        </div>

        {/* AI Insights - Story Themes */}
        {storyteller.ai_insights?.top_themes && storyteller.ai_insights.top_themes.length > 0 && (
          <div className="mb-4">
            <Typography variant="small" className="text-grey-600 font-medium mb-2">
              Story Themes:
            </Typography>
            <div className="flex flex-wrap gap-2">
              {storyteller.ai_insights.top_themes.slice(0, 4).map((theme, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-earth-50 text-earth-700 border-earth-200 touch-target"
                >
                  {theme.theme}
                  <span className="ml-1 text-earth-600">{theme.count}</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Cultural Markers */}
        {storyteller.ai_insights?.cultural_markers && storyteller.ai_insights.cultural_markers.length > 0 && (
          <div className="mb-4">
            <Typography variant="small" className="text-grey-600 font-medium mb-2">
              Cultural Markers:
            </Typography>
            <div className="flex flex-wrap gap-2">
              {storyteller.ai_insights.cultural_markers.slice(0, 3).map((marker, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-purple-50 text-purple-700 border-purple-200 touch-target"
                >
                  {marker}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Community Impact & Expertise */}
        {(storyteller.impact_focus_areas?.length || storyteller.community_roles?.length || storyteller.change_maker_type) && (
          <div className="mb-4 p-3 bg-earth-50 rounded-lg border border-earth-200">
            {/* Impact Focus Areas */}
            {storyteller.impact_focus_areas && storyteller.impact_focus_areas.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1 text-sm text-earth-700 font-medium mb-2">
                  <Target className="w-3 h-3" />
                  <span>Impact Focus:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {storyteller.impact_focus_areas.slice(0, 3).map((area, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-earth-100 text-earth-800 border-earth-300 touch-target"
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Community Roles */}
            {storyteller.community_roles && storyteller.community_roles.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1 text-sm text-earth-700 font-medium mb-2">
                  <Users className="w-3 h-3" />
                  <span>Community Roles:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {storyteller.community_roles.slice(0, 2).map((role, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-emerald-100 text-emerald-800 border-emerald-300 touch-target"
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Change Maker Type */}
            {storyteller.change_maker_type && (
              <div className="flex items-center gap-1 text-sm text-earth-700">
                <Heart className="w-3 h-3" />
                <span className="font-medium">Change Maker:</span>
                <span className="text-earth-800 capitalize">{storyteller.change_maker_type}</span>
              </div>
            )}
          </div>
        )}

        {/* Storytelling & Availability */}
        {(storyteller.storytelling_methods?.length || storyteller.mentor_availability || storyteller.speaking_availability || storyteller.years_of_community_work) && (
          <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            {/* Storytelling Methods */}
            {storyteller.storytelling_methods && storyteller.storytelling_methods.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1 text-sm text-emerald-700 font-medium mb-2">
                  <Mic className="w-3 h-3" />
                  <span>Storytelling Methods:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {storyteller.storytelling_methods.slice(0, 3).map((method, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-emerald-100 text-emerald-800 border-emerald-300 touch-target"
                    >
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Experience & Availability */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                {storyteller.years_of_community_work && storyteller.years_of_community_work > 0 && (
                  <div className="flex items-center gap-1 text-emerald-700">
                    <GraduationCap className="w-3 h-3" />
                    <span>{storyteller.years_of_community_work}+ years</span>
                  </div>
                )}
                {storyteller.geographic_scope && (
                  <div className="flex items-center gap-1 text-emerald-700">
                    <Globe className="w-3 h-3" />
                    <span className="capitalize">{storyteller.geographic_scope}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {storyteller.mentor_availability && (
                  <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-300 touch-target">
                    Mentoring
                  </Badge>
                )}
                {storyteller.speaking_availability && (
                  <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-300 touch-target">
                    Speaking
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer with last active and actions */}
        <div className="flex items-center justify-between pt-4 border-t border-grey-200">
          <div className="text-sm text-grey-500">
            {storyteller.last_active && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Active {formatLastActive(storyteller.last_active)}</span>
              </div>
            )}
          </div>

          {showActions && (
            <Button
              variant="outline"
              size="sm"
              className="text-earth-700 hover:text-earth-800 hover:bg-earth-50 border-earth-200"
              asChild
            >
              <Link href={`/storytellers/${storyteller.id}`}>
                Dashboard
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}