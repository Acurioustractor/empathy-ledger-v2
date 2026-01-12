# ACT API Endpoints - ALMA-Compliant Impact Data

**Purpose**: API endpoints that return ALMA v2.0 signals and ACT framework data for grant reporting

**Philosophy**: Auto-generate funder narratives from database evidence

---

## 1. Storyteller Unified Analysis

### GET `/api/storytellers/[id]/unified-analysis`

**Purpose**: Retrieve complete ALMA signals + impact dimensions for a storyteller

**Response**:
```typescript
{
  id: string;
  storyteller_id: string;
  analysis_version: string;
  analyzed_at: string;

  // ALMA v2.0 Signals
  alma_signals: {
    authority: {
      level: "lived_experience" | "secondary" | "academic";
      cultural_positioning: string;
      voice_control: "full" | "shared" | "delegated";
      OCAP_compliance: boolean;
    };
    evidence_strength: {
      primary_source: boolean;
      cultural_verification: "elder_reviewed" | "community_approved" | "pending";
      corroboration_count: number;
    };
    harm_risk_inverted: {
      safety_score: number; // 0-1, inverted (high = safe)
      cultural_protocols_met: boolean;
      consent_violations: number;
    };
    capability: {
      knowledge_domains: string[];
      learning_pathways_opened: string[];
      capacity_built: string;
    };
    option_value: {
      future_applications: string[];
      handover_potential: string;
      commons_contribution: string;
    };
    community_value_return: {
      direct_benefits: string;
      capacity_building: string;
      fair_value_protection: boolean;
    };
  };

  // ACT Impact Dimensions
  impact_dimensions: {
    LCAA_rhythm: {
      listen: { methods: string[]; depth: string };
      curiosity: { questions_surfaced: string[] };
      action: { pathways_opened: string[] };
      art: { story_forms: string[] };
    };
    conservation_impact: {
      land_knowledge_shared: string;
      Country_connection: string;
    };
    enterprise_pathways: {
      Goods_involvement: string;
      Harvest_engagement: string;
      fair_value_return: string;
    };
    sovereignty_outcomes: {
      OCAP_enforced: boolean;
      voice_control_maintained: string;
      Beautiful_Obsolescence_prep: string;
    };
  };

  // Extracted content
  extracted_themes: Array<{
    theme: string;
    frequency: number;
    confidence: number;
    cultural_context: string;
  }>;

  extracted_quotes: Array<{
    quote: string;
    context: string;
    cultural_significance: string;
  }>;
}
```

**Implementation**:
```typescript
// src/app/api/storytellers/[id]/unified-analysis/route.ts
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('storyteller_master_analysis')
    .select('*')
    .eq('storyteller_id', params.id)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  return Response.json(data);
}
```

---

## 2. Project LCAA Outcomes

### GET `/api/projects/[id]/lcaa-outcomes`

**Purpose**: LCAA rhythm tracking for grant reporting

**Response**:
```typescript
{
  project_id: string;
  lcaa_rhythm_analysis: {
    listen_phase: {
      duration_months: number;
      community_consultations: number;
      depth_achieved: "deep" | "medium" | "surface";
      community_led: boolean;
    };
    curiosity_phase: {
      questions_explored: string[];
      co_design_workshops: number;
      community_ownership: "high" | "medium" | "low";
    };
    action_phase: {
      pathways_opened: string[];
      barriers_removed: string[];
      outcomes_achieved: string[];
    };
    art_phase: {
      creative_outputs: string[];
      cultural_expression: string;
      returns_to_listen: boolean;
    };
  };

  // Grant-ready metrics
  metrics: {
    total_pathways_created: number;
    total_barriers_removed: number;
    total_creative_outputs: number;
    seasonal_alignment: boolean;
  };
}
```

---

## 3. Organization ALMA Summary

### GET `/api/organizations/[id]/alma-summary`

**Purpose**: Org-level ALMA signals for grant applications

**Response**:
```typescript
{
  organization_id: string;

  // System-level ALMA signals (NOT individual profiling)
  system_alma_signals: {
    authority_distribution: {
      lived_experience_centered: number; // 0-1 (e.g., 0.85 = 85%)
      community_governance: "co_owned" | "community_led" | "transitioning";
      power_balance: string;
    };
    evidence_integrity: {
      consent_logged: number; // 0-1 (should be 1.0)
      cultural_verification: string;
      harm_prevention_active: boolean;
    };
    capability_building: {
      skills_transferred: string[];
      employment_pathways_created: number;
      training_hours_delivered: number;
    };
    community_value_return: {
      direct_payments_total: string;
      capacity_investment: string;
      cultural_continuity: string;
    };
  };

  // Grant-ready summary
  grant_summary: {
    SROI: number; // e.g., 4.2 ($4.20 return per $1 invested)
    outcomes_achieved: Array<{
      outcome: string;
      evidence: string;
      count?: number;
    }>;
    cultural_value_proxies: {
      intergenerational_knowledge_transfer: string;
      language_preservation: string;
      cultural_continuity: string;
    };
  };
}
```

---

## 4. Beautiful Obsolescence Readiness

### GET `/api/organizations/[id]/handover-readiness`

**Purpose**: Track handover progress for SEDI/TACSI grants

**Response**:
```typescript
{
  organization_id: string;

  handover_readiness: {
    documentation_complete: number; // 0-1 (e.g., 0.85 = 85%)
    training_delivered: string[];
    governance_transfer: "in_progress" | "co_owned" | "community_led";
    stepping_back_timeline: string;
    community_readiness: "high" | "medium" | "low";
  };

  Beautiful_Obsolescence_progress: {
    projects_handed_over: number;
    communities_self_sustaining: number;
    dependency_reduced: number; // 0-1 (e.g., 0.40 = 40% reduction)
    training_hours: number;
  };

  // Grant narrative (auto-generated)
  narrative: {
    summary: string; // "2 projects handed over, 40% dependency reduction achieved..."
    evidence: string[];
    readiness_score: number; // 0-100
  };
}
```

---

## 5. Auto-Generate Funder Report

### POST `/api/organizations/[id]/generate-funder-report`

**Purpose**: Auto-generate grant application sections from database

**Request Body**:
```typescript
{
  funder_type: "TACSI" | "SEDI" | "Kickstarter_QLD" | "First_Nations" | "Generic";
  format: "PDF" | "Word" | "JSON" | "Markdown";
  sections: string[]; // ["impact", "outcomes", "sustainability", "cultural_value"]
  date_range?: {
    start: string;
    end: string;
  };
}
```

**Response**:
```typescript
{
  report_id: string;
  generated_at: string;
  funder_type: string;
  format: string;

  sections: {
    impact?: {
      title: string;
      content: string;
      evidence: Array<{
        metric: string;
        value: string | number;
        source: string;
      }>;
    };
    outcomes?: {
      title: string;
      content: string;
      outcomes_list: Array<{
        outcome: string;
        evidence: string;
        ALMA_backing: object;
      }>;
    };
    sustainability?: {
      title: string;
      content: string;
      financial_metrics: {
        earned_income_pct: number;
        grant_dependency_reduced: number;
        diversified_revenue: string[];
      };
    };
    cultural_value?: {
      title: string;
      content: string;
      proxies: {
        intergenerational_transfer: string;
        language_preservation: string;
        cultural_continuity: string;
      };
    };
  };

  download_url?: string; // If format is PDF/Word
  raw_data: object; // Full database query results
}
```

**Implementation Example**:
```typescript
// src/app/api/organizations/[id]/generate-funder-report/route.ts
import { createClient } from '@/lib/supabase/server';
import { generateGrantNarrative } from '@/lib/services/grant-generator';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { funder_type, format, sections } = body;

  const supabase = await createClient();

  // Fetch all relevant data
  const { data: orgIntelligence } = await supabase
    .from('organization_impact_intelligence')
    .select('*')
    .eq('organization_id', params.id)
    .single();

  const { data: projects } = await supabase
    .from('project_impact_analysis')
    .select('*')
    .eq('organization_id', params.id);

  const { data: storytellers } = await supabase
    .from('storyteller_master_analysis')
    .select('*')
    .eq('tenant_id', params.id);

  // Generate narratives
  const report = await generateGrantNarrative({
    funder_type,
    sections,
    data: {
      orgIntelligence,
      projects,
      storytellers,
    },
  });

  // Convert to requested format
  if (format === 'PDF' || format === 'Word') {
    const fileUrl = await convertToDocument(report, format);
    return Response.json({ ...report, download_url: fileUrl });
  }

  return Response.json(report);
}
```

---

## 6. Semantic Search (RAG)

### POST `/api/search/semantic`

**Purpose**: Hybrid search (vector + full-text) on knowledge base

**Request Body**:
```typescript
{
  query: string;
  tenant_id?: string;
  privacy_level?: "private" | "organization" | "public";
  match_threshold?: number; // 0-1, default 0.7
  match_count?: number; // default 10
  act_framework_tags?: string[]; // Filter by ACT tags
}
```

**Response**:
```typescript
{
  results: Array<{
    id: string;
    title: string;
    content: string;
    summary: string;
    source_type: string;
    cultural_tags: string[];
    act_framework_tags: string[];
    vector_similarity: number;
    text_rank: number;
    combined_score: number;
    cultural_significance: object;
  }>;

  query_stats: {
    total_results: number;
    vector_matches: number;
    text_matches: number;
    query_time_ms: number;
  };
}
```

**Implementation**:
```typescript
// src/app/api/search/semantic/route.ts
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/ai/embeddings';

export async function POST(request: Request) {
  const { query, tenant_id, privacy_level, match_threshold, match_count } = await request.json();

  // Generate embedding for query
  const embedding = await generateEmbedding(query);

  const supabase = await createClient();

  // Call hybrid search function
  const { data: results, error } = await supabase.rpc('hybrid_search_knowledge_base', {
    query_embedding: embedding,
    query_text: query,
    match_threshold: match_threshold || 0.7,
    match_count: match_count || 10,
    filter_tenant: tenant_id || null,
    filter_privacy: privacy_level || 'public',
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    results,
    query_stats: {
      total_results: results.length,
      query_time_ms: performance.now(),
    },
  });
}
```

---

## 7. World Tour Dashboard Data

### GET `/api/global-intelligence/latest`

**Purpose**: Platform-wide insights for World Tour dashboard

**Response**:
```typescript
{
  id: string;
  analyzed_at: string;

  global_themes: Array<{
    theme: string;
    frequency_worldwide: number;
    cultural_contexts: Array<{
      culture: string;
      frequency: number;
      interpretation: string;
    }>;
  }>;

  cross_cultural_patterns: Array<{
    pattern: string;
    commonality: string;
    cultural_diversity: string;
    transferability: "high" | "medium" | "low";
  }>;

  regenerative_patterns: Array<{
    pattern: string;
    evidence: string;
    transferability: string;
    Beautiful_Obsolescence_proof: boolean;
  }>;

  commons_health: {
    handover_success_rate: number;
    sovereignty_protected: string;
    transferable_tools: string[];
    extractive_prevented: string;
  };

  platform_health: {
    active_users: number;
    engagement_rate: number;
    cultural_safety_score: number;
    consent_compliance: number;
  };
}
```

---

## Implementation Checklist

### Phase 1: Core ALMA Endpoints (1-2 days)
- [ ] `/api/storytellers/[id]/unified-analysis`
- [ ] `/api/organizations/[id]/alma-summary`
- [ ] Test ALMA signal integrity (no profiling)

### Phase 2: LCAA & Handover (1-2 days)
- [ ] `/api/projects/[id]/lcaa-outcomes`
- [ ] `/api/organizations/[id]/handover-readiness`
- [ ] Verify Beautiful Obsolescence calculations

### Phase 3: Grant Automation (2-3 days)
- [ ] `/api/organizations/[id]/generate-funder-report`
- [ ] Build narrative generation service
- [ ] PDF/Word export functionality

### Phase 4: RAG Search (1-2 days)
- [ ] `/api/search/semantic`
- [ ] Test hybrid search performance (<500ms)
- [ ] Verify consent enforcement

### Phase 5: World Tour (1-2 days)
- [ ] `/api/global-intelligence/latest`
- [ ] Build World Tour dashboard UI
- [ ] Test global aggregation accuracy

---

## Testing Strategy

### Unit Tests
```typescript
// __tests__/api/storytellers/unified-analysis.test.ts
describe('/api/storytellers/[id]/unified-analysis', () => {
  it('returns ALMA signals with no profiling', async () => {
    const response = await GET({ params: { id: 'test-storyteller-id' } });
    const data = await response.json();

    // Red flags for profiling
    expect(data.alma_signals).not.toHaveProperty('risk_score');
    expect(data.alma_signals).not.toHaveProperty('predicted_behavior');
    expect(data.alma_signals).not.toHaveProperty('compliance_rating');

    // Should have system-level signals
    expect(data.alma_signals.authority).toBeDefined();
    expect(data.alma_signals.evidence_strength).toBeDefined();
  });

  it('enforces RLS (users can only see own data)', async () => {
    // Test that user A cannot see user B's analysis
  });
});
```

### Integration Tests
```typescript
// __tests__/integration/grant-report-generation.test.ts
describe('Grant Report Generation', () => {
  it('generates TACSI report with database evidence', async () => {
    const response = await POST('/api/organizations/test-org/generate-funder-report', {
      funder_type: 'TACSI',
      sections: ['impact', 'outcomes', 'sustainability'],
    });

    const report = await response.json();

    // Verify sections
    expect(report.sections.impact).toBeDefined();
    expect(report.sections.outcomes).toBeDefined();
    expect(report.sections.sustainability).toBeDefined();

    // Verify ALMA backing
    expect(report.sections.impact.evidence).toHaveLength(>= 3);
    expect(report.sections.outcomes.outcomes_list[0].ALMA_backing).toBeDefined();
  });
});
```

---

## Performance Benchmarks

| Endpoint | Target Response Time | Complexity |
|----------|---------------------|------------|
| `/unified-analysis` | < 200ms | Low (single table query) |
| `/lcaa-outcomes` | < 300ms | Medium (JSONB parsing) |
| `/alma-summary` | < 500ms | Medium (aggregation) |
| `/handover-readiness` | < 400ms | Medium (calculations) |
| `/generate-funder-report` | < 3s | High (multi-table + narrative gen) |
| `/search/semantic` | < 500ms | High (vector + full-text) |
| `/global-intelligence` | < 1s | High (platform-wide aggregation) |

---

## Security Considerations

1. **RLS Enforcement**: All endpoints respect Row-Level Security
2. **Consent Checking**: Never return data without storyteller consent
3. **Rate Limiting**: Apply to prevent abuse (post-launch)
4. **API Key Auth**: Service-to-service endpoints require auth

---

**Related Documents**:
- [Database Architecture](../04-database/ACT_IMPACT_FRAMEWORK_DATABASE_ARCHITECTURE.md)
- [ALMA Verification Scripts](../../scripts/verify-alma-integrity.ts)
- [Migration SQL](../../supabase/migrations/20260115000000_act_unified_analysis_system.sql)

**Status**: ✅ Specifications Complete - Ready for Implementation
**Next**: Build endpoints → Test ALMA integrity → Deploy to staging
