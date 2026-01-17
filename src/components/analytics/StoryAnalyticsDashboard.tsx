'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetricCard } from '@/components/ui/metric-card'
import {
  Eye,
  Clock,
  Heart,
  Share2,
  MessageSquare,
  Globe,
  TrendingUp,
  Users,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ExternalLink,
  Loader2
} from 'lucide-react'

interface StoryAnalytics {
  storyId: string
  title: string
  status: string
  publishedAt?: string

  // Engagement metrics
  totalViews: number
  uniqueViewers: number
  avgReadTime: number // seconds
  completionRate: number // percentage

  // Social metrics
  likes: number
  shares: number
  comments: number
  bookmarks: number

  // Syndication metrics
  syndicatedTo: number
  embedViews: number
  externalClickThroughs: number

  // Trends (vs previous period)
  viewsTrend: number
  engagementTrend: number

  // View sources
  viewSources: {
    direct: number
    search: number
    social: number
    syndicated: number
    other: number
  }

  // Top referrers
  topReferrers: Array<{
    domain: string
    views: number
    percentage: number
  }>

  // Reader demographics (aggregated, anonymized)
  readerLocations: Array<{
    country: string
    views: number
    percentage: number
  }>

  // Engagement over time
  dailyViews: Array<{
    date: string
    views: number
    uniqueViewers: number
  }>
}

interface StoryAnalyticsDashboardProps {
  storyId: string
  initialData?: StoryAnalytics
}

export function StoryAnalyticsDashboard({ storyId, initialData }: StoryAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<StoryAnalytics | null>(initialData || null)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    if (!initialData) {
      fetchAnalytics()
    }
  }, [storyId, timeRange])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/stories/${storyId}/analytics?range=${timeRange}`)

      if (!response.ok) {
        if (response.status === 404) {
          // No analytics yet - show empty state
          setAnalytics({
            storyId,
            title: 'Story',
            status: 'draft',
            totalViews: 0,
            uniqueViewers: 0,
            avgReadTime: 0,
            completionRate: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            bookmarks: 0,
            syndicatedTo: 0,
            embedViews: 0,
            externalClickThroughs: 0,
            viewsTrend: 0,
            engagementTrend: 0,
            viewSources: { direct: 0, search: 0, social: 0, syndicated: 0, other: 0 },
            topReferrers: [],
            readerLocations: [],
            dailyViews: []
          })
          return
        }
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const TrendIndicator = ({ value }: { value: number }) => {
    if (value > 0) {
      return (
        <span className="flex items-center text-green-600 text-sm">
          <ArrowUpRight className="h-4 w-4" />
          {formatPercentage(value)}
        </span>
      )
    }
    if (value < 0) {
      return (
        <span className="flex items-center text-red-600 text-sm">
          <ArrowDownRight className="h-4 w-4" />
          {formatPercentage(value)}
        </span>
      )
    }
    return <span className="text-muted-foreground text-sm">No change</span>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">Error: {error}</p>
          <Button onClick={fetchAnalytics} variant="outline" className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No analytics data available yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Analytics will appear once your story is published and receives views.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{analytics.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">
              {analytics.status}
            </Badge>
            {analytics.publishedAt && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Published {new Date(analytics.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === 'all' ? 'All Time' : range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views"
          value={formatNumber(analytics.totalViews)}
          description={<TrendIndicator value={analytics.viewsTrend} />}
          icon={Eye}
          variant="stories"
        />
        <MetricCard
          title="Unique Readers"
          value={formatNumber(analytics.uniqueViewers)}
          description="Individual visitors"
          icon={Users}
          variant="storytellers"
        />
        <MetricCard
          title="Avg. Read Time"
          value={formatDuration(analytics.avgReadTime)}
          description={`${analytics.completionRate.toFixed(0)}% completion rate`}
          icon={Clock}
          variant="community"
        />
        <MetricCard
          title="Engagement"
          value={formatNumber(analytics.likes + analytics.shares + analytics.comments)}
          description={<TrendIndicator value={analytics.engagementTrend} />}
          icon={Heart}
          variant="stories"
        />
      </div>

      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engagement" className="gap-2">
            <Heart className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="sources" className="gap-2">
            <Globe className="h-4 w-4" />
            Traffic Sources
          </TabsTrigger>
          <TabsTrigger value="syndication" className="gap-2">
            <Share2 className="h-4 w-4" />
            Syndication
          </TabsTrigger>
        </TabsList>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">Likes</span>
                </div>
                <p className="text-2xl font-bold mt-1">{formatNumber(analytics.likes)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Shares</span>
                </div>
                <p className="text-2xl font-bold mt-1">{formatNumber(analytics.shares)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Comments</span>
                </div>
                <p className="text-2xl font-bold mt-1">{formatNumber(analytics.comments)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Bookmarks</span>
                </div>
                <p className="text-2xl font-bold mt-1">{formatNumber(analytics.bookmarks)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Completion Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reading Completion</CardTitle>
              <CardDescription>How much of the story readers complete on average</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion Rate</span>
                  <span className="font-medium">{analytics.completionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(analytics.completionRate, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* View Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Traffic Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.viewSources).map(([source, count]) => {
                    const total = Object.values(analytics.viewSources).reduce((a, b) => a + b, 0)
                    const percentage = total > 0 ? (count / total) * 100 : 0
                    return (
                      <div key={source} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{source}</span>
                          <span className="font-medium">{formatNumber(count)} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Referrers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Top Referrers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.topReferrers.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topReferrers.slice(0, 5).map((referrer, index) => (
                      <div key={referrer.domain} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {index + 1}.
                          </span>
                          <span className="text-sm">{referrer.domain}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatNumber(referrer.views)} ({referrer.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No referrer data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reader Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Reader Locations
              </CardTitle>
              <CardDescription>Aggregated, anonymized geographic data</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.readerLocations.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analytics.readerLocations.slice(0, 8).map((location) => (
                    <div key={location.country} className="text-center p-3 rounded-lg bg-muted">
                      <p className="font-medium">{location.country}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(location.views)} views
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No location data yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Syndication Tab */}
        <TabsContent value="syndication" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Syndicated To</span>
                </div>
                <p className="text-2xl font-bold mt-1">{analytics.syndicatedTo}</p>
                <p className="text-xs text-muted-foreground mt-1">external sites</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Embed Views</span>
                </div>
                <p className="text-2xl font-bold mt-1">{formatNumber(analytics.embedViews)}</p>
                <p className="text-xs text-muted-foreground mt-1">via embed tokens</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Click-Throughs</span>
                </div>
                <p className="text-2xl font-bold mt-1">{formatNumber(analytics.externalClickThroughs)}</p>
                <p className="text-xs text-muted-foreground mt-1">to full story</p>
              </CardContent>
            </Card>
          </div>

          {analytics.syndicatedTo === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Share2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Not Yet Syndicated</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your story on external platforms to track syndication analytics.
                </p>
                <Button variant="outline" asChild>
                  <a href="/admin/syndication">
                    Go to Syndication Dashboard
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
