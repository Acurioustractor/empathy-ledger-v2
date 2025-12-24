'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Globe2,
  Calendar,
  Users,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Video,
  FileText,
  TrendingUp,
  CheckCircle2,
  Plus
} from 'lucide-react'

export interface UnifiedStorytellerCardProps {
  storyteller: {
    id: string
    display_name: string
    bio?: string | null
    location?: string | null
    cultural_background?: string | null
    avatar_url?: string | null

    // Status indicators
    featured: boolean
    elder_status: boolean
    status: 'active' | 'inactive' | 'pending'

    // Content metrics
    story_count: number
    years_of_experience?: number | null
    last_active?: string

    // Organizations and Projects
    organisations?: Array<{
      id: string
      name: string
      role: string
      status?: 'active' | 'completed' | 'paused'
      type?: 'nonprofit' | 'community' | 'government' | 'tribal'
    }>
    projects?: Array<{
      id: string
      name: string
      role: string
      status?: 'active' | 'completed' | 'planning'
      type?: 'cultural' | 'educational' | 'community' | 'research'
    }>

    // Enhanced location context
    traditional_territory?: string | null
    geographic_scope?: 'local' | 'regional' | 'national' | 'international'

    // AI-driven insights
    ai_insights?: {
      profile_completeness: number
      top_themes: Array<{ theme: string; count: number; confidence: number }>
      cultural_markers?: string[]
      suggested_tags: Array<{
        category: string
        value: string
        confidence: number
        evidence_count: number
      }>
      last_analyzed?: string
    }

    // Content stats
    content_stats?: {
      transcripts: number
      stories: number
      videos: number
      analyzed_content: number
    }

    // Enhanced profile fields
    specialties?: string[] | null
    expertise_areas?: string[] | null
    impact_focus_areas?: string[] | null
    community_roles?: string[] | null
    languages?: string[] | null
    cultural_affiliations?: string[] | null

    // Engagement
    followers_count?: number
    engagement_rate?: number
  }
  variant?: 'default' | 'featured' | 'compact' | 'detailed'
  showActions?: boolean
  showAIInsights?: boolean
  showExpandedView?: boolean
  onApplyAISuggestion?: (suggestion: any) => void
  className?: string
}

const organizationTypeColors = {
  nonprofit: 'bg-earth-50 text-earth-700 border-earth-200',
  community: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  government: 'bg-stone-50 text-stone-700 border-stone-200',
  tribal: 'bg-amber-50 text-amber-700 border-amber-200'
}

const projectTypeColors = {
  cultural: 'bg-earth-50 text-earth-700 border-earth-200',
  educational: 'bg-sage-50 text-sage-700 border-sage-200',
  community: 'bg-clay-50 text-clay-700 border-clay-200',
  research: 'bg-stone-50 text-stone-700 border-stone-200'
}

const statusColors = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  completed: 'bg-stone-100 text-stone-600 border-stone-200',
  planning: 'bg-amber-100 text-amber-800 border-amber-200',
  paused: 'bg-orange-100 text-orange-600 border-orange-200'
}

export function UnifiedStorytellerCard({
  storyteller,
  variant = 'default',
  showActions = true,
  showAIInsights = true,
  showExpandedView = false,
  onApplyAISuggestion,
  className
}: UnifiedStorytellerCardProps) {
  const [isExpanded, setIsExpanded] = useState(showExpandedView)
  const [showAllOrganizations, setShowAllOrganizations] = useState(false)
  const [showAllProjects, setShowAllProjects] = useState(false)

  const isCompact = variant === 'compact'
  const isDetailed = variant === 'detailed' || isExpanded
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

  const getProfileCompletenessColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-rose-600'
  }

  const renderLocationContext = () => {
    if (!storyteller.location && !storyteller.traditional_territory) return null

    return (
      <div className="flex flex-col gap-1">
        {storyteller.location && (
          <div className="flex items-center gap-1 text-sm text-stone-600">
            <MapPin className="w-3 h-3" />
            <span>{storyteller.location}</span>
            {storyteller.geographic_scope && (
              <Badge variant="outline" className="text-xs ml-1 touch-target">
                {storyteller.geographic_scope}
              </Badge>
            )}
          </div>
        )}
        {storyteller.traditional_territory && (
          <div className="flex items-center gap-1 text-sm text-earth-600">
            <Globe2 className="w-3 h-3" />
            <span className="font-medium">Traditional Territory: {storyteller.traditional_territory}</span>
          </div>
        )}
      </div>
    )
  }

  const renderOrganizationsAndProjects = () => {
    const visibleOrgs = showAllOrganizations
      ? storyteller.organisations
      : storyteller.organisations?.slice(0, isCompact ? 1 : 2)

    const visibleProjects = showAllProjects
      ? storyteller.projects
      : storyteller.projects?.slice(0, isCompact ? 1 : 2)

    const totalAffiliations = (storyteller.organisations?.length || 0) + (storyteller.projects?.length || 0)

    if (totalAffiliations === 0) return null

    return (
      <div className="space-y-3">
        {/* Organizations */}
        {visibleOrgs && visibleOrgs.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Building2 className="w-4 h-4 text-earth-600" />
              <Typography variant="small" className="text-stone-600 font-medium">
                Organizations
              </Typography>
            </div>
            <div className="flex flex-wrap gap-1">
              {visibleOrgs.map((org, index) => (
                <div key={`org-${index}`} className="flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs touch-target",
                      organizationTypeColors[org.type || 'community']
                    )}
                  >
                    {org.name}
                  </Badge>
                  {org.status && (
                    <Badge
                      variant="outline"
                      className={cn("text-xs touch-target", statusColors[org.status])}
                    >
                      {org.status}
                    </Badge>
                  )}
                  {isDetailed && (
                    <span className="text-xs text-stone-500">({org.role})</span>
                  )}
                </div>
              ))}
              {!showAllOrganizations && (storyteller.organisations?.length || 0) > (isCompact ? 1 : 2) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllOrganizations(true)}
                  className="text-xs h-auto p-1"
                >
                  +{(storyteller.organisations?.length || 0) - (isCompact ? 1 : 2)} more
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Projects */}
        {visibleProjects && visibleProjects.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <Typography variant="small" className="text-stone-600 font-medium">
                Projects
              </Typography>
            </div>
            <div className="flex flex-wrap gap-1">
              {visibleProjects.map((project, index) => (
                <div key={`project-${index}`} className="flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs touch-target",
                      projectTypeColors[project.type || 'community']
                    )}
                  >
                    {project.name}
                  </Badge>
                  {project.status && (
                    <Badge
                      variant="outline"
                      className={cn("text-xs touch-target", statusColors[project.status])}
                    >
                      {project.status}
                    </Badge>
                  )}
                  {isDetailed && (
                    <span className="text-xs text-stone-500">({project.role})</span>
                  )}
                </div>
              ))}
              {!showAllProjects && (storyteller.projects?.length || 0) > (isCompact ? 1 : 2) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllProjects(true)}
                  className="text-xs h-auto p-1"
                >
                  +{(storyteller.projects?.length || 0) - (isCompact ? 1 : 2)} more
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderAIInsights = () => {
    if (!showAIInsights || !storyteller.ai_insights) return null

    const { profile_completeness, top_themes, suggested_tags, cultural_markers } = storyteller.ai_insights

    return (
      <div className="space-y-3 p-3 bg-gradient-to-r from-warm-50 to-accent/10 rounded-lg border border-accent/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <Typography variant="small" className="text-accent-foreground font-medium">
              AI Insights
            </Typography>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-stone-600">Profile:</span>
            <span className={cn("text-xs font-medium", getProfileCompletenessColor(profile_completeness))}>
              {profile_completeness}% complete
            </span>
          </div>
        </div>

        {/* Top Themes */}
        {top_themes && top_themes.length > 0 && (
          <div>
            <Typography variant="small" className="text-stone-600 mb-1">
              Story Themes:
            </Typography>
            <div className="flex flex-wrap gap-1">
              {top_themes.slice(0, 3).map((theme, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-earth-50 text-earth-700 border-earth-200 touch-target"
                >
                  {theme.theme}
                  <span className="ml-1 text-earth-600">({theme.count})</span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Cultural Markers */}
        {cultural_markers && cultural_markers.length > 0 && (
          <div>
            <Typography variant="small" className="text-stone-600 mb-1">
              Cultural Markers:
            </Typography>
            <div className="flex flex-wrap gap-1">
              {cultural_markers.slice(0, 2).map((marker, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-earth-50 text-earth-700 border-earth-200 touch-target"
                >
                  {marker}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Tags */}
        {suggested_tags && suggested_tags.length > 0 && isDetailed && (
          <div>
            <Typography variant="small" className="text-stone-600 mb-2">
              AI Suggestions:
            </Typography>
            <div className="space-y-1">
              {suggested_tags.slice(0, 2).map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 touch-target">
                      {suggestion.category}: {suggestion.value}
                    </Badge>
                    <span className="text-stone-500">
                      {suggestion.confidence}% confidence
                    </span>
                  </div>
                  {onApplyAISuggestion && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onApplyAISuggestion(suggestion)}
                      className="h-auto p-1"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderContentStats = () => {
    if (!storyteller.content_stats) return null

    const { transcripts, stories, videos, analyzed_content } = storyteller.content_stats

    return (
      <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-sm text-stone-600">
            <FileText className="w-4 h-4" />
            <span>Transcripts</span>
          </div>
          <div className="text-lg font-semibold text-stone-900">{transcripts}</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-sm text-stone-600">
            <BookOpen className="w-4 h-4" />
            <span>Stories</span>
          </div>
          <div className="text-lg font-semibold text-stone-900">{stories}</div>
        </div>

        {(videos > 0 || analyzed_content > 0) && (
          <>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-stone-600">
                <Video className="w-4 h-4" />
                <span>Videos</span>
              </div>
              <div className="text-lg font-semibold text-stone-900">{videos}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-stone-600">
                <Lightbulb className="w-4 h-4" />
                <span>AI Analyzed</span>
              </div>
              <div className="text-lg font-semibold text-stone-900">{analyzed_content}</div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <Card
      className={cn(
        'group transition-all duration-300 hover:shadow-lg overflow-hidden bg-white border border-stone-200',
        'rounded-lg relative',
        isFeatured && 'ring-2 ring-amber-200',
        isElder && 'ring-2 ring-purple-200',
        !isActive && 'opacity-80',
        className
      )}
    >
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Link href={`/storytellers/${storyteller.id}`}>
            <Avatar className="w-16 h-16 ring-2 ring-offset-2 ring-stone-200">
              <AvatarImage src={storyteller.avatar_url || undefined} />
              <AvatarFallback className="bg-earth-100 text-earth-700 text-lg font-semibold">
                {getInitials(storyteller.display_name)}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/storytellers/${storyteller.id}`}>
                  <Typography
                    variant="h3"
                    className="text-stone-900 font-bold group-hover:text-earth-700 transition-colours cursor-pointer"
                  >
                    {storyteller.display_name}
                  </Typography>
                </Link>

                {/* Location Context */}
                {renderLocationContext()}
              </div>

              {/* Status badges */}
              <div className="flex flex-col gap-1">
                {isFeatured && (
                  <Badge className="bg-amber-100 text-amber-800 text-xs font-medium touch-target">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {isElder && (
                  <Badge className="bg-clay-100 text-clay-800 text-xs font-medium touch-target">
                    <Crown className="w-3 h-3 mr-1" />
                    Elder
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Bio */}
        {storyteller.bio && !isCompact && (
          <Typography variant="body" className="text-stone-700 leading-relaxed text-sm">
            {isDetailed ? storyteller.bio : truncateBio(storyteller.bio)}
          </Typography>
        )}

        {/* Content Statistics */}
        {storyteller.content_stats && !isCompact && renderContentStats()}

        {/* Organizations and Projects */}
        {renderOrganizationsAndProjects()}

        {/* AI Insights */}
        {renderAIInsights()}

        {/* Cultural Affiliations and Languages */}
        {isDetailed && (storyteller.cultural_affiliations?.length || storyteller.languages?.length) && (
          <div className="space-y-3">
            {storyteller.cultural_affiliations && storyteller.cultural_affiliations.length > 0 && (
              <div>
                <Typography variant="small" className="text-stone-600 font-medium mb-2">
                  Cultural Affiliations:
                </Typography>
                <div className="flex flex-wrap gap-1">
                  {storyteller.cultural_affiliations.map((affiliation, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-sage-50 text-sage-700 border-sage-200 touch-target"
                    >
                      {affiliation}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {storyteller.languages && storyteller.languages.length > 0 && (
              <div>
                <Typography variant="small" className="text-stone-600 font-medium mb-2">
                  Languages:
                </Typography>
                <div className="flex flex-wrap gap-1">
                  {storyteller.languages.map((language, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs bg-clay-50 text-clay-700 border-clay-200 touch-target"
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-earth-600" />
              <Typography variant="small" className="text-stone-700 font-medium">
                {storyteller.story_count} {storyteller.story_count === 1 ? 'story' : 'stories'}
              </Typography>
            </div>

            {storyteller.last_active && (
              <div className="flex items-center gap-1 text-sm text-stone-500">
                <Calendar className="w-3 h-3" />
                <span>Active {formatLastActive(storyteller.last_active)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isCompact && variant !== 'detailed' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-earth-700 hover:text-earth-800"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            )}

            {showActions && (
              <Button
                variant="outline"
                size="sm"
                className="text-earth-700 hover:text-earth-800 hover:bg-earth-50 border-earth-200"
                asChild
              >
                <Link href={`/storytellers/${storyteller.id}`}>
                  Dashboard
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}