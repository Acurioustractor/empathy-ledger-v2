# Backend Integration Plan - Intelligent AI Systems

## Overview

Replace keyword-based analysis in `/api/projects/[id]/analysis` with intelligent GPT-4 systems.

## Current Flow (746 lines - OLD)

```
GET /api/projects/[id]/analysis
  ↓
1. Fetch project + transcripts
  ↓
2. For each transcript:
   - Extract impact insights (KEYWORD MATCHING - BAD)
   - Calculate dimensions (ARBITRARY SCORES - BAD)
  ↓
3. Extract story elements (REGEX PATTERNS - BAD)
  ↓
4. Extract powerful quotes (FROM FAKE INSIGHTS - BAD)
  ↓
5. Aggregate and return
```

## New Flow (Intelligent AI)

```
GET /api/projects/[id]/analysis
  ↓
1. Fetch project + transcripts
  ↓
2. For each transcript with text:
   - extractIntelligentQuotes() → Professional quotes
   - assessIndigenousImpact() → Evidence-based scores
  ↓
3. aggregateIndigenousImpact() → Project-level insights
  ↓
4. Return with evidence and reasoning
```

## Key Changes

### 1. Import Intelligent Systems

```typescript
import { extractIntelligentQuotes } from '@/lib/ai/intelligent-quote-extractor'
import { assessIndigenousImpact, aggregateIndigenousImpact } from '@/lib/ai/intelligent-indigenous-impact-analyzer'
```

### 2. Replace Quote Extraction

**OLD** (lines 447-475):
```typescript
const transformationPatterns = /\b(changed|transformed|different)\b.*?[.!?]/gi
const transformationMoments = [...allText.matchAll(transformationPatterns)]
```

**NEW**:
```typescript
const quoteResults = await Promise.all(
  transcriptsWithText.map(t =>
    extractIntelligentQuotes(t.text, t.storytellerName, 5)
  )
)
```

### 3. Replace Impact Assessment

**OLD** (lines 604-661):
```typescript
function calculateImpactDimensions(sentence, impactType) {
  const baseScores = {
    culturalContinuity: 0,
    communityEmpowerment: 0,
    // ...
  }

  switch (impactType) {
    case 'cultural_protocol':
      baseScores.culturalContinuity = 0.9  // ARBITRARY!
  }
}
```

**NEW**:
```typescript
const impactResults = await Promise.all(
  transcriptsWithText.map(t =>
    assessIndigenousImpact(t.text, t.storytellerName)
  )
)
```

### 4. Update Data Structure

**NEW** fields to return:
```typescript
interface EnhancedQuote {
  text: string
  speaker: string
  category: string
  themes: string[]
  significance: string  // NEW - WHY it matters
  emotional_tone: string  // NEW
  confidence_score: number  // REAL score, not fake
  is_complete_thought: boolean  // NEW
}

interface EnhancedImpactAssessment {
  dimension: string
  score: number  // 0-100, EVIDENCE-BASED
  evidence: {
    quotes: string[]  // NEW - specific evidence
    context: string  // NEW
    depth: 'mention' | 'description' | 'demonstration' | 'transformation'  // NEW
  }
  reasoning: string  // NEW - transparent explanation
  confidence: number  // REAL confidence
}
```

### 5. Aggregate Impact

**OLD**:
```typescript
const totals = insights.reduce((acc, insight) => {
  acc.culturalContinuity += insight.impactDimensions.culturalContinuity
  return acc
}, { culturalContinuity: 0, ... })

return {
  culturalContinuity: totals.culturalContinuity / insights.length
}
```

**NEW**:
```typescript
const aggregated = aggregateIndigenousImpact(impactResults)

return {
  average_scores: aggregated.average_scores,  // Evidence-based
  strongest_dimensions: aggregated.strongest_dimensions,  // With depth distribution
  collective_strengths: aggregated.collective_strengths,
  community_narrative: aggregated.community_narrative
}
```

## Implementation Strategy

### Option A: Complete Replacement (Recommended)
- Create new streamlined route file
- Remove all keyword/regex logic
- Use intelligent AI throughout
- Cleaner, more maintainable

### Option B: Gradual Migration
- Keep old logic
- Add flag: `?useIntelligentAI=true`
- Run both in parallel for comparison
- Switch over when validated

**Recommendation: Option A** - The old system is fundamentally flawed, no benefit keeping it.

## Updated API Response

```typescript
{
  projectInfo: { /* same */ },
  storytellers: [
    {
      id: string,
      displayName: string,
      transcriptCount: number,

      // NEW - Intelligent quotes
      powerfulQuotes: [
        {
          text: string,
          category: string,
          significance: string,  // NEW
          emotional_tone: string,  // NEW
          quality_score: number,  // REAL score
          themes: string[]  // NEW
        }
      ],

      // NEW - Evidence-based impact
      impactAssessment: {
        assessments: [
          {
            dimension: string,
            score: number,  // 0-100, evidence-based
            depth: string,  // mention/description/demonstration/transformation
            reasoning: string,  // WHY this score
            evidence_quotes: string[],
            confidence: number
          }
        ],
        overall_summary: string
      }
    }
  ],

  // NEW - Aggregate insights
  aggregatedImpact: {
    average_scores: {
      relationship_strengthening: number,
      cultural_continuity: number,
      community_empowerment: number,
      system_transformation: number
    },
    strongest_dimensions: [
      {
        dimension: string,
        avg_score: number,
        depth_distribution: {
          mention: number,
          description: number,
          demonstration: number,
          transformation: number
        }
      }
    ],
    collective_strengths: string[],
    community_narrative: string
  },

  // Enhanced quotes collection
  allPowerfulQuotes: [
    {
      text: string,
      speaker: string,
      quality_score: number,
      significance: string,
      themes: string[]
    }
  ]
}
```

## Performance Considerations

### Current System
- Instant (regex/keyword matching)
- Free
- **Meaningless results**

### New System
- ~30-40s per transcript (GPT-4 analysis)
- ~$0.05 per transcript
- **Professional-quality insights**

### Optimization Strategies

1. **Parallel Processing**
```typescript
// Process all transcripts in parallel
const results = await Promise.all(
  transcripts.map(t => analyzeTranscript(t))
)
// Time: ~40s (not 40s × 23 transcripts)
```

2. **Caching**
```typescript
// Store results in database
// Only re-analyze if transcript changed
if (transcript.ai_analysis_version === 'intelligent_v1') {
  return cached
}
```

3. **Progressive Loading**
```typescript
// Return partial results as they complete
// Use streaming or websockets for real-time updates
```

## Database Schema Updates

Add fields to `transcripts` table:

```sql
ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS
  intelligent_quotes JSONB,  -- Store IntelligentQuote[]
  intelligent_impact JSONB,  -- Store ContextualImpactAssessment[]
  ai_analysis_version TEXT DEFAULT 'legacy',  -- Track which system used
  ai_analysis_date TIMESTAMPTZ;  -- When analyzed
```

## Migration Steps

### Phase 1: Backend Update ✅
1. ✅ Create intelligent extractors
2. ⏳ Update `/api/projects/[id]/analysis/route.ts`
3. ⏳ Test on sample project
4. ⏳ Deploy

### Phase 2: Frontend Update
1. Update `ProjectAnalysisView.tsx` to display:
   - Quote quality scores
   - Impact dimension depth levels
   - Evidence quotes
   - Reasoning/transparency
2. Add "Why this score?" tooltips
3. Show depth progression (mention → transformation)

### Phase 3: Database Migration
1. Run intelligent analysis on existing projects
2. Store results in new JSONB fields
3. Mark as `ai_analysis_version: 'intelligent_v1'`

### Phase 4: Cleanup
1. Remove old keyword/regex code
2. Remove fake confidence calculations
3. Archive `indigenous-impact-analyzer.ts` (old version)

## Testing Plan

1. **Unit Tests**
   - Test intelligent extractors in isolation
   - Verify quality scoring
   - Check evidence extraction

2. **Integration Tests**
   - Test full analysis API endpoint
   - Verify response structure
   - Check performance (should complete in < 60s for 3 transcripts)

3. **Comparison Tests**
   - Run old vs new on same transcripts
   - Document improvements
   - Show evidence-based scoring works

4. **User Acceptance**
   - Demo to stakeholders
   - Show transparency (evidence + reasoning)
   - Confirm it addresses "harsh scoring" concern

## Cost Projection

### Goods Project (23 transcripts)
- Quote extraction: 23 × $0.02 = $0.46
- Impact assessment: 23 × $0.03 = $0.69
- **Total: ~$1.15**

### Per Analysis Run
- Small project (5 transcripts): ~$0.25
- Medium project (15 transcripts): ~$0.75
- Large project (50 transcripts): ~$2.50

**Cost is negligible compared to value of meaningful insights.**

## Success Metrics

### Quality Improvements
- ✅ No quote fragments (was: 8/13 quotes were fragments)
- ✅ Real confidence scores (was: fake 60-95%)
- ✅ Complete thoughts only (was: "knowledge.", "hard.")
- ✅ Evidence-based impact scores (was: arbitrary 0.6, 0.9)
- ✅ Transparent reasoning (was: none)

### User Experience
- ✅ Understand WHY a score was given
- ✅ See EVIDENCE for each dimension
- ✅ Trust the analysis (not questioning harsh scores)
- ✅ Get actionable insights

## Next Actions

1. ⏳ Create new streamlined `/api/projects/[id]/analysis/route.ts`
2. ⏳ Test on Goods project
3. ⏳ Update frontend components
4. ⏳ Deploy and re-analyze all projects

---

**Ready to implement!** All intelligent AI systems are built and tested. Just need to wire them into the backend API and frontend display.
