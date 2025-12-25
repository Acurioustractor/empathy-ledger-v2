'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Calendar,
  Eye,
  Share2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Users,
  Quote,
  TrendingUp,
  BarChart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ImpactSparkline, type EngagementDataPoint } from './ImpactSparkline'
import { ThemeNetworkMini, type ThemeNode, type ThemeLink } from './ThemeNetworkMini'
import { QuoteCarousel, type Quote } from './QuoteCarousel'
import { ConnectionPreview, type ConnectionData } from './ConnectionPreview'
import { AIInsightPanel, AIInsightBadge, type AIRecommendation } from './AIInsightPanel'

export interface StorytellerCardProData {
  id: string
  display_name: string
  avatar_url?: string
  profile_tagline?: string
  location?: string
  joined_at?: string

  // Analytics metrics
  total_stories?: number
  total_views?: number
  engagement_score?: number
  impact_score?: number

  // Theme data
  themes?: ThemeNode[]
  theme_links?: ThemeLink[]

  // Engagement time-series
  engagement_history?: EngagementDataPoint[]

  // Quotes
  quotes?: Quote[]

  // Connections
  connections?: ConnectionData[]

  // AI recommendations
  recommendations?: AIRecommendation[]

  // Additional profile data
  bio?: string
  expertise_areas?: string[]
  cultural_affiliations?: string[]
  languages?: string[]
}

export interface StorytellerCardProProps {
  storyteller: StorytellerCardProData
  variant?: 'default' | 'compact' | 'detailed'
  showAnalytics?: boolean
  showThemes?: boolean
  showQuotes?: boolean
  showConnections?: boolean
  showAIInsights?: boolean
  onAcceptRecommendation?: (recommendation: AIRecommendation) => Promise<void>
  onDismissRecommendation?: (recommendationId: string) => void
  onViewProfile?: (storytellerId: string) => void
  className?: string
}

/**
 * StorytellerCardPro - World-class storyteller card with comprehensive analytics
 *
 * Combines all enhanced components:
 * - ImpactSparkline for engagement trends
 * - ThemeNetworkMini for thematic connections
 * - QuoteCarousel for impactful quotes
 * - ConnectionPreview for storyteller connections
 * - AIInsightPanel for AI-powered suggestions
 *
 * Features:
 * - Expandable sections for detailed information
 * - Multiple view variants (default, compact, detailed)
 * - Cultural color palette integration
 * - Responsive design
 * - Interactive elements
 *
 * Usage:
 * <StorytellerCardPro
 *   storyteller={enrichedStorytellerData}
 *   showAnalytics={true}
 *   showThemes={true}
 *   showQuotes={true}
 *   showConnections={true}
 *   showAIInsights={true}
 * />
 */
export function StorytellerCardPro({
  storyteller,
  variant = 'default',
  showAnalytics = true,
  showThemes = true,
  showQuotes = true,
  showConnections = true,
  showAIInsights = true,
  onAcceptRecommendation,
  onDismissRecommendation,
  onViewProfile,
  className
}: StorytellerCardProProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['analytics']))

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently joined'
    const date = new Date(dateString)
    return `Joined ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
  }

  const hasRecommendations = storyteller.recommendations && storyteller.recommendations.length > 0
  const pendingRecommendations = storyteller.recommendations?.filter(r => !r.status || r.status === 'pending') || []

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className={cn('hover:shadow-lg transition-shadow', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
              <AvatarImage src={storyteller.avatar_url} alt={storyteller.display_name} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                {getInitials(storyteller.display_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{storyteller.display_name}</h3>
              {storyteller.profile_tagline && (
                <p className="text-sm text-muted-foreground truncate">{storyteller.profile_tagline}</p>
              )}
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {storyteller.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {storyteller.location}
                  </span>
                )}
                {storyteller.total_stories !== undefined && (
                  <span>{storyteller.total_stories} stories</span>
                )}
              </div>
            </div>

            {hasRecommendations && (
              <AIInsightBadge count={pendingRecommendations.length} />
            )}
          </div>
        </CardHeader>

        <CardFooter className="pt-3">
          <Button
            onClick={() => onViewProfile && onViewProfile(storyteller.id)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            View Profile
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Default and detailed variants
  return (
    <Card className={cn('overflow-hidden hover:shadow-xl transition-shadow', className)}>
      {/* Header with profile info */}
      <CardHeader className="bg-gradient-to-br from-primary/5 to-background pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-4 border-background shadow-lg">
            <AvatarImage src={storyteller.avatar_url} alt={storyteller.display_name} />
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-bold text-lg">
              {getInitials(storyteller.display_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground truncate">{storyteller.display_name}</h2>
                {storyteller.profile_tagline && (
                  <p className="text-sm text-muted-foreground mt-1">{storyteller.profile_tagline}</p>
                )}
              </div>

              {hasRecommendations && (
                <AIInsightBadge count={pendingRecommendations.length} />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              {storyteller.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {storyteller.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(storyteller.joined_at)}
              </span>
            </div>

            {/* Cultural affiliations and languages */}
            {(storyteller.cultural_affiliations || storyteller.languages) && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {storyteller.cultural_affiliations?.slice(0, 2).map((affiliation, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {affiliation}
                  </Badge>
                ))}
                {storyteller.languages?.slice(0, 2).map((language, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {language}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {storyteller.bio && variant === 'detailed' && (
          <p className="text-sm text-foreground mt-4 leading-relaxed">
            {storyteller.bio}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Analytics Overview */}
        {showAnalytics && storyteller.engagement_history && storyteller.engagement_history.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('analytics')}
              className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              <div className="flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                <span>Engagement Analytics</span>
              </div>
              {expandedSections.has('analytics') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedSections.has('analytics') && (
              <div className="bg-muted/20 rounded-lg p-4">
                {/* Key metrics */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {storyteller.total_stories || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Stories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {storyteller.total_views?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {storyteller.impact_score ? Math.round(storyteller.impact_score * 100) : 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Impact</p>
                  </div>
                </div>

                {/* Sparkline */}
                <ImpactSparkline
                  data={storyteller.engagement_history}
                  metric="engagement"
                  height={80}
                  showTrend={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Themes Network */}
        {showThemes && storyteller.themes && storyteller.themes.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('themes')}
              className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Thematic Connections</span>
                <Badge variant="secondary" className="text-xs">{storyteller.themes.length}</Badge>
              </div>
              {expandedSections.has('themes') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedSections.has('themes') && (
              <div className="bg-muted/20 rounded-lg p-4">
                <ThemeNetworkMini
                  themes={storyteller.themes}
                  links={storyteller.theme_links || []}
                  height={200}
                />
              </div>
            )}
          </div>
        )}

        {/* Quotes */}
        {showQuotes && storyteller.quotes && storyteller.quotes.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('quotes')}
              className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4" />
                <span>Notable Quotes</span>
                <Badge variant="secondary" className="text-xs">{storyteller.quotes.length}</Badge>
              </div>
              {expandedSections.has('quotes') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedSections.has('quotes') && (
              <QuoteCarousel quotes={storyteller.quotes} />
            )}
          </div>
        )}

        {/* Connections */}
        {showConnections && storyteller.connections && storyteller.connections.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('connections')}
              className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Storyteller Connections</span>
                <Badge variant="secondary" className="text-xs">{storyteller.connections.length}</Badge>
              </div>
              {expandedSections.has('connections') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedSections.has('connections') && (
              <ConnectionPreview
                connections={storyteller.connections}
                maxDisplay={3}
                showStrength={true}
              />
            )}
          </div>
        )}

        {/* AI Insights */}
        {showAIInsights && hasRecommendations && (
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('ai-insights')}
              className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span>AI-Powered Insights</span>
                <Badge variant="secondary" className="bg-accent/10 text-accent text-xs">
                  {pendingRecommendations.length} new
                </Badge>
              </div>
              {expandedSections.has('ai-insights') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedSections.has('ai-insights') && (
              <AIInsightPanel
                recommendations={storyteller.recommendations || []}
                storytellerId={storyteller.id}
                onAccept={onAcceptRecommendation}
                onDismiss={onDismissRecommendation}
                maxDisplay={3}
              />
            )}
          </div>
        )}
      </CardContent>

      {/* Footer with actions */}
      <CardFooter className="bg-muted/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {storyteller.total_views !== undefined && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {storyteller.total_views.toLocaleString()} views
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={() => onViewProfile && onViewProfile(storyteller.id)}
            size="sm"
          >
            View Full Profile
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

/**
 * StorytellerCardProGrid - Grid layout for multiple cards
 */
export function StorytellerCardProGrid({
  storytellers,
  variant = 'default',
  columns = 3,
  className,
  ...cardProps
}: {
  storytellers: StorytellerCardProData[]
  variant?: 'default' | 'compact' | 'detailed'
  columns?: 1 | 2 | 3 | 4
  className?: string
} & Omit<StorytellerCardProProps, 'storyteller' | 'variant'>) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {storytellers.map((storyteller) => (
        <StorytellerCardPro
          key={storyteller.id}
          storyteller={storyteller}
          variant={variant}
          {...cardProps}
        />
      ))}
    </div>
  )
}
