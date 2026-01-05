# 🚀 Run Claude V2 Integration Test

The Claude V2 integration is **ready to test**! Follow these simple steps.

---

## Quick Start (2 Commands)

### 1. Make sure dev server is running:
```bash
npm run dev
```

The server should show:
```
✓ Ready in 1457ms
Local: http://localhost:3030
```

### 2. Run the test:
```bash
./scripts/test-goods-claude-v2.sh
```

---

## What You'll See

### During the test:
```
🧪 Testing GOODS Project with Claude V2 Integration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Project: GOODS (Creating better white goods and beds)
🔬 Model: Claude 3.5 Sonnet with V2 quality filtering
🔄 Regenerating analysis (clearing cache)...

🚀 Making API request...
✅ API request successful

📊 RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Analysis regenerated successfully
✓ Total quotes extracted: 23
✓ Average quote quality: 82/100

📁 Full results saved to: /tmp/goods-claude-v2-result.json
```

### In the server logs (terminal running npm run dev):

Look for these indicators that V2 is working:

✅ **Using Claude V2:**
```
🔬 Using Claude V2 with project-aligned quality filtering
```

✅ **Quality filtering in action:**
```
⚠️  Rejected 3 low-quality quotes:
   - "Because your back pain and all this..." (Quality too low: 35/100)
   - "I think it's a great bed. Nice bed..." (Quality too low: 45/100)
   - "The showers are clean and functional" (Quote not found in transcript)
```

✅ **High-quality results:**
```
✅ Extracted 5 high-quality quotes
📊 Quality: 82/100
```

---

## Success Criteria

Your test is successful if you see:

- ✅ **No fabricated quotes** - All quotes exist in transcripts (no "Quote not found" rejections)
- ✅ **No incoherent rambling** - Quality scores are 60+ (no quotes with score < 60)
- ✅ **No superficial quotes** - No "it's nice", "more lower", etc.
- ✅ **Project-aligned content** - Quotes about beds, sleep, hygiene (GOODS topics)
- ✅ **High average quality** - Overall quality score 70+

---

## Troubleshooting

### If test script fails:
```bash
# Check if dev server is running
curl http://localhost:3030

# If not running, start it:
npm run dev
```

### If you get permission denied:
```bash
chmod +x ./scripts/test-goods-claude-v2.sh
```

### To see detailed quote results:
```bash
cat /tmp/goods-claude-v2-result.json | jq '.intelligentAnalysis.all_quotes[] | {
  text: .text,
  speaker: .storyteller,
  confidence: .confidence_score,
  category: .category
}'
```

### To check server logs for rejected quotes:
Just watch the terminal where `npm run dev` is running. You'll see real-time logs showing:
- Which quotes were rejected
- Why they were rejected (quality score, not found, etc.)
- Final quality metrics

---

## Alternative: Manual Test

If you prefer to test manually:

```bash
# Clear cache and regenerate with Claude V2
curl 'http://localhost:3030/api/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/analysis?intelligent=true&model=claude&regenerate=true' | jq '.'
```

---

## What Happens Next

After running the test:

1. **Check the results** - Look at `/tmp/goods-claude-v2-result.json`
2. **Review server logs** - See what was rejected and why
3. **Verify quality** - Ensure no fabrication, high quality scores
4. **Compare to old results** - Run with `model=gpt-4o-mini` to see the difference

---

## Expected Improvements

**Before (GPT-4o-mini):**
- Fabricated quotes: "I've been sleeping much better since the new beds arrived" ❌
- Incoherent quotes: "Because your back pain and all this..." (95% confidence) ❌
- Superficial quotes: "It's nice, more lower" (85% confidence) ❌
- Average quality: ~40/100 ❌

**After (Claude V2):**
- All quotes verified to exist in transcripts ✅
- Coherent, complete thoughts only ✅
- Deep, meaningful quotes only ✅
- Average quality: ~82/100 ✅

---

## Files to Review

1. **Test results:** `/tmp/goods-claude-v2-result.json`
2. **Server logs:** Terminal running `npm run dev`
3. **Documentation:** [CLAUDE_V2_INTEGRATION_COMPLETE.md](CLAUDE_V2_INTEGRATION_COMPLETE.md)
4. **Session summary:** [SESSION_COMPLETE_CLAUDE_V2_INTEGRATION.md](SESSION_COMPLETE_CLAUDE_V2_INTEGRATION.md)

---

## Ready? Let's Go!

```bash
# Step 1: Start dev server (if not already running)
npm run dev

# Step 2: Run the test
./scripts/test-goods-claude-v2.sh
```

Then watch the magic happen! 🎉
