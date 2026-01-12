# ALMA Analysis System - Definitive Strategy

**Date:** January 12, 2026
**Status:** ✅ TABLES VERIFIED, READY TO EXECUTE

---

## Executive Summary

**Current State:**
- ✅ **251 transcripts** exist in production database
- ✅ **`transcript_analysis_results` table** exists and is ready
- ❌ **0 transcripts analyzed** - batch processing hasn't successfully saved any results
- ✅ **Phase 3 testing** showed 100% success on 10 sample transcripts (but only printed to console, didn't save)

**Root Cause of Confusion:**
- The batch scripts (`batch-analyze-transcripts.ts` and `batch-analyze-transcripts-direct.ts`) kept failing silently
- Process would die without error output, leading to 0 database saves
- I incorrectly suggested this might be a database issue - **it's not, the tables exist**

---

## 1. Where Analysis Results Are Saved

### Production Database (REMOTE Supabase)
```
URL: https://yvnuayzslukamizrlhwb.supabase.co
Database: postgres
Table: transcript_analysis_results
```

### Schema
```sql
CREATE TABLE transcript_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID REFERENCES transcripts(id),
  storyteller_id UUID REFERENCES storytellers(id),
  analysis_result JSONB,  -- ALMA v2.0 signals
  processing_time_ms INTEGER,
  analyzer_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Connection Details
All batch scripts use these environment variables from `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` → Remote Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` → Service role key for bypassing RLS

**NOT using local Supabase** (port 54322) - that's for development only.

---

## 2. How to Retrieve Results

### Method 1: Verification Script (Recommended)
```bash
npx tsx scripts/verify-alma-extraction.ts
```

**Output includes:**
- Total transcripts analyzed
- ALMA signal coverage statistics
- Cultural markers summary
- Impact dimensions analysis
- Quality issues detection
- Overall quality score (0-100)

### Method 2: Direct Database Query
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const { data, error } = await supabase
  .from('transcript_analysis_results')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10)
```

### Method 3: Quick Count Check
```bash
npx tsx scripts/check-db-status.ts
```

Shows:
- Total transcripts (251)
- Total analyzed (currently 0)
- Unanalyzed count (251)

---

## 3. Why We Have 0 Results

**It's NOT a database issue** - the tables exist and are correctly configured.

**Actual problem:** The batch processing scripts are failing silently.

### What We Know:
1. ✅ Phase 3 test script (`test-alma-extraction.ts`) successfully analyzed 10 transcripts
2. ✅ It printed beautiful results to console with 100% success
3. ❌ But it NEVER saved to database (was test-only)
4. ❌ Batch scripts (`batch-analyze-transcripts-direct.ts`) die without error messages
5. ❌ No results ever get saved to `transcript_analysis_results`

### Possible Causes:
1. **Anthropic API credits exhausted** - Phase 3 used ~10 API calls, batch would use 251
2. **Script dies before save** - Analysis completes but save fails silently
3. **No error logging** - Process exits without capturing error messages
4. **Rate limiting** - Too many requests too fast

---

## 4. Clear Execution Plan (FIXED)

### Step 1: Run Batch Analysis with Proper Error Capture

I'm going to modify the direct batch script to:
- ✅ Log all errors to file
- ✅ Save each result immediately (not in batches)
- ✅ Continue on individual failures
- ✅ Report progress in real-time

**Command:**
```bash
npx tsx scripts/batch-analyze-transcripts-direct.ts
```

**Expected behavior:**
- Analyzes 251 transcripts one by one
- Saves each to `transcript_analysis_results` immediately
- Estimated time: ~3.5 hours (50 seconds per transcript)
- Estimated cost: ~$7.53 USD (251 × $0.03)

### Step 2: Monitor Progress

**While running:**
```bash
# Watch live progress
npx tsx scripts/check-db-status.ts

# Check last 5 results
npx tsx scripts/verify-alma-extraction.ts
```

**Expected output progression:**
```
Analyzed: 0/251 → 10/251 → 50/251 → 100/251 → 251/251
```

### Step 3: Verify Quality

**After completion:**
```bash
npx tsx scripts/verify-alma-extraction.ts
```

**Success criteria:**
- 95%+ analyzed (238+ of 251)
- 95%+ ALMA signal coverage
- Quality score 85+
- Zero high-severity issues

### Step 4: Backfill Storyteller Analysis

**After batch completes:**
```bash
npx tsx scripts/backfill-storyteller-analysis.ts
```

Aggregates transcript results → `storyteller_master_analysis` table.

### Step 5: Run ACT Rollup Pipeline

**Final step:**
```bash
npm run act:rollup:all
```

Creates Beautiful Obsolescence metrics and grant reporting data.

---

## 5. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ PRODUCTION DATABASE (Remote Supabase)                           │
│ https://yvnuayzslukamizrlhwb.supabase.co                       │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ (saves to)
                              │
┌─────────────────────────────────────────────────────────────────┐
│ BATCH ANALYSIS SCRIPT                                           │
│ scripts/batch-analyze-transcripts-direct.ts                     │
│                                                                  │
│ For each transcript (251 total):                               │
│   1. Fetch from transcripts table                              │
│   2. Call Claude Sonnet 4.5 API                                │
│   3. Extract ALMA v2.0 signals                                 │
│   4. Save to transcript_analysis_results                       │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                              │ (calls)
                              │
┌─────────────────────────────────────────────────────────────────┐
│ CLAUDE ANALYZER                                                  │
│ src/lib/ai/transcript-analyzer-v3-claude.ts                     │
│                                                                  │
│ Input:  Transcript text + metadata                             │
│ Output: ALMA v2.0 signals (JSONB)                              │
│   - Authority signals (8 dimensions)                           │
│   - Evidence strength (methodological rigor)                   │
│   - Harm risk (inverted: high = safe)                          │
│   - Capability (self-sufficiency)                              │
│   - Option value (flexibility)                                 │
│   - Community value return (handover readiness)                │
└─────────────────────────────────────────────────────────────────┘
```

### Key Points:
1. **Single database** - Production Supabase only (no local database confusion)
2. **Direct saves** - Each transcript result saved immediately after analysis
3. **No Inngest** - Direct Claude API calls (Inngest had auth issues)
4. **Error isolation** - One transcript failure doesn't block others

---

## 6. Retrieval Patterns

### Pattern 1: Get All Analysis Results
```typescript
const { data } = await supabase
  .from('transcript_analysis_results')
  .select('*')
```

### Pattern 2: Get Results for Specific Storyteller
```typescript
const { data } = await supabase
  .from('transcript_analysis_results')
  .select('*')
  .eq('storyteller_id', storytellerId)
```

### Pattern 3: Get ALMA Signals for Transcript
```typescript
const { data } = await supabase
  .from('transcript_analysis_results')
  .select('analysis_result')
  .eq('transcript_id', transcriptId)
  .single()

// Access ALMA signals
const almaSignals = data.analysis_result.alma_signals
```

### Pattern 4: Quality Metrics
```typescript
// Via verification script
npx tsx scripts/verify-alma-extraction.ts

// Or programmatically
const { count: total } = await supabase
  .from('transcript_analysis_results')
  .select('*', { count: 'exact', head: true })

const { count: withAlma } = await supabase
  .from('transcript_analysis_results')
  .select('*', { count: 'exact', head: true })
  .not('analysis_result->alma_signals', 'is', null)

const coverage = (withAlma / total) * 100
```

---

## 7. What Happens Next

**Immediate:**
1. I will run `batch-analyze-transcripts-direct.ts` with improved error handling
2. You'll see progress updates as transcripts get analyzed
3. Results save to `transcript_analysis_results` table in real-time

**After batch completes (~3.5 hours):**
1. Run verification to check quality
2. Run storyteller backfill to aggregate results
3. Run ACT rollup pipeline for Beautiful Obsolescence metrics

**Data becomes available for:**
- Grant reporting (TACSI, AIATSIS, Industry Growth, SEDI)
- Beautiful Obsolescence dashboards
- Knowledge base semantic search
- Storyteller profile analytics

---

## 8. Monitoring Commands

```bash
# Quick status check
npx tsx scripts/check-db-status.ts

# Full quality report
npx tsx scripts/verify-alma-extraction.ts

# Check if batch process is running
ps aux | grep batch-analyze

# Watch logs (if redirected to file)
tail -f batch-analysis.log
```

---

## Summary

**Where results are saved:**
- Remote Supabase production database
- Table: `transcript_analysis_results`
- Connection: Via `NEXT_PUBLIC_SUPABASE_URL` + service role key

**How to retrieve:**
- Run `npx tsx scripts/verify-alma-extraction.ts`
- Or query `transcript_analysis_results` table directly

**Why 0 results currently:**
- Batch processing scripts failed silently
- No errors were logged
- Tables exist and are ready - this is NOT a database issue

**Next action:**
- Run the improved batch script
- Monitor progress with check-db-status.ts
- Verify quality with verify-alma-extraction.ts

**NO MORE CONFUSION.**

All scripts use the SAME database. All results save to the SAME table. All retrieval uses the SAME connection.

---

**Ready to execute batch analysis?**
