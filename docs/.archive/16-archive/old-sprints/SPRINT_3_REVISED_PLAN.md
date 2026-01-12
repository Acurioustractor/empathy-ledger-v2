# Sprint 3: Transcript Analysis & Impact (REVISED)

**Date:** January 4, 2026
**Based On:** Comprehensive analysis frameworks audit
**Theme:** Consolidate & Complete the Analysis Pipeline
**Components:** 8-10 (focused on gaps, not duplicating existing work)

---

## 🔍 Audit Key Findings

**What We Already Have:**
- ✅ 28 AI/analysis files in src/lib/ai/
- ✅ transcript-analyzer-v3-claude.ts (90-95% accuracy)
- ✅ Thematic taxonomy (38 OCAP-aligned themes)
- ✅ Quote extractors (v2 is production-ready)
- ✅ Impact analyzers (intelligent version is best)
- ✅ TranscriptCreationDialog component
- ✅ Multiple analytics dashboards
- ✅ API endpoints for analysis

**What's Missing:**
- ❌ UI to display analysis results
- ❌ Database table to store analysis results with versioning
- ❌ Consolidated analysis pipeline
- ❌ Batch processing capability
- ❌ Quality metrics tracking

**What Needs Fixing:**
- ⚠️ 6 deprecated analyzers need removal
- ⚠️ Impact analysis API uses old pattern-based analyzer
- ⚠️ No version tracking for analysis results
- ⚠️ Unclear which analyzer to use when

---

## 🎯 Revised Sprint 3 Goals

**Focus:** Consolidate existing analysis tools + Fill critical gaps

Instead of building 12-14 new components, we'll:
1. **Consolidate** existing analysis frameworks (remove duplicates)
2. **Complete** missing UI components for analysis display
3. **Connect** existing pieces into coherent pipeline
4. **Track** quality and versioning in database

---

## 📋 Sprint 3 Components (8-10)

### Phase 1: Database & Consolidation (Days 1-2)

#### 1. Database Migration: transcript_analysis_results
**Purpose:** Store versioned analysis results
**Schema:**
```sql
CREATE TABLE transcript_analysis_results (
  id UUID PRIMARY KEY,
  transcript_id UUID REFERENCES transcripts(id),
  analyzer_version TEXT, -- 'v3-claude-sonnet-4.5'
  themes JSONB, -- Normalized via thematic-taxonomy
  quotes JSONB, -- With quality scores
  impact_assessment JSONB, -- Depth-based scoring
  cultural_flags JSONB, -- Sensitivity markers
  quality_metrics JSONB, -- Accuracy, confidence
  processing_cost NUMERIC, -- Track AI costs
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ
);
```

#### 2. Code Cleanup: Remove Deprecated Analyzers
**Action Items:**
- ❌ Delete transcript-analyzer.ts (v1)
- ❌ Delete transcript-analyzer-v2.ts
- ❌ Delete indigenous-impact-analyzer.ts (pattern-based)
- ❌ Delete outcome-matcher.ts (keyword-based)
- ❌ Delete claude-quote-extractor.ts (v1)
- ❌ Delete claude-impact-analyzer.ts (duplicate)
- ✅ Update all imports to use v3 stack
- ✅ Create deprecation log

#### 3. API Upgrade: Fix Impact Analysis Endpoint
**File:** `src/app/api/ai/analyze-indigenous-impact/route.ts`
**Change:** Replace pattern-based analyzer with `intelligent-indigenous-impact-analyzer.ts`
**Benefit:** Depth-based scoring (mention → description → demonstration → transformation)

---

### Phase 2: Analysis Display UI (Days 3-5)

#### 4. TranscriptAnalysisView Component (NEW)
**Purpose:** Comprehensive analysis results display
**Sections:**
- **Themes Tab:**
  - Normalized themes from thematic-taxonomy
  - Confidence scores
  - SDG mappings
  - Usage frequency

- **Quotes Tab:**
  - Extracted quotes with quality scores
  - Theme associations
  - Impact category tagging
  - Cultural context

- **Impact Tab:**
  - Indigenous impact assessment
  - Depth indicators (mention/description/demonstration/transformation)
  - Evidence snippets
  - Cultural protocol flags

- **Metadata Tab:**
  - Analyzer version used
  - Processing time & cost
  - Quality metrics
  - Cultural safety flags

**Integration Points:**
- Linked from TranscriptCard
- Used in ProjectTranscriptsTab
- Available in admin dashboard

#### 5. ThemeDistributionChart Component (NEW)
**Purpose:** Visualize theme frequency across transcripts
**Features:**
- Bar chart of top 10 themes
- Color-coded by category (Cultural Sovereignty, Knowledge Transmission, etc.)
- Drill-down to stories/quotes
- Export chart as image

**Libraries:** Recharts (already in dependencies)

#### 6. ImpactDepthIndicator Component (NEW)
**Purpose:** Visual indicator of impact depth
**Features:**
- 4-level progress bar (mention → description → demonstration → transformation)
- Color gradient (low → high impact)
- Hover tooltips with evidence
- Links to relevant quotes

---

### Phase 3: Analytics & Reporting (Days 6-8)

#### 7. TranscriptAnalyticsDashboard Component (NEW)
**Purpose:** Aggregate analytics across all transcripts
**Metrics:**
- Total transcripts analyzed
- Theme distribution
- Quote quality averages
- Cultural sensitivity breakdown
- Impact depth statistics
- Processing costs

**Filters:**
- Date range
- Organization
- Project
- Storyteller
- Theme category

#### 8. AnalysisQualityMetrics Component (NEW)
**Purpose:** Track analyzer performance over time
**Metrics:**
- Accuracy trends
- Quote verification rates
- Theme normalization success
- Cultural flag accuracy
- Cost per transcript
- Processing time trends

**Benefits:**
- Monitor v3 analyzer performance
- Justify AI investment
- Identify quality issues
- Optimize processing costs

---

### Phase 4: Optional Enhancements (Days 9-10)

#### 9. BatchAnalysisProcessor Component (OPTIONAL)
**Purpose:** Analyze multiple transcripts at once
**Features:**
- Select multiple transcripts
- Queue processing
- Progress tracking
- Bulk export results
- Cost estimation

**Use Cases:**
- Bulk import of historical transcripts
- Re-analyze with newer analyzer versions
- Project-wide analysis refresh

#### 10. AnalysisComparisonView Component (OPTIONAL)
**Purpose:** Compare analysis results across analyzer versions
**Features:**
- Side-by-side theme comparison
- Quote differences highlighted
- Impact score deltas
- Quality metric comparison

**Use Cases:**
- Validate v3 improvements over v2
- Test new analyzer versions
- Debug analysis discrepancies

---

## 🗓️ Sprint 3 Timeline (REVISED)

### Week 1: Foundation (Jan 6-10)

**Days 1-2: Database & Cleanup**
- Create transcript_analysis_results table migration
- Remove 6 deprecated analyzer files
- Update all imports to v3 stack
- Upgrade impact analysis API endpoint
- Add version tracking

**Days 3-5: Core UI Components**
- Build TranscriptAnalysisView (4 tabs)
- Build ThemeDistributionChart
- Build ImpactDepthIndicator
- Integration testing

### Week 2: Analytics & Testing (Jan 13-17)

**Days 6-8: Analytics Components**
- Build TranscriptAnalyticsDashboard
- Build AnalysisQualityMetrics
- API endpoint for aggregate analytics

**Days 9-10: Testing & Documentation**
- Test full analysis pipeline
- Create usage documentation
- Cultural review
- Deploy to staging

**Optional (if time):**
- BatchAnalysisProcessor
- AnalysisComparisonView

---

## 🛠️ Technical Implementation

### Using Existing Analysis Stack

```typescript
// Import the recommended analyzers
import { analyzeTranscriptV3 } from '@/lib/ai/transcript-analyzer-v3-claude'
import { extractProjectQuotesV2 } from '@/lib/ai/claude-quote-extractor-v2'
import { analyzeIndigenousImpact } from '@/lib/ai/intelligent-indigenous-impact-analyzer'
import { normalizeThemes } from '@/lib/ai/thematic-taxonomy'
import { withCulturalSafety } from '@/lib/ai/cultural-safety-middleware'

// Full analysis pipeline
async function analyzeTranscript(transcriptId: string) {
  // 1. Get transcript
  const transcript = await getTranscript(transcriptId)

  // 2. Run v3 analyzer (with cultural safety)
  const analysis = await withCulturalSafety(
    () => analyzeTranscriptV3(transcript.text)
  )

  // 3. Normalize themes using taxonomy
  const normalizedThemes = normalizeThemes(analysis.themes)

  // 4. Extract quotes with quality filtering
  const quotes = await extractProjectQuotesV2(
    transcript.text,
    projectContext // if available
  )

  // 5. Assess indigenous impact (depth-based)
  const impact = await analyzeIndigenousImpact(
    transcript.text,
    normalizedThemes
  )

  // 6. Store results with versioning
  await storeAnalysisResults({
    transcript_id: transcriptId,
    analyzer_version: 'v3-claude-sonnet-4.5',
    themes: normalizedThemes,
    quotes,
    impact_assessment: impact,
    cultural_flags: analysis.culturalFlags,
    quality_metrics: analysis.qualityMetrics,
    processing_cost: calculateCost(analysis),
    processing_time_ms: analysis.processingTime
  })

  return { themes: normalizedThemes, quotes, impact }
}
```

---

## 📊 Database Schema

### Migration 1: transcript_analysis_results

```sql
-- File: supabase/migrations/20260106000001_transcript_analysis_results.sql

CREATE TABLE IF NOT EXISTS transcript_analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE,
  analyzer_version TEXT NOT NULL,
  themes JSONB NOT NULL,
  quotes JSONB,
  impact_assessment JSONB,
  cultural_flags JSONB,
  quality_metrics JSONB,
  processing_cost NUMERIC(10,4),
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_latest_analysis UNIQUE (transcript_id, analyzer_version)
);

CREATE INDEX idx_analysis_transcript ON transcript_analysis_results(transcript_id);
CREATE INDEX idx_analysis_version ON transcript_analysis_results(analyzer_version);
CREATE INDEX idx_analysis_created ON transcript_analysis_results(created_at);

-- Function to get latest analysis
CREATE OR REPLACE FUNCTION get_latest_analysis(p_transcript_id UUID)
RETURNS transcript_analysis_results AS $$
  SELECT * FROM transcript_analysis_results
  WHERE transcript_id = p_transcript_id
  ORDER BY created_at DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;
```

---

## 🎯 Success Criteria

### Consolidation
- [ ] 6 deprecated analyzers removed
- [ ] All imports use v3 stack
- [ ] Clear documentation of which analyzer to use when
- [ ] No duplicate functionality

### Database
- [ ] transcript_analysis_results table created
- [ ] Analysis results stored with version tracking
- [ ] Quality metrics tracked over time
- [ ] Cost tracking functional

### UI Components
- [ ] TranscriptAnalysisView displays all results
- [ ] Theme charts show distribution
- [ ] Impact depth indicators working
- [ ] Analytics dashboard aggregates metrics

### Integration
- [ ] Full pipeline: upload → analyze → store → display
- [ ] Cultural safety enforced throughout
- [ ] Elder review triggers working
- [ ] Quality metrics visible to users

---

## 🛡️ Cultural Safety

### Analysis Pipeline Safety Checks

1. **Pre-Analysis:**
   - Check ALMA settings (user consent)
   - Verify not sacred content
   - Flag for Elder review if needed

2. **During Analysis:**
   - Cultural safety middleware wraps all AI calls
   - Theme normalization to OCAP-aligned taxonomy
   - Impact assessment includes cultural protocol checks

3. **Post-Analysis:**
   - Store cultural flags in results
   - Trigger Elder review if needed
   - Respect privacy settings for analytics

4. **Display:**
   - Show cultural sensitivity level
   - Indicate Elder review status
   - Respect user privacy preferences

---

## 📁 Files to Create/Modify

### New Files
1. `supabase/migrations/20260106000001_transcript_analysis_results.sql`
2. `src/components/analysis/TranscriptAnalysisView.tsx`
3. `src/components/analysis/ThemeDistributionChart.tsx`
4. `src/components/analysis/ImpactDepthIndicator.tsx`
5. `src/components/analytics/TranscriptAnalyticsDashboard.tsx`
6. `src/components/analytics/AnalysisQualityMetrics.tsx`
7. `src/app/api/analytics/transcript-analysis/route.ts`

### Files to Delete
1. `src/lib/ai/transcript-analyzer.ts`
2. `src/lib/ai/transcript-analyzer-v2.ts`
3. `src/lib/ai/indigenous-impact-analyzer.ts`
4. `src/lib/ai/outcome-matcher.ts`
5. `src/lib/ai/claude-quote-extractor.ts`
6. `src/lib/ai/claude-impact-analyzer.ts`

### Files to Modify
1. `src/app/api/ai/analyze-indigenous-impact/route.ts` (use intelligent analyzer)
2. `src/app/api/ai/analyze-transcript/route.ts` (use v3, store results)
3. All files importing deprecated analyzers (update to v3 stack)

---

## 💰 Cost Analysis

### Per-Transcript Analysis Cost

| Component | Provider | Model | Cost |
|-----------|----------|-------|------|
| Theme extraction | Claude | Sonnet 4.5 | $0.03 |
| Quote extraction | Claude | Opus | $0.04 |
| Impact assessment | Ollama | Llama 3.1:8b | FREE |
| **TOTAL** | - | - | **$0.07** |

**Alternative (all Ollama):** FREE, ~30-40s processing time

### Scaling Projections

| Transcripts/Month | Cost (Claude) | Cost (Ollama) |
|-------------------|---------------|---------------|
| 10 | $0.70 | FREE |
| 100 | $7.00 | FREE |
| 1,000 | $70.00 | FREE |

**Recommendation:** Use Ollama for development, Claude for production quality.

---

## 🚀 Sprint 3 Kickoff Checklist

### Before Starting
- [x] Audit complete
- [ ] Review existing analyzers
- [ ] Confirm v3 stack is production-ready
- [ ] Test thematic taxonomy
- [ ] Verify cultural safety middleware

### Day 1 Actions
1. [ ] Create Sprint 3 branch
2. [ ] Create transcript_analysis_results migration
3. [ ] Delete deprecated analyzers (6 files)
4. [ ] Update all imports to v3 stack
5. [ ] Test analysis pipeline

### Documentation Needed
- [ ] Which analyzer to use when
- [ ] Analysis pipeline architecture
- [ ] Theme taxonomy reference
- [ ] API usage examples
- [ ] Component integration guide

---

## 🎯 Why This Approach?

### Pros
✅ **Builds on existing work** - Leverages 28 analysis files already written
✅ **Focuses on gaps** - Only builds what's missing (UI, database, analytics)
✅ **Consolidates duplicates** - Removes confusion about which tool to use
✅ **Production-ready** - Uses best-in-class analyzers (v3, intelligent impact)
✅ **Cost-effective** - Can use FREE Ollama or paid Claude based on needs
✅ **Quality-focused** - Tracks metrics, version, and accuracy over time

### Cons
⚠️ **Less greenfield** - Not building everything from scratch
⚠️ **Requires cleanup** - Need to remove deprecated code first
⚠️ **Testing complexity** - Must validate existing analyzers work correctly

---

## 📝 Next Steps

**Immediate:**
1. Review audit findings with stakeholders
2. Confirm v3 analyzer stack is acceptable
3. Approve database schema
4. Begin Sprint 3 implementation

**This Week:**
- Database migration + cleanup (Days 1-2)
- Core UI components (Days 3-5)

**Next Week:**
- Analytics + testing (Days 6-10)
- Documentation + deployment

---

**Status:** Ready to begin Sprint 3 with clear consolidation + gap-filling strategy

**Recommendation:** Proceed with this revised plan instead of building 12-14 new components. Focus on quality, consolidation, and completion of existing work.
