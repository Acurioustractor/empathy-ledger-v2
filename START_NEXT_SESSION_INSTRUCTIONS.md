# Instructions for Next Session - ALMA Transcript Analysis

**Date Created:** January 12, 2026
**Context:** Batch analysis schema fixed but NOT TESTED. Must verify before running full batch.

---

## CRITICAL: Start With This Message

```
Resume batch transcript analysis work. Read the handoff at thoughts/shared/handoffs/20260112.md first.

CRITICAL CONTEXT:
- Batch analysis schema fix applied but NOT TESTED
- Already wasted $7 on 233 failed analyses (wrong column name)
- Must test with ONE transcript before running full batch
- DO NOT run batch analysis without my approval

Next steps:
1. Test schema fix with single transcript
2. Show me the result
3. Get my approval before batch run (~$7 cost, 3 hours)
```

---

## What Happened in Previous Session

### ✅ Schema Fix Applied
**Problem:** Script tried to save to `analysis_result` column which doesn't exist

**Fix:** Changed to use correct columns:
```typescript
// scripts/batch-analyze-transcripts-direct.ts lines 88-105
.insert({
  transcript_id: transcript.id,
  analyzer_version: 'v3-claude-sonnet-4.5',
  themes: analysis.themes || [],
  quotes: analysis.quotes || [],
  impact_assessment: analysis.impact_assessment || {},
  cultural_flags: analysis.cultural_flags || {},
  quality_metrics: { ... },
  processing_time_ms: processingTime
})
```

**File:** `scripts/batch-analyze-transcripts-direct.ts`

### ❌ NOT TESTED YET
- Schema fix is theoretical
- Might have other issues
- **MUST test with 1 transcript first**

### 💰 Money Already Wasted
- 233 API calls to Claude Sonnet 4.5
- Every single save FAILED
- Estimated waste: ~$7 USD
- **Zero results in database**

---

## Step-by-Step Test Plan

### Step 1: Verify Database Schema
```bash
npx tsx scripts/check-db-status.ts
```

**Expected output:**
```
TRANSCRIPTS TABLE: ✅ Count: 251
TRANSCRIPT_ANALYSIS_RESULTS TABLE: ✅ Count: 0
Unanalyzed: 251
```

### Step 2: Test With ONE Transcript
Create test script:

```bash
cat > scripts/test-single-transcript.ts <<'EOF'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { claudeTranscriptAnalyzer } from '../src/lib/ai/transcript-analyzer-v3-claude'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testSingle() {
  console.log('Fetching ONE transcript for testing...')

  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, transcript_content, storyteller_id, storytellers(display_name, cultural_background)')
    .not('transcript_content', 'is', null)
    .limit(1)

  if (!transcripts || transcripts.length === 0) {
    throw new Error('No transcripts found')
  }

  const transcript = transcripts[0]
  console.log('Testing with:', transcript.title || 'Untitled')

  const startTime = Date.now()
  const analysis = await claudeTranscriptAnalyzer.analyzeTranscript(
    transcript.transcript_content,
    {
      title: transcript.title,
      storyteller_name: transcript.storytellers.display_name,
      cultural_context: transcript.storytellers.cultural_background
    }
  )
  const processingTime = Date.now() - startTime

  console.log('\n✅ Analysis complete')
  console.log('Processing time:', processingTime, 'ms')
  console.log('Themes found:', analysis.themes?.length || 0)
  console.log('Quotes found:', analysis.quotes?.length || 0)

  console.log('\nAttempting to save to database...')
  const { error: saveError } = await supabase
    .from('transcript_analysis_results')
    .insert({
      transcript_id: transcript.id,
      analyzer_version: 'v3-claude-sonnet-4.5',
      themes: analysis.themes || [],
      quotes: analysis.quotes || [],
      impact_assessment: analysis.impact_assessment || {},
      cultural_flags: analysis.cultural_flags || {},
      quality_metrics: {
        accuracy: analysis.accuracy,
        confidence: analysis.confidence,
        processing_time_ms: processingTime
      },
      processing_time_ms: processingTime
    })

  if (saveError) {
    console.error('\n❌ SAVE FAILED:', saveError.message)
    process.exit(1)
  }

  console.log('\n✅ SAVE SUCCESSFUL!')
  console.log('\nVerifying in database...')

  const { count } = await supabase
    .from('transcript_analysis_results')
    .select('*', { count: 'exact', head: true })

  console.log('Database count:', count)
  console.log('\n✅ TEST COMPLETE - Schema fix works!')
}

testSingle()
EOF
```

**Run test:**
```bash
npx tsx scripts/test-single-transcript.ts
```

**Expected output:**
```
✅ Analysis complete
Processing time: 45000 ms
Themes found: 8
Quotes found: 12
✅ SAVE SUCCESSFUL!
Database count: 1
✅ TEST COMPLETE - Schema fix works!
```

**If you see errors:** STOP and debug before batch run

### Step 3: Get User Approval
**Show me:**
1. The test output
2. Estimated cost: ~$7 USD
3. Estimated time: ~3.2 hours
4. Transcripts to process: 251

**Wait for:** Explicit "yes, run the batch"

### Step 4: Run Full Batch (ONLY AFTER APPROVAL)
```bash
npx tsx scripts/batch-analyze-transcripts-direct.ts 2>&1 | tee batch-analysis-$(date +%Y%m%d-%H%M%S).log
```

**Monitor with:**
```bash
# In another terminal
watch -n 30 'npx tsx scripts/check-db-status.ts'
```

---

## Troubleshooting

### If Test Fails with Schema Error
**Error:** `Could not find the 'themes' column...`

**Fix:** Check actual table schema:
```bash
npx supabase db diff --schema public
```

Compare with what script expects.

### If Test Fails with API Error
**Error:** `429 Too Many Requests` or `401 Unauthorized`

**Fix:** Check API credits and rate limits

### If Save Succeeds but Data Looks Wrong
**Check:**
```bash
npx tsx scripts/verify-alma-extraction.ts
```

Inspect what was actually saved.

---

## Success Criteria

**Before batch run:**
- ✅ Single transcript test completes
- ✅ Save succeeds without errors
- ✅ Database count increments to 1
- ✅ Data structure matches expectations
- ✅ User gives explicit approval

**Do NOT run batch if any criterion fails**

---

## Estimated Costs

- **Single test:** ~$0.03 USD
- **Full batch (251 transcripts):** ~$7 USD
- **Time:** 3-3.5 hours

**Already wasted:** ~$7 USD on failed analyses

**Total investment if batch runs:** ~$14 USD

---

## After Batch Completes

### Verify Results
```bash
npx tsx scripts/verify-alma-extraction.ts
```

### Check Quality
- How many transcripts analyzed?
- Are themes meaningful?
- Are quotes verified?
- Do cultural flags make sense?

### Next Steps
```bash
# Run storyteller rollup
npx tsx scripts/backfill-storyteller-analysis.ts

# Run ACT rollups
npm run act:rollup:all
```

---

## IMPORTANT REMINDERS

1. **Test first, batch second** - Don't waste another $7
2. **Get user approval** - They pay for API calls
3. **Monitor the process** - Don't let it fail silently
4. **Verify results** - Check quality before next steps

**DO NOT start batch analysis without explicit user approval.**
