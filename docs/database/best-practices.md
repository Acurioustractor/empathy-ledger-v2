# Database Best Practices - Empathy Ledger v2

**Last Updated:** 2026-01-01
**Status:** Living Document (update as we learn)

---

## 🎯 Core Philosophy

> "The database should always be in a known, documented state. Migrations should be reversible, testable, and aligned with production."

---

## 1. **Migration Workflow (THE RIGHT WAY)**

### Before Writing ANY Migration

```bash
# Step 1: Check current production schema
npm run db:status

# Step 2: Verify the table/column exists
npm run db:sql
# Then run: \d table_name

# Step 3: Document what you're changing
# Write it in EXECUTE_PHASE_X.md first
```

### Writing the Migration

```bash
# Step 4: Create migration file
npx supabase migration new describe_what_it_does

# Step 5: Write SQL with safety checks
```

**Migration Template:**
```sql
-- Migration: Brief Description
-- Date: YYYY-MM-DD
-- Risk: LOW/MEDIUM/HIGH
-- Reversible: YES/NO

-- ============================================================================
-- SAFETY CHECKS
-- ============================================================================

-- Verify table exists before altering
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'your_table'
  ) THEN
    RAISE EXCEPTION 'Table your_table does not exist';
  END IF;
END $$;

-- ============================================================================
-- CHANGES
-- ============================================================================

-- Your actual changes here

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Verify changes were applied
  RAISE NOTICE 'Migration completed successfully';
END $$;
```

### Testing the Migration

```bash
# Step 6: Validate migration syntax
npm run validate:schema  # Catches common errors

# Step 7: Test locally (RECOMMENDED)
npm run db:start          # Start local Supabase
npm run db:migrate        # Apply to local
# Test in app, verify everything works

# Step 8: Review one more time
cat supabase/migrations/YYYYMMDD_your_migration.sql

# Step 9: Apply to production
npm run db:migrate:remote
```

---

## 2. **Empathy Ledger Specific Patterns**

### ✅ DO: Use profile_organizations for Role Checks

```sql
-- ✅ CORRECT: Check if user is admin
EXISTS (
  SELECT 1 FROM profile_organizations
  WHERE profile_id = auth.uid()
  AND role = 'admin'
)

-- ❌ WRONG: This column doesn't exist
(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
```

### ✅ DO: Avoid Assuming deleted_at Exists

```sql
-- ✅ CORRECT: Simple index without deleted_at
CREATE INDEX idx_stories_organization_id
  ON stories(organization_id);

-- ❌ WRONG: deleted_at doesn't exist in most tables
CREATE INDEX idx_stories_organization_id
  ON stories(organization_id)
  WHERE deleted_at IS NULL;
```

### ✅ DO: Use Simple Columns for Full-Text Search

```sql
-- ✅ CORRECT: Use only columns that exist
CREATE INDEX idx_stories_search
  ON stories USING gin(to_tsvector('english', coalesce(title, '')));

-- ❌ WRONG: excerpt column doesn't exist
CREATE INDEX idx_stories_search
  ON stories USING gin(to_tsvector('english', title || ' ' || coalesce(excerpt, '')));
```

### ✅ DO: Use tenant_id for Multi-Tenant Isolation

```sql
-- ✅ CORRECT: Always filter by tenant
CREATE POLICY "stories_read" ON stories
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);
```

---

## 3. **Index Best Practices**

### When to Add an Index

Add indexes when:
- ✅ Column is used in WHERE clauses frequently
- ✅ Column is used in JOIN conditions
- ✅ Column is used in ORDER BY
- ✅ Table has >1000 rows
- ✅ Query shows up in slow query log

**Don't add indexes when:**
- ❌ Table has <100 rows
- ❌ Column is rarely queried
- ❌ Column has low cardinality (e.g., boolean)
- ❌ Table is write-heavy (indexes slow down writes)

### Index Naming Convention

```sql
-- Pattern: idx_{table}_{columns}_{optional_suffix}
CREATE INDEX idx_stories_organization_id ON stories(organization_id);
CREATE INDEX idx_stories_status_published ON stories(status) WHERE status = 'published';
CREATE INDEX idx_profile_orgs_composite ON profile_organizations(organization_id, profile_id, role);
```

### CONCURRENTLY Keyword

```sql
-- ❌ DON'T use in migrations (fails in transaction)
CREATE INDEX CONCURRENTLY idx_name ON table(column);

-- ✅ DO use when running manually on large tables
npm run db:sql
-- Then: CREATE INDEX CONCURRENTLY idx_name ON table(column);
```

---

## 4. **RLS Policy Patterns**

### Standard Policy Template

```sql
-- Read: Users can see records in their tenant
DROP POLICY IF EXISTS "table_read" ON your_table;
CREATE POLICY "table_read" ON your_table
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- Insert: Admins and specific roles can create
DROP POLICY IF EXISTS "table_insert" ON your_table;
CREATE POLICY "table_insert" ON your_table
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()) AND
  EXISTS (
    SELECT 1 FROM profile_organizations
    WHERE profile_id = auth.uid()
    AND role IN ('admin', 'project_leader')
  )
);

-- Update: Owner or admin can update
DROP POLICY IF EXISTS "table_update" ON your_table;
CREATE POLICY "table_update" ON your_table
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND
  (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profile_organizations
      WHERE profile_id = auth.uid()
      AND role = 'admin'
    )
  )
);

-- Delete: Only admins can delete
DROP POLICY IF EXISTS "table_delete" ON your_table;
CREATE POLICY "table_delete" ON your_table
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM profile_organizations
    WHERE profile_id = auth.uid()
    AND role = 'admin'
  )
);
```

---

## 5. **Foreign Key Best Practices**

### Always Use CASCADE or SET NULL

```sql
-- ✅ GOOD: Prevents orphaned records
ALTER TABLE child_table
ADD CONSTRAINT fk_parent
FOREIGN KEY (parent_id) REFERENCES parent_table(id) ON DELETE CASCADE;

-- ✅ GOOD: Allows soft deletion
ALTER TABLE child_table
ADD CONSTRAINT fk_parent
FOREIGN KEY (parent_id) REFERENCES parent_table(id) ON DELETE SET NULL;

-- ❌ BAD: No cascade (orphans possible)
ALTER TABLE child_table
ADD CONSTRAINT fk_parent
FOREIGN KEY (parent_id) REFERENCES parent_table(id);
```

### Common FK Patterns in Empathy Ledger

```sql
-- Story belongs to storyteller (keep story if storyteller deleted)
story_id UUID REFERENCES profiles(id) ON DELETE SET NULL

-- Story belongs to organization (delete story if org deleted)
organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE

-- Story belongs to tenant (always cascade tenant deletion)
tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE

-- Media belongs to story (delete media if story deleted)
story_id UUID REFERENCES stories(id) ON DELETE CASCADE
```

---

## 6. **Testing Migrations Locally**

### Setup Local Supabase (One-Time)

```bash
# Install Docker Desktop first (https://www.docker.com/products/docker-desktop)

# Start local Supabase
npm run db:start

# Pull production schema (NOT data)
npm run db:sync

# Generate TypeScript types
npm run db:types:local
```

### Daily Workflow with Local DB

```bash
# Start local DB
npm run db:start

# Apply migrations locally
npm run db:migrate

# Run dev server (uses local DB)
npm run dev

# When done
npm run db:stop
```

### Reset Local DB (If Broken)

```bash
npm run db:stop
npm run db:start
npm run db:sync  # Re-pull schema from production
```

---

## 7. **Migration Checklist**

Before applying to production, verify:

- [ ] Migration file has descriptive name
- [ ] SQL syntax is valid (no typos)
- [ ] Column names match production schema
- [ ] Foreign keys have CASCADE or SET NULL
- [ ] RLS policies use profile_organizations for roles
- [ ] No `CONCURRENTLY` keyword in migrations
- [ ] No references to deleted_at, excerpt, bio, etc.
- [ ] Tested locally (if possible)
- [ ] Validation script passed: `npm run validate:schema`
- [ ] Backup plan exists (rollback SQL ready)
- [ ] Migration is documented in EXECUTE_PHASE_X.md

---

## 8. **Common Errors & Solutions**

### Error: "column does not exist"

**Cause:** Migration references a column that doesn't exist in production.

**Solution:**
```bash
# Check actual schema
npm run db:sql
# Run: \d table_name

# Update migration to match reality
```

### Error: "CREATE INDEX CONCURRENTLY cannot be executed within a pipeline"

**Cause:** Used CONCURRENTLY in migration file.

**Solution:**
```sql
-- Remove CONCURRENTLY
CREATE INDEX idx_name ON table(column);
```

### Error: "relation already exists"

**Cause:** Index/table already exists from previous migration.

**Solution:**
```sql
-- Use IF NOT EXISTS
CREATE TABLE IF NOT EXISTS table_name (...);
CREATE INDEX IF NOT EXISTS idx_name ON table(column);
```

### Error: Foreign key constraint fails

**Cause:** Trying to reference a table/column that doesn't exist.

**Solution:**
```bash
# Verify referenced table exists
npm run db:sql
# Run: \d referenced_table
```

---

## 9. **Weekly Maintenance Tasks**

### Every Monday (5 minutes)

```bash
# 1. Check migration status
npm run db:status

# 2. Validate schema alignment
npm run validate:schema

# 3. Pull latest production schema snapshot
npm run db:pull-schema  # TODO: Create this command

# 4. Review slow query log (Supabase Dashboard)
# https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/logs/slow-queries
```

### Every Month (30 minutes)

```bash
# 1. Database health check
npm run db:sql
# Run: SELECT * FROM get_table_stats() LIMIT 20;

# 2. Review unused indexes
# Run: SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;

# 3. Vacuum analyze
# Run: VACUUM ANALYZE;

# 4. Update documentation
# Review and update this file with new learnings
```

---

## 10. **Emergency Rollback Procedures**

### If Migration Fails Midway

```bash
# Check what was applied
npm run db:status

# Manually fix in database
npm run db:sql
# Run rollback SQL

# Mark migration as complete
npx supabase migration repair --status applied YYYYMMDD_migration_name
```

### If Migration Breaks App

```bash
# Option 1: Rollback the migration (if possible)
npm run db:sql
# Manually run reverse migration SQL

# Option 2: Restore from backup
# Supabase Dashboard → Database → Backups → Restore

# Option 3: Fix forward (add new migration)
npx supabase migration new fix_broken_migration
# Write corrective SQL
npm run db:migrate:remote
```

---

## 11. **Tools & Commands Reference**

### Database Status & Info
```bash
npm run db:status          # See local/remote/migration status
npm run db:sql             # Interactive SQL prompt
npm run validate:schema    # Check migrations for common errors
```

### Local Development
```bash
npm run db:start           # Start local Supabase
npm run db:stop            # Stop local Supabase
npm run db:migrate         # Apply migrations to local
npm run db:sync            # Sync local ← production schema
npm run db:reset           # Reset local database
```

### Production Operations
```bash
npm run db:migrate:remote  # Apply migrations to production
npm run db:types           # Generate TypeScript types from production
npx supabase db push       # Push all pending migrations (same as db:migrate:remote)
npx supabase db pull       # Pull production schema to local
```

### Migration Management
```bash
npx supabase migration new description    # Create new migration file
npx supabase migration list               # List all migrations
npx supabase migration repair --help      # Fix migration state
```

---

## 12. **Architecture Decisions Record**

### Why profile_organizations Junction Table?

**Decision:** Use `profile_organizations` to store roles, not a `role` column on `profiles`.

**Rationale:**
- One user can have different roles in different organizations
- Supports multi-tenant architecture
- Allows organization-specific permissions
- More flexible than single role column

**Impact on Queries:**
```sql
-- Instead of:
SELECT * FROM profiles WHERE role = 'admin';

-- Use:
SELECT p.* FROM profiles p
JOIN profile_organizations po ON po.profile_id = p.id
WHERE po.role = 'admin';
```

### Why No deleted_at Soft Deletes?

**Decision:** Use hard deletes (CASCADE) instead of soft deletes.

**Rationale:**
- Simpler queries (no `WHERE deleted_at IS NULL` everywhere)
- Respects Indigenous data sovereignty (right to be forgotten)
- GDPR compliance (data actually deleted)
- Less database bloat

**Exception:** audit_logs table keeps records for compliance

---

## 13. **Future Improvements**

### Planned Enhancements

1. **Automated Schema Sync**
   - Weekly cron job to pull production schema
   - Auto-generate TypeScript types
   - Notify team of schema drift

2. **Migration Preview System**
   - Visual diff of schema changes before applying
   - Estimated performance impact
   - Automated rollback SQL generation

3. **Performance Monitoring**
   - Dashboard showing query performance trends
   - Auto-suggest indexes for slow queries
   - Alert on schema bloat

4. **Better Local Development**
   - Seed data generator for realistic testing
   - Anonymous production data dump (privacy-safe)
   - Docker Compose for full local stack

---

## 📚 Additional Resources

- [Supabase Migration Guide](https://supabase.com/docs/guides/cli/managing-migrations)
- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [RLS Policy Examples](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Best Practices](https://supabase.com/docs/guides/database/best-practices)

---

## 🤝 Contributing to This Document

This is a living document. When you learn something new:

1. Document it here
2. Add example code
3. Update the "Last Updated" date
4. Share with the team

**Questions or suggestions?** Update this file and create a PR.

---

**Remember:** A well-maintained database is the foundation of a reliable application. Invest time in proper migrations, and you'll save hours debugging production issues.
