# Quick Test Reference - Syndication Consent System

## 🚀 Quick Start (3 steps)

### 1. Get Your Auth Token (ONE TIME)
```bash
# Open http://localhost:3030
# Login as storyteller
# DevTools > Application > Cookies > localhost
# Copy the value of: sb-localhost-auth-token
```

### 2. Update Test Script
```bash
# Open: test-consent-manual.sh
# Replace: AUTH_TOKEN="YOUR_TOKEN_HERE"
# With your actual token
```

### 3. Run Tests
```bash
chmod +x test-consent-manual.sh
./test-consent-manual.sh
```

---

## 📋 Complete Test Checklist

### ✅ Phase 1: Auth Token (5 min)
- [ ] Browser open at http://localhost:3030
- [ ] Logged in as storyteller
- [ ] DevTools opened (F12 or Cmd+Option+I)
- [ ] Found cookie: `sb-localhost-auth-token`
- [ ] Copied token value
- [ ] Updated `test-consent-manual.sh` with real token

### ✅ Phase 2: Create Consent (2 min)
```bash
./test-consent-manual.sh
```
**Expected:** `{"success":true,"consent":{...},"embedToken":{...}}`

- [ ] Response shows `success: true`
- [ ] Consent object has `status: "approved"`
- [ ] Embed token generated
- [ ] Token starts with `embed_`

### ✅ Phase 3: Dashboard UI (5 min)
```bash
# Open: http://localhost:3030/syndication/dashboard
```

- [ ] Page loads without errors
- [ ] Stats show: "1 Active Distribution"
- [ ] "Active" tab shows Uncle Dale story
- [ ] Engagement metrics display (views/clicks/shares)
- [ ] "Stop Sharing" button visible

### ✅ Phase 4: Check Consent Status (1 min)
```bash
curl "http://localhost:3030/api/syndication/consent?storyId=de3f0fae-c4d4-4f19-8197-97a1ab8e56b1&siteSlug=justicehub" \
  -H "Cookie: sb-access-token=$AUTH_TOKEN"
```

**Expected:** `{"exists":true,"consent":{...}}`

- [ ] Returns `exists: true`
- [ ] Consent status is `approved`
- [ ] Site slug is `justicehub`

### ✅ Phase 5: Revoke Consent (2 min)

**First, get the consent ID from Phase 4 response**

```bash
CONSENT_ID="paste_id_here"

curl -X POST "http://localhost:3030/api/syndication/consent/$CONSENT_ID/revoke" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=$AUTH_TOKEN" \
  -d '{"reason":"Testing revocation flow"}'
```

**Expected:** `{"success":true,"consent":{"status":"revoked",...}}`

- [ ] Response shows `success: true`
- [ ] Status changed to `revoked`
- [ ] `revoked_at` timestamp present

### ✅ Phase 6: Verify Revocation (1 min)

**Check Dashboard:**
- [ ] Refresh http://localhost:3030/syndication/dashboard
- [ ] Stats show: "0 Active Distributions"
- [ ] "Active" tab is empty
- [ ] Story no longer visible

**Check API:**
```bash
curl "http://localhost:3030/api/syndication/consent?storyId=de3f0fae-c4d4-4f19-8197-97a1ab8e56b1&siteSlug=justicehub" \
  -H "Cookie: sb-access-token=$AUTH_TOKEN"
```
- [ ] Returns consent with `status: "revoked"`

### ✅ Phase 7: Database Verification (2 min)

```bash
# Connect to database
PGPASSWORD=kedxah-qaxsap-jUhwo5 psql \
  -h aws-1-ap-southeast-2.pooler.supabase.com \
  -p 6543 \
  -U postgres.yvnuayzslukamizrlhwb \
  -d postgres
```

```sql
-- View consent record
SELECT
  id,
  status,
  approved_at,
  revoked_at,
  story_id,
  site_id
FROM syndication_consent
WHERE story_id = 'de3f0fae-c4d4-4f19-8197-97a1ab8e56b1'
ORDER BY created_at DESC
LIMIT 1;

-- View embed token (should be revoked)
SELECT
  token,
  status,
  revoked_at
FROM embed_tokens
WHERE consent_id = 'consent_id_from_above';
```

- [ ] Consent exists with `status = 'revoked'`
- [ ] `revoked_at` timestamp populated
- [ ] Embed token status is `revoked`

---

## 🔁 Full Cycle Test (Create → Revoke → Create Again)

### Round 1: Create
```bash
./test-consent-manual.sh
```
- [ ] Success response
- [ ] Dashboard shows 1 active

### Round 2: Revoke
```bash
# Get consent ID from Round 1
CONSENT_ID="..."
curl -X POST "http://localhost:3030/api/syndication/consent/$CONSENT_ID/revoke" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=$AUTH_TOKEN" \
  -d '{"reason":"Testing full cycle"}'
```
- [ ] Success response
- [ ] Dashboard shows 0 active

### Round 3: Create Again
```bash
./test-consent-manual.sh
```
- [ ] Success response (new consent created)
- [ ] Dashboard shows 1 active again
- [ ] New consent ID (different from Round 1)

---

## 🐛 Troubleshooting

### Problem: "Unauthorized" error
**Solution:** Your auth token expired
```bash
# 1. Log out from http://localhost:3030
# 2. Log back in
# 3. Get fresh token from DevTools
# 4. Update test-consent-manual.sh
```

### Problem: "Consent already exists"
**Solution:** Delete existing consent first
```sql
-- Connect to database
DELETE FROM syndication_consent
WHERE story_id = 'de3f0fae-c4d4-4f19-8197-97a1ab8e56b1'
AND site_id = (SELECT id FROM syndication_sites WHERE slug = 'justicehub');
```

### Problem: Dashboard shows "No consents found"
**Solution:** Check database directly
```sql
SELECT COUNT(*) FROM syndication_consent WHERE status = 'approved';
```

### Problem: "Story not found"
**Solution:** Verify Uncle Dale story exists
```sql
SELECT id, title FROM stories WHERE id = 'de3f0fae-c4d4-4f19-8197-97a1ab8e56b1';
```

---

## 📊 Expected Results Summary

| Test | Expected Result | Time |
|------|----------------|------|
| Get Auth Token | Long JWT string starting with `eyJ` | 2 min |
| Create Consent | `{"success":true,...}` | 1 min |
| Dashboard Load | Shows 1 Active Distribution | 1 min |
| Check Status | `{"exists":true,...}` | 30 sec |
| Revoke Consent | `{"success":true,...}` | 1 min |
| Verify Revocation | Dashboard shows 0 Active | 30 sec |
| Database Check | Consent status = 'revoked' | 1 min |
| **Total** | **All tests pass** | **~7 min** |

---

## 🎯 Success Criteria

✅ **System is working if:**
1. Consent creation succeeds without errors
2. Dashboard displays consent and engagement metrics
3. Revocation immediately updates dashboard
4. Database reflects all status changes
5. Can create → revoke → create again successfully

❌ **System has issues if:**
- 401 errors (auth problem)
- 404 errors (story/site not found)
- 409 errors (duplicate consent when shouldn't be)
- Dashboard doesn't update after revocation
- Database shows incorrect status

---

## 📖 Related Files

- [GET_AUTH_TOKEN_INSTRUCTIONS.md](GET_AUTH_TOKEN_INSTRUCTIONS.md) - Detailed auth token guide
- [test-consent-manual.sh](test-consent-manual.sh) - Automated test script
- [SYNDICATION_CONSENT_SYSTEM_COMPLETE.md](SYNDICATION_CONSENT_SYSTEM_COMPLETE.md) - Full system documentation
- [docs/05-features/SYNDICATION_CONSENT_API.md](docs/05-features/SYNDICATION_CONSENT_API.md) - API reference

---

## 🚀 Next Steps After Testing

Once all tests pass:
- [ ] Add consent checkbox to ShareYourStoryModal
- [ ] Add email notifications on consent requests
- [ ] Build elder approval workflow UI
- [ ] Add webhook notifications to JusticeHub on revocation
- [ ] Implement revenue tracking dashboard

**For now:** Just verify the core system works end-to-end!
