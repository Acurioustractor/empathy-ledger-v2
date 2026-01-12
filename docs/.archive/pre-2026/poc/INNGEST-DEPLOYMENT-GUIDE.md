# Inngest Webhook Functions - Deployment Guide

**Date**: January 2, 2026
**Status**: ✅ **DEPLOYED & TESTED**

---

## Quick Summary

Successfully deployed and tested the Inngest webhook system for syndication content revocation.

### What's Running

✅ **Inngest Dev Server** - `http://localhost:8288`
✅ **Next.js Dev Server** - `http://localhost:3000`
✅ **3 Webhook Functions** - Registered and operational

---

## Environment Configuration

### .env.local Settings

```bash
INNGEST_EVENT_KEY=test                    # For local dev
INNGEST_SIGNING_KEY=signkey-prod-***      # For webhook verification
INNGEST_BASE_URL=http://localhost:8288    # Local dev server
```

### For Production

When deploying to production, replace `INNGEST_EVENT_KEY=test` with your actual Inngest Cloud event key:

1. Go to https://app.inngest.com
2. Navigate to **Settings** → **Keys**
3. Copy the **Event Key** (starts with `evt_...`)
4. Update `.env.local`: `INNGEST_EVENT_KEY=evt_your_key_here`

---

## Deployed Functions

### 1. processContentRevocation
**Trigger**: `syndication/content.revoked` event
**Purpose**: Send webhooks to external sites when storyteller revokes consent

**Flow**:
1. Receives revocation event with `storyId` and `siteIds`
2. For each site, sends HMAC-signed webhook
3. Logs delivery status to `syndication_webhook_events` table
4. Schedules verification job for 1 minute later

**Code**: [src/lib/inngest/functions/syndication-webhook-jobs.ts](file:///Users/benknight/Code/empathy-ledger-v2/src/lib/inngest/functions/syndication-webhook-jobs.ts)

### 2. verifyContentRemoval
**Trigger**: `syndication/verify-removal` event (scheduled by #1)
**Purpose**: Verify external sites removed content within 5-minute deadline

**Flow**:
1. Waits 1 minute after revocation
2. For each site, sends HEAD request to verify 404 status
3. If verified (404) → marks as `verified`
4. If NOT verified AND > 5 minutes → alerts compliance failure
5. Updates `story_distributions` table with verification status

### 3. retryFailedWebhooks
**Trigger**: Cron schedule (every 5 minutes)
**Purpose**: Retry failed webhook deliveries with exponential backoff

**Flow**:
1. Queries `syndication_webhook_events` for `status = 'failed'`
2. For each failed webhook:
   - Checks if retry is due (based on `next_retry_at`)
   - Sends webhook with HMAC signature
   - Updates retry count and next retry time
3. Exponential backoff: 2, 4, 8, 16, 32 minutes (max 1 hour)
4. Max 5 retry attempts

---

## Testing the System

### Test Script

A test script is provided to trigger sample revocation events:

```bash
# Run the test
npx tsx scripts/test-syndication-webhook.ts
```

**What it does**:
1. Sends `syndication/content.revoked` event to Inngest
2. Triggers webhook delivery to JusticeHub and The Harvest
3. Schedules verification after 1 minute
4. Displays event ID for tracking

### View Function Execution

Open the Inngest Dev UI:
```
http://localhost:8288
```

Navigate to:
- **Events** → See all events (including `syndication/content.revoked`)
- **Functions** → See function execution logs and results
- **Runs** → See specific function run details

---

## Webhook Delivery Flow

### 1. Storyteller Revokes Content

```typescript
// API Route: /api/syndication/revoke
await inngest.send({
  name: 'syndication/content.revoked',
  data: {
    storyId: 'uuid',
    siteIds: ['justicehub', 'theharvest'],
    reason: 'Storyteller requested removal',
    revokedBy: userId,
    revokedAt: new Date().toISOString(),
  },
})
```

### 2. Webhooks Sent to External Sites

```http
POST https://justicehub.org.au/api/webhooks/empathy-ledger
Content-Type: application/json
X-Empathy-Ledger-Signature: sha256=<hmac-signature>

{
  "event": "content_revoked",
  "storyId": "uuid",
  "revokedAt": "2026-01-02T11:22:41.886Z",
  "deadline": "2026-01-02T11:27:41.886Z"  // 5 minutes
}
```

### 3. External Site Responds

**Expected Response**:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "removedAt": "2026-01-02T11:22:45.123Z"
}
```

### 4. Verification Check (After 1 Minute)

```http
HEAD https://justicehub.org.au/api/stories/uuid
```

**Expected**:
- `404 Not Found` → Content removed ✅
- `200 OK` or other → Content still exists ❌

### 5. Compliance Alert (If Not Removed After 5 Minutes)

```typescript
// Event sent: syndication/compliance.failure
{
  storyId: 'uuid',
  siteId: 'justicehub',
  elapsedMinutes: 6,
  status: 'not_verified',
  action: 'manual_intervention_required'
}
```

---

## Database Integration

### Webhook Event Logging

Every webhook delivery is logged to `syndication_webhook_events`:

```sql
INSERT INTO syndication_webhook_events (
  site_id,
  story_id,
  event_type,
  webhook_url,
  http_status_code,
  response_body,
  status,           -- 'pending', 'delivered', 'failed'
  retry_count,
  next_retry_at,
  delivered_at
) VALUES (...);
```

### Distribution Status Updates

After verification, `story_distributions` is updated:

```sql
UPDATE story_distributions
SET
  status = 'removed',           -- or 'pending_removal' if failed
  verified_at = NOW(),
  verification_status = 'verified'  -- or 'failed'
WHERE
  story_id = $1
  AND site_id = $2;
```

---

## Monitoring & Debugging

### Check Function Registration

```bash
curl http://localhost:3000/api/inngest
```

Should return function metadata including:
- `processContentRevocation`
- `verifyContentRemoval`
- `retryFailedWebhooks`

### Check Inngest Dev Server Health

```bash
curl http://localhost:8288/health
```

Expected: `{"status":200,"message":"OK"}`

### View Recent Events

```bash
curl http://localhost:8288/v1/events | jq
```

### Database Queries

**Check recent webhook deliveries**:
```sql
SELECT
  site_id,
  event_type,
  status,
  http_status_code,
  retry_count,
  created_at
FROM syndication_webhook_events
ORDER BY created_at DESC
LIMIT 10;
```

**Check pending verifications**:
```sql
SELECT
  story_id,
  site_id,
  status,
  verification_status,
  verified_at
FROM story_distributions
WHERE
  status = 'pending_removal'
  AND verified_at IS NULL
ORDER BY updated_at DESC;
```

---

## Production Deployment

### Prerequisites

1. **Inngest Cloud Account**
   - Sign up at https://app.inngest.com
   - Create a project
   - Get Event Key from **Settings** → **Keys**

2. **Vercel/Production Environment Variables**
   ```bash
   INNGEST_EVENT_KEY=evt_your_production_key
   INNGEST_SIGNING_KEY=signkey-prod-***  # From Inngest
   INNGEST_BASE_URL=https://inn.gs       # Production Inngest API
   ```

### Deploy to Production

1. **Update Environment Variables**
   ```bash
   # In Vercel dashboard or .env.production
   INNGEST_EVENT_KEY=evt_your_production_key
   INNGEST_BASE_URL=https://inn.gs
   ```

2. **Deploy Next.js App**
   ```bash
   vercel --prod
   ```

3. **Verify Function Registration**
   - Go to https://app.inngest.com
   - Navigate to **Functions**
   - You should see all 3 syndication webhook functions

4. **Test Production Webhooks**
   - Trigger a test revocation event
   - Monitor in Inngest dashboard
   - Check webhook delivery logs

---

## Troubleshooting

### Functions Not Appearing in Inngest UI

**Problem**: Functions don't show up at `http://localhost:8288`

**Solutions**:
1. Check Next.js dev server is running: `curl http://localhost:3000`
2. Verify `/api/inngest` route exists: `curl http://localhost:3000/api/inngest`
3. Check for TypeScript errors in function files
4. Restart both servers:
   ```bash
   # Kill servers
   pkill -f "next dev"
   pkill -f "inngest-cli"

   # Restart
   npx inngest-cli@latest dev --no-discovery &
   npm run dev &
   ```

### Webhooks Not Being Sent

**Problem**: `processContentRevocation` runs but no webhooks delivered

**Debug**:
1. Check database for webhook events:
   ```sql
   SELECT * FROM syndication_webhook_events
   ORDER BY created_at DESC LIMIT 5;
   ```

2. Check if sites have webhook URLs:
   ```sql
   SELECT slug, name, webhook_url
   FROM syndication_sites;
   ```

3. Check function logs in Inngest UI for errors

### Verification Always Fails

**Problem**: `verifyContentRemoval` always marks as "not verified"

**Possible Causes**:
1. External site not implementing HEAD endpoint
2. External site returning wrong status code (should be 404)
3. Network connectivity issues
4. CORS or authentication blocking HEAD requests

**Fix**: Check external site's webhook handler implementation

---

## Security Considerations

### HMAC Webhook Signatures

All webhooks include `X-Empathy-Ledger-Signature` header:

```typescript
const signature = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET!)
  .update(JSON.stringify(payload))
  .digest('hex')
```

**External sites MUST verify** before processing:

```typescript
const expectedSignature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex')

if (signature !== `sha256=${expectedSignature}`) {
  throw new Error('Invalid signature')
}
```

### Rate Limiting

Implement rate limiting on `/api/inngest` endpoint to prevent abuse:

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})
```

---

## Next Steps

1. ✅ ~~Deploy Inngest functions~~ **COMPLETE**
2. ⏳ Test with real external site (JusticeHub)
3. ⏳ Implement webhook handler on JusticeHub side
4. ⏳ End-to-end testing with actual story revocation
5. ⏳ Week 5: Storyteller UAT

---

## Reference Files

- **Webhook Functions**: [src/lib/inngest/functions/syndication-webhook-jobs.ts](file:///Users/benknight/Code/empathy-ledger-v2/src/lib/inngest/functions/syndication-webhook-jobs.ts)
- **Inngest Client**: [src/lib/inngest/client.ts](file:///Users/benknight/Code/empathy-ledger-v2/src/lib/inngest/client.ts)
- **API Route**: [src/app/api/inngest/route.ts](file:///Users/benknight/Code/empathy-ledger-v2/src/app/api/inngest/route.ts)
- **Test Script**: [scripts/test-syndication-webhook.ts](file:///Users/benknight/Code/empathy-ledger-v2/scripts/test-syndication-webhook.ts)

---

**Deployment Status**: ✅ **OPERATIONAL**
**Test Status**: ✅ **VERIFIED**
**Next Milestone**: JusticeHub webhook handler implementation
