'use client'

import React from 'react'
import { useStorytellerInsights } from '@/lib/hooks/useStorytellerAnalytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3,
  Users,
  Quote,
  TrendingUp,
  Heart,
  MessageSquare,
  Sparkles,
  Network,
  BookOpen,
  Award
} from 'lucide-react'

interface StorytellerAnalyticsDashboardProps {
  storytellerId: string
  className?: string
}

export function StorytellerAnalyticsDashboard({
  storytellerId,
  className
}: StorytellerAnalyticsDashboardProps) {
  const { analytics, themes, quotes, loading, error } = useStorytellerInsights(storytellerId)

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-grey-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-grey-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-grey-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <Typography variant="body">Unable to load analytics</Typography>
            <Typography variant="small" className="text-grey-400">
              {error}
            </Typography>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Impact Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Stories Shared"
          value={analytics?.totalStories || 0}
          icon={<BookOpen className="h-5 w-5" />}
          description="Total stories created"
          colour="blue"
        />

        <MetricCard
          title="Network Connections"
          value={analytics?.connectionCount || 0}
          icon={<Users className="h-5 w-5" />}
          description="Fellow storytellers connected"
          colour="green"
        />

        <MetricCard
          title="Impact Score"
          value={Math.round(analytics?.impactScore || 0)}
          icon={<TrendingUp className="h-5 w-5" />}
          description="Your storytelling impact"
          colour="purple"
          showProgress={true}
          progressValue={(analytics?.impactScore || 0) / 100 * 100}
        />

        <MetricCard
          title="Powerful Quotes"
          value={quotes?.length || 0}
          icon={<Quote className="h-5 w-5" />}
          description="Quotable moments found"
          colour="orange"
        />
      </div>

      {/* Theme Analysis and Quotes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Cloud */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Your Story Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {themes && themes.length > 0 ? (
              <div className="space-y-4">
                {themes.slice(0, 5).map((theme, index) => (
                  <div key={theme.themeId} className="flex items-center justify-between">
                    <div className="flex-1">
                      <Typography variant="body" className="font-medium">
                        {theme.themeName}
                      </Typography>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress
                          value={theme.prominenceScore * 100}
                          className="flex-1 h-2"
                        />
                        <Typography variant="small" className="text-grey-500 min-w-[3rem]">
                          {Math.round(theme.prominenceScore * 100)}%
                        </Typography>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-grey-500 py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <Typography variant="body">No themes analysed yet</Typography>
                <Typography variant="small" className="text-grey-400">
                  Share more stories to see your themes
                </Typography>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quote Gallery */}
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Powerful Quotes
              </CardTitle>
          </CardHeader>
          <CardContent>
            {quotes && quotes.length > 0 ? (
              <div className="space-y-4">
                {quotes.slice(0, 3).map((quote, index) => (
                  <div key={quote.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <blockquote className="text-grey-800 italic mb-2">
                      "{quote.text.length > 120
                        ? `${quote.text.substring(0, 120)}...`
                        : quote.text}"
                    </blockquote>
                    <div className="flex items-center justify-between">
                      <Typography variant="small" className="text-grey-500">
                        From: {quote.sourceTitle}
                      </Typography>
                      <div className="flex items-center gap-2">
                        {quote.themes.slice(0, 2).map(theme => (
                          <Badge key={theme} variant="secondary" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {quote.citationCount > 0 && (
                      <Typography variant="small" className="text-blue-600 mt-1">
                        Cited {quote.citationCount} times
                      </Typography>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-grey-500 py-8">
                <Quote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <Typography variant="body">No quotes found yet</Typography>
                <Typography variant="small" className="text-grey-400">
                  AI will extract powerful moments from your stories
                </Typography>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Storytelling Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
                <Heart className="h-6 w-6" />
              </div>
              <Typography variant="h3" className="text-2xl font-bold text-grey-900">
                {analytics?.engagementScore || 0}
              </Typography>
              <Typography variant="small" className="text-grey-600">
                Engagement Score
              </Typography>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-4">
                <Network className="h-6 w-6" />
              </div>
              <Typography variant="h3" className="text-2xl font-bold text-grey-900">
                {analytics?.primaryThemes?.length || 0}
              </Typography>
              <Typography variant="small" className="text-grey-600">
                Primary Themes
              </Typography>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-full mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <Typography variant="h3" className="text-2xl font-bold text-grey-900">
                {analytics?.totalTranscripts || 0}
              </Typography>
              <Typography variant="small" className="text-grey-600">
                Transcripts Processed
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper component for metric cards
interface MetricCardProps {
  title: string
  value: number
  icon: React.ReactNode
  description: string
  colour: 'blue' | 'green' | 'purple' | 'orange'
  showProgress?: boolean
  progressValue?: number
}

function MetricCard({
  title,
  value,
  icon,
  description,
  colour,
  showProgress,
  progressValue
}: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    purple: 'bg-purple-500 text-white',
    orange: 'bg-orange-500 text-white'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-grey-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[colour]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <Typography variant="h2" className="text-2xl font-bold text-grey-900">
          {value.toLocaleString()}
        </Typography>
        <Typography variant="small" className="text-grey-500">
          {description}
        </Typography>
        {showProgress && progressValue !== undefined && (
          <div className="mt-3">
            <Progress value={progressValue} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
