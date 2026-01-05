'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tag, TrendingUp, BarChart3 } from 'lucide-react'

interface ThemeData {
  theme: string
  count: number
  percentage: number
  trend?: 'up' | 'down' | 'stable'
  growth?: number
}

interface ThemeChartProps {
  organizationId: string
  projectId?: string
}

type ChartType = 'bar' | 'pie' | 'list'
type TimeRange = '7days' | '30days' | '90days' | 'all'

export function ThemeChart({ organizationId, projectId }: ThemeChartProps) {
  const [themes, setThemes] = useState<ThemeData[]>([])
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [timeRange, setTimeRange] = useState<TimeRange>('30days')

  useEffect(() => {
    fetchThemes()
  }, [organizationId, projectId, timeRange])

  const fetchThemes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        organization_id: organizationId,
        time_range: timeRange
      })
      if (projectId) params.set('project_id', projectId)

      const response = await fetch(`/api/analytics/themes?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setThemes(data.themes || [])
      }
    } catch (error) {
      console.error('Failed to fetch theme data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBarColor = (index: number) => {
    const colors = [
      'bg-sage-600',
      'bg-sky-600',
      'bg-amber-600',
      'bg-clay-600',
      'bg-ember-600',
      'bg-sage-500',
      'bg-sky-500',
      'bg-amber-500'
    ]
    return colors[index % colors.length]
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (!trend) return null

    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-sage-600" />
      case 'down':
        return <TrendingUp className="h-3 w-3 text-ember-600 rotate-180" />
      case 'stable':
        return <span className="text-xs text-muted-foreground">—</span>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading theme data...</p>
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(...themes.map(t => t.count), 1)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-amber-600" />
              Theme Distribution
            </CardTitle>
            <CardDescription>
              Most common themes across stories
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 days</SelectItem>
                <SelectItem value="30days">30 days</SelectItem>
                <SelectItem value="90days">90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="pie">Pie</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {themes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Tag className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No Theme Data</p>
            <p className="text-sm mt-1">Stories need to be tagged with themes</p>
          </div>
        ) : chartType === 'bar' ? (
          <div className="space-y-4">
            {themes.map((theme, index) => (
              <div key={theme.theme}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-medium text-sm truncate">{theme.theme}</span>
                    {getTrendIcon(theme.trend)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{theme.count}</span>
                    <Badge variant="outline" className="text-xs">
                      {theme.percentage}%
                    </Badge>
                  </div>
                </div>
                <div className="h-8 bg-muted rounded-full overflow-hidden relative">
                  <div
                    className={`h-full ${getBarColor(index)} transition-all duration-500 flex items-center justify-end px-3`}
                    style={{ width: `${(theme.count / maxCount) * 100}%` }}
                  >
                    {theme.count >= maxCount * 0.2 && (
                      <span className="text-xs font-medium text-white">
                        {theme.count} stories
                      </span>
                    )}
                  </div>
                </div>
                {theme.growth !== undefined && theme.growth !== 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {theme.growth > 0 ? '+' : ''}{theme.growth}% vs previous period
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : chartType === 'pie' ? (
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Pie Chart (SVG) */}
            <div className="flex-shrink-0">
              <svg width="280" height="280" viewBox="0 0 280 280">
                <g transform="translate(140, 140)">
                  {themes.map((theme, index) => {
                    const startAngle = themes
                      .slice(0, index)
                      .reduce((sum, t) => sum + (t.percentage / 100) * 360, 0)
                    const angle = (theme.percentage / 100) * 360
                    const endAngle = startAngle + angle

                    const startRad = (startAngle - 90) * (Math.PI / 180)
                    const endRad = (endAngle - 90) * (Math.PI / 180)

                    const x1 = 100 * Math.cos(startRad)
                    const y1 = 100 * Math.sin(startRad)
                    const x2 = 100 * Math.cos(endRad)
                    const y2 = 100 * Math.sin(endRad)

                    const largeArc = angle > 180 ? 1 : 0

                    const pathData = [
                      `M 0 0`,
                      `L ${x1} ${y1}`,
                      `A 100 100 0 ${largeArc} 1 ${x2} ${y2}`,
                      'Z'
                    ].join(' ')

                    const colors = [
                      '#6B8E72', // sage
                      '#4A90A4', // sky
                      '#D4A373', // amber
                      '#D97757', // clay
                      '#C85A54', // ember
                      '#8BA888',
                      '#6BA4B8',
                      '#E0B589'
                    ]

                    return (
                      <path
                        key={theme.theme}
                        d={pathData}
                        fill={colors[index % colors.length]}
                        stroke="white"
                        strokeWidth="2"
                      />
                    )
                  })}
                </g>
              </svg>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2">
              {themes.map((theme, index) => (
                <div key={theme.theme} className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-sm flex-shrink-0 ${getBarColor(index)}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{theme.theme}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm text-muted-foreground">{theme.count}</span>
                        <Badge variant="outline" className="text-xs">
                          {theme.percentage}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // List view
          <div className="space-y-2">
            {themes.map((theme, index) => (
              <div
                key={theme.theme}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{theme.theme}</div>
                    {theme.growth !== undefined && theme.growth !== 0 && (
                      <div className="text-xs text-muted-foreground">
                        {theme.growth > 0 ? '+' : ''}{theme.growth}% growth
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {getTrendIcon(theme.trend)}
                  <div className="text-right">
                    <div className="font-bold text-lg">{theme.count}</div>
                    <div className="text-xs text-muted-foreground">{theme.percentage}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {themes.length > 0 && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-amber-600" />
              <h4 className="font-medium text-amber-900">Theme Insights</h4>
            </div>
            <div className="text-sm text-amber-800 space-y-1">
              <p>• {themes.length} unique themes identified</p>
              <p>• Top theme: <strong>{themes[0].theme}</strong> ({themes[0].count} stories)</p>
              <p>• Total stories analyzed: {themes.reduce((sum, t) => sum + t.count, 0)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
