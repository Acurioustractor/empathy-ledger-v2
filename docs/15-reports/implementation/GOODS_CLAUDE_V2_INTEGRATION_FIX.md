# GOODS Claude V2 Integration Fix

## Problem Discovered

The Claude V2 integration was **falling back to V1** for all transcripts because the project context wasn't being passed correctly from the analysis route to the Claude extractor.

### Root Cause

The analysis route ([src/app/api/projects/[id]/analysis/route.ts:259-298](src/app/api/projects/[id]/analysis/route.ts#L259-L298)) was looking for project context in the wrong place:

**Before:**
- Queried `projects.context_model` and `projects.context_description`
- These fields were empty/null for GOODS

**After Seed Interview:**
- Context saved to `project_contexts` table with:
  - `expected_outcomes`: JSONB array with Sleep Quality, Health, Economic Empowerment
  - `success_criteria`: Text array with 4 success indicators
  - `cultural_approaches`: Cultural protocols and practices
  - `key_activities`: Project activities
  - `context_type`: 'full'

**Result:** Context existed but wasn't loaded → Claude V2 fallback to V1

## Fix Applied

### 1. Update Context Loading ([route.ts:259-318](src/app/api/projects/[id]/analysis/route.ts#L259-L318))

```typescript
// Before: Only checked projects table
const { data: projectData } = await supabase
  .from('projects')
  .select('context_model, context_description')
  .eq('id', projectId)
  .single()

// After: Check project_contexts first, fallback to projects
const { data: contextData } = await supabase
  .from('project_contexts')
  .select('*')
  .eq('project_id', projectId)
  .single()

if (contextData) {
  projectContext = {
    model: contextData.context_type || 'full',
    description: contextData.purpose || '',
    outcome_categories: contextData.expected_outcomes || [],
    positive_language: contextData.success_criteria || [],
    cultural_values: contextData.cultural_approaches || []
  }
}
```

### 2. Fix Claude V2 Context Mapping ([route.ts:336-359](src/app/api/projects/[id]/analysis/route.ts#L336-L359))

```typescript
// Before: Wrong field names
claudeProjectContext = {
  primary_outcomes: projectContext.outcome_categories || [],  // ❌ undefined
  extract_quotes_that_demonstrate: projectContext.positive_language || [],  // ❌ undefined
}

// After: Extract from structured JSONB
const outcomeCategories = (projectContext.outcome_categories || []).map((oc: any) => {
  if (typeof oc === 'string') return oc
  return oc.category || oc.description || ''
}).filter((cat: string) => cat.length > 0)

const extractQuotes = (projectContext.positive_language || []).map((pl: any) => {
  if (typeof pl === 'string') return pl
  return pl.phrase || pl.indicator || ''
}).filter((phrase: string) => phrase.length > 0)

claudeProjectContext = {
  project_name: project.name,
  project_purpose: projectContext.description,
  primary_outcomes: outcomeCategories,  // ✅ ["Sleep Quality", "Health", "Economic Empowerment"]
  extract_quotes_that_demonstrate: extractQuotes,  // ✅ [4 success criteria]
  cultural_approaches: projectContext.cultural_values  // ✅ [2 cultural approaches]
}
```

## Expected Outcome

After this fix, when analysis runs:

1. ✅ Load context from `project_contexts` table
2. ✅ Extract 3 outcome categories from JSONB
3. ✅ Extract 4 success criteria phrases
4. ✅ Extract 2 cultural approaches
5. ✅ Pass to Claude V2 extractor
6. ✅ Claude V2 runs with quality filtering
7. ✅ No V1 fallback

## Test Results (Pending)

To test the fix:

```bash
# Clear cache
npm run tsx scripts/clear-analysis-cache.ts

# Open in browser
http://localhost:3030/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/analysis

# Click "AI Analysis" button

# Watch server logs for:
✅ 📋 Using full project context from seed interview
✅ 📋 Claude V2 context: 3 outcomes, 4 quote types, 2 cultural approaches
✅ 🔬 Using Claude V2 with project-aligned quality filtering
✅ ✅ Extracted N high-quality quotes (rejected M)
❌ 📝 Using Claude V1 (legacy extraction)  # Should NOT appear
```

## Files Modified

1. [src/app/api/projects/[id]/analysis/route.ts](src/app/api/projects/[id]/analysis/route.ts)
   - Lines 259-318: Load from `project_contexts` table
   - Lines 336-359: Map to Claude V2 format with JSONB extraction

## Next Steps

1. Run analysis test (see Test Results section above)
2. Verify Claude V2 runs without V1 fallback
3. Check quality scores and quote verification
4. Compare results to previous GPT-4o-mini analysis

## Session Summary

1. ✅ Submitted GOODS seed interview with 12 comprehensive answers
2. ✅ Seed interview processed successfully (quality score: 100/100)
3. ✅ Project context saved with 3 outcomes, 4 success criteria, 2 cultural approaches
4. ✅ Discovered V1 fallback issue in analysis logs
5. ✅ Root cause identified: wrong table queried for context
6. ✅ Fixed context loading to use `project_contexts` table
7. ✅ Fixed Claude V2 context mapping with JSONB extraction
8. 🔄 Ready for retest

## Related Files

- [GOODS_SEED_INTERVIEW.json](GOODS_SEED_INTERVIEW.json) - Seed interview responses
- [scripts/submit-goods-seed-interview.ts](scripts/submit-goods-seed-interview.ts) - Submission script
- [scripts/clear-analysis-cache.ts](scripts/clear-analysis-cache.ts) - Cache clearing utility
- [QUICK_START_CLAUDE_V2.md](QUICK_START_CLAUDE_V2.md) - Testing guide
