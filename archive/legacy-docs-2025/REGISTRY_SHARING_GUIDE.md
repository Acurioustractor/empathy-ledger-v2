# Registry Sharing Guide

Complete guide for sharing stories to external registries (ACT Farm, JusticeHub, etc.)

## Overview

The Registry Sharing system allows super admins to share approved stories with external applications through a secure API. Stories are syndicated with proper consent management, cultural protocols, and audit trails.

## Architecture

```
Admin UI (Toggle) → Admin API → Database (Consent) → Public Registry API → External Apps
```

### Key Components

1. **Admin UI** - Registry Sharing toggle in story detail view
2. **Admin API** - `/api/admin/story-sharing` (toggle consent)
3. **Public API** - `/api/registry` (fetch syndicated stories)
4. **Database** - Consent tracking, audit logs, registry configuration

## Setup Instructions

### Step 1: Create ACT Farm External Application

Run the setup script to create the ACT Farm registry entry and generate an API key:

```bash
node scripts/data-management/setup-act-farm-registry.js
```

This will:
- ✅ Create `act_farm` entry in `external_applications` table
- ✅ Generate a secure API key (`el_...`)
- ✅ Configure allowed story types
- ✅ Verify the setup

**Save the API key** - it's shown only once!

### Step 2: Add API Key to Environment

Add the generated API key to your `.env.local`:

```env
# ACT Farm Registry API Key
ACT_FARM_REGISTRY_TOKEN=el_abc123...
```

### Step 3: Share Stories from Admin Panel

1. Navigate to https://empathy-ledger-v2.vercel.app/admin/stories
2. Log in with a super admin account
3. Click **View** on a story
4. In the right column, find **Registry Sharing**
5. Toggle **Share to ACT Farm** on

If you don't see the Registry Sharing card, you're not logged in as a super admin.

### Step 4: Test the Registry API

Test the public registry endpoint with your API key:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://empathy-ledger-v2.vercel.app/api/registry?limit=5
```

Expected response:

```json
{
  "items": [
    {
      "id": "uuid",
      "type": "story",
      "title": "Story Title",
      "summary": "Brief summary (max 260 chars)...",
      "image_url": "https://...",
      "canonical_url": null,
      "tags": ["theme1", "theme2"],
      "status": "published",
      "published_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## API Reference

### Admin API - Toggle Sharing

**Endpoint**: `POST /api/admin/story-sharing`

**Authentication**: Super admin only

**Request Body**:

```json
{
  "storyId": "uuid",
  "appName": "act_farm",
  "shareMedia": true
}
```

**Response**:

```json
{
  "success": true,
  "consent": {
    "id": "uuid",
    "story_id": "uuid",
    "app_id": "uuid",
    "consent_granted": true,
    "share_summary_only": true,
    "share_media": true,
    "share_attribution": true
  }
}
```

### Public Registry API

**Endpoint**: `GET /api/registry`

**Authentication**: Bearer token or X-API-Key header

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 40 | Max items (1-100) |
| `offset` | number | 0 | Pagination offset |
| `type` | string | - | Filter by story type |

**Headers**:

```
Authorization: Bearer <token>
```

Or:

```
X-API-Key: <token>
```

**Response**:

```json
{
  "items": [
    {
      "id": "story-uuid",
      "type": "story",
      "title": "Story Title",
      "summary": "Truncated summary (max 260 chars)",
      "image_url": "https://storage.url/image.jpg",
      "canonical_url": null,
      "tags": ["theme1", "theme2"],
      "status": "published",
      "published_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Error Responses**:

```json
// 401 - Missing token
{ "error": "Missing authorization token" }

// 401 - Invalid token
{ "error": "Invalid or expired token" }

// 500 - Server error
{ "error": "Failed to fetch syndicated stories." }
```

## Database Schema

### external_applications

Registry configuration for external apps.

```sql
CREATE TABLE external_applications (
  id UUID PRIMARY KEY,
  app_name TEXT UNIQUE NOT NULL,           -- 'act_farm'
  app_display_name TEXT NOT NULL,          -- 'ACT Farm'
  app_description TEXT,
  api_key_hash TEXT NOT NULL,              -- API key for auth
  allowed_story_types TEXT[],              -- Filter story types
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### story_syndication_consent

Tracks consent for sharing stories with external apps.

```sql
CREATE TABLE story_syndication_consent (
  id UUID PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES stories(id),
  storyteller_id UUID NOT NULL REFERENCES profiles(id),
  app_id UUID NOT NULL REFERENCES external_applications(id),

  -- Consent
  consent_granted BOOLEAN DEFAULT false,
  consent_granted_at TIMESTAMPTZ,
  consent_revoked_at TIMESTAMPTZ,
  consent_expires_at TIMESTAMPTZ,

  -- Sharing settings
  share_full_content BOOLEAN DEFAULT false,
  share_summary_only BOOLEAN DEFAULT true,
  share_media BOOLEAN DEFAULT false,
  share_attribution BOOLEAN DEFAULT true,
  anonymous_sharing BOOLEAN DEFAULT false,

  -- Cultural protocols
  requires_cultural_approval BOOLEAN DEFAULT false,
  cultural_approval_status TEXT,
  cultural_approver_id UUID,
  cultural_restrictions JSONB,

  UNIQUE(story_id, app_id)
);
```

### syndicated_stories (View)

Read-only view of stories available for syndication.

```sql
CREATE VIEW syndicated_stories AS
SELECT
  s.id AS story_id,
  s.title,
  CASE
    WHEN ssc.share_full_content THEN s.content
    ELSE s.summary
  END AS content,
  CASE
    WHEN ssc.share_attribution THEN p.display_name
    ELSE 'Anonymous Storyteller'
  END AS storyteller_name,
  s.story_type,
  s.themes,
  s.created_at AS story_date,
  ea.id AS app_id,
  ea.app_name AS requesting_app,
  ssc.share_media
FROM stories s
JOIN story_syndication_consent ssc ON s.id = ssc.story_id
JOIN external_applications ea ON ssc.app_id = ea.id
JOIN profiles p ON s.storyteller_id = p.id
WHERE
  ssc.consent_granted = true
  AND (ssc.consent_expires_at IS NULL OR ssc.consent_expires_at > now())
  AND ssc.consent_revoked_at IS NULL
  AND ea.is_active = true;
```

## Adding New External Applications

To add another registry (e.g., JusticeHub, Harvest):

1. **Create database entry**:

```sql
INSERT INTO external_applications (
  app_name,
  app_display_name,
  app_description,
  api_key_hash,
  allowed_story_types
) VALUES (
  'justicehub',
  'JusticeHub',
  'Legal advocacy and justice reinvestment platform',
  'el_generate_secure_key_here',
  ARRAY['testimony', 'case_study', 'advocacy', 'impact']
);
```

2. **Update Admin UI** ([src/app/admin/stories/page.tsx:889-916](src/app/admin/stories/page.tsx#L889-L916)):

Add another toggle for the new registry:

```tsx
<div className="flex items-center justify-between gap-4">
  <div>
    <p className="text-sm font-medium">Share to JusticeHub</p>
    <p className="text-xs text-grey-600">
      Publishes to legal advocacy registry
    </p>
  </div>
  <Switch
    checked={shareToJusticeHub}
    onCheckedChange={(val) => handleShareToggle(val, 'justicehub')}
  />
</div>
```

3. **Update API handler** to support multiple app names in parallel.

## Security & Privacy

### Authentication

- All registry API calls require valid Bearer token or API key
- Tokens are validated against `external_applications.api_key_hash`
- Failed auth returns 401 Unauthorized

### Consent Management

- Stories only appear if `consent_granted = true`
- Consent can be revoked anytime (sets `consent_revoked_at`)
- Consent can expire (checks `consent_expires_at`)
- Cultural approval can gate syndication

### Data Shared

Default sharing settings:

- ✅ Summary only (not full content)
- ✅ Media (if `share_media = true`)
- ✅ Attribution (storyteller name)
- ✅ Themes (tags)
- ✅ Story type
- ❌ Full content (unless `share_full_content = true`)
- ❌ PII or sensitive data

### Audit Trail

Every access is logged in `story_access_log`:

```sql
CREATE TABLE story_access_log (
  id UUID PRIMARY KEY,
  story_id UUID NOT NULL,
  app_id UUID NOT NULL,
  access_type TEXT,  -- 'view', 'embed', 'export'
  accessed_at TIMESTAMPTZ DEFAULT now(),
  accessor_ip TEXT,
  accessor_user_agent TEXT
);
```

## Troubleshooting

### Issue: Registry Sharing card not visible

**Solution**: Ensure you're logged in as a super admin.

Check your user role:

```sql
SELECT id, email, role FROM profiles WHERE email = 'your-email@example.com';
```

Grant super admin:

```sql
UPDATE profiles SET role = 'super_admin' WHERE email = 'your-email@example.com';
```

### Issue: 401 Invalid token

**Solution**: Regenerate API key.

Delete and recreate the external application:

```sql
DELETE FROM external_applications WHERE app_name = 'act_farm';
```

Then run setup script again:

```bash
node scripts/data-management/setup-act-farm-registry.js
```

### Issue: No stories in registry

**Solution**: Check consent records.

```sql
SELECT
  s.title,
  ssc.consent_granted,
  ssc.consent_revoked_at,
  ea.app_name
FROM stories s
JOIN story_syndication_consent ssc ON s.id = ssc.story_id
JOIN external_applications ea ON ssc.app_id = ea.id
WHERE ea.app_name = 'act_farm';
```

If `consent_granted = false`, toggle sharing in admin UI.

### Issue: syndicated_stories view doesn't exist

**Solution**: Run the migration.

```bash
cd supabase
supabase db push
```

Or apply manually:

```bash
psql $DATABASE_URL < supabase/migrations/20251209010000_external_api_syndication.sql
```

## ACT Farm Integration

### Aggregator Endpoint

ACT Farm aggregates multiple registries. The aggregator endpoint:

```typescript
// ACT Farm repo: /api/registry
export async function GET() {
  const sources = [
    { name: 'Empathy Ledger', url: 'https://empathy-ledger-v2.vercel.app/api/registry' },
    { name: 'JusticeHub', url: 'https://justicehub.org/api/registry' },
    { name: 'Harvest', url: 'https://harvest.coop/api/registry' }
  ]

  const results = await Promise.all(
    sources.map(async (source) => {
      const res = await fetch(source.url, {
        headers: { Authorization: `Bearer ${env[`${source.name}_TOKEN`]}` }
      })
      const data = await res.json()
      return { source: source.name, items: data.items }
    })
  )

  return { feeds: results }
}
```

### Testing Locally

1. Clone ACT Farm repo
2. Add Empathy Ledger token to `.env.local`:

```env
EMPATHY_LEDGER_TOKEN=el_your_token_here
```

3. Run locally:

```bash
cd "ACT Farm and Regenerative Innovation Studio"
npm install
npm run dev
```

4. Test aggregator:

```bash
curl "http://localhost:3000/api/registry?fresh=true"
```

## Related Files

| File | Purpose |
|------|---------|
| [src/app/admin/stories/page.tsx](src/app/admin/stories/page.tsx) | Admin UI with toggle |
| [src/app/api/admin/story-sharing/route.ts](src/app/api/admin/story-sharing/route.ts) | Toggle sharing endpoint |
| [src/app/api/registry/route.ts](src/app/api/registry/route.ts) | Public registry API |
| [supabase/migrations/20251209010000_external_api_syndication.sql](supabase/migrations/20251209010000_external_api_syndication.sql) | Database schema |
| [src/lib/services/syndication-consent.service.ts](src/lib/services/syndication-consent.service.ts) | Consent management service |
| [scripts/data-management/setup-act-farm-registry.js](scripts/data-management/setup-act-farm-registry.js) | Setup script |

## Support

For issues or questions:

- GitHub Issues: https://github.com/your-org/empathy-ledger-v2/issues
- Email: support@empathyledger.org
