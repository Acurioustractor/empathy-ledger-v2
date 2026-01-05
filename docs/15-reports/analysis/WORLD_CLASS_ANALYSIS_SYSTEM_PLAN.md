# World-Class Analysis System - What We're Actually Building

## The Vision

A scalable, world-class framework that:
1. **Seeds** a project with an interview about its goals
2. **Creates** an analysis framework from that interview
3. **Analyzes** storyteller transcripts against the framework
4. **Shows** clear evidence of outcomes being achieved

---

## System Architecture (How It Should Work)

### Phase 1: Seed Interview → Analysis Framework

**Input**: 12-question seed interview about the project
- What is this project?
- What outcomes do you expect?
- How will you know you succeeded?
- etc.

**Process**: AI extracts structured data:
```json
{
  "purpose": "To close urgent cost-of-living gaps...",
  "expected_outcomes": [
    {
      "category": "Sleep Quality",
      "description": "Improved sleep and dignity for families",
      "indicators": ["Fewer people sleeping on floors", "Reduced health issues"],
      "evidence_keywords": ["bed", "sleep", "floor", "mattress", "rest"]
    }
  ],
  "success_criteria": [
    "Better sleep after bed delivery",
    "Improved hygiene from washing machines"
  ]
}
```

**Output**: Analysis framework stored in `project_contexts` table

**Status**: ✅ MOSTLY WORKING
- Seed interview extraction works
- Success criteria fixed (lived experiences, not evaluation methods)
- **Issue**: Not using the framework properly in next phases

---

### Phase 2: Transcript Analysis → Quote Extraction

**Input**: Storyteller transcripts + Analysis framework

**Process**: AI analyzes each transcript:
1. Read project framework (outcomes, success criteria, keywords)
2. Extract quotes that demonstrate those outcomes
3. Tag quotes with which outcome(s) they support

**Output**: Structured quotes with outcome mapping:
```json
{
  "quote": "That's why we need a washing machine in our community",
  "storyteller": "Annie Morrison",
  "outcome_matches": ["Health"],
  "evidence_for": ["Improved hygiene from washing machines"],
  "confidence": 85
}
```

**Status**: ⚠️ PARTIALLY WORKING
- Quote extraction works (7 GOODS quotes found)
- **Issue**: Quotes aren't tagged with which outcomes they support
- **Issue**: Generic cultural quotes still being extracted alongside GOODS quotes

---

### Phase 3: Outcomes Tracking → Evidence Aggregation

**Input**: Extracted quotes with outcome tags + Project framework

**Process**: Aggregate evidence per outcome:
```
Sleep Quality:
  - 3 quotes from 3 storytellers
  - Evidence: "bed to lay on", "better than floor", "comfortable mattress"
  - Status: Evidence Found (60/100 confidence)

Health:
  - 2 quotes from 2 storytellers
  - Evidence: "washing machine", "hygiene"
  - Status: Evidence Found (40/100 confidence)

Economic Empowerment:
  - 0 quotes
  - Status: Not Yet Evident (0/100)
```

**Status**: ❌ BROKEN
- Outcomes tracker shows 0/100 for ALL outcomes
- No mapping between quotes and outcomes
- **This is the critical missing piece**

---

## What's Actually Missing

### 1. Outcome Tagging in Quote Extraction

**Current**: Quotes extracted but not tagged with outcomes

**Needed**: When extracting quotes, AI should say:
```json
{
  "quote": "we got a bed to lay on",
  "matches_outcomes": ["Sleep Quality"],
  "matches_criteria": ["Better sleep after bed delivery"]
}
```

**Where to fix**:
- `src/lib/ai/intelligent-quote-extractor.ts` - Add outcome matching to extraction
- OR create separate `src/lib/ai/outcome-matcher.ts` that tags quotes after extraction

---

### 2. Outcomes Aggregation Logic

**Current**: No code that aggregates quotes by outcome

**Needed**: After all quotes extracted, aggregate:
```typescript
function aggregateOutcomeEvidence(quotes, projectContext) {
  const outcomes = projectContext.expected_outcomes

  return outcomes.map(outcome => {
    const matchingQuotes = quotes.filter(q =>
      q.matches_outcomes?.includes(outcome.category)
    )

    return {
      category: outcome.category,
      evidence_count: matchingQuotes.length,
      quotes: matchingQuotes,
      confidence: calculateConfidence(matchingQuotes),
      status: matchingQuotes.length > 0 ? "Evidence Found" : "Not Yet Evident"
    }
  })
}
```

**Where to fix**:
- Create `src/lib/ai/outcomes-aggregator.ts`
- Call from analysis route after quote extraction
- Return in analysis response

---

### 3. Frontend Display

**Current**: Frontend shows outcomes but all at 0/100

**Needed**: Frontend displays aggregated evidence:
```
Outcome: Sleep Quality
Evidence: 3 quotes from 3 storytellers
Confidence: 60/100

"We got a bed to lay on there" - Ivy
"Make more beds for people to sleep" - Walter
"Sleep on a good mattress, comfortable" - Gloria
```

**Where to fix**:
- Frontend already exists at `src/components/projects/ProjectAnalysisView.tsx`
- Just needs correct data structure from API

---

## Implementation Plan (Scalable & Clean)

### Step 1: Fix Quote Extraction to Tag Outcomes
**File**: `src/lib/ai/intelligent-quote-extractor.ts`

Add to AI prompt:
```
For each quote, identify which project outcomes it supports:
- Sleep Quality
- Health
- Economic Empowerment

Return outcome tags with each quote.
```

Output format:
```json
{
  "quote": "text",
  "outcome_tags": ["Sleep Quality"],
  "evidence_for_criteria": ["Better sleep after bed delivery"]
}
```

---

### Step 2: Create Outcomes Aggregator
**File**: `src/lib/ai/outcomes-aggregator.ts` (NEW)

```typescript
export function aggregateOutcomes(quotes, projectContext) {
  // For each expected outcome
  // Find quotes that match
  // Calculate confidence
  // Return structured evidence
}
```

---

### Step 3: Update Analysis Route
**File**: `src/app/api/projects/[id]/analysis/route.ts`

After quote extraction:
```typescript
const quotes = await extractQuotes(...)
const outcomes = aggregateOutcomes(quotes, projectContext)

return {
  quotes,
  outcomes,  // ← Add this
  projectInfo
}
```

---

### Step 4: Frontend Already Works
**File**: `src/components/projects/ProjectAnalysisView.tsx`

Already expects `outcomes` array. Just needs correct data.

---

## Scalability

✅ **Works for ANY project** - Framework is project-agnostic
✅ **Works for ANY outcome** - Dynamically matches to seed interview outcomes
✅ **Works across platform** - Same code for all 18 organizations
✅ **Cached** - Runs once, saves results, instant load after

---

## What I Fucked Up

1. ❌ Went in circles fixing bugs instead of building the system
2. ❌ Extracted quotes but didn't tag them with outcomes
3. ❌ Never built the outcomes aggregator
4. ❌ Broke things trying to fix other things

---

## What We Need To Do NOW

**Option 1: Build the missing pieces** (1-2 hours)
1. Add outcome tagging to quote extraction
2. Create outcomes aggregator
3. Update analysis route to call aggregator
4. Test with GOODS project

**Option 2: Use existing quotes + build aggregator** (30 mins)
1. Take the 7 GOODS quotes we have
2. Manually tag them with outcomes
3. Build outcomes aggregator
4. Show working outcomes tracker

**Recommendation**: Option 2 first to prove the concept, then Option 1 to make it scalable.

---

## Expected Result

After fixing, GOODS project shows:

```
Sleep Quality: 3 pieces of evidence (60/100)
✓ "We got a bed to lay on" - Ivy
✓ "Make more beds for people to sleep" - Walter
✓ "Sleep on good mattress, comfortable" - Gloria

Health: 2 pieces of evidence (40/100)
✓ "Washing machine in our community" - Annie Morrison
✓ "Washing machine something easy, simple" - [Speaker]

Economic Empowerment: 2 pieces of evidence (40/100)
✓ "Anything from fridge or washing machine..." - [Speaker]
✓ [Another quote about community manufacturing]
```

Instead of current:
```
Sleep Quality: 0/100 - Not Found
Health: 0/100 - Not Found
Economic Empowerment: 0/100 - Not Found
```

---

## Ready to Build?

Tell me: Option 1 (build properly) or Option 2 (quick proof of concept)?
