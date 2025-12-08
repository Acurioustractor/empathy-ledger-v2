# Goods Project - AI Analysis Status

**Date:** October 10, 2025
**Project ID:** `6bd47c8a-e676-456f-aa25-ddcbb5a31047`
**Project Name:** Goods.
**Organization:** Snow Foundation

## Current Status

### Storytellers & Transcripts
- **Total Storytellers:** 23
- **Total Transcripts:** 23 (one per storyteller)
- **AI Analysis Status:** 0% → Running (in progress)

### What's Running Now
✅ **Background AI Analysis** is currently processing all 23 transcripts
- **Estimated Time:** ~12 minutes
- **Process:** Direct OpenAI GPT-4o-mini analysis
- **Output:** Summary, themes, and key quotes for each transcript

## Analysis Components Added

### 1. AI Analysis Button
- Added to all project pages
- Location: Project header, next to "Manage Project"
- Route: `/projects/[id]/analysis`

### 2. Project Analysis API
- **Endpoint:** `/api/projects/[id]/analysis`
- **Features:**
  - Analyzes all storytellers and transcripts in a project
  - Extracts themes and impact insights
  - Uses OpenAI GPT-4 for strategic recommendations
  - Indigenous impact analysis framework
  - Human story elements extraction

### 3. Analysis Page
- **Route:** `/app/projects/[id]/analysis/page.tsx`
- **Component:** `ProjectAnalysisView`
- **Features:**
  - Project overview with storyteller/transcript counts
  - Theme visualization
  - Impact Framework scores (6 dimensions)
  - Powerful quotes section
  - AI-generated recommendations
  - Human story elements

## Transcript Analysis Details

### What Gets Analyzed
For each transcript:
1. **Summary:** 2-3 sentence overview
2. **Themes:** Up to 5 key themes
3. **Key Quotes:** Up to 5 impactful quotes with significance

### Analysis Fields Populated
```sql
- ai_summary (text)
- themes (text[])
- key_quotes (jsonb[])
- ai_processing_status ('completed')
```

## Profile Completeness Status

### ✅ Complete Profiles (with bio ~650-800 chars)
All 23 storytellers have bios generated

### ❌ Missing Data
Most storytellers are missing:
- **Cultural Background:** 21/23 missing (only Brian Russell and Dianne Stokes have this)
- **Expertise Areas:** 23/23 missing
- **Community Roles:** 23/23 missing

## Next Steps

### 1. Wait for Analysis to Complete (~12 min)
Check progress:
```bash
node scripts/review-goods-analysis-status.js
```

### 2. Extract Profile Enhancement Data
Once transcripts are analyzed, extract from them:
- Cultural background mentions
- Expertise/skills mentioned
- Community roles described

### 3. Run Project-Level Analysis
After individual transcripts are complete:
```bash
# Visit the analysis page
http://localhost:3030/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/analysis
```

This will generate:
- Cross-storyteller theme analysis
- Impact framework aggregate scores
- Strategic recommendations for project continuation
- System change opportunities
- Community engagement strategies

## Scripts Created

### Review Status
```bash
node scripts/review-goods-analysis-status.js
```
Shows completion status for all transcripts and profiles

### Direct Analysis
```bash
OPENAI_API_KEY="..." npx tsx scripts/direct-analyze-goods.ts
```
Directly analyzes all transcripts without Inngest queue

### Link Transcripts
```bash
node scripts/link-all-goods-transcripts.js
```
Links all storyteller transcripts to the project (already complete)

## Architecture Notes

### Automatic Transcript Linking
When a storyteller is assigned to a project, ALL their transcripts automatically get linked to that project via:
- **API:** `/api/admin/projects/[id]/storytellers/route.ts:197-223`
- **Behavior:** Updates `project_id` for all storyteller's transcripts
- **Scope:** Works for both new and existing transcripts

### AI Analysis Flow
1. **Individual Level:** Each transcript analyzed separately
2. **Profile Level:** Extract structured data from transcripts
3. **Project Level:** Aggregate analysis across all storytellers
4. **Organization Level:** Cross-project insights (future)

## Files Modified/Created

### Modified
- `/src/components/projects/ProjectDetails.tsx` - Added AI Analysis button
- `/src/app/api/admin/projects/[id]/storytellers/route.ts` - Auto-link transcripts

### Created
- `/src/app/projects/[id]/analysis/page.tsx` - Analysis page
- `/scripts/review-goods-analysis-status.js` - Status checker
- `/scripts/direct-analyze-goods.ts` - Direct AI analyzer
- `/scripts/link-all-goods-transcripts.js` - Transcript linker
- `/scripts/link-all-project-transcripts.js` - All projects linker

## Estimated Completion

- **Individual Analysis:** ~12 minutes (running now)
- **Profile Enhancement:** ~5 minutes (after analysis)
- **Project-Level Analysis:** Instant (generated on-demand)
- **Total:** ~20 minutes

## Success Criteria

✅ All 23 transcripts have:
- `ai_summary` populated
- `themes` array with 3-5 themes
- `key_quotes` array with 3-5 quotes
- `ai_processing_status` = 'completed'

✅ Project analysis page shows:
- Theme visualization
- Impact scores
- Strategic recommendations
- Powerful quotes

✅ Storyteller profiles enhanced with:
- Cultural background (extracted from transcripts)
- Expertise areas
- Community roles
