# Database Migration Planner Skill

**Trigger Keywords:** create migration, new migration, add column, change schema, alter table, migration plan

**Description:** Plans and creates safe database migrations following Empathy Ledger's schema patterns.

---

## What This Skill Does

Guides you through creating a safe, validated database migration:
1. ✅ Verify column/table exists in production schema
2. ✅ Generate migration file with safety checks
3. ✅ Apply Empathy Ledger specific patterns (profile_organizations, tenant isolation)
4. ✅ Include rollback SQL
5. ✅ Validate before applying

---

## Usage Examples

**User says:**
- "Create a migration to add email_verified column to profiles"
- "I need to add an index on stories.published_at"
- "Plan a migration for campaign tags table"
- "Create migration to fix CASCADE DELETE"

**Skill automatically:**
1. Checks if table/column exists: `npm run db:sql` then `\d table_name`
2. Creates migration file: `npx supabase migration new description`
3. Generates SQL with safety checks and rollback
4. Validates with `npm run validate:schema`
5. Tests locally if possible

---

## Migration Template

```sql
-- Migration: [Brief Description]
-- Date: YYYY-MM-DD
-- Risk: LOW/MEDIUM/HIGH
-- Reversible: YES/NO
-- Author: [Name or Claude Code]

-- ============================================================================
-- SAFETY CHECKS
-- ============================================================================

-- Verify table exists before altering
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'your_table'
  ) THEN
    RAISE EXCEPTION 'Table your_table does not exist';
  END IF;
END $$;

-- ============================================================================
-- CHANGES
-- ============================================================================

-- Add column (example)
ALTER TABLE your_table
ADD COLUMN IF NOT EXISTS new_column TEXT;

-- Add index (example)
CREATE INDEX IF NOT EXISTS idx_table_column
  ON your_table(column_name);

-- Add foreign key with CASCADE (example)
ALTER TABLE child_table
ADD CONSTRAINT fk_parent
FOREIGN KEY (parent_id)
REFERENCES parent_table(id)
ON DELETE CASCADE;

-- ============================================================================
-- RLS POLICIES (if adding new table)
-- ============================================================================

-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Read policy (tenant isolation)
CREATE POLICY "table_read" ON your_table
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

-- Insert policy (admin/specific roles)
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

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Verify changes were applied
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'your_table' AND column_name = 'new_column'
  ) THEN
    RAISE EXCEPTION 'Column was not added';
  END IF;

  RAISE NOTICE 'Migration completed successfully';
END $$;

-- ============================================================================
-- ROLLBACK SQL (Save this for emergencies)
-- ============================================================================

-- ALTER TABLE your_table DROP COLUMN IF EXISTS new_column;
-- DROP INDEX IF EXISTS idx_table_column;
-- ALTER TABLE child_table DROP CONSTRAINT IF EXISTS fk_parent;
```

---

## Empathy Ledger Specific Patterns

### Multi-Tenant Isolation
Always add tenant_id to new tables:
```sql
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  -- other columns
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Role-Based Access (Use profile_organizations)
```sql
-- ✅ CORRECT
CREATE POLICY "table_admin_access" ON your_table
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM profile_organizations
    WHERE profile_id = auth.uid()
    AND role IN ('admin', 'elder')
  )
);

-- ❌ WRONG (role column doesn't exist on profiles)
-- SELECT role FROM profiles WHERE id = auth.uid()
```

### Foreign Key Cascades
Always specify ON DELETE behavior:
```sql
-- Story belongs to organization (delete story if org deleted)
organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE

-- Story belongs to storyteller (keep story if storyteller deleted)
storyteller_id UUID REFERENCES profiles(id) ON DELETE SET NULL

-- Media belongs to story (delete media if story deleted)
story_id UUID REFERENCES stories(id) ON DELETE CASCADE
```

### Indexes (No CONCURRENTLY in migrations)
```sql
-- ✅ DO
CREATE INDEX IF NOT EXISTS idx_stories_org
  ON stories(organization_id);

-- ❌ DON'T (CONCURRENTLY fails in migrations)
CREATE INDEX CONCURRENTLY idx_stories_org
  ON stories(organization_id);
```

### Avoid deleted_at References
Most tables don't have soft deletes:
```sql
-- ✅ DO (simple index)
CREATE INDEX idx_stories_org ON stories(organization_id);

-- ❌ DON'T (deleted_at doesn't exist in most tables)
CREATE INDEX idx_stories_org ON stories(organization_id)
  WHERE deleted_at IS NULL;
```

---

## Pre-Migration Checklist

Before creating migration, verify:

### 1. Check Production Schema
```bash
npm run db:sql
# Then: \d table_name
# Or: \d+ table_name (verbose)
# Or: SELECT column_name FROM information_schema.columns WHERE table_name = 'your_table';
```

### 2. Understand Relationships
```bash
npm run db:sql
# Then: \d+ table_name
# Check foreign keys listed at bottom
```

### 3. Review Similar Migrations
```bash
# Look at recent migrations for patterns
ls -lt supabase/migrations/ | head -10
cat supabase/migrations/[recent-migration].sql
```

### 4. Plan Rollback
- Write rollback SQL before applying
- Test rollback works (on local DB)
- Document in migration file

---

## Workflow

### Step 1: Investigate Current Schema
```bash
npm run db:sql
\d table_name  # See current structure
\d+ table_name # See with more details
```

### Step 2: Create Migration File
```bash
npx supabase migration new add_email_verified_to_profiles
# Creates: supabase/migrations/YYYYMMDDHHMMSS_add_email_verified_to_profiles.sql
```

### Step 3: Write SQL (Use Template Above)
- Copy template from this skill
- Customize for your changes
- Include safety checks and rollback

### Step 4: Validate
```bash
npm run validate:schema
# Should pass with 0 errors
```

### Step 5: Test Locally (Recommended)
```bash
npm run db:start
npm run db:migrate
# Verify changes work
# Test rollback if needed
```

### Step 6: Apply to Production
```bash
npm run db:migrate:remote
# Confirms before applying
```

### Step 7: Verify Success
```bash
npm run db:status
npm run db:types  # Regenerate TypeScript types
```

---

## Common Migration Types

### Add Column
```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_email_verified
  ON profiles(email_verified)
  WHERE email_verified = TRUE;
```

### Add Table
```sql
CREATE TABLE IF NOT EXISTS campaign_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaign_tags_campaign ON campaign_tags(campaign_id);
CREATE INDEX idx_campaign_tags_tenant ON campaign_tags(tenant_id);

ALTER TABLE campaign_tags ENABLE ROW LEVEL SECURITY;
-- Add RLS policies here
```

### Add Index
```sql
CREATE INDEX IF NOT EXISTS idx_stories_published_at
  ON stories(published_at DESC)
  WHERE status = 'published';

COMMENT ON INDEX idx_stories_published_at IS
'Speeds up queries for recent published stories';
```

### Fix Foreign Key
```sql
-- Remove old constraint
ALTER TABLE harvested_outcomes
DROP CONSTRAINT IF EXISTS harvested_outcomes_story_id_fkey;

-- Add with CASCADE
ALTER TABLE harvested_outcomes
ADD CONSTRAINT harvested_outcomes_story_id_fkey
FOREIGN KEY (story_id)
REFERENCES stories(id)
ON DELETE CASCADE;
```

### Add RLS Policy
```sql
CREATE POLICY "stories_storyteller_read" ON stories
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  storyteller_id = auth.uid()
);
```

---

## Error Prevention

### Check Before You Write
```sql
-- Verify column doesn't already exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'your_table' AND column_name = 'new_column';

-- Verify table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'your_table';

-- Verify foreign key target exists
SELECT table_name FROM information_schema.tables
WHERE table_name = 'referenced_table';
```

### Use IF EXISTS / IF NOT EXISTS
```sql
-- Safe patterns
ALTER TABLE table_name ADD COLUMN IF NOT EXISTS column_name TYPE;
CREATE INDEX IF NOT EXISTS idx_name ON table(column);
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE TABLE IF NOT EXISTS table_name (...);
```

### Always Include Rollback
```sql
-- At bottom of migration file
-- ============================================================================
-- ROLLBACK SQL
-- ============================================================================

-- Copy this and run if migration needs to be reversed:
-- ALTER TABLE your_table DROP COLUMN IF EXISTS new_column;
-- DROP INDEX IF EXISTS idx_name;
```

---

## Testing Migrations Locally

### Setup (One Time)
```bash
# Install Docker Desktop
# Then start local Supabase
npm run db:start
npm run db:sync  # Pull production schema
```

### Test Cycle
```bash
# 1. Apply migration
npm run db:migrate

# 2. Test in app
npm run dev
# Visit affected pages, verify changes work

# 3. Test rollback (optional)
npm run db:sql
# Run rollback SQL manually

# 4. Re-apply if rollback worked
npm run db:reset  # Reset local DB
npm run db:migrate  # Re-apply
```

---

## Success Criteria

After running this skill, you should have:
- ✅ Migration file created with proper naming
- ✅ SQL includes safety checks and verification
- ✅ Rollback SQL documented
- ✅ Schema validation passes
- ✅ Tested locally (if applicable)
- ✅ Confidence to deploy to production

---

## Files to Reference

- [DATABASE_BEST_PRACTICES.md](/Users/benknight/Code/empathy-ledger-v2/DATABASE_BEST_PRACTICES.md)
- [DATABASE_WORKFLOW.md](/Users/benknight/Code/empathy-ledger-v2/DATABASE_WORKFLOW.md)
- [scripts/validate-database-schema.js](/Users/benknight/Code/empathy-ledger-v2/scripts/validate-database-schema.js)
