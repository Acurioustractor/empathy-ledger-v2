# Phase 1: Critical Security Fixes - Deployment Guide

**Status**: ✅ Migrations Ready
**Priority**: 🚨 BLOCKING - Must complete before production deployment
**Estimated Time**: 1-2 hours
**Risk Level**: Low (RLS is additive, no data changes)

---

## What This Phase Does

**Problem**: 55 tables (27% of schema) have NO Row-Level Security, exposing sensitive data including:
- User profiles (email, phone, PII)
- Storyteller analytics and insights
- Organization analytics and enrichment
- Financial data (payouts)
- Privacy change audit logs

**Solution**: Enable RLS on all 55 tables with appropriate multi-tenant policies.

---

## Pre-Deployment Checklist

Before applying migrations:

- [ ] **Backup database**: `pg_dump > backup_before_phase1.sql`
- [ ] **Test environment**: Apply to staging/dev first
- [ ] **Verify baseline**: Confirm `20260111000000_baseline_from_production.sql` is applied
- [ ] **Connection ready**: Ensure Supabase CLI or psql access
- [ ] **Rollback plan**: Review rollback procedures below

---

## Deployment Steps

### Step 1: Apply Migrations (Sequential Order)

```bash
# Navigate to project root
cd /Users/benknight/Code/empathy-ledger-v2

# Apply migrations via Supabase CLI (recommended)
supabase db push

# OR apply manually via psql
psql $DATABASE_URL -f supabase/migrations/20260112000001_profiles_rls_security.sql
psql $DATABASE_URL -f supabase/migrations/20260112000002_rls_storyteller_tables.sql
psql $DATABASE_URL -f supabase/migrations/20260112000003_rls_organization_tables.sql
psql $DATABASE_URL -f supabase/migrations/20260112000004_rls_content_tables.sql
psql $DATABASE_URL -f supabase/migrations/20260112000005_rls_internal_tables.sql
```

**Expected Output** (from each migration):
```
NOTICE: SUCCESS: RLS enabled on <table_name>
NOTICE: <Category> tables secured: X of X
COMMIT
```

**Migration Order** (must be sequential):
1. `20260112000001` - Profiles (MOST CRITICAL - PII exposure)
2. `20260112000002` - Storyteller tables
3. `20260112000003` - Organization tables
4. `20260112000004` - Content tables
5. `20260112000005` - Internal/system tables

### Step 2: Verify RLS Coverage

```bash
# Run verification script
psql $DATABASE_URL -f scripts/verify-rls-coverage.sql
```

**Expected Output**:
```
═══════════════════════════════════════════════════════
  PRODUCTION READINESS CHECK - PHASE 1 RLS SECURITY
═══════════════════════════════════════════════════════

Total tables in public schema: 207
Tables WITH RLS: 207
Tables WITHOUT RLS: 0
RLS Coverage: 100.0%

✅ EXCELLENT: 100% RLS coverage achieved!

✅ PRODUCTION READINESS: PHASE 1 COMPLETE
   Database is now safe for production deployment.

Next steps:
  - Review Phase 2 (schema cleanup) plan
  - Test with all user roles
  - Monitor trigger execution logs

═══════════════════════════════════════════════════════
```

**If you see failures**:
- Review the "Tables WITHOUT RLS" section
- Check for migration errors in logs
- Verify table names match baseline migration

### Step 3: Test with All User Roles

Test that policies work correctly for each role:

```typescript
// Test script (scripts/test-rls-policies.ts)

// 1. Test as regular user
const { data: ownProfile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
// Expected: ✅ Can see own profile

const { data: otherProfiles } = await supabase
  .from('profiles')
  .select('*')
  .neq('id', userId);
// Expected: ✅ Returns empty array (can't see others)

// 2. Test as organization admin
const { data: orgMembers } = await supabase
  .from('profiles')
  .select('*');
// Expected: ✅ Can see profiles in their org only

// 3. Test as super admin
const { data: allProfiles } = await supabase
  .from('profiles')
  .select('*');
// Expected: ✅ Can see all profiles
```

Run comprehensive test suite:
```bash
npm run test:rls
```

### Step 4: Monitor for Issues

After deployment, monitor for 24-48 hours:

```sql
-- Check for RLS-related errors in logs
SELECT * FROM error_logs
WHERE error_message LIKE '%policy%'
  OR error_message LIKE '%RLS%'
  OR error_message LIKE '%permission denied%'
ORDER BY created_at DESC
LIMIT 50;

-- Check query performance impact
SELECT
  query,
  mean_exec_time,
  stddev_exec_time,
  calls
FROM pg_stat_statements
WHERE query LIKE '%FROM profiles%'
  OR query LIKE '%FROM storyteller_%'
ORDER BY mean_exec_time DESC
LIMIT 20;
```

---

## Success Criteria

Phase 1 is complete when ALL of the following are true:

- ✅ **100% RLS coverage** - All 207 tables have `rowsecurity = TRUE`
- ✅ **Zero PII exposure** - `profiles`, `privacy_changes`, `storyteller_payouts` secured
- ✅ **Policy verification** - All critical tables have at least 1 policy
- ✅ **Role testing passed** - User, Admin, Elder, Super Admin roles work correctly
- ✅ **No access errors** - Existing queries still work (policies don't block legitimate access)
- ✅ **Performance acceptable** - Queries < 10% slower (RLS adds minimal overhead)

---

## Rollback Plan

If issues are found, rollback is simple (RLS is additive, no data changes):

### Option 1: Rollback Individual Tables
```sql
-- Disable RLS on specific table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop policies
DROP POLICY "Users can view own profile" ON public.profiles;
-- ... (drop all policies for that table)
```

### Option 2: Rollback Entire Migration
```sql
-- Run the down migration comments at bottom of each file
-- Example from 20260112000001_profiles_rls_security.sql:

BEGIN;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Org admins can view member profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update profiles" ON public.profiles;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
COMMIT;
```

### Option 3: Restore from Backup
```bash
# If catastrophic failure, restore from pre-deployment backup
psql $DATABASE_URL < backup_before_phase1.sql
```

**Rollback Impact**: Minimal
- No data loss (RLS only adds policies, doesn't modify data)
- Immediate effect (policies removed = full access restored)
- Can rollback individual tables without affecting others

---

## Troubleshooting

### Issue: "permission denied for table X"

**Cause**: Policy too restrictive, blocking legitimate access
**Fix**: Review policy logic, may need to add additional USING clause

```sql
-- Example: Add organization context to policy
CREATE POLICY "Org members can view stories"
  ON stories
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid()
    )
  );
```

### Issue: "infinite recursion detected in policy"

**Cause**: Policy references same table it's protecting
**Fix**: Restructure policy to avoid circular reference

```sql
-- WRONG: Circular reference
CREATE POLICY "test"
  ON profiles
  USING (
    EXISTS (
      SELECT 1 FROM profiles p2  -- ❌ Queries profiles from profiles policy
      WHERE p2.id = profiles.id
    )
  );

-- RIGHT: Use auth.uid() or junction table
CREATE POLICY "test"
  ON profiles
  USING (auth.uid() = id);  -- ✅ No circular reference
```

### Issue: Queries much slower after RLS

**Cause**: Complex policy with expensive subqueries
**Fix**: Add indexes for policy columns

```sql
-- If policy checks organization_members frequently
CREATE INDEX idx_org_members_profile_lookup
  ON organization_members(profile_id, organization_id);
```

### Issue: Service role bypassing RLS

**Expected**: Service role (backend) should bypass RLS
**Not a bug**: Use service role for admin operations, anon/authenticated for user queries

---

## Post-Deployment Tasks

After Phase 1 is stable:

1. **Update documentation**
   - [ ] Add RLS patterns to [docs/04-database/RLS_PATTERNS.md](RLS_PATTERNS.md)
   - [ ] Document policy exceptions in [CASCADE_RULES.md](CASCADE_RULES.md)

2. **Code review**
   - [ ] Review API routes using service role (should they use authenticated?)
   - [ ] Audit direct Supabase queries for RLS compatibility

3. **Prepare Phase 2**
   - [ ] Review [schema cleanup plan](../../.claude/plans/sprightly-beaming-balloon.md)
   - [ ] Schedule Phase 2 deployment window

---

## Files Created in Phase 1

```
supabase/migrations/
├── 20260112000001_profiles_rls_security.sql          (CRITICAL - PII)
├── 20260112000002_rls_storyteller_tables.sql         (11 tables)
├── 20260112000003_rls_organization_tables.sql        (7 tables)
├── 20260112000004_rls_content_tables.sql             (6 tables)
└── 20260112000005_rls_internal_tables.sql            (11 tables)

scripts/
└── verify-rls-coverage.sql                            (Verification)

docs/04-database/
└── PHASE_1_DEPLOYMENT_GUIDE.md                        (This file)
```

---

## Security Impact

**Before Phase 1**:
- 🚨 55 tables exposed (no RLS)
- 🚨 Any authenticated user could query ALL profiles
- 🚨 Organization data visible across tenants
- 🚨 Storyteller analytics publicly accessible

**After Phase 1**:
- ✅ 207 tables secured (100% RLS coverage)
- ✅ Users can only see own profile + org members
- ✅ Organization data isolated by tenant_id
- ✅ Storyteller analytics restricted to owner + org admins

**Production Readiness**: 🚫 BLOCKED → ✅ READY (for Phase 1)

---

## Next Steps

Once Phase 1 is stable (24-48 hours no issues):

1. **Phase 2**: Schema cleanup (archive 144 unused tables)
2. **Phase 3**: Data flow optimization (composite indexes)
3. **Phase 4**: Production safety (trigger logging, monitoring)
4. **Phase 5**: Validation & testing

**Minimum viable**: Phase 1 only (1-2 days)
**Complete overhaul**: All phases (2-3 weeks)

See main plan: [sprightly-beaming-balloon.md](../../.claude/plans/sprightly-beaming-balloon.md)
