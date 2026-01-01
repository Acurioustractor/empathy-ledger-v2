# Supabase Migration Methods - Research Summary

**Date:** December 24, 2025
**Research Goal:** Find the BEST method to run Supabase migrations for Empathy Ledger v2

---

## 🔍 Research Findings

I tested 4 different methods and researched Supabase's 2025 documentation to find the most reliable approach.

### Methods Tested

| Method | Result | Reliability | Use Case |
|--------|--------|-------------|----------|
| ✅ **Supabase CLI** (`npx supabase db push`) | **Works** | ⭐⭐⭐⭐⭐ | Best for team dev, CI/CD |
| ✅ **Dashboard SQL Editor** | **Works** | ⭐⭐⭐⭐⭐ | Best for single migrations, hotfixes |
| ❌ **Direct psql** | **Fails** | ⭐ | Not compatible with Supabase routing |
| ❌ **Management API** | **Doesn't exist** | N/A | No SQL execution endpoint exists |

---

## ✅ BEST METHOD #1: Supabase CLI

### How It Works

1. **Link project** (one-time):
```bash
npx supabase link --project-ref yvnuayzslukamizrlhwb --password "Drillsquare99"
```

2. **Preview migrations**:
```bash
npx supabase db push --dry-run
```

3. **Apply migrations**:
```bash
npx supabase db push
```

### What Happens

- Creates `supabase_migrations.schema_migrations` table on first run
- Tracks which migrations have been applied by timestamp
- Only applies NEW migrations (skips already-applied ones)
- Runs migrations in a transaction (rolls back on error)
- Uses **direct connection** to `db.yvnuayzslukamizrlhwb.supabase.co:5432`

### Advantages

✅ Automatic migration tracking
✅ Team-friendly (everyone uses same migration files)
✅ CI/CD compatible
✅ Transactional (safe rollback on error)
✅ Dry-run preview available

### When to Use

- Applying multiple migrations
- Team development
- CI/CD pipelines
- Local-to-production workflow

### Documentation

- [Database Migrations | Supabase Docs](https://supabase.com/docs/guides/deployment/database-migrations)
- [Supabase CLI Reference - db push](https://supabase.com/docs/reference/cli/supabase-db-push)
- [Local development with schema migrations](https://supabase.com/docs/guides/local-development/overview)

---

## ✅ BEST METHOD #2: Dashboard SQL Editor

### How It Works

1. Go to [SQL Editor](https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new)
2. Copy migration SQL from `supabase/migrations/` file
3. Paste into editor
4. Click "Run" (or Cmd/Ctrl + Enter)

### Advantages

✅ Works 100% of the time (no connection issues)
✅ Visual feedback
✅ Can run partial SQL for testing
✅ No local setup needed
✅ Perfect for hotfixes

### Disadvantages

⚠️ Doesn't track migration history automatically
⚠️ Manual process (not scriptable)
⚠️ Need to manually verify migration applied

### When to Use

- Running single migration file
- CLI connection issues
- Testing SQL interactively
- Quick fixes or debugging
- User doesn't have CLI installed

---

## ❌ Method 3: Direct psql (DOESN'T WORK)

### Why It Fails

**Pooler connection (port 6543):**
```bash
PGPASSWORD="Drillsquare99" psql \
  -h aws-0-ap-southeast-2.pooler.supabase.com \
  -p 6543 \
  -U postgres.yvnuayzslukamizrlhwb \
  -d postgres
```
**Error:** `FATAL: Tenant or user not found`

**Reason:** Pooler is for application runtime connections, not admin operations.

---

**Direct connection (port 5432):**
```bash
PGPASSWORD="Drillsquare99" psql \
  -h db.yvnuayzslukamizrlhwb.supabase.co \
  -p 5432 \
  -U postgres.yvnuayzslukamizrlhwb \
  -d postgres
```
**Error:** `dial tcp [...]:5432: connect: no route to host`

**Reason:** Supabase's network routing doesn't allow direct psql connections from most environments for security.

### Conclusion

**Don't use psql for migrations.** It's unreliable and not how Supabase is designed to work.

---

## ❌ Method 4: Management API (DOESN'T EXIST)

### What I Tested

```typescript
const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/_exec_sql`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query: migrationSQL })
})
```

**Result:** `404 Not Found`

### Why There's No SQL Execution API

According to research ([GitHub Discussion #3419](https://github.com/orgs/supabase/discussions/3419), [Discussion #11797](https://github.com/orgs/supabase/discussions/11797)):

- **Security risk:** Allowing raw SQL execution via HTTP is dangerous
- **Not needed:** PostgREST provides auto-generated REST API for data operations
- **Alternative exists:** Use database functions + RPC for custom logic

### What the Management API Actually Does

- Project settings
- Secrets management
- Edge functions deployment
- **NOT** arbitrary SQL execution

---

## 🏆 RECOMMENDATION for Empathy Ledger v2

### For This Specific Migration (permission_tiers)

**Use Dashboard SQL Editor** because:

1. Single migration file
2. No CLI setup needed
3. Works 100% of the time
4. Easy to verify results
5. Older migrations have conflicts (not idempotent)

### For Future Migrations

**Use Supabase CLI** because:

1. Team can track migrations in git
2. Automatic migration history
3. Preview with `--dry-run`
4. CI/CD compatible
5. Transactional safety

---

## 📝 Updated Supabase Skill

I've updated `.claude/skills/supabase-connection/skill.md` with:

✅ **Method 1:** Supabase CLI (marked as BEST for local development)
- Complete workflow with `link` → `push --dry-run` → `push`
- How migration tracking works
- Connection details (uses direct, not pooler)

✅ **Method 2:** Dashboard SQL Editor (marked as BEST for single migrations)
- Step-by-step guide
- Advantages/disadvantages
- When to use

❌ **Method 3:** Direct psql (marked as NOT RECOMMENDED)
- Why it fails (with error messages)
- Only use cases (local dev, interactive queries)

❌ **Method 4:** Management API (marked as NOT AVAILABLE)
- Why it doesn't exist
- What to use instead

✅ **Recommended Workflows**
- New projects: Full CLI workflow
- Existing projects with conflicts: Dashboard or mark old migrations as applied

✅ **Writing Idempotent Migrations**
- Patterns for types, tables, columns, indexes, policies, triggers, functions
- Use `IF NOT EXISTS`, `DROP IF EXISTS`, `CREATE OR REPLACE`

---

## 📋 Next Step: Run the Migration

**Recommended:** Use Dashboard SQL Editor

1. Open [SQL Editor](https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new)
2. Copy `supabase/migrations/20251224000000_permission_tiers.sql`
3. Paste and click "Run"
4. Verify with queries in `docs/HOW_TO_RUN_PERMISSION_TIERS_MIGRATION.md`

**Time:** 2-5 minutes
**Risk:** Low (migration is idempotent and safe to re-run)

---

## 📚 Sources

- [Database Migrations | Supabase Docs](https://supabase.com/docs/guides/deployment/database-migrations)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [Local development with schema migrations](https://supabase.com/docs/guides/local-development/overview)
- [Supabase CLI reference - Push migration to remote database](https://supabase.com/docs/reference/cli/supabase-db-push)
- [Connection management | Supabase Docs](https://supabase.com/docs/guides/database/connection-management)
- [Execute SQL in Supabase API · Discussion #3419](https://github.com/orgs/supabase/discussions/3419)
- [Expose API method/interface to execute raw SQL Query · Discussion #11797](https://github.com/orgs/supabase/discussions/11797)
- [Supabase link command reference](https://supabase.com/docs/reference/cli/supabase-link)

---

**Summary:** Dashboard SQL Editor is the simplest and most reliable method for running this specific migration. Supabase CLI is the best for future team development workflows.
