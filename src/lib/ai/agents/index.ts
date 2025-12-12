/**
 * Agent System Exports
 *
 * Central export point for the Empathy Ledger agent orchestration system.
 */

// Types
export * from './types'

// Recipes
export {
  AGENT_RECIPES,
  getAgentRecipe,
  getHumanInLoopAgents,
  getAgentGuardrails,
  hasGuardrail,
  getBlockingGuardrails,
  MODEL_PRICING,
  estimateCost
} from './recipes'

// Orchestrator
export {
  AgentOrchestrator,
  agentOrchestrator,
  analyzeInterview,
  synthesizeInsights,
  draftDeEscalation,
  type OrchestratorConfig
} from './orchestrator'

// Re-export eval thresholds for convenience
export {
  DEFAULT_EVAL_THRESHOLDS,
  HIGH_SENSITIVITY_THRESHOLDS,
  AGENT_THRESHOLD_OVERRIDES,
  getEffectiveThresholds,
  evaluateAgainstThresholds,
  passesCI,
  type EvalThresholds,
  type EvalResult
} from '../evals/thresholds'
