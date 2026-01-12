# Migration Process

## Recommended Methods

### Method 1: Supabase CLI (Best for local dev)
```bash
# Link project (one-time)
npx supabase link --project-ref yvnuayzslukamizrlhwb

# Create migration
npx supabase migration new my_migration_name

# Preview changes
npx supabase db push --dry-run

# Apply to production
npx supabase db push

# Generate types
npx supabase gen types typescript --project-ref yvnuayzslukamizrlhwb > src/types/database-generated.ts
```

### Method 2: Dashboard SQL Editor (Best for single migrations)
1. Go to: supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new
2. Copy SQL from migration file
3. Paste and Run
4. Works 100% of time, no connection issues

## Don't Use
- ❌ Direct psql connections (routing issues)
- ❌ Management API for raw SQL (doesn't exist)

## Idempotent SQL Patterns
```sql
-- Tables
CREATE TABLE IF NOT EXISTS ...

-- Functions
CREATE OR REPLACE FUNCTION ...

-- Policies (drop first)
DROP POLICY IF EXISTS name ON table;
CREATE POLICY name ON table ...

-- Indexes
CREATE INDEX IF NOT EXISTS ...
```

## Migration Conflicts
If CLI fails with "already exists", use Dashboard SQL Editor to run new migrations only.
