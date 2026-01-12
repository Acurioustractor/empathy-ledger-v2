# JusticeHub API Readiness Reference

## Story Preparation Checklist Query

```sql
SELECT
  s.id, s.title,
  -- Required fields
  CASE WHEN s.title IS NOT NULL THEN '✅' ELSE '❌' END as has_title,
  CASE WHEN s.excerpt IS NOT NULL THEN '✅' ELSE '❌' END as has_excerpt,
  CASE WHEN s.content IS NOT NULL THEN '✅' ELSE '❌' END as has_content,
  CASE WHEN st.id IS NOT NULL THEN '✅' ELSE '❌' END as has_storyteller,
  CASE WHEN array_length(s.cultural_themes, 1) > 0 THEN '✅' ELSE '❌' END as has_themes,
  CASE WHEN s.has_explicit_consent = true THEN '✅' ELSE '❌' END as has_consent,
  CASE WHEN s.requires_elder_review = false OR s.elder_reviewed = true THEN '✅' ELSE '❌' END as cultural_safety_ok,
  -- Ready check
  CASE
    WHEN s.title IS NOT NULL AND s.excerpt IS NOT NULL AND s.content IS NOT NULL
      AND st.id IS NOT NULL AND array_length(s.cultural_themes, 1) > 0
      AND s.has_explicit_consent = true AND s.syndication_enabled = true
      AND (s.requires_elder_review = false OR s.elder_reviewed = true)
    THEN '✅ READY'
    ELSE '❌ NOT READY'
  END as justicehub_ready
FROM stories s
LEFT JOIN storytellers st ON s.storyteller_id = st.id
WHERE s.status = 'published' AND s.is_public = true
ORDER BY justicehub_ready DESC
LIMIT 50;
```

## JusticeHub Featured Migration

```sql
-- Add justicehub_featured column
ALTER TABLE stories ADD COLUMN IF NOT EXISTS justicehub_featured boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_stories_justicehub_featured
ON stories(justicehub_featured) WHERE justicehub_featured = true AND status = 'published';

COMMENT ON COLUMN stories.justicehub_featured IS
  'Story is featured on JusticeHub. Requires syndication consent and cultural safety approval.';
```

## Featured Stories Query

```sql
SELECT
  s.id, s.title, s.excerpt, s.story_image_url as featured_image,
  s.cultural_themes, s.reading_time,
  jsonb_build_object(
    'display_name', st.display_name,
    'avatar_url', st.avatar_url,
    'cultural_background', st.cultural_background
  ) as storyteller
FROM stories s
JOIN storytellers st ON s.storyteller_id = st.id
WHERE s.justicehub_featured = true
  AND s.status = 'published'
  AND s.is_public = true
  AND s.syndication_enabled = true
ORDER BY s.created_at DESC
LIMIT 6;
```

## Mission Compliance - OCAP

```sql
SELECT
  COUNT(*) as total_public_stories,
  ROUND(
    COUNT(*) FILTER (
      WHERE has_explicit_consent = true
        AND permission_tier IS NOT NULL
        AND storyteller_id IS NOT NULL
    ) * 100.0 / COUNT(*), 1
  ) as ocap_compliance_percent
FROM stories
WHERE status = 'published' AND is_public = true;
-- Target: 100%
```
