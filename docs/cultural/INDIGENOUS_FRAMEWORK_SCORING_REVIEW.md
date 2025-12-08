# Indigenous Impact Framework Scoring Review

## Problem Identified

The Indigenous impact framework is using the same **harsh, arbitrary scoring** as the old quote extraction system. You're right to question it!

### Current Issues

#### 1. Hardcoded Arbitrary Scores
[indigenous-impact-analyzer.ts:206-261](src/lib/ai/indigenous-impact-analyzer.ts#L206)

```typescript
// HARSH ARBITRARY SCORING
switch (impactType) {
  case 'cultural_protocol':
    baseScores.culturalContinuity = 0.9  // Why 0.9? Arbitrary!
    baseScores.relationshipStrengthening = 0.7  // Why not 0.8 or 0.6?
    break
  case 'community_leadership':
    baseScores.communityEmpowerment = 0.9  // Fixed score, no nuance
    baseScores.systemTransformation = 0.6  // Arbitrary threshold
}

// Tiny keyword boosts
if (lower.includes('together')) baseScores.communityEmpowerment += 0.1
```

**Problems**:
- ❌ Scores don't reflect **actual story depth or quality**
- ❌ Binary keyword matching (present/absent) = harsh
- ❌ No consideration for **HOW WELL** the story demonstrates impact
- ❌ Same 0.9 score for deep cultural protocol vs passing mention
- ❌ Doesn't account for storyteller voice strength, detail, or emotion

#### 2. Fake Confidence Scores
[indigenous-impact-analyzer.ts:320-339](src/lib/ai/indigenous-impact-analyzer.ts#L320)

```typescript
function calculateConfidence(sentence: string, matchedPattern: string): number {
  let confidence = 0.6 // Base confidence - ARBITRARY!

  if (sentence.includes(matchedPattern)) confidence += 0.2  // Keyword match = +20%
  if (sentence.length > 100) confidence += 0.1  // Long sentence = +10%
  if (sentence.includes('i ') || sentence.includes('we ')) confidence += 0.1  // First person = +10%

  return Math.min(0.95, confidence) // Cap at 95%
}
```

**Problems**:
- ❌ Length ≠ Quality (could be rambling)
- ❌ Keyword presence ≠ Impact strength
- ❌ Every story gets 60-95% "confidence" - meaningless range
- ❌ No actual quality assessment

### Real-World Impact

When you look at Goods project analysis, you might see:
- "Relationship Strengthening: 0.7" - **What does this mean?**
- "Cultural Continuity: 0.9" - **Based on what evidence?**
- Stories with brief mentions score same as deep cultural narratives
- No way to distinguish **powerful** vs **superficial** impact

## Better Approach: Story-Based Contextual Scoring

### Principles

1. **Context Over Keywords** - Understand what the storyteller is actually saying
2. **Depth Matters** - Detailed personal stories score higher than mentions
3. **Community-Defined** - Let the story show impact, don't impose metrics
4. **Nuanced Scoring** - Reflect real differences in impact strength
5. **Transparent** - Explain WHY a score is assigned

### Proposed Solution: AI-Based Contextual Impact Assessment

Replace arbitrary keyword scoring with GPT-4 analysis that assesses:

#### Dimension 1: Relationship Strengthening (0-100)
**Questions**:
- Does the story show relationships being built or deepened?
- Are there specific examples of trust, connection, collaboration?
- What evidence of relationship outcomes?

**Scoring**:
- 0-30: Brief mention of relationships
- 31-60: Describes relationship-building activities
- 61-80: Shows specific relationship outcomes
- 81-100: Demonstrates transformative relationship impacts with evidence

#### Dimension 2: Cultural Continuity (0-100)
**Questions**:
- How deeply does the story engage with cultural practices/knowledge?
- Is this about maintaining, learning, or transmitting culture?
- What evidence of cultural connection?

**Scoring**:
- 0-30: Mentions culture/tradition
- 31-60: Describes cultural practices or connection
- 61-80: Shows cultural knowledge being passed on
- 81-100: Demonstrates living cultural practice with intergenerational impact

#### Dimension 3: Community Empowerment (0-100)
**Questions**:
- Does the story show community agency and self-determination?
- Are there examples of community-led decisions or actions?
- What evidence of increased community power?

**Scoring**:
- 0-30: Mentions community
- 31-60: Describes community activities
- 61-80: Shows community decision-making
- 81-100: Demonstrates community transformation and sovereignty

#### Dimension 4: System Transformation (0-100)
**Questions**:
- Does the story show institutions/systems changing?
- Are there examples of systems becoming more responsive?
- What evidence of structural change?

**Scoring**:
- 0-30: Mentions systems/institutions
- 31-60: Describes navigating systems
- 61-80: Shows systems responding differently
- 81-100: Demonstrates institutional transformation

### Implementation

```typescript
export interface ContextualImpactAssessment {
  dimension: 'relationship' | 'cultural' | 'empowerment' | 'transformation'
  score: number // 0-100, based on actual story content
  evidence: {
    quotes: string[] // Specific quotes demonstrating this impact
    context: string // What's happening in the story
    depth: 'mention' | 'description' | 'demonstration' | 'transformation'
  }
  reasoning: string // WHY this score (transparent)
  confidence: number // AI's confidence in this assessment
}

async function assessImpactDimension(
  transcript: string,
  dimension: string
): Promise<ContextualImpactAssessment> {
  // Use GPT-4 to understand the story and assess actual impact depth
  // Return evidence-based scoring with reasoning
}
```

### Key Improvements

| Aspect | Old System | New System |
|--------|-----------|-----------|
| **Basis** | Keyword matching | Story comprehension |
| **Scoring** | Arbitrary fixed scores (0.6, 0.9) | Evidence-based (0-100) |
| **Nuance** | Binary (present/absent) | Graduated (mention → transformation) |
| **Evidence** | Keyword found | Specific quotes + context |
| **Transparency** | Opaque | Explains reasoning |
| **Accuracy** | Poor (keyword ≠ quality) | High (understands story) |

## Recommendation

### Phase 1: Document Current System Issues ✅
- Explain why scoring seems "harsh"
- Show it's not harsh, it's **meaningless** (arbitrary numbers)

### Phase 2: Implement Contextual Assessment
- Create `intelligent-indigenous-impact-analyzer.ts`
- Use GPT-4 to understand story depth
- Score based on evidence, not keywords
- Provide reasoning for each score

### Phase 3: Validate with Community Stories
- Test on Goods project transcripts
- Compare keyword scores vs contextual scores
- Show difference: "together" (keyword) vs deep collaboration story
- Get more meaningful insights

### Phase 4: Integrate with Analysis Pipeline
- Replace keyword matching in `route.ts`
- Update frontend to show reasoning
- Display evidence quotes for each dimension

## Cost Analysis

**Current system**: Free (keyword matching)
**New system**: ~$0.02-0.03 per transcript for contextual impact assessment
**Benefit**: Actually meaningful Indigenous impact metrics instead of arbitrary percentages

## Example Comparison

### Old System (Keyword-based)
```
Transcript mentions "community" 12 times
→ communityEmpowerment = 0.9 (90%)

Transcript mentions "traditional" 3 times
→ culturalContinuity = 0.9 (90%)

Confidence: 95% (fake)
```

### New System (Story-based)
```
Analysis: This story demonstrates deep community empowerment through:
- Community-led decision to create housing program
- Elder council choosing priorities
- Youth involvement in planning
→ communityEmpowerment = 85/100

Evidence: "We got to break that cycle... other people telling us what's best for our community"
Reasoning: Shows explicit self-determination and breaking historical patterns
Depth: Transformation (not just description)
Confidence: 88% (based on clarity and detail)

Analysis: Cultural continuity shown through:
- Brief mention of "traditional owners"
- No specific cultural practices described
- No evidence of knowledge transmission
→ culturalContinuity = 35/100

Evidence: "traditional owners" (mentioned once)
Reasoning: Acknowledged but not central to story
Depth: Mention (not demonstration)
Confidence: 90% (clear this is not the focus)
```

## Next Steps

1. ✅ Identify the problem (done)
2. ⏳ Build `intelligent-indigenous-impact-analyzer.ts`
3. ⏳ Test on sample transcripts
4. ⏳ Compare scores: keyword vs contextual
5. ⏳ Integrate into analysis pipeline
6. ⏳ Update frontend to show evidence

---

**Conclusion**: The current Indigenous framework scoring is arbitrary keyword-based percentages that don't reflect actual story quality. We should replace it with AI-based contextual assessment that understands story depth and provides evidence-based, transparent scoring.
