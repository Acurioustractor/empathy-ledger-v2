# Phase 2 Complete: ALMA Signal Extraction Enhancement

**Date:** January 11, 2026
**Status:** ✅ COMPLETE - AI analyzer enhanced to extract ALMA v2.0 signals
**Next Phase:** Test on sample transcripts, then batch process all 251 transcripts

---

## What Was Completed

### Enhanced Claude Sonnet 4.5 Analyzer

**File Modified:** `src/lib/ai/transcript-analyzer-v3-claude.ts`

**Changes Made:**

1. **Extended Zod Schema** - Added 5 new optional sections to `TranscriptAnalysisSchema`:
   - `alma_signals` - 6 ALMA v2.0 signal categories (authority, evidence_strength, harm_risk_inverted, capability, option_value, community_value_return)
   - `cultural_markers` - Languages, places, ceremonies, kinship, protocols
   - `impact_dimensions` - Individual, community, environmental impact scores (0.0-1.0)
   - `knowledge_contributions` - Traditional knowledge, lived experience, innovations, warnings
   - `network_data` - People, organizations, places mentioned, connection strength

2. **Enhanced System Prompt** - Added comprehensive ALMA extraction instructions:
   - 6 ALMA signal categories with detailed extraction rules
   - Cultural markers extraction guidelines
   - Impact dimensions scoring rubric (0.8-1.0 = strong, 0.6-0.79 = clear, etc.)
   - Knowledge contributions categories
   - Network data extraction
   - Emphasis on SYSTEM-LEVEL patterns (NOT individual profiling)
   - Conservative scoring when uncertain

3. **Enhanced User Prompt** - Added complete JSON structure example with all new fields

4. **Salvage Handler Updated** - Gracefully handles missing optional fields

---

## Schema Extensions

### ALMA Signals (NEW)

```typescript
alma_signals: z.object({
  authority: z.object({
    level: z.enum(['lived_experience', 'secondary', 'academic']),
    cultural_positioning: z.string().optional(),
    voice_control: z.enum(['full', 'shared', 'limited']),
    OCAP_compliance: z.boolean()
  }),
  evidence_strength: z.object({
    primary_source: z.boolean(),
    cultural_verification: z.enum(['not_required', 'pending', 'elder_reviewed']),
    corroboration_count: z.number().min(0).max(5)
  }),
  harm_risk_inverted: z.object({
    safety_score: z.number().min(0).max(1),
    cultural_protocols_met: z.boolean(),
    consent_violations: z.number().min(0)
  }),
  capability: z.object({
    knowledge_domains: z.array(z.string()),
    learning_pathways_opened: z.array(z.string()),
    capacity_built: z.string().optional()
  }),
  option_value: z.object({
    future_applications: z.array(z.string()),
    handover_potential: z.enum(['none', 'some', 'can_train_others', 'ready_to_handover']),
    commons_contribution: z.string().optional()
  }),
  community_value_return: z.object({
    direct_benefits: z.string().optional(),
    capacity_building: z.string().optional(),
    fair_value_protection: z.boolean()
  })
}).optional()
```

### Cultural Markers (NEW)

```typescript
cultural_markers: z.object({
  languages_mentioned: z.array(z.string()),
  places_of_significance: z.array(z.string()),
  ceremonies_practices: z.array(z.string()),
  kinship_connections: z.array(z.string()),
  cultural_protocols: z.array(z.string())
}).optional()
```

### Impact Dimensions (NEW)

```typescript
impact_dimensions: z.object({
  individual: z.object({
    healing: z.number().min(0).max(1).optional(),
    empowerment: z.number().min(0).max(1).optional(),
    identity: z.number().min(0).max(1).optional()
  }).optional(),
  community: z.object({
    connection: z.number().min(0).max(1).optional(),
    capability: z.number().min(0).max(1).optional(),
    sovereignty: z.number().min(0).max(1).optional()
  }).optional(),
  environmental: z.object({
    land_connection: z.number().min(0).max(1).optional(),
    sustainable_practice: z.number().min(0).max(1).optional()
  }).optional()
}).optional()
```

### Knowledge Contributions (NEW)

```typescript
knowledge_contributions: z.object({
  traditional_knowledge: z.array(z.string()),
  lived_experience: z.array(z.string()),
  innovations: z.array(z.string()),
  warnings: z.array(z.string())
}).optional()
```

### Network Data (NEW)

```typescript
network_data: z.object({
  mentioned_people: z.array(z.string()),
  organizations: z.array(z.string()),
  places: z.array(z.string()),
  connections_strength: z.number().min(0).max(1).optional()
}).optional()
```

---

## Philosophy Preserved

### ACT Principles Embedded in Code

1. **System-Level Patterns, NOT Individual Profiling**
   - Prompt explicitly states: "These are SYSTEM-LEVEL signals, NOT individual profiling"
   - Scores reflect evidence in transcript, not predictions about the person

2. **Inverted Harm Risk Scoring**
   - High score = safe (not surveillance)
   - `harm_risk_inverted.safety_score: 1.0 = completely safe`

3. **Cultural Safety Protocols**
   - Conservative scoring when uncertain
   - "Respect cultural sensitivity - don't extract sacred/private details"
   - `requires_elder_review: true` flag for sacred content

4. **Evidence-Based Assessment**
   - Impact dimension scoring rubric based on evidence strength
   - "Scores reflect EVIDENCE in transcript, not predictions"
   - "When uncertain, be conservative or leave field empty"

5. **OCAP/CARE Compliance**
   - `authority.OCAP_compliance: true` (always - platform enforces by design)
   - `community_value_return.fair_value_protection: true` (platform respects ownership)
   - `harm_risk_inverted.consent_violations: 0` (we only analyze consented transcripts)

---

## What This Enables

### Grant Reporting Automation

**ALMA signals → Funder narratives:**
- **Authority (lived_experience)** → "X% of evidence sourced from lived experience, centering Indigenous authority" (TACSI co-design proof)
- **Evidence Strength (elder_reviewed)** → "X% of cultural knowledge elder-verified, meeting AIATSIS CARE principles" (SEDI/CRC-P trust signal)
- **Harm Risk (safety_score: 0.95)** → "X% cultural safety score, zero consent violations" (Risk mitigation for ethical funds)
- **Capability (learning_pathways_opened)** → "X employment pathways created via Goods/Harvest micro-enterprises" (Industry Growth grants)
- **Option Value (handover_potential)** → "Community champions trained to self-manage platform (Beautiful Obsolescence)" (SEDI grants)
- **Value Return (fair_value_protection)** → "Total value returned to storytellers (50% policy), capacity investment tracked" (Philanthropy alignment)

### Beautiful Obsolescence Tracking

**Option Value signals enable:**
- Handover readiness assessment per storyteller
- "Can train others" identification
- Community self-sufficiency metrics
- Dependency reduction tracking

### Cultural Value Proxies

**Impact dimensions enable:**
- Healing journey measurement (individual.healing: 0.0-1.0)
- Community sovereignty tracking (community.sovereignty: 0.0-1.0)
- Land connection evidence (environmental.land_connection: 0.0-1.0)
- Intangible outcome measurement for SROI calculations

### Knowledge Commons Building

**Knowledge contributions + Network data enable:**
- Traditional knowledge preservation tracking
- Lived experience wisdom capture
- Innovation/solution identification
- Warning/pitfall documentation
- Community connection mapping

---

## Backward Compatibility

### All New Fields are Optional

**Existing functionality preserved:**
- Old transcripts without ALMA signals still work
- Existing code reading `themes`, `key_quotes`, `summary` unaffected
- Graceful degradation if Claude doesn't return new fields
- Salvage handler includes new optional fields

### Gradual Adoption

**Can enable ALMA extraction incrementally:**
- Test on sample transcripts first
- Validate quality before full deployment
- Existing analyses remain valid
- New analyses include ALMA signals

---

## Next Steps

### Phase 3: Test ALMA Extraction (Immediate)

**Create test script:**
```bash
# Create: scripts/test-alma-extraction.ts
npx tsx scripts/test-alma-extraction.ts
```

**Test on 5-10 sample transcripts:**
1. Select diverse transcripts (different themes, lengths, cultural content)
2. Run enhanced analyzer
3. Validate ALMA signal quality:
   - Are authority levels correct (lived_experience vs secondary)?
   - Are impact dimension scores reasonable (0.0-1.0)?
   - Are cultural markers extracted accurately?
   - Are knowledge contributions meaningful?
   - Are network connections identified?
4. Check for over-extraction (too many signals when evidence is weak)
5. Check for under-extraction (missing obvious signals)

**Success Criteria:**
- 90%+ accuracy on ALMA signals (matches manual assessment)
- No hallucinated cultural markers
- Impact dimension scores align with transcript content
- Conservative scoring when evidence is weak

### Phase 4: Batch Analysis (After Testing)

**Trigger analysis for all 251 transcripts:**

```bash
# Create: scripts/batch-analyze-transcripts.ts
# - Query transcripts without analysis results
# - Trigger Inngest jobs in batches of 10
# - Monitor progress, log errors
# - Estimate: 251 transcripts × 45 seconds = ~3 hours total
# - Cost estimate: 251 × $0.03 = ~$7.50

npx tsx scripts/batch-analyze-transcripts.ts
```

**Expected results:**
- `transcript_analysis_results`: 251 records created
- Each with full ALMA signals, cultural markers, impact dimensions
- Ready for backfill → storyteller_master_analysis

### Phase 5: Run ACT Rollup Pipeline

**After batch analysis completes:**

```bash
npm run act:rollup:all
```

**Expected results:**
- `storyteller_master_analysis`: 239 records (one per storyteller)
- `project_impact_analysis`: 11 records (one per project)
- `organization_impact_intelligence`: 19 records (one per org)
- `global_impact_intelligence`: 1 record (global snapshot)

---

## Files Modified

**Modified (1):**
- `src/lib/ai/transcript-analyzer-v3-claude.ts` - Enhanced schema + prompts for ALMA extraction

**Created (2):**
- `TRANSCRIPT_ANALYSIS_REVIEW_AND_INTEGRATION_PLAN.md` - Complete review and integration strategy
- `PHASE_2_COMPLETE_ALMA_EXTRACTION.md` - This file

**Next to Create (2):**
- `scripts/test-alma-extraction.ts` - Test ALMA extraction on samples
- `scripts/batch-analyze-transcripts.ts` - Batch process all 251 transcripts

---

## Technical Debt / Future Improvements

### Consent Management UI (Priority: HIGH)

**Currently missing:**
- Storyteller UI to set sharing preferences
- `storyteller_consent` JSONB structure designed but not editable
- Need: Privacy settings panel in storyteller dashboard

**Fields to implement:**
```jsonb
{
  "share_themes_publicly": true|false,
  "share_quotes_org_only": true|false,
  "allow_global_aggregation": true|false,
  "allow_project_attribution": true|false,
  "allow_ai_training": false  // Default false - respect IP
}
```

### Embedding Generation (Priority: MEDIUM)

**For RAG/wiki search:**
- Generate embeddings for storyteller analyses
- Populate `empathy_ledger_knowledge_base` table
- Enable hybrid search (vector 60% + full-text 40%)

### Remaining API Endpoints (Priority: MEDIUM)

**4 endpoints documented but not built:**
1. `GET /api/organizations/[id]/impact-intelligence` - Org-level ALMA summary
2. `GET /api/global/impact-intelligence` - Global insights
3. `POST /api/organizations/[id]/generate-funder-report` - Auto-generate grant applications
4. `GET /api/analytics/beautiful-obsolescence` - Handover readiness analytics

### GlobalInsightsDashboard (Priority: LOW)

**Final dashboard component:**
- World Tour insights
- Commons health indicators
- Cross-cultural patterns
- Knowledge emergence maps

---

## Success Metrics

### Phase 2 Complete ✅

- ✅ Schema extended with ALMA signals, cultural markers, impact dimensions, knowledge contributions, network data
- ✅ System prompt enhanced with detailed extraction instructions
- ✅ User prompt updated with complete JSON structure
- ✅ Backward compatibility maintained (all new fields optional)
- ✅ Salvage handler updated for graceful degradation

### Phase 3 Target (Testing)

- ⏳ 90%+ ALMA signal accuracy on sample transcripts
- ⏳ Zero hallucinated cultural markers
- ⏳ Impact dimension scores align with manual assessment
- ⏳ Conservative scoring when evidence is weak

### Phase 4 Target (Batch Processing)

- ⏳ 251 transcript_analysis_results created
- ⏳ All with ALMA signals + cultural markers + impact dimensions
- ⏳ <5% error rate on analysis jobs

### Phase 5 Target (Rollup Pipeline)

- ⏳ 239 storyteller_master_analysis records
- ⏳ 11 project_impact_analysis records
- ⏳ 19 organization_impact_intelligence records
- ⏳ 1 global_impact_intelligence record

---

**Status:** ✅ PHASE 2 COMPLETE - Enhanced AI analyzer ready for testing
**Next Action:** Create test script and validate ALMA extraction on 5-10 sample transcripts
**Philosophy:** Storyteller sovereignty, cultural safety, system-level patterns - all preserved ✅
