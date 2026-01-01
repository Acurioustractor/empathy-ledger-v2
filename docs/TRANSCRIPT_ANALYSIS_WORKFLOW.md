# Transcript Analysis Workflow

## Overview

This document explains how transcript analysis works automatically in the Empathy Ledger platform, what has been fixed, and what storytellers can expect when they create new transcripts.

## Automatic Processing Flow

When a storyteller or admin creates a new transcript, the following happens automatically:

### 1. Transcript Creation
- User creates a transcript via the UI (either through the Storyteller Wizard or Transcript Edit page)
- The transcript is saved to the database with status `pending`
- Basic metadata is calculated (word count, character count, etc.)

### 2. Immediate Processing Trigger
**IMPORTANT**: Analysis starts **immediately** upon transcript creation - no external services required!

The system automatically triggers the `TranscriptProcessingPipeline` which:
- ✅ Runs in the background (doesn't block the UI)
- ✅ Works in development and production
- ✅ No manual intervention needed
- ✅ No Inngest or external job queue required

Location: [src/app/api/transcripts/route.ts](../src/app/api/transcripts/route.ts#L187)

### 3. Analysis Pipeline Steps

The pipeline processes the transcript through multiple AI-powered analysis steps:

#### Step 1: Fetch Transcript Data
- Retrieves the transcript with storyteller and organization information
- **Fixed Issue**: Changed from `profiles.organization_id` to `profiles.tenant_id` to match database schema

#### Step 2: Indigenous Impact Analysis
- Analyzes transcript for Indigenous community impacts
- Extracts insights about:
  - Community development
  - Cultural preservation
  - Economic empowerment
  - Social justice
  - Environmental stewardship

#### Step 3: Theme & Quote Extraction
- Identifies key themes in the storyteller's narrative
- Extracts meaningful quotes
- Categorizes content

#### Step 4: Database Updates
- Saves analysis results back to the transcript
- Updates status to `analyzed`
- Stores themes, quotes, and insights in `metadata.analysis`

## What Storytellers See

### During Creation
1. Storyteller fills out transcript form
2. Clicks "Create Transcript"
3. Gets immediate success message
4. Sees transcript with status "Processing..." or "Pending Analysis"

### After Processing (2-5 minutes)
1. Status changes to "Analyzed"
2. Themes appear on the transcript page
3. Key quotes are highlighted
4. Indigenous impact insights are visible
5. Recommendations are generated

## Recent Fixes Applied

### ✅ Database Schema Fix
**Problem**: Code was trying to access `profiles.organization_id` which doesn't exist in the database.

**Fix**: Updated [transcript-processing-pipeline.ts](../src/lib/workflows/transcript-processing-pipeline.ts#L134) to use `tenant_id` instead:

```typescript
// Before (BROKEN)
storyteller:profiles!storyteller_id(id, display_name, organization_id)

// After (FIXED)
storyteller:profiles!storyteller_id(id, display_name, tenant_id)
```

### ✅ Removed Inngest Dependency for Development
**Problem**: System was trying to send jobs to Inngest service which wasn't running locally.

**Solution**: The code already has direct processing built-in! The `TranscriptProcessingPipeline` runs immediately when transcripts are created, so Inngest is only needed for production scheduling/retries.

## How to Verify It's Working

### 1. Check the Server Logs
When a transcript is created, you should see:

```
📝 Transcript creation request: {...}
✅ Text transcript created: [transcript-id]
🎯 Starting Indigenous impact analysis for transcript: [transcript-id]
[Processing steps...]
✨ Indigenous impact analysis completed: {
  transcriptId: '...',
  insightsFound: X,
  impactTypes: [...],
  confidenceScore: 0.X
}
```

### 2. Check the Database
```sql
SELECT
  id,
  title,
  status,
  metadata->'analysis' as analysis_results
FROM transcripts
WHERE id = '[transcript-id]';
```

Status should progress: `pending` → `processing` → `analyzed`

### 3. Check the UI
- Navigate to the transcript edit page
- Status badge should show "Analyzed" (with green color)
- Themes should be visible
- Quotes should be extracted
- Insights panel should show Indigenous impact analysis

## Troubleshooting

### Analysis Not Starting
**Check**: Server logs for errors after transcript creation
**Common Issue**: AI service API key missing or invalid
**Fix**: Ensure `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set in `.env.local`

### Analysis Stuck in "Processing"
**Check**: Database `ai_processing_status` field
**Common Issue**: AI API timeout or rate limit
**Fix**: The pipeline has retry logic; wait 5 minutes and check again

### No Themes or Quotes Extracted
**Check**: Transcript content quality and length
**Common Issue**: Transcript too short (< 100 words) or unclear content
**Fix**: Ensure transcript is at least a few paragraphs with clear narrative

## For Developers

### Running in Development
```bash
npm run dev
```

That's it! No additional services needed. The processing happens in-process.

### Running in Production
In production, you may want to use Inngest for:
- Retry logic on failures
- Scheduled batch processing
- Monitoring and observability
- Rate limiting AI API calls

But for development and basic functionality, direct processing works perfectly.

### Testing the Pipeline Directly
```typescript
import { TranscriptProcessingPipeline } from '@/lib/workflows/transcript-processing-pipeline'

const pipeline = new TranscriptProcessingPipeline(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

await pipeline.processTranscript('transcript-id-here')
```

## Configuration

### AI Provider
The system uses AI for analysis. Configure in `.env.local`:

```bash
# Option 1: OpenAI
OPENAI_API_KEY=sk-...

# Option 2: Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...
```

### Processing Options
Edit [transcript-processing-pipeline.ts](../src/lib/workflows/transcript-processing-pipeline.ts) to adjust:
- AI model selection
- Analysis depth
- Timeout values
- Retry attempts

## Related Files

- **Pipeline**: [src/lib/workflows/transcript-processing-pipeline.ts](../src/lib/workflows/transcript-processing-pipeline.ts)
- **API Route**: [src/app/api/transcripts/route.ts](../src/app/api/transcripts/route.ts)
- **Analyze Endpoint**: [src/app/api/transcripts/[id]/analyze/route.ts](../src/app/api/transcripts/[id]/analyze/route.ts)
- **AI Analysis**: [src/lib/ai/transcript-analyzer-v2.ts](../src/lib/ai/transcript-analyzer-v2.ts)

## Summary

✅ **Automatic**: Analysis starts immediately when transcripts are created
✅ **No Manual Steps**: Storytellers don't need to click "Analyze" buttons
✅ **Works in Development**: No external services required locally
✅ **Database Schema Fixed**: Uses correct `tenant_id` field
✅ **Background Processing**: Doesn't block UI or slow down creation

The system is now working correctly and will automatically analyze all new transcripts!
