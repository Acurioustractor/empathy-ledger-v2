'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookOpen,
  Users,
  Eye,
  Share2,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

interface MetricsOverviewProps {
  organizationId: string
  period: string
}

interface MetricCard {
  label: string
  value: number
  previousValue: number
  trend: 'up' | 'down' | 'neutral'
  trendPercentage: number
  icon: React.ReactNode
  color: string
}

export function MetricsOverview({ organizationId, period }: MetricsOverviewProps) {
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [organizationId, period])

  const loadMetrics = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/analytics/organization/${organizationId}/overview?period=${period}`
      )

      if (!response.ok) {
        throw new Error('Failed to load metrics')
      }

      const data = await response.json()

      // Transform API data into metric cards
      const metricsData: MetricCard[] = [
        {
          label: 'Stories Published',
          value: data.stories_published || 0,
          previousValue: data.previous_stories_published || 0,
          trend: calculateTrend(data.stories_published, data.previous_stories_published),
          trendPercentage: calculatePercentage(data.stories_published, data.previous_stories_published),
          icon: <BookOpen className="h-5 w-5" />,
          color: 'sky'
        },
        {
          label: 'Total Views',
          value: data.total_views || 0,
          previousValue: data.previous_total_views || 0,
          trend: calculateTrend(data.total_views, data.previous_total_views),
          trendPercentage: calculatePercentage(data.total_views, data.previous_total_views),
          icon: <Eye className="h-5 w-5" />,
          color: 'purple'
        },
        {
          label: 'Total Shares',
          value: data.total_shares || 0,
          previousValue: data.previous_total_shares || 0,
          trend: calculateTrend(data.total_shares, data.previous_total_shares),
          trendPercentage: calculatePercentage(data.total_shares, data.previous_total_shares),
          icon: <Share2 className="h-5 w-5" />,
          color: 'green'
        },
        {
          label: 'Total Comments',
          value: data.total_comments || 0,
          previousValue: data.previous_total_comments || 0,
          trend: calculateTrend(data.total_comments, data.previous_total_comments),
          trendPercentage: calculatePercentage(data.total_comments, data.previous_total_comments),
          icon: <MessageCircle className="h-5 w-5" />,
          color: 'amber'
        },
        {
          label: 'Active Storytellers',
          value: data.active_storytellers || 0,
          previousValue: data.previous_active_storytellers || 0,
          trend: calculateTrend(data.active_storytellers, data.previous_active_storytellers),
          trendPercentage: calculatePercentage(data.active_storytellers, data.previous_active_storytellers),
          icon: <Users className="h-5 w-5" />,
          color: 'rose'
        },
        {
          label: 'Engagement Rate',
          value: data.engagement_rate || 0,
          previousValue: data.previous_engagement_rate || 0,
          trend: calculateTrend(data.engagement_rate, data.previous_engagement_rate),
          trendPercentage: calculatePercentage(data.engagement_rate, data.previous_engagement_rate),
          icon: <TrendingUp className="h-5 w-5" />,
          color: 'indigo'
        }
      ]

      setMetrics(metricsData)
    } catch (err) {
      console.error('Error loading metrics:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTrend = (current: number, previous: number): 'up' | 'down' | 'neutral' => {
    if (current > previous) return 'up'
    if (current < previous) return 'down'
    return 'neutral'
  }

  const calculatePercentage = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const formatValue = (value: number, label: string): string => {
    if (label === 'Engagement Rate') {
      return `${value.toFixed(1)}%`
    }
    return value.toLocaleString()
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-500'
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50"
              >
                <div className={`p-3 rounded-lg bg-${metric.color}-100`}>
                  <div className={`text-${metric.color}-600`}>
                    {metric.icon}
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatValue(metric.value, metric.label)}
                  </p>

                  <div className={`flex items-center gap-1 mt-2 text-sm ${getTrendColor(metric.trend)}`}>
                    {getTrendIcon(metric.trend)}
                    <span>
                      {metric.trend === 'up' && '+'}
                      {metric.trendPercentage}%
                    </span>
                    <span className="text-gray-500">vs previous period</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Period Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Total Engagement Actions</span>
              <span className="font-semibold text-gray-900">
                {(metrics.find(m => m.label === 'Total Views')?.value || 0) +
                 (metrics.find(m => m.label === 'Total Shares')?.value || 0) +
                 (metrics.find(m => m.label === 'Total Comments')?.value || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Average Views per Story</span>
              <span className="font-semibold text-gray-900">
                {metrics.find(m => m.label === 'Stories Published')?.value
                  ? Math.round(
                      (metrics.find(m => m.label === 'Total Views')?.value || 0) /
                      (metrics.find(m => m.label === 'Stories Published')?.value || 1)
                    )
                  : 0}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Average Stories per Storyteller</span>
              <span className="font-semibold text-gray-900">
                {metrics.find(m => m.label === 'Active Storytellers')?.value
                  ? (
                      (metrics.find(m => m.label === 'Stories Published')?.value || 0) /
                      (metrics.find(m => m.label === 'Active Storytellers')?.value || 1)
                    ).toFixed(1)
                  : '0.0'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Engagement Rate</span>
              <span className="font-semibold text-gray-900">
                {metrics.find(m => m.label === 'Engagement Rate')?.value.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
