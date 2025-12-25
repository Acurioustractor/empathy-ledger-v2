'use client'

/**
 * Ripple Effect Visualization Component
 *
 * Displays how impact spreads through concentric circles of influence,
 * from storyteller → family → community → other communities → policy/systems
 */

import { useMemo, useState } from 'react'
import {
  EmpathyCard,
  CardHeader,
  CardContent
} from '@/components/empathy-ledger'
import { EmpathyBadge } from '@/components/empathy-ledger/core/Badge'
import {
  RippleEffect,
  RippleLevel,
  RippleLabel
} from '@/lib/database/types/impact-analysis'

export interface RippleEffectVisualizationProps {
  effects: RippleEffect[]
  storyTitle?: string
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
}

const RIPPLE_LABELS: Record<RippleLevel, RippleLabel> = {
  1: 'storyteller',
  2: 'family',
  3: 'community',
  4: 'other_communities',
  5: 'policy_systems'
}

const RIPPLE_COLORS: Record<RippleLevel, string> = {
  1: '#D4936A', // Storyteller - warm coral
  2: '#10B981', // Family - green
  3: '#3B82F6', // Community - blue
  4: '#8B5CF6', // Other communities - purple
  5: '#EF4444'  // Policy/systems - red
}

const RIPPLE_RADII = {
  1: 40,
  2: 100,
  3: 160,
  4: 220,
  5: 280
}

export function RippleEffectVisualization({
  effects,
  storyTitle,
  className,
  variant = 'default'
}: RippleEffectVisualizationProps) {
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null)

  // Group effects by level
  const effectsByLevel = useMemo(() => {
    const grouped: Record<RippleLevel, RippleEffect[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: []
    }

    effects.forEach(effect => {
      grouped[effect.ripple_level].push(effect)
    })

    return grouped
  }, [effects])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPeople = effects.reduce((sum, e) => sum + (e.people_affected || 0), 0)
    const totalCommunities = effects.reduce((sum, e) => sum + (e.communities_affected || 0), 0)
    const maxLevel = Math.max(...effects.map(e => e.ripple_level))
    const avgTimeLag = effects
      .filter(e => e.time_lag_days !== null)
      .reduce((sum, e) => sum + (e.time_lag_days || 0), 0) / effects.filter(e => e.time_lag_days !== null).length

    return {
      totalEffects: effects.length,
      totalPeople,
      totalCommunities,
      maxLevel,
      avgTimeLag: Math.round(avgTimeLag) || 0
    }
  }, [effects])

  if (variant === 'compact') {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Ripple Effects</span>
          <EmpathyBadge variant="primary" size="sm">
            {stats.totalEffects} effects
          </EmpathyBadge>
        </div>

        <div className="grid grid-cols-5 gap-1">
          {[1, 2, 3, 4, 5].map(level => (
            <div
              key={level}
              className="text-center p-2 rounded"
              style={{ backgroundColor: RIPPLE_COLORS[level as RippleLevel] + '20' }}
            >
              <div className="text-lg font-bold" style={{ color: RIPPLE_COLORS[level as RippleLevel] }}>
                {effectsByLevel[level as RippleLevel].length}
              </div>
              <div className="text-xs text-muted-foreground">
                Level {level}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <EmpathyCard variant="connection" elevation="focused" className={className}>
      <CardHeader
        title="Ripple Effects"
        subtitle={storyTitle ? `How "${storyTitle}" created waves of change` : 'Spreading impact visualization'}
      />

      <CardContent>
        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-primary-50 dark:bg-primary-950/30 rounded-lg">
            <div className="text-3xl font-bold text-primary-600">{stats.totalEffects}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Effects</div>
          </div>

          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
            <div className="text-3xl font-bold text-emerald-600">{stats.totalPeople}</div>
            <div className="text-sm text-muted-foreground mt-1">People Affected</div>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{stats.maxLevel}</div>
            <div className="text-sm text-muted-foreground mt-1">Ripple Levels</div>
          </div>

          <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <div className="text-3xl font-bold text-amber-600">{stats.avgTimeLag}</div>
            <div className="text-sm text-muted-foreground mt-1">Avg Days to Effect</div>
          </div>
        </div>

        {/* Concentric circles visualization */}
        <div className="relative mb-8" style={{ height: 600 }}>
          <svg
            width="100%"
            height="600"
            viewBox="0 0 600 600"
            className="overflow-visible"
          >
            {/* Concentric circles */}
            {[5, 4, 3, 2, 1].map(level => (
              <circle
                key={level}
                cx={300}
                cy={300}
                r={RIPPLE_RADII[level as RippleLevel]}
                fill={RIPPLE_COLORS[level as RippleLevel]}
                fillOpacity={0.05}
                stroke={RIPPLE_COLORS[level as RippleLevel]}
                strokeWidth={2}
                strokeOpacity={0.3}
              />
            ))}

            {/* Center story */}
            <circle
              cx={300}
              cy={300}
              r={30}
              fill="#BFA888"
              stroke="white"
              strokeWidth={3}
            />
            <text
              x={300}
              y={305}
              textAnchor="middle"
              fill="white"
              fontSize={12}
              fontWeight="bold"
            >
              Story
            </text>

            {/* Effect dots */}
            {effects.map((effect, index) => {
              const angle = (index / effects.length) * 2 * Math.PI
              const radius = RIPPLE_RADII[effect.ripple_level]
              const x = 300 + radius * Math.cos(angle)
              const y = 300 + radius * Math.sin(angle)
              const size = Math.sqrt((effect.people_affected || 1) / 2)

              return (
                <g key={effect.id}>
                  {/* Connection line to triggering effect */}
                  {effect.triggered_by && (
                    <line
                      x1={x}
                      y1={y}
                      x2={300} // Simplified: should find actual triggering effect position
                      y2={300}
                      stroke="#D4C4A8"
                      strokeWidth={1}
                      strokeDasharray="5,5"
                      opacity={0.3}
                    />
                  )}

                  {/* Effect dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={Math.max(6, Math.min(20, size))}
                    fill={RIPPLE_COLORS[effect.ripple_level]}
                    stroke="white"
                    strokeWidth={2}
                    opacity={selectedEffect === effect.id ? 1 : 0.8}
                    className="cursor-pointer transition-all hover:opacity-100 hover:r-[12]"
                    onClick={() => setSelectedEffect(effect.id)}
                    onMouseEnter={() => setSelectedEffect(effect.id)}
                  />
                </g>
              )
            })}

            {/* Ring labels */}
            <text x={300} y={260} textAnchor="middle" fontSize={10} fill="#6B7280" opacity={0.7}>
              Family
            </text>
            <text x={300} y={180} textAnchor="middle" fontSize={10} fill="#6B7280" opacity={0.7}>
              Community
            </text>
            <text x={300} y={110} textAnchor="middle" fontSize={10} fill="#6B7280" opacity={0.7}>
              Other Communities
            </text>
            <text x={300} y={40} textAnchor="middle" fontSize={10} fill="#6B7280" opacity={0.7}>
              Policy & Systems
            </text>
          </svg>

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-border">
            <h4 className="font-medium text-sm mb-3">Ripple Levels</h4>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(level => (
                <div key={level} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: RIPPLE_COLORS[level as RippleLevel] }}
                  />
                  <span className="capitalize">
                    {RIPPLE_LABELS[level as RippleLevel].replace('_', ' ')}
                  </span>
                  <span className="ml-auto text-muted-foreground">
                    {effectsByLevel[level as RippleLevel].length}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
              <p>Dot size = people affected</p>
              <p>Dotted lines = chains of effects</p>
            </div>
          </div>
        </div>

        {/* Selected effect details */}
        {selectedEffect && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border-l-4" style={{
            borderLeftColor: RIPPLE_COLORS[effects.find(e => e.id === selectedEffect)?.ripple_level || 1]
          }}>
            {(() => {
              const effect = effects.find(e => e.id === selectedEffect)
              if (!effect) return null

              return (
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{effect.effect_description}</h4>
                    <button
                      onClick={() => setSelectedEffect(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <EmpathyBadge variant="primary" size="sm">
                      Level {effect.ripple_level}
                    </EmpathyBadge>

                    {effect.effect_type && (
                      <EmpathyBadge variant="secondary" size="sm">
                        {effect.effect_type}
                      </EmpathyBadge>
                    )}

                    {effect.validated && (
                      <EmpathyBadge variant="success" size="sm">
                        Validated
                      </EmpathyBadge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {effect.people_affected && (
                      <div>
                        <div className="text-muted-foreground text-xs">People Affected</div>
                        <div className="font-medium">{effect.people_affected}</div>
                      </div>
                    )}

                    {effect.time_lag_days !== null && (
                      <div>
                        <div className="text-muted-foreground text-xs">Time Lag</div>
                        <div className="font-medium">{effect.time_lag_days} days</div>
                      </div>
                    )}

                    {effect.geographic_reach && (
                      <div>
                        <div className="text-muted-foreground text-xs">Reach</div>
                        <div className="font-medium capitalize">{effect.geographic_reach}</div>
                      </div>
                    )}

                    {effect.evidence_type && (
                      <div>
                        <div className="text-muted-foreground text-xs">Evidence</div>
                        <div className="font-medium capitalize">{effect.evidence_type}</div>
                      </div>
                    )}
                  </div>

                  {effect.evidence_source && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="text-xs text-muted-foreground mb-1">Evidence Source:</div>
                      <div className="text-sm">{effect.evidence_source}</div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}

        {/* Timeline of effects */}
        <div className="mt-6">
          <h4 className="font-medium mb-4">Timeline of Impact</h4>

          <div className="space-y-3">
            {effects
              .filter(e => e.time_lag_days !== null)
              .sort((a, b) => (a.time_lag_days || 0) - (b.time_lag_days || 0))
              .slice(0, variant === 'detailed' ? effects.length : 5)
              .map(effect => (
                <div
                  key={effect.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedEffect(effect.id)}
                >
                  <div className="flex-shrink-0 text-center" style={{ minWidth: 60 }}>
                    <div className="text-sm font-medium text-muted-foreground">
                      +{effect.time_lag_days} days
                    </div>
                  </div>

                  <div
                    className="w-1 h-full rounded"
                    style={{ backgroundColor: RIPPLE_COLORS[effect.ripple_level] }}
                  />

                  <div className="flex-1">
                    <p className="text-sm font-medium">{effect.effect_description}</p>

                    <div className="flex items-center gap-2 mt-1">
                      <EmpathyBadge
                        variant="secondary"
                        size="sm"
                        style={{
                          backgroundColor: RIPPLE_COLORS[effect.ripple_level] + '20',
                          color: RIPPLE_COLORS[effect.ripple_level]
                        }}
                      >
                        Level {effect.ripple_level}
                      </EmpathyBadge>

                      {effect.people_affected && (
                        <span className="text-xs text-muted-foreground">
                          {effect.people_affected} people
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {effects.length > 5 && variant !== 'detailed' && (
            <div className="text-center mt-4">
              <button className="text-sm text-primary-600 hover:underline">
                View all {effects.length} effects
              </button>
            </div>
          )}
        </div>

        {/* Explanation */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium mb-2 text-sm">Understanding Ripple Effects</h4>
          <p className="text-sm text-muted-foreground">
            Like ripples in water, stories create waves of change that spread outward.
            This visualization shows how impact moves from the storyteller through their family,
            into the wider community, to other communities, and eventually influencing policy and systems.
          </p>
        </div>
      </CardContent>
    </EmpathyCard>
  )
}

// Component for reporting new ripple effects
export function ReportRippleEffect({
  storyId,
  onSubmit
}: {
  storyId: string
  onSubmit?: (effect: Partial<RippleEffect>) => void
}) {
  const [formData, setFormData] = useState({
    effect_description: '',
    ripple_level: 2 as RippleLevel,
    people_affected: 1,
    evidence_source: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const effect: Partial<RippleEffect> = {
      story_id: storyId,
      ...formData,
      ripple_label: RIPPLE_LABELS[formData.ripple_level],
      reported_at: new Date().toISOString(),
      validated: false
    }

    onSubmit?.(effect)

    // Reset form
    setFormData({
      effect_description: '',
      ripple_level: 2,
      people_affected: 1,
      evidence_source: ''
    })
  }

  return (
    <EmpathyCard>
      <CardHeader
        title="Share an Impact"
        subtitle="Help us understand how this story created change"
      />

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              What happened as a result of this story?
            </label>
            <textarea
              value={formData.effect_description}
              onChange={e => setFormData({ ...formData, effect_description: e.target.value })}
              placeholder="E.g., 'My grandmother started teaching me our language after hearing this'"
              className="w-full p-3 border border-border rounded-lg"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Who was affected?
            </label>
            <select
              value={formData.ripple_level}
              onChange={e => setFormData({ ...formData, ripple_level: parseInt(e.target.value) as RippleLevel })}
              className="w-full p-3 border border-border rounded-lg"
            >
              <option value={1}>The storyteller themselves</option>
              <option value={2}>Family and close friends</option>
              <option value={3}>Wider community</option>
              <option value={4}>Other communities</option>
              <option value={5}>Policy or systems</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              How many people were affected?
            </label>
            <input
              type="number"
              min={1}
              value={formData.people_affected}
              onChange={e => setFormData({ ...formData, people_affected: parseInt(e.target.value) })}
              className="w-full p-3 border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              How do you know this happened? (Optional)
            </label>
            <textarea
              value={formData.evidence_source}
              onChange={e => setFormData({ ...formData, evidence_source: e.target.value })}
              placeholder="What you saw, heard, or experienced..."
              className="w-full p-3 border border-border rounded-lg"
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Share Impact
          </button>
        </form>
      </CardContent>
    </EmpathyCard>
  )
}
