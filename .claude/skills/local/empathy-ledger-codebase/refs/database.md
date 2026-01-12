# Database Patterns

## Migration Workflow
```bash
npm run db:pull      # Pull remote changes
npm run db:sync      # Interactive menu
npm run db:reset     # Reset local (safe)
npm run db:push      # Deploy (requires confirm)
npm run db:types     # Generate TypeScript
```

## Idempotent SQL
```sql
-- Tables
CREATE TABLE IF NOT EXISTS my_table (...);

-- Functions
CREATE OR REPLACE FUNCTION my_func() ...;

-- Policies (always drop first)
DROP POLICY IF EXISTS policy_name ON table;
CREATE POLICY policy_name ON table ...;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_name ON table(col);
```

## Multi-Tenant Pattern
```sql
CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_my_table_tenant ON my_table(tenant_id);
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON my_table
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );
```

## Type Organization
Import from `@/lib/database/`:
- `user-profile.ts` - Users, auth, preferences
- `organization-tenant.ts` - Orgs, tenants, members
- `content-media.ts` - Stories, transcripts, media
- `cultural-safety.ts` - Protocols, consent
