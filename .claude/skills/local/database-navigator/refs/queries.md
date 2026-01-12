# Database Query Reference

## Stories & Storytellers

### Find Stories by Theme
```sql
SELECT id, title, storyteller_id, cultural_themes
FROM stories
WHERE 'healing' = ANY(cultural_themes)
  AND status = 'published'
  AND is_public = true
LIMIT 10;
```

### Stories with Storyteller Details
```sql
SELECT
  s.id, s.title, s.cultural_themes,
  st.display_name as storyteller, st.avatar_url
FROM stories s
JOIN storytellers st ON s.storyteller_id = st.id
WHERE 'connection' = ANY(s.cultural_themes)
  AND s.status = 'published'
ORDER BY s.created_at DESC;
```

### Storyteller with Stats
```sql
SELECT
  st.id, st.display_name, st.bio, st.cultural_background,
  COUNT(s.id) as story_count,
  array_agg(DISTINCT theme) as all_themes
FROM storytellers st
LEFT JOIN stories s ON s.storyteller_id = st.id
CROSS JOIN LATERAL unnest(s.cultural_themes) as theme
WHERE st.id = 'uuid-here'
GROUP BY st.id;
```

## Theme Analysis

### Theme Frequency
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

### Theme Co-occurrence
```sql
SELECT t1.theme as theme_1, t2.theme as theme_2, COUNT(*) as co_occurrence_count
FROM (SELECT id, unnest(cultural_themes) as theme FROM stories WHERE status = 'published') t1
JOIN (SELECT id, unnest(cultural_themes) as theme FROM stories WHERE status = 'published') t2
  ON t1.id = t2.id AND t1.theme < t2.theme
GROUP BY t1.theme, t2.theme
ORDER BY co_occurrence_count DESC
LIMIT 20;
```

## Schema Exploration

### List All Tables
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

### Table Structure
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'stories'
ORDER BY ordinal_position;
```

### Foreign Keys
```sql
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'stories';
```

## Data Quality

### Check Orphaned Records
```sql
-- Stories without storytellers
SELECT COUNT(*) FROM stories s
LEFT JOIN storytellers st ON s.storyteller_id = st.id
WHERE s.storyteller_id IS NOT NULL AND st.id IS NULL;

-- Storytellers without profiles
SELECT COUNT(*) FROM storytellers st
LEFT JOIN profiles p ON st.profile_id = p.id
WHERE p.id IS NULL;
```

## Core Table Summary
| Table | Purpose |
|-------|---------|
| `stories` | Story content |
| `storytellers` | Storytelling personas |
| `profiles` | User accounts |
| `transcripts` | Raw interviews |
| `knowledge_chunks` | RAG vector search |
