# Critical Issues Analysis - January 12, 2026

## Problem 1: Wasted Money on Failed Batch Analysis

**What Happened:**
- Batch analysis ran for ~233 transcripts
- EVERY SINGLE SAVE FAILED with schema error
- Estimated waste: ~$6.99 USD worth of Claude API calls with ZERO results saved

**Root Cause:**
Script tried to save to column `analysis_result` which doesn't exist in the database table.

**Database Schema (ACTUAL):**
```sql
CREATE TABLE transcript_analysis_results (
  id UUID,
  transcript_id UUID,
  analyzer_version TEXT,
  themes JSONB,              ← These columns exist
  quotes JSONB,              ←
  impact_assessment JSONB,   ←
  cultural_flags JSONB,      ←
  quality_metrics JSONB,     ←
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ
)
```

**What Script Tried to Do:**
```typescript
.insert({
  analysis_result: analysis,  ← This column DOES NOT EXIST
  // ... other fields
})
```

**Fix Applied:**
```typescript
.insert({
  themes: analysis.themes || [],
  quotes: analysis.quotes || [],
  impact_assessment: analysis.impact_assessment || {},
  cultural_flags: analysis.cultural_flags || {},
  quality_metrics: { ... },
  // ... other fields
})
```

**Status:** ✅ Fixed in [scripts/batch-analyze-transcripts-direct.ts](scripts/batch-analyze-transcripts-direct.ts)

---

## Problem 2: Excessive Context Usage

**Symptoms:**
- Hitting `/compact` multiple times per session
- Pre-compact hook failing
- Each compact creates a 17K+ token summary
- Running out of context before completing basic tasks

**Root Causes:**

### 2a. Massive Compaction Summaries
Each `/compact` generates a 17,000+ token summary that gets injected into the next session, immediately consuming 8.5% of total context budget.

**Example from current session:**
- Summary includes full code listings
- Redundant explanations of same issues
- Massive "All User Messages" sections
- Complete file contents duplicated

### 2b. System Reminders Getting Duplicated
Multiple system reminders being injected:
```
<system-reminder>SessionStart:resume hook success: Success</system-reminder>
<system-reminder>SessionStart:resume hook success: Success</system-reminder>
<system-reminder>SessionStart:resume hook success: Success</system-reminder>
<system-reminder>SessionStart:resume hook success: Success</system-reminder>
<system-reminder>SessionStart:resume hook success: Success</system-reminder>
```

This wastes tokens on duplicate messages.

### 2c. Large CLAUDE.md Being Loaded Every Turn
[CLAUDE.md](CLAUDE.md) is ~4,000+ tokens and gets loaded into every context window.

### 2d. Failed Continuity Hook
```
Compacted PreCompact [node $HOME/.claude/hooks/dist/pre-compact-continuity.mjs] failed
```

The hook is supposed to extract minimal continuity state but is failing, forcing full summaries instead.

---

## Problem 3: Database Confusion (Still Happening)

**Evidence:**
- Created `ALMA_ANALYSIS_STRATEGY.md` to clarify database topology
- Still getting confused between local (port 54322) and remote (Supabase production)
- Scripts sometimes assume wrong database

**Why This Matters:**
Confusion leads to vague answers about "where is data saved" which frustrates user and wastes turns.

---

## Immediate Actions Required

### 1. DO NOT RUN BATCH ANALYSIS UNTIL:
- [ ] Verify the schema fix works with a single test transcript
- [ ] User confirms they want to spend ~$7 on the batch

### 2. Fix Context Bloat:
- [ ] Investigate why pre-compact hook is failing
- [ ] Reduce compaction summary size (currently 17K tokens)
- [ ] Remove duplicate system reminders
- [ ] Consider trimming CLAUDE.md or loading it conditionally

### 3. Fix Database Topology Clarity:
- [ ] Always state explicitly which database (local vs remote) when checking data
- [ ] Use consistent env var checks in all scripts
- [ ] Add database URL logging to all scripts

---

## Cost Analysis

**Money Already Wasted:**
- ~233 API calls to Claude Sonnet 4.5
- Each transcript ~2-3K input tokens + 1-2K output tokens
- Estimate: 233 × $0.03 = **~$6.99 USD WASTED**
- **ZERO transcripts successfully saved**

**Context Waste:**
- Current session: 70K/200K tokens used (35%)
- Multiple `/compact` cycles consuming 17K+ tokens each
- User has to `/compact` multiple times = slower progress

---

## Next Steps (DO NOT EXECUTE - WAIT FOR USER APPROVAL)

1. **Test the fix:**
   ```bash
   # Test with ONE transcript to verify schema fix works
   # Estimate cost: $0.03
   ```

2. **If test succeeds, ask user:**
   "The schema fix is working. Run full batch (233 transcripts, ~$7 USD)?"

3. **Fix context bloat** (parallel investigation):
   - Debug pre-compact hook
   - Optimize compaction summaries
   - Remove system reminder duplicates
