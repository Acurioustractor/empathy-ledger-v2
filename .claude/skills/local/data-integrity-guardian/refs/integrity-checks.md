# Data Integrity Checks Reference

## Relationship Integrity

### Stories ↔ Storytellers
```sql
SELECT COUNT(*) as orphaned_stories
FROM stories s
LEFT JOIN storytellers st ON s.storyteller_id = st.id
WHERE s.storyteller_id IS NOT NULL AND st.id IS NULL;
-- Expected: 0
```

### Storytellers ↔ Profiles
```sql
SELECT COUNT(*) as orphaned_storytellers
FROM storytellers st
LEFT JOIN profiles p ON st.profile_id = p.id
WHERE p.id IS NULL;
-- Expected: 0
```

### Stories ↔ Transcripts
```sql
SELECT COUNT(*) as invalid_transcript_refs
FROM stories s
LEFT JOIN transcripts t ON s.transcript_id = t.id
WHERE s.transcript_id IS NOT NULL AND t.id IS NULL;
-- Expected: 0
```

## Data Completeness

### Essential Fields for Published Stories
```sql
SELECT
  COUNT(*) as total_published,
  COUNT(*) FILTER (WHERE title IS NULL OR title = '') as missing_title,
  COUNT(*) FILTER (WHERE content IS NULL OR content = '') as missing_content,
  COUNT(*) FILTER (WHERE storyteller_id IS NULL) as missing_storyteller,
  COUNT(*) FILTER (WHERE cultural_themes IS NULL OR array_length(cultural_themes, 1) = 0) as missing_themes
FROM stories
WHERE status = 'published' AND is_public = true;
-- All counts should be 0 except total_published
```

### Storyteller Avatar Coverage
```sql
SELECT
  COUNT(*) as active_storytellers,
  ROUND(COUNT(*) FILTER (WHERE avatar_url IS NOT NULL) * 100.0 / COUNT(*), 1) as coverage_percent
FROM storytellers WHERE is_active = true;
-- Target: >85% coverage
```

## Cultural Safety Compliance

### Elder Review Status
```sql
SELECT
  COUNT(*) FILTER (WHERE elder_reviewed = false AND is_public = true) as public_without_review
FROM stories
WHERE requires_elder_review = true AND status = 'published';
-- Should be 0
```

### Traditional Knowledge Protection
```sql
SELECT
  COUNT(*) FILTER (WHERE is_public = true AND permission_tier != 'restricted') as potentially_exposed
FROM stories
WHERE traditional_knowledge_flag = true;
-- Should be 0
```

## Consent Verification

```sql
SELECT
  COUNT(*) as public_stories,
  COUNT(*) FILTER (WHERE has_explicit_consent = false OR has_explicit_consent IS NULL) as missing_consent
FROM stories
WHERE status = 'published' AND is_public = true;
-- missing_consent should be 0
```

## Automated Cleanup

```sql
-- Fix missing excerpts
UPDATE stories SET excerpt = LEFT(content, 200) || '...'
WHERE (excerpt IS NULL OR excerpt = '') AND content IS NOT NULL AND status = 'published';

-- Calculate missing reading times
UPDATE stories SET reading_time = CEIL(word_count / 200.0)
WHERE reading_time IS NULL AND word_count > 0;

-- Sync storyteller avatars
UPDATE storytellers st SET avatar_url = COALESCE(p.profile_image_url, p.avatar_url)
FROM profiles p WHERE st.profile_id = p.id AND st.avatar_url IS NULL;

-- Calculate word counts
UPDATE stories SET word_count = array_length(regexp_split_to_array(content, '\s+'), 1)
WHERE word_count IS NULL AND content IS NOT NULL;
```
