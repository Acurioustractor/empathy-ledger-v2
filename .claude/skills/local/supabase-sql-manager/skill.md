# Supabase SQL Manager Skill

**Purpose**: Manage Supabase migrations, functions, RLS policies, and schema synchronization using CLI automation. Prevents drift between local files and remote database.

**Use this skill for**:
- Creating/managing database migrations
- Deploying SQL functions and RLS policies
- Syncing local schema with remote Supabase
- Auditing and consolidating duplicate policies
- Best practices for Supabase development

## Installation Check

Before using this skill, verify Supabase CLI is installed:

```bash
supabase --version
```

If not installed:
```bash
brew install supabase/tap/supabase
```

## Core Commands

### 1. Schema Management

#### Pull Remote Schema to Local
```bash
# Pull current remote database schema
supabase db pull

# This creates a new migration file with current remote state
# File location: supabase/migrations/YYYYMMDDHHMMSS_remote_commit.sql
```

#### Push Local Migrations to Remote
```bash
# Push all pending migrations to remote
supabase db push

# Push and reset remote database (DANGEROUS - dev only)
supabase db push --reset
```

#### Check Migration Status
```bash
# See which migrations have been applied
supabase migration list

# See pending migrations
supabase db diff
```

### 2. Migration Best Practices

#### Create New Migration
```bash
# Create empty migration file
supabase migration new <description>

# Example:
supabase migration new consolidate_rls_policies
```

#### Idempotent Migration Pattern
Always use IF NOT EXISTS / IF EXISTS for safety:

```sql
-- Create table (idempotent)
CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create function (idempotent - use OR REPLACE)
CREATE OR REPLACE FUNCTION my_function()
RETURNS void AS $$
BEGIN
  -- function body
END;
$$ LANGUAGE plpgsql;

-- Create RLS policy (idempotent)
DROP POLICY IF EXISTS policy_name ON table_name;
CREATE POLICY policy_name ON table_name
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create index (idempotent)
CREATE INDEX IF NOT EXISTS idx_name ON table_name(column);
```

### 3. Function Management

#### List All Functions
```bash
# Query remote functions
supabase db execute "
SELECT
  n.nspname as schema,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;
"
```

#### Sync Functions to Migration
Best practice: Keep all functions in versioned migrations

```sql
-- In migration file: YYYYMMDD_functions.sql
-- Use OR REPLACE for idempotency

CREATE OR REPLACE FUNCTION get_user_stories(user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.title, s.created_at
  FROM stories s
  WHERE s.storyteller_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION get_user_stories IS 'Retrieves all stories for a given user';
```

### 4. RLS Policy Consolidation

#### Audit Policies
```bash
# List all policies
supabase db execute "
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
" > rls_audit.txt
```

#### Pattern: Consolidate CRUD Policies

**Anti-pattern** (4 separate policies):
```sql
CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY users_delete ON users FOR DELETE USING (auth.uid() = id);
```

**Better** (1 policy):
```sql
DROP POLICY IF EXISTS users_select ON users;
DROP POLICY IF EXISTS users_insert ON users;
DROP POLICY IF EXISTS users_update ON users;
DROP POLICY IF EXISTS users_delete ON users;

CREATE POLICY users_own_data ON users
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

#### Pattern: Use Helper Functions

Create reusable policy functions:

```sql
-- Helper function for tenant isolation
CREATE OR REPLACE FUNCTION is_tenant_member(tenant_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenant_members
    WHERE tenant_id = tenant_uuid
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Use in policies
CREATE POLICY tenant_isolation ON my_table
  FOR ALL
  USING (is_tenant_member(tenant_id))
  WITH CHECK (is_tenant_member(tenant_id));
```

### 5. Type Generation

Keep TypeScript types in sync:

```bash
# Generate TypeScript types from database
supabase gen types typescript --local > src/types/database.ts

# Or from remote
supabase gen types typescript --linked > src/types/database.ts
```

### 6. Reset & Seed Workflow

#### Local Development Reset
```bash
# Stop local database
supabase stop

# Start fresh
supabase start

# Apply all migrations
supabase db reset

# Seed with test data (if seed.sql exists)
# File: supabase/seed.sql
```

#### Seed File Pattern
```sql
-- supabase/seed.sql
-- Runs after migrations on `supabase db reset`

-- Insert test users
INSERT INTO profiles (id, email, display_name)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@test.com', 'Test Admin'),
  ('00000000-0000-0000-0000-000000000002', 'user@test.com', 'Test User');

-- Insert test data
-- ...
```

## Workflow: Making Schema Changes

### Option 1: Direct SQL (Preferred)
```bash
# 1. Create migration file
supabase migration new add_user_preferences

# 2. Edit file: supabase/migrations/YYYYMMDD_add_user_preferences.sql
# Add idempotent SQL

# 3. Test locally
supabase db reset  # Resets and applies all migrations

# 4. Push to remote
supabase db push
```

### Option 2: Pull Remote Changes
```bash
# If you made changes in Supabase Studio:

# 1. Pull changes to create migration
supabase db pull

# 2. Review the generated migration file

# 3. Commit to git
git add supabase/migrations/
git commit -m "Pull schema changes from remote"
```

## Preventing Drift

### Daily Workflow
```bash
# Morning: Sync from remote
supabase db pull

# Make local changes in migration files
supabase migration new my_changes

# Test locally
supabase db reset

# Push to remote
supabase db push

# Generate types
supabase gen types typescript --local > src/types/database.ts

# Commit everything
git add supabase/migrations/ src/types/database.ts
git commit -m "feat: add my changes"
```

### CI/CD Integration

Add to GitHub Actions:

```yaml
# .github/workflows/db-migrations.yml
name: Database Migrations

on:
  push:
    branches: [main]
    paths:
      - 'supabase/migrations/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link project
        run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      - name: Push migrations
        run: supabase db push
```

## RLS Policy Patterns

### Pattern 1: Multi-tenant Isolation
```sql
-- All tenant tables follow same pattern
CREATE POLICY tenant_isolation ON <table_name>
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members
      WHERE user_id = auth.uid()
    )
  );
```

### Pattern 2: Role-based Access
```sql
CREATE OR REPLACE FUNCTION user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY admin_full_access ON sensitive_table
  USING (user_has_role('admin'));
```

### Pattern 3: Service Role Bypass
Service role always bypasses RLS, so no need for service role policies:

```sql
-- ❌ WRONG - Unnecessary
CREATE POLICY service_role_access ON my_table
  TO service_role
  USING (true);

-- ✅ RIGHT - Service role already has full access
-- Just create policies for authenticated/anon roles
CREATE POLICY user_access ON my_table
  TO authenticated
  USING (user_id = auth.uid());
```

## Common Issues & Solutions

### Issue: "Relation does not exist"
```bash
# Solution: Apply migrations
supabase db reset  # local
supabase db push   # remote
```

### Issue: "Too many RLS policies"
```bash
# Solution: Consolidate using patterns above
# Create consolidation migration:
supabase migration new consolidate_policies

# In migration:
# 1. Drop duplicate policies
# 2. Create consolidated versions
# 3. Use helper functions
```

### Issue: "Local/remote out of sync"
```bash
# Check status
supabase db diff

# Pull remote to create migration
supabase db pull

# Review and test
supabase db reset

# Commit
git add supabase/migrations/
git commit -m "Sync with remote"
```

## Skill Usage Examples

### Example 1: Create User with this skill
```
User: "Create a new migration to add user preferences table"