# Agent Orchestration Architecture

## Overview

Empathy Ledger uses a multi-agent system orchestrated through a central `AgentOrchestrator` that coordinates AI operations with cultural safety, governance, cost management, and telemetry.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Request                               │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AgentOrchestrator                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 Pre-Flight Checks                        │    │
│  │  1. Cost Steward → Budget/model selection                │    │
│  │  2. Cultural Safety → OCAP/sensitivity analysis          │    │
│  │  3. Governance Sentinel → Consent/PII/jurisdiction       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Agent Execution                        │    │
│  │  Recipe-specific logic with cultural safety prompts      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 Post-Flight Checks                       │    │
│  │  1. Governance Sentinel → Output PII/hallucination       │    │
│  │  2. Eval Scoring → Against thresholds                    │    │
│  │  3. Telemetry → ai_usage_events                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AgentResponse                               │
│  { success, data, citations, metadata }                          │
└─────────────────────────────────────────────────────────────────┘
```

## Agent Recipes

Seven canonical agents, each with specific roles and guardrails:

| Agent | Purpose | Human-in-Loop | Key Guardrails |
|-------|---------|---------------|----------------|
| **consent-intake** | Ingest content, verify consent, normalize records | No | consent, pii, jurisdiction |
| **interview-analyzer** | Extract themes, empathy scores, risk drivers | No | consent, cultural, pii |
| **de-escalator** | Draft de-escalation responses | **Yes** | consent, cultural, toxicity, pii |
| **insight-synthesizer** | Cluster themes, trend scores, surface needs | No | consent, cultural, pii |
| **playbook-composer** | Generate intervention playbooks | **Yes** | consent, budget, cultural, pii |
| **governance-sentinel** | Enforce policies across all agents | No | (is the guardrail) |
| **cost-steward** | Route models, enforce budgets, track SLOs | No | (is the guardrail) |

## Flow Details

### 1. Pre-Flight Checks

Before any agent executes:

```typescript
// Cost check - selects model based on budget
const costCheck = await checkCostAndBudget(request)
if (!costCheck.withinBudget) {
  // Try fallback model or block
}

// Cultural safety - OCAP principles
const safetyResult = await culturalSafetyAI.analyzeCulturalSafety({
  content,
  user_id,
  context_type,
  cultural_metadata
})

// Governance - consent, PII, jurisdiction
const governanceCheck = await performGovernanceCheck(request, 'pre')
```

### 2. Agent Execution

Each agent receives a culturally-aware prompt:

```typescript
const prompt = `You are the ${recipe.displayName} for Empathy Ledger...

CULTURAL SAFETY REQUIREMENTS:
- Respect OCAP principles
- Content sensitivity level: ${context.sensitivityLevel}
- Cultural affiliations: ${context.culturalAffiliations}
- Always cite sources
- Never make speculative claims
- Flag content requiring elder review

GUARDRAILS:
${recipe.guardrails.map(g => `- ${g.type}: ${g.action}`)}
`
```

### 3. Post-Flight Checks

After execution:

```typescript
// Check output for PII
const postCheck = await performGovernanceCheck(request, 'post', result)

// Run eval against thresholds
const evalResult = evaluateAgainstThresholds(
  agentName,
  { empathyScore, citationCoverage, latencyMs },
  sensitivityLevel
)

// Record telemetry
await supabase.from('ai_usage_events').insert({
  tenant_id, agent_name, model,
  input_tokens, output_tokens, duration_ms,
  cost_usd_estimate, safety_status, eval_score
})
```

## Guardrail Types

| Type | Description | Blocking Actions |
|------|-------------|------------------|
| `consent` | Verify content has valid consent metadata | `block` |
| `pii` | Detect/redact personal information | `redact`, `block` |
| `cultural` | Check for sacred/sensitive content | `elder_review`, `flag` |
| `jurisdiction` | Validate geographic/legal constraints | `block` |
| `toxicity` | Detect harmful content | `block` |
| `budget` | Enforce cost limits | `block`, `downgrade` |

## Evaluation Thresholds

Thresholds vary by sensitivity level:

| Metric | Default | High Sensitivity | Sacred |
|--------|---------|------------------|--------|
| Empathy Min Score | 3.5 | 4.0 | 4.0 |
| Max Hallucination Rate | 5% | 1% | 1% |
| Min Citation Coverage | 90% | 98% | 98% |
| Sacred Detection Rate | 95% | 99% | 99% |
| Max P95 Latency | 5s | 10s | 10s |

Agent-specific overrides:

- **de-escalator**: empathy.minScore = 4.5 (highest bar)
- **interview-analyzer**: empathy.minScore = 4.0
- **governance-sentinel**: maxHallucinationRate = 0.1%

## Database Schema

### ai_usage_events

```sql
CREATE TABLE ai_usage_events (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  agent_name TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  duration_ms INTEGER,
  cost_usd_estimate DECIMAL(10,6),
  safety_status TEXT,
  consent_verified BOOLEAN,
  eval_score DECIMAL(5,2),
  success BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### tenant_ai_policies

```sql
CREATE TABLE tenant_ai_policies (
  tenant_id UUID PRIMARY KEY,
  allowed_models TEXT[],
  blocked_models TEXT[],
  max_cost_per_request DECIMAL(10,4),
  monthly_budget_usd DECIMAL(10,2),
  require_consent_for_agents TEXT[],
  auto_downgrade_enabled BOOLEAN
);
```

## Usage Example

```typescript
import { agentOrchestrator, analyzeInterview } from '@/lib/ai/agents'

// Full orchestrator usage
const response = await agentOrchestrator.execute({
  agentName: 'interview-analyzer',
  context: {
    tenantId: 'org-123',
    userId: 'user-456',
    transcriptId: 'transcript-789',
    sensitivityLevel: 'medium',
    culturalAffiliations: ['First Nations'],
    consentScope: ['research', 'publication']
  },
  input: {
    transcriptIds: ['transcript-789'],
    focusAreas: ['housing', 'employment'],
    includeEmotionTrajectory: true
  }
})

// Or use convenience function
const insights = await analyzeInterview(
  ['transcript-789'],
  context,
  { maxTokens: 4000 }
)
```

## Elder Review Flow

When content requires elder review:

```
1. Agent detects sacred/sensitive content
2. Orchestrator sets safetyStatus = 'elder_review_required'
3. Creates entry in elder_review_queue
4. Notifies assigned elder
5. Elder approves/rejects in dashboard
6. Content status updated, author notified
```

## Cost Management

The Cost Steward enforces:

1. **Per-request limits**: Blocks if single request exceeds max
2. **Monthly budgets**: Tracks cumulative spend per tenant
3. **Auto-downgrade**: Falls back to cheaper models when budget tight
4. **Circuit breaking**: Stops requests when limits reached

## File Structure

```
src/lib/ai/
├── agents/
│   ├── index.ts          # Exports
│   ├── types.ts          # Type definitions
│   ├── recipes.ts        # Agent configurations
│   └── orchestrator.ts   # Main orchestration logic
├── evals/
│   └── thresholds.ts     # Eval thresholds and scoring
├── cultural-safety-middleware.ts
└── cultural-safety-moderation.ts
```
