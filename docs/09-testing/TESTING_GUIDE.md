# JusticeHub Syndication - Testing Guide

**Date:** January 4, 2026
**Status:** Ready to test
**Estimated Time:** 15-20 minutes

---

## 📋 Pre-Flight Checklist

Before testing, ensure:
- ✅ Schema fixes applied to `embed-token-service.ts`
- ✅ Content access API fixed for Next.js 15
- ✅ Test token exists in database
- ✅ Test story exists and is public
- ✅ Syndication consent created

**All prerequisites are DONE!** ✅

---

## 🚀 Step 1: Start Dev Server

If your dev server isn't running, start it:

```bash
npm run dev
```

**Expected Output:**
```
> next dev
✓ Ready in 2.3s
○ Local:        http://localhost:3030
```

**Verify it's running:**
```bash
curl http://localhost:3030
```

Should return HTML (the homepage).

---

## 🧪 Step 2: Test Token Validation

### Test Data We're Using:

**Story:**
- ID: `de3f0fae-c4d4-4f19-8197-97a1ab8e56b1`
- Title: "Building a Healing Path: Uncle Dale's Vision for Youth Justice Reform"
- Status: Published ✅
- Public: Yes ✅

**Token:**
- Token: `vpbwkc7KI6es3VdN9Cemc7C+jbeURSQdtbRcjOThKKU=`
- Status: active ✅
- Expires: 2026-02-03 (30 days) ✅
- Domains: justicehub.org.au, www.justicehub.org.au ✅

### Test Command:

```bash
curl -X GET 'http://localhost:3030/api/syndication/content/de3f0fae-c4d4-4f19-8197-97a1ab8e56b1' \
  -H 'Authorization: Bearer vpbwkc7KI6es3VdN9Cemc7C+jbeURSQdtbRcjOThKKU=' \
  -H 'Origin: https://justicehub.org.au' \
  -H 'Content-Type: application/json'
```

### Expected Response:

**Success (200 OK):**
```json
{
  "story": {
    "id": "de3f0fae-c4d4-4f19-8197-97a1ab8e56b1",
    "title": "Building a Healing Path: Uncle Dale's Vision for Youth Justice Reform",
    "content": "...",
    "excerpt": "...",
    "themes": [...],
    "createdAt": "...",
    "storyteller": {
      "id": "...",
      "displayName": "Uncle Dale",
      "avatarUrl": null
    },
    "mediaAssets": []
  },
  "attribution": {
    "platform": "Empathy Ledger",
    "url": "http://localhost:3030/stories/de3f0fae-c4d4-4f19-8197-97a1ab8e56b1",
    "message": "This story is shared with permission from the storyteller via Empathy Ledger."
  },
  "permissions": {
    "canEmbed": true,
    "canModify": false,
    "mustAttribution": true,
    "revocable": true
  }
}
```

### What This Tests:
- ✅ Token validation with correct schema
- ✅ Story fetch with service role client
- ✅ Domain checking works
- ✅ Attribution metadata returned
- ✅ Usage count incremented

---

## 🔍 Step 3: Verify Engagement Tracking

After the content access request, check if the engagement event was logged:

```bash
PGPASSWORD=kedxah-qaxsap-jUhwo5 psql \
  -h aws-1-ap-southeast-2.pooler.supabase.com \
  -p 6543 \
  -U postgres.yvnuayzslukamizrlhwb \
  -d postgres \
  -c "
SELECT
  event_type,
  event_timestamp,
  referrer,
  user_agent
FROM syndication_engagement_events
WHERE story_id = 'de3f0fae-c4d4-4f19-8197-97a1ab8e56b1'
ORDER BY event_timestamp DESC
LIMIT 5;
"
```

**Expected Output:**
```
event_type | event_timestamp              | referrer | user_agent
-----------+-----------------------------+----------+------------
view       | 2026-01-04 08:45:23.123+00  | null     | curl/...
```

### What This Tests:
- ✅ Engagement events logged correctly
- ✅ Event type tracked
- ✅ Timestamp recorded
- ✅ User agent captured

---

## 📊 Step 4: Check Token Usage Count

Verify the token's usage count was incremented:

```bash
PGPASSWORD=kedxah-qaxsap-jUhwo5 psql \
  -h aws-1-ap-southeast-2.pooler.supabase.com \
  -p 6543 \
  -U postgres.yvnuayzslukamizrlhwb \
  -d postgres \
  -c "
SELECT
  id,
  usage_count,
  last_used_at,
  last_used_domain
FROM embed_tokens
WHERE token = 'vpbwkc7KI6es3VdN9Cemc7C+jbeURSQdtbRcjOThKKU=';
"
```

**Expected Output:**
```
id                                   | usage_count | last_used_at                  | last_used_domain
-------------------------------------+-------------+-------------------------------+-------------------
63af6308-80f5-47c4-9f91-8c1abfdd7e4e | 4 (or more) | 2026-01-04 08:45:23.123+00   | justicehub.org.au
```

**Note:** usage_count should increase with each test!

### What This Tests:
- ✅ Usage tracking works
- ✅ Last used timestamp updates
- ✅ Last used domain tracked
- ✅ Schema fix successful

---

## 🚫 Step 5: Test Error Scenarios

### Test 5A: Invalid Token

```bash
curl -X GET 'http://localhost:3030/api/syndication/content/de3f0fae-c4d4-4f19-8197-97a1ab8e56b1' \
  -H 'Authorization: Bearer invalid-token-12345' \
  -H 'Origin: https://justicehub.org.au'
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "Token not found"
}
```

### Test 5B: Wrong Domain

```bash
curl -X GET 'http://localhost:3030/api/syndication/content/de3f0fae-c4d4-4f19-8197-97a1ab8e56b1' \
  -H 'Authorization: Bearer vpbwkc7KI6es3VdN9Cemc7C+jbeURSQdtbRcjOThKKU=' \
  -H 'Origin: https://malicious-site.com'
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "Domain not allowed"
}
```

### Test 5C: Missing Token

```bash
curl -X GET 'http://localhost:3030/api/syndication/content/de3f0fae-c4d4-4f19-8197-97a1ab8e56b1' \
  -H 'Origin: https://justicehub.org.au'
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "Missing authorization token"
}
```

---

## 🔒 Step 6: Test Revocation Flow

### Step 6A: Revoke the Token

```bash
PGPASSWORD=kedxah-qaxsap-jUhwo5 psql \
  -h aws-1-ap-southeast-2.pooler.supabase.com \
  -p 6543 \
  -U postgres.yvnuayzslukamizrlhwb \
  -d postgres \
  -c "
UPDATE embed_tokens
SET
  status = 'revoked',
  revoked_at = NOW(),
  revocation_reason = 'Testing revocation flow'
WHERE token = 'vpbwkc7KI6es3VdN9Cemc7C+jbeURSQdtbRcjOThKKU='
RETURNING id, status, revoked_at;
"
```

**Expected Output:**
```
id                                   | status  | revoked_at
-------------------------------------+---------+-------------------------------
63af6308-80f5-47c4-9f91-8c1abfdd7e4e | revoked | 2026-01-04 08:50:00.123+00
```

### Step 6B: Try to Access with Revoked Token

```bash
curl -X GET 'http://localhost:3030/api/syndication/content/de3f0fae-c4d4-4f19-8197-97a1ab8e56b1' \
  -H 'Authorization: Bearer vpbwkc7KI6es3VdN9Cemc7C+jbeURSQdtbRcjOThKKU=' \
  -H 'Origin: https://justicehub.org.au'
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "Token has been revoked"
}
```

### Step 6C: Restore Token (for further testing)

```bash
PGPASSWORD=kedxah-qaxsap-jUhwo5 psql \
  -h aws-1-ap-southeast-2.pooler.supabase.com \
  -p 6543 \
  -U postgres.yvnuayzslukamizrlhwb \
  -d postgres \
  -c "
UPDATE embed_tokens
SET
  status = 'active',
  revoked_at = NULL,
  revocation_reason = NULL
WHERE token = 'vpbwkc7KI6es3VdN9Cemc7C+jbeURSQdtbRcjOThKKU='
RETURNING id, status;
"
```

---

## 🎨 Step 7: Test with Different Story (Optional)

If you want to test with another story:

### Find a Published Story:

```bash
PGPASSWORD=kedxah-qaxsap-jUhwo5 psql \
  -h aws-1-ap-southeast-2.pooler.supabase.com \
  -p 6543 \
  -U postgres.yvnuayzslukamizrlhwb \
  -d postgres \
  -c "
SELECT id, title, status, is_public
FROM stories
WHERE status = 'published' AND is_public = true
LIMIT 5;
"
```

### Create Consent for New Story:

```bash
# Replace STORY_ID with the ID from above
PGPASSWORD=kedxah-qaxsap-jUhwo5 psql \
  -h aws-1-ap-southeast-2.pooler.supabase.com \
  -p 6543 \
  -U postgres.yvnuayzslukamizrlhwb \
  -d postgres \
  -c "
INSERT INTO syndication_consent (
  story_id,
  site_id,
  storyteller_id,
  tenant_id,
  status,
  approved_at
)
SELECT
  'STORY_ID'::uuid,
  'f5f0ed14-b3d0-4fe2-b6db-aaa4701c94ab'::uuid,
  '7380ee75-512c-41b6-9f17-416e3dbba302'::uuid,
  s.tenant_id,
  'approved',
  NOW()
FROM stories s
WHERE s.id = 'STORY_ID'
RETURNING id, story_id, status;
"
```

### Generate Token for New Story:

```bash
# Replace STORY_ID and TENANT_ID
PGPASSWORD=kedxah-qaxsap-jUhwo5 psql \
  -h aws-1-ap-southeast-2.pooler.supabase.com \
  -p 6543 \
  -U postgres.yvnuayzslukamizrlhwb \
  -d postgres \
  -c "
WITH generated_token AS (
  SELECT
    'STORY_ID'::uuid as story_id,
    'TENANT_ID'::uuid as tenant_id,
    encode(gen_random_bytes(32), 'base64') as token,
    encode(sha256(gen_random_bytes(32)::bytea), 'hex') as token_hash
)
INSERT INTO embed_tokens (
  story_id,
  tenant_id,
  token,
  token_hash,
  allowed_domains,
  status,
  expires_at
)
SELECT
  story_id,
  tenant_id,
  token,
  token_hash,
  ARRAY['justicehub.org.au']::text[],
  'active',
  NOW() + INTERVAL '30 days'
FROM generated_token
RETURNING id, story_id, token;
"
```

---

## ✅ Success Criteria

### All Tests Should Pass:

- ✅ Content access returns 200 with story data
- ✅ Engagement event logged in database
- ✅ Token usage count incremented
- ✅ Last used domain tracked
- ✅ Invalid token returns 401
- ✅ Wrong domain returns 401
- ✅ Revoked token returns 401
- ✅ Attribution metadata included
- ✅ No schema errors in logs

### Server Logs Should Show:

```
✓ Token validated successfully
✓ Story fetched: de3f0fae-c4d4-4f19-8197-97a1ab8e56b1
✓ Engagement event logged
✓ Usage count updated
```

**No errors like:**
- ❌ "column does not exist"
- ❌ "invalid type"
- ❌ "Token not found" (when using valid token)

---

## 🐛 Troubleshooting

### Problem: "Story not found"

**Possible Causes:**
1. Dev server not restarted after schema fix
2. Story doesn't exist or isn't public
3. Token validation failing silently

**Solution:**
```bash
# Restart dev server
npm run dev

# Verify story exists
PGPASSWORD=... psql -c "SELECT id, status, is_public FROM stories WHERE id = 'de3f0fae-c4d4-4f19-8197-97a1ab8e56b1';"
```

### Problem: "Token not found"

**Possible Causes:**
1. Token doesn't exist in database
2. Token expired
3. Schema mismatch in validation

**Solution:**
```bash
# Check token exists
PGPASSWORD=... psql -c "SELECT id, status, expires_at FROM embed_tokens WHERE token = 'vpbwkc7KI6es3VdN9Cemc7C+jbeURSQdtbRcjOThKKU=';"

# Check server logs for validation errors
```

### Problem: "Domain not allowed"

**Possible Causes:**
1. Origin header doesn't match allowed_domains
2. Domain checking too strict

**Solution:**
```bash
# Check allowed domains
PGPASSWORD=... psql -c "SELECT allowed_domains FROM embed_tokens WHERE token = 'vpbwkc7KI6es3VdN9Cemc7C+jbeURSQdtbRcjOThKKU=';"

# Should show: {justicehub.org.au,www.justicehub.org.au}

# Make sure Origin header matches one of these
```

### Problem: Server timeout/hang

**Possible Causes:**
1. Database connection slow
2. Infinite loop in validation
3. RLS blocking query

**Solution:**
```bash
# Check server logs
# Look for long-running queries
# Restart server if needed
```

---

## 📊 Test Results Template

Copy this and fill in your results:

```
# JusticeHub Syndication Test Results
Date: January 4, 2026
Tester: [Your name]

## Step 2: Token Validation
- [ ] Content access returns 200
- [ ] Story data complete
- [ ] Attribution included
- Notes:

## Step 3: Engagement Tracking
- [ ] Event logged in database
- [ ] Correct event_type
- [ ] Timestamp accurate
- Notes:

## Step 4: Usage Count
- [ ] usage_count incremented
- [ ] last_used_at updated
- [ ] last_used_domain tracked
- Notes:

## Step 5: Error Scenarios
- [ ] Invalid token → 401
- [ ] Wrong domain → 401
- [ ] Missing token → 401
- Notes:

## Step 6: Revocation
- [ ] Token revoked successfully
- [ ] Access denied after revocation
- [ ] Status = 'revoked'
- Notes:

## Overall Result
- [ ] All tests passed
- [ ] Ready for production
- Blockers: None / [List any]
```

---

## 🎉 Next Steps After Testing

Once all tests pass:

1. ✅ Mark Phase 2 as complete
2. 📝 Create consent API endpoint (next priority)
3. 🎨 Integrate ShareYourStoryModal with API
4. 📚 Write JusticeHub integration guide
5. 🚀 Deploy to staging for UAT

---

**Ready to test?** Start with Step 1 and work through each step. Let me know if anything fails!
