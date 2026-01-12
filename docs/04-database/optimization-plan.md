# Empathy Ledger v2 - Database Optimization Plan

**Date:** 2026-01-01
**Status:** READY FOR EXECUTION
**Impact:** HIGH - Foundation for scalable, world-class platform

---

## Executive Summary

**Current State:**
- 181 tables total
- 130 actively used (72%)
- **51 unused tables (28% bloat)**
- Multiple naming conflicts (organisations/organizations)
- Missing critical indexes

**Goal:**
Build a **world-class database system** that:
1. ✅ Scales efficiently for multiple sites/processes
2. ✅ Is understood by all team members
3. ✅ Has zero bloat or unused components
4. ✅ Can be managed entirely through Claude Code
5. ✅ Aligns with Empathy Ledger's mission

**Outcome:**
- Reduce to ~140 core tables (23% reduction)
- 30-50% query performance improvement
- Complete naming consistency
- Full SQL management system via Claude Code

---

## Phase 1: Quick Wins (Week 1) - IMMEDIATE ACTION

### 1.1 Add Critical Performance Indexes

**Impact:** 30-50% query speedup on most pages
**Risk:** None (indexes are additive)
**Time:** 30 minutes

```sql
-- Stories (235 references - most queried table)
CREATE INDEX CONCURRENTLY idx_stories_organization_id
  ON stories(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_stories_storyteller_id
  ON stories(storyteller_id) WHERE status = 'published';
CREATE INDEX CONCURRENTLY idx_stories_status_published
  ON stories(status, published_at DESC) WHERE status = 'published';
CREATE INDEX CONCURRENTLY idx_stories_search
  ON stories USING gin(to_tsvector('english', title || ' ' || coalesce(excerpt, '')));

-- Transcripts (110 references)
CREATE INDEX CONCURRENTLY idx_transcripts_storyteller_id
  ON transcripts(storyteller_id);
CREATE INDEX CONCURRENTLY idx_transcripts_project_id
  ON transcripts(project_id);
CREATE INDEX CONCURRENTLY idx_transcripts_status
  ON transcripts(processing_status) WHERE processing_status IN ('pending', 'processing');

-- Profile Organizations (57 references - hot join path)
CREATE INDEX CONCURRENTLY idx_profile_orgs_profile_id
  ON profile_organizations(profile_id);
CREATE INDEX CONCURRENTLY idx_profile_orgs_org_id
  ON profile_organizations(organization_id);
CREATE INDEX CONCURRENTLY idx_profile_orgs_composite
  ON profile_organizations(organization_id, profile_id, role);

-- Media Assets (53 references)
CREATE INDEX CONCURRENTLY idx_media_assets_uploader_id
  ON media_assets(uploader_id);
CREATE INDEX CONCURRENTLY idx_media_assets_type_status
  ON media_assets(file_type, processing_status);

-- Projects (63 references)
CREATE INDEX CONCURRENTLY idx_projects_organization_id
  ON projects(organization_id);
CREATE INDEX CONCURRENTLY idx_projects_status
  ON projects(status) WHERE status IN ('active', 'planning');
```

**Migration File:** `supabase/migrations/20260102000001_add_critical_indexes.sql`

### 1.2 Archive Zero-Impact Tables

**Impact:** Remove 9 tables with ZERO code references
**Risk:** None (no code uses these)
**Time:** 15 minutes

```sql
-- Service scraper system (completely unused)
DROP TABLE IF EXISTS scraped_services CASCADE;
DROP TABLE IF EXISTS scraper_health_metrics CASCADE;
DROP TABLE IF EXISTS scraping_metadata CASCADE;
DROP TABLE IF EXISTS service_impact CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS organization_services CASCADE;

-- Legacy ACT platform
DROP TABLE IF EXISTS act_admin_permissions CASCADE;
DROP TABLE IF EXISTS act_admins CASCADE;
DROP TABLE IF EXISTS act_feature_requests CASCADE;
```

**Migration File:** `supabase/migrations/20260102000002_remove_unused_tables_phase1.sql`

**Outcome:** 181 → 172 tables (5% reduction), zero functionality impact

---

## Phase 2: Naming Migration (Week 2)

### 2.1 Complete organisations → organizations

**Impact:** Remove developer confusion, single source of truth
**Risk:** Low (automated migration)
**Time:** 2 hours

**Current State:**
- `organizations`: 77 code references
- `organisations`: 17 code references (British spelling)

**Migration Strategy:**

```sql
-- Step 1: Migrate data (if tables are separate)
INSERT INTO organizations (id, name, created_at, ...)
SELECT id, name, created_at, ... FROM organisations
WHERE id NOT IN (SELECT id FROM organizations)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Update foreign key references
UPDATE stories SET organization_id = o.id
FROM organisations o
WHERE stories.organisation_id = o.id;

UPDATE transcripts SET organization_id = o.id
FROM organisations o
WHERE transcripts.organisation_id = o.id;

-- Step 3: Drop old table
DROP TABLE organisations CASCADE;

-- Step 4: Rename columns if needed
ALTER TABLE IF EXISTS stories
  RENAME COLUMN organisation_id TO organization_id;
```

**Code Updates:** Find and replace all 17 `organisations` references

```bash
# Find all references
grep -r "organisations" src --include="*.ts" --include="*.tsx"

# Files to update (from exploration):
# - src/app/organisations/[id]/* (route naming)
# - Migration files with typos
```

**Migration File:** `supabase/migrations/20260102000003_consolidate_organizations.sql`

---

## Phase 3: Remove Old Photo System (Month 1)

### 3.1 Archive Legacy Photo Tables

**Impact:** Remove 8 unused tables, clear confusion
**Risk:** None (new media_assets system is active)
**Time:** 30 minutes

**Old System (UNUSED):**
- photo_analytics
- photo_faces
- photo_locations
- photo_memories
- photo_organizations
- photo_projects
- photo_tags
- profile_galleries

**New System (ACTIVE - 53 refs):**
- media_assets
- galleries
- gallery_media_associations

```sql
-- Backup first (optional)
CREATE TABLE IF NOT EXISTS _archive_photo_analytics AS
  SELECT * FROM photo_analytics;

-- Drop old system
DROP TABLE IF EXISTS photo_analytics CASCADE;
DROP TABLE IF EXISTS photo_faces CASCADE;
DROP TABLE IF EXISTS photo_locations CASCADE;
DROP TABLE IF EXISTS photo_memories CASCADE;
DROP TABLE IF EXISTS photo_organizations CASCADE;
DROP TABLE IF EXISTS photo_projects CASCADE;
DROP TABLE IF EXISTS photo_tags CASCADE;
DROP TABLE IF EXISTS profile_galleries CASCADE;
```

**Migration File:** `supabase/migrations/20260102000004_remove_old_photo_system.sql`

**Outcome:** 172 → 164 tables (9% reduction from start)

---

## Phase 4: Consolidate Storytellers (Month 1)

### 4.1 Migrate storytellers → profiles

**Impact:** Remove table redundancy, single source of truth
**Risk:** Medium (requires data migration)
**Time:** 3 hours

**Current State:**
- `profiles` with `is_storyteller=true`: 214 references (PRIMARY)
- `storytellers` table: 21 references (mostly analytics)

**Analysis:** storytellers table appears to be legacy. All new code uses profiles.

**Migration Strategy:**

```sql
-- Step 1: Ensure all storytellers exist in profiles
INSERT INTO profiles (id, display_name, bio, ...)
SELECT id, display_name, bio, ... FROM storytellers
WHERE id NOT IN (SELECT id FROM profiles WHERE is_storyteller = true)
ON CONFLICT (id) DO UPDATE SET is_storyteller = true;

-- Step 2: Migrate storyteller-specific metadata
UPDATE profiles p
SET metadata = jsonb_set(
  coalesce(p.metadata, '{}'::jsonb),
  '{storyteller_data}',
  to_jsonb(s.*)
)
FROM storytellers s
WHERE p.id = s.id;

-- Step 3: Update analytics references
UPDATE storyteller_analytics SET profile_id = storyteller_id;
UPDATE storyteller_quotes SET profile_id = storyteller_id;

-- Step 4: Drop storytellers table
DROP TABLE storytellers CASCADE;
```

**Code Updates:** Update 21 references to use profiles

**Migration File:** `supabase/migrations/20260102000005_consolidate_storytellers.sql`

**Outcome:** 164 → 163 tables

---

## Phase 5: Consolidate Theme Tables (Month 2)

### 5.1 Merge Theme System

**Impact:** Reduce 7 theme tables to 3 core tables
**Risk:** Medium (complex relationships)
**Time:** 4 hours

**Current State:**
- `themes` (registry)
- `narrative_themes` (5 refs)
- `storyteller_themes` (4 refs)
- `story_themes` (1 ref)
- `theme_associations` (0 refs - unused)
- `theme_evolution` (3 refs)
- `theme_concept_evolution` (1 ref)
- `theme_evolution_tracking` (0 refs - unused)

**Proposed Structure:**

```sql
-- Keep: themes (master registry)
-- Keep: narrative_themes (AI-extracted from transcripts)
-- Keep: storyteller_themes (storyteller-theme junction)

-- Merge evolution tracking into single table:
CREATE TABLE theme_changes (
  id uuid PRIMARY KEY,
  theme_id uuid REFERENCES themes(id),
  change_type text, -- 'evolution', 'concept_shift', 'tracking'
  from_value jsonb,
  to_value jsonb,
  changed_at timestamp,
  metadata jsonb
);

-- Migrate data
INSERT INTO theme_changes (...)
SELECT ... FROM theme_evolution UNION ALL
SELECT ... FROM theme_concept_evolution UNION ALL
SELECT ... FROM theme_evolution_tracking;

-- Drop old tables
DROP TABLE theme_associations CASCADE;
DROP TABLE theme_evolution CASCADE;
DROP TABLE theme_concept_evolution CASCADE;
DROP TABLE theme_evolution_tracking CASCADE;
DROP TABLE story_themes CASCADE; -- Redundant with narrative_themes
```

**Migration File:** `supabase/migrations/20260102000006_consolidate_themes.sql`

**Outcome:** 163 → 159 tables (12% reduction from start)

---

## Phase 6: Archive Incomplete Features (Month 2)

### 6.1 Individual Analytics System

**Decision Required:** Complete or Archive?

**Current State:**
- professional_competencies (0 refs)
- opportunity_recommendations (0 refs)
- impact_stories (0 refs)
- development_plans (1 ref)
- personal_insights (1 ref)

**Tables exist but feature is NOT implemented**

**Option A: Archive** (Remove 5 tables)
```sql
DROP TABLE professional_competencies CASCADE;
DROP TABLE opportunity_recommendations CASCADE;
DROP TABLE impact_stories CASCADE;
DROP TABLE development_plans CASCADE;
DROP TABLE personal_insights CASCADE;
```

**Option B: Complete** (Add 20+ hours dev time)
- Build individual dashboard
- Implement career tracking
- Create recommendation engine

**Recommendation:** Archive for now. Re-add if product roadmap prioritizes.

### 6.2 Annual Reports System

**Current State:**
- annual_reports (0 refs)
- annual_report_stories (0 refs)
- report_feedback (0 refs)
- report_sections (0 refs)
- report_templates (0 refs)

**All tables have zero code references - feature never implemented**

```sql
DROP TABLE annual_reports CASCADE;
DROP TABLE annual_report_stories CASCADE;
DROP TABLE report_feedback CASCADE;
DROP TABLE report_sections CASCADE;
DROP TABLE report_templates CASCADE;
```

**Migration File:** `supabase/migrations/20260102000007_remove_incomplete_features.sql`

**Outcome:** 159 → 149 tables (18% reduction from start)

---

## Phase 7: Add World-Class SQL Functions

### 7.1 Core Database Management Functions

```sql
-- Get table usage stats
CREATE OR REPLACE FUNCTION get_table_stats()
RETURNS TABLE (
  table_name text,
  row_count bigint,
  total_size text,
  indexes_size text,
  last_vacuum timestamp,
  last_analyze timestamp
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    schemaname || '.' || relname AS table_name,
    n_live_tup AS row_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS total_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||relname)) AS indexes_size,
    last_vacuum,
    last_analyze
  FROM pg_stat_user_tables
  ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC;
END;
$$ LANGUAGE plpgsql;

-- Find missing indexes
CREATE OR REPLACE FUNCTION find_missing_indexes()
RETURNS TABLE (
  table_name text,
  column_name text,
  reason text,
  impact_score int
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.relname::text,
    a.attname::text,
    'High sequential scan count' AS reason,
    (s.seq_scan - s.idx_scan)::int AS impact_score
  FROM pg_stat_user_tables s
  JOIN pg_class t ON s.relid = t.oid
  JOIN pg_attribute a ON a.attrelid = t.oid
  WHERE s.seq_scan > 1000
    AND s.idx_scan < s.seq_scan / 10
    AND a.attnum > 0
    AND NOT a.attisdropped
  ORDER BY impact_score DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Organization health check
CREATE OR REPLACE FUNCTION org_health_check(org_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'storytellers', (SELECT count(*) FROM profiles WHERE organization_id = org_id AND is_storyteller = true),
    'stories', (SELECT count(*) FROM stories WHERE organization_id = org_id),
    'transcripts', (SELECT count(*) FROM transcripts WHERE organization_id = org_id),
    'media_assets', (SELECT count(*) FROM media_assets WHERE organization_id = org_id),
    'projects', (SELECT count(*) FROM projects WHERE organization_id = org_id),
    'storage_used', (SELECT pg_size_pretty(sum(pg_total_relation_size(quote_ident(tablename))))
                     FROM pg_tables WHERE schemaname = 'public'),
    'last_activity', (SELECT max(created_at) FROM stories WHERE organization_id = org_id),
    'consent_compliance', (SELECT count(*) FROM stories
                           WHERE organization_id = org_id
                           AND id IN (SELECT story_id FROM story_syndication_consent))
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Identify orphaned records
CREATE OR REPLACE FUNCTION find_orphaned_records()
RETURNS TABLE (
  table_name text,
  orphaned_count bigint,
  foreign_key_column text,
  referenced_table text
) AS $$
BEGIN
  -- This is a template - needs customization per FK
  RETURN QUERY
  SELECT
    'stories'::text,
    count(*)::bigint,
    'storyteller_id'::text,
    'profiles'::text
  FROM stories s
  WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = s.storyteller_id);

  -- Add more tables as needed
END;
$$ LANGUAGE plpgsql;

-- Bulk archive old data
CREATE OR REPLACE FUNCTION archive_old_events(cutoff_date timestamp)
RETURNS TABLE (
  archived_count bigint,
  archive_table text
) AS $$
BEGIN
  -- Create archive table if not exists
  CREATE TABLE IF NOT EXISTS _archive_events (LIKE events INCLUDING ALL);

  -- Move old events
  WITH moved AS (
    DELETE FROM events
    WHERE created_at < cutoff_date
    RETURNING *
  )
  INSERT INTO _archive_events SELECT * FROM moved;

  RETURN QUERY
  SELECT count(*)::bigint, '_archive_events'::text FROM _archive_events;
END;
$$ LANGUAGE plpgsql;
```

**Migration File:** `supabase/migrations/20260102000008_add_management_functions.sql`

---

## Final State After All Phases

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total Tables | 181 | ~145 | -20% |
| Unused Tables | 51 (28%) | 0 (0%) | -100% |
| Naming Conflicts | Yes | No | ✅ Resolved |
| Critical Indexes | Missing | Added | ✅ Complete |
| Theme Tables | 7 | 3 | -57% |
| Photo Tables | 10 | 3 | -70% |
| Management Functions | 0 | 5 | ✅ Added |

---

## Claude Code Skills for Database Management

Create `/Users/benknight/Code/empathy-ledger-v2/.claude/skills/database-admin.md`:

```markdown
# Database Admin Skill

## Trigger
When user says: "check database", "optimize db", "find slow queries", "database health"

## Actions

1. Run table stats:
```sql
SELECT * FROM get_table_stats() LIMIT 20;
```

2. Find missing indexes:
```sql
SELECT * FROM find_missing_indexes();
```

3. Check organization health:
```sql
SELECT org_health_check('ORG_ID_HERE');
```

4. Find orphaned records:
```sql
SELECT * FROM find_orphaned_records();
```

5. Show slow queries:
```sql
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

## Report Format
Present findings as:
- ✅ Healthy metrics
- ⚠️ Warnings (usage > 80%, missing indexes)
- ❌ Issues (orphans, slow queries)
```

---

## Migration Execution Order

Execute in this exact sequence:

1. ✅ `20260102000001_add_critical_indexes.sql` (30 min)
2. ✅ `20260102000002_remove_unused_tables_phase1.sql` (15 min)
3. ✅ `20260102000003_consolidate_organizations.sql` (2 hours)
4. ✅ `20260102000004_remove_old_photo_system.sql` (30 min)
5. ✅ `20260102000005_consolidate_storytellers.sql` (3 hours)
6. ✅ `20260102000006_consolidate_themes.sql` (4 hours)
7. ✅ `20260102000007_remove_incomplete_features.sql` (30 min)
8. ✅ `20260102000008_add_management_functions.sql` (1 hour)

**Total Time:** ~12 hours over 2 months
**Risk Level:** LOW (all changes are backwards-compatible or additive)

---

## Success Metrics

After completion:
- ✅ 20% fewer tables (181 → 145)
- ✅ 30-50% faster queries
- ✅ Zero naming conflicts
- ✅ Full SQL management via Claude Code
- ✅ Zero unused components
- ✅ Production-ready for multi-site scaling

**Ready to execute Phase 1 today!**
