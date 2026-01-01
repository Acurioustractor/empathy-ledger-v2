# Research & Analysis AI Framework Recommendation

**Date:** October 27, 2025
**Issue:** Current quote extraction is producing low-quality, misaligned, incoherent quotes
**Priority:** CRITICAL - Affects platform credibility and community representation

---

## Current Problems

### 1. Quality Issues
```
❌ "Because your back pain and all this, and you're gonna be moving around rib side
    with a problem in your leg. Your hip may be sore or something."
    - Brian Russell (95% confidence)
```
**Problems:**
- Incoherent sentence structure
- Incomplete thought
- Rambling, no clear message
- Should be 20% confidence, not 95%

### 2. Project Misalignment
```
❌ "What we can see is that community really need it. There's been something that was
    said in community once the Orange Sky had come to town..."
    - Ana - Bega (95% confidence)
```
**Problems:**
- This is about ORANGE SKY (shower service), not GOODS project
- Ana - Bega isn't even a GOODS storyteller
- Wrong transcripts being analyzed

### 3. Low-Value Quotes
```
❌ "I think it's a great bed. Nice bed. And it's more lower, more comfortable."
    - Melissa Jackson (85% confidence)
```
**Problems:**
- Poor grammar ("more lower")
- Superficial, not insightful
- Doesn't demonstrate project impact or community wisdom

---

## Recommended Framework

### Phase 1: Project-Aligned Quote Extraction

**BEFORE extracting quotes, the AI must:**

1. **Understand Project Context Deeply**
   ```typescript
   interface ProjectContext {
     // Core identity
     project_name: string
     project_purpose: string // What problem does this solve?
     target_communities: string[]

     // Success indicators (from seed interview)
     primary_outcomes: string[] // e.g., "Improved sleep quality", "Community ownership"
     success_looks_like: string // Narrative description
     cultural_approaches: string[] // e.g., "Elder-led", "Two-way learning"

     // Analysis focus
     extract_quotes_that_demonstrate: string[] // Specific instructions
     avoid_topics: string[] // What NOT to include
   }
   ```

2. **Filter Transcripts FIRST**
   ```typescript
   // CRITICAL: Only analyze transcripts actually linked to THIS project
   const projectTranscripts = await getTranscriptsForProject(projectId)

   // Verify storytellers belong to this project
   const projectStorytellers = await getStorytellersForProject(projectId)

   // DO NOT pull quotes from:
   // - Other projects' transcripts
   // - Storytellers not assigned to this project
   // - Unrelated community members
   ```

3. **Quality Gate Before Extraction**
   ```typescript
   function meetsQualityThreshold(quote: string): boolean {
     // Minimum length
     if (quote.split(' ').length < 10) return false

     // Must be coherent (check grammar, structure)
     if (!isCoherent(quote)) return false

     // Must be complete thought
     if (!hasSubjectAndPredicate(quote)) return false

     // Must add value (not superficial)
     if (isSuperficial(quote)) return false

     return true
   }
   ```

### Phase 2: Context-Aware Extraction Prompt

**NEW Prompt Structure:**

```typescript
const systemPrompt = `You are analyzing Indigenous community storytelling to extract
powerful, high-quality quotes that demonstrate THIS SPECIFIC PROJECT'S impact.

PROJECT: ${projectName}
PURPOSE: ${projectPurpose}
COMMUNITIES: ${targetCommunities.join(', ')}

PRIMARY OUTCOMES THIS PROJECT TRACKS:
${primaryOutcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}

CULTURAL APPROACHES:
${culturalApproaches.join(', ')}

EXTRACTION RULES:

1. ONLY extract quotes that:
   - Directly relate to THIS project's purpose and outcomes
   - Demonstrate the outcomes listed above
   - Show evidence of cultural approaches in action
   - Are coherent, grammatically sound, complete thoughts
   - Contain genuine insight, wisdom, or transformational evidence

2. NEVER extract quotes that:
   - Are incoherent, rambling, or incomplete
   - Are superficial ("it's nice", "I like it")
   - Mention other projects, programs, or initiatives
   - Are just descriptions without insight
   - Have poor grammar that obscures meaning

3. QUALITY THRESHOLDS:
   - Minimum 15 words (unless profound wisdom in fewer)
   - Must be a complete sentence or thought
   - Must demonstrate one of: wisdom, transformation, cultural insight, impact evidence
   - Grammar must be clear enough to understand meaning

4. CONFIDENCE SCORING:
   - 90-100%: Profound, clear, directly demonstrates project outcome
   - 75-89%: Strong, relevant, good evidence of impact
   - 60-74%: Decent quality, somewhat relevant
   - Below 60%: DO NOT INCLUDE

5. CONTEXT REQUIREMENT:
   - Every quote must include 2-3 sentences of surrounding context
   - Context must explain what the storyteller was discussing
   - Must help reader understand significance
`

const userPrompt = `Extract the TOP 3-5 highest quality quotes from each transcript
that demonstrate THIS PROJECT's outcomes.

PROJECT OUTCOMES TO LOOK FOR:
${primaryOutcomes.join('\n- ')}

TRANSCRIPTS:
${transcripts.map(t => `
=== ${t.storyteller} ===
${t.text}
`).join('\n\n')}

Return ONLY quotes that:
1. Are directly about ${projectPurpose}
2. Demonstrate the outcomes listed above
3. Meet all quality thresholds
4. Are from storytellers actually involved in THIS project

If NO high-quality quotes exist for a transcript, return EMPTY array.
Better to have NO quotes than LOW-QUALITY quotes.
`
```

### Phase 3: Post-Extraction Validation

```typescript
async function validateExtractedQuotes(
  quotes: ExtractedQuote[],
  projectContext: ProjectContext,
  transcripts: Transcript[]
): Promise<ValidatedQuote[]> {

  const validated: ValidatedQuote[] = []

  for (const quote of quotes) {
    // 1. Verify quote actually exists in transcript
    const exists = transcripts.some(t =>
      t.text.includes(quote.text.trim())
    )
    if (!exists) {
      console.warn(`Quote fabricated - removing: "${quote.text.substring(0, 50)}..."`)
      continue
    }

    // 2. Check quote quality
    if (!meetsQualityThreshold(quote.text)) {
      console.warn(`Quote below quality threshold: "${quote.text.substring(0, 50)}..."`)
      continue
    }

    // 3. Verify project alignment
    const aligned = checkProjectAlignment(
      quote,
      projectContext.primary_outcomes,
      projectContext.avoid_topics
    )
    if (!aligned) {
      console.warn(`Quote not aligned to project: "${quote.text.substring(0, 50)}..."`)
      continue
    }

    // 4. Recalculate confidence based on actual quality
    const recalculatedConfidence = assessRealConfidence(
      quote,
      projectContext,
      transcripts
    )

    validated.push({
      ...quote,
      confidence_score: recalculatedConfidence,
      validation_passed: true,
      validation_notes: []
    })
  }

  return validated
}
```

### Phase 4: Project-Specific Analysis Instructions

**For GOODS Project Specifically:**

```typescript
const goodsProjectContext = {
  project_name: "Goods",
  project_purpose: "Creating better white goods and beds for Lockhart River and Palm Island communities through community-led co-creation",

  primary_outcomes: [
    "Improved sleep quality (comfortable beds, better rest)",
    "Better hygiene (functional washing machines, clean clothes)",
    "Community ownership (people leading the design/creation)",
    "Culturally appropriate design (goods that fit community needs)",
    "Local manufacturing capacity (community making their own goods)",
    "Reduced health issues (better sleep, hygiene, nutrition from working fridges)"
  ],

  cultural_approaches: [
    "Community-led design",
    "Walking alongside (not telling what to do)",
    "Different cultural contexts respected",
    "Elder guidance and approval"
  ],

  extract_quotes_that_demonstrate: [
    "Personal experience with beds, washing machines, fridges",
    "Impact on sleep, health, hygiene from having/not having goods",
    "Community involvement in designing or creating goods",
    "Cultural considerations in household goods design",
    "Stories of change after receiving new goods",
    "Wisdom about what communities actually need"
  ],

  avoid_topics: [
    "Other projects (Orange Sky, housing programs not related to goods)",
    "General community issues unrelated to household goods",
    "Abstract discussions without connection to beds/washing/fridges",
    "Stories from people not involved in GOODS project"
  ]
}
```

### Phase 5: Human-Assisted Review (Optional but Recommended)

```typescript
interface ReviewWorkflow {
  // After AI extraction, before publishing:

  step1_ai_extraction: () => ExtractedQuote[]
  step2_validation: () => ValidatedQuote[]
  step3_human_review: () => {
    // Present top 20 quotes to human reviewer
    // Reviewer can:
    // - Approve/reject each quote
    // - Adjust confidence scores
    // - Add context notes
    // - Flag for community review
  }
  step4_community_review_optional: () => {
    // For highest-impact quotes, ask storyteller:
    // "We'd like to feature this quote. Is this okay?"
    // Indigenous data sovereignty
  }
  step5_publication: () => ApprovedQuote[]
}
```

---

## Implementation Priority

### Immediate (This Week):
1. ✅ Fix quote verification (DONE - prevents fabrication)
2. 🔴 **Add quality filtering** - Reject incoherent/superficial quotes
3. 🔴 **Add project alignment check** - Only quotes about THIS project's work
4. 🔴 **Fix transcript filtering** - Only analyze correct transcripts

### Short-Term (Next 2 Weeks):
1. Implement context-aware extraction prompts
2. Add post-extraction validation pipeline
3. Create project-specific analysis instructions per project
4. Build quote quality scoring algorithm

### Long-Term (Next Month):
1. Human review interface for high-stakes quotes
2. Community consent workflow for featured quotes
3. Multi-model ensemble (Claude + GPT-4o for cross-validation)
4. Automated quality metrics tracking

---

## Specific Fixes Needed for GOODS

### Issue 1: Wrong Transcripts Being Analyzed

**Current Problem:** Ana - Bega (Orange Sky) quotes appearing in GOODS analysis

**Fix:**
```typescript
// In /src/app/api/projects/[id]/analysis/route.ts

// BEFORE (line 137-161):
const { data: transcripts } = await supabase
  .from('transcripts')
  .select(...)
  .eq('project_id', projectId) // This should work but isn't?

// ADD VERIFICATION:
console.log(`🔍 Fetching transcripts for project ${projectId}`)
console.log(`📊 Found ${transcripts?.length} transcripts`)

// Verify each transcript storyteller is assigned to THIS project
const { data: projectStorytellers } = await supabase
  .from('project_storytellers')
  .select('storyteller_id')
  .eq('project_id', projectId)

const validStorytellerIds = new Set(projectStorytellers.map(ps => ps.storyteller_id))

const filteredTranscripts = transcripts.filter(t => {
  const isValid = validStorytellerIds.has(t.storyteller_id)
  if (!isValid) {
    console.warn(`⚠️  Excluding transcript from ${t.profiles?.display_name} - not assigned to project`)
  }
  return isValid
})

console.log(`✅ ${filteredTranscripts.length} transcripts after filtering`)
```

### Issue 2: No Quality Threshold

**Add Quality Filter:**
```typescript
// New file: /src/lib/ai/quote-quality-filter.ts

export interface QuoteQualityScore {
  overall_score: number // 0-100
  coherence: number // Grammar, sentence structure
  completeness: number // Complete thought?
  depth: number // Superficial vs insightful
  relevance: number // Matches project focus?
  passes: boolean // Above threshold?
}

export function assessQuoteQuality(
  quote: string,
  context: string,
  projectFocus: string[]
): QuoteQualityScore {

  let coherence = 100
  let completeness = 100
  let depth = 100
  let relevance = 100

  // Coherence checks
  if (quote.includes('...')) coherence -= 20 // Indicates incomplete/edited
  if (!quote.match(/[.!?]$/)) completeness -= 30 // No ending punctuation
  if (quote.length < 50) depth -= 20 // Very short, likely superficial
  if (quote.split(' ').length < 10) completeness -= 20 // Too brief

  // Detect rambling/incoherence
  const sentences = quote.split(/[.!?]+/)
  if (sentences.some(s => s.split(' ').length > 40)) {
    coherence -= 30 // Very long run-on sentence
  }

  // Depth checks
  const superficialPhrases = [
    "it's nice", "it's good", "it's great", "I like it",
    "it's better", "it's comfortable", "it's more"
  ]
  if (superficialPhrases.some(phrase => quote.toLowerCase().includes(phrase))) {
    depth -= 40
  }

  // Relevance check
  const focusMatch = projectFocus.some(focus =>
    quote.toLowerCase().includes(focus.toLowerCase())
  )
  if (!focusMatch) relevance -= 50

  const overall_score = (coherence + completeness + depth + relevance) / 4

  return {
    overall_score,
    coherence,
    completeness,
    depth,
    relevance,
    passes: overall_score >= 60 // Threshold
  }
}
```

### Issue 3: Confidence Scores Are Meaningless

**Current:** AI says 95% confidence for incoherent rambling

**Fix:** Recalculate confidence based on actual quality

```typescript
function recalculateConfidence(
  aiConfidence: number,
  qualityScore: QuoteQualityScore,
  projectAlignment: number // 0-100
): number {

  // Start with AI's confidence
  let finalConfidence = aiConfidence

  // Heavily penalize low quality
  if (qualityScore.overall_score < 60) {
    finalConfidence = Math.min(finalConfidence, 40)
  }

  // Penalize poor project alignment
  if (projectAlignment < 50) {
    finalConfidence = Math.min(finalConfidence, 30)
  }

  // Boost high-quality, well-aligned quotes
  if (qualityScore.overall_score > 80 && projectAlignment > 80) {
    finalConfidence = Math.min(95, finalConfidence + 10)
  }

  return Math.round(finalConfidence)
}
```

---

## Testing the New Framework

### Test Case 1: GOODS Project

**Input:** Current 23 GOODS transcripts

**Expected Output:**
- Quotes ONLY from GOODS storytellers (not Ana - Bega or others)
- Quotes about beds, washing machines, fridges, sleep, hygiene
- High coherence scores (70+)
- Complete thoughts, clear meaning
- Evidence of project impact

**Quality Threshold:**
- Reject <60% overall quality
- Reject quotes from wrong projects
- Reject incoherent rambling

### Test Case 2: Deadly Hearts Trek

**Input:** RHD prevention transcripts

**Expected Output:**
- Quotes about health screening, RHD awareness, community education
- Cultural protocols (two-way learning, elder guidance)
- Impact stories (lives saved, early diagnosis)
- NO quotes about unrelated topics

---

## Recommendation Summary

### DO THIS NOW:
1. Add transcript filtering verification (prevent cross-project contamination)
2. Implement quote quality scoring
3. Set minimum quality threshold (60/100)
4. Recalculate AI confidence scores based on real quality

### DO THIS SOON:
1. Create project-specific extraction instructions for each project
2. Build validation pipeline
3. Add human review option for high-stakes quotes

### DO THIS EVENTUALLY:
1. Community consent workflow
2. Multi-model validation
3. Automated quality tracking dashboard

---

## Impact

**Before (Current):**
- Incoherent quotes with fake high confidence
- Cross-project contamination
- Superficial, low-value quotes featured
- Platform credibility at risk

**After (With New Framework):**
- Only high-quality, coherent quotes
- Project-specific, aligned content
- Meaningful confidence scores
- Community voices represented with dignity

---

**This framework treats community stories with the respect they deserve.**
**Quality over quantity.**
**Alignment over volume.**
**Truth over fabrication.**

