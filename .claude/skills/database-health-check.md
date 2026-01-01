# Database Health Check Skill

**Trigger Keywords:** database health, db health, check database, database performance, slow queries, optimize database

**Description:** Runs comprehensive health checks on database and suggests optimizations.

---

## What This Skill Does

Performs a complete health check of the Empathy Ledger database:
1. ✅ Check migration status
2. ✅ Identify slow queries
3. ✅ Check table sizes and growth
4. ✅ Verify index usage
5. ✅ Check for orphaned records
6. ✅ Suggest optimizations

---

## Health Check Workflow

### Step 1: Basic Status Check
```bash
npm run db:status
```

Verify:
- ✅ Remote database linked
- ✅ All migrations applied
- ✅ No pending migrations (or review pending ones)

### Step 2: Schema Validation
```bash
npm run validate:schema
```

Should show:
- ✅ `All migration files passed validation`
- ❌ If errors, fix before continuing

### Step 3: Database Size & Table Stats
```bash
npm run db:sql
```

Then run:
```sql
-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC
LIMIT 20;
```

Expected largest tables:
- `stories` (largest - thousands of narrative records)
- `profiles` (164 columns! - user data)
- `transcripts` (59 columns - raw interview content)
- `audit_logs` (grows over time)
- `events` (partitioned by month)

### Step 4: Index Usage Check
```bash
npm run db:sql
```

```sql
-- Unused indexes (candidates for removal)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;
```

If `idx_scan = 0`, index is unused → consider removing.

### Step 5: Missing Indexes Check
```sql
-- Queries that could benefit from indexes
SELECT
  schemaname,
  tablename,
  seq_scan,  -- Sequential scans (slow)
  seq_tup_read,  -- Rows read sequentially
  idx_scan,  -- Index scans (fast)
  seq_tup_read / NULLIF(seq_scan, 0) AS avg_seq_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;
```

High `seq_scan` + `seq_tup_read` = needs index

### Step 6: Slow Query Log
Check Supabase Dashboard:
```
https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/logs/slow-queries
```

Look for:
- Queries taking >100ms
- Repeated patterns (same query appearing often)
- Full table scans (Seq Scan in EXPLAIN)

### Step 7: Row Count & Growth
```sql
-- Row counts by table
SELECT
  schemaname,
  tablename,
  n_live_tup AS row_count,
  n_dead_tup AS dead_rows,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC
LIMIT 20;
```

Monitor growth over time:
- Are tables growing as expected?
- High `dead_rows` → needs VACUUM

### Step 8: Foreign Key Integrity
```sql
-- Check for orphaned records (broken FK relationships)
-- Example: Stories without valid storytellers
SELECT COUNT(*)
FROM stories s
WHERE s.storyteller_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = s.storyteller_id
  );
```

Should return 0. If >0, data integrity issue.

### Step 9: RLS Policy Check
```sql
-- Tables without RLS enabled (security risk!)
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = FALSE
ORDER BY tablename;
```

All tables should have `rowsecurity = TRUE` (except system tables).

### Step 10: Backup Status
Check Supabase Dashboard:
```
https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/settings/backups
```

Verify:
- ✅ Daily backups enabled
- ✅ Latest backup exists (within 24 hours)
- ✅ Retention policy set (7-30 days recommended)

---

## Performance Benchmarks

### Target Metrics
- **Query response time:** <100ms (p95)
- **Page load time:** <1s (p95)
- **Index hit rate:** >95%
- **Cache hit rate:** >99%
- **Dead tuple ratio:** <5%

### Check Current Performance
```sql
-- Cache hit ratio (should be >0.99)
SELECT
  sum(heap_blks_read) as heap_read,
  sum(heap_blks_hit) as heap_hit,
  sum(heap_blks_hit) / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0) as cache_hit_ratio
FROM pg_statio_user_tables;

-- Index hit ratio (should be >0.95)
SELECT
  sum(idx_blks_read) as idx_read,
  sum(idx_blks_hit) as idx_hit,
  sum(idx_blks_hit) / NULLIF(sum(idx_blks_hit) + sum(idx_blks_read), 0) as index_hit_ratio
FROM pg_statio_user_indexes;
```

---

## Common Issues & Fixes

### Issue 1: Slow Queries
**Symptom:** Pages loading slowly, Supabase logs show slow queries

**Diagnosis:**
```sql
-- Find slow queries
SELECT * FROM pg_stat_statements
WHERE mean_exec_time > 100  -- queries taking >100ms
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Fix:**
1. Add missing indexes
2. Optimize query (reduce JOINs, add WHERE clauses)
3. Consider materialized views for complex queries

### Issue 2: Table Bloat
**Symptom:** Database size growing, dead rows accumulating

**Diagnosis:**
```sql
SELECT
  schemaname,
  tablename,
  n_dead_tup,
  n_live_tup,
  ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_percentage
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY dead_percentage DESC;
```

**Fix:**
```sql
-- Manual vacuum
VACUUM ANALYZE;

-- Or specific table
VACUUM ANALYZE stories;
```

### Issue 3: Missing Indexes
**Symptom:** High sequential scan counts

**Diagnosis:**
```sql
SELECT * FROM pg_stat_user_tables
WHERE seq_scan > idx_scan * 10  -- Much more seq scans than index scans
ORDER BY seq_scan DESC;
```

**Fix:**
- Create migration to add index on frequently queried columns
- See [database-migration-planner.md] skill

### Issue 4: Unused Indexes
**Symptom:** Database size growing, indexes never used

**Diagnosis:**
```sql
SELECT * FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Fix:**
- Create migration to drop unused indexes
- Monitor for 30 days first to confirm truly unused

### Issue 5: Orphaned Records
**Symptom:** Data integrity warnings, foreign key violations

**Diagnosis:**
```sql
-- Check all FK relationships for orphans
-- (Run for each important table/relationship)
```

**Fix:**
- Add CASCADE DELETE to foreign keys
- Clean up orphaned records
- See Phase 1 fix: `20260101000001_fix_harvested_outcomes_cascade.sql`

---

## Optimization Recommendations

### Based on Current Schema

**Completed (Phase 1):**
- ✅ Added critical indexes on stories, transcripts, profiles
- ✅ Removed 9 unused tables
- ✅ Fixed CASCADE DELETE on harvested_outcomes

**Next Priorities:**

1. **Add composite indexes for hot queries**
   ```sql
   -- Organization + status filtering (very common)
   CREATE INDEX idx_stories_org_status ON stories(organization_id, status);

   -- Storyteller + date range queries
   CREATE INDEX idx_transcripts_storyteller_created
     ON transcripts(storyteller_id, created_at DESC);
   ```

2. **Partition large tables**
   ```sql
   -- events table (partition by month)
   -- audit_logs table (partition by month)
   -- Already done: events_2024_01, events_2025_08, events_2025_09
   ```

3. **Create materialized views for dashboards**
   ```sql
   -- Pre-compute organization stats
   CREATE MATERIALIZED VIEW org_dashboard_stats AS
   SELECT
     o.id,
     COUNT(DISTINCT s.id) as story_count,
     COUNT(DISTINCT t.id) as transcript_count,
     COUNT(DISTINCT p.id) as member_count
   FROM organizations o
   LEFT JOIN stories s ON s.organization_id = o.id
   LEFT JOIN transcripts t ON t.organization_id = o.id
   LEFT JOIN profile_organizations po ON po.organization_id = o.id
   LEFT JOIN profiles p ON p.id = po.profile_id
   GROUP BY o.id;

   -- Refresh daily
   CREATE INDEX ON org_dashboard_stats(id);
   ```

4. **Archive old audit logs**
   ```sql
   -- Move audit_logs older than 90 days to cold storage
   -- Keep only recent logs in hot database
   ```

---

## Monitoring Setup

### Weekly Checks (Mondays, 5 minutes)
```bash
# 1. Database status
npm run db:status

# 2. Schema validation
npm run validate:schema

# 3. Slow query review
# Open: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/logs/slow-queries

# 4. Table sizes
npm run db:sql
# Run: SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
#      FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size DESC LIMIT 10;
```

### Monthly Checks (30 minutes)
```bash
# 1. Full health check (all steps above)

# 2. Performance benchmarks
# Document query times, page loads

# 3. Backup verification
# Supabase Dashboard → Backups

# 4. Update documentation
# Add learnings to DATABASE_BEST_PRACTICES.md
```

### Quarterly Audit (2 hours)
- Review all RLS policies
- Check for orphaned data
- Update database documentation
- Plan next phase optimizations

---

## Success Metrics

After health check, you should know:
- ✅ Database is healthy (no critical issues)
- ✅ All migrations applied
- ✅ Indexes are being used effectively
- ✅ No orphaned records
- ✅ Backups are working
- ✅ Performance is within benchmarks
- ✅ Clear action items if issues found

---

## Files to Reference

- [DATABASE_BEST_PRACTICES.md](/Users/benknight/Code/empathy-ledger-v2/DATABASE_BEST_PRACTICES.md)
- [DATABASE_STRATEGY.md](/Users/benknight/Code/empathy-ledger-v2/DATABASE_STRATEGY.md)
- [HOW_TO_CONTINUE_IMPROVING.md](/Users/benknight/Code/empathy-ledger-v2/HOW_TO_CONTINUE_IMPROVING.md)

---

## Report Template

```markdown
# Database Health Report - [Date]

## Summary
- Status: HEALTHY / NEEDS ATTENTION / CRITICAL
- Tables: [count]
- Size: [total size]
- Migrations: [applied/pending]

## Metrics
- Cache hit ratio: [percentage]
- Index hit ratio: [percentage]
- Slow queries: [count]
- Largest tables: [list top 5]

## Issues Found
1. [Issue description]
   - Severity: LOW/MEDIUM/HIGH
   - Fix: [action item]

## Recommendations
1. [Recommendation]
2. [Recommendation]

## Next Steps
- [ ] Action item 1
- [ ] Action item 2
```
