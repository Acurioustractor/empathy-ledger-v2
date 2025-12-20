# SaaS Distribution Foundation (Org-Paid)

## Product model

- **Billing unit**: Organisation (`public.organizations`)
- **Primary value**: Use stories safely to drive outcomes through controlled distribution.
- **Core primitives**:
  - **Consent proof + verification** (who consented, when, what scope)
  - **Cultural safety gates** (block sacred, elder approval for high sensitivity)
  - **Distribution records** (what went where, status, consent snapshot)
  - **Audit trail** (every action is visible to storytellers and orgs)
  - **Revocation** (stop distribution + notify downstream where possible)

This is already strongly represented in `src/lib/services/*.service.ts`, especially:
- `src/lib/services/consent.service.ts`
- `src/lib/services/distribution.service.ts`
- `src/lib/services/embed.service.ts`
- `src/lib/services/revocation.service.ts`
- `src/lib/services/audit.service.ts`

## Org-level SaaS settings

This repo adds a minimal org SaaS layer:
- Migration: `supabase/migrations/20251220090000_saas_org_tier_and_distribution_policy.sql`
  - `organizations.tier` (community/basic/standard/premium/enterprise)
  - `organizations.distribution_policy` (org defaults for distribution behavior)

Code helpers:
- Entitlements map: `src/lib/saas/entitlements.ts`
- Tier normalization: `src/lib/saas/tier.ts`
- Distribution policy normalization: `src/lib/saas/org-policy.ts`

Context endpoint (to power UI decisions consistently):
- `GET /api/saas/context` (`src/app/api/saas/context/route.ts`)

## Recommended “Distribution Studio” (novel feature)

Build a single workflow that makes distribution safe, obvious, and trackable:

1. **Package**: turn a story into a “distribution kit”
   - approved excerpt(s), title variants, attribution rules, media assets
   - human-readable consent summary (scope + expiry)
2. **Choose channels**: embed, newsletter, partner portal, syndication, webhooks
3. **Auto-check**: enforce cultural safety + consent verification gates
4. **Publish**: create `story_distributions` (and tokens/webhooks as needed)
5. **Track**: log engagement events (views, reads, shares) per distribution
6. **Revoke**: one button to withdraw consent and invalidate downstream access

This is the “novel loop”: organisations don’t just collect stories; they can *use* them safely with built-in consent + cultural governance.

## Next implementation steps (low-risk)

- Add a simple UI “Org → Distribution” page that calls `/api/saas/context` and lists enabled channels.
- Wire org tier/policy into embed + external syndication APIs (feature gates + policy defaults).
- Add an “approval queue” UI for `high` sensitivity items requiring elder approval before distribution.
- Add a minimal “Outcome Ledger” table and link distributions → outcomes (phase 2).

