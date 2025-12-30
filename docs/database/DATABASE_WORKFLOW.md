# Database Management Workflow

## Quick Reference

### Daily Workflow
```bash
# 1. Sync remote changes to local
npm run db:pull

# 2. Make changes in migration files
#    Edit: supabase/migrations/YYYYMMDD_description.sql

# 3. Test locally
npm run db:reset

# 4. Deploy to remote
npm run db:push
```

### Interactive Management
```bash
# Launch interactive menu
npm run db:sync

# Options:
# 1) Pull remote → local (creates migration)
# 2) Push local → remote (deploys)
# 3) Create new migration file
# 4) Reset local database
# 5) Generate TypeScript types
# 6) Audit RLS policies
# 7) List migrations
# 8) Diff local vs remote
# 9) Full sync workflow
```

### Individual Commands
```bash
npm run db:pull      # Pull remote schema → local migration + types
npm run db:push      # Push local migrations → remote
npm run db:reset     # Reset local database (dev only)
npm run db:audit     # Analyze RLS policies
npm run db:types     # Generate TypeScript types from remote
npm run db:types:local # Generate from local
```

## Making Schema Changes

### Option 1: Local First (Recommended)
```bash
# 1. Create migration
supabase migration new add_feature

# 2. Edit file: supabase/migrations/YYYYMMDD_add_feature.sql
# Add your SQL (always idempotent!)

# 3. Test locally
npm run db:reset

# 4. Generate types
npm run db:types:local

# 5. Deploy to remote
npm run db:push

# 6. Commit
git add supabase/migrations/ src/types/
git commit -m "feat: add feature"
```

### Option 2: Remote First (Supabase Studio)
```bash
# 1. Make changes in Supabase Studio UI

# 2. Pull to local (creates migration)
npm run db:pull

# 3. Review the generated migration file
cat supabase/migrations/YYYYMMDD_remote_commit.sql

# 4. Commit
git add supabase/migrations/ src/types/
git commit -m "feat: pull schema changes"
```

## Writing Migrations

### Always Use Idempotent Patterns

**Tables**:
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
```

**Functions**:
```sql
CREATE OR REPLACE FUNCTION my_func()
RETURNS void AS $$
BEGIN
  -- code
END;
$$ LANGUAGE plpgsql;
```

**RLS Policies**:
```sql
DROP POLICY IF EXISTS policy_name ON table_name;
CREATE POLICY policy_name ON table_name
  FOR SELECT USING (auth.uid() = user_id);
```

**Indexes**:
```sql
CREATE INDEX IF NOT EXISTS idx_name
  ON table_name(column);
```

## RLS Policy Best Practices

### ❌ Anti-Pattern: Separate CRUD Policies
```sql
CREATE POLICY users_select ON users FOR SELECT ...;
CREATE POLICY users_insert ON users FOR INSERT ...;
CREATE POLICY users_update ON users FOR UPDATE ...;
CREATE POLICY users_delete ON users FOR DELETE ...;
```

### ✅ Better: Consolidated Policy
```sql
CREATE POLICY users_own_data ON users
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### ✅ Best: Helper Functions
```sql
-- Create reusable helper
CREATE OR REPLACE FUNCTION is_tenant_member(tenant_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_members
    WHERE tenant_id = tenant_uuid
    AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Use in policies
CREATE POLICY tenant_isolation ON my_table
  FOR ALL
  USING (is_tenant_member(tenant_id))
  WITH CHECK (is_tenant_member(tenant_id));
```

## Common Issues

### Issue: Local/Remote Out of Sync
```bash
# Check differences
supabase db diff

# Pull remote
npm run db:pull

# Review and commit
git diff supabase/migrations/
```

### Issue: Too Many RLS Policies
```bash
# Audit current policies
npm run db:audit

# Create consolidation migration
supabase migration new consolidate_policies

# See docs/RLS_POLICY_AUDIT.md for patterns
```

### Issue: Migration Failed
```bash
# Check error
supabase db push

# Fix migration file
nano supabase/migrations/YYYYMMDD_broken.sql

# Test locally first
npm run db:reset

# Try again
npm run db:push
```

## CI/CD Integration

Migrations are automatically deployed via GitHub Actions when pushed to main:

```yaml
# .github/workflows/db-migrations.yml
# Automatically runs on push to main
```

## Supabase CLI Skill

For advanced operations, use the `/supabase` skill:

```
/supabase create migration for user preferences
/supabase consolidate RLS policies for stories table
/supabase audit database performance
```

The skill has access to:
- Supabase best practices
- RLS policy patterns
- Performance optimization
- Migration templates
- Type safety patterns

## Safety & Rollback

### What's Safe vs What's Dangerous

**SAFE Operations** (No risk of data loss):
- `npm run db:pull` - Only downloads schema to local files
- `npm run db:types` - Only generates TypeScript files
- `npm run db:reset` - Only affects local Docker database
- `supabase migration list` - Read-only
- `supabase db diff` - Read-only comparison

**REQUIRES CONFIRMATION** (Modifies remote):
- `npm run db:push` - Shows confirmation prompt before pushing
- Script will ask: "Are you sure? This will modify remote database (y/N)"

**DANGEROUS** (Never run in production):
- `supabase db push --reset` - Wipes remote database
- Never use outside of development

### Rollback Procedures

#### Undo a Bad Migration Push
```bash
# 1. Identify the bad migration
supabase migration list

# 2. Create rollback migration
supabase migration new rollback_bad_change

# 3. Write SQL to reverse changes
# Edit: supabase/migrations/YYYYMMDD_rollback_bad_change.sql
# Example:
# DROP TABLE IF EXISTS bad_table;
# ALTER TABLE users DROP COLUMN bad_column;

# 4. Test locally
npm run db:reset

# 5. Push fix
npm run db:push
```

#### Restore from Git
```bash
# If you pulled unwanted remote changes:
git checkout HEAD -- supabase/migrations/
git clean -fd supabase/migrations/

# If you made local changes you want to discard:
git restore supabase/migrations/
```

#### Emergency: Restore Remote Database
```bash
# Supabase provides automatic backups
# Go to: Dashboard → Database → Backups
# Or use CLI:
supabase db dump --use-copy
```

### Pre-Flight Checklist

Before running `npm run db:push`:
- [ ] Committed all migration files to git
- [ ] Tested locally with `npm run db:reset`
- [ ] Reviewed migration SQL for idempotency
- [ ] Confirmed no DROP TABLE for production tables
- [ ] Notified team if deploying to shared environment

## Resources

- **RLS Audit**: [docs/RLS_POLICY_AUDIT.md](./RLS_POLICY_AUDIT.md)
- **Supabase Skill**: [.claude/skills/supabase-sql-manager/skill.md](../.claude/skills/supabase-sql-manager/skill.md)
- **Official Docs**: https://supabase.com/docs/guides/database/migrations
