'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  Eye, Share2, MessageCircle, TrendingUp, BarChart3,
  ArrowUpRight, MapPin, Trophy, Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// Dynamic imports for charts
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
const LineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  { ssr: false }
)
const Line = dynamic(
  () => import('recharts').then(mod => mod.Line),
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
const Legend = dynamic(
  () => import('recharts').then(mod => mod.Legend) as any,
  { ssr: false }
)

interface EngagementData {
  totalViews: number
  totalShares: number
  totalComments: number
  averageViewsPerStory: number
  topViewedStories: Array<{ id: string; title: string; views: number; storyteller: string }>
  engagementTrend: Array<{ date: string; views: number; shares: number; comments: number }>
  engagementByRegion: Array<{ region: string; views: number; shares: number }>
}

interface EngagementDashboardProps {
  data: EngagementData | null
  loading?: boolean
}

export function EngagementDashboard({ data, loading }: EngagementDashboardProps) {
  const totalEngagement = useMemo(() => {
    if (!data) return 0
    return data.totalViews + data.totalShares * 5 + data.totalComments * 10
  }, [data])

  if (loading || !data) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-stone-200 dark:bg-stone-800 rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-stone-100 dark:bg-stone-900 rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Engagement Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <EngagementCard
          icon={<Eye className="w-5 h-5" />}
          label="Total Views"
          value={data.totalViews}
          color="blue"
        />
        <EngagementCard
          icon={<Share2 className="w-5 h-5" />}
          label="Total Shares"
          value={data.totalShares}
          color="green"
        />
        <EngagementCard
          icon={<MessageCircle className="w-5 h-5" />}
          label="Comments"
          value={data.totalComments}
          color="purple"
        />
        <EngagementCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Avg Views/Story"
          value={data.averageViewsPerStory}
          color="amber"
        />
      </div>

      {/* Engagement Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Engagement Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Engagement Trend
            </CardTitle>
            <CardDescription>
              Daily views and shares over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.engagementTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => value.substring(5)}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="Views"
                  />
                  <Line
                    type="monotone"
                    dataKey="shares"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    name="Shares"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Engagement by Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-500" />
              Engagement by Region
            </CardTitle>
            <CardDescription>
              Which regions are most engaged
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.engagementByRegion}
                  layout="vertical"
                  margin={{ left: 10, right: 30 }}
                >
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="region"
                    width={100}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + '...' : value}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="views" fill="#3b82f6" name="Views" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Stories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Performing Stories
          </CardTitle>
          <CardDescription>
            Stories with the highest engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.topViewedStories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No engagement data available yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3 pr-4">
                {data.topViewedStories.map((story, index) => {
                  const maxViews = data.topViewedStories[0]?.views || 1
                  const percentage = (story.views / maxViews) * 100

                  return (
                    <div
                      key={story.id}
                      className="flex items-center gap-4 p-3 rounded-lg border hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm",
                          index === 0 && "bg-amber-500",
                          index === 1 && "bg-stone-400",
                          index === 2 && "bg-orange-500",
                          index > 2 && "bg-stone-300"
                        )}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={story.id.startsWith('demo') ? '#' : `/stories/${story.id}`}
                          className="font-medium hover:text-blue-600 line-clamp-1"
                        >
                          {story.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          by {story.storyteller}
                        </p>
                        <Progress value={percentage} className="h-1 mt-2" />
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-blue-600">
                          <Eye className="w-4 h-4" />
                          <span className="font-bold">{story.views}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">views</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Engagement Score Summary */}
      <Card className="bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/30 dark:via-background dark:to-purple-950/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Total Engagement Score</h3>
              <p className="text-sm text-muted-foreground">
                Weighted score: Views + (Shares x 5) + (Comments x 10)
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">
                {totalEngagement.toLocaleString()}
              </div>
              <Badge variant="secondary" className="mt-1">
                {data.averageViewsPerStory > 50 ? 'High Engagement' :
                 data.averageViewsPerStory > 20 ? 'Growing' : 'Building Momentum'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EngagementCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'blue' | 'green' | 'purple' | 'amber'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600'
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className={cn("inline-flex p-2 rounded-lg mb-2", colorClasses[color])}>
          {icon}
        </div>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}
