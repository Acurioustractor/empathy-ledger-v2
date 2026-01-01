# Supabase Connection & Process Skill

Complete guide for Supabase database connections, migrations, and operational processes.

## Project Details

**Project:** Empathy Ledger v2
**Project ID:** `yvnuayzslukamizrlhwb`
**Region:** ap-southeast-2 (Sydney, AWS)

## Connection URLs

### Pooler Connection (Default for API Routes)
```
postgresql://postgres.yvnuayzslukamizrlhwb:PASSWORD@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres
```
- **Use for:** API routes, serverless functions, high concurrency
- **Max connections:** Pooled (handles many concurrent requests)

### Direct Connection (For Migrations & Admin)
```
postgresql://postgres.yvnuayzslukamizrlhwb:PASSWORD@db.yvnuayzslukamizrlhwb.supabase.co:5432/postgres
```
- **Use for:** Database migrations, admin tasks, direct SQL execution
- **Max connections:** Limited (6 concurrent connections)

### Connection Test
```bash
# Test pooler connection
PGPASSWORD="Drillsquare99" psql -h aws-0-ap-southeast-2.pooler.supabase.com -p 6543 -U postgres.yvnuayzslukamizrlhwb -d postgres -c "SELECT NOW();"

# Test direct connection
PGPASSWORD="Drillsquare99" psql -h db.yvnuayzslukamizrlhwb.supabase.co -p 5432 -U postgres.yvnuayzslukamizrlhwb -d postgres -c "SELECT NOW();"
```

## Environment Variables

### Required in `.env.local`
```env
# Public keys (safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://yvnuayzslukamizrlhwb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-only keys (NEVER expose to browser)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ACCESS_TOKEN=sbp_1da91af0dc38edbafcc7eddb12c068b343c0706b

# Database connection (for migrations/admin)
DATABASE_URL=postgresql://postgres.yvnuayzslukamizrlhwb:Drillsquare99@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres
```

## Client Types & Usage

### 1. Browser Client (React Components)
**File:** `src/lib/supabase/client.ts`

```typescript
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

// In React components
const supabase = createSupabaseBrowserClient()

// Respects Row Level Security (RLS)
// Uses cookies for authentication
// Session automatically managed
```

**Use for:**
- Client components
- User-facing queries
- Real-time subscriptions

### 2. Server Client (API Routes, Server Components)
**File:** `src/lib/supabase/client-ssr.ts`

```typescript
import { createSupabaseServerClient } from '@/lib/supabase/client-ssr'

// In API routes or server components
const supabase = createSupabaseServerClient()

// Respects Row Level Security (RLS)
// Uses server-side session
// Requires user authentication
```

**Use for:**
- API route handlers
- Server components
- Server actions
- Middleware

### 3. Service Role Client (Admin Operations)
**File:** `src/lib/supabase/service-role-client.ts`

```typescript
import { createSupabaseServiceClient } from '@/lib/supabase/service-role-client'

// For admin/system operations
const supabase = createSupabaseServiceClient()

// BYPASSES Row Level Security
// Full database access
// Use with extreme caution
```

**Use for:**
- Background jobs
- System migrations
- Batch operations
- Admin endpoints

## Migration Process

### ✅ Method 1: Supabase CLI (BEST for local development)

**Prerequisites:**
```bash
# Link to project (one-time setup)
npx supabase link --project-ref yvnuayzslukamizrlhwb --password "Drillsquare99"
```

**Workflow:**
```bash
# 1. Generate new migration
npx supabase migration new my_migration_name

# 2. Write your SQL in supabase/migrations/YYYYMMDDHHMMSS_my_migration_name.sql

# 3. Preview what will be applied (recommended!)
npx supabase db push --dry-run

# 4. Push migrations to production
npx supabase db push

# 5. Generate TypeScript types from schema
npx supabase gen types typescript --project-ref yvnuayzslukamizrlhwb > src/types/database-generated.ts
```

**How it works:**
- Creates `supabase_migrations.schema_migrations` table on first run
- Tracks which migrations have been applied by timestamp
- Only applies new migrations (skips already-applied ones)
- Runs migrations in transaction (rolls back on error)

**When to use:**
- Applying multiple migrations at once
- Team development (everyone uses same migration files)
- CI/CD pipelines
- Local-to-production workflow

**Connection method:**
- Uses direct connection (not pooler)
- Connects to `db.yvnuayzslukamizrlhwb.supabase.co:5432`
- Requires linking via `supabase link` first

---

### ✅ Method 2: Supabase Dashboard SQL Editor (BEST for single migrations)

1. Go to https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new
2. Copy migration SQL from `supabase/migrations/` file
3. Paste into editor
4. Click "Run" (or Cmd/Ctrl + Enter)
5. Verify success in output pane

**When to use:**
- Running single migration file
- CLI connection issues
- Testing SQL interactively
- Quick fixes or hotfixes
- Debugging migration issues
- User doesn't have CLI installed

**Advantages:**
- Works 100% of the time (no connection issues)
- Visual feedback
- Can run partial SQL
- No local setup needed

**Disadvantages:**
- Doesn't track migration history automatically
- Manual process (not scriptable)
- Need to manually verify migration applied

---

### ❌ Method 3: Direct psql (NOT RECOMMENDED)

**Why it doesn't work well:**
```bash
# Pooler connection (port 6543) - FAILS with "Tenant or user not found"
PGPASSWORD="Drillsquare99" psql \
  -h aws-0-ap-southeast-2.pooler.supabase.com \
  -p 6543 \
  -U postgres.yvnuayzslukamizrlhwb \
  -d postgres \
  -f migration.sql
# ERROR: Tenant or user not found

# Direct connection (port 5432) - FAILS with network/routing issues
PGPASSWORD="Drillsquare99" psql \
  -h db.yvnuayzslukamizrlhwb.supabase.co \
  -p 5432 \
  -U postgres.yvnuayzslukamizrlhwb \
  -d postgres \
  -f migration.sql
# ERROR: dial tcp [...]:5432: connect: no route to host
```

**Issue:** Supabase's network routing doesn't allow direct psql connections from most environments. The pooler is for application connections, not admin operations.

**Only use psql for:**
- Interactive queries (not migrations)
- Local Supabase instance
- Testing connection credentials

---

### ❌ Method 4: Supabase Management API (NOT AVAILABLE)

**Does NOT exist:** There is no Management API endpoint for executing arbitrary SQL queries.

**Why:** Security and safety - allowing raw SQL execution via HTTP would be dangerous.

**What exists instead:**
- Management API for project settings, secrets, edge functions
- PostgREST API for data operations (CRUD via REST)
- Database functions via RPC (`supabase.rpc()`)

**Don't try:**
```typescript
// This doesn't work ❌
await fetch(`${SUPABASE_URL}/rest/v1/rpc/_exec_sql`, {
  body: JSON.stringify({ query: migrationSQL })
})
// Returns 404 - endpoint doesn't exist
```

---

## ✅ RECOMMENDED Migration Workflow

### For New Projects
```bash
# 1. Link project
npx supabase link --project-ref yvnuayzslukamizrlhwb

# 2. Create migration
npx supabase migration new add_feature_name

# 3. Write migration SQL (use idempotent patterns)

# 4. Test locally
npx supabase db reset  # Recreates local DB and applies all migrations

# 5. Preview production changes
npx supabase db push --dry-run

# 6. Apply to production
npx supabase db push
```

### For Existing Projects with Migration Conflicts

If `supabase db push` fails with "already exists" errors:

**Option A: Use Dashboard SQL Editor**
- Copy new migration file only
- Paste and run in Dashboard
- Skip CLI entirely

**Option B: Mark Old Migrations as Applied**
```sql
-- Create migrations table if it doesn't exist
CREATE SCHEMA IF NOT EXISTS supabase_migrations;

CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version TEXT PRIMARY KEY,
  statements TEXT[],
  name TEXT
);

-- Mark old migrations as applied (prevents re-running them)
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES
  ('20251214', 'world_tour_tables'),
  ('20251220090000', 'saas_org_tier')
ON CONFLICT (version) DO NOTHING;

-- Now run: npx supabase db push
-- Only new migrations will be applied
```

---

## Writing Idempotent Migrations

**Always use these patterns:**

```sql
-- Types
CREATE TYPE IF NOT EXISTS my_enum AS ENUM ('value1', 'value2');

-- Tables
CREATE TABLE IF NOT EXISTS my_table (...);

-- Columns (can't use IF NOT EXISTS - use DO block instead)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'my_table' AND column_name = 'new_column'
  ) THEN
    ALTER TABLE my_table ADD COLUMN new_column TEXT;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_name ON table(column);

-- Policies (must drop first)
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name" ON table_name FOR ALL USING (true);

-- Triggers (must drop first)
DROP TRIGGER IF EXISTS trigger_name ON table_name;
CREATE TRIGGER trigger_name ...

-- Functions (use CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION my_function()
RETURNS void AS $$
BEGIN
  -- function body
END;
$$ LANGUAGE plpgsql;
```

## Common Connection Issues

### Issue 1: "Tenant or user not found"
**Cause:** Wrong connection URL or port
**Solution:** Use direct connection URL, not pooler, for migrations
```bash
# WRONG (pooler - for app connections)
-h aws-0-ap-southeast-2.pooler.supabase.com -p 6543

# CORRECT (direct - for migrations)
-h db.yvnuayzslukamizrlhwb.supabase.co -p 5432
```

### Issue 2: "Too many connections"
**Cause:** Direct connection limit exceeded
**Solution:** Use pooler for application, or close existing connections
```bash
# Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'postgres';

# Close idle connections (careful!)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND state = 'idle'
  AND pid != pg_backend_pid();
```

### Issue 3: Migration already applied
**Cause:** Migration ran partially or migration table out of sync
**Solution:** Check `supabase_migrations` table
```sql
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC;
```

### Issue 4: Index/Policy already exists
**Fix in migration file:**
```sql
-- Add IF NOT EXISTS
CREATE INDEX IF NOT EXISTS idx_name ON table(column);

-- Drop first if exists
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name" ON table_name FOR ALL USING (true);

DROP TRIGGER IF EXISTS trigger_name ON table_name;
CREATE TRIGGER trigger_name ...
```

## Database Best Practices

### 1. Always Filter by tenant_id
```typescript
// CORRECT - Multi-tenant isolation
const { data } = await supabase
  .from('stories')
  .select('*')
  .eq('tenant_id', userTenantId)
  .eq('status', 'published')

// WRONG - Leaks data across tenants
const { data } = await supabase
  .from('stories')
  .select('*')
  .eq('status', 'published')
```

### 2. Use RLS Policies
```sql
-- Enable RLS on all tables
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see stories in their tenant
CREATE POLICY "Users see own tenant stories"
  ON stories FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );
```

### 3. Index Foreign Keys
```sql
-- Always index foreign key columns for join performance
CREATE INDEX idx_stories_storyteller_id ON stories(storyteller_id);
CREATE INDEX idx_stories_tenant_id ON stories(tenant_id);
CREATE INDEX idx_stories_project_id ON stories(project_id);
```

### 4. Use Transactions for Multi-Step Operations
```typescript
// Create story and media in transaction
const { data, error } = await supabase.rpc('create_story_with_media', {
  p_story: storyData,
  p_media: mediaData
})

// Or use service role client for complex operations
```

## Type Generation

### Generate Types from Schema
```bash
# Local schema
npx supabase gen types typescript --local > src/types/database-generated.ts

# Remote schema (production)
npx supabase gen types typescript --project-ref yvnuayzslukamizrlhwb > src/types/database-generated.ts

# With custom schema
npx supabase gen types typescript --schema public,auth > src/types/database-generated.ts
```

### Use Generated Types
```typescript
import type { Database } from '@/types/database-generated'

// Type-safe queries
const { data } = await supabase
  .from('stories')
  .select('id, title, storyteller:profiles(display_name)')
  .returns<Array<{
    id: string
    title: string
    storyteller: { display_name: string }
  }>>()
```

## Query Patterns

### Get Related Data (JOIN)
```typescript
// Stories with storyteller and project
const { data } = await supabase
  .from('stories')
  .select(`
    *,
    storyteller:profiles!stories_storyteller_id_fkey(
      id, display_name, cultural_background
    ),
    project:projects(id, name)
  `)
  .eq('status', 'published')
```

### Count Without Fetching Data
```typescript
const { count } = await supabase
  .from('stories')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'published')
```

### Pagination
```typescript
const pageSize = 20
const page = 1

const { data, count } = await supabase
  .from('stories')
  .select('*', { count: 'exact' })
  .range((page - 1) * pageSize, page * pageSize - 1)
  .order('created_at', { ascending: false })
```

### Array Operations
```typescript
// Stories with ANY of these themes
const { data } = await supabase
  .from('stories')
  .select('*')
  .overlaps('ai_themes', ['identity', 'heritage'])

// Stories with ALL of these themes
const { data } = await supabase
  .from('stories')
  .select('*')
  .contains('ai_themes', ['identity', 'heritage'])
```

## Real-time Subscriptions

```typescript
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const supabase = createSupabaseBrowserClient()

// Subscribe to story changes
const subscription = supabase
  .channel('story-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'stories',
      filter: `tenant_id=eq.${tenantId}`,
    },
    (payload) => {
      console.log('New story:', payload.new)
    }
  )
  .subscribe()

// Cleanup
subscription.unsubscribe()
```

## Database Functions (RPC)

### Calling Database Functions
```typescript
// Call custom function
const { data, error } = await supabase.rpc('calculate_tenant_analytics', {
  tenant_uuid: tenantId
})

// Function with JSON return
const { data } = await supabase.rpc('get_story_suggestions', {
  storyteller_id: userId,
  theme: 'healing'
})
```

### Creating Database Functions
```sql
CREATE OR REPLACE FUNCTION calculate_tenant_analytics(tenant_uuid UUID)
RETURNS TABLE (
  total_stories BIGINT,
  total_storytellers BIGINT,
  avg_reading_time NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT s.id)::BIGINT as total_stories,
    COUNT(DISTINCT s.storyteller_id)::BIGINT as total_storytellers,
    AVG(s.reading_time_minutes) as avg_reading_time
  FROM stories s
  WHERE s.tenant_id = tenant_uuid
    AND s.status = 'published';
END;
$$ LANGUAGE plpgsql STABLE;
```

## Migration Template

```sql
-- Migration: YYYYMMDDHHMMSS_descriptive_name.sql
-- Description: What this migration does

BEGIN;

-- 1. Create tables
CREATE TABLE IF NOT EXISTS table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,

  -- Your columns here
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_name_per_tenant UNIQUE(tenant_id, name)
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_table_name_tenant ON table_name(tenant_id);

-- 3. Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- 4. Create policies
DROP POLICY IF EXISTS "Users see own tenant data" ON table_name;
CREATE POLICY "Users see own tenant data"
  ON table_name FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 5. Create triggers (if needed)
DROP TRIGGER IF EXISTS update_table_name_updated_at ON table_name;
CREATE TRIGGER update_table_name_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

## Monitoring & Debugging

### Check Migration Status
```sql
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 10;
```

### View Active Queries
```sql
SELECT pid, usename, state, query, query_start
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND state != 'idle'
ORDER BY query_start DESC;
```

### Check Table Sizes
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
```

### Index Usage
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## Emergency Procedures

### Rollback Migration
```bash
# If migration failed mid-way
PGPASSWORD="Drillsquare99" psql \
  -h db.yvnuayzslukamizrlhwb.supabase.co \
  -p 5432 \
  -U postgres.yvnuayzslukamizrlhwb \
  -d postgres \
  -c "ROLLBACK;"

# Manually remove from migrations table
DELETE FROM supabase_migrations.schema_migrations
WHERE version = 'YYYYMMDDHHMMSS';
```

### Reset Connections
```sql
-- Terminate all connections except yours
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'postgres'
  AND pid != pg_backend_pid()
  AND usename = 'postgres';
```

## Testing Checklist

- [ ] Migration runs without errors
- [ ] Indexes created successfully
- [ ] RLS policies working correctly
- [ ] Triggers firing as expected
- [ ] Foreign key constraints valid
- [ ] Type generation includes new tables
- [ ] API queries work with new schema
- [ ] Rollback plan documented

## When to Use This Skill

Invoke when:
- Running database migrations
- Debugging connection issues
- Setting up new Supabase clients
- Creating database functions
- Generating TypeScript types
- Implementing RLS policies
- Optimizing database queries
- Troubleshooting tenant isolation

---

**Dashboard:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb
**Documentation:** https://supabase.com/docs
**Support:** #supabase-support

## ⚡ Quick Reference

### Most Common Commands

```bash
# Local Development
npx supabase start                    # Start local Supabase
npx supabase db reset                 # Reset DB + apply all migrations
npx supabase stop                     # Stop local Supabase

# Migrations
npx supabase migration new <name>     # Create new migration
npx supabase db push --dry-run        # Preview changes
npx supabase db push                  # Apply to production

# Types
npx supabase gen types typescript --project-ref yvnuayzslukamizrlhwb > src/types/database-generated.ts
```

### Emergency: Clean Start

If migrations are a mess, see **`docs/DATABASE_STRATEGY.md`** for comprehensive cleanup approach.

---

## Related Documentation

- **📘 Database Strategy:** `docs/DATABASE_STRATEGY.md` (READ THIS FIRST)
- **📗 Migration Guide:** `docs/HOW_TO_RUN_PERMISSION_TIERS_MIGRATION.md`
- **📙 Research Summary:** `docs/MIGRATION_RESEARCH_SUMMARY.md`

---

**Last Updated:** December 24, 2025
**Strategy:** Use Supabase CLI (`npx supabase db push`) for all migrations going forward
