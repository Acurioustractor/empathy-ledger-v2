/**
 * Agent Recipes Configuration
 *
 * Defines the 7 canonical agent recipes for Empathy Ledger.
 * Each recipe specifies the agent's capabilities, constraints, and guardrails.
 */

import type { AgentRecipe, AgentName } from './types'

export const AGENT_RECIPES: Record<AgentName, AgentRecipe> = {
  'consent-intake': {
    name: 'consent-intake',
    displayName: 'Consent & Intake Orchestrator',
    description:
      'Ingest transcripts, notes, and media; verify consent and cultural protocols; normalize into ledger records with lineage.',
    defaultModel: 'gpt-4o',
    fallbackModel: 'gpt-4o-mini',
    maxInputTokens: 8000,
    maxOutputTokens: 4000,
    requiredTools: ['supabase-storage', 'pii-tokenizer', 'consent-verifier'],
    guardrails: [
      { type: 'consent', blocking: true, action: 'block' },
      { type: 'pii', blocking: true, action: 'redact' },
      { type: 'jurisdiction', blocking: true, action: 'block' },
      { type: 'cultural', blocking: false, action: 'flag' }
    ],
    humanInLoopRequired: false,
    kpis: [
      'intake_sla_seconds',
      'consent_coverage_rate',
      'pii_redaction_accuracy',
      'lineage_coverage_rate'
    ]
  },

  'interview-analyzer': {
    name: 'interview-analyzer',
    displayName: 'Interview Analyzer',
    description:
      'Extract themes, intents, and risk drivers from interviews; produce empathy scores and actionable root causes.',
    defaultModel: 'gpt-4o',
    fallbackModel: 'gpt-4o-mini',
    maxInputTokens: 16000,
    maxOutputTokens: 4000,
    requiredTools: ['embeddings-store', 'sentiment-analyzer', 'quote-extractor'],
    guardrails: [
      { type: 'consent', blocking: true, action: 'block' },
      { type: 'cultural', blocking: true, action: 'elder_review' },
      { type: 'pii', blocking: false, action: 'redact' }
    ],
    humanInLoopRequired: false,
    kpis: [
      'time_to_insight_seconds',
      'human_label_agreement_rate',
      'theme_coverage_rate',
      'hallucination_rate',
      'citation_coverage'
    ]
  },

  'de-escalator': {
    name: 'de-escalator',
    displayName: 'Escalation De-escalator',
    description:
      'Draft de-escalation responses and action plans for high-heat tickets or community concerns; keep tone culturally safe.',
    defaultModel: 'gpt-4o',
    fallbackModel: 'gpt-4o-mini',
    maxInputTokens: 8000,
    maxOutputTokens: 2000,
    requiredTools: ['tone-analyzer', 'template-library', 'notification-connector'],
    guardrails: [
      { type: 'consent', blocking: true, action: 'block' },
      { type: 'cultural', blocking: true, action: 'elder_review' },
      { type: 'toxicity', blocking: true, threshold: 0.3, action: 'block' },
      { type: 'pii', blocking: true, action: 'redact' }
    ],
    humanInLoopRequired: true, // Always requires human approval before sending
    kpis: [
      'human_edit_distance',
      'csat_delta_post_response',
      'turnaround_time_seconds',
      'policy_violation_rate'
    ]
  },

  'insight-synthesizer': {
    name: 'insight-synthesizer',
    displayName: 'Empathy Insight Synthesizer',
    description:
      'Cluster themes across transcripts/stories, trend empathy scores over time, surface emerging needs.',
    defaultModel: 'gpt-4o',
    fallbackModel: 'gpt-4o-mini',
    maxInputTokens: 32000,
    maxOutputTokens: 8000,
    requiredTools: ['analytics-aggregator', 'clustering-pipeline', 'cache-manager'],
    guardrails: [
      { type: 'consent', blocking: true, action: 'block' },
      { type: 'cultural', blocking: false, action: 'flag' },
      { type: 'pii', blocking: true, action: 'redact' }
    ],
    humanInLoopRequired: false,
    kpis: [
      'freshness_lag_seconds',
      'cluster_purity_score',
      'tenant_coverage_rate',
      'dashboard_load_time_ms'
    ]
  },

  'playbook-composer': {
    name: 'playbook-composer',
    displayName: 'Intervention Playbook Composer',
    description:
      'Generate tailored playbooks (messages, offers, actions) for segments such as churn risk, donor retention, or partner updates.',
    defaultModel: 'gpt-4o',
    fallbackModel: 'gpt-4o-mini',
    maxInputTokens: 8000,
    maxOutputTokens: 4000,
    requiredTools: ['template-library', 'cost-estimator', 'experiment-runner', 'approval-workflow'],
    guardrails: [
      { type: 'consent', blocking: true, action: 'block' },
      { type: 'budget', blocking: true, action: 'block' },
      { type: 'cultural', blocking: false, action: 'flag' },
      { type: 'pii', blocking: true, action: 'redact' }
    ],
    humanInLoopRequired: true, // Human-in-the-loop before scheduling sends
    kpis: [
      'activation_rate',
      'conversion_uplift',
      'time_to_draft_seconds',
      'budget_adherence_rate'
    ]
  },

  'governance-sentinel': {
    name: 'governance-sentinel',
    displayName: 'Governance and Safety Sentinel',
    description:
      'Enforce PII handling, cultural protocol adherence, jurisdictional rules, and refusal logic across all agents.',
    defaultModel: 'gpt-4o-mini', // Use lighter model for speed
    fallbackModel: 'gpt-4o-mini',
    maxInputTokens: 4000,
    maxOutputTokens: 1000,
    requiredTools: ['policy-engine', 'pii-detector', 'jurisdiction-map', 'audit-logger'],
    guardrails: [], // This IS the guardrail agent
    humanInLoopRequired: false,
    kpis: [
      'pii_false_negative_rate',
      'policy_coverage_rate',
      'decision_latency_ms',
      'escalation_rate'
    ]
  },

  'cost-steward': {
    name: 'cost-steward',
    displayName: 'Cost and SLO Steward',
    description:
      'Route to cheapest safe model, enforce budget per tenant/project, and track latency SLOs.',
    defaultModel: 'gpt-4o-mini', // Lightweight for fast decisions
    fallbackModel: 'gpt-4o-mini',
    maxInputTokens: 2000,
    maxOutputTokens: 500,
    requiredTools: ['model-catalog', 'budget-tracker', 'circuit-breaker'],
    guardrails: [],
    humanInLoopRequired: false,
    kpis: [
      'cost_per_successful_run',
      'latency_slo_compliance_rate',
      'budget_breach_rate',
      'downgrade_rate'
    ]
  }
}

/**
 * Get recipe by agent name
 */
export function getAgentRecipe(agentName: AgentName): AgentRecipe {
  const recipe = AGENT_RECIPES[agentName]
  if (!recipe) {
    throw new Error(`Unknown agent: ${agentName}`)
  }
  return recipe
}

/**
 * Get all recipes that require human-in-the-loop
 */
export function getHumanInLoopAgents(): AgentName[] {
  return Object.entries(AGENT_RECIPES)
    .filter(([, recipe]) => recipe.humanInLoopRequired)
    .map(([name]) => name as AgentName)
}

/**
 * Get guardrails for an agent
 */
export function getAgentGuardrails(agentName: AgentName) {
  return AGENT_RECIPES[agentName]?.guardrails || []
}

/**
 * Check if agent has a specific guardrail type
 */
export function hasGuardrail(
  agentName: AgentName,
  guardrailType: string
): boolean {
  const guardrails = getAgentGuardrails(agentName)
  return guardrails.some((g) => g.type === guardrailType)
}

/**
 * Get blocking guardrails for an agent
 */
export function getBlockingGuardrails(agentName: AgentName) {
  return getAgentGuardrails(agentName).filter((g) => g.blocking)
}

/**
 * Model pricing per 1K tokens (approximate, for cost estimation)
 */
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'claude-3-5-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 }
}

/**
 * Estimate cost for a request
 */
export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['gpt-4o-mini']
  return (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output
}
