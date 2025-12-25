# SaaS Git Workflow (Org-Paid)

This repo is set up to ship a multi-tenant SaaS where the **billing unit is an organisation** and the core product is **consent + cultural-safe distribution of stories**.

## Branches and environments

- `feature/*`: Day-to-day work branches.
- `develop`: Staging branch.
  - On success of the **CI Pipeline**, `develop` deploys to staging via `.github/workflows/develop.yml`.
- `main`: Production branch.
  - On success of the **CI Pipeline**, `main` deploys to production via `.github/workflows/production.yml`.
- Manual production deploy is also available via `.github/workflows/deploy-production.yml` (`workflow_dispatch`).

## Daily workflow (recommended)

1. Sync:
   - `git checkout develop`
   - `git pull`
2. Create a feature branch:
   - `git checkout -b feature/<short-name>`
3. Build in small commits:
   - `git add -A`
   - `git commit -m "<area>: <what changed>"`
4. Run local checks before opening a PR:
   - `npm run lint:ci`
   - `npm run type-check:baseline`
   - `npm run validate:schema`
   - `npm run build`
5. Push and open a PR to `develop`:
   - `git push -u origin feature/<short-name>`
6. Merge to `develop` after CI is green → staging deploy happens automatically.
7. When ready to release, merge `develop` → `main` → production deploy happens automatically.

## TypeScript strategy (ratchet)

This repo currently uses a “no regression” approach:
- `npm run type-check:baseline` fails only if TypeScript errors **increase**.
- Fix TypeScript gradually, then lower the baseline intentionally:
  - `npm run type-check:baseline:write` (only when you mean to update the baseline)

This lets you ship safely while paying down the TS debt over time.

## Database migrations (Supabase)

Rules:
- Every schema change gets a migration in `supabase/migrations/`.
- Naming convention is enforced by `npm run validate:schema`.
- Prefer additive migrations (new tables/columns) over breaking changes.

Process:
1. Add a migration file: `supabase/migrations/YYYYMMDDHHMMSS_<short_name>.sql`
2. Keep migrations idempotent:
   - Use `CREATE ... IF NOT EXISTS`
   - Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
3. If you “retire” old files/backups, move them into `supabase/migrations/archive/` (don’t leave non-`.sql` files in migrations root).

## Multi-tenant and org-paid SaaS model

Source of truth:
- Org membership/context helper: `src/lib/multi-tenant/context.ts`
- SaaS tier + entitlements: `src/lib/saas/entitlements.ts`
- Org distribution policy: `src/lib/saas/org-policy.ts`
- SaaS context endpoint for UI/API: `GET /api/saas/context` (`src/app/api/saas/context/route.ts`)

What to do in new features:
- Always derive org context server-side (don’t trust client org IDs).
- Store decisions at the org level:
  - Tier (`organizations.tier`)
  - Distribution policy (`organizations.distribution_policy`)
- Enforce gates in API routes and service layer:
  - Consent verified required
  - Cultural safety checks (block sacred, require elder approval, etc.)
  - Entitlement checks per tier (embed/webhooks/syndication)

## Release checklist (develop → main)

- CI green on `develop`
- Smoke test key journeys (auth, org selection, story view, distribution action)
- Confirm migrations are applied in prod Supabase
- Merge `develop` → `main`
- Confirm production deploy workflow succeeded

## Hotfix workflow

If prod breaks:
1. Branch from `main`: `git checkout -b hotfix/<issue>`
2. Fix + run checks
3. PR to `main` (not `develop`)
4. After merge, cherry-pick or merge `main` back into `develop` to keep branches aligned

