'use client'

/**
 * Story Arc Visualization Component
 *
 * Displays the emotional journey of a story using the Empathy Ledger design system.
 * Shows trajectory, arc type, and key moments with beautiful, accessible visualization.
 */

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  ReferenceDot
} from 'recharts'
import {
  EmpathyCard,
  CardHeader,
  CardContent
} from '@/components/empathy-ledger'
import { EmpathyBadge } from '@/components/empathy-ledger/core/Badge'
import { MetricDisplay } from '@/components/empathy-ledger/data/MetricDisplay'
import {
  StoryNarrativeArc,
  ArcType
} from '@/lib/database/types/impact-analysis'
import { getArcDescription } from '@/services/narrative-analysis'

export interface StoryArcVisualizationProps {
  arc: StoryNarrativeArc
  storyTitle?: string
  className?: string
  showMetrics?: boolean
  showDescription?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

const ARC_TYPE_COLORS: Record<ArcType, string> = {
  rags_to_riches: '#10B981', // Green - hope
  tragedy: '#6B7280',         // Gray - somber
  man_in_hole: '#3B82F6',     // Blue - resilience
  icarus: '#F59E0B',          // Amber - warning
  cinderella: '#8B5CF6',      // Purple - transformation
  oedipus: '#EF4444',         // Red - revelation
  cyclical: '#059669',        // Teal - cycles
  linear: '#BFA888'           // Earth - steady
}

export function StoryArcVisualization({
  arc,
  storyTitle,
  className,
  showMetrics = true,
  showDescription = true,
  variant = 'default'
}: StoryArcVisualizationProps) {
  const arcInfo = getArcDescription(arc.arc_type)
  const arcColor = ARC_TYPE_COLORS[arc.arc_type]

  // Prepare chart data
  const chartData = useMemo(() => {
    return arc.trajectory_data.map((point, index) => ({
      time: point.time,
      timeLabel: `${Math.round(point.time * 100)}%`,
      valence: point.valence,
      // Normalize valence to 0-100 for better visualization
      valenceNormalized: (point.valence + 1) * 50,
      arousal: point.arousal,
      index
    }))
  }, [arc.trajectory_data])

  // Find peak and valley
  const peakPoint = useMemo(() => {
    const valences = arc.trajectory_data.map(t => t.valence)
    const maxValence = Math.max(...valences)
    const peakIndex = valences.indexOf(maxValence)
    return arc.trajectory_data[peakIndex]
  }, [arc.trajectory_data])

  const valleyPoint = useMemo(() => {
    const valences = arc.trajectory_data.map(t => t.valence)
    const minValence = Math.min(...valences)
    const valleyIndex = valences.indexOf(minValence)
    return arc.trajectory_data[valleyIndex]
  }, [arc.trajectory_data])

  if (variant === 'compact') {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Emotional Journey
          </span>
          <EmpathyBadge variant="primary" size="sm">
            {arcInfo.name}
          </EmpathyBadge>
        </div>

        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${arc.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={arcColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={arcColor} stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <Area
                type="monotone"
                dataKey="valenceNormalized"
                stroke={arcColor}
                strokeWidth={2}
                fill={`url(#gradient-${arc.id})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <EmpathyCard variant="insight" className={className}>
      <CardHeader
        title="Emotional Journey"
        subtitle={storyTitle || arcInfo.name}
      />

      <CardContent>
        {/* Arc type badge and confidence */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <EmpathyBadge
              variant="primary"
              style={{ backgroundColor: arcColor, color: 'white' }}
            >
              {arcInfo.name}
            </EmpathyBadge>

            {arc.community_validated && (
              <EmpathyBadge variant="success" size="sm">
                Community Validated
              </EmpathyBadge>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {Math.round(arc.arc_confidence * 100)}% confidence
          </div>
        </div>

        {/* Description */}
        {showDescription && (
          <p className="text-sm text-muted-foreground mb-6">
            {arcInfo.description}
          </p>
        )}

        {/* Main chart */}
        <div className="mb-6" style={{ height: variant === 'detailed' ? 300 : 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id={`area-gradient-${arc.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={arcColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={arcColor} stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="timeLabel"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />

              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(value) => {
                  const labels: Record<number, string> = {
                    0: 'Difficult',
                    25: 'Challenging',
                    50: 'Neutral',
                    75: 'Hopeful',
                    100: 'Joyful'
                  }
                  return labels[value] || ''
                }}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: arcColor, strokeWidth: 1, strokeDasharray: '5 5' }}
              />

              {/* Reference line at neutral */}
              <ReferenceLine
                y={50}
                stroke="#D1D5DB"
                strokeDasharray="3 3"
                label={{ value: 'Neutral', position: 'right', fontSize: 10 }}
              />

              {/* Peak marker */}
              {arc.peak_moment !== undefined && (
                <ReferenceDot
                  x={arc.peak_moment}
                  y={(peakPoint.valence + 1) * 50}
                  r={6}
                  fill={arcColor}
                  stroke="white"
                  strokeWidth={2}
                />
              )}

              {/* Valley marker */}
              {arc.valley_moment !== undefined && (
                <ReferenceDot
                  x={arc.valley_moment}
                  y={(valleyPoint.valence + 1) * 50}
                  r={6}
                  fill={arcColor}
                  stroke="white"
                  strokeWidth={2}
                />
              )}

              {/* Area under curve */}
              <Area
                type="monotone"
                dataKey="valenceNormalized"
                stroke="none"
                fill={`url(#area-gradient-${arc.id})`}
              />

              {/* Main line */}
              <Line
                type="monotone"
                dataKey="valenceNormalized"
                stroke={arcColor}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: arcColor, stroke: 'white', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Story progression labels */}
        <div className="flex justify-between text-xs text-muted-foreground mb-6 px-2">
          <span>Beginning</span>
          {arc.peak_moment && arc.valley_moment && (
            <span>
              {arc.peak_moment < arc.valley_moment ? 'Peak / Valley' : 'Valley / Peak'}
            </span>
          )}
          <span>End</span>
        </div>

        {/* Metrics */}
        {showMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <MetricDisplay
              label="Emotional Range"
              value={arc.emotional_range.toFixed(2)}
              description="Variation in emotion"
              variant="compact"
            />

            <MetricDisplay
              label="Transformation"
              value={arc.transformation_score > 0 ? '+' + arc.transformation_score.toFixed(2) : arc.transformation_score.toFixed(2)}
              description="Beginning to end"
              variant="compact"
              trend={arc.transformation_score > 0 ? 'up' : arc.transformation_score < 0 ? 'down' : undefined}
            />

            <MetricDisplay
              label="Volatility"
              value={arc.volatility.toFixed(2)}
              description="Emotional fluctuation"
              variant="compact"
            />

            <MetricDisplay
              label="Arc Type"
              value={arcInfo.name}
              description={`${Math.round(arc.arc_confidence * 100)}% match`}
              variant="compact"
            />
          </div>
        )}

        {/* Segments (if available) */}
        {variant === 'detailed' && arc.segments && arc.segments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium mb-3">Narrative Segments</h4>
            <div className="space-y-2">
              {arc.segments.map((segment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm capitalize">
                      {segment.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(segment.start * 100)}% - {Math.round(segment.end * 100)}%
                    </div>
                  </div>

                  <EmpathyBadge variant="secondary" size="sm">
                    {segment.emotion}
                  </EmpathyBadge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis metadata */}
        {variant === 'detailed' && (
          <div className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>
                Analyzed {new Date(arc.analyzed_at).toLocaleDateString()} via {arc.analysis_method}
              </span>
              {arc.community_validated && arc.validated_by && (
                <span>Validated by community</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </EmpathyCard>
  )
}

// Custom tooltip component
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div className="bg-white dark:bg-gray-800 border border-border rounded-lg shadow-lg p-3">
      <div className="text-sm font-medium mb-1">
        {data.timeLabel} through story
      </div>

      <div className="text-xs text-muted-foreground">
        Emotion: {data.valence > 0.5 ? 'Positive' : data.valence < -0.5 ? 'Difficult' : 'Neutral'}
      </div>

      {data.arousal !== undefined && (
        <div className="text-xs text-muted-foreground">
          Intensity: {data.arousal > 0.7 ? 'High' : data.arousal > 0.3 ? 'Medium' : 'Low'}
        </div>
      )}
    </div>
  )
}

// Arc type legend component
export function ArcTypeLegend() {
  const arcTypes: ArcType[] = [
    'rags_to_riches',
    'tragedy',
    'man_in_hole',
    'icarus',
    'cinderella',
    'oedipus',
    'cyclical',
    'linear'
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {arcTypes.map(arcType => {
        const info = getArcDescription(arcType)
        const color = ARC_TYPE_COLORS[arcType]

        return (
          <div
            key={arcType}
            className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div
              className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <div>
              <div className="font-medium text-sm">{info.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {info.description}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
