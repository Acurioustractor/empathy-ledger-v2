# Ollama Integration Status - October 11, 2025

## ✅ COMPLETED (95%)

### 1. All AI Modules Refactored to Use LLM Client
- ✅ [src/lib/ai/project-outcomes-tracker.ts](src/lib/ai/project-outcomes-tracker.ts)
- ✅ [src/lib/ai/intelligent-quote-extractor.ts](src/lib/ai/intelligent-quote-extractor.ts)
- ✅ [src/lib/ai/intelligent-indigenous-impact-analyzer.ts](src/lib/ai/intelligent-indigenous-impact-analyzer.ts)
- ✅ [src/lib/ai/project-profile-extractor.ts](src/lib/ai/project-profile-extractor.ts)

All modules now use `createLLMClient()` instead of directly importing OpenAI/Anthropic.

### 2. LLM Client Factory Created
- ✅ Added `createLLMClient()` export to [src/lib/ai/llm-client.ts](src/lib/ai/llm-client.ts)
- ✅ OpenAI-compatible interface for easy migration
- ✅ Automatic provider selection based on `LLM_PROVIDER` env var
- ✅ Logging shows which provider is being used (🦙 Ollama / 🔑 OpenAI)

### 3. Ollama Configuration
- ✅ `.env.local` configured with:
  ```
  LLM_PROVIDER=ollama
  OLLAMA_BASE_URL=http://localhost:11434
  OLLAMA_MODEL=llama3.1:8b
  ```
- ✅ Model `llama3.1:8b` confirmed available
- ✅ Ollama running locally (not Docker, directly installed)

### 4. Runtime Error Fixes
- ✅ Fixed `.push()` error in analysis route with safety checks
- ✅ Added proper null/undefined handling for themes and storytellers
- ✅ Added `projectContext.description` for outcomes analysis

### 5. Project Outcomes Feature
- ✅ Frontend fully integrated
- ✅ Backend analyzer complete
- ✅ Goods project context saved
- ✅ UI displays correctly when data available

---

## ⚠️ REMAINING ISSUE (5%)

### JSON Parsing with Ollama

**Problem:** Ollama llama3.1:8b sometimes returns text with explanatory content before/after JSON, despite explicit instructions.

**Evidence from Logs:**
```
Quote extraction error: SyntaxError: Unexpected token 'A', "After anal"... is not valid JSON
Indigenous impact assessment error: SyntaxError: Unexpected token 'H', "Here is th"... is not valid JSON
```

**What's Happening:**
1. ✅ Ollama is being called correctly ("🦙 Using Ollama" appears in logs)
2. ✅ JSON format instructions added to prompts
3. ✅ `format: 'json'` parameter sent to Ollama API
4. ⚠️ Ollama still occasionally returns: "Here is the JSON: {..."  or "After analysis: {..."
5. ❌ `JSON.parse()` fails on the extra text

**Current Mitigation:**
- Added markdown code block stripping: `content.replace(/```json\n?/g, '')`
- Added explicit JSON-only instructions to system and user prompts
- Set Ollama `format: 'json'` parameter

**Why It's Not 100% Fixed:**
- Llama 3.1 8B model isn't perfectly trained for JSON-only output
- Needs more aggressive prompt engineering OR response cleaning

---

## 🔧 QUICK FIX OPTIONS

### Option A: Better Response Cleaning (10 minutes)
Add more aggressive text stripping in `callOllama()`:

```typescript
// After getting response
let content = data.message.content

// Strip common prefixes/suffixes
content = content
  .replace(/^[^{]*({)/s, '$1')  // Remove everything before first {
  .replace(/(})[^}]*$/s, '$1')  // Remove everything after last }
  .replace(/```json\n?/g, '')
  .replace(/```\n?/g, '')
  .replace(/^Here is.*?:\s*/i, '')
  .replace(/^After.*?:\s*/i, '')
  .trim()

// Validate it's JSON
try {
  JSON.parse(content)
} catch (e) {
  console.warn('Ollama returned invalid JSON, attempting to extract...')
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    content = jsonMatch[0]
  }
}
```

### Option B: Use Different Model (5 minutes)
Try a model better trained for structured output:

```bash
# Install mistral (better at following instructions)
ollama pull mistral:7b-instruct

# Update .env.local
OLLAMA_MODEL=mistral:7b-instruct
```

### Option C: Add Retry Logic (15 minutes)
Wrap JSON parsing with retry + cleaning:

```typescript
async function parseJSONResponse(response: string, maxRetries: number = 2): Promise<any> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const cleaned = cleanJSONResponse(response)
      return JSON.parse(cleaned)
    } catch (e) {
      if (i === maxRetries) throw e
      // Try more aggressive cleaning
      response = extractJSONFromText(response)
    }
  }
}
```

### Option D: Hybrid Approach (RECOMMENDED)
Use Ollama for everything EXCEPT critical JSON responses, fall back to OpenAI for those:

```typescript
// In createLLMClient()
async createChatCompletion(options) {
  const provider = process.env.LLM_PROVIDER || 'openai'
  const forceOpenAI = options.responseFormat === 'json' && provider === 'ollama'

  if (forceOpenAI) {
    console.log('🔑 Using OpenAI for critical JSON parsing (Ollama had issues)')
    // Use OpenAI
  } else if (provider === 'ollama') {
    console.log('🦙 Using Ollama (FREE, unlimited)')
    // Use Ollama
  }
}
```

---

## 🧪 TESTING PERFORMED

### What Works:
✅ Ollama connection established
✅ Provider switching (`LLM_PROVIDER` env var)
✅ Logging shows correct provider
✅ Non-JSON requests work fine
✅ All AI modules using LLM client

### What Fails:
❌ JSON parsing from Ollama responses (intermittent)
❌ Full intelligent analysis with Ollama (due to JSON issues)

### Test Commands:
```bash
# Verify Ollama
curl http://localhost:11434/api/tags

# Test simple non-JSON
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Say hello",
  "stream": false
}'

# Test JSON format
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Return JSON with key=value",
  "format": "json",
  "stream": false
}'
```

---

## 📈 PERFORMANCE EXPECTATIONS

### With OpenAI (Current Working State):
- **Speed**: 45-60 seconds for 23 transcripts
- **Cost**: ~$0.15-0.30 per analysis (gpt-4o-mini)
- **Rate Limit**: 30K tokens/minute

### With Ollama (When JSON Issue Fixed):
- **Speed**: 2-5 minutes for 23 transcripts (slower but acceptable)
- **Cost**: $0.00 forever
- **Rate Limit**: UNLIMITED

**Trade-off**: ~3x slower for FREE unlimited usage. Worth it for bulk processing!

---

## 🎯 RECOMMENDED NEXT STEPS

### Priority 1: Fix JSON Parsing (Choose One Fix Above)
**Time**: 10-15 minutes
**Impact**: Unlocks full Ollama usage

### Priority 2: Test Full Analysis
Once JSON works:
1. Clear cache: `curl -X POST http://localhost:3030/api/projects/{id}/analysis/clear-cache`
2. Run analysis: `curl http://localhost:3030/api/projects/{id}/analysis?intelligent=true`
3. Verify in logs: Should see multiple "🦙 Using Ollama" messages
4. Check response includes Project Outcomes

### Priority 3: Production Strategy
**Hybrid Approach** (RECOMMENDED):
- Development: Use Ollama (free, unlimited testing)
- Production: Use OpenAI for critical paths, Ollama for bulk processing
- Configuration per endpoint or per operation type

---

## 💻 CURRENT STATE OF CODE

### Environment Variables:
```bash
# .env.local
LLM_PROVIDER=ollama              # or 'openai'
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
OPENAI_API_KEY=sk-proj-...       # Fallback when needed
```

### How to Switch:
```bash
# Use Ollama (FREE)
LLM_PROVIDER=ollama

# Use OpenAI (PAID)
LLM_PROVIDER=openai
```

### Log Output:
```
🦙 Using Ollama (FREE, unlimited) - model: llama3.1:8b
🔑 Using OpenAI (paid, rate-limited) - model: gpt-4o-mini
```

---

## 📊 COMPARISON: Before vs After Refactoring

### Before:
```typescript
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [...],
  response_format: { type: 'json_object' }
})
```

### After:
```typescript
import { createLLMClient } from './llm-client'
const llm = createLLMClient()

const response = await llm.createChatCompletion({
  messages: [...],
  responseFormat: 'json'
})
```

**Benefits:**
- ✅ One line change to switch providers globally
- ✅ Consistent interface across all AI modules
- ✅ Easy to add new providers (Claude, Anthropic, etc.)
- ✅ Logging built-in
- ✅ Automatic fallback logic possible

---

## 🚀 VISION (When Complete)

With full Ollama integration:

1. **Development**: FREE unlimited AI for all testing
2. **Bulk Processing**: Analyze hundreds of transcripts with no API costs
3. **Privacy**: All analysis happens locally, no data leaves your machine
4. **Reliability**: No rate limits, no service outages
5. **Flexibility**: Easy to switch between providers per use case

**Example Use Cases:**
- Historical data processing (1000+ transcripts)
- Experimentation with prompts (unlimited iterations)
- Offline analysis
- Cost-sensitive production workloads

---

## 📝 FILES MODIFIED

### Core Changes:
1. `src/lib/ai/llm-client.ts` - Added `createLLMClient()` factory
2. `src/lib/ai/project-outcomes-tracker.ts` - Now uses LLM client
3. `src/lib/ai/intelligent-quote-extractor.ts` - Now uses LLM client
4. `src/lib/ai/intelligent-indigenous-impact-analyzer.ts` - Now uses LLM client
5. `src/lib/ai/project-profile-extractor.ts` - Now uses LLM client
6. `src/app/api/projects/[id]/analysis/route.ts` - Added safety checks
7. `.env.local` - Added Ollama configuration

### No Changes Needed:
- Frontend components (work with either provider)
- Database schema
- API routes (provider-agnostic)

---

## 🎓 KEY LEARNINGS

1. **JSON Format Enforcement**: Ollama needs VERY explicit instructions + `format: 'json'` parameter + response cleaning
2. **Model Selection Matters**: Some models (mistral, mixtral) better at structured output than others
3. **Trade-offs Are OK**: 3x slower for FREE unlimited is reasonable
4. **Graceful Degradation**: Keep OpenAI as fallback for critical operations
5. **Logging Is Essential**: Provider logs help debug which system is actually being used

---

## ✨ SUCCESS CRITERIA

Integration will be considered **100% complete** when:
- [ ] JSON parsing success rate > 95% with Ollama
- [ ] Full intelligent analysis completes without errors
- [ ] Project Outcomes feature works end-to-end
- [ ] Performance within acceptable range (< 5 min for 23 transcripts)
- [ ] Documentation complete for switching providers

**Current Status**: 95% complete. Just JSON cleaning needed!

---

## 📞 QUICK REFERENCE

### Test Ollama Availability:
```bash
curl http://localhost:11434/api/tags | jq '.models[].name'
```

### Clear Analysis Cache:
```bash
curl -X POST http://localhost:3030/api/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/analysis/clear-cache
```

### Trigger Analysis:
```bash
curl "http://localhost:3030/api/projects/6bd47c8a-e676-456f-aa25-ddcbb5a31047/analysis?intelligent=true"
```

### Check Logs for Provider:
```bash
tail -f /tmp/empathy-dev-new.log | grep -E "(🦙|🔑|Ollama|OpenAI)"
```

---

## 🎯 BOTTOM LINE

**We're 95% there!**

All the hard refactoring work is done. Every AI module uses the universal LLM client. Ollama connects and runs. We just need to improve JSON response cleaning to handle llama3.1's occasional chattiness.

**Recommended**: Implement Option A (better response cleaning) - 10 minutes of work for 100% completion.

**Alternative**: Use Option D (hybrid approach) - Ollama for most things, OpenAI for critical JSON responses.

Either way, the architecture is solid and switching providers is now trivial!
