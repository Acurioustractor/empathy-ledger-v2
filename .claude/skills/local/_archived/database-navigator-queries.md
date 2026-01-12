# Database Navigator - Query Guide

**Companion to:** `database-navigator.md`
**Purpose:** Ready-to-use SQL queries for navigating Supabase database

**Full documentation:** `docs/04-database/SUPABASE_COMPLETE_OVERVIEW.md`

---

## Quick Database Connection

```bash
PGDATABASE=postgres \
PGHOST=aws-1-ap-southeast-2.pooler.supabase.com \
PGPORT=6543 \
PGUSER=postgres.yvnuayzslukamizrlhwb \
PGPASSWORD=kedxah-qaxsap-jUhwo5 \
psql
```

**Alias** (add to `~/.bashrc`):
```bash
alias eldb='PGDATABASE=postgres PGHOST=aws-1-ap-southeast-2.pooler.supabase.com PGPORT=6543 PGUSER=postgres.yvnuayzslukamizrlhwb PGPASSWORD=kedxah-qaxsap-jUhwo5 psql'
```

---

## Common Navigation Patterns

### 1. Find Stories by Theme

**Quick lookup:**
```sql
SELECT id, title, storyteller_id, cultural_themes
FROM stories
WHERE 'healing' = ANY(cultural_themes)
  AND status = 'published'
  AND is_public = true
LIMIT 10;
```

**With storyteller details:**
```sql
SELECT
  s.id,
  s.title,
  s.cultural_themes,
  st.display_name as storyteller,
  st.avatar_url
FROM stories s
JOIN storytellers st ON s.storyteller_id = st.id
WHERE 'connection' = ANY(s.cultural_themes)
  AND s.status = 'published'
ORDER BY s.created_at DESC;
```

### 2. Explore Storyteller Data

**Get storyteller with stats:**
```sql
SELECT
  st.id,
  st.display_name,
  st.bio,
  st.cultural_background,
  st.avatar_url,
  COUNT(s.id) as story_count,
  array_agg(DISTINCT theme) as all_themes
FROM storytellers st
LEFT JOIN stories s ON s.storyteller_id = st.id
CROSS JOIN LATERAL unnest(s.cultural_themes) as theme
WHERE st.id = 'uuid-here'
GROUP BY st.id;
```

**Find storytellers by theme:**
```sql
SELECT DISTINCT
  st.id,
  st.display_name,
  COUNT(s.id) as stories_with_theme
FROM storytellers st
JOIN stories s ON s.storyteller_id = st.id
WHERE 'resilience' = ANY(s.cultural_themes)
GROUP BY st.id, st.display_name
ORDER BY stories_with_theme DESC;
```

### 3. Theme Analysis

**Theme frequency across all stories:**
```sql
SELECT
  theme,
  COUNT(*) as story_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM stories WHERE status = 'published'), 2) as percentage
FROM stories
CROSS JOIN LATERAL unnest(cultural_themes) as theme
WHERE status = 'published'
GROUP BY theme
ORDER BY story_count DESC
LIMIT 20;
```

**Theme co-occurrence (which themes appear together):**
```sql
SELECT
  t1.theme as theme_1,
  t2.theme as theme_2,
  COUNT(*) as co_occurrence_count
FROM (
  SELECT id, unnest(cultural_themes) as theme
  FROM stories
  WHERE status = 'published'
) t1
JOIN (
  SELECT id, unnest(cultural_themes) as theme
  FROM stories
  WHERE status = 'published'
) t2 ON t1.id = t2.id AND t1.theme < t2.theme
GROUP BY t1.theme, t2.theme
ORDER BY co_occurrence_count DESC
LIMIT 20;
```

**Theme evolution over time:**
```sql
SELECT
  DATE_TRUNC('month', s.created_at) as month,
  theme,
  COUNT(*) as usage_count
FROM stories s
CROSS JOIN LATERAL unnest(s.cultural_themes) as theme
WHERE s.status = 'published'
  AND s.created_at > NOW() - INTERVAL '1 year'
GROUP BY month, theme
ORDER BY month DESC, usage_count DESC;
```

### 4. Organization Data

**Organization with impact metrics:**
```sql
SELECT
  o.id,
  o.name,
  o.mission,
  COUNT(DISTINCT s.id) as total_stories,
  COUNT(DISTINCT st.id) as total_storytellers,
  array_agg(DISTINCT theme) as themes
FROM organizations o
LEFT JOIN stories s ON s.organization_id = o.id
LEFT JOIN storytellers st ON s.storyteller_id = st.id
CROSS JOIN LATERAL unnest(s.cultural_themes) as theme
WHERE o.id = 'org-uuid'
GROUP BY o.id;
```

**Organizations by storyteller count:**
```sql
SELECT
  o.name,
  COUNT(DISTINCT om.profile_id) as member_count,
  COUNT(DISTINCT s.storyteller_id) as storyteller_count,
  COUNT(s.id) as story_count
FROM organizations o
LEFT JOIN organization_members om ON om.organization_id = o.id
LEFT JOIN stories s ON s.organization_id = o.id
GROUP BY o.id, o.name
ORDER BY storyteller_count DESC;
```

### 5. Data Quality Checks

**Avatar coverage:**
```sql
SELECT
  'Storytellers total' as metric,
  COUNT(*) as count
FROM storytellers
UNION ALL
SELECT
  'With avatars',
  COUNT(*)
FROM storytellers
WHERE avatar_url IS NOT NULL
UNION ALL
SELECT
  'Avatar coverage %',
  ROUND(
    COUNT(*) FILTER (WHERE avatar_url IS NOT NULL) * 100.0 / COUNT(*),
    2
  )
FROM storytellers;
```

**Check for orphaned records:**
```sql
-- Stories without storytellers
SELECT COUNT(*)
FROM stories s
LEFT JOIN storytellers st ON s.storyteller_id = st.id
WHERE s.storyteller_id IS NOT NULL
  AND st.id IS NULL;

-- Storytellers without profiles
SELECT COUNT(*)
FROM storytellers st
LEFT JOIN profiles p ON st.profile_id = p.id
WHERE p.id IS NULL;
```

---

## Schema Exploration

### List all tables
```sql
SELECT tablename, obj_description(('public.' || tablename)::regclass)
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Explore table structure
```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'stories'
ORDER BY ordinal_position;
```

### Find all foreign keys
```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'stories'
ORDER BY kcu.column_name;
```

---

## Key Tables Quick Reference

| Table | Count | Purpose |
|-------|-------|---------|
| `stories` | 315 | All story content |
| `storytellers` | 235 | Storytelling personas |
| `profiles` | 251 | User accounts |
| `transcripts` | many | Raw interviews |
| `knowledge_chunks` | 22,506 | RAG vector search |

**Core Relationships:**
```
profiles → storytellers → stories
                      ↓
               transcripts → transcript_analysis_results
```

**Full documentation:** `docs/04-database/SUPABASE_COMPLETE_OVERVIEW.md`
