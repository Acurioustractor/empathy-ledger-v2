/**
 * Agent System Type Definitions
 *
 * Core types for the Empathy Ledger agent orchestration system.
 * These types define the contract between agents, the orchestrator,
 * and the evaluation/telemetry infrastructure.
 */

export type AgentName =
  | 'consent-intake'
  | 'interview-analyzer'
  | 'de-escalator'
  | 'insight-synthesizer'
  | 'playbook-composer'
  | 'governance-sentinel'
  | 'cost-steward'

export type SensitivityLevel = 'low' | 'medium' | 'high' | 'sacred'

export interface AgentContext {
  tenantId: string
  userId: string
  projectId?: string
  storyId?: string
  transcriptId?: string
  storytellerId?: string
  sensitivityLevel: SensitivityLevel
  culturalAffiliations?: string[]
  consentScope?: string[]
}

export interface AgentRequest {
  agentName: AgentName
  context: AgentContext
  input: Record<string, unknown>
  options?: {
    maxTokens?: number
    temperature?: number
    streaming?: boolean
    timeout?: number
  }
}

export interface AgentResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  citations?: Citation[]
  metadata: AgentMetadata
}

export interface Citation {
  transcriptId: string
  segmentIndex: number
  text: string
  confidence: number
}

export interface AgentMetadata {
  agentName: AgentName
  model: string
  inputTokens: number
  outputTokens: number
  durationMs: number
  costUsdEstimate: number
  safetyStatus: 'approved' | 'flagged' | 'blocked' | 'elder_review_required'
  evalScore?: number
  consentVerified: boolean
}

export interface AgentRecipe {
  name: AgentName
  displayName: string
  description: string
  defaultModel: string
  fallbackModel: string
  maxInputTokens: number
  maxOutputTokens: number
  requiredTools: string[]
  guardrails: GuardrailConfig[]
  humanInLoopRequired: boolean
  kpis: string[]
}

export interface GuardrailConfig {
  type: 'consent' | 'pii' | 'cultural' | 'jurisdiction' | 'toxicity' | 'budget'
  blocking: boolean
  threshold?: number
  action: 'block' | 'flag' | 'elder_review' | 'redact'
}

// Interview Analyzer specific types
export interface InterviewAnalysisInput {
  transcriptIds: string[]
  focusAreas?: string[]
  includeEmotionTrajectory?: boolean
  includeRiskTriggers?: boolean
}

export interface InterviewAnalysisOutput {
  themes: ThemeResult[]
  emotionTrajectory?: EmotionPoint[]
  riskTriggers?: RiskTrigger[]
  empathyScore: number
  keyQuotes: Citation[]
  actionableInsights: string[]
}

export interface ThemeResult {
  theme: string
  supportCount: number
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  exemplarQuotes: Citation[]
}

export interface EmotionPoint {
  timestamp: string
  emotion: string
  intensity: number
  context: string
}

export interface RiskTrigger {
  trigger: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  mentions: Citation[]
  recommendedAction: string
}

// De-escalator specific types
export interface DeEscalationInput {
  ticketThread: string[]
  profileContext?: {
    culturalBackground?: string
    previousInteractions?: string[]
    sensitivityLevel: SensitivityLevel
  }
}

export interface DeEscalationOutput {
  draftResponse: string
  proofOfEmpathy: string[]
  followUpActions: FollowUpAction[]
  toneAnalysis: {
    original: string
    suggested: string
  }
}

export interface FollowUpAction {
  action: string
  owner: string
  deadline?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

// Consent Intake specific types
export interface ConsentIntakeInput {
  rawContent: string
  contentType: 'transcript' | 'notes' | 'media'
  sourceMetadata: {
    filename?: string
    recordedAt?: string
    recordedBy?: string
    location?: string
  }
  providedConsent?: {
    verbalConsent: boolean
    writtenConsent: boolean
    consentScope?: string[]
  }
}

export interface ConsentIntakeOutput {
  normalizedContent: string
  segments: TranscriptSegment[]
  consentFlags: ConsentFlag[]
  piiTokens: PIIToken[]
  provenanceRecord: ProvenanceRecord
  validationStatus: 'valid' | 'incomplete' | 'requires_review'
}

export interface TranscriptSegment {
  index: number
  text: string
  speaker?: string
  startTime?: number
  endTime?: number
  confidence: number
}

export interface ConsentFlag {
  type: 'verbal' | 'written' | 'implied' | 'missing'
  scope: string[]
  timestamp?: string
  verified: boolean
}

export interface PIIToken {
  original: string
  token: string
  type: 'name' | 'location' | 'contact' | 'identifier' | 'other'
  redactInOutput: boolean
}

export interface ProvenanceRecord {
  sourceId: string
  sourceType: string
  ingestedAt: string
  ingestedBy: string
  transformations: string[]
  lineage: string[]
}

// Insight Synthesizer specific types
export interface InsightSynthesisInput {
  transcriptIds: string[]
  timeRange?: {
    start: string
    end: string
  }
  groupBy?: 'project' | 'storyteller' | 'theme'
}

export interface InsightSynthesisOutput {
  themeClusters: ThemeCluster[]
  empathyScoreTrend: TrendPoint[]
  emergingNeeds: EmergingNeed[]
  visualizationData: Record<string, unknown>
}

export interface ThemeCluster {
  clusterId: string
  name: string
  supportCount: number
  exemplarQuotes: Citation[]
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'
  consentConfidence: number
}

export interface TrendPoint {
  date: string
  score: number
  sampleSize: number
}

export interface EmergingNeed {
  need: string
  firstObserved: string
  frequency: number
  urgency: 'low' | 'medium' | 'high'
  relatedThemes: string[]
}

// Playbook Composer specific types
export interface PlaybookInput {
  segmentDefinition: {
    criteria: Record<string, unknown>
    count: number
  }
  goals: string[]
  budgetEnvelope?: number
  approvalRequired: boolean
}

export interface PlaybookOutput {
  playbookId: string
  steps: PlaybookStep[]
  messageDrafts: MessageDraft[]
  requiredApprovals: ApprovalRequest[]
  estimatedCost: number
  estimatedImpact: string
}

export interface PlaybookStep {
  order: number
  action: string
  channel: 'email' | 'sms' | 'push' | 'in-app'
  timing: string
  condition?: string
}

export interface MessageDraft {
  stepOrder: number
  subject?: string
  body: string
  personalizationFields: string[]
}

export interface ApprovalRequest {
  approver: string
  reason: string
  deadline: string
}

// Governance Sentinel types
export interface GovernanceCheckInput {
  request: AgentRequest
  response?: Partial<AgentResponse>
  phase: 'pre' | 'post'
}

export interface GovernanceCheckOutput {
  allowed: boolean
  reason?: string
  flags: GovernanceFlag[]
  auditEntry: AuditEntry
  escalations?: EscalationRequest[]
}

export interface GovernanceFlag {
  type: 'pii' | 'cultural' | 'consent' | 'jurisdiction' | 'hallucination' | 'toxicity'
  severity: 'info' | 'warning' | 'error' | 'critical'
  details: string
  location?: string
}

export interface AuditEntry {
  timestamp: string
  agentName: AgentName
  decision: 'allow' | 'deny' | 'flag' | 'escalate'
  reason: string
  context: Record<string, unknown>
}

export interface EscalationRequest {
  to: 'elder' | 'admin' | 'compliance'
  reason: string
  urgency: 'routine' | 'important' | 'urgent' | 'critical'
  contentId?: string
}

// Cost Steward types
export interface CostStewartInput {
  request: AgentRequest
  estimatedTokens: number
}

export interface CostStewartOutput {
  selectedModel: string
  costEstimate: number
  withinBudget: boolean
  recommendation: 'proceed' | 'downgrade' | 'block' | 'queue'
  budgetRemaining: number
  sloCompliant: boolean
}
