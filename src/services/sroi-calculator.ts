/**
 * Social Return on Investment (SROI) Calculator
 *
 * Calculates SROI ratios based on Social Value UK framework:
 * https://www.socialvalueint.org/guide-to-sroi
 */

import {
  SROIInput,
  SROIOutcome,
  SROICalculation,
  OutcomeType,
  StakeholderGroup
} from '@/lib/database/types/impact-analysis'

// ============================================================================
// FINANCIAL PROXY LIBRARY
// ============================================================================

/**
 * Standard financial proxies for common outcomes
 * Based on research, comparable market values, and wellbeing valuations
 */
export const FINANCIAL_PROXIES: Record<
  string,
  { value: number; source: string; rationale: string }
> = {
  // Cultural Preservation
  'cultural_connection_youth': {
    value: 500,
    source: 'Comparable cultural camp attendance cost',
    rationale: 'Value youth place on cultural connection experiences, validated through willingness-to-pay studies'
  },
  'language_retention': {
    value: 1000,
    source: 'Cost to recreate lost linguistic knowledge',
    rationale: 'Academic estimate of knowledge preservation value'
  },
  'traditional_knowledge_preserved': {
    value: 800,
    source: 'Ethnographic research documentation costs',
    rationale: 'Cost that would be required to document knowledge if lost'
  },

  // Community Healing
  'storyteller_healing': {
    value: 300,
    source: 'Equivalent counseling session value',
    rationale: 'Comparable to 3-4 professional counseling sessions'
  },
  'trauma_processing': {
    value: 400,
    source: 'Mental health treatment cost',
    rationale: 'Therapeutic value of story sharing for trauma healing'
  },
  'community_wellbeing': {
    value: 250,
    source: 'Community health program participation',
    rationale: 'Value of improved social cohesion and collective wellbeing'
  },

  // Youth Engagement
  'youth_cultural_pride': {
    value: 500,
    source: 'Youth development program value',
    rationale: 'Identity development and cultural pride building'
  },
  'youth_elder_connection': {
    value: 350,
    source: 'Mentorship program equivalent',
    rationale: 'Value of intergenerational mentoring relationships'
  },

  // Elder Wellbeing
  'elder_purpose': {
    value: 300,
    source: 'Wellbeing value of meaningful contribution',
    rationale: 'Research on elder wellbeing and purpose'
  },
  'elder_legacy': {
    value: 400,
    source: 'Legacy and knowledge transmission value',
    rationale: 'Satisfaction of knowledge transmission to next generation'
  },

  // Policy Influence
  'policy_evidence': {
    value: 5000,
    source: 'Cost of commissioning policy research',
    rationale: 'Value of community-generated evidence per policy change'
  },
  'public_awareness': {
    value: 200,
    source: 'Public education campaign reach',
    rationale: 'Per-person awareness value in public discourse'
  },

  // Research Value
  'research_access': {
    value: 200,
    source: 'Academic research time saved',
    rationale: 'Per-hour value of research-ready primary sources'
  }
}

// ============================================================================
// SROI CALCULATION
// ============================================================================

export interface CalculateOutcomeValueOptions {
  discountRate?: number  // Standard is 0.035 (3.5%)
}

/**
 * Calculate the present value of a single outcome
 *
 * Formula:
 * 1. Gross Value = Quantity × Financial Proxy
 * 2. Net Value = Gross × (1 - Deadweight) × Attribution × (1 - Displacement)
 * 3. Present Value = Sum over years of: Net × (1 - DropOff)^(year-1) / (1 + DiscountRate)^year
 */
export function calculateOutcomeValue(
  outcome: SROIOutcome,
  options: CalculateOutcomeValueOptions = {}
): {
  gross_value: number
  net_value: number
  total_value: number
  yearly_values: number[]
} {
  const { discountRate = 0.035 } = options

  // Step 1: Gross value
  const gross_value = outcome.quantity * outcome.financial_proxy

  // Step 2: Net value (apply discounting factors)
  const net_value =
    gross_value *
    (1 - outcome.deadweight) *
    outcome.attribution *
    (1 - outcome.displacement)

  // Step 3: Present value over duration
  const yearly_values: number[] = []
  let total_value = 0

  const years = Math.ceil(outcome.duration_years)

  for (let year = 1; year <= years; year++) {
    // Apply drop-off
    const yearlyValue = net_value * Math.pow(1 - outcome.drop_off, year - 1)

    // Discount to present value
    const presentValue = yearlyValue / Math.pow(1 + discountRate, year)

    yearly_values.push(presentValue)
    total_value += presentValue
  }

  return {
    gross_value,
    net_value,
    total_value,
    yearly_values
  }
}

/**
 * Calculate SROI ratio for a project
 */
export function calculateSROI(
  inputs: SROIInput,
  outcomes: SROIOutcome[],
  options: CalculateOutcomeValueOptions = {}
): {
  total_investment: number
  total_social_value: number
  net_social_value: number
  sroi_ratio: number
  outcomes_breakdown: Array<{
    outcome_id: string
    outcome_description: string
    gross_value: number
    net_value: number
    total_value: number
  }>
} {
  // Calculate total investment
  const total_investment = inputs.total_investment

  // Calculate value for each outcome
  const outcomes_breakdown = outcomes.map(outcome => {
    const values = calculateOutcomeValue(outcome, options)

    return {
      outcome_id: outcome.id,
      outcome_description: outcome.outcome_description,
      gross_value: values.gross_value,
      net_value: values.net_value,
      total_value: values.total_value
    }
  })

  // Sum total social value
  const total_social_value = outcomes_breakdown.reduce(
    (sum, outcome) => sum + outcome.total_value,
    0
  )

  // Net social value (benefit minus cost)
  const net_social_value = total_social_value - total_investment

  // SROI ratio
  const sroi_ratio = total_investment > 0 ? total_social_value / total_investment : 0

  return {
    total_investment,
    total_social_value,
    net_social_value,
    sroi_ratio,
    outcomes_breakdown
  }
}

/**
 * Sensitivity analysis: recalculate with different assumptions
 */
export function performSensitivityAnalysis(
  inputs: SROIInput,
  outcomes: SROIOutcome[]
): {
  conservative: { sroi_ratio: number; total_value: number }
  base: { sroi_ratio: number; total_value: number }
  optimistic: { sroi_ratio: number; total_value: number }
} {
  // Base case
  const base = calculateSROI(inputs, outcomes)

  // Conservative: increase deadweight, decrease attribution
  const conservativeOutcomes = outcomes.map(o => ({
    ...o,
    deadweight: Math.min(1, o.deadweight + 0.2),
    attribution: Math.max(0, o.attribution - 0.2),
    drop_off: Math.min(1, o.drop_off + 0.1)
  }))
  const conservative = calculateSROI(inputs, conservativeOutcomes)

  // Optimistic: decrease deadweight, increase attribution
  const optimisticOutcomes = outcomes.map(o => ({
    ...o,
    deadweight: Math.max(0, o.deadweight - 0.1),
    attribution: Math.min(1, o.attribution + 0.1),
    drop_off: Math.max(0, o.drop_off - 0.05)
  }))
  const optimistic = calculateSROI(inputs, optimisticOutcomes)

  return {
    conservative: {
      sroi_ratio: conservative.sroi_ratio,
      total_value: conservative.total_social_value
    },
    base: {
      sroi_ratio: base.sroi_ratio,
      total_value: base.total_social_value
    },
    optimistic: {
      sroi_ratio: optimistic.sroi_ratio,
      total_value: optimistic.total_social_value
    }
  }
}

// ============================================================================
// OUTCOME TEMPLATES
// ============================================================================

export interface OutcomeTemplate {
  outcome_type: OutcomeType
  outcome_description: string
  stakeholder_group: StakeholderGroup
  unit_of_measurement: string
  suggested_financial_proxy: number
  financial_proxy_source: string
  financial_proxy_rationale: string
  typical_deadweight: number
  typical_attribution: number
  typical_drop_off: number
  typical_duration_years: number
}

/**
 * Pre-defined outcome templates for common storytelling impacts
 */
export const OUTCOME_TEMPLATES: OutcomeTemplate[] = [
  {
    outcome_type: 'cultural_preservation',
    outcome_description: 'Youth develop cultural connection and pride',
    stakeholder_group: 'youth',
    unit_of_measurement: 'youth',
    suggested_financial_proxy: 500,
    financial_proxy_source: 'Cultural camp attendance value',
    financial_proxy_rationale: 'Comparable to cost of cultural immersion experiences',
    typical_deadweight: 0.2, // 20% would have connected anyway
    typical_attribution: 0.8, // We contributed 80%
    typical_drop_off: 0.1,    // 10% decline per year
    typical_duration_years: 3
  },
  {
    outcome_type: 'community_healing',
    outcome_description: 'Storytellers experience healing through sharing',
    stakeholder_group: 'storytellers',
    unit_of_measurement: 'storytellers',
    suggested_financial_proxy: 300,
    financial_proxy_source: 'Counseling session equivalent',
    financial_proxy_rationale: 'Therapeutic value of story sharing',
    typical_deadweight: 0.3,
    typical_attribution: 0.9,
    typical_drop_off: 0.05,
    typical_duration_years: 2
  },
  {
    outcome_type: 'youth_engagement',
    outcome_description: 'Intergenerational connections strengthen',
    stakeholder_group: 'youth',
    unit_of_measurement: 'relationships',
    suggested_financial_proxy: 350,
    financial_proxy_source: 'Mentorship program value',
    financial_proxy_rationale: 'Value of elder-youth mentoring relationships',
    typical_deadweight: 0.25,
    typical_attribution: 0.75,
    typical_drop_off: 0.15,
    typical_duration_years: 2
  },
  {
    outcome_type: 'knowledge_transfer',
    outcome_description: 'Traditional knowledge preserved for future generations',
    stakeholder_group: 'community',
    unit_of_measurement: 'knowledge_items',
    suggested_financial_proxy: 1000,
    financial_proxy_source: 'Documentation cost to recreate',
    financial_proxy_rationale: 'Cost if this knowledge were lost and needed recreation',
    typical_deadweight: 0.1,
    typical_attribution: 1.0,
    typical_drop_off: 0.0, // Knowledge doesn't decay
    typical_duration_years: 10 // Long-term preservation
  },
  {
    outcome_type: 'policy_influence',
    outcome_description: 'Stories provide evidence for policy changes',
    stakeholder_group: 'policymakers',
    unit_of_measurement: 'policy_changes',
    suggested_financial_proxy: 5000,
    financial_proxy_source: 'Research commissioning cost',
    financial_proxy_rationale: 'Value of community-generated evidence',
    typical_deadweight: 0.4,
    typical_attribution: 0.6,
    typical_drop_off: 0.2,
    typical_duration_years: 5
  }
]

/**
 * Get suggested outcome template
 */
export function getOutcomeTemplate(outcomeType: OutcomeType): OutcomeTemplate | undefined {
  return OUTCOME_TEMPLATES.find(t => t.outcome_type === outcomeType)
}

// ============================================================================
// SANKEY DIAGRAM DATA GENERATION
// ============================================================================

export interface SankeyNode {
  name: string
  category: 'input' | 'outcome' | 'value'
}

export interface SankeyLink {
  source: string
  target: string
  value: number
}

/**
 * Generate Sankey diagram data for SROI visualization
 */
export function generateSROISankeyData(
  inputs: SROIInput,
  outcomes: SROIOutcome[]
): {
  nodes: SankeyNode[]
  links: SankeyLink[]
} {
  const nodes: SankeyNode[] = []
  const links: SankeyLink[] = []

  // Input node
  nodes.push({
    name: 'Investment',
    category: 'input'
  })

  // Outcome nodes
  const outcomeNodes = new Set<string>()
  outcomes.forEach(outcome => {
    const outcomeCategory = outcome.outcome_type.replace(/_/g, ' ')
    const nodeName = outcomeCategory.charAt(0).toUpperCase() + outcomeCategory.slice(1)

    if (!outcomeNodes.has(nodeName)) {
      outcomeNodes.add(nodeName)
      nodes.push({
        name: nodeName,
        category: 'outcome'
      })
    }
  })

  // Total value node
  nodes.push({
    name: 'Total Social Value',
    category: 'value'
  })

  // Links from investment to outcomes (proportional allocation)
  outcomeNodes.forEach(outcomeName => {
    const relatedOutcomes = outcomes.filter(o => {
      const category = o.outcome_type.replace(/_/g, ' ')
      const name = category.charAt(0).toUpperCase() + category.slice(1)
      return name === outcomeName
    })

    const totalValue = relatedOutcomes.reduce((sum, o) => {
      const { total_value } = calculateOutcomeValue(o)
      return sum + total_value
    }, 0)

    // Link from investment to outcome (proportional)
    const proportion = totalValue / inputs.total_investment
    links.push({
      source: 'Investment',
      target: outcomeName,
      value: inputs.total_investment * proportion
    })

    // Link from outcome to total value
    links.push({
      source: outcomeName,
      target: 'Total Social Value',
      value: totalValue
    })
  })

  return { nodes, links }
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

export interface SROIReport {
  executive_summary: {
    sroi_ratio: number
    total_investment: number
    total_social_value: number
    net_social_value: number
    key_findings: string[]
  }
  outcomes_by_stakeholder: Record<StakeholderGroup, {
    count: number
    total_value: number
    percentage_of_total: number
  }>
  outcomes_by_type: Record<OutcomeType, {
    count: number
    total_value: number
    percentage_of_total: number
  }>
  sensitivity_analysis: {
    conservative_ratio: number
    base_ratio: number
    optimistic_ratio: number
  }
  recommendations: string[]
}

/**
 * Generate comprehensive SROI report
 */
export function generateSROIReport(
  inputs: SROIInput,
  outcomes: SROIOutcome[]
): SROIReport {
  const sroiCalc = calculateSROI(inputs, outcomes)
  const sensitivity = performSensitivityAnalysis(inputs, outcomes)

  // Group by stakeholder
  const outcomesByStakeholder: Record<string, { count: number; total_value: number }> = {}
  outcomes.forEach(outcome => {
    if (!outcomesByStakeholder[outcome.stakeholder_group]) {
      outcomesByStakeholder[outcome.stakeholder_group] = { count: 0, total_value: 0 }
    }

    const { total_value } = calculateOutcomeValue(outcome)
    outcomesByStakeholder[outcome.stakeholder_group].count++
    outcomesByStakeholder[outcome.stakeholder_group].total_value += total_value
  })

  // Group by type
  const outcomesByType: Record<string, { count: number; total_value: number }> = {}
  outcomes.forEach(outcome => {
    if (!outcomesByType[outcome.outcome_type]) {
      outcomesByType[outcome.outcome_type] = { count: 0, total_value: 0 }
    }

    const { total_value } = calculateOutcomeValue(outcome)
    outcomesByType[outcome.outcome_type].count++
    outcomesByType[outcome.outcome_type].total_value += total_value
  })

  // Add percentages
  const stakeholderWithPercentages = Object.fromEntries(
    Object.entries(outcomesByStakeholder).map(([key, value]) => [
      key,
      {
        ...value,
        percentage_of_total: (value.total_value / sroiCalc.total_social_value) * 100
      }
    ])
  )

  const typeWithPercentages = Object.fromEntries(
    Object.entries(outcomesByType).map(([key, value]) => [
      key,
      {
        ...value,
        percentage_of_total: (value.total_value / sroiCalc.total_social_value) * 100
      }
    ])
  )

  // Key findings
  const key_findings: string[] = [
    `For every $1 invested, $${sroiCalc.sroi_ratio.toFixed(2)} in social value was created`,
    `Total of ${outcomes.length} outcomes tracked across ${Object.keys(stakeholderWithPercentages).length} stakeholder groups`,
    `Net social value (benefit minus cost): $${sroiCalc.net_social_value.toLocaleString()}`
  ]

  // Recommendations
  const recommendations: string[] = []

  if (sroiCalc.sroi_ratio > 3) {
    recommendations.push('Strong social return demonstrates high value. Consider scaling the program.')
  }

  if (sroiCalc.sroi_ratio < 1.5) {
    recommendations.push('Explore ways to increase outcomes or reduce costs for better social return.')
  }

  const highestValueStakeholder = Object.entries(stakeholderWithPercentages)
    .sort((a, b) => b[1].total_value - a[1].total_value)[0]

  if (highestValueStakeholder) {
    recommendations.push(
      `Focus on ${highestValueStakeholder[0]} outcomes, which represent ${highestValueStakeholder[1].percentage_of_total.toFixed(0)}% of total value.`
    )
  }

  return {
    executive_summary: {
      sroi_ratio: sroiCalc.sroi_ratio,
      total_investment: sroiCalc.total_investment,
      total_social_value: sroiCalc.total_social_value,
      net_social_value: sroiCalc.net_social_value,
      key_findings
    },
    outcomes_by_stakeholder: stakeholderWithPercentages as any,
    outcomes_by_type: typeWithPercentages as any,
    sensitivity_analysis: {
      conservative_ratio: sensitivity.conservative.sroi_ratio,
      base_ratio: sensitivity.base.sroi_ratio,
      optimistic_ratio: sensitivity.optimistic.sroi_ratio
    },
    recommendations
  }
}
