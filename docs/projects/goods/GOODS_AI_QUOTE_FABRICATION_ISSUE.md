# CRITICAL ISSUE: AI Quote Fabrication in GOODS Project Analysis

**Date Discovered:** October 27, 2025
**Severity:** HIGH - Misrepresents community voices
**Impact:** Project outcomes showing fabricated evidence

---

## The Problem

The AI analysis system is **generating fake quotes** that don't exist in the actual transcripts. When project outcomes are shown, the quotes attributed to storytellers are **entirely fabricated** by the AI.

### Example of Fabricated Quotes

**AI Generated (FAKE):**
```
"I've been sleeping much better since the new beds arrived." - Jimmy Frank
"The showers are now clean and functional, people are using them regularly." - Melissa Jackson
"We've seen a significant reduction in waste due to people repairing and maintaining their products." - Carmelita & Colette
```

**Reality:**
- Jimmy Frank's transcript is about cultural connection to country, traditional ownership, working with elders on artifacts, and community leadership
- Melissa Jackson's transcript is about family connections to Borroloola and Tennant Creek
- These quotes about "beds", "showers", and "hygiene" **DO NOT EXIST** in the transcripts

---

## What's Actually in the Transcripts

### Jimmy Frank (Real Content)
```
"Um, one of the traditional owners, or you know, this is got connection to this Pen Creek through my father's mother, so it was my grandmother's and my grandfather..."

"I started doing artifacts with, with my elders back in when I was 19... doing boomerang spears whole range of things..."

"You know, I really, really love that, looking after country and, and then considering, you know, I think there's cheaper way to live..."
```

**Themes:** Cultural heritage, intergenerational learning, environmental care, traditional ownership

### Melissa Jackson (Real Content)
```
"My uncle, his grandfather lived in Barola..."

"They got youth center, families look after them..."
```

**Themes:** Family connections, community care

### Brian Russell (Real Content)
```
"I got a job up here as a LO as a, for working for the Northern Territory government, nearly seven and a half years..."

"You don't have to just ring, just going and just talk to some of the elders, oh, the elders would probably take you around. Welcome with the country, yeah."
```

**Themes:** Community service, cultural protocols, connection to country

---

## Root Cause Analysis

### Where the Fabrication Happens

The AI analysis system (likely in `/src/app/api/projects/[id]/analysis/route.ts` or related analysis endpoints) is:

1. **Reading the project purpose:** "Creating better white goods and beds for the community"
2. **Looking for evidence of beds/white goods outcomes in transcripts**
3. **Finding NONE** (because these transcripts are about cultural heritage, not beds)
4. **FABRICATING quotes** that "sound like" what it expects to find

### Why This is Dangerous

1. **Misrepresents Community Voices** - Puts words in people's mouths they never said
2. **False Evidence** - Makes it appear outcomes were achieved when they weren't
3. **Ethical Violation** - Indigenous voices being fabricated by AI is deeply problematic
4. **Destroys Trust** - If funders/partners discover fabrication, platform credibility is destroyed
5. **Legal Risk** - Could be considered fraud if used in grant reports

---

## The Mismatch

### Project Purpose Says:
"Creating better white goods and beds for the community"

### Actual Transcripts Are About:
- Cultural connection to country
- Traditional knowledge transfer
- Community relationships
- Environmental stewardship
- Language and heritage preservation
- Working with elders
- Living on homelands

### Conclusion:
Either:
1. **Wrong transcripts linked to GOODS project** (these are from other projects)
2. **Wrong project purpose** (GOODS is not actually about beds/goods)
3. **Both** - Complete mismatch between stated purpose and collected stories

---

## Immediate Actions Required

### 1. Stop Using Fabricated Quotes ⚠️

**DO NOT SHOW** the current "Project Outcomes" analysis to anyone. The quotes are fake.

### 2. Investigate Project Setup

Check if GOODS transcripts are correctly linked:

```bash
# Check what transcripts are actually linked to GOODS
curl 'http://localhost:3030/api/admin/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/transcripts'

# Check actual transcript content
# Review storyteller names - do they match GOODS project participants?
```

### 3. Fix the AI Analysis System

The analysis code needs to:

**Current Bad Behavior:**
```typescript
// If no evidence found for expected outcome...
// AI MAKES UP A QUOTE that sounds plausible
quote: "I've been sleeping much better since the new beds arrived."
```

**Required Behavior:**
```typescript
// If no evidence found for expected outcome...
return {
  evidenceStrength: "NOT_FOUND",
  quotes: [], // EMPTY - don't fabricate
  note: "This outcome was not mentioned in any transcripts"
}
```

### 4. Clarify GOODS Project Scope

Meet with Nick and team to understand:
- What IS the GOODS project actually about?
- Are these the right storytellers?
- Are these the right transcripts?
- Does the project purpose accurately reflect the work?

---

## Technical Fix Needed

### File to Review/Fix:
Likely in one of these locations:
- `/src/app/api/projects/[id]/analysis/route.ts`
- `/src/lib/ai/analysis-engine.ts`
- `/src/lib/ai/quote-extraction.ts`
- Any file handling "project outcomes" or "evidence extraction"

### Required Changes:

**Add Quote Verification:**
```typescript
function extractQuoteEvidence(transcript: string, outcome: string) {
  const quotes = extractPotentialQuotes(transcript, outcome)

  // CRITICAL: Verify quotes actually exist in source text
  const verifiedQuotes = quotes.filter(quote =>
    transcript.includes(quote.text) // Must be exact match
  )

  if (verifiedQuotes.length === 0) {
    return {
      evidenceStrength: "NOT_FOUND",
      quotes: [],
      message: "No evidence of this outcome found in transcripts"
    }
  }

  return {
    evidenceStrength: calculateStrength(verifiedQuotes),
    quotes: verifiedQuotes,
    storytellers: extractStorytellers(verifiedQuotes)
  }
}
```

**Never Allow AI to Generate Quotes:**
- AI can FIND quotes in existing text
- AI can NEVER create quotes that don't exist
- When no evidence exists, return empty, not fabricated

---

## What This Means for GOODS Project

### The Good News:
The **Strategic Path Forward** document I created is actually **accurate** because it's based on:
- Real storyteller BIOS (which are legitimate)
- Project purpose statement (community-led, white goods/beds)
- Cultural approaches described in project context
- General principles from the platform

It does NOT claim direct quotes from transcripts.

### The Bad News:
The **Project Outcomes Tracker** shown in the UI is **completely fabricated** and should not be used or trusted.

### The Path Forward:

**Option 1:** GOODS is actually about cultural heritage, not beds
- Update project purpose to match actual transcript content
- Re-run seed interview to capture REAL outcomes
- Analyze for cultural continuity, land connection, knowledge transfer

**Option 2:** GOODS is about beds, but wrong transcripts linked
- Find the actual GOODS transcripts (interviews about beds/white goods)
- Unlink these cultural heritage transcripts
- Link correct transcripts and re-analyze

**Option 3:** GOODS hasn't started yet
- These are preparatory interviews about community context
- Actual GOODS project (beds/appliances) will be documented later
- Don't analyze for beds outcomes until beds work is documented

---

## Ethical Considerations

### Why This Matters Deeply

1. **Indigenous Data Sovereignty**
   - Indigenous people have right to control their stories
   - AI fabricating their words violates this sovereignty
   - Could damage relationships with communities

2. **Cultural Safety**
   - Platform promises to handle stories with cultural respect
   - Fabrication is the opposite of respect
   - Could lead to platform being rejected by communities

3. **Research Integrity**
   - If this is used for research, fabricated quotes = research misconduct
   - Could invalidate any publications or reports
   - Could result in retractions, reputational damage

4. **Funder Accountability**
   - If fabricated quotes used in grant reports = fraud
   - Could result in funding loss, legal action
   - Would damage Snow Foundation reputation

---

## Recommendations

### Immediate (Today):
1. ✅ Document this issue (this file)
2. ⚠️ Alert user to the fabrication problem
3. 🔴 Hide/disable "Project Outcomes" display until fixed
4. 📋 Investigate which transcripts should actually be in GOODS

### Short-Term (This Week):
1. Fix AI analysis to NEVER fabricate quotes
2. Add quote verification (must exist in source text)
3. Clarify GOODS project scope with team
4. Link correct transcripts to project
5. Re-run analysis with safeguards in place

### Long-Term (This Month):
1. Add automated quote verification across all projects
2. Create quote provenance tracking (link quote → exact transcript location)
3. Build quality assurance process for AI-generated analysis
4. Implement human review before analysis is published
5. Create clear guidelines: "AI finds, doesn't invent"

---

## Testing the Fix

Once AI analysis is fixed, verify with:

```bash
# 1. Run analysis on GOODS project
curl 'http://localhost:3030/api/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/analysis'

# 2. For each quote returned, verify it exists:
grep "exact quote text" transcript-file.txt

# 3. Should return EXACT match or empty (not fabricated paraphrase)
```

---

## Lessons Learned

### What Went Wrong:
- AI given too much freedom to "generate" rather than "extract"
- No verification that quotes actually exist in source
- Project purpose mismatched with transcript content
- No human review before publishing AI analysis

### How to Prevent:
- AI role: Find and extract ONLY
- Verification: Every quote must have source line number
- Quality Control: Human review before publishing
- Clear Documentation: Project purpose must match transcript content
- Transparency: Show when NO evidence found (don't hide with fabrication)

---

## Status

**Current State:** ⛔ CRITICAL ISSUE - Do not use GOODS outcomes data
**Next Step:** Investigate transcript linkage and fix AI fabrication
**Timeline:** Must be fixed before showing outcomes to any stakeholders

---

**This is a critical platform integrity issue.**
**The fix must prioritize accuracy over completeness.**
**Better to say "no evidence found" than to fabricate community voices.**

---

*Document Created: October 27, 2025*
*Priority: CRITICAL*
*Action Required: Immediate*
