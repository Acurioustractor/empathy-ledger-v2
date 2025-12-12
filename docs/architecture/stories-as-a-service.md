# Stories as a Service Architecture

## Overview

Empathy Ledger serves as the **source of truth** for stories, with storyteller consent management. External applications (JusticeHub, Curious Tractor, etc.) can access approved stories through Supabase with proper consent controls.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      EMPATHY LEDGER                             │
│  (Source of Truth - Stories, Consent, Approvals)                │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Stories    │  │   Consent    │  │  Approvals   │          │
│  │   Content    │  │  Management  │  │  Workflow    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                    Supabase DB
                    (Shared Layer)
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  JusticeHub  │  │   Curious    │  │   Future     │
│              │  │   Tractor    │  │    Apps      │
│  (Consumer)  │  │  (Consumer)  │  │  (Consumer)  │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Key Principles

1. **Storyteller Sovereignty** - Stories only shared with explicit consent
2. **Empathy Ledger Controls** - All approvals managed in one place
3. **Per-App Permissions** - Storytellers choose which apps see their stories
4. **Audit Trail** - Full logging of who accessed what

## Database Schema

### External Applications Registry

```sql
-- Register external apps that can consume stories
CREATE TABLE external_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name TEXT NOT NULL UNIQUE,           -- 'justicehub', 'curious_tractor'
  app_display_name TEXT NOT NULL,          -- 'JusticeHub'
  app_description TEXT,
  api_key_hash TEXT NOT NULL,              -- Hashed API key for authentication
  allowed_story_types TEXT[],              -- Which story types can access
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Example entries
INSERT INTO external_applications (app_name, app_display_name, app_description, allowed_story_types)
VALUES
  ('justicehub', 'JusticeHub', 'Legal advocacy platform', ARRAY['testimony', 'case_study', 'advocacy']),
  ('curious_tractor', 'Curious Tractor', 'Agricultural community stories', ARRAY['community', 'knowledge', 'practice']);
```

### Story Syndication Consent

```sql
-- Track storyteller consent for each external app
CREATE TABLE story_syndication_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  storyteller_id UUID NOT NULL REFERENCES profiles(id),
  app_id UUID NOT NULL REFERENCES external_applications(id),

  -- Consent details
  consent_granted BOOLEAN DEFAULT false,
  consent_granted_at TIMESTAMPTZ,
  consent_revoked_at TIMESTAMPTZ,
  consent_expires_at TIMESTAMPTZ,          -- Optional expiry

  -- What's shared
  share_full_content BOOLEAN DEFAULT false,
  share_summary_only BOOLEAN DEFAULT true,
  share_media BOOLEAN DEFAULT false,
  share_attribution BOOLEAN DEFAULT true,  -- Show storyteller name
  anonymous_sharing BOOLEAN DEFAULT false, -- Share without attribution

  -- Cultural protocols
  cultural_restrictions JSONB DEFAULT '{}',
  requires_cultural_approval BOOLEAN DEFAULT false,
  cultural_approval_status TEXT,           -- 'pending', 'approved', 'denied'
  cultural_approver_id UUID REFERENCES profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(story_id, app_id)
);
```

### Story Access Log

```sql
-- Audit trail for story access
CREATE TABLE story_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id),
  app_id UUID NOT NULL REFERENCES external_applications(id),
  access_type TEXT NOT NULL,               -- 'view', 'embed', 'export'
  accessed_at TIMESTAMPTZ DEFAULT now(),
  accessor_ip TEXT,
  accessor_user_agent TEXT,
  access_context JSONB                     -- Additional context
);
```

### Syndicated Stories View

```sql
-- View for external apps to query approved stories
CREATE VIEW syndicated_stories AS
SELECT
  s.id AS story_id,
  s.title,
  CASE
    WHEN ssc.share_full_content THEN s.content
    ELSE s.summary
  END AS content,
  CASE
    WHEN ssc.share_attribution AND NOT ssc.anonymous_sharing THEN p.display_name
    ELSE 'Anonymous Storyteller'
  END AS storyteller_name,
  s.story_type,
  s.themes,
  s.created_at AS story_date,
  ea.app_name AS requesting_app,
  ssc.cultural_restrictions,
  CASE WHEN ssc.share_media THEN s.media_urls ELSE NULL END AS media
FROM stories s
JOIN story_syndication_consent ssc ON s.id = ssc.story_id
JOIN external_applications ea ON ssc.app_id = ea.id
JOIN profiles p ON s.storyteller_id = p.id
WHERE
  ssc.consent_granted = true
  AND (ssc.consent_expires_at IS NULL OR ssc.consent_expires_at > now())
  AND ssc.consent_revoked_at IS NULL
  AND ea.is_active = true
  AND (NOT ssc.requires_cultural_approval OR ssc.cultural_approval_status = 'approved');
```

## Row Level Security (RLS)

```sql
-- External apps can only see stories they have consent for
CREATE POLICY "External apps see consented stories"
ON syndicated_stories
FOR SELECT
USING (
  requesting_app = current_setting('app.current_app', true)
);

-- Function to set current app context
CREATE OR REPLACE FUNCTION set_app_context(app_key TEXT)
RETURNS void AS $$
DECLARE
  app_name TEXT;
BEGIN
  SELECT ea.app_name INTO app_name
  FROM external_applications ea
  WHERE ea.api_key_hash = crypt(app_key, ea.api_key_hash)
    AND ea.is_active = true;

  IF app_name IS NULL THEN
    RAISE EXCEPTION 'Invalid or inactive app key';
  END IF;

  PERFORM set_config('app.current_app', app_name, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## API Endpoints for External Apps

### Authentication
```
POST /api/external/auth
Body: { "api_key": "app_secret_key" }
Returns: { "token": "jwt_token", "expires_in": 3600 }
```

### Fetch Approved Stories
```
GET /api/external/stories
Headers: Authorization: Bearer <token>
Query: ?type=testimony&limit=10&offset=0
Returns: Array of syndicated stories
```

### Log Story Access
```
POST /api/external/stories/:id/access
Headers: Authorization: Bearer <token>
Body: { "access_type": "view", "context": {} }
```

## Empathy Ledger UI Components

### Storyteller Consent Management
Location: `/storytellers/[id]/sharing` or `/profile/sharing`

Features:
- List of external apps requesting access
- Per-app consent toggles
- Granular sharing options (full content, summary only, media, attribution)
- Cultural protocol settings
- Consent expiry settings
- View access logs

### Admin App Management
Location: `/admin/external-apps`

Features:
- Register new external applications
- Generate/revoke API keys
- Set allowed story types per app
- View access analytics
- Manage cultural approval workflows

## Integration Flow

### 1. App Registration (One-time)
```
Empathy Ledger Admin → Register JusticeHub → Generate API Key → Share with JusticeHub
```

### 2. Storyteller Grants Consent
```
Storyteller → Profile → Sharing Settings → Enable JusticeHub → Set preferences
```

### 3. External App Fetches Stories
```
JusticeHub → Authenticate with API Key → Query syndicated_stories → Display to users
```

### 4. Access Logging
```
Every access → Logged to story_access_log → Available in Empathy Ledger dashboard
```

## JusticeHub Integration Guide

See: `/docs/integrations/justicehub-integration.md`
