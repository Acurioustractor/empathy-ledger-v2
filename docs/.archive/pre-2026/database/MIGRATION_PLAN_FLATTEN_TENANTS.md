# Migration Plan: Flatten Multi-Tenant Architecture

## Current State
- 31 Tenants (billing/subscription containers)
- 18 Organizations (1:1 with tenants)
- 235 Profiles (reference tenant_id)
- 252 Stories (reference tenant_id)
- 9 Projects (reference tenant_id)

## Target State
**Organizations become the primary tenant entity**
- Organizations get subscription/billing fields from tenants
- Profiles reference organization_id instead of tenant_id
- All data scoped by organization_id
- Remove tenants table after migration

## Migration Steps

### Phase 1: Add Fields to Organizations
```sql
-- Add subscription/billing fields from tenants to organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

-- Copy data from linked tenant
UPDATE organizations o
SET
  subscription_tier = t.subscription_tier,
  subscription_status = t.status,
  domain = t.domain,
  settings = t.settings,
  onboarded_at = t.onboarded_at
FROM tenants t
WHERE o.tenant_id = t.id;
```

### Phase 2: Update Profiles
```sql
-- Add organization_id to profiles (temporarily nullable)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS primary_organization_id UUID REFERENCES organizations(id);

-- Migrate: Use profile_organizations junction to find primary org
-- or use tenant_id → organization lookup
UPDATE profiles p
SET primary_organization_id = (
  SELECT po.organization_id
  FROM profile_organizations po
  WHERE po.profile_id = p.id
  AND po.is_active = true
  LIMIT 1
);

-- For profiles without org membership, use tenant → org mapping
UPDATE profiles p
SET primary_organization_id = (
  SELECT o.id
  FROM organizations o
  WHERE o.tenant_id = p.tenant_id
  LIMIT 1
)
WHERE primary_organization_id IS NULL;
```

### Phase 3: Update Data Tables
```sql
-- Stories: tenant_id → organization_id
UPDATE stories s
SET organization_id = (
  SELECT o.id
  FROM organizations o
  WHERE o.tenant_id = s.tenant_id
  LIMIT 1
)
WHERE organization_id IS NULL AND tenant_id IS NOT NULL;

-- Projects: tenant_id → organization_id
UPDATE projects p
SET organization_id = (
  SELECT o.id
  FROM organizations o
  WHERE o.tenant_id = p.tenant_id
  LIMIT 1
)
WHERE organization_id IS NULL AND tenant_id IS NOT NULL;

-- Media assets
UPDATE media_assets m
SET organization_id = (
  SELECT o.id
  FROM organizations o
  WHERE o.tenant_id = m.tenant_id
  LIMIT 1
)
WHERE organization_id IS NULL AND tenant_id IS NOT NULL;

-- Photo galleries
UPDATE photo_galleries pg
SET organization_id = (
  SELECT o.id
  FROM organizations o
  WHERE o.tenant_id = pg.tenant_id
  LIMIT 1
)
WHERE organization_id IS NULL AND tenant_id IS NOT NULL;
```

### Phase 4: Cleanup (After Testing!)
```sql
-- Drop tenant_id columns (DO NOT RUN until verified!)
-- ALTER TABLE profiles DROP COLUMN tenant_id;
-- ALTER TABLE stories DROP COLUMN tenant_id;
-- ALTER TABLE projects DROP COLUMN tenant_id;
-- ALTER TABLE media_assets DROP COLUMN tenant_id;
-- ALTER TABLE photo_galleries DROP COLUMN tenant_id;
-- ALTER TABLE organizations DROP COLUMN tenant_id;

-- Drop tenants table (DO NOT RUN until verified!)
-- DROP TABLE tenants;
```

## Rollback Plan
- Keep tenant_id columns populated during testing
- Keep tenants table until production verified
- Can restore relationships if issues found

## Testing Checklist
- [ ] All organizations have subscription data
- [ ] All profiles have primary_organization_id
- [ ] All stories have organization_id
- [ ] All projects have organization_id
- [ ] Organization pages load correctly
- [ ] User permissions work correctly
- [ ] Super admin access still works
- [ ] Stats API returns correct counts