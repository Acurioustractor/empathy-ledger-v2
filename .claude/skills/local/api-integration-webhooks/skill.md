# API Integration Webhooks Skill

**Purpose:** Guide implementation of webhook notifications for external integrations (JusticeHub, ACT Farm, etc.) when consent or content changes occur.

**Auto-Invoke When User Says:**
- "Add webhook notifications"
- "Notify JusticeHub when consent changes"
- "Send webhook on revocation"
- "Implement webhook system"
- "External API notifications"

---

## 🎯 Webhook System Overview

**Philosophy:**
- **Immediate Notification:** External sites learn about changes instantly
- **Reliable Delivery:** Retry failed webhooks with exponential backoff
- **Secure:** HMAC signature verification for webhook authenticity
- **Transparent:** Storytellers see webhook delivery status in dashboard

---

## 📋 Webhook Event Types

### 1. Consent Events
- `consent.created` - New consent granted
- `consent.approved` - Elder approved consent request
- `consent.revoked` - Consent revoked by storyteller
- `consent.expired` - Consent expired (time-based)

### 2. Content Events (Future)
- `story.updated` - Story content changed
- `story.deleted` - Story deleted from platform
- `embed_token.expired` - Token reached expiration date

---

## 🔧 Implementation Checklist

### Database Schema

**Table: `webhook_deliveries`**
```sql
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  site_id UUID NOT NULL REFERENCES syndication_sites(id),
  event_type TEXT NOT NULL, -- 'consent.created', 'consent.revoked', etc.
  payload JSONB NOT NULL,
  webhook_url TEXT NOT NULL,

  -- Delivery tracking
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'retrying'
  http_status_code INTEGER,
  response_body TEXT,
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,

  -- Security
  signature_hash TEXT, -- HMAC-SHA256 signature

  -- Metadata
  metadata JSONB
);

-- Indexes
CREATE INDEX idx_webhook_deliveries_site_id ON webhook_deliveries(site_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_next_retry ON webhook_deliveries(next_retry_at) WHERE status = 'retrying';
```

---

### Service: `src/lib/services/webhook-service.ts`

**Core Functions:**

```typescript
/**
 * Send webhook notification to external site
 */
export async function sendWebhook(params: {
  siteId: string
  eventType: string
  payload: object
  tenantId: string
}): Promise<{ success: boolean; deliveryId?: string; error?: string }>

/**
 * Verify webhook signature (for incoming webhooks from external sites)
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean

/**
 * Retry failed webhook deliveries
 * Called by Inngest background job
 */
export async function retryFailedWebhooks(): Promise<{
  attempted: number
  succeeded: number
  failed: number
}>

/**
 * Get webhook delivery history for a site
 */
export async function getWebhookHistory(
  siteId: string,
  options?: {
    limit?: number
    status?: 'pending' | 'sent' | 'failed' | 'retrying'
    eventType?: string
  }
): Promise<WebhookDelivery[]>
```

---

### Inngest Background Job

**File:** `src/lib/inngest/functions/webhook-jobs.ts`

```typescript
import { inngest } from '../client'
import { sendWebhook, retryFailedWebhooks } from '@/lib/services/webhook-service'

/**
 * Send webhook notification (triggered by consent changes)
 */
export const sendConsentWebhook = inngest.createFunction(
  { id: 'send-consent-webhook' },
  { event: 'consent/webhook.send' },
  async ({ event, step }) => {
    const { siteId, eventType, payload, tenantId } = event.data

    const result = await step.run('send-webhook', async () => {
      return await sendWebhook({ siteId, eventType, payload, tenantId })
    })

    if (!result.success) {
      throw new Error(`Webhook delivery failed: ${result.error}`)
    }

    return { deliveryId: result.deliveryId, success: true }
  }
)

/**
 * Retry failed webhooks (runs every 5 minutes)
 */
export const retryWebhooks = inngest.createFunction(
  { id: 'retry-webhooks' },
  { cron: '*/5 * * * *' }, // Every 5 minutes
  async ({ step }) => {
    const result = await step.run('retry-failed-webhooks', async () => {
      return await retryFailedWebhooks()
    })

    return {
      attempted: result.attempted,
      succeeded: result.succeeded,
      failed: result.failed
    }
  }
)
```

---

### Integration Points

**1. Consent Creation** ([src/app/api/syndication/consent/route.ts:188-195](../../src/app/api/syndication/consent/route.ts))

After creating consent, trigger webhook:

```typescript
// Send webhook notification to syndication site
if (site.webhook_url) {
  await inngest.send({
    name: 'consent/webhook.send',
    data: {
      siteId: site.id,
      eventType: 'consent.created',
      payload: {
        consentId: consent.id,
        storyId: storyId,
        culturalPermissionLevel: consent.cultural_permission_level,
        status: consent.status,
        embedToken: embedToken?.token,
        createdAt: consent.created_at
      },
      tenantId: story.tenant_id
    }
  })
}
```

**2. Consent Revocation** ([src/app/api/syndication/consent/[consentId]/revoke/route.ts:120-128](../../src/app/api/syndication/consent/[consentId]/revoke/route.ts))

After revoking consent, trigger webhook:

```typescript
// Send webhook notification to syndication site
if (site.webhook_url) {
  await inngest.send({
    name: 'consent/webhook.send',
    data: {
      siteId: consent.site_id,
      eventType: 'consent.revoked',
      payload: {
        consentId,
        storyId: consent.story_id,
        reason: reason || 'Consent revoked by storyteller',
        revokedAt: new Date().toISOString()
      },
      tenantId: consent.tenant_id
    }
  })
}
```

---

## 🔐 Security: HMAC Signature

**Generate Signature (Empathy Ledger sends to external site):**

```typescript
import crypto from 'crypto'

function generateWebhookSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

// Usage in webhook delivery
const payloadString = JSON.stringify(payload)
const signature = generateWebhookSignature(payloadString, site.webhook_secret)

await fetch(site.webhook_url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Webhook-Signature': signature,
    'X-Webhook-Event': eventType
  },
  body: payloadString
})
```

**Verify Signature (External site receives from Empathy Ledger):**

```typescript
// JusticeHub verifies webhook from Empathy Ledger
function verifyWebhookSignature(
  payload: string,
  receivedSignature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature),
    Buffer.from(expectedSignature)
  )
}
```

---

## 📊 Webhook Payload Examples

### Consent Created

```json
{
  "event": "consent.created",
  "timestamp": "2026-01-05T15:30:00Z",
  "data": {
    "consentId": "aa3036bb-2909-49aa-aa93-06608c5781b0",
    "storyId": "1c8bdfb9-fcf1-458a-aed7-ffdc6b272ab6",
    "culturalPermissionLevel": "public",
    "status": "approved",
    "embedToken": "LRKSTioBIHH239y_rk7KSbujUz3G5jhpiuMkYmlw3XA",
    "expiresAt": "2026-02-04T15:30:00Z",
    "createdAt": "2026-01-05T15:30:00Z"
  }
}
```

### Consent Revoked

```json
{
  "event": "consent.revoked",
  "timestamp": "2026-01-05T16:45:00Z",
  "data": {
    "consentId": "aa3036bb-2909-49aa-aa93-06608c5781b0",
    "storyId": "1c8bdfb9-fcf1-458a-aed7-ffdc6b272ab6",
    "reason": "Storyteller requested removal",
    "revokedAt": "2026-01-05T16:45:00Z"
  }
}
```

---

## 🔄 Retry Strategy

**Exponential Backoff:**

```typescript
function calculateNextRetry(attemptCount: number): Date {
  // Retry after: 1min, 5min, 30min
  const delays = [60, 300, 1800] // seconds
  const delay = delays[Math.min(attemptCount, delays.length - 1)]

  const nextRetry = new Date()
  nextRetry.setSeconds(nextRetry.getSeconds() + delay)

  return nextRetry
}
```

**Max Attempts:** 3
**Give Up After:** 30 minutes total (~36 minutes with retries)

---

## 🎯 Testing Webhooks

### 1. Local Testing with webhook.site

```bash
# Get temporary webhook URL
open https://webhook.site

# Update syndication site with webhook URL
psql -c "UPDATE syndication_sites
  SET webhook_url = 'https://webhook.site/YOUR-UNIQUE-ID'
  WHERE slug = 'justicehub'"

# Trigger consent creation
# Check webhook.site for delivery
```

### 2. Manual Webhook Test

```typescript
// scripts/test-webhook-delivery.ts
import { sendWebhook } from '@/lib/services/webhook-service'

const result = await sendWebhook({
  siteId: 'f5f0ed14-b3d0-4fe2-b6db-aaa4701c94ab',
  eventType: 'consent.created',
  payload: {
    consentId: 'test-123',
    storyId: 'story-456',
    status: 'approved'
  },
  tenantId: 'tenant-789'
})

console.log('Webhook delivery:', result)
```

### 3. End-to-End Test

```bash
# 1. Create consent (should trigger webhook)
curl -X POST http://localhost:3030/api/syndication/consent \
  -H "Content-Type: application/json" \
  -d '{"storyId":"xxx","siteSlug":"justicehub"}'

# 2. Check webhook_deliveries table
psql -c "SELECT * FROM webhook_deliveries ORDER BY created_at DESC LIMIT 1"

# 3. Verify delivery status
psql -c "SELECT status, http_status_code, response_body
  FROM webhook_deliveries WHERE id = 'xxx'"
```

---

## 📋 Implementation Steps

### Phase 1: Database & Service (1-2 hours)
1. Create `webhook_deliveries` table migration
2. Implement `webhook-service.ts` with core functions
3. Add webhook signature generation and verification
4. Test service functions in isolation

### Phase 2: Inngest Integration (1 hour)
1. Create `webhook-jobs.ts` with send and retry functions
2. Register functions in `src/lib/inngest/functions/index.ts`
3. Test Inngest job triggering locally
4. Verify retry mechanism works

### Phase 3: API Integration (30 minutes)
1. Add webhook triggers to consent creation endpoint
2. Add webhook triggers to consent revocation endpoint
3. Test end-to-end flow with webhook.site
4. Verify signatures are correct

### Phase 4: Dashboard UI (1 hour) - Optional
1. Create `WebhookDeliveryList.tsx` component
2. Show webhook history in syndication dashboard
3. Display delivery status (sent, failed, retrying)
4. Add retry button for failed webhooks

---

## 🚨 Edge Cases to Handle

1. **Site webhook_url is NULL:** Skip webhook delivery gracefully
2. **Webhook endpoint is down:** Retry with exponential backoff
3. **Webhook returns 4xx error:** Log error, don't retry (client error)
4. **Webhook returns 5xx error:** Retry (server error)
5. **Webhook takes >10s to respond:** Timeout and retry
6. **Site secret changes:** Old webhooks become unverifiable (document rotation process)

---

## 🔗 Related Documentation

- [SYNDICATION_CONSENT_COMPLETE.md](../../../SYNDICATION_CONSENT_COMPLETE.md) - Phase 2 implementation
- [docs/08-integrations/](../../../docs/08-integrations/) - JusticeHub integration
- Inngest docs: https://www.inngest.com/docs

---

## 📊 Success Metrics

**After implementation:**
- ✅ Webhooks sent within 1 second of consent change
- ✅ 99% delivery success rate (with retries)
- ✅ Failed webhooks retried 3 times with backoff
- ✅ Storytellers can see webhook delivery status in dashboard
- ✅ External sites receive valid HMAC signatures
- ✅ No webhooks sent for NULL webhook_url sites

---

**Remember:** Webhooks are how we respect external systems. Reliable delivery = trustworthy platform.

🌾 **"Every webhook is a promise kept. Every retry is us honoring our commitment to transparency."**
