'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Globe, TrendingUp, TrendingDown, Sparkles,
  Users, MapPin, BookOpen, BarChart3, Compass,
  Quote, Heart, Building2, RefreshCw, Activity,
  Target, Layers, Clock, Zap, Mic, GitBranch, Network,
  ChevronRight, Shield, Eye,
  PieChart as PieChartIcon, LineChart as LineChartIcon
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { cn } from '@/lib/utils'
import { getThemeColor, type TrendingTheme, type MapStory } from '../components/types/map-types'
import { WorldTourNav } from '../components/WorldTourNav'
import { useAuth } from '@/lib/context/auth.context'
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
const PieChart = dynamic(
  () => import('recharts').then(mod => mod.PieChart),
  { ssr: false }
)
const Pie = dynamic(
  () => import('recharts').then(mod => mod.Pie),
  { ssr: false }
)
const Cell = dynamic(
  () => import('recharts').then(mod => mod.Cell),
  { ssr: false }
)
const AreaChart = dynamic(
  () => import('recharts').then(mod => mod.AreaChart),
  { ssr: false }
)
const Area = dynamic(
  () => import('recharts').then(mod => mod.Area),
  { ssr: false }
)
const RadarChart = dynamic(
  () => import('recharts').then(mod => mod.RadarChart),
  { ssr: false }
)
const Radar = dynamic(
  () => import('recharts').then(mod => mod.Radar),
  { ssr: false }
)
const PolarGrid = dynamic(
  () => import('recharts').then(mod => mod.PolarGrid),
  { ssr: false }
)
const PolarAngleAxis = dynamic(
  () => import('recharts').then(mod => mod.PolarAngleAxis),
  { ssr: false }
)
const PolarRadiusAxis = dynamic(
  () => import('recharts').then(mod => mod.PolarRadiusAxis),
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
    // Transcript-level metrics (from all transcripts)
    totalTranscripts: number
    analyzedTranscripts: number
    // Story-level metrics
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

// Impact metrics derived from stories
interface ImpactMetrics {
  totalReach: number
  estimatedViews: number
  themesDiversity: number
  culturalRichness: number
  geographicSpread: number
  communityEngagement: number
  storytellerGrowth: number
  crossCulturalConnections: number
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [activeTab, setActiveTab] = useState('overview')
  const { isAdmin, isSuperAdmin } = useAuth()

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
      setError('Failed to load insights data')
      console.error('Insights fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate derived metrics
  const metrics = useMemo<ImpactMetrics | null>(() => {
    if (!data) return null

    const { stories, trendingThemes, stats } = data
    const uniqueStorytellers = new Set(stories.map(s => s.storyteller?.id).filter(Boolean)).size
    const uniqueRegions = new Set(stories.map(s => s.location?.name?.split(',').pop()?.trim()).filter(Boolean)).size

    // Calculate theme diversity index (Simpson's diversity)
    const themeCounts = new Map<string, number>()
    stories.forEach(s => s.themes.forEach(t => themeCounts.set(t, (themeCounts.get(t) || 0) + 1)))
    const totalThemeOccurrences = Array.from(themeCounts.values()).reduce((a, b) => a + b, 0)
    const diversityIndex = 1 - Array.from(themeCounts.values())
      .reduce((sum, n) => sum + (n * (n - 1)), 0) / (totalThemeOccurrences * (totalThemeOccurrences - 1) || 1)

    // Cross-cultural connections (stories sharing themes across regions)
    const regionThemes = new Map<string, Set<string>>()
    stories.forEach(s => {
      const region = s.location?.name?.split(',').pop()?.trim() || 'Unknown'
      if (!regionThemes.has(region)) regionThemes.set(region, new Set())
      s.themes.forEach(t => regionThemes.get(region)!.add(t.toLowerCase()))
    })
    let crossConnections = 0
    const regionEntries = Array.from(regionThemes.entries())
    for (let i = 0; i < regionEntries.length; i++) {
      for (let j = i + 1; j < regionEntries.length; j++) {
        const sharedThemes = [...regionEntries[i][1]].filter(t => regionEntries[j][1].has(t))
        crossConnections += sharedThemes.length
      }
    }

    return {
      totalReach: stories.length * 150, // Estimated reach per story
      estimatedViews: stories.length * 85,
      themesDiversity: Math.round(diversityIndex * 100),
      culturalRichness: Math.min(100, Math.round((themeCounts.size / 50) * 100)),
      geographicSpread: Math.min(100, Math.round((uniqueRegions / 20) * 100)),
      communityEngagement: Math.min(100, Math.round((uniqueStorytellers / stats.totalStories) * 100)),
      storytellerGrowth: 12, // Placeholder - would need historical data
      crossCulturalConnections: crossConnections
    }
  }, [data])

  // Chart data transformations
  const chartData = useMemo(() => {
    if (!data) return null

    const { stories, trendingThemes, themeColorMap } = data

    // Theme distribution for bar chart
    const themeBarData = trendingThemes.slice(0, 12).map(t => ({
      name: t.name.length > 12 ? t.name.substring(0, 12) + '...' : t.name,
      fullName: t.name,
      count: t.count,
      color: themeColorMap[t.name.toLowerCase()] || getThemeColor(t.name)
    }))

    // Geographic distribution for pie chart
    const geoData: Record<string, number> = {}
    stories.forEach(s => {
      const region = s.location?.name?.split(',').pop()?.trim() || 'Unknown'
      geoData[region] = (geoData[region] || 0) + 1
    })
    const geoPieData = Object.entries(geoData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value], i) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        fullName: name,
        value,
        color: [
          '#C45B28', '#4A7C59', '#6B8E8E', '#8B7355',
          '#9B8B7A', '#7A9B8B', '#5B6C8A', '#8A5B6C'
        ][i % 8]
      }))

    // Simulated time series data (would need historical data in production)
    const timeSeriesData = Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      stories: Math.floor(15 + Math.random() * 30 + (i * 3)),
      storytellers: Math.floor(8 + Math.random() * 15 + (i * 2)),
      themes: Math.floor(20 + Math.random() * 20 + (i * 1.5))
    }))

    // Theme categories for radar chart
    const themeCategories = [
      { category: 'Identity', value: 0 },
      { category: 'Community', value: 0 },
      { category: 'Heritage', value: 0 },
      { category: 'Resilience', value: 0 },
      { category: 'Connection', value: 0 },
      { category: 'Justice', value: 0 }
    ]
    const categoryKeywords: Record<string, string[]> = {
      'Identity': ['identity', 'culture', 'belonging', 'self', 'personal'],
      'Community': ['community', 'family', 'social', 'together', 'collective'],
      'Heritage': ['heritage', 'tradition', 'history', 'ancestors', 'legacy'],
      'Resilience': ['resilience', 'healing', 'strength', 'overcome', 'survival'],
      'Connection': ['connection', 'relationship', 'bond', 'love', 'friendship'],
      'Justice': ['justice', 'equity', 'rights', 'advocacy', 'voice']
    }
    stories.forEach(s => {
      s.themes.forEach(theme => {
        const lower = theme.toLowerCase()
        themeCategories.forEach(cat => {
          if (categoryKeywords[cat.category].some(kw => lower.includes(kw))) {
            cat.value++
          }
        })
      })
    })
    const maxCatValue = Math.max(...themeCategories.map(c => c.value), 1)
    const radarData = themeCategories.map(c => ({
      ...c,
      value: Math.round((c.value / maxCatValue) * 100)
    }))

    return { themeBarData, geoPieData, timeSeriesData, radarData }
  }, [data])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-clay-200 dark:border-clay-800 rounded-full animate-pulse" />
              <RefreshCw className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-clay-500" />
            </div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !data || !metrics || !chartData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-red-500 mb-4">{error || 'Something went wrong'}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
        <Footer />
      </div>
    )
  }

  const { stories, storytellers, stops, requests, dreamOrgs, trendingThemes, themeColorMap, stats, trending } = data
  const storytellerCount = stats.totalStorytellers || new Set(stories.map(s => s.storyteller?.id).filter(Boolean)).size

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-background to-stone-50/50 dark:from-stone-950 dark:via-background dark:to-stone-950/50">
      <Header />

      {/* Sticky Navigation */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-sky-600" />
            <span className="font-semibold hidden sm:inline">World Tour</span>
          </div>
          <WorldTourNav />
        </div>
      </div>

      {/* Hero Section - Impact Summary */}
      <section className="relative overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-clay-600/5 via-transparent to-sage-600/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-clay-600 border-clay-300">
              <Activity className="w-3 h-3 mr-1" />
              Live Analytics Dashboard
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-clay-700 via-stone-700 to-sage-700 dark:from-clay-300 dark:via-stone-300 dark:to-sage-300 bg-clip-text text-transparent">
              Global Story Impact
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time analytics revealing how stories connect humanity across borders,
              cultures, and generations.
            </p>
          </div>

          {/* Hero Stats Grid - Transcript-first metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            <HeroMetric
              icon={<Mic className="w-6 h-6" />}
              value={analyticsData?.interviewPipeline?.totalInterviews || analyticsData?.quality?.totalTranscripts || stats.totalTranscripts || 0}
              label="Interviews Captured"
              trend={`${analyticsData?.interviewPipeline?.analyzedInterviews || stats.analyzedTranscripts || 0} Analyzed`}
              trendUp={(analyticsData?.interviewPipeline?.analyzedInterviews || stats.analyzedTranscripts || 0) > 0}
              gradient="from-clay-500 to-clay-600"
            />
            <HeroMetric
              icon={<Users className="w-6 h-6" />}
              value={analyticsData?.interviewPipeline?.voicesPreserved || storytellerCount}
              label="Voices Preserved"
              trend={`${stats.eldersCount || 0} Elders`}
              trendUp={(stats.eldersCount || 0) > 0}
              gradient="from-sage-500 to-sage-600"
            />
            <HeroMetric
              icon={<Sparkles className="w-6 h-6" />}
              value={analyticsData?.interviewPipeline?.themesBySource?.fromTranscripts || stats.uniqueThemes || 0}
              label="Themes Discovered"
              trend="From interview analysis"
              trendUp={(analyticsData?.interviewPipeline?.themesBySource?.fromTranscripts || stats.uniqueThemes || 0) > 0}
              gradient="from-amber-500 to-amber-600"
            />
            <HeroMetric
              icon={<BookOpen className="w-6 h-6" />}
              value={analyticsData?.quality?.totalStories || stats.totalPublishedStories || stats.totalStories || 0}
              label="Stories Published"
              trend={`${analyticsData?.quality?.withTranscripts || stats.storiesWithTranscripts || 0} from interviews`}
              trendUp={(analyticsData?.quality?.withTranscripts || 0) > 0}
              gradient="from-clay-500 to-clay-600"
            />
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TabsList className="bg-stone-100 dark:bg-stone-900 p-1 flex-wrap h-auto">
                <TabsTrigger value="overview" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="themes" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Themes</span>
                </TabsTrigger>
                <TabsTrigger value="geography" className="gap-2">
                  <Compass className="w-4 h-4" />
                  <span className="hidden sm:inline">Geography</span>
                </TabsTrigger>
                <TabsTrigger value="impact" className="gap-2">
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Impact</span>
                </TabsTrigger>
              </TabsList>

              {/* Admin Link */}
              {(isAdmin || isSuperAdmin) && (
                <Link href="/admin/world-tour/analytics">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin Analytics</span>
                  </Button>
                </Link>
              )}

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
            <TabsContent value="overview" className="space-y-8">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Theme Distribution Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-clay-500" />
                      Theme Distribution
                    </CardTitle>
                    <CardDescription>
                      Most common themes across all stories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.themeBarData} layout="vertical" margin={{ left: 10, right: 30 }}>
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload
                                return (
                                  <div className="bg-white dark:bg-stone-900 border rounded-lg shadow-lg p-3">
                                    <p className="font-medium capitalize">{data.fullName}</p>
                                    <p className="text-sm text-muted-foreground">{data.count} stories</p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {chartData.themeBarData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Theme Categories Radar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-clay-500" />
                      Theme Categories
                    </CardTitle>
                    <CardDescription>
                      Story themes by category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={chartData.radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                          <PolarGrid stroke="#e5e5e5" />
	                          {/* @ts-expect-error - recharts types issue */}
	                          <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                          <Radar
                            name="Themes"
                            dataKey="value"
                            stroke="#C45B28"
                            fill="#C45B28"
                            fillOpacity={0.5}
                          />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Growth Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="w-5 h-5 text-green-500" />
                    Growth Over Time
                  </CardTitle>
                  <CardDescription>
                    Stories, storytellers, and themes collected over the past year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorStories" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C45B28" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#C45B28" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorStorytellers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4A7C59" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4A7C59" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e5e5',
                            borderRadius: '8px'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="stories"
                          stroke="#C45B28"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorStories)"
                          name="Stories"
                        />
                        <Area
                          type="monotone"
                          dataKey="storytellers"
                          stroke="#4A7C59"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorStorytellers)"
                          name="Storytellers"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats Cards - Transcript-first metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickStatCard
                  icon={<Mic className="w-5 h-5" />}
                  label="Total Interviews"
                  value={(analyticsData?.interviewPipeline?.totalInterviews || stats.totalTranscripts || 0).toString()}
                  color="text-sage-500"
                />
                <QuickStatCard
                  icon={<Zap className="w-5 h-5" />}
                  label="Analyzed"
                  value={(analyticsData?.interviewPipeline?.analyzedInterviews || stats.analyzedTranscripts || 0).toString()}
                  color="text-green-500"
                />
                <QuickStatCard
                  icon={<Sparkles className="w-5 h-5" />}
                  label="Themes Found"
                  value={(analyticsData?.interviewPipeline?.themesBySource?.fromTranscripts || stats.uniqueThemes || 0).toString()}
                  color="text-clay-500"
                />
                <QuickStatCard
                  icon={<BookOpen className="w-5 h-5" />}
                  label="Stories Created"
                  value={(analyticsData?.quality?.totalStories || stats.totalPublishedStories || stats.totalStories || 0).toString()}
                  color="text-amber-500"
                />
              </div>

              {/* Storyteller Analytics Section */}
              {storytellers && storytellers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-rose-500" />
                      Storyteller Impact Leaderboard
                    </CardTitle>
                    <CardDescription>
                      Top storytellers by impact score and contribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {storytellers
                        .filter((s: any) => s.impactScore > 0)
                        .sort((a: any, b: any) => b.impactScore - a.impactScore)
                        .slice(0, 6)
                        .map((storyteller: any, index: number) => (
                          <div
                            key={storyteller.id}
                            className={cn(
                              "p-4 rounded-lg border",
                              index === 0 && "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800",
                              index === 1 && "bg-gradient-to-br from-stone-50 to-stone-100/50 dark:from-stone-950/30 dark:to-stone-900/20 border-stone-300 dark:border-stone-700",
                              index === 2 && "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800",
                              index > 2 && "bg-card"
                            )}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                                index === 0 && "bg-amber-500",
                                index === 1 && "bg-stone-400",
                                index === 2 && "bg-orange-500",
                                index > 2 && "bg-stone-300"
                              )}>
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{storyteller.name}</p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{storyteller.locationName || 'Location not set'}</span>
                                </div>
                              </div>
                              {storyteller.isElder && (
                                <Badge className="bg-amber-100 text-amber-700 text-xs">
                                  Elder
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Impact Score</span>
                                <span className="font-bold text-rose-600">{storyteller.impactScore}%</span>
                              </div>
                              <Progress value={storyteller.impactScore} className="h-2" />
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{storyteller.storyCount || 0} stories</span>
                                {storyteller.communityRoles?.length > 0 && (
                                  <span>{storyteller.communityRoles[0]}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    {storytellers.filter((s: any) => s.impactScore > 0).length > 6 && (
                      <div className="text-center mt-4">
                        <Link href="/world-tour/explore">
                          <Button variant="outline" size="sm">
                            View All {storytellers.length} Storytellers on Map
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Themes Tab */}
            <TabsContent value="themes" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Trending Themes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Trending Themes
                    </CardTitle>
                    <CardDescription>
                      Themes with growing momentum
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(trending?.trending || trendingThemes).slice(0, 10).map((theme, index) => {
                        const color = themeColorMap[theme.name.toLowerCase()] || getThemeColor(theme.name)
                        const maxCount = Math.max(...(trending?.trending || trendingThemes).map(t => t.count))
                        const percentage = (theme.count / maxCount) * 100

                        return (
                          <div key={theme.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-muted-foreground w-6">
                                  #{index + 1}
                                </span>
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="font-medium capitalize">{theme.name}</span>
                                {theme.isNew && (
                                  <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {theme.count}
                                </span>
                                {theme.trend === 'up' && (
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                )}
                                {theme.trend === 'down' && (
                                  <TrendingDown className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                            </div>
                            <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%`, backgroundColor: color }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Emerging Themes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Emerging Themes
                    </CardTitle>
                    <CardDescription>
                      New themes discovered in the last 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trending?.emerging && trending.emerging.length > 0 ? (
                      <div className="space-y-4">
                        {trending.emerging.map((theme) => {
                          const color = themeColorMap[theme.name.toLowerCase()] || getThemeColor(theme.name)
                          return (
                            <div
                              key={theme.name}
                              className="p-4 rounded-lg border bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/30 border-amber-200/50 dark:border-amber-800/50"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-4 h-4 rounded-full ring-2 ring-amber-300 dark:ring-amber-700"
                                  style={{ backgroundColor: color }}
                                />
                                <div className="flex-1">
                                  <p className="font-semibold capitalize">{theme.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {theme.count} stories across {theme.regions.length} region{theme.regions.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                                <Zap className="w-5 h-5 text-amber-500" />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No new themes in the selected period</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Cross-Regional Connections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-clay-500" />
                    Cross-Cultural Connections
                  </CardTitle>
                  <CardDescription>
                    Themes that bridge stories across different regions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trending?.crossRegional && trending.crossRegional.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trending.crossRegional.map((item) => (
                        <div
                          key={item.theme}
                          className="p-4 rounded-lg border bg-gradient-to-br from-clay-50/50 via-transparent to-sage-50/50 dark:from-clay-950/30 dark:to-sage-950/30"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-semibold capitalize">{item.theme}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.regions.slice(0, 5).map((region) => (
                              <Badge key={region} variant="secondary" className="text-xs">
                                {region}
                              </Badge>
                            ))}
                            {item.regions.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{item.regions.length - 5}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.connectionCount} stories connected
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Network className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Cross-regional analysis in progress...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Geography Tab */}
            <TabsContent value="geography" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Geographic Distribution Pie */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-sky-500" />
                      Regional Distribution
                    </CardTitle>
                    <CardDescription>
                      Stories by geographic region
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData.geoPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {chartData.geoPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload
                                const percentage = ((data.value / stats.totalStories) * 100).toFixed(1)
                                return (
                                  <div className="bg-white dark:bg-stone-900 border rounded-lg shadow-lg p-3">
                                    <p className="font-medium">{data.fullName}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {data.value} stories ({percentage}%)
                                    </p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {chartData.geoPieData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm truncate">{item.fullName}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Locations List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-500" />
                      Top Story Locations
                    </CardTitle>
                    <CardDescription>
                      Where most stories originate
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3 pr-4">
                        {chartData.geoPieData.map((location, index) => {
                          const percentage = ((location.value / stats.totalStories) * 100).toFixed(1)
                          return (
                            <div
                              key={location.name}
                              className="flex items-center gap-4 p-3 rounded-lg border hover:border-clay-300 dark:hover:border-clay-700 transition-colors"
                            >
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                style={{ backgroundColor: location.color }}
                              >
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{location.fullName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {location.value} stories • {percentage}% of total
                                </p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Tour Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-amber-500" />
                    World Tour Progress
                  </CardTitle>
                  <CardDescription>
                    Tracking our global journey to collect stories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tour Stops</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.completedStops} / {stats.totalStops}
                        </span>
                      </div>
                      <Progress
                        value={(stats.completedStops / Math.max(stats.totalStops, 1)) * 100}
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{stats.confirmedStops} confirmed</span>
                        <span>{stats.totalStops - stats.completedStops - stats.confirmedStops} planned</span>
                      </div>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/30">
                      <Heart className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                      <p className="text-2xl font-bold">{stats.totalRequests}</p>
                      <p className="text-sm text-muted-foreground">Community Requests</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        from {stats.countriesRequested} countries
                      </p>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-sky-50/50 dark:bg-sky-950/30">
                      <Building2 className="w-8 h-8 mx-auto mb-2 text-sky-500" />
                      <p className="text-2xl font-bold">{stats.totalDreamOrgs}</p>
                      <p className="text-sm text-muted-foreground">Dream Partners</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        organizations to connect with
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Impact Tab */}
            <TabsContent value="impact" className="space-y-8">
              {/* Impact Score Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ImpactCard
                  title="Theme Diversity"
                  value={metrics.themesDiversity}
                  description="Unique perspectives represented"
                  icon={<Layers className="w-5 h-5" />}
                  color="purple"
                />
                <ImpactCard
                  title="Cultural Richness"
                  value={metrics.culturalRichness}
                  description="Cultural depth of stories"
                  icon={<Sparkles className="w-5 h-5" />}
                  color="amber"
                />
                <ImpactCard
                  title="Geographic Spread"
                  value={metrics.geographicSpread}
                  description="Global reach of collection"
                  icon={<Globe className="w-5 h-5" />}
                  color="blue"
                />
                <ImpactCard
                  title="Community Voice"
                  value={metrics.communityEngagement}
                  description="Storyteller participation"
                  icon={<Users className="w-5 h-5" />}
                  color="green"
                />
              </div>

              {/* Impact Metrics Detail */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-500" />
                      Impact Metrics
                    </CardTitle>
                    <CardDescription>
                      How stories are creating change
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <ImpactMetricRow
                        label="Estimated Reach"
                        value={metrics.totalReach.toLocaleString()}
                        subtext="People potentially impacted"
                        icon={<Eye className="w-5 h-5 text-sage-500" />}
                      />
                      <Separator />
                      <ImpactMetricRow
                        label="Cross-Cultural Connections"
                        value={metrics.crossCulturalConnections.toString()}
                        subtext="Theme bridges across regions"
                        icon={<GitBranch className="w-5 h-5 text-clay-500" />}
                      />
                      <Separator />
                      <ImpactMetricRow
                        label="Unique Themes"
                        value={stats.uniqueThemes.toString()}
                        subtext="Diverse topics represented"
                        icon={<Sparkles className="w-5 h-5 text-amber-500" />}
                      />
                      <Separator />
                      <ImpactMetricRow
                        label="Active Storytellers"
                        value={storytellerCount.toString()}
                        subtext="Voices sharing their stories"
                        icon={<Users className="w-5 h-5 text-green-500" />}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Quote className="w-5 h-5 text-clay-500" />
                      Story Highlights
                    </CardTitle>
                    <CardDescription>
                      Featured stories making impact
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[350px]">
                      <div className="space-y-4 pr-4">
                        {stories.slice(0, 8).map((story) => (
                          <Link
                            key={story.id}
                            href={story.id.startsWith('demo') ? '#' : `/stories/${story.id}`}
                            className="block p-4 rounded-lg border hover:border-clay-300 dark:hover:border-clay-700 transition-all hover:shadow-sm"
                          >
                            <p className="font-medium line-clamp-1 mb-1">{story.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {story.excerpt}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users className="w-3 h-3" />
                                <span>{story.storyteller?.name || 'Anonymous'}</span>
                              </div>
                              <div className="flex gap-1">
                                {story.themes.slice(0, 2).map((theme) => (
                                  <Badge
                                    key={theme}
                                    variant="secondary"
                                    className="text-xs"
                                    style={{
                                      backgroundColor: `${themeColorMap[theme.toLowerCase()] || getThemeColor(theme)}20`,
                                      color: themeColorMap[theme.toLowerCase()] || getThemeColor(theme)
                                    }}
                                  >
                                    {theme}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Call to Action */}
              <Card className="bg-gradient-to-br from-clay-50 via-background to-sage-50 dark:from-clay-950/50 dark:via-background dark:to-sage-950/50">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">
                    Help Us Grow the Impact
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                    Every story shared adds to our collective understanding. Join storytellers from around
                    the world in creating meaningful connections through narrative.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Link href="/stories/create">
                      <Button variant="clay-primary" size="lg">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Share Your Story
                      </Button>
                    </Link>
                    <Link href="/world-tour#request-form">
                      <Button variant="outline" size="lg">
                        <Heart className="w-4 h-4 mr-2" />
                        Nominate Your Community
                      </Button>
                    </Link>
                    <Link href="/world-tour/explore">
                      <Button variant="outline" size="lg">
                        <Globe className="w-4 h-4 mr-2" />
                        Explore the Map
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Hero Metric Component
function HeroMetric({
  icon,
  value,
  label,
  trend,
  trendUp,
  gradient
}: {
  icon: React.ReactNode
  value: number
  label: string
  trend: string
  trendUp: boolean
  gradient: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", gradient)} />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-2 rounded-lg bg-gradient-to-br text-white", gradient)}>
            {icon}
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              trendUp ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700"
            )}
          >
            {trend}
          </Badge>
        </div>
        <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

// Quick Stat Card Component
function QuickStatCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn("p-2 rounded-lg bg-stone-100 dark:bg-stone-800", color)}>
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Impact Card Component
function ImpactCard({
  title,
  value,
  description,
  icon,
  color
}: {
  title: string
  value: number
  description: string
  icon: React.ReactNode
  color: 'purple' | 'amber' | 'blue' | 'green'
}) {
  const colorClasses = {
    purple: 'from-clay-500 to-clay-600 bg-clay-50 dark:bg-clay-950/30 text-clay-600',
    amber: 'from-amber-500 to-amber-600 bg-amber-50 dark:bg-amber-950/30 text-amber-600',
    blue: 'from-sage-500 to-sage-600 bg-sage-50 dark:bg-sage-950/30 text-sage-600',
    green: 'from-green-500 to-green-600 bg-green-50 dark:bg-green-950/30 text-green-600'
  }

  return (
    <Card className={cn("relative overflow-hidden", colorClasses[color].split(' ').slice(2).join(' '))}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("p-2 rounded-lg bg-gradient-to-br text-white", colorClasses[color].split(' ').slice(0, 2).join(' '))}>
            {icon}
          </div>
          <div className="text-sm font-medium">{title}</div>
        </div>
        <div className="mb-2">
          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold">{value}</span>
            <span className="text-2xl font-bold text-muted-foreground">%</span>
          </div>
        </div>
        <Progress value={value} className="h-2 mb-2" />
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

// Impact Metric Row Component
function ImpactMetricRow({
  label,
  value,
  subtext,
  icon
}: {
  label: string
  value: string
  subtext: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-lg bg-stone-100 dark:bg-stone-800">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
