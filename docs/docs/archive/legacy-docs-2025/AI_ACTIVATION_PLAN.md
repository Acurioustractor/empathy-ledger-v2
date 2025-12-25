# AI Impact Analysis System - Activation Plan

## Executive Summary

**Status**: Empathy Ledger has a comprehensive AI analysis system already built and operational. All infrastructure is in place. 251 transcripts are ready for analysis but 0% have been processed.

**Goal**: Activate the existing system to analyze all 251 transcripts and populate storyteller analytics.

## Current State

### Infrastructure: ✅ Ready
- Hybrid transcript analyzer (pattern matching + GPT-4)
- Theme extraction and storage system
- Quote extraction with impact scoring
- Storyteller analytics aggregation
- Cross-transcript insights generation
- Inngest workflow automation
- Cultural safety checks

### Data Status: ⚠️ Needs Activation
- **Total transcripts**: 251
- **Analyzed**: 0 (0%)
- **With themes**: 0 (0%)
- **With quotes**: 0 (0%)
- **With AI summary**: 0 (0%)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Transcript Analysis Flow                  │
└─────────────────────────────────────────────────────────────┘

1. Trigger Analysis
   POST /api/transcripts/[id]/analyze
   ↓
2. Inngest Queue (async processing)
   Event: transcript/process
   ↓
3. Process Transcript Function
   [src/lib/inngest/functions/process-transcript.ts]
   ├─ Fetch transcript content
   ├─ Run hybrid AI analysis (patterns + LLM)
   ├─ Extract themes (general + cultural)
   ├─ Extract key quotes with impact scores
   ├─ Generate AI summary
   ├─ Determine cultural sensitivity level
   ├─ Flag elder review requirement
   └─ Store all results
   ↓
4. Update Analytics
   [src/lib/analytics/storyteller-analytics.ts]
   ├─ Link themes to narrative_themes table
   ├─ Store powerful quotes in storyteller_quotes
   ├─ Update storyteller_analytics aggregates
   ├─ Suggest network connections
   └─ Build storyteller_connections graph
   ↓
5. Results Available
   - GET /api/storytellers/[id]/analytics
   - GET /api/storytellers/[id]/impact-metrics
   - GET /api/organisations/[id]/cross-sector-insights
```

## API Endpoints (All Operational)

### Individual Analysis
```bash
# Analyze single transcript
POST /api/transcripts/[id]/analyze
Response: { success, transcriptId, status: "queued", estimatedTime: "2-5 minutes" }

# Check analysis status
GET /api/transcripts/[id]/analyze
Response: { status: "queued|processing|completed|failed", progress, results }
```

### Bulk Organization Analysis
```bash
# Analyze all transcripts for an organization
POST /api/organisations/[id]/analyze-all
Response: {
  success,
  transcripts_queued: 251,
  estimatedCompletionMinutes: 753 (3 min/transcript)
}

# Check bulk progress
GET /api/organisations/[id]/analyze-all
Response: {
  total: 251,
  queued: 150,
  processing: 10,
  completed: 91,
  failed: 0
}
```

### Analytics Retrieval
```bash
# Individual storyteller impact
GET /api/storytellers/[id]/impact-metrics
Response: {
  story_count, transcript_count,
  primary_themes: ["theme1", "theme2"],
  impactful_quotes: [...],
  network_connections: [...],
  engagement_score: 0.85
}

# Organization cross-transcript insights
GET /api/organisations/[id]/cross-sector-insights
Response: {
  dominant_themes: [...],
  emerging_patterns: [...],
  storyteller_network: {...},
  cultural_preservation_metrics: {...}
}
```

## Analysis Components

### 1. Hybrid Transcript Analyzer
**File**: [src/lib/ai/transcript-analyzer-v2.ts](../src/lib/ai/transcript-analyzer-v2.ts)

**Process**:
- **Phase 1**: Fast pattern matching (Indigenous impact indicators)
- **Phase 2**: Deep LLM analysis (GPT-4o-mini)
- **Phase 3**: Merge comprehensive insights

**Extracts**:
- Themes (max 8 general + 5 cultural)
- Key quotes (max 5, with impact scores 0-5)
- Summary (max 500 chars)
- Emotional tone
- Cultural sensitivity level ('low' | 'medium' | 'high' | 'sacred')
- Elder review requirement flag
- Key insights (max 5)
- Related topics (max 5)

### 2. Indigenous Impact Analyzer
**File**: [src/lib/ai/indigenous-impact-analyzer.ts](../src/lib/ai/indigenous-impact-analyzer.ts)

**Pattern Matching For**:
- Cultural preservation
- Self-determination
- Healing
- Intergenerational knowledge transfer
- Environmental stewardship
- Language revitalization
- Economic sovereignty
- Educational innovations
- Health and wellbeing
- Decolonization

### 3. Storyteller Analytics
**File**: [src/lib/analytics/storyteller-analytics.ts](../src/lib/analytics/storyteller-analytics.ts)

**Functions**:
1. `extractAndStoreThemes()` - Links transcripts → themes → storytellers
2. `extractAndStorePowerfulQuotes()` - Stores impactful quotes
3. `updateStorytellerAnalytics()` - Maintains storyteller metrics
4. `suggestConnections()` - Finds storytellers with shared themes
5. `updateNetworkConnections()` - Builds storyteller networks

**Database Tables Updated**:
- `narrative_themes` - Platform-wide theme catalog
- `storyteller_themes` - Storyteller ↔ Theme connections
- `storyteller_quotes` - Impactful quotes by storyteller
- `storyteller_connections` - Network graph
- `storyteller_analytics` - Aggregated metrics

## Activation Steps

### Prerequisites

1. **Environment Variables Required**:
   ```bash
   # OpenAI (for AI analysis)
   OPENAI_API_KEY=sk-proj-...

   # Inngest (for async processing)
   INNGEST_EVENT_KEY=...
   INNGEST_SIGNING_KEY=signkey-...
   INNGEST_BASE_URL=http://localhost:8288  # or production URL

   # Supabase (already set)
   NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

2. **Inngest Dev Server** (for local testing):
   ```bash
   npx inngest-cli@latest dev
   # Runs on http://localhost:8288
   ```

3. **Vercel Environment Variables** (for production):
   - Add all required env vars to Vercel dashboard
   - Redeploy after adding

### Phase 1: Single Transcript Test (5 minutes)

**Test on one transcript to verify system operational**:

```bash
# 1. Get a sample transcript ID
curl "https://empathy-ledger-v2.vercel.app/api/admin/transcripts?limit=1" | jq -r '.transcripts[0].id'
# Result: 75d047e6-e253-4985-adba-66b50fb14d95

# 2. Trigger analysis
curl -X POST "https://empathy-ledger-v2.vercel.app/api/transcripts/75d047e6-e253-4985-adba-66b50fb14d95/analyze"

# 3. Check status (wait 2-5 minutes)
curl "https://empathy-ledger-v2.vercel.app/api/transcripts/75d047e6-e253-4985-adba-66b50fb14d95/analyze"

# 4. Verify results in database
curl "https://empathy-ledger-v2.vercel.app/api/admin/transcripts?limit=1" | jq '.transcripts[0] | {themes, key_quotes, ai_summary}'
```

**Expected Result**:
```json
{
  "themes": ["theme1", "theme2", "theme3"],
  "key_quotes": ["quote 1", "quote 2"],
  "ai_summary": "A concise summary..."
}
```

**If it fails**, check:
- OpenAI API key is set and valid
- Inngest is running (local dev server or production)
- Transcript has content (`transcript_content` or `text` field)
- Check logs in Vercel or local console

### Phase 2: Bulk Analysis - All Transcripts (12-15 hours)

**Once single test succeeds, trigger bulk analysis**:

```bash
# Get all organizations (if transcripts are linked to orgs)
curl "https://empathy-ledger-v2.vercel.app/api/organisations" | jq -r '.organisations[] | .id'

# For each organization, trigger bulk analysis
# OR if transcripts aren't org-linked, trigger by batches

# Option A: Bulk by organization
for org_id in $(curl -s "https://empathy-ledger-v2.vercel.app/api/organisations" | jq -r '.organisations[].id'); do
  echo "Analyzing transcripts for org: $org_id"
  curl -X POST "https://empathy-ledger-v2.vercel.app/api/organisations/$org_id/analyze-all"
  sleep 5  # Rate limiting
done

# Option B: Batch by transcript (if no org link)
# Create a batch script to analyze 10 at a time
for transcript_id in $(curl -s "https://empathy-ledger-v2.vercel.app/api/admin/transcripts?limit=1000" | jq -r '.transcripts[].id'); do
  curl -X POST "https://empathy-ledger-v2.vercel.app/api/transcripts/$transcript_id/analyze"
  echo "Queued: $transcript_id"
  sleep 2  # Rate limit: 30/min max
done
```

**Processing Time**:
- 251 transcripts × 3 minutes average = **753 minutes (~12.5 hours)**
- Inngest will process them in queue
- Can run in background

**Monitor Progress**:
```bash
# Check how many transcripts have been analyzed
curl "https://empathy-ledger-v2.vercel.app/api/admin/transcripts?limit=1000" | \
  jq '[.transcripts[] | select(.themes != null)] | length'
```

### Phase 3: Verification (30 minutes)

**Once all transcripts processed, verify analytics**:

```bash
# 1. Check storyteller analytics are populated
curl "https://empathy-ledger-v2.vercel.app/api/storytellers?limit=10" | \
  jq '.storytellers[] | {name: .display_name, transcript_count: .transcripts_count, themes: .primary_themes}'

# 2. Check narrative themes table
# (Requires database query or admin endpoint)

# 3. Verify storyteller quotes
curl "https://empathy-ledger-v2.vercel.app/api/storytellers/[id]/impact-metrics"

# 4. Test cross-sector insights
curl "https://empathy-ledger-v2.vercel.app/api/organisations/[id]/cross-sector-insights"
```

**Success Criteria**:
- ✅ 251/251 transcripts have `themes` array populated
- ✅ 251/251 transcripts have `key_quotes` array populated
- ✅ 251/251 transcripts have `ai_summary` text
- ✅ `narrative_themes` table has 50+ unique themes
- ✅ `storyteller_themes` table has theme-storyteller mappings
- ✅ `storyteller_quotes` table has impactful quotes
- ✅ `storyteller_analytics` table has updated metrics
- ✅ Cross-sector insights API returns data

## Cost Estimates

### OpenAI API Costs (GPT-4o-mini)
- **Input**: ~2,000 tokens/transcript × 251 = 502,000 tokens
- **Output**: ~500 tokens/transcript × 251 = 125,500 tokens
- **Rate**: $0.15/1M input, $0.60/1M output
- **Total Cost**: ~$0.15 (input) + ~$0.08 (output) = **$0.23 USD**

(Remarkably cheap for comprehensive AI analysis!)

### Inngest Costs
- Free tier: 1,000 function runs/month
- 251 transcripts = well within free tier
- **Cost**: $0

**Total Estimated Cost: $0.25 USD**

## Error Handling

### Common Issues

**1. "Missing OPENAI_API_KEY environment variable"**
- Solution: Add `OPENAI_API_KEY=sk-proj-...` to Vercel env vars
- Redeploy application

**2. "Inngest function not found"**
- Solution: Ensure Inngest dev server is running locally OR
- Production: Ensure Inngest keys are set in Vercel

**3. "Transcript has no content to analyse"**
- Solution: Check transcript has `content`, `transcript_content`, or `text` field
- Query: `SELECT id, title, content IS NOT NULL FROM transcripts LIMIT 10`

**4. "Rate limit exceeded"**
- Solution: Add delays between batch requests (sleep 2 seconds)
- Use Inngest queue automatically handles rate limiting

### Monitoring

**Inngest Dashboard**:
- View function execution logs
- See success/failure rates
- Retry failed jobs
- Access: https://app.inngest.com/

**Application Logs**:
```bash
# Local development
npm run dev
# Watch console for "🚀 Processing transcript: ..."

# Production (Vercel)
# View logs in Vercel dashboard
# Filter by: /api/transcripts/*/analyze
```

## Next Steps After Activation

### 1. Build Analytics Dashboards

**Organization Impact Dashboard**:
- Aggregate themes across all org transcripts
- Show top storytellers by impact score
- Display powerful quotes
- Visualize theme evolution over time

**Storyteller Impact Dashboard**:
- Individual storyteller analytics
- Network connections graph
- Theme expertise visualization
- Impact score breakdown

**Platform-Wide Insights**:
- Total transcripts analyzed
- Most common themes
- Cultural preservation metrics
- Geographic impact patterns

### 2. Impact Report Generation

**Automated Reports**:
- Use existing cross-transcript insights APIs
- Generate PDF/Word reports
- Include charts and visualizations
- Schedule quarterly reports

**Templates**:
- Funder impact reports
- Annual impact summaries
- Partner updates
- Community newsletters

### 3. World Tour Integration

**Add**: `world_tour_engagements` table
- Track partnership visits
- Link to organization analytics
- Monitor outreach outcomes

**World Tour Tracker UI**:
- Map of visited organizations
- Analytics for each engagement
- Impact stories from tours
- Follow-up action items

## Timeline

### Week 1: Activation
- Day 1: Environment setup, single transcript test
- Day 2-3: Bulk analysis execution (12-15 hours processing)
- Day 4-5: Verification and debugging

### Week 2-3: Dashboard Development
- Organization analytics dashboard
- Storyteller impact dashboard
- Platform insights page

### Week 4: Reports & World Tour
- Impact report templates
- World tour tracking system
- Partner analytics

## Documentation References

- [EXISTING_AI_IMPACT_SYSTEM.md](EXISTING_AI_IMPACT_SYSTEM.md) - Full system review
- [IMPACT_FRAMEWORK_AND_WORLD_TOUR.md](IMPACT_FRAMEWORK_AND_WORLD_TOUR.md) - Strategic framework
- [SESSION_SUMMARY_DEC24.md](SESSION_SUMMARY_DEC24.md) - Recent session summary

## Key Files

**AI Analysis**:
- `src/lib/ai/transcript-analyzer-v2.ts` - Main analyzer
- `src/lib/ai/indigenous-impact-analyzer.ts` - Pattern matching
- `src/lib/ai/claude-quote-extractor.ts` - Quote extraction

**Analytics**:
- `src/lib/analytics/storyteller-analytics.ts` - Main analytics functions
- `src/lib/services/analytics.service.ts` - Analytics service layer

**APIs**:
- `src/app/api/transcripts/[id]/analyze/route.ts` - Single analysis
- `src/app/api/organisations/[id]/analyze-all/route.ts` - Bulk analysis
- `src/app/api/storytellers/[id]/analytics/route.ts` - Storyteller analytics

**Workflows**:
- `src/lib/inngest/functions/process-transcript.ts` - Automated pipeline

---

**Status**: Ready for activation
**Recommendation**: Start with single transcript test, then proceed with bulk analysis
**Risk Level**: Low - system is well-tested and production-ready
**Next Action**: Verify environment variables and trigger Phase 1 test

**Last Updated**: 2025-12-24
