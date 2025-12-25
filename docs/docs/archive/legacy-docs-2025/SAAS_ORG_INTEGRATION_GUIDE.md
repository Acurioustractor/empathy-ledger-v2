# Organisation Integration Guide (Org-Paid SaaS)

This guide explains how Empathy Ledger works as a SaaS product for organisations, and how partner systems can integrate to *use stories safely* (consent + cultural governance + revocation).

## Mental model

- **Organisation = the billing unit**. An organisation has a tier and a default distribution policy.
- **Storytellers own their stories**. Organisations can help publish/use stories, but consent and cultural safety gates are enforced.
- **Distribution is an audited action**. Every time a story is shared/embedded/syndicated, it creates a trackable record.
- **Revocation is first-class**. Consent can be withdrawn; integrations must respond quickly.

Key building blocks already in this codebase:
- **Embeds + tokens**: `embed_tokens`, `story_distributions` (migration `supabase/migrations/20251207_story_ownership_distribution.sql`)
- **External syndication**: `external_applications`, `story_syndication_consent`, `story_access_log` (migration `supabase/migrations/20251209010000_external_api_syndication.sql`)
- **Webhooks**: `webhook_subscriptions`, delivery logs (migration `supabase/migrations/20251210030000_webhook_subscriptions.sql`)
- **Org SaaS config**: `organizations.tier` + `organizations.distribution_policy` (migration `supabase/migrations/20251220090000_saas_org_tier_and_distribution_policy.sql`)

## 1) Onboard an organisation (customer workflow)

1. **Create the organisation** (admin/super admin, or via onboarding UI when built).
2. **Add members** via `organization_members` (roles like `owner/admin/member`).
3. **Onboard storytellers**:
   - storytellers have user accounts (`profiles`)
   - they can be members of one or more orgs
4. **Set org distribution defaults** (org admin):
   - `organizations.tier`
   - `organizations.distribution_policy`
5. **Create stories + verify consent** (storyteller workflow):
   - stories must have verified consent to distribute (see consent fields on `stories`)
   - high sensitivity content can require elder approval; sacred content must never be externally distributed

### Getting the current org SaaS context (UI + API)

Use `GET /api/saas/context` to power consistent UI decisions:
- returns current org, tier, entitlements, and org distribution policy
- optional: `?orgId=<uuid>` or header `x-organization-id: <uuid>`

Implementation: `src/app/api/saas/context/route.ts`

## 2) Embed integration (website embedding)

Use embeds when you want to show a story on a website with domain restrictions and revocation support.

### Generate an embed token (story owner)

`POST /api/embed/stories/<storyId>/token`
- requires the signed-in storyteller/author
- returns a token + embed snippet

Implementation: `src/app/api/embed/stories/[id]/token/route.ts`

### Render the embedded story (public)

`GET /api/embed/stories/<storyId>?token=<token>`
- validates token, checks consent, enforces domain restrictions from `allowed_domains`
- returns embeddable story payload

Implementation: `src/app/api/embed/stories/[id]/route.ts`

### What revocation means for embeds

When consent is withdrawn or a token is revoked:
- token validation fails (410/403/401 depending on case)
- your website should treat that as “story unavailable” and remove it from public view

## 3) External Stories API (partner integration)

Use the External Stories API when you are building another product (partner portal, CMS, newsroom, reporting tool) that needs to fetch approved stories.

This integration is “stories-as-a-service”:
- partner app authenticates with an API key
- partner app only sees stories where a storyteller has explicitly granted consent for that app
- content level (full vs summary) is controlled by consent flags

### Step A — Register an external application

Create a record in `external_applications` (admin-only operation).
- `api_key_hash` currently behaves like a direct API key value in code (see note below)
- keep this secret

### Step B — Exchange API key for a JWT

`POST /api/external/auth`

Body:
```json
{ "api_key": "your_app_api_key" }
```

Response includes `token` (JWT, expires in 1 hour).

Implementation: `src/app/api/external/auth/route.ts`

### Step C — Fetch stories the app has consent to access

- `GET /api/external/stories`
- `GET /api/external/stories/<storyId>`

Auth:
- `Authorization: Bearer <jwt>`

Implementation:
- `src/app/api/external/stories/route.ts`
- `src/app/api/external/stories/[id]/route.ts`

### Step D — Log access (audit trail)

Partners should log story access (view/embed/export) so storytellers have transparency:

`POST /api/external/stories/<storyId>/access`

Body:
```json
{ "access_type": "view", "context": { "page_url": "https://example.org/stories/123" } }
```

Implementation: `src/app/api/external/stories/[id]/access/route.ts`

## 4) Webhooks (revocation + consent changes)

Use webhooks if you need real-time updates (especially consent revocations).

### Register a webhook (partner app)

`POST /api/external/webhooks`

Headers:
- `Authorization: Bearer <jwt>`

Body:
```json
{
  "url": "https://example.org/webhooks/empathy-ledger",
  "events": ["consent.revoked", "consent.updated"],
  "description": "My production webhook"
}
```

Response includes a `secret` (store it; it’s only shown once).

Implementation: `src/app/api/external/webhooks/route.ts`

### Verify webhook signatures

Each webhook includes:
- Header: `X-Empathy-Signature: sha256=<hex>`

Compute HMAC-SHA256 over the raw request body using the `secret` and compare to the header.

Webhook service implementation: `src/lib/services/webhook.service.ts`

### Required partner behavior on `consent.revoked`

When you receive `consent.revoked`:
- remove the story from public views immediately
- purge cached copies (or mark as revoked)
- stop any downstream redistribution

## 5) Who controls what (governance)

- **Storyteller** controls:
  - syndication consent per external app (`story_syndication_consent`)
  - embed token generation/revocation for their story
  - withdrawing consent (which should cascade into distribution revocation)
- **Organisation** controls:
  - org-level defaults (tier + distribution policy)
  - internal workflows (review queues, publishing standards)
- **Elders/cultural reviewers** (where enabled) control:
  - approvals required for high-sensitivity distribution

## Notes / current limitations

- External API key validation (`src/lib/external/auth.ts`) currently compares `api_key_hash` as a plain string. For production, change to:
  - store a hash (bcrypt/argon2), compare safely, and rotate keys
- Some “partner portal” APIs exist under `src/app/api/partner/*` but there’s no UI yet; external integrations should use `/api/external/*` for now.

