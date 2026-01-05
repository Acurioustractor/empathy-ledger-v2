# Syndication Consent API

**Status:** ✅ Implemented (January 5, 2026)

## Overview

The Consent API enables storytellers to grant permission for their stories to be syndicated to external sites (like JusticeHub). This implements OCAP principles - storytellers maintain full ownership and control over their content.

## Philosophy

- **Per-story, per-site consent** - No blanket approvals
- **Immediate revocation** - Storytellers can withdraw consent at any time
- **Cultural safety** - Optional elder approval workflow
- **Token-based access** - Consent automatically generates secure embed tokens
- **Full audit trail** - All consent grants/revocations are logged

## Endpoints

### 1. Create Consent

**Endpoint:** `POST /api/syndication/consent`

**Authentication:** Required (storyteller must be logged in)

**Request Body:**
```typescript
{
  storyId: string,              // UUID of the story
  siteSlug: string,             // Slug of target site (e.g., 'justicehub')
  permissions?: {               // Optional permission overrides
    allowFullContent?: boolean,   // Default: true
    allowExcerptOnly?: boolean,   // Default: false
    allowMediaAssets?: boolean,   // Default: true
    allowComments?: boolean,      // Default: false
    allowAnalytics?: boolean      // Default: true
  },
  expiresAt?: string,          // Optional ISO date for expiration
  requestReason?: string,       // Why sharing to this site
  culturalPermissionLevel?: 'public' | 'community' | 'restricted' | 'sacred',
  requiresElderApproval?: boolean  // Default: false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "consent": {
    "id": "uuid",
    "story_id": "uuid",
    "site_id": "uuid",
    "storyteller_id": "uuid",
    "organization_id": "uuid",
    "status": "approved",  // or "pending" if requires elder approval
    "approved_at": "2026-01-05T12:00:00Z",
    "allow_full_content": true,
    "allow_media_assets": true,
    "allow_analytics": true,
    "cultural_permission_level": "public",
    "created_at": "2026-01-05T12:00:00Z"
  },
  "embedToken": {  // Only if approved immediately
    "id": "uuid",
    "token": "embed_1704484800_abc123def456",
    "story_id": "uuid",
    "site_id": "uuid",
    "consent_id": "uuid",
    "status": "active",
    "allowed_domains": ["justicehub.org.au"],
    "usage_count": 0
  },
  "message": "Consent granted and embed token created"
}
```

**Error Responses:**
- `401 Unauthorized` - User not logged in
- `400 Bad Request` - Missing required fields
- `404 Not Found` - Story or site not found
- `403 Forbidden` - User is not the storyteller
- `409 Conflict` - Consent already exists for this story-site pair
- `500 Internal Server Error` - Database error

**Validations:**
1. ✅ User must be authenticated
2. ✅ Story must exist
3. ✅ User must be the storyteller (owns the story)
4. ✅ Story must belong to a project with an organization
5. ✅ Syndication site must exist and be active
6. ✅ No duplicate consent (one consent per story-site pair)

### 2. Check Consent Status

**Endpoint:** `GET /api/syndication/consent?storyId={uuid}&siteSlug={slug}`

**Authentication:** Required

**Query Parameters:**
- `storyId` - UUID of the story
- `siteSlug` - Slug of the syndication site

**Response (200 OK):**
```json
{
  "exists": true,
  "consent": {
    "id": "uuid",
    "story_id": "uuid",
    "site_id": "uuid",
    "status": "approved",
    "approved_at": "2026-01-05T12:00:00Z",
    "site": {
      "slug": "justicehub",
      "name": "JusticeHub"
    },
    "story": {
      "id": "uuid",
      "title": "Uncle Dale - Border Crossing"
    }
  }
}
```

**If no consent exists:**
```json
{
  "exists": false,
  "consent": null
}
```

### 3. Revoke Consent

**Endpoint:** `POST /api/syndication/consent/{consentId}/revoke`

**Authentication:** Required (storyteller must own the consent)

**Request Body:**
```typescript
{
  reason?: string  // Optional reason for revocation
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "consent": {
    "id": "uuid",
    "status": "revoked",
    "revoked_at": "2026-01-05T13:00:00Z"
  },
  "message": "Consent revoked successfully. External sites will no longer be able to access this story."
}
```

**What Happens on Revocation:**
1. ✅ Consent status changed to 'revoked'
2. ✅ All associated embed tokens invalidated
3. ✅ Revocation logged in access log
4. 🔴 TODO: Webhook notification sent to syndication site

**Error Responses:**
- `401 Unauthorized` - User not logged in
- `404 Not Found` - Consent not found
- `403 Forbidden` - User doesn't own this consent
- `400 Bad Request` - Consent already revoked

## Database Schema

### syndication_consent table

```sql
CREATE TABLE syndication_consent (
  id UUID PRIMARY KEY,

  -- Relationships
  story_id UUID NOT NULL REFERENCES stories(id),
  site_id UUID NOT NULL REFERENCES syndication_sites(id),
  storyteller_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),

  -- Consent Status
  status TEXT CHECK (status IN ('pending', 'approved', 'denied', 'revoked', 'expired')),
  approved_at TIMESTAMPTZ,
  denied_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Permissions
  allow_full_content BOOLEAN DEFAULT true,
  allow_excerpt_only BOOLEAN DEFAULT false,
  allow_media_assets BOOLEAN DEFAULT true,
  allow_comments BOOLEAN DEFAULT false,
  allow_analytics BOOLEAN DEFAULT true,

  -- Revenue
  revenue_share_percentage DECIMAL(5,2) DEFAULT 15.00,

  -- Cultural Safety
  requires_elder_approval BOOLEAN DEFAULT false,
  elder_approved BOOLEAN DEFAULT false,
  elder_approved_by UUID,
  elder_approved_at TIMESTAMPTZ,
  cultural_permission_level TEXT CHECK (cultural_permission_level IN ('public', 'community', 'restricted', 'sacred')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(story_id, site_id)
);
```

## Usage Examples

### 1. Grant Consent (via cURL - for testing)

```bash
# You need a valid auth token (get from browser DevTools > Application > Cookies)
AUTH_TOKEN="your_supabase_auth_token"

curl -X POST http://localhost:3030/api/syndication/consent \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=$AUTH_TOKEN" \
  -d '{
    "storyId": "de3f0fae-c4d4-4f19-8197-97a1ab8e56b1",
    "siteSlug": "justicehub",
    "permissions": {
      "allowFullContent": true,
      "allowMediaAssets": true,
      "allowAnalytics": true,
      "allowComments": false
    },
    "culturalPermissionLevel": "public",
    "requestReason": "Sharing Uncle Dale'\''s story with JusticeHub community",
    "requiresElderApproval": false
  }'
```

### 2. Check Consent Status

```bash
curl "http://localhost:3030/api/syndication/consent?storyId=de3f0fae-c4d4-4f19-8197-97a1ab8e56b1&siteSlug=justicehub" \
  -H "Cookie: sb-access-token=$AUTH_TOKEN"
```

### 3. Revoke Consent

```bash
CONSENT_ID="consent_uuid_here"

curl -X POST "http://localhost:3030/api/syndication/consent/$CONSENT_ID/revoke" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=$AUTH_TOKEN" \
  -d '{
    "reason": "Changed my mind about sharing this story"
  }'
```

### 4. Frontend Integration (React/TypeScript)

```typescript
// Create consent when storyteller clicks "Share to JusticeHub"
async function grantConsent(storyId: string) {
  const response = await fetch('/api/syndication/consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storyId,
      siteSlug: 'justicehub',
      permissions: {
        allowFullContent: true,
        allowMediaAssets: true,
        allowAnalytics: true
      },
      culturalPermissionLevel: 'public',
      requestReason: 'Sharing my story with the JusticeHub community'
    })
  })

  const data = await response.json()

  if (data.success) {
    console.log('Consent granted!', data.consent)
    console.log('Embed token:', data.embedToken.token)
  }
}

// Check if consent exists before showing "Share" button
async function checkConsent(storyId: string) {
  const response = await fetch(
    `/api/syndication/consent?storyId=${storyId}&siteSlug=justicehub`
  )
  const data = await response.json()

  return data.exists ? data.consent : null
}

// Revoke consent
async function revokeConsent(consentId: string) {
  const response = await fetch(`/api/syndication/consent/${consentId}/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reason: 'User requested revocation'
    })
  })

  const data = await response.json()
  return data.success
}
```

## Integration with ShareYourStoryModal

**Next Step:** Add consent creation to the story submission flow

```typescript
// In ShareYourStoryModal.tsx
// After story is created successfully:

if (shareToJusticeHub) {
  await fetch('/api/syndication/consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storyId: newStory.id,
      siteSlug: 'justicehub',
      culturalPermissionLevel: selectedPrivacyLevel,
      requestReason: 'Storyteller opted in during story creation'
    })
  })
}
```

## Testing

### Manual Testing Steps

1. **Get Auth Token:**
   - Log into Empathy Ledger at http://localhost:3030
   - Open DevTools > Application > Cookies
   - Copy the value of `sb-access-token` or `sb-localhost-auth-token`

2. **Create Consent:**
   ```bash
   AUTH_TOKEN="your_token_here"

   curl -X POST http://localhost:3030/api/syndication/consent \
     -H "Content-Type: application/json" \
     -H "Cookie: sb-access-token=$AUTH_TOKEN" \
     -d '{"storyId":"de3f0fae-c4d4-4f19-8197-97a1ab8e56b1","siteSlug":"justicehub"}'
   ```

3. **Verify in Database:**
   ```sql
   SELECT
     sc.id,
     sc.status,
     sc.approved_at,
     s.title AS story_title,
     ss.name AS site_name
   FROM syndication_consent sc
   JOIN stories s ON s.id = sc.story_id
   JOIN syndication_sites ss ON ss.id = sc.site_id
   WHERE sc.storyteller_id = 'your_user_id';
   ```

4. **Check Token Generated:**
   ```sql
   SELECT
     et.token,
     et.status,
     et.usage_count,
     et.created_at
   FROM embed_tokens et
   WHERE et.consent_id = 'consent_id_from_above';
   ```

## Current Status

### ✅ Completed
- [x] POST /api/syndication/consent endpoint
- [x] GET /api/syndication/consent endpoint
- [x] POST /api/syndication/consent/[id]/revoke endpoint
- [x] Automatic embed token generation on approval
- [x] Validation (auth, ownership, uniqueness)
- [x] Cultural safety fields (permission level, elder approval)
- [x] Database schema deployed to production

### 🟡 Next Steps
- [ ] Add UI checkbox to ShareYourStoryModal
- [ ] Build Syndication Dashboard (`/syndication/dashboard`)
- [ ] Display consent status on story detail pages
- [ ] Webhook notifications on revocation
- [ ] Elder approval workflow UI
- [ ] Analytics integration

### 🔴 Future Enhancements
- [ ] Batch consent creation
- [ ] Consent templates (pre-configured permission sets)
- [ ] Consent expiration reminders
- [ ] Revenue tracking integration
- [ ] Multi-site consent (one request, multiple sites)

## Related Documentation

- [Syndication System Overview](../03-architecture/SYNDICATION_ARCHITECTURE.md)
- [Embed Tokens Service](../../src/lib/services/embed-token-service.ts)
- [Content Access API](../05-features/SYNDICATION_CONTENT_API.md)
- [JusticeHub Integration](../08-integrations/JUSTICEHUB_INTEGRATION.md)

## Support

For questions or issues:
- Check database: `psql` and query `syndication_consent` table
- View logs: `pm2 logs empathy-ledger`
- Test endpoint: Use cURL examples above
- Frontend integration: See code examples in this doc
