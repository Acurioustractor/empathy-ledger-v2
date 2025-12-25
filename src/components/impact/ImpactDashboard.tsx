'use client'

/**
 * Impact Dashboard Component
 *
 * Comprehensive platform overview bringing together all impact visualizations:
 * - Story narrative arcs
 * - Theme evolution
 * - SROI analysis
 * - Ripple effects
 * - Storyteller network
 *
 * Multi-level dashboard supporting storyteller, organization, and platform views.
 */

import { useState, useMemo } from 'react'
import {
  EmpathyCard,
  CardHeader,
  CardContent
} from '@/components/empathy-ledger'
import { EmpathyBadge } from '@/components/empathy-ledger/core/Badge'
import { MetricGrid } from '@/components/empathy-ledger/data/MetricDisplay'
import { StoryArcVisualization } from './StoryArcVisualization'
import { ThemeEvolutionVisualization } from './ThemeEvolutionVisualization'
import { SROIVisualization, SROIComparison } from './SROIVisualization'
import { RippleEffectVisualization } from './RippleEffectVisualization'
import {
  StoryNarrativeArc,
  ThemeEvolution,
  ThemeConceptEvolution,
  SROIInput,
  SROIOutcome,
  SROICalculation,
  RippleEffect
} from '@/lib/database/types/impact-analysis'

export interface ImpactDashboardProps {
  // Context
  view: 'storyteller' | 'organization' | 'platform'
  storytellerId?: string
  organizationId?: string

  // Data
  narrativeArcs?: StoryNarrativeArc[]
  themeEvolutions?: ThemeEvolution[]
  conceptEvolutions?: ThemeConceptEvolution[]
  sroiInputs?: SROIInput
  sroiOutcomes?: SROIOutcome[]
  sroiCalculation?: SROICalculation
  rippleEffects?: RippleEffect[]

  // Summary metrics
  totalStories?: number
  totalStorytellers?: number
  totalOrganizations?: number
  timeRange?: string

  className?: string
}

type DashboardTab = 'overview' | 'stories' | 'themes' | 'impact' | 'network'

export function ImpactDashboard({
  view,
  storytellerId,
  organizationId,
  narrativeArcs = [],
  themeEvolutions = [],
  conceptEvolutions = [],
  sroiInputs,
  sroiOutcomes = [],
  sroiCalculation,
  rippleEffects = [],
  totalStories = 0,
  totalStorytellers = 0,
  totalOrganizations = 0,
  timeRange = 'All time',
  className
}: ImpactDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')

  // Calculate key metrics
  const metrics = useMemo(() => {
    const avgEmotionalRange = narrativeArcs.length > 0
      ? narrativeArcs.reduce((sum, arc) => sum + arc.emotional_range, 0) / narrativeArcs.length
      : 0

    const transformationScores = narrativeArcs.map(arc => arc.transformation_score)
    const avgTransformation = transformationScores.length > 0
      ? transformationScores.reduce((sum, score) => sum + score, 0) / transformationScores.length
      : 0

    const communityValidatedArcs = narrativeArcs.filter(arc => arc.community_validated).length
    const validationRate = narrativeArcs.length > 0
      ? (communityValidatedArcs / narrativeArcs.length) * 100
      : 0

    const activeThemes = new Set(themeEvolutions.map(e => e.theme_id)).size

    const emergingThemes = themeEvolutions.filter(e => e.current_status === 'emerging').length
    const growingThemes = themeEvolutions.filter(e => e.current_status === 'growing').length

    const totalPeopleAffected = rippleEffects.reduce((sum, e) => sum + (e.people_affected || 0), 0)
    const policyLevel = rippleEffects.filter(e => e.ripple_level === 5).length
    const communityLevel = rippleEffects.filter(e => e.ripple_level === 3).length

    const sroiRatio = sroiCalculation?.sroi_ratio || 0

    return {
      stories: {
        total: totalStories,
        withArcs: narrativeArcs.length,
        avgEmotionalRange,
        avgTransformation,
        validationRate
      },
      themes: {
        active: activeThemes,
        emerging: emergingThemes,
        growing: growingThemes
      },
      impact: {
        sroiRatio,
        peopleAffected: totalPeopleAffected,
        policyLevel,
        communityLevel
      },
      participation: {
        storytellers: totalStorytellers,
        organizations: totalOrganizations,
        validationRate
      }
    }
  }, [
    narrativeArcs,
    themeEvolutions,
    rippleEffects,
    sroiCalculation,
    totalStories,
    totalStorytellers,
    totalOrganizations
  ])

  // Arc type distribution
  const arcDistribution = useMemo(() => {
    const distribution = new Map<string, number>()

    narrativeArcs.forEach(arc => {
      distribution.set(arc.arc_type, (distribution.get(arc.arc_type) || 0) + 1)
    })

    return Array.from(distribution.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / narrativeArcs.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
  }, [narrativeArcs])

  // Top themes by prominence
  const topThemes = useMemo(() => {
    const themeProminence = new Map<string, { prominence: number; status: string }>()

    themeEvolutions.forEach(evolution => {
      const current = themeProminence.get(evolution.theme_id)
      if (!current || evolution.prominence_score > current.prominence) {
        themeProminence.set(evolution.theme_id, {
          prominence: evolution.prominence_score,
          status: evolution.current_status
        })
      }
    })

    return Array.from(themeProminence.entries())
      .map(([theme, data]) => ({
        theme,
        prominence: data.prominence,
        status: data.status
      }))
      .sort((a, b) => b.prominence - a.prominence)
      .slice(0, 10)
  }, [themeEvolutions])

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {view === 'storyteller' && 'My Impact Dashboard'}
              {view === 'organization' && 'Organization Impact'}
              {view === 'platform' && 'Platform Impact Overview'}
            </h1>
            <p className="text-muted-foreground">
              {timeRange} • {totalStories} stories
              {view === 'platform' && ` • ${totalStorytellers} storytellers • ${totalOrganizations} organizations`}
            </p>
          </div>

          {/* Export button */}
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Export Report
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {(['overview', 'stories', 'themes', 'impact', 'network'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key metrics */}
          <MetricGrid
            columns={4}
            metrics={[
              {
                label: 'Stories Analyzed',
                value: metrics.stories.withArcs.toString(),
                description: `${metrics.stories.total} total stories`,
                trend: metrics.stories.withArcs > 0 ? 'up' : undefined
              },
              {
                label: 'Active Themes',
                value: metrics.themes.active.toString(),
                description: `${metrics.themes.emerging} emerging`,
                trend: metrics.themes.emerging > 0 ? 'up' : undefined
              },
              {
                label: 'SROI Ratio',
                value: metrics.impact.sroiRatio > 0 ? `$${metrics.impact.sroiRatio.toFixed(2)}` : 'N/A',
                description: 'Per dollar invested'
              },
              {
                label: 'People Affected',
                value: metrics.impact.peopleAffected.toLocaleString(),
                description: `${metrics.impact.policyLevel} policy impacts`,
                trend: metrics.impact.peopleAffected > 0 ? 'up' : undefined
              }
            ]}
          />

          {/* Highlighted visualizations */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Story arc summary */}
            {narrativeArcs.length > 0 && (
              <EmpathyCard variant="warmth">
                <CardHeader
                  title="Narrative Journey"
                  subtitle="Emotional arcs across stories"
                />
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-primary-50 dark:bg-primary-950/30 rounded-xl">
                      <div className="text-3xl font-bold text-primary-600">
                        {metrics.stories.avgEmotionalRange.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average emotional range
                      </div>
                    </div>

                    {/* Arc distribution */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Arc Types</h4>
                      {arcDistribution.slice(0, 5).map(({ type, count, percentage }) => (
                        <div key={type} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                              <span className="text-muted-foreground">{count}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-600"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </EmpathyCard>
            )}

            {/* Theme evolution summary */}
            {themeEvolutions.length > 0 && (
              <EmpathyCard variant="insight">
                <CardHeader
                  title="Theme Dynamics"
                  subtitle="How themes are evolving"
                />
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">
                          {metrics.themes.emerging}
                        </div>
                        <div className="text-xs text-muted-foreground">Emerging</div>
                      </div>

                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics.themes.growing}
                        </div>
                        <div className="text-xs text-muted-foreground">Growing</div>
                      </div>

                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {metrics.themes.active}
                        </div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                    </div>

                    {/* Top themes */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Top Themes</h4>
                      {topThemes.slice(0, 5).map(({ theme, prominence, status }) => (
                        <div
                          key={theme}
                          className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                        >
                          <div className="flex-1 truncate">
                            <div className="text-sm font-medium">{theme}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {(prominence * 100).toFixed(0)}%
                            </span>
                            <EmpathyBadge variant="secondary" size="sm">
                              {status}
                            </EmpathyBadge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </EmpathyCard>
            )}
          </div>

          {/* SROI Summary */}
          {sroiInputs && sroiOutcomes.length > 0 && (
            <SROIVisualization
              inputs={sroiInputs}
              outcomes={sroiOutcomes}
              calculation={sroiCalculation}
              variant="summary"
            />
          )}

          {/* Ripple effect summary */}
          {rippleEffects.length > 0 && (
            <RippleEffectVisualization
              effects={rippleEffects}
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Stories Tab */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          {narrativeArcs.length === 0 ? (
            <EmpathyCard>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No story arcs analyzed yet</p>
              </CardContent>
            </EmpathyCard>
          ) : (
            <>
              {/* Story arc distribution */}
              <EmpathyCard>
                <CardHeader
                  title="Narrative Arc Distribution"
                  subtitle={`${narrativeArcs.length} stories analyzed`}
                />
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Distribution chart */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Arc Types</h4>
                      <div className="space-y-3">
                        {arcDistribution.map(({ type, count, percentage }) => (
                          <div key={type}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                              <span className="text-muted-foreground">
                                {count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-600 transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key metrics */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Key Insights</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">
                            Average Emotional Range
                          </div>
                          <div className="text-2xl font-bold">
                            {metrics.stories.avgEmotionalRange.toFixed(2)}
                          </div>
                        </div>

                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">
                            Average Transformation
                          </div>
                          <div className="text-2xl font-bold">
                            {metrics.stories.avgTransformation > 0 ? '+' : ''}
                            {metrics.stories.avgTransformation.toFixed(2)}
                          </div>
                        </div>

                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">
                            Community Validated
                          </div>
                          <div className="text-2xl font-bold">
                            {metrics.stories.validationRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </EmpathyCard>

              {/* Individual story arcs */}
              <div className="grid md:grid-cols-2 gap-6">
                {narrativeArcs.slice(0, 6).map(arc => (
                  <StoryArcVisualization
                    key={arc.id}
                    arc={arc}
                    variant="default"
                    showMetrics={false}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Themes Tab */}
      {activeTab === 'themes' && (
        <div className="space-y-6">
          {themeEvolutions.length === 0 ? (
            <EmpathyCard>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No theme evolution data yet</p>
              </CardContent>
            </EmpathyCard>
          ) : (
            <>
              <ThemeEvolutionVisualization
                evolutions={themeEvolutions}
                conceptEvolutions={conceptEvolutions}
                variant="full"
                showPredictions={view === 'platform'}
              />

              {/* Semantic shift analysis */}
              {conceptEvolutions.length > 0 && (
                <ThemeEvolutionVisualization
                  evolutions={themeEvolutions}
                  conceptEvolutions={conceptEvolutions}
                  variant="semantic"
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Impact Tab */}
      {activeTab === 'impact' && (
        <div className="space-y-6">
          {/* SROI */}
          {sroiInputs && sroiOutcomes.length > 0 ? (
            <SROIVisualization
              inputs={sroiInputs}
              outcomes={sroiOutcomes}
              calculation={sroiCalculation}
              variant="full"
            />
          ) : (
            <EmpathyCard>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No SROI data available yet</p>
              </CardContent>
            </EmpathyCard>
          )}

          {/* Ripple effects */}
          {rippleEffects.length > 0 ? (
            <RippleEffectVisualization
              effects={rippleEffects}
              variant="detailed"
            />
          ) : (
            <EmpathyCard>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No ripple effects tracked yet</p>
              </CardContent>
            </EmpathyCard>
          )}
        </div>
      )}

      {/* Network Tab */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          <EmpathyCard>
            <CardHeader
              title="Storyteller Network"
              subtitle="Coming soon"
            />
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                Network visualization will show connections between storytellers through shared themes
              </p>
            </CardContent>
          </EmpathyCard>
        </div>
      )}
    </div>
  )
}

// Export button component
export function ExportImpactReport({ view, storytellerId, organizationId }: {
  view: 'storyteller' | 'organization' | 'platform'
  storytellerId?: string
  organizationId?: string
}) {
  const handleExport = async (format: 'pdf' | 'pptx' | 'csv') => {
    // Will implement export functionality
    console.log(`Exporting ${view} report as ${format}`)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport('pdf')}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Export PDF
      </button>
      <button
        onClick={() => handleExport('pptx')}
        className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
      >
        Export Slides
      </button>
      <button
        onClick={() => handleExport('csv')}
        className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
      >
        Export Data
      </button>
    </div>
  )
}
