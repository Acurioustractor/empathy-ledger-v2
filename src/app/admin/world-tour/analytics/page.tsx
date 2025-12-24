'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  ArrowLeft, Globe, TrendingUp, TrendingDown, Sparkles,
  Users, MapPin, BookOpen, GitBranch, BarChart3, Compass,
  Calendar, Quote, Heart, Building2, RefreshCw, ExternalLink,
  Activity, Target, Layers, Network, Clock, Zap, Award, Mic,
  MessageCircle, Eye, Share2, ChevronRight, Filter, Shield,
  Download, PieChart as PieChartIcon, LineChart as LineChartIcon,
  FileText
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { getThemeColor, type TrendingTheme, type MapStory } from '@/app/world-tour/components/types/map-types'
import { ConsentDashboard } from '@/app/world-tour/components/ConsentDashboard'
import { EngagementDashboard } from '@/app/world-tour/components/EngagementDashboard'
import { QualityDashboard } from '@/app/world-tour/components/QualityDashboard'
import { EquityDashboard } from '@/app/world-tour/components/EquityDashboard'
import { ComparisonView } from '@/app/world-tour/components/ComparisonView'
import { ExportPanel } from '@/app/world-tour/components/ExportPanel'
import { TimelineScrubber } from '@/app/world-tour/components/TimelineScrubber'
import { InterviewPipelineDashboard } from '@/app/world-tour/components/InterviewPipelineDashboard'
import type { AnalyticsData } from '@/app/api/world-tour/analytics/route'

// Dynamic import for charts (client-side only)
const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
  { ssr: false }
)
const BarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  { ssr: false }
)
const Bar = dynamic(
  () => import('recharts').then(mod => mod.Bar),
  { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then(mod => mod.XAxis),
  { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then(mod => mod.YAxis),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import('recharts').then(mod => mod.Tooltip),
  { ssr: false }
)
const Cell = dynamic(
  () => import('recharts').then(mod => mod.Cell),
  { ssr: false }
)

interface InsightsData {
  stories: MapStory[]
  storytellers: any[]
  stops: any[]
  requests: any[]
  dreamOrgs: any[]
  trendingThemes: TrendingTheme[]
  themeColorMap: Record<string, string>
  stats: {
    totalStops: number
    confirmedStops: number
    completedStops: number
    totalRequests: number
    totalDreamOrgs: number
    totalStories: number
    totalStoriesWithoutLocation?: number
    totalPublishedStories?: number
    totalStorytellers: number
    countriesRequested: number
    uniqueThemes: number
    totalTranscripts: number
    analyzedTranscripts: number
    storiesWithTranscripts: number
    eldersCount: number
    featuredStorytellers: number
    averageImpactScore: number
    consentVerifiedStories: number
    publicStories: number
    aiAnalyzedThemes: number
  }
  trending?: {
    trending: TrendingTheme[]
    emerging: TrendingTheme[]
    crossRegional: {
      theme: string
      regions: string[]
      connectionCount: number
      color: string
    }[]
    totalThemes: number
    totalStories: number
    lastUpdated: string
  }
}

export default function AdminWorldTourAnalyticsPage() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [activeTab, setActiveTab] = useState('overview')
  const [dateFilter, setDateFilter] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null })

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [mapResponse, trendingResponse, analyticsResponse] = await Promise.all([
        fetch('/api/world-tour/map-data'),
        fetch(`/api/world-tour/themes/trending?timeRange=${timeRange}`),
        fetch(`/api/world-tour/analytics?timeRange=${timeRange}`)
      ])

      if (!mapResponse.ok) throw new Error('Failed to fetch map data')

      const mapData = await mapResponse.json()
      const trendingData = trendingResponse.ok ? await trendingResponse.json() : null
      const analytics = analyticsResponse.ok ? await analyticsResponse.json() : null

      setData({
        ...mapData,
        trending: trendingData
      })
      setAnalyticsData(analytics)
    } catch (err) {
      setError('Failed to load analytics data')
      console.error('Admin analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setDateFilter({ start, end })
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-stone-200 rounded-full animate-pulse" />
            <RefreshCw className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-stone-500" />
          </div>
          <p className="text-stone-500">Loading World Tour analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500 mb-4">{error || 'Something went wrong'}</p>
        <Button onClick={fetchData}>Try Again</Button>
      </div>
    )
  }

  const { stats } = data
  const storytellerCount = stats.totalStorytellers || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/world-tour" className="text-stone-500 hover:text-stone-700">
              <Globe className="w-5 h-5" />
            </Link>
            <ChevronRight className="w-4 h-4 text-stone-400" />
            <Badge variant="outline" className="text-terracotta-600 border-terracotta-300">
              <Shield className="w-3 h-3 mr-1" />
              Admin Analytics
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">World Tour Analytics</h1>
          <p className="text-stone-500 text-sm mt-1">
            Full analytics dashboard with admin-only metrics and data export
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/world-tour/insights">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Public View
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sage-100 text-sage-600">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalTranscripts}</p>
                <p className="text-xs text-stone-500">Interviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{storytellerCount}</p>
                <p className="text-xs text-stone-500">Storytellers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-clay-100 text-clay-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.uniqueThemes}</p>
                <p className="text-xs text-stone-500">Themes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPublishedStories || stats.totalStories}</p>
                <p className="text-xs text-stone-500">Stories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="bg-stone-100 p-1 flex-wrap h-auto">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <Activity className="w-4 h-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="consent" className="gap-2">
              <Shield className="w-4 h-4" />
              Consent
            </TabsTrigger>
            <TabsTrigger value="quality" className="gap-2">
              <Award className="w-4 h-4" />
              Quality
            </TabsTrigger>
            <TabsTrigger value="equity" className="gap-2">
              <Users className="w-4 h-4" />
              Equity
            </TabsTrigger>
            <TabsTrigger value="engagement" className="gap-2">
              <Eye className="w-4 h-4" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2">
              <GitBranch className="w-4 h-4" />
              Compare
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
              <SelectTrigger className="w-[120px]">
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-sage-200 bg-sage-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-sage-600 font-medium">Analyzed</p>
                    <p className="text-3xl font-bold text-sage-700">{stats.analyzedTranscripts}</p>
                  </div>
                  <Zap className="w-8 h-8 text-sage-400" />
                </div>
                <Progress
                  value={stats.totalTranscripts > 0 ? (stats.analyzedTranscripts / stats.totalTranscripts) * 100 : 0}
                  className="h-2 mt-2"
                />
                <p className="text-xs text-sage-600 mt-1">
                  {stats.totalTranscripts > 0 ? Math.round((stats.analyzedTranscripts / stats.totalTranscripts) * 100) : 0}% of interviews
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Consent Verified</p>
                    <p className="text-3xl font-bold text-green-700">{stats.consentVerifiedStories}</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <Progress
                  value={stats.totalStories > 0 ? (stats.consentVerifiedStories / stats.totalStories) * 100 : 0}
                  className="h-2 mt-2"
                />
                <p className="text-xs text-green-600 mt-1">
                  {stats.totalStories > 0 ? Math.round((stats.consentVerifiedStories / stats.totalStories) * 100) : 0}% of stories
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600 font-medium">Elder Stories</p>
                    <p className="text-3xl font-bold text-amber-700">{stats.eldersCount}</p>
                  </div>
                  <Award className="w-8 h-8 text-amber-400" />
                </div>
                <Progress
                  value={storytellerCount > 0 ? (stats.eldersCount / storytellerCount) * 100 : 0}
                  className="h-2 mt-2"
                />
                <p className="text-xs text-amber-600 mt-1">
                  {storytellerCount > 0 ? Math.round((stats.eldersCount / storytellerCount) * 100) : 0}% of storytellers
                </p>
              </CardContent>
            </Card>

            <Card className="border-clay-200 bg-clay-50/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-clay-600 font-medium">With Transcripts</p>
                    <p className="text-3xl font-bold text-clay-700">{stats.storiesWithTranscripts}</p>
                  </div>
                  <FileText className="w-8 h-8 text-clay-400" />
                </div>
                <Progress
                  value={stats.totalStories > 0 ? (stats.storiesWithTranscripts / stats.totalStories) * 100 : 0}
                  className="h-2 mt-2"
                />
                <p className="text-xs text-clay-600 mt-1">
                  {stats.totalStories > 0 ? Math.round((stats.storiesWithTranscripts / stats.totalStories) * 100) : 0}% of stories
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Location Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                Location Coverage
              </CardTitle>
              <CardDescription>
                Stories and storytellers with geographic data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-stone-50">
                  <p className="text-3xl font-bold text-stone-900">{stats.totalStories}</p>
                  <p className="text-sm text-stone-500">Stories on Map</p>
                  <p className="text-xs text-stone-400 mt-1">With location data</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-stone-50">
                  <p className="text-3xl font-bold text-stone-900">{stats.totalStoriesWithoutLocation || 0}</p>
                  <p className="text-sm text-stone-500">Missing Location</p>
                  <p className="text-xs text-stone-400 mt-1">Need coordinates</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-stone-50">
                  <p className="text-3xl font-bold text-stone-900">{stats.countriesRequested}</p>
                  <p className="text-sm text-stone-500">Countries Requested</p>
                  <p className="text-xs text-stone-400 mt-1">Tour nominations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <InterviewPipelineDashboard
            data={analyticsData?.interviewPipeline || null}
            loading={loading}
          />
        </TabsContent>

        {/* Consent Tab */}
        <TabsContent value="consent" className="space-y-6">
          <ConsentDashboard data={analyticsData?.consent || null} loading={loading} />
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          <QualityDashboard data={analyticsData?.quality || null} loading={loading} />
        </TabsContent>

        {/* Equity Tab */}
        <TabsContent value="equity" className="space-y-6">
          <EquityDashboard data={analyticsData?.equity || null} loading={loading} />
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <EngagementDashboard data={analyticsData?.engagement || null} loading={loading} />
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="space-y-6">
          <ComparisonView data={analyticsData?.comparison || null} loading={loading} />
          <TimelineScrubber
            data={analyticsData?.timeline || null}
            onDateRangeChange={handleDateRangeChange}
          />
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-terracotta-500" />
                Data Export
              </CardTitle>
              <CardDescription>
                Download World Tour analytics data for reporting and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExportPanel analyticsData={analyticsData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
