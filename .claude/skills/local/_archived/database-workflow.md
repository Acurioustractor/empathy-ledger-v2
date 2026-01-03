# Database Workflow Skill

**Trigger Keywords:** database, migration, schema, supabase, postgres, db, sql, migrations

**Description:** Manages complete database workflow from status checks to migrations to schema validation.

---

## What This Skill Does

Automates the complete database management workflow:
1. ✅ Check database status (local/remote/migrations)
2. ✅ Validate migration files before applying
3. ✅ Apply migrations safely to production
4. ✅ Run schema validation
5. ✅ Generate TypeScript types
6. ✅ Provide rollback procedures if needed

---

## Usage Examples

**User says:**
- "Check database status"
- "Apply migrations"
- "Validate schema"
- "What migrations are pending?"
- "Run database health check"

**Skill automatically:**
1. Runs `npm run db:status`
2. Shows pending migrations
3. Validates migrations with `npm run validate:schema`
4. Offers to apply if safe
5. Verifies success

---

## Workflow Steps

### Step 1: Check Current State
```bash
npm run db:status
```

Shows:
- Local database: Running or not
- Remote database: Linked or not
- Migrations: Which are applied, which are pending

### Step 2: Validate Migrations
```bash
npm run validate:schema
```

Checks for:
- ❌ References to non-existent columns (deleted_at, excerpt, bio)
- ❌ `SELECT role FROM profiles` (should use profile_organizations)
- ❌ `CREATE INDEX CONCURRENTLY` in migrations
- ❌ Invalid foreign key references

### Step 3: Apply Migrations (If Validated)
```bash
# Local first (recommended)
npm run db:start
npm run db:migrate

# Then production (if local successful)
npm run db:migrate:remote
```

### Step 4: Verify Success
```bash
npm run db:status  # Should show all applied
npm run db:types   # Regenerate TypeScript types
```

---

## Safety Checks

**Before applying migrations, verify:**
- [ ] `npm run validate:schema` passes
- [ ] Migration tested locally (if possible)
- [ ] Rollback plan exists
- [ ] Backup is available (Supabase auto-backups daily)

**Red flags (DON'T APPLY):**
- ⚠️ References `deleted_at` column that doesn't exist
- ⚠️ Uses `SELECT role FROM profiles`
- ⚠️ No testing done locally
- ⚠️ Schema validation failed

---

## Common Patterns

### Pattern 1: Quick Status Check
```bash
npm run db:status
```

### Pattern 2: Full Health Check
```bash
npm run db:status
npm run validate:schema
npm run db:sql
# Then: SELECT * FROM get_table_stats() LIMIT 20;
```

### Pattern 3: Safe Migration Deploy
```bash
# 1. Validate first
npm run validate:schema

# 2. Test locally
npm run db:start
npm run db:migrate

# 3. If successful, deploy
npm run db:migrate:remote

# 4. Verify
npm run db:status
```

### Pattern 4: Rollback (If Needed)
```bash
npm run db:sql
# Manually run rollback SQL
# Or restore from Supabase Dashboard → Backups
```

---

## Known Schema Patterns (Empathy Ledger Specific)

### ✅ DO: Use profile_organizations for roles
```sql
EXISTS (
  SELECT 1 FROM profile_organizations
  WHERE profile_id = auth.uid()
  AND role IN ('admin', 'elder')
)
```

### ❌ DON'T: Query role from profiles
```sql
-- This column doesn't exist!
SELECT role FROM profiles WHERE id = auth.uid()
```

### ✅ DO: Simple indexes without deleted_at
```sql
CREATE INDEX idx_stories_org ON stories(organization_id);
```

### ❌ DON'T: Reference deleted_at (doesn't exist)
```sql
-- Most tables don't have this column!
WHERE deleted_at IS NULL
```

---

## Integration with Other Tools

### TypeScript Type Generation
After successful migration:
```bash
npm run db:types
# Regenerates src/types/database-generated.ts
```

### Local Development Setup
First time:
```bash
npm run db:start   # Start local Supabase
npm run db:sync    # Pull production schema
```

### SQL Console Access
```bash
npm run db:sql
# Interactive SQL prompt
# Choose: 1 = Local, 2 = Remote, 3 = Cancel
```

---

## Troubleshooting

### Migration Failed
1. Check error message
2. Run `npm run validate:schema`
3. Fix identified issues
4. Test locally: `npm run db:migrate`
5. Retry production: `npm run db:migrate:remote`

### Schema Drift Detected
1. Run `npm run db:pull`
2. Regenerate types: `npm run db:types`
3. Review changes
4. Update migrations if needed

### Local DB Not Starting
1. Check Docker Desktop is running
2. Run `npm run db:stop` then `npm run db:start`
3. Check logs: `docker logs supabase_db_empathy-ledger-v2`

---

## Files to Reference

- [DATABASE_WORKFLOW.md](/Users/benknight/Code/empathy-ledger-v2/DATABASE_WORKFLOW.md)
- [DATABASE_BEST_PRACTICES.md](/Users/benknight/Code/empathy-ledger-v2/DATABASE_BEST_PRACTICES.md)
- [scripts/db-connection.sh](/Users/benknight/Code/empathy-ledger-v2/scripts/db-connection.sh)
- [scripts/validate-database-schema.js](/Users/benknight/Code/empathy-ledger-v2/scripts/validate-database-schema.js)

---

## Success Criteria

After running this skill, user should have:
- ✅ Clear understanding of database state
- ✅ All pending migrations validated
- ✅ Migrations applied safely (if requested)
- ✅ TypeScript types up to date
- ✅ Confidence in database health
