# Ollama Analysis - Performance & Caching Guide

## Current Setup ✅

- **LLM Provider**: Ollama (local, free, unlimited)
- **Model**: llama3.1:8b
- **Processing**: Batched (2 transcripts at a time, 2s delays)
- **Transcript Truncation**: First 8000 characters
- **Timeout**: 5 minutes per request

## How Caching Works 🗄️

The system caches analysis results to avoid re-running Ollama unnecessarily:

### Cache Key Components
1. **Project ID**: `d10daf41-02ae-45e4-9e9b-1c96e56ee820`
2. **Model Used**: `gpt-4o-mini` (or whatever model ran the analysis)
3. **Content Hash**: SHA-256 hash of all transcript texts combined

### When Analysis Runs (Cache MISS)
- ❌ First time analyzing a project
- ❌ Any transcript content changes
- ❌ Transcripts added or removed
- ❌ Force regenerate with `?force=true` parameter

### When Cache is Used (Cache HIT)
- ✅ Same transcripts, same content
- ✅ Accessing analysis page multiple times
- ✅ API requests with `?intelligent=true`
- ✅ Frontend loading the analysis view

## Expected Performance ⏱️

### With Ollama (llama3.1:8b)
- **Single transcript**: ~18 seconds
- **Full analysis (16 transcripts)**: ~10-15 minutes
- **Subsequent requests**: Instant (from cache)

### Database Storage
Cached results stored in `project_analyses` table:
```sql
SELECT
  analyzed_at,
  model_used,
  content_hash,
  cached
FROM project_analyses
WHERE project_id = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820'
```

## Verifying Cache Works 🧪

### Test Cache Hit
```bash
# First request (slow, generates analysis)
time curl -s "http://localhost:3030/api/projects/d10daf41-02ae-45e4-9e9b-1c96e56ee820/analysis?intelligent=true" | jq '.cached'

# Second request (instant, uses cache)
time curl -s "http://localhost:3030/api/projects/d10daf41-02ae-45e4-9e9b-1c96e56ee820/analysis?intelligent=true" | jq '.cached'
```

### Force Regenerate
```bash
# Clear cache and regenerate
npx tsx scripts/regenerate-homestead-analysis.ts
```

## Frontend Behavior 🖥️

When you visit the Analysis page:
1. Frontend calls `/api/projects/{id}/analysis?intelligent=true`
2. API checks cache based on content hash
3. If cache HIT → Returns instantly with `cached: true`
4. If cache MISS → Runs Ollama (slow), saves to DB, returns result

**Loading Indicator**: Shows "Loading project analysis..." only during first generation

## Optimization Tips 💡

### Current Optimizations Applied
✅ Transcript truncation (8000 chars)
✅ Batch processing (2 at a time)
✅ 5-minute timeout
✅ Content-based cache invalidation
✅ No OpenAI fallback when Ollama explicitly set

### When to Regenerate Cache
Only regenerate when:
- Transcripts have been edited/updated
- You want to test with different prompts
- Analysis quality seems poor

### Don't Regenerate If
- Just viewing the analysis multiple times
- Sharing the analysis page with others
- Checking different tabs on the same project

## Current Analysis Status

**Running now**: Full Homestead analysis with Ollama
- **Started**: Background process `04ed5b`
- **Expected completion**: 10-15 minutes
- **Log file**: `/tmp/ollama-homestead-analysis.log`

Once complete:
1. Results saved to `project_analyses` table
2. All subsequent requests instant (from cache)
3. Frontend loads immediately
4. No re-processing unless transcripts change

## Monitoring Progress

```bash
# Check current progress
tail -f /tmp/ollama-homestead-analysis.log

# Check if complete
curl -s "http://localhost:3030/api/projects/d10daf41-02ae-45e4-9e9b-1c96e56ee820/analysis?intelligent=true" | jq '.cached'
```
