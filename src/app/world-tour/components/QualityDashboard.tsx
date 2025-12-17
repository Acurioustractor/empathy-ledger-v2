'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  CheckCircle2, XCircle, AlertCircle, FileText, Sparkles,
  Mic, Image, BarChart3, Target, TrendingUp, ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
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

interface QualityData {
  totalStories: number
  totalTranscripts: number
  transcriptsWithStoryteller: number
  withTranscripts: number
  aiAnalyzed: number
  withThemes: number
  withMedia: number
  averageCompleteness: number
  qualityDistribution: Array<{ score: string; count: number }>
  incompleteStories: Array<{ id: string; title: string; missingFields: string[] }>
  averageWordCount: number
  averageThemeCount: number
}

interface QualityDashboardProps {
  data: QualityData | null
  loading?: boolean
}

const QUALITY_COLORS = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e']

export function QualityDashboard({ data, loading }: QualityDashboardProps) {
  const qualityMetrics = useMemo(() => {
    if (!data || data.totalStories === 0) return []
    return [
      {
        label: 'With Transcripts',
        value: data.withTranscripts,
        total: data.totalStories,
        icon: <Mic className="w-4 h-4" />,
        color: 'blue'
      },
      {
        label: 'Analyzed',
        value: data.aiAnalyzed,
        total: data.totalStories,
        icon: <Sparkles className="w-4 h-4" />,
        color: 'purple'
      },
      {
        label: 'With Themes',
        value: data.withThemes,
        total: data.totalStories,
        icon: <Target className="w-4 h-4" />,
        color: 'green'
      },
      {
        label: 'With Media',
        value: data.withMedia,
        total: data.totalStories,
        icon: <Image className="w-4 h-4" />,
        color: 'amber'
      }
    ]
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
      {/* Overall Quality Score */}
      <Card className={cn(
        "border-2",
        data.averageCompleteness >= 80 ? "border-green-200 dark:border-green-900" :
        data.averageCompleteness >= 50 ? "border-amber-200 dark:border-amber-900" :
        "border-red-200 dark:border-red-900"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {data.averageCompleteness >= 80 ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : data.averageCompleteness >= 50 ? (
                <AlertCircle className="w-8 h-8 text-amber-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
              <div>
                <h3 className="font-semibold text-lg">Average Story Completeness</h3>
                <p className="text-sm text-muted-foreground">
                  Based on content, themes, transcripts, analysis, and media
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{data.averageCompleteness}%</div>
              <Badge
                variant="secondary"
                className={cn(
                  data.averageCompleteness >= 80 ? "bg-green-100 text-green-700" :
                  data.averageCompleteness >= 50 ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                )}
              >
                {data.averageCompleteness >= 80 ? 'Excellent' :
                 data.averageCompleteness >= 50 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </div>
          <Progress value={data.averageCompleteness} className="h-3" />
        </CardContent>
      </Card>

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {qualityMetrics.map((metric) => {
          const percentage = metric.total > 0
            ? Math.round((metric.value / metric.total) * 100)
            : 0

          return (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    metric.color === 'blue' && "bg-blue-100 text-blue-600 dark:bg-blue-950",
                    metric.color === 'purple' && "bg-purple-100 text-purple-600 dark:bg-purple-950",
                    metric.color === 'green' && "bg-green-100 text-green-600 dark:bg-green-950",
                    metric.color === 'amber' && "bg-amber-100 text-amber-600 dark:bg-amber-950"
                  )}>
                    {metric.icon}
                  </div>
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    <span className="text-sm text-muted-foreground">/ {metric.total}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <span className="text-xs text-muted-foreground">{percentage}% complete</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quality Distribution & Stats */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quality Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Quality Score Distribution
            </CardTitle>
            <CardDescription>
              How stories are distributed across quality levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.qualityDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="score" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.qualityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={QUALITY_COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Content Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Content Statistics
            </CardTitle>
            <CardDescription>
              Average content metrics across all stories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Average Word Count</span>
                  <Badge variant="secondary">{data.averageWordCount.toLocaleString()} words</Badge>
                </div>
                <Progress
                  value={Math.min((data.averageWordCount / 1000) * 100, 100)}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Target: 500-1000 words for rich storytelling
                </p>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Average Themes per Story</span>
                  <Badge variant="secondary">{data.averageThemeCount} themes</Badge>
                </div>
                <Progress
                  value={Math.min((data.averageThemeCount / 5) * 100, 100)}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Target: 3-5 themes for good categorization
                </p>
              </div>

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Total Interviews (Transcripts)</span>
                  <Badge variant="secondary">{data.totalTranscripts} interviews</Badge>
                </div>
                <Progress
                  value={data.totalStories > 0 ? Math.min((data.transcriptsWithStoryteller / data.totalTranscripts) * 100, 100) : 0}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {data.transcriptsWithStoryteller} linked to storytellers ({data.totalTranscripts > 0 ? Math.round((data.transcriptsWithStoryteller / data.totalTranscripts) * 100) : 0}%)
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">{data.totalStories}</div>
                  <div className="text-xs text-muted-foreground">Total Stories</div>
                </div>
                <div className="text-center p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">{data.totalTranscripts}</div>
                  <div className="text-xs text-muted-foreground">Interviews</div>
                </div>
                <div className="text-center p-3 rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">{data.aiAnalyzed}</div>
                  <div className="text-xs text-muted-foreground">Enriched</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stories Needing Attention */}
      {data.incompleteStories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Stories Needing Attention
            </CardTitle>
            <CardDescription>
              Stories with missing content that could be enriched
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3 pr-4">
                {data.incompleteStories.map((story) => (
                  <div
                    key={story.id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={story.id.startsWith('demo') ? '#' : `/admin/stories/${story.id}`}
                        className="font-medium hover:text-amber-600 line-clamp-1"
                      >
                        {story.title}
                      </Link>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {story.missingFields.map((field) => (
                          <Badge
                            key={field}
                            variant="outline"
                            className="text-xs text-amber-600 border-amber-300"
                          >
                            Missing: {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={story.id.startsWith('demo') ? '#' : `/admin/stories/${story.id}`}>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
