'use client'

import React from 'react'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EngagementDataPoint {
  date: string
  period_start: string
  period_end: string
  engagement_score: number
  impact_score?: number
  story_views?: number
  story_shares?: number
  stories_created?: number
  connections_made?: number
}

export interface ImpactSparklineProps {
  data: EngagementDataPoint[]
  metric?: 'engagement' | 'impact' | 'views' | 'shares'
  height?: number
  showTrend?: boolean
  showTooltip?: boolean
  className?: string
}

/**
 * ImpactSparkline - Mini time-series visualization showing storyteller engagement/impact trends
 *
 * Features:
 * - Compact sparkline visualization using Recharts
 * - Multiple metrics: engagement_score, impact_score, views, shares
 * - Trend indicator (up, down, stable)
 * - Gradient fill for visual appeal
 * - Responsive design
 * - Cultural color palette integration
 *
 * Usage:
 * <ImpactSparkline
 *   data={engagementHistory}
 *   metric="engagement"
 *   showTrend={true}
 * />
 */
export function ImpactSparkline({
  data,
  metric = 'engagement',
  height = 60,
  showTrend = true,
  showTooltip = true,
  className
}: ImpactSparklineProps) {
  // Guard against empty or invalid data
  if (!data || data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-xs text-muted-foreground">No data available</p>
      </div>
    )
  }

  // Determine which metric to display
  const getMetricValue = (point: EngagementDataPoint): number => {
    switch (metric) {
      case 'engagement':
        return point.engagement_score || 0
      case 'impact':
        return point.impact_score || 0
      case 'views':
        return point.story_views || 0
      case 'shares':
        return point.story_shares || 0
      default:
        return point.engagement_score || 0
    }
  }

  // Calculate trend direction
  const calculateTrend = (): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable'

    const recentData = data.slice(-5) // Last 5 data points
    const values = recentData.map(getMetricValue)

    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100

    if (changePercent > 5) return 'up'
    if (changePercent < -5) return 'down'
    return 'stable'
  }

  const trend = calculateTrend()

  // Prepare chart data
  const chartData = data.map((point) => ({
    date: new Date(point.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: getMetricValue(point),
    fullDate: point.period_start,
    ...point
  }))

  // Get color based on trend
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#10B981' // green-500
      case 'down':
        return '#EF4444' // red-500
      case 'stable':
        return '#F59E0B' // amber-500
    }
  }

  const color = getTrendColor()

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null

    const data = payload[0].payload
    const metricLabel = {
      engagement: 'Engagement Score',
      impact: 'Impact Score',
      views: 'Story Views',
      shares: 'Story Shares'
    }[metric]

    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-foreground mb-1">{data.date}</p>
        <p className="text-muted-foreground">
          {metricLabel}: <span className="font-bold text-foreground">{data.value.toLocaleString()}</span>
        </p>
        {data.stories_created > 0 && (
          <p className="text-muted-foreground">
            Stories: <span className="font-semibold">{data.stories_created}</span>
          </p>
        )}
        {data.connections_made > 0 && (
          <p className="text-muted-foreground">
            Connections: <span className="font-semibold">{data.connections_made}</span>
          </p>
        )}
      </div>
    )
  }

  // Get current value (latest data point)
  const currentValue = getMetricValue(data[data.length - 1])

  return (
    <div className={cn('relative', className)}>
      {/* Trend indicator */}
      {showTrend && (
        <div className="absolute top-0 right-0 z-10 flex items-center gap-1 text-xs font-medium">
          {trend === 'up' && (
            <>
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">Growing</span>
            </>
          )}
          {trend === 'down' && (
            <>
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-red-600 dark:text-red-400">Declining</span>
            </>
          )}
          {trend === 'stable' && (
            <>
              <Minus className="w-4 h-4 text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400">Stable</span>
            </>
          )}
        </div>
      )}

      {/* Current value display */}
      <div className="absolute top-0 left-0 z-10">
        <p className="text-2xl font-bold" style={{ color }}>
          {currentValue.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          {metric === 'engagement' && 'Engagement'}
          {metric === 'impact' && 'Impact'}
          {metric === 'views' && 'Views'}
          {metric === 'shares' && 'Shares'}
        </p>
      </div>

      {/* Sparkline chart */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 35, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            hide
          />
          <YAxis hide domain={['auto', 'auto']} />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${metric})`}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Compact variant - Ultra-minimal sparkline without labels
 */
export function ImpactSparklineCompact({
  data,
  metric = 'engagement',
  height = 30,
  className
}: Omit<ImpactSparklineProps, 'showTrend' | 'showTooltip'>) {
  if (!data || data.length === 0) {
    return <div className={cn('bg-muted/20 rounded', className)} style={{ height }} />
  }

  const getMetricValue = (point: EngagementDataPoint): number => {
    switch (metric) {
      case 'engagement': return point.engagement_score || 0
      case 'impact': return point.impact_score || 0
      case 'views': return point.story_views || 0
      case 'shares': return point.story_shares || 0
      default: return point.engagement_score || 0
    }
  }

  const chartData = data.map((point) => ({
    value: getMetricValue(point)
  }))

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradient-compact" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#667eea" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke="#667eea"
          strokeWidth={1.5}
          fill="url(#gradient-compact)"
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
