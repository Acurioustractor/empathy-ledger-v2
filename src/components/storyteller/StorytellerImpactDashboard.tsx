'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Eye,
  BookOpen,
  Share2,
  MousePointer,
  TrendingUp,
  TrendingDown,
  Globe,
  Monitor,
  Smartphone,
  Clock,
  BarChart3
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface ImpactData {
  impact: {
    summary: {
      totalViews: number
      totalReads: number
      totalShares: number
      totalActions: number
      avgReadTimeSeconds: number
      avgScrollDepth: number
      viewsTrend: number
    }
    platformBreakdown: Array<{
      platform: string
      views: number
      reads: number
      shares: number
      percentage: number
    }>
    geographicReach: Array<{
      country: string
      views: number
      percentage: number
    }>
    timeSeries: Array<{
      date: string
      views: number
      reads: number
      shares: number
    }>
    topStories: Array<{
      storyId: string
      title: string
      views: number
      shares: number
    }>
  }
  activePlatforms: Array<{
    appId: string
    appName: string
    shareLevel: string
    grantedAt: string
  }>
}

interface StorytellerImpactDashboardProps {
  storytellerId: string
  className?: string
}

const COLORS = ['#5a7c65', '#8b6f4e', '#a8c4b3', '#d4b896', '#708c7a', '#9f8a70']

const PLATFORM_DISPLAY_NAMES: Record<string, string> = {
  justicehub: 'JusticeHub',
  act_place: 'act.place',
  empathy_ledger: 'Empathy Ledger',
  unknown: 'Direct'
}

export function StorytellerImpactDashboard({
  storytellerId,
  className = ''
}: StorytellerImpactDashboardProps) {
  const [data, setData] = useState<ImpactData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    async function fetchImpact() {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/storytellers/${storytellerId}/impact?days=${period}`)
        if (!res.ok) {
          throw new Error('Failed to fetch impact data')
        }
        const impactData = await res.json()
        setData(impactData)
      } catch (err) {
        console.error('Error fetching impact:', err)
        setError('Unable to load impact data')
      } finally {
        setLoading(false)
      }
    }

    fetchImpact()
  }, [storytellerId, period])

  if (loading) {
    return <ImpactSkeleton />
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-stone-500">
          {error || 'No impact data available'}
        </CardContent>
      </Card>
    )
  }

  const { impact, activePlatforms } = data

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-earth-800 dark:text-earth-200">
            Your Story Impact
          </h2>
          <p className="text-stone-500 dark:text-stone-400">
            See how your stories are reaching people
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Eye className="h-5 w-5" />}
          label="Total Views"
          value={impact.summary.totalViews.toLocaleString()}
          trend={impact.summary.viewsTrend}
          color="sage"
        />
        <MetricCard
          icon={<BookOpen className="h-5 w-5" />}
          label="Deep Reads"
          value={impact.summary.totalReads.toLocaleString()}
          color="earth"
        />
        <MetricCard
          icon={<Share2 className="h-5 w-5" />}
          label="Shares"
          value={impact.summary.totalShares.toLocaleString()}
          color="clay"
        />
        <MetricCard
          icon={<Clock className="h-5 w-5" />}
          label="Avg Read Time"
          value={formatReadTime(impact.summary.avgReadTimeSeconds)}
          color="stone"
        />
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Engagement over time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-sage-600" />
              Engagement Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={impact.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12 }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Views"
                    stroke="#5a7c65"
                    fill="#5a7c65"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="reads"
                    name="Deep Reads"
                    stroke="#8b6f4e"
                    fill="#8b6f4e"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Monitor className="h-4 w-4 text-sage-600" />
              Where Your Stories Appear
            </CardTitle>
          </CardHeader>
          <CardContent>
            {impact.platformBreakdown.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="h-[160px] w-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={impact.platformBreakdown}
                        dataKey="views"
                        nameKey="platform"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                      >
                        {impact.platformBreakdown.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => value.toLocaleString()}
                        labelFormatter={(platform) => PLATFORM_DISPLAY_NAMES[platform] || platform}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {impact.platformBreakdown.slice(0, 4).map((platform, index) => (
                    <div key={platform.platform} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{PLATFORM_DISPLAY_NAMES[platform.platform] || platform.platform}</span>
                      </div>
                      <span className="font-medium">{platform.views.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-stone-400">
                No platform data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Geographic reach & Active platforms */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Geographic reach */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-sage-600" />
              Geographic Reach
            </CardTitle>
            <CardDescription>Where people are viewing your stories</CardDescription>
          </CardHeader>
          <CardContent>
            {impact.geographicReach.length > 0 ? (
              <div className="space-y-3">
                {impact.geographicReach.slice(0, 5).map((geo) => (
                  <div key={geo.country} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCountryFlag(geo.country)}</span>
                      <span className="text-sm">{getCountryName(geo.country)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sage-500 rounded-full"
                          style={{ width: `${geo.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-stone-500 w-12 text-right">
                        {geo.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-stone-400">
                Geographic data will appear as your stories get views
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active platforms (consent) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Share2 className="h-4 w-4 text-sage-600" />
              Active Syndication
            </CardTitle>
            <CardDescription>Platforms sharing your stories</CardDescription>
          </CardHeader>
          <CardContent>
            {activePlatforms.length > 0 ? (
              <div className="space-y-3">
                {activePlatforms.map((platform) => (
                  <div key={platform.appId} className="flex items-center justify-between p-2 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                    <div>
                      <p className="font-medium">{platform.appName}</p>
                      <p className="text-xs text-stone-500">
                        Since {new Date(platform.grantedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {platform.shareLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-stone-400">
                No active syndication. Grant consent to share your stories.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top performing stories */}
      {impact.topStories.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Performing Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {impact.topStories.map((story, index) => (
                <div
                  key={story.storyId}
                  className="flex items-center gap-4 p-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50"
                >
                  <span className="text-lg font-bold text-stone-300 w-6">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{story.title}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-stone-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {story.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      {story.shares}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper components

function MetricCard({
  icon,
  label,
  value,
  trend,
  color
}: {
  icon: React.ReactNode
  label: string
  value: string
  trend?: number
  color: 'sage' | 'earth' | 'clay' | 'stone'
}) {
  const colorClasses = {
    sage: 'bg-sage-50 dark:bg-sage-900/20 text-sage-700 dark:text-sage-300',
    earth: 'bg-earth-50 dark:bg-earth-900/20 text-earth-700 dark:text-earth-300',
    clay: 'bg-clay-50 dark:bg-clay-900/20 text-clay-700 dark:text-clay-300',
    stone: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
  }

  return (
    <Card className={colorClasses[color]}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {trend !== undefined && trend !== 0 && (
            <span className={`text-sm flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ImpactSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}

// Utility functions

function formatReadTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
}

function getCountryFlag(code: string): string {
  if (!code || code.length !== 2) return '🌍'
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    AU: 'Australia',
    US: 'United States',
    GB: 'United Kingdom',
    CA: 'Canada',
    NZ: 'New Zealand',
    DE: 'Germany',
    FR: 'France',
    JP: 'Japan',
    IN: 'India',
    BR: 'Brazil'
  }
  return countries[code?.toUpperCase()] || code || 'Unknown'
}

export default StorytellerImpactDashboard
