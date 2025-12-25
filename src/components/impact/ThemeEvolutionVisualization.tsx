'use client'

/**
 * Theme Evolution Visualization Component
 *
 * Shows how themes emerge, evolve, and connect over time using the Empathy Ledger design system.
 * Includes Sankey/Alluvial diagrams, timeline tracking, and semantic shift analysis.
 */

import { useMemo, useState } from 'react'
import {
  Sankey,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts'
import {
  EmpathyCard,
  CardHeader,
  CardContent
} from '@/components/empathy-ledger'
import { EmpathyBadge } from '@/components/empathy-ledger/core/Badge'
import { MetricDisplay, MetricGrid } from '@/components/empathy-ledger/data/MetricDisplay'
import {
  ThemeEvolution,
  ThemeConceptEvolution,
  ThemeStatus
} from '@/lib/database/types/impact-analysis'

export interface ThemeEvolutionVisualizationProps {
  evolutions: ThemeEvolution[]
  conceptEvolutions?: ThemeConceptEvolution[]
  className?: string
  variant?: 'timeline' | 'flow' | 'semantic' | 'full'
  showPredictions?: boolean
}

const STATUS_COLORS: Record<ThemeStatus, string> = {
  emerging: '#10B981',      // Green - new growth
  growing: '#3B82F6',       // Blue - expanding
  stable: '#8B5CF6',        // Purple - established
  declining: '#F59E0B',     // Amber - fading
  dormant: '#6B7280',       // Gray - quiet
  seasonal: '#059669'       // Teal - cyclical
}

const THEME_COLORS = [
  '#D4936A', // Earth
  '#BFA888', // Sand
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#059669', // Teal
  '#EC4899', // Pink
  '#6366F1'  // Indigo
]

export function ThemeEvolutionVisualization({
  evolutions,
  conceptEvolutions = [],
  className,
  variant = 'full',
  showPredictions = false
}: ThemeEvolutionVisualizationProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'all' | '1year' | '6months' | '3months'>('all')

  // Filter by time range
  const filteredEvolutions = useMemo(() => {
    if (timeRange === 'all') return evolutions

    const now = new Date()
    const cutoff = new Date()

    switch (timeRange) {
      case '1year':
        cutoff.setFullYear(now.getFullYear() - 1)
        break
      case '6months':
        cutoff.setMonth(now.getMonth() - 6)
        break
      case '3months':
        cutoff.setMonth(now.getMonth() - 3)
        break
    }

    return evolutions.filter(e => new Date(e.time_period_start) >= cutoff)
  }, [evolutions, timeRange])

  // Group by theme for timeline
  const themeTimelines = useMemo(() => {
    const grouped = new Map<string, ThemeEvolution[]>()

    filteredEvolutions.forEach(evolution => {
      if (!grouped.has(evolution.theme_id)) {
        grouped.set(evolution.theme_id, [])
      }
      grouped.get(evolution.theme_id)!.push(evolution)
    })

    // Sort each theme's evolutions by time
    grouped.forEach((evs, themeId) => {
      grouped.set(
        themeId,
        evs.sort((a, b) =>
          new Date(a.time_period_start).getTime() - new Date(b.time_period_start).getTime()
        )
      )
    })

    return grouped
  }, [filteredEvolutions])

  // Prepare data for timeline chart
  const timelineData = useMemo(() => {
    const data: Array<{
      date: string
      [key: string]: any
    }> = []

    // Get all unique dates
    const dates = new Set<string>()
    filteredEvolutions.forEach(e => {
      const dateStr = new Date(e.time_period_start).toLocaleDateString()
      dates.add(dateStr)
    })

    // For each date, aggregate prominence by theme
    Array.from(dates).sort().forEach(dateStr => {
      const dataPoint: any = { date: dateStr }

      themeTimelines.forEach((evs, themeId) => {
        const evolution = evs.find(e =>
          new Date(e.time_period_start).toLocaleDateString() === dateStr
        )
        if (evolution) {
          dataPoint[themeId] = evolution.prominence_score
        }
      })

      data.push(dataPoint)
    })

    return data
  }, [filteredEvolutions, themeTimelines])

  // Calculate theme statistics
  const themeStats = useMemo(() => {
    const stats = new Map<string, {
      current_status: ThemeStatus
      current_prominence: number
      growth_rate: number
      story_count: number
      is_trending: boolean
      semantic_shift: number
    }>()

    themeTimelines.forEach((evs, themeId) => {
      if (evs.length === 0) return

      const latest = evs[evs.length - 1]
      const previous = evs.length > 1 ? evs[evs.length - 2] : null

      const growthRate = previous
        ? ((latest.prominence_score - previous.prominence_score) / previous.prominence_score) * 100
        : 0

      const totalStories = evs.reduce((sum, e) => sum + e.story_count, 0)

      // Calculate semantic shift from concept evolutions
      const themeConceptEvs = conceptEvolutions.filter(ce => ce.theme_id === themeId)
      const avgSemanticShift = themeConceptEvs.length > 0
        ? themeConceptEvs.reduce((sum, ce) => sum + (ce.semantic_shift || 0), 0) / themeConceptEvs.length
        : 0

      stats.set(themeId, {
        current_status: latest.current_status,
        current_prominence: latest.prominence_score,
        growth_rate: growthRate,
        story_count: totalStories,
        is_trending: latest.current_status === 'growing' && growthRate > 10,
        semantic_shift: avgSemanticShift
      })
    })

    return stats
  }, [themeTimelines, conceptEvolutions])

  // Prepare data for flow diagram (Sankey)
  const flowData = useMemo(() => {
    if (filteredEvolutions.length === 0) return null

    const nodes: Array<{ name: string }> = []
    const links: Array<{ source: number; target: number; value: number }> = []

    // Create nodes for each theme at each time period
    const periods = Array.from(new Set(
      filteredEvolutions.map(e => new Date(e.time_period_start).toLocaleDateString())
    )).sort()

    periods.forEach((period, periodIndex) => {
      themeTimelines.forEach((evs, themeId) => {
        const evolution = evs.find(e =>
          new Date(e.time_period_start).toLocaleDateString() === period
        )
        if (evolution) {
          nodes.push({ name: `${themeId}_${periodIndex}` })
        }
      })
    })

    // Create links between consecutive periods
    themeTimelines.forEach((evs, themeId) => {
      for (let i = 0; i < evs.length - 1; i++) {
        const current = evs[i]
        const next = evs[i + 1]

        const currentPeriod = new Date(current.time_period_start).toLocaleDateString()
        const nextPeriod = new Date(next.time_period_start).toLocaleDateString()

        const currentIndex = nodes.findIndex(n =>
          n.name === `${themeId}_${periods.indexOf(currentPeriod)}`
        )
        const nextIndex = nodes.findIndex(n =>
          n.name === `${themeId}_${periods.indexOf(nextPeriod)}`
        )

        if (currentIndex !== -1 && nextIndex !== -1) {
          links.push({
            source: currentIndex,
            target: nextIndex,
            value: Math.round(next.prominence_score * 100)
          })
        }
      }
    })

    return { nodes, links }
  }, [filteredEvolutions, themeTimelines])

  // Semantic shift scatter data
  const semanticShiftData = useMemo(() => {
    return conceptEvolutions
      .filter(ce => ce.semantic_shift !== undefined && ce.semantic_shift !== null)
      .map(ce => ({
        theme_id: ce.theme_id,
        concept: ce.evolved_concept || ce.original_concept,
        shift: ce.semantic_shift,
        evidence_count: ce.evidence_quotes?.length || 0,
        time: new Date(ce.detected_at).getTime()
      }))
  }, [conceptEvolutions])

  if (variant === 'timeline') {
    return (
      <EmpathyCard className={className}>
        <CardHeader
          title="Theme Evolution Timeline"
          subtitle="Prominence over time"
        />

        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  {Array.from(themeTimelines.keys()).map((themeId, index) => (
                    <linearGradient
                      key={themeId}
                      id={`gradient-${themeId}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={THEME_COLORS[index % THEME_COLORS.length]}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={THEME_COLORS[index % THEME_COLORS.length]}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  ))}
                </defs>

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />

                <YAxis
                  label={{ value: 'Prominence', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null

                    return (
                      <div className="bg-white dark:bg-gray-800 border border-border rounded-lg shadow-lg p-3">
                        <div className="font-medium mb-2">{payload[0].payload.date}</div>
                        {payload.map((p, index) => (
                          <div key={index} className="text-sm flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: p.color }}
                            />
                            <span>{p.name}: {(p.value as number).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />

                {Array.from(themeTimelines.keys()).map((themeId, index) => (
                  <Area
                    key={themeId}
                    type="monotone"
                    dataKey={themeId}
                    stackId="1"
                    stroke={THEME_COLORS[index % THEME_COLORS.length]}
                    fill={`url(#gradient-${themeId})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </EmpathyCard>
    )
  }

  if (variant === 'semantic') {
    return (
      <EmpathyCard className={className}>
        <CardHeader
          title="Semantic Shift Analysis"
          subtitle="How theme meanings evolve"
        />

        <CardContent>
          {semanticShiftData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No semantic shift data available yet
            </p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <XAxis
                    type="number"
                    dataKey="time"
                    name="Time"
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="shift"
                    name="Semantic Shift"
                    tick={{ fontSize: 12 }}
                    domain={[0, 1]}
                  />
                  <ZAxis
                    type="number"
                    dataKey="evidence_count"
                    range={[50, 400]}
                    name="Evidence"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null

                      const data = payload[0].payload

                      return (
                        <div className="bg-white dark:bg-gray-800 border border-border rounded-lg shadow-lg p-3">
                          <div className="font-medium mb-1">{data.concept}</div>
                          <div className="text-sm text-muted-foreground">
                            Shift: {(data.shift * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {data.evidence_count} evidence quotes
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(data.time).toLocaleDateString()}
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Scatter data={semanticShiftData}>
                    {semanticShiftData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={THEME_COLORS[index % THEME_COLORS.length]}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top semantic shifts */}
          {semanticShiftData.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-medium mb-3">Significant Shifts</h4>
              <div className="space-y-2">
                {semanticShiftData
                  .sort((a, b) => b.shift - a.shift)
                  .slice(0, 5)
                  .map((shift, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{shift.concept}</div>
                        <div className="text-xs text-muted-foreground">
                          {shift.evidence_count} supporting quotes
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-primary-600">
                          {(shift.shift * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">shift</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </EmpathyCard>
    )
  }

  return (
    <EmpathyCard variant="insight" className={className}>
      <CardHeader
        title="Theme Evolution Analysis"
        subtitle="How themes emerge, grow, and transform"
      />

      <CardContent>
        {/* Time range selector */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground">Time range:</span>
          <div className="flex gap-2">
            {(['all', '1year', '6months', '3months'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-primary-600 text-white'
                    : 'bg-muted hover:bg-muted/70 text-muted-foreground'
                }`}
              >
                {range === 'all' ? 'All Time' : range.replace('months', 'mo').replace('year', 'yr')}
              </button>
            ))}
          </div>
        </div>

        {/* Key metrics */}
        <MetricGrid
          columns={4}
          metrics={[
            {
              label: 'Active Themes',
              value: themeTimelines.size.toString(),
              description: 'Tracked over time'
            },
            {
              label: 'Emerging',
              value: Array.from(themeStats.values()).filter(s => s.current_status === 'emerging').length.toString(),
              description: 'New themes appearing',
              trend: 'up'
            },
            {
              label: 'Growing',
              value: Array.from(themeStats.values()).filter(s => s.current_status === 'growing').length.toString(),
              description: 'Increasing prominence',
              trend: 'up'
            },
            {
              label: 'Trending',
              value: Array.from(themeStats.values()).filter(s => s.is_trending).length.toString(),
              description: '>10% growth rate'
            }
          ]}
          className="mb-8"
        />

        {/* Timeline chart */}
        <div className="mb-8">
          <h4 className="text-sm font-medium mb-4">Prominence Over Time</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  {Array.from(themeTimelines.keys()).map((themeId, index) => (
                    <linearGradient
                      key={themeId}
                      id={`gradient-${themeId}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={THEME_COLORS[index % THEME_COLORS.length]}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={THEME_COLORS[index % THEME_COLORS.length]}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  ))}
                </defs>

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />

                <YAxis
                  label={{ value: 'Prominence', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null

                    return (
                      <div className="bg-white dark:bg-gray-800 border border-border rounded-lg shadow-lg p-3">
                        <div className="font-medium mb-2">{payload[0].payload.date}</div>
                        {payload.map((p, index) => (
                          <div key={index} className="text-sm flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: p.color }}
                            />
                            <span>{p.name}: {(p.value as number).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />

                {Array.from(themeTimelines.keys()).map((themeId, index) => (
                  <Area
                    key={themeId}
                    type="monotone"
                    dataKey={themeId}
                    stackId="1"
                    stroke={THEME_COLORS[index % THEME_COLORS.length]}
                    fill={`url(#gradient-${themeId})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Theme status breakdown */}
        <div className="mb-8">
          <h4 className="text-sm font-medium mb-4">Theme Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from(themeStats.entries())
              .sort((a, b) => b[1].current_prominence - a[1].current_prominence)
              .map(([themeId, stats]) => (
                <div
                  key={themeId}
                  className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTheme(themeId === selectedTheme ? null : themeId)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm truncate">{themeId}</div>
                      <div className="text-xs text-muted-foreground">
                        {stats.story_count} stories
                      </div>
                    </div>

                    <EmpathyBadge
                      variant="secondary"
                      size="sm"
                      style={{
                        backgroundColor: STATUS_COLORS[stats.current_status],
                        color: 'white'
                      }}
                    >
                      {stats.current_status}
                    </EmpathyBadge>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Prominence</span>
                    <span className="font-semibold">{(stats.current_prominence * 100).toFixed(1)}%</span>
                  </div>

                  {stats.growth_rate !== 0 && (
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-muted-foreground">Growth</span>
                      <span
                        className={`font-semibold ${
                          stats.growth_rate > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stats.growth_rate > 0 ? '+' : ''}{stats.growth_rate.toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {stats.is_trending && (
                    <div className="mt-2 text-xs font-medium text-primary-600">
                      🔥 Trending
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Selected theme details */}
        {selectedTheme && (
          <div className="p-4 bg-primary-50 dark:bg-primary-950/20 rounded-xl border border-primary-200 dark:border-primary-800">
            <h4 className="font-medium mb-3">{selectedTheme} Evolution</h4>

            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={themeTimelines.get(selectedTheme)?.map(e => ({
                    date: new Date(e.time_period_start).toLocaleDateString(),
                    prominence: e.prominence_score,
                    stories: e.story_count
                  }))}
                >
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="prominence"
                    stroke="#D4936A"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Concept evolution for selected theme */}
            {conceptEvolutions.filter(ce => ce.theme_id === selectedTheme).length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2">Concept Evolution</h5>
                <div className="space-y-2">
                  {conceptEvolutions
                    .filter(ce => ce.theme_id === selectedTheme)
                    .map((ce, index) => (
                      <div key={index} className="text-sm bg-white dark:bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-medium">{ce.original_concept}</div>
                          {ce.semantic_shift !== undefined && (
                            <div className="text-xs text-primary-600">
                              {(ce.semantic_shift * 100).toFixed(1)}% shift
                            </div>
                          )}
                        </div>

                        {ce.evolved_concept && ce.evolved_concept !== ce.original_concept && (
                          <div className="text-xs text-muted-foreground mb-2">
                            → {ce.evolved_concept}
                          </div>
                        )}

                        {ce.evolution_narrative && (
                          <div className="text-xs text-muted-foreground italic">
                            {ce.evolution_narrative}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Predictions (if enabled) */}
        {showPredictions && (
          <div className="mt-8 pt-8 border-t border-border">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <span>Predictions</span>
              <EmpathyBadge variant="secondary" size="sm">
                Experimental
              </EmpathyBadge>
            </h4>

            <div className="space-y-2">
              {Array.from(themeStats.entries())
                .filter(([_, stats]) => stats.growth_rate > 20)
                .map(([themeId, stats]) => (
                  <div
                    key={themeId}
                    className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <div className="text-sm">
                      <span className="font-medium">{themeId}</span> likely to become{' '}
                      <span className="font-medium text-primary-600">dominant theme</span> in next period
                      based on {stats.growth_rate.toFixed(1)}% growth rate
                    </div>
                  </div>
                ))}

              {Array.from(themeStats.entries())
                .filter(([_, stats]) => stats.current_status === 'declining' && stats.growth_rate < -30)
                .map(([themeId, stats]) => (
                  <div
                    key={themeId}
                    className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800"
                  >
                    <div className="text-sm">
                      <span className="font-medium">{themeId}</span> may become{' '}
                      <span className="font-medium text-amber-600">dormant</span> soon
                      based on {Math.abs(stats.growth_rate).toFixed(1)}% decline
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </EmpathyCard>
  )
}

// Theme comparison component
export interface ThemeComparisonProps {
  theme1: ThemeEvolution[]
  theme2: ThemeEvolution[]
  theme1Name: string
  theme2Name: string
  className?: string
}

export function ThemeComparison({
  theme1,
  theme2,
  theme1Name,
  theme2Name,
  className
}: ThemeComparisonProps) {
  const comparisonData = useMemo(() => {
    const dates = new Set<string>()

    theme1.forEach(e => dates.add(new Date(e.time_period_start).toLocaleDateString()))
    theme2.forEach(e => dates.add(new Date(e.time_period_start).toLocaleDateString()))

    return Array.from(dates).sort().map(date => {
      const t1 = theme1.find(e => new Date(e.time_period_start).toLocaleDateString() === date)
      const t2 = theme2.find(e => new Date(e.time_period_start).toLocaleDateString() === date)

      return {
        date,
        [theme1Name]: t1?.prominence_score || 0,
        [theme2Name]: t2?.prominence_score || 0
      }
    })
  }, [theme1, theme2, theme1Name, theme2Name])

  return (
    <EmpathyCard className={className}>
      <CardHeader
        title="Theme Comparison"
        subtitle={`${theme1Name} vs ${theme2Name}`}
      />

      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={theme1Name}
                stroke="#D4936A"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey={theme2Name}
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </EmpathyCard>
  )
}
