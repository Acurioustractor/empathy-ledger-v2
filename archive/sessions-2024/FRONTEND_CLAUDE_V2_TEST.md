# 🎨 Test Claude V2 from the Frontend

The project AI Analysis button now uses Claude V2 by default!

---

## Quick Test (3 clicks!)

### 1. Open the GOODS Project Page
```
http://localhost:3030/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047
```

### 2. Click "AI Analysis" Button
You'll see it in the project details page

### 3. Wait for Results
The analysis page will show:
```
Analyzing project with Claude AI...
Using high-quality quote extraction with verification
This may take a few moments to ensure accuracy
```

---

## What Changed

**Before (GPT-4o-mini):**
```typescript
// Line 106 (old)
const response = await fetch(`/api/projects/${projectId}/analysis?intelligent=true`)
```

**After (Claude V2):**
```typescript
// Line 106 (new)
const response = await fetch(`/api/projects/${projectId}/analysis?intelligent=true&model=claude`)
```

**File:** [src/components/projects/ProjectAnalysisView.tsx:106](src/components/projects/ProjectAnalysisView.tsx#L106)

---

## Watch Server Logs

While the frontend is loading, watch your terminal where `npm run dev` is running.

You'll see Claude V2 in action:

```bash
🧠 Using Intelligent AI for analysis (Model: claude)...
📋 Using quick project context for analysis
✅ Project context loaded - will extract project-aligned quotes
📝 Analyzing 23 transcripts with claude...

🔄 Processing in batches of 2 for Claude (with 2000ms delays)...
📋 Using project context for Claude V2 quality filtering

Batch 1/12: Processing 2 transcripts...

🔬 Using Claude V2 with project-aligned quality filtering

⚠️  Rejected 3 low-quality quotes:
   - "Because your back pain and all this..." (Quality too low: 35/100)
   - "I think it's a great bed. Nice bed..." (Quality too low: 45/100)
   - "The showers are clean..." (Quote not found in transcript)

✅ Extracted 5 high-quality quotes
📊 Quality: 82/100

⏱️  Waiting 2000ms before next batch...
```

---

## What You'll See in the UI

### Overview Tab
- **Project Outcomes** - Shows evidence found for each outcome
- **Powerful Quotes** - High-quality, verified quotes only
- **Impact Framework** - Cultural continuity, community empowerment, etc.

### Storytellers Tab
- Individual storyteller profiles
- Their quotes (all verified, high quality)
- Themes and insights

### Insights Tab
- Transformation moments
- Wisdom shared
- Challenges overcome
- Community impact

### Recommendations Tab
- Continuation strategies
- Key connections
- System change opportunities
- Community engagement

---

## Expected Improvements

**Old Results (GPT-4o-mini):**
- ❌ Fabricated quotes like "I've been sleeping much better..."
- ❌ Incoherent quotes with 95% confidence
- ❌ Superficial quotes ("it's nice")
- ❌ Average quality ~40/100

**New Results (Claude V2):**
- ✅ All quotes verified to exist in transcripts
- ✅ Coherent, complete thoughts only
- ✅ Deep, meaningful quotes only
- ✅ Average quality ~82/100

---

## Alternative: Direct URL

Skip the button and go directly to the analysis page:

```
http://localhost:3030/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/analysis
```

This will automatically trigger Claude V2 analysis.

---

## Comparison Test

Want to compare Claude V2 vs GPT-4o-mini?

### 1. Test with Claude V2 (default):
- Click "AI Analysis" button
- Review results

### 2. Test with GPT-4o-mini:
Open browser console and run:
```javascript
fetch('/api/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/analysis?intelligent=true&model=gpt-4o-mini&regenerate=true')
  .then(r => r.json())
  .then(data => console.log('GPT Results:', data))
```

### 3. Compare:
- Quote quality
- Fabrication (look for quotes that don't exist)
- Coherence
- Project alignment

---

## Troubleshooting

### "Analysis Error" message:
- Check that dev server is running
- Check server logs for errors
- Try refreshing the page

### Takes too long:
- Claude V2 is slower than GPT-4o-mini (but much better quality)
- Processing in batches with 2-second delays
- For 23 transcripts, expect ~2-3 minutes

### Want faster results:
- Claude uses cached results after first run
- Subsequent loads will be instant (unless you clear cache)

---

## Behind the Scenes

When you click "AI Analysis":

```
Frontend Button Click
    ↓
ProjectAnalysisView.tsx loads
    ↓
Calls API: /api/projects/{id}/analysis?intelligent=true&model=claude
    ↓
analysis/route.ts processes request
    ↓
Loads project context (GOODS purpose, outcomes)
    ↓
For each transcript (batched):
    ↓
extractQuotesWithClaude(text, speaker, 5, projectContext)
    ↓
Claude V2: extractClaudeQuotesV2()
    ↓
Quality filtering + verification
    ↓
Return high-quality quotes only
    ↓
Frontend displays results
```

---

## Success Criteria

Your frontend test is successful if:

1. ✅ **Analysis loads without errors**
2. ✅ **Quotes are high quality** (no incoherent rambling)
3. ✅ **No fabricated quotes** (all exist in transcripts)
4. ✅ **Project-aligned content** (GOODS topics: beds, sleep, hygiene)
5. ✅ **Server logs show Claude V2 indicators** (quality filtering, rejections)

---

## Next Steps

After testing from the frontend:

1. Review the quotes in the UI
2. Check if any look fabricated or low quality
3. Compare to the old GPT-4o-mini results
4. Test with other projects
5. Share feedback on quality improvements

---

**Ready to test! Just click the "AI Analysis" button on any project page.** 🚀
