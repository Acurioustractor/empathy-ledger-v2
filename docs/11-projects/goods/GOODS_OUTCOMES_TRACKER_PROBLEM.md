# GOODS Outcomes Tracker Problem

## Current Status

**✅ Quote Extraction WORKS**: Analysis has **7 GOODS quotes out of 20 total (35%)**

Sample GOODS quotes:
1. "Anything from a Holden car to a fridge or a washing machine or tv..."
2. "I reckon washing machine something easy, simple that they can use without power..."
3. "I was laying down on the floor, me and my partner, so we got a bed to lay on the..."

**❌ Outcomes Tracker BROKEN**: Shows **0/100 for ALL outcomes** despite having 7 GOODS quotes

## The Problem

Frontend shows:
```
Project Outcomes Tracker
Sleep Quality: 0 out of 100 - Not Found
Health: 0 out of 100 - Not Found
Economic Empowerment: 0 out of 100 - Not Found
```

**Root Cause**: The outcomes tracking system ISN'T matching extracted quotes to project outcomes.

## Why This Happens

The outcomes tracker is a SEPARATE SYSTEM from quote extraction:

1. **Quote extraction** → Extracts quotes from transcripts ✅ WORKING (7 GOODS quotes)
2. **Outcomes matching** → Matches quotes to outcomes ❌ BROKEN (showing 0/100)

The problem: Outcomes matching logic isn't finding the connection between:
- Extracted quote: "washing machine something easy..."
- Outcome: "Health: Increased physical activity, reduced stress"

## What Needs To Be Fixed

**The outcomes matching is too narrow or broken**. Even though we have quotes about:
- Beds → should match "Sleep Quality"
- Washing machines → should match "Health" (hygiene)
- Household goods → should match "Economic Empowerment"

The tracker shows 0/100 for all.

## Where The Problem Is

Need to find and fix the outcomes tracking code. It's likely in:
- `src/lib/ai/project-outcomes-tracker.ts` (if it exists)
- OR calculated in the analysis route
- OR calculated in the frontend component

## Recommended Fix

1. **Find** where outcomes are matched to quotes
2. **Fix** the matching logic to:
   - Match "bed" quotes → Sleep Quality outcome
   - Match "washing/hygiene" quotes → Health outcome
   - Match "manufacturing/repair" quotes → Economic Empowerment outcome
3. **Use** the success criteria from project_contexts:
   - "Better sleep and less floor sleeping after bed delivery"
   - "Improved hygiene and dignity from reliable washing machines"
   - etc.

## Test Case

After fixing, this quote:
> "I reckon washing machine something easy, simple that they can use without power"

Should match to:
- ✅ Health outcome (hygiene-related)
- ✅ Show > 0/100 evidence

Currently shows:
- ❌ 0/100 for all outcomes

## Next Steps

1. Find the outcomes tracking code
2. Debug why it shows 0/100 when we have 7 GOODS quotes
3. Fix matching logic to use project success criteria
4. Verify outcomes tracker shows evidence > 0/100
