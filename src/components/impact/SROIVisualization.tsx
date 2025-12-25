'use client'

/**
 * SROI Visualization Components
 *
 * Beautiful, accessible visualizations for Social Return on Investment analysis
 * using the Empathy Ledger design system.
 */

import { useMemo } from 'react'
import {
  EmpathyCard,
  CardHeader,
  CardContent
} from '@/components/empathy-ledger'
import { EmpathyBadge } from '@/components/empathy-ledger/core/Badge'
import { MetricDisplay, MetricGrid } from '@/components/empathy-ledger/data/MetricDisplay'
import {
  SROICalculation,
  SROIInput,
  SROIOutcome,
  StakeholderGroup
} from '@/lib/database/types/impact-analysis'
import {
  calculateSROI,
  performSensitivityAnalysis,
  generateSROIReport
} from '@/services/sroi-calculator'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend
} from 'recharts'

export interface SROIVisualizationProps {
  inputs: SROIInput
  outcomes: SROIOutcome[]
  calculation?: SROICalculation
  projectName?: string
  className?: string
  variant?: 'full' | 'summary' | 'compact'
}

const STAKEHOLDER_COLORS: Record<StakeholderGroup, string> = {
  storytellers: '#D4936A',
  youth: '#8B5CF6',
  elders: '#059669',
  community: '#3B82F6',
  researchers: '#F59E0B',
  policymakers: '#EF4444',
  families: '#10B981'
}

export function SROIVisualization({
  inputs,
  outcomes,
  calculation,
  projectName,
  className,
  variant = 'full'
}: SROIVisualizationProps) {
  // Calculate SROI if not provided
  const sroiData = useMemo(() => {
    if (calculation) {
      return {
        total_investment: calculation.total_investment,
        total_social_value: calculation.total_social_value,
        net_social_value: calculation.net_social_value || 0,
        sroi_ratio: calculation.sroi_ratio,
        outcomes_breakdown: []
      }
    }
    return calculateSROI(inputs, outcomes)
  }, [inputs, outcomes, calculation])

  const sensitivity = useMemo(() => {
    return performSensitivityAnalysis(inputs, outcomes)
  }, [inputs, outcomes])

  const report = useMemo(() => {
    return generateSROIReport(inputs, outcomes)
  }, [inputs, outcomes])

  // Prepare stakeholder breakdown for pie chart
  const stakeholderData = useMemo(() => {
    const data: Record<string, { value: number; count: number }> = {}

    outcomes.forEach(outcome => {
      if (!data[outcome.stakeholder_group]) {
        data[outcome.stakeholder_group] = { value: 0, count: 0 }
      }
      data[outcome.stakeholder_group].count++

      // Find in outcomes_breakdown or calculate
      const breakdown = sroiData.outcomes_breakdown.find(b => b.outcome_id === outcome.id)
      if (breakdown) {
        data[outcome.stakeholder_group].value += breakdown.total_value
      }
    })

    return Object.entries(data).map(([name, values]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: values.value,
      count: values.count,
      percentage: (values.value / sroiData.total_social_value) * 100
    }))
  }, [outcomes, sroiData])

  if (variant === 'compact') {
    return (
      <div className={className}>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary-600 mb-1">
            ${sroiData.sroi_ratio.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            for every $1 invested
          </div>
        </div>
      </div>
    )
  }

  return (
    <EmpathyCard variant="warmth" elevation="focused" className={className}>
      <CardHeader
        title="Social Return on Investment"
        subtitle={projectName || 'Impact Analysis'}
      />

      <CardContent>
        {/* Main SROI Ratio */}
        <div className="text-center mb-8 p-6 bg-primary-50 dark:bg-primary-950/30 rounded-xl">
          <div className="text-6xl md:text-7xl font-bold text-primary-600 mb-2">
            ${sroiData.sroi_ratio.toFixed(2)}
          </div>
          <div className="text-lg text-muted-foreground">
            for every $1 invested
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Total social value created: <span className="font-semibold text-foreground">
              ${sroiData.total_social_value.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <MetricGrid
          columns={3}
          metrics={[
            {
              label: 'Investment',
              value: `$${sroiData.total_investment.toLocaleString()}`,
              description: 'Total resources invested'
            },
            {
              label: 'Social Value',
              value: `$${sroiData.total_social_value.toLocaleString()}`,
              description: 'Value created for stakeholders'
            },
            {
              label: 'Net Benefit',
              value: `$${sroiData.net_social_value.toLocaleString()}`,
              description: 'Value minus cost',
              trend: sroiData.net_social_value > 0 ? 'up' : undefined
            }
          ]}
          className="mb-8"
        />

        {/* Sensitivity Analysis */}
        {variant === 'full' && (
          <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <span>Sensitivity Analysis</span>
              <EmpathyBadge variant="secondary" size="sm">
                Confidence Range
              </EmpathyBadge>
            </h4>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Conservative</div>
                <div className="text-2xl font-bold">
                  ${sensitivity.conservative.sroi_ratio.toFixed(2)}
                </div>
              </div>

              <div className="text-center bg-white dark:bg-gray-800 rounded-lg py-2">
                <div className="text-sm text-muted-foreground mb-1">Base Case</div>
                <div className="text-2xl font-bold text-primary-600">
                  ${sensitivity.base.sroi_ratio.toFixed(2)}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Optimistic</div>
                <div className="text-2xl font-bold">
                  ${sensitivity.optimistic.sroi_ratio.toFixed(2)}
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Range shows SROI under different assumptions about deadweight, attribution, and drop-off.
            </p>
          </div>
        )}

        {/* Stakeholder Breakdown */}
        <div className="mb-8">
          <h4 className="font-medium mb-4">Value by Stakeholder Group</h4>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stakeholderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${entry.percentage.toFixed(0)}%`}
                    labelLine={true}
                  >
                    {stakeholderData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STAKEHOLDER_COLORS[entry.name.toLowerCase() as StakeholderGroup] || '#BFA888'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null

                      const data = payload[0].payload

                      return (
                        <div className="bg-white dark:bg-gray-800 border border-border rounded-lg shadow-lg p-3">
                          <div className="font-medium mb-1">{data.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ${data.value.toLocaleString()} ({data.percentage.toFixed(1)}%)
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {data.count} outcome{data.count !== 1 ? 's' : ''}
                          </div>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2">
              {stakeholderData
                .sort((a, b) => b.value - a.value)
                .map(stakeholder => (
                  <div
                    key={stakeholder.name}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: STAKEHOLDER_COLORS[stakeholder.name.toLowerCase() as StakeholderGroup]
                        }}
                      />
                      <div>
                        <div className="font-medium">{stakeholder.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {stakeholder.count} outcome{stakeholder.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold">
                        ${stakeholder.value.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stakeholder.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Key Findings */}
        {variant === 'full' && report.executive_summary.key_findings.length > 0 && (
          <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <span>Key Findings</span>
            </h4>

            <ul className="space-y-2">
              {report.executive_summary.key_findings.map((finding, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {variant === 'full' && report.recommendations.length > 0 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium mb-3">Recommendations</h4>

            <ul className="space-y-2">
              {report.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 mt-0.5">→</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </EmpathyCard>
  )
}

// SROI Outcome Card Component
export interface OutcomeCardProps {
  outcome: SROIOutcome
  showDetails?: boolean
}

export function OutcomeCard({ outcome, showDetails = false }: OutcomeCardProps) {
  return (
    <EmpathyCard variant="default" className="border-l-4" style={{ borderLeftColor: STAKEHOLDER_COLORS[outcome.stakeholder_group] }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium mb-1">{outcome.outcome_description}</h4>

            <div className="flex flex-wrap gap-2 mb-2">
              <EmpathyBadge variant="secondary" size="sm">
                {outcome.stakeholder_group}
              </EmpathyBadge>

              <EmpathyBadge variant="primary" size="sm">
                {outcome.beneficiary_count} {outcome.unit_of_measurement || 'people'}
              </EmpathyBadge>
            </div>
          </div>

          {outcome.total_value && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                ${outcome.total_value.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Value</div>
            </div>
          )}
        </div>

        {showDetails && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
            <div>
              <div className="text-xs text-muted-foreground">Financial Proxy</div>
              <div className="font-medium">${outcome.financial_proxy}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Deadweight</div>
              <div className="font-medium">{Math.round(outcome.deadweight * 100)}%</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Attribution</div>
              <div className="font-medium">{Math.round(outcome.attribution * 100)}%</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Duration</div>
              <div className="font-medium">{outcome.duration_years} years</div>
            </div>
          </div>
        )}
      </CardContent>
    </EmpathyCard>
  )
}

// SROI Comparison Component (compare multiple projects)
export interface SROIComparisonProps {
  projects: Array<{
    id: string
    name: string
    sroi_ratio: number
    total_investment: number
    total_social_value: number
  }>
  className?: string
}

export function SROIComparison({ projects, className }: SROIComparisonProps) {
  const chartData = projects.map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    sroi: p.sroi_ratio,
    investment: p.total_investment,
    value: p.total_social_value
  }))

  return (
    <EmpathyCard className={className}>
      <CardHeader
        title="SROI Comparison"
        subtitle="Across projects"
      />

      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 20, right: 20, top: 20, bottom: 60 }}>
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                label={{ value: 'SROI Ratio', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null

                  const data = payload[0].payload

                  return (
                    <div className="bg-white dark:bg-gray-800 border border-border rounded-lg shadow-lg p-3">
                      <div className="font-medium mb-2">{data.name}</div>
                      <div className="text-sm">
                        <div>SROI: ${data.sroi.toFixed(2)}</div>
                        <div className="text-muted-foreground">
                          Investment: ${data.investment.toLocaleString()}
                        </div>
                        <div className="text-muted-foreground">
                          Value: ${data.value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                }}
              />
              <Legend />
              <Bar
                dataKey="sroi"
                fill="#BFA888"
                name="SROI Ratio"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </EmpathyCard>
  )
}
