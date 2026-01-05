# End-to-End Testing Guide: Syndication System

**Purpose**: Comprehensive testing checklist for the syndication system
**Status**: Ready for execution
**Estimated Time**: 2-3 hours

---

## Prerequisites

### 1. Environment Setup
```bash
# Verify environment variables
echo $DATABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
echo $INNGEST_EVENT_KEY
echo $WEBHOOK_SECRET
echo $NEXT_PUBLIC_SUPABASE_URL
```

### 2. Database Deployed
```bash
# Check tables exist
psql $DATABASE_URL -c "\dt syndication_*"

# Check sites seeded
psql $DATABASE_URL -c "SELECT slug, name, status FROM syndication_sites;"
```

### 3. Application Running
```bash
# Start dev server
npm run dev

# Or production build
npm run build && npm start
```

---

## Test Suite 1: Database & Schema

### Test 1.1: Tables Exist
```bash
psql $DATABASE_URL -c "
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'syndication_%'
ORDER BY table_name;
"
```

**Expected**: 9 tables listed
- syndication_consent
- syndication_engagement_events
- syndication_sites
- syndication_webhook_events
- story_distributions
- embed_tokens
- revenue_attributions
- storyteller_payouts
- media_vision_analysis

### Test 1.2: RLS Policies Active
```bash
psql $DATABASE_URL -c "
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('syndication_consent', 'syndication_sites', 'embed_tokens')
ORDER BY tablename, policyname;
"
```

**Expected**: Multiple policies per table

### Test 1.3: Foreign Keys Valid
```bash
psql $DATABASE_URL -c "
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name LIKE 'syndication_%'
ORDER BY tc.table_name;
"
```

**Expected**: All foreign keys reference existing tables

---

## Test Suite 2: Token Generation & Validation

### Test 2.1: Generate Token for Story
```typescript
// File: scripts/test-token-generation.ts
import { createClient } from '@/lib/supabase/server'
import { createEmbedToken } from '@/lib/services/embed-token-service'

async function testTokenGeneration() {
  const supabase = await createClient()

  // 1. Create test consent
  const { data: consent } = await supabase
    .from('syndication_consent')
    .insert({
      story_id: 'YOUR-STORY-ID',
      site_id: 'YOUR-SITE-ID',
      storyteller_id: 'YOUR-USER-ID',
      tenant_id: 'YOUR-TENANT-ID',
      status: 'approved',
      approved_at: new Date().toISOString()
    })
    .select()
    .single()

  // 2. Generate token
  const { token, error } = await createEmbedToken({
    consentId: consent.id,
    storyId: consent.story_id,
    siteId: consent.site_id
  })

  console.log('Token generated:', token)
  return token
}
```

**Run**:
```bash
DOTENV_CONFIG_PATH=.env.local NODE_OPTIONS='--require dotenv/config' npx tsx scripts/test-token-generation.ts
```

**Expected**:
- Token created successfully
- Token is 32-byte random string
- Expiration set to 30 days from now

### Test 2.2: Validate Token
```typescript
// scripts/test-token-validation.ts
import { validateEmbedToken } from '@/lib/services/embed-token-service'

async function testTokenValidation() {
  const tokenString = 'YOUR-TOKEN-FROM-2.1'

  const validation = await validateEmbedToken(tokenString, {
    checkDomain: 'https://justicehub.org.au',
    incrementUsage: true
  })

  console.log('Validation result:', validation)
}
```

**Expected**:
- `valid: true`
- Token details returned
- `requestsUsed` incremented by 1

### Test 2.3: Validate Revoked Token
```typescript
// scripts/test-token-revocation.ts
import { revokeEmbedToken, validateEmbedToken } from '@/lib/services/embed-token-service'

async function testRevocation() {
  const tokenId = 'YOUR-TOKEN-ID'

  // Revoke
  const { success } = await revokeEmbedToken(tokenId, 'Testing revocation')
  console.log('Revoked:', success)

  // Try to validate (should fail)
  const validation = await validateEmbedToken('YOUR-TOKEN-STRING')
  console.log('Validation after revoke:', validation)
}
```

**Expected**:
- Revocation succeeds
- Validation returns `valid: false`
- Error: "Token has been revoked"

---

## Test Suite 3: Content Access API

### Test 3.1: Fetch Story with Valid Token
```bash
# Set variables
STORY_ID="your-story-id"
TOKEN="your-embed-token"
API_URL="http://localhost:3000"

# Request
curl -X GET \
  "$API_URL/api/syndication/content/$STORY_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: https://justicehub.org.au" \
  | jq '.'
```

**Expected Response**:
```json
{
  "story": {
    "id": "...",
    "title": "...",
    "content": "...",
    "excerpt": "...",
    "themes": ["..."],
    "storyteller": { ... },
    "mediaAssets": [ ... ]
  },
  "attribution": {
    "platform": "Empathy Ledger",
    "url": "https://empathyledger.com/stories/...",
    "message": "..."
  },
  "permissions": {
    "canEmbed": true,
    "canModify": false,
    "mustAttribution": true,
    "revocable": true
  }
}
```

### Test 3.2: Fetch with Invalid Token
```bash
curl -X GET \
  "$API_URL/api/syndication/content/$STORY_ID" \
  -H "Authorization: Bearer invalid-token" \
  | jq '.'
```

**Expected**:
- Status: 401 Unauthorized
- Error: "Token not found" or "Invalid token"

### Test 3.3: Fetch Sacred Content
```bash
# First, mark a story as sacred
psql $DATABASE_URL -c "
UPDATE stories
SET cultural_permission_level = 'sacred'
WHERE id = '$STORY_ID';
"

# Then try to fetch
curl -X GET \
  "$API_URL/api/syndication/content/$STORY_ID" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

**Expected**:
- Status: 403 Forbidden
- Error: "Sacred content cannot be syndicated"

### Test 3.4: Verify Engagement Logging
```bash
# After Test 3.1, check engagement events
psql $DATABASE_URL -c "
SELECT
  event_type,
  story_id,
  site_id,
  event_timestamp
FROM syndication_engagement_events
WHERE story_id = '$STORY_ID'
ORDER BY event_timestamp DESC
LIMIT 5;
"
```

**Expected**:
- At least 1 'view' event logged
- Correct story_id and site_id

---

## Test Suite 4: Revocation API

### Test 4.1: Revoke Story from Single Site
```bash
curl -X POST \
  "$API_URL/api/syndication/revoke" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "storyId": "'$STORY_ID'",
    "siteIds": ["'$SITE_ID'"],
    "reason": "Testing revocation workflow"
  }' \
  | jq '.'
```

**Expected Response**:
```json
{
  "success": true,
  "storyId": "...",
  "storyTitle": "...",
  "revokedAt": "...",
  "results": [
    {
      "siteId": "...",
      "siteName": "JusticeHub",
      "status": "notified",
      "webhookDelivered": true
    }
  ],
  "stats": {
    "total": 1,
    "successful": 1,
    "pending": 0,
    "failed": 0
  }
}
```

### Test 4.2: Verify Token Revocation
```bash
# Check token status in database
psql $DATABASE_URL -c "
SELECT
  id,
  is_revoked,
  revoked_at,
  revoked_reason
FROM embed_tokens
WHERE story_id = '$STORY_ID'
  AND site_id = '$SITE_ID';
"
```

**Expected**:
- `is_revoked = true`
- `revoked_at` timestamp present
- `revoked_reason` = "Storyteller requested removal"

### Test 4.3: Verify Distribution Status
```bash
psql $DATABASE_URL -c "
SELECT
  status,
  updated_at
FROM story_distributions
WHERE story_id = '$STORY_ID'
  AND site_id = '$SITE_ID';
"
```

**Expected**:
- `status = 'pending_removal'`
- `updated_at` recent timestamp

---

## Test Suite 5: Webhook Delivery

### Test 5.1: Check Webhook Event Logged
```bash
psql $DATABASE_URL -c "
SELECT
  id,
  event_type,
  status,
  http_status_code,
  sent_at,
  delivered_at
FROM syndication_webhook_events
WHERE story_id = '$STORY_ID'
ORDER BY created_at DESC
LIMIT 1;
"
```

**Expected**:
- `event_type = 'content_revoked'`
- `status = 'pending'` or `'delivered'`
- `sent_at` timestamp present

### Test 5.2: Mock Webhook Receiver
```typescript
// File: scripts/mock-webhook-receiver.ts
import express from 'express'
import crypto from 'crypto'

const app = express()
app.use(express.json())

app.post('/api/webhooks/empathy-ledger', (req, res) => {
  const signature = req.headers['x-empathy-ledger-signature']
  const payload = req.body

  // Verify signature
  const secret = process.env.WEBHOOK_SECRET!
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' })
  }

  console.log('Webhook received:', payload)
  res.json({ success: true })
})

app.listen(4000, () => {
  console.log('Mock webhook receiver running on http://localhost:4000')
})
```

**Run**:
```bash
npx tsx scripts/mock-webhook-receiver.ts
```

**Test**:
Trigger revocation again and verify webhook is received

---

## Test Suite 6: Inngest Jobs

### Test 6.1: Trigger Revocation Event
```typescript
// scripts/test-inngest-revocation.ts
import { inngest } from '@/lib/inngest/client'

await inngest.send({
  name: 'syndication/content.revoked',
  data: {
    storyId: 'YOUR-STORY-ID',
    siteIds: ['YOUR-SITE-ID'],
    reason: 'Testing Inngest job'
  }
})

console.log('Event sent to Inngest')
```

**Verify**:
1. Check Inngest dashboard: https://app.inngest.com
2. Look for `processContentRevocation` run
3. Check webhook delivery logs

### Test 6.2: Verify Removal Verification Job
**Wait 1 minute after Test 6.1**

Check Inngest dashboard for `verifyContentRemoval` run

**Expected**:
- Job runs automatically 1 minute after revocation
- Attempts HEAD request to external site
- Updates verification status in database

### Test 6.3: Test Retry Logic
```bash
# Mark a webhook as failed
psql $DATABASE_URL -c "
UPDATE syndication_webhook_events
SET
  status = 'failed',
  retry_count = 1,
  next_retry_at = NOW() - INTERVAL '1 minute'
WHERE id = 'YOUR-WEBHOOK-EVENT-ID';
"
```

**Wait 5 minutes** for cron job to run

**Verify**:
```bash
psql $DATABASE_URL -c "
SELECT
  status,
  retry_count,
  next_retry_at
FROM syndication_webhook_events
WHERE id = 'YOUR-WEBHOOK-EVENT-ID';
"
```

**Expected**:
- `retry_count` incremented
- `next_retry_at` calculated with exponential backoff

---

## Test Suite 7: UI Components

### Test 7.1: Story Connections Dashboard
1. Navigate to `/syndication-poc`
2. Click "Dashboard" tab
3. Verify:
   - ✓ Mock connections display
   - ✓ Status badges show (Active, Removing, Removed)
   - ✓ Engagement metrics visible
   - ✓ "Stop Sharing" button present
   - ✓ Clicking "Stop Sharing" shows confirmation modal

### Test 7.2: Share Your Story Modal
1. Click "Try: Share Regular Story" button
2. Verify:
   - ✓ Modal opens with site list
   - ✓ Cultural markers displayed
   - ✓ "What happens when you share" section visible
   - ✓ Can select multiple sites
   - ✓ "Share with X communities" button updates count
   - ✓ "Show more about each community" toggle works

### Test 7.3: Sacred Content Block
1. Click "Try: Share Sacred Story (Will Block)" button
2. Verify:
   - ✓ Sacred content warning displays
   - ✓ Orange/ochre color scheme (not red)
   - ✓ Explanation about Elder approval
   - ✓ Cannot proceed to share

### Test 7.4: Removal Progress Tracker
1. Click "Simulate Story Removal" button
2. Verify:
   - ✓ Progress bar appears
   - ✓ Per-site status cards display
   - ✓ Status transitions: Pending → Notifying → Verifying → Complete
   - ✓ Overall progress percentage updates
   - ✓ Success message appears when complete

---

## Test Suite 8: Cultural Safety

### Test 8.1: Sacred Content Cannot Be Shared
```bash
# Create sacred story
psql $DATABASE_URL -c "
UPDATE stories
SET cultural_permission_level = 'sacred'
WHERE id = '$STORY_ID';
"

# Try to create consent (should succeed)
# But token generation should fail or API should block
```

**Expected**: API returns 403 when trying to access

### Test 8.2: Elder Approval Required
```bash
# Mark story as requiring Elder approval
psql $DATABASE_URL -c "
UPDATE syndication_consent
SET requires_elder_approval = true,
    elder_approved = false
WHERE story_id = '$STORY_ID';
"
```

**Try to generate token**: Should fail or require Elder approval workflow

### Test 8.3: Cultural Markers Visibility
1. Create story with cultural markers
2. View in "Share Your Story" modal
3. Verify cultural markers displayed as badges

---

## Test Suite 9: Performance

### Test 9.1: API Response Time
```bash
# Test Content Access API speed
time curl -X GET \
  "$API_URL/api/syndication/content/$STORY_ID" \
  -H "Authorization: Bearer $TOKEN" \
  > /dev/null 2>&1
```

**Expected**: < 200ms

### Test 9.2: Token Validation Speed
```bash
# Run multiple validations
for i in {1..10}; do
  time curl -X GET \
    "$API_URL/api/syndication/content/$STORY_ID" \
    -H "Authorization: Bearer $TOKEN" \
    > /dev/null 2>&1
done
```

**Expected**: Consistent < 200ms

### Test 9.3: Database Query Performance
```bash
# Check query plans
psql $DATABASE_URL -c "
EXPLAIN ANALYZE
SELECT * FROM embed_tokens
WHERE token = 'some-token'
  AND is_revoked = false
  AND expires_at > NOW();
"
```

**Expected**: Index scan (not seq scan)

---

## Test Suite 10: Integration Testing

### Test 10.1: End-to-End Happy Path
1. Storyteller creates story
2. External site requests consent
3. Storyteller approves in dashboard
4. Token generated automatically
5. External site fetches story
6. Story displays correctly
7. Engagement tracked
8. Storyteller sees metrics

**All steps should succeed**

### Test 10.2: End-to-End Revocation
1. Storyteller clicks "Stop Sharing"
2. Tokens revoked immediately
3. Webhook sent within 30 seconds
4. External site receives webhook
5. External site removes story
6. Verification confirms removal (< 5 minutes)
7. Subsequent fetches return 404

**All steps should succeed within 5 minutes**

---

## Success Criteria

### Must Pass
- ✅ All database tables exist
- ✅ RLS policies active
- ✅ Token generation works
- ✅ Token validation works
- ✅ Content Access API returns stories
- ✅ Revocation API invalidates tokens
- ✅ Webhooks delivered successfully
- ✅ Inngest jobs run correctly
- ✅ Sacred content blocked
- ✅ UI components render correctly

### Performance Targets
- ✅ API response < 200ms
- ✅ Webhook delivery < 30 seconds
- ✅ Revocation complete < 5 minutes

### Cultural Safety
- ✅ Sacred stories cannot be shared without Elder approval
- ✅ Cultural markers displayed before sharing
- ✅ Elder authority respected in UI

---

## Troubleshooting

### Issue: Token Validation Fails
**Check**:
1. Token exists in database
2. Token not revoked
3. Token not expired
4. Domain in allowed_domains list

### Issue: Webhook Not Delivered
**Check**:
1. Inngest event triggered
2. Webhook URL correct
3. HMAC signature valid
4. External endpoint accessible

### Issue: Engagement Not Logged
**Check**:
1. syndication_engagement_events table exists
2. Token validation includes incrementUsage
3. API has write permissions

---

## Next Steps After Testing

1. **If all tests pass**:
   - Proceed to Week 5: Storyteller UAT
   - Deploy to staging environment
   - Prepare demo for stakeholders

2. **If tests fail**:
   - Document failures
   - Fix critical issues
   - Re-run failed tests
   - Update documentation

3. **Production Readiness**:
   - Load testing (100+ concurrent requests)
   - Security audit
   - Performance optimization
   - Monitoring setup

---

**Testing Status**: Ready to execute
**Estimated Time**: 2-3 hours for complete test suite
**Prerequisites**: Database deployed, Inngest configured, app running
