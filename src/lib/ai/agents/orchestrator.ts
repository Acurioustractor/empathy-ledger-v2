/**
 * Agent Orchestrator
 *
 * Central orchestration layer for the Empathy Ledger agent system.
 * Coordinates agent execution with:
 * - Cultural safety middleware
 * - Governance checks
 * - Cost/budget management
 * - Telemetry and eval scoring
 */

import { openai } from '@ai-sdk/openai'
import { generateObject, generateText } from 'ai'
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'
import { culturalSafetyAI, type CulturalSafetyResult } from '../cultural-safety-middleware'
import { culturalSafetyModerationSystem } from '../cultural-safety-moderation'
import { evaluateAgainstThresholds, getEffectiveThresholds, type EvalResult } from '../evals/thresholds'
import { getAgentRecipe, estimateCost, AGENT_RECIPES } from './recipes'
import type {
  AgentName,
  AgentRequest,
  AgentResponse,
  AgentMetadata,
  AgentContext,
  GovernanceCheckOutput,
  GovernanceFlag,
  CostStewartOutput,
  SensitivityLevel
} from './types'

export interface OrchestratorConfig {
  enableTelemetry: boolean
  enableEvals: boolean
  enforcebudgets: boolean
  defaultTimeout: number
}

const DEFAULT_CONFIG: OrchestratorConfig = {
  enableTelemetry: true,
  enableEvals: true,
  enforcebudgets: true,
  defaultTimeout: 30000
}

export class AgentOrchestrator {
  private config: OrchestratorConfig
  private get supabase() {
    return createSupabaseServerClient()
  }

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Execute an agent with full orchestration
   */
  async execute<T = unknown>(request: AgentRequest): Promise<AgentResponse<T>> {
    const startTime = Date.now()
    const recipe = getAgentRecipe(request.agentName)

    try {
      // 1. Pre-flight: Cost steward check
      const costCheck = await this.checkCostAndBudget(request)
      if (!costCheck.withinBudget && this.config.enforcebudgets) {
        return this.createBlockedResponse(
          request,
          `Budget exceeded: ${costCheck.recommendation}`,
          startTime
        )
      }

      // 2. Pre-flight: Cultural safety check
      const safetyResult = await this.performCulturalSafetyCheck(request)
      if (!safetyResult.approved && safetyResult.safety_level === 'blocked') {
        return this.createBlockedResponse(
          request,
          `Cultural safety: ${safetyResult.detected_concerns.join(', ')}`,
          startTime
        )
      }

      // 3. Pre-flight: Governance sentinel check
      const governanceCheck = await this.performGovernanceCheck(request, 'pre')
      if (!governanceCheck.allowed) {
        return this.createBlockedResponse(
          request,
          `Governance: ${governanceCheck.reason}`,
          startTime
        )
      }

      // 4. Execute the agent
      const model = costCheck.selectedModel || recipe.defaultModel
      const agentResult = await this.executeAgent<T>(request, model)

      // 5. Post-flight: Governance check on output
      const postCheck = await this.performGovernanceCheck(
        request,
        'post',
        agentResult
      )

      // 6. Build response metadata
      const durationMs = Date.now() - startTime
      const metadata: AgentMetadata = {
        agentName: request.agentName,
        model,
        inputTokens: agentResult.inputTokens || 0,
        outputTokens: agentResult.outputTokens || 0,
        durationMs,
        costUsdEstimate: estimateCost(
          model,
          agentResult.inputTokens || 0,
          agentResult.outputTokens || 0
        ),
        safetyStatus: this.determineSafetyStatus(safetyResult, governanceCheck, postCheck),
        consentVerified: safetyResult.cultural_context?.requires_elder_approval !== true
      }

      // 7. Run eval if enabled
      if (this.config.enableEvals) {
        const evalResult = await this.runEval(request, agentResult, metadata)
        metadata.evalScore = evalResult.overallScore
      }

      // 8. Record telemetry
      if (this.config.enableTelemetry) {
        await this.recordUsageEvent(request, metadata, postCheck)
      }

      // 9. Handle elder review requirement
      if (safetyResult.elder_review_required || postCheck.escalations?.length) {
        return {
          success: true,
          data: agentResult.data as T,
          citations: agentResult.citations,
          metadata: {
            ...metadata,
            safetyStatus: 'elder_review_required'
          }
        }
      }

      return {
        success: true,
        data: agentResult.data as T,
        citations: agentResult.citations,
        metadata
      }
    } catch (error) {
      const durationMs = Date.now() - startTime
      console.error(`Agent ${request.agentName} failed:`, error)

      // Record failure telemetry
      if (this.config.enableTelemetry) {
        await this.recordFailure(request, error, durationMs)
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          agentName: request.agentName,
          model: recipe.defaultModel,
          inputTokens: 0,
          outputTokens: 0,
          durationMs,
          costUsdEstimate: 0,
          safetyStatus: 'blocked',
          consentVerified: false
        }
      }
    }
  }

  /**
   * Check cost and budget constraints
   */
  private async checkCostAndBudget(request: AgentRequest): Promise<CostStewartOutput> {
    const recipe = getAgentRecipe(request.agentName)

    // Get tenant policy
    const { data: policy } = await this.supabase
      .from('tenant_ai_policies')
      .select('*')
      .eq('tenant_id', request.context.tenantId)
      .single()

    // Estimate tokens based on input size
    const inputJson = JSON.stringify(request.input)
    const estimatedInputTokens = Math.ceil(inputJson.length / 4) // Rough estimate
    const estimatedOutputTokens = recipe.maxOutputTokens / 2 // Conservative estimate

    // Calculate cost
    const cost = estimateCost(
      recipe.defaultModel,
      estimatedInputTokens,
      estimatedOutputTokens
    )

    // Check budget
    const budgetLimit = policy?.max_cost_per_request || 1.0 // Default $1 max
    const monthlyBudget = policy?.monthly_budget_usd || 1000
    const currentMonthSpend = policy?.current_month_spend || 0

    const withinBudget = cost <= budgetLimit && currentMonthSpend + cost <= monthlyBudget

    // Determine model selection
    let selectedModel = recipe.defaultModel
    let recommendation: 'proceed' | 'downgrade' | 'block' | 'queue' = 'proceed'

    if (!withinBudget) {
      // Try fallback model
      const fallbackCost = estimateCost(
        recipe.fallbackModel,
        estimatedInputTokens,
        estimatedOutputTokens
      )

      if (fallbackCost <= budgetLimit && currentMonthSpend + fallbackCost <= monthlyBudget) {
        selectedModel = recipe.fallbackModel
        recommendation = 'downgrade'
      } else {
        recommendation = 'block'
      }
    }

    return {
      selectedModel,
      costEstimate: cost,
      withinBudget: recommendation !== 'block',
      recommendation,
      budgetRemaining: monthlyBudget - currentMonthSpend,
      sloCompliant: true
    }
  }

  /**
   * Perform cultural safety analysis
   */
  private async performCulturalSafetyCheck(
    request: AgentRequest
  ): Promise<CulturalSafetyResult> {
    const inputText = JSON.stringify(request.input)

    // Map 'sacred' to 'high' for the cultural safety middleware which only supports low/medium/high
    const mappedSensitivity = request.context.sensitivityLevel === 'sacred'
      ? 'high'
      : request.context.sensitivityLevel

    return culturalSafetyAI.analyzeCulturalSafety({
      content: inputText,
      user_id: request.context.userId,
      context_type: this.mapContextType(request),
      operation: 'analyse',
      cultural_metadata: {
        sensitivity_level: mappedSensitivity,
        sacred_content: request.context.sensitivityLevel === 'sacred',
        ceremonial_content: false,
        traditional_knowledge: false,
        requires_elder_approval: request.context.sensitivityLevel === 'sacred',
        cultural_affiliations: request.context.culturalAffiliations
      }
    })
  }

  /**
   * Perform governance check (pre or post execution)
   */
  private async performGovernanceCheck(
    request: AgentRequest,
    phase: 'pre' | 'post',
    response?: Partial<AgentResponse>
  ): Promise<GovernanceCheckOutput> {
    const recipe = getAgentRecipe(request.agentName)
    const flags: GovernanceFlag[] = []
    const escalations: Array<{
      to: 'elder' | 'admin' | 'compliance'
      reason: string
      urgency: 'routine' | 'important' | 'urgent' | 'critical'
      contentId?: string
    }> = []

    // Check consent guardrail
    if (recipe.guardrails.some((g) => g.type === 'consent' && g.blocking)) {
      const hasConsent = request.context.consentScope?.length ?? 0 > 0
      if (!hasConsent) {
        flags.push({
          type: 'consent',
          severity: 'error',
          details: 'No consent scope provided for content'
        })
      }
    }

    // Check cultural guardrail
    if (recipe.guardrails.some((g) => g.type === 'cultural')) {
      if (request.context.sensitivityLevel === 'sacred') {
        flags.push({
          type: 'cultural',
          severity: 'warning',
          details: 'Sacred content detected - may require elder review'
        })
        escalations.push({
          to: 'elder',
          reason: 'Sacred content requires elder approval',
          urgency: 'important',
          contentId: request.context.storyId
        })
      }
    }

    // Post-execution checks
    if (phase === 'post' && response?.data) {
      const responseText = JSON.stringify(response.data)

      // Check for PII in output
      if (recipe.guardrails.some((g) => g.type === 'pii')) {
        const piiPatterns = [
          /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
          /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
          /\b\d{3}[-]?\d{2}[-]?\d{4}\b/ // SSN-like
        ]

        for (const pattern of piiPatterns) {
          if (pattern.test(responseText)) {
            flags.push({
              type: 'pii',
              severity: 'error',
              details: 'Potential PII detected in output'
            })
            break
          }
        }
      }

      // Check citation coverage for interview-analyzer
      if (request.agentName === 'interview-analyzer') {
        const citations = response.citations || []
        if (citations.length === 0) {
          flags.push({
            type: 'hallucination',
            severity: 'warning',
            details: 'No citations provided - potential hallucination risk'
          })
        }
      }
    }

    // Determine if allowed
    const blockingFlags = flags.filter((f) => f.severity === 'error' || f.severity === 'critical')
    const allowed = blockingFlags.length === 0

    return {
      allowed,
      reason: blockingFlags.length > 0 ? blockingFlags.map((f) => f.details).join('; ') : undefined,
      flags,
      auditEntry: {
        timestamp: new Date().toISOString(),
        agentName: request.agentName,
        decision: allowed ? 'allow' : escalations.length > 0 ? 'escalate' : 'deny',
        reason: allowed ? 'All checks passed' : flags.map((f) => f.details).join('; '),
        context: {
          tenantId: request.context.tenantId,
          userId: request.context.userId,
          phase
        }
      },
      escalations: escalations.length > 0 ? escalations : undefined
    }
  }

  /**
   * Execute the actual agent logic
   */
  private async executeAgent<T>(
    request: AgentRequest,
    model: string
  ): Promise<{
    data: T
    citations?: AgentResponse['citations']
    inputTokens: number
    outputTokens: number
  }> {
    const recipe = getAgentRecipe(request.agentName)

    // Build agent-specific prompt
    const prompt = this.buildAgentPrompt(request)

    // Execute with AI SDK
    const result = await generateText({
      model: openai(model),
      prompt,
      maxOutputTokens: request.options?.maxTokens || recipe.maxOutputTokens,
      temperature: request.options?.temperature || 0.3
    })

    // Parse response based on agent type
    let data: T
    let citations: AgentResponse['citations']

    try {
      const parsed = JSON.parse(result.text)
      data = parsed.result || parsed
      citations = parsed.citations
    } catch {
      data = result.text as T
    }

    // Get token usage from result
    const inputTokens = result.usage?.totalTokens
      ? Math.floor(result.usage.totalTokens * 0.7) // Estimate input as 70%
      : 0
    const outputTokens = result.usage?.totalTokens
      ? Math.floor(result.usage.totalTokens * 0.3) // Estimate output as 30%
      : 0

    return {
      data,
      citations,
      inputTokens,
      outputTokens
    }
  }

  /**
   * Build prompt for specific agent type
   */
  private buildAgentPrompt(request: AgentRequest): string {
    const recipe = getAgentRecipe(request.agentName)

    const systemContext = `You are the ${recipe.displayName} agent for Empathy Ledger, a consent-first Indigenous storytelling platform.

AGENT ROLE: ${recipe.description}

CULTURAL SAFETY REQUIREMENTS:
- Respect OCAP principles (Ownership, Control, Access, Possession)
- Content sensitivity level: ${request.context.sensitivityLevel}
- Cultural affiliations: ${request.context.culturalAffiliations?.join(', ') || 'Not specified'}
- Always cite sources with transcript IDs and segment indices
- Never make speculative claims without evidence
- Flag any content that may require elder review

GUARDRAILS:
${recipe.guardrails.map((g) => `- ${g.type}: ${g.action} if triggered`).join('\n')}

REQUIRED OUTPUT FORMAT:
Return a JSON object with:
{
  "result": <your analysis/output>,
  "citations": [{"transcriptId": "...", "segmentIndex": N, "text": "...", "confidence": 0.0-1.0}],
  "flags": ["any concerns or notes"]
}
`

    const inputJson = JSON.stringify(request.input, null, 2)

    return `${systemContext}

INPUT:
${inputJson}

Provide your analysis following the specified format.`
  }

  /**
   * Run evaluation against thresholds
   */
  private async runEval(
    request: AgentRequest,
    result: { data: unknown; citations?: AgentResponse['citations'] },
    metadata: AgentMetadata
  ): Promise<EvalResult> {
    const citations = result.citations || []

    // Calculate metrics for eval
    const metrics = {
      empathyScore: this.extractEmpathyScore(result.data),
      citationCoverage: citations.length > 0 ? 1 : 0,
      latencyMs: metadata.durationMs,
      errorRate: 0
    }

    return evaluateAgainstThresholds(
      request.agentName,
      metrics,
      request.context.sensitivityLevel
    )
  }

  /**
   * Extract empathy score from result if present
   */
  private extractEmpathyScore(data: unknown): number | undefined {
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>
      if ('empathyScore' in obj && typeof obj.empathyScore === 'number') {
        return obj.empathyScore
      }
      if ('empathy_score' in obj && typeof obj.empathy_score === 'number') {
        return obj.empathy_score
      }
    }
    return undefined
  }

  /**
   * Record usage event for telemetry
   */
  private async recordUsageEvent(
    request: AgentRequest,
    metadata: AgentMetadata,
    governanceCheck: GovernanceCheckOutput
  ): Promise<void> {
    try {
      await this.supabase.from('ai_usage_events').insert({
        tenant_id: request.context.tenantId,
        user_id: request.context.userId,
        agent_name: request.agentName,
        model: metadata.model,
        input_tokens: metadata.inputTokens,
        output_tokens: metadata.outputTokens,
        duration_ms: metadata.durationMs,
        cost_usd_estimate: metadata.costUsdEstimate,
        safety_status: metadata.safetyStatus,
        consent_verified: metadata.consentVerified,
        project_id: request.context.projectId,
        story_id: request.context.storyId,
        eval_score: metadata.evalScore,
        governance_flags: governanceCheck.flags,
        success: true
      })
    } catch (error) {
      console.error('Failed to record usage event:', error)
    }
  }

  /**
   * Record failure event
   */
  private async recordFailure(
    request: AgentRequest,
    error: unknown,
    durationMs: number
  ): Promise<void> {
    try {
      await this.supabase.from('ai_usage_events').insert({
        tenant_id: request.context.tenantId,
        user_id: request.context.userId,
        agent_name: request.agentName,
        model: getAgentRecipe(request.agentName).defaultModel,
        input_tokens: 0,
        output_tokens: 0,
        duration_ms: durationMs,
        cost_usd_estimate: 0,
        safety_status: 'blocked',
        consent_verified: false,
        project_id: request.context.projectId,
        story_id: request.context.storyId,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
    } catch (err) {
      console.error('Failed to record failure event:', err)
    }
  }

  /**
   * Determine overall safety status
   */
  private determineSafetyStatus(
    safetyResult: CulturalSafetyResult,
    preCheck: GovernanceCheckOutput,
    postCheck: GovernanceCheckOutput
  ): AgentMetadata['safetyStatus'] {
    if (safetyResult.elder_review_required) return 'elder_review_required'
    if (!preCheck.allowed || !postCheck.allowed) return 'blocked'
    if (preCheck.flags.length > 0 || postCheck.flags.length > 0) return 'flagged'
    return 'approved'
  }

  /**
   * Create a blocked response
   */
  private createBlockedResponse<T>(
    request: AgentRequest,
    reason: string,
    startTime: number
  ): AgentResponse<T> {
    return {
      success: false,
      error: reason,
      metadata: {
        agentName: request.agentName,
        model: getAgentRecipe(request.agentName).defaultModel,
        inputTokens: 0,
        outputTokens: 0,
        durationMs: Date.now() - startTime,
        costUsdEstimate: 0,
        safetyStatus: 'blocked',
        consentVerified: false
      }
    }
  }

  /**
   * Map agent context to cultural safety context type
   */
  private mapContextType(request: AgentRequest): 'story' | 'profile' | 'media' | 'search' {
    if (request.context.storyId) return 'story'
    if (request.context.storytellerId) return 'profile'
    return 'search'
  }
}

// Export singleton instance
export const agentOrchestrator = new AgentOrchestrator()

// Convenience functions for common operations
export async function analyzeInterview(
  transcriptIds: string[],
  context: AgentContext,
  options?: AgentRequest['options']
) {
  return agentOrchestrator.execute({
    agentName: 'interview-analyzer',
    context,
    input: { transcriptIds },
    options
  })
}

export async function synthesizeInsights(
  transcriptIds: string[],
  context: AgentContext,
  options?: AgentRequest['options']
) {
  return agentOrchestrator.execute({
    agentName: 'insight-synthesizer',
    context,
    input: { transcriptIds },
    options
  })
}

export async function draftDeEscalation(
  ticketThread: string[],
  context: AgentContext,
  options?: AgentRequest['options']
) {
  return agentOrchestrator.execute({
    agentName: 'de-escalator',
    context,
    input: { ticketThread },
    options
  })
}
