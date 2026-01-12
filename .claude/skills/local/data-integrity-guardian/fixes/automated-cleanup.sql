-- Automated Data Cleanup for Empathy Ledger
-- Safe, non-destructive fixes for common data quality issues

\echo '=== EMPATHY LEDGER AUTOMATED CLEANUP ==='
\echo ''

-- 1. FIX MISSING EXCERPTS
\echo '1. Generating missing excerpts from content...'

UPDATE stories
SET excerpt = LEFT(content, 200) || '...'
WHERE (excerpt IS NULL OR excerpt = '')
  AND content IS NOT NULL
  AND LENGTH(content) > 0;

SELECT COUNT(*) as excerpts_generated FROM stories WHERE excerpt LIKE '%...';

-- 2. CALCULATE MISSING WORD COUNTS
\echo '2. Calculating missing word counts...'

UPDATE stories
SET word_count = array_length(regexp_split_to_array(content, '\s+'), 1)
WHERE word_count IS NULL
  AND content IS NOT NULL;

SELECT COUNT(*) as word_counts_calculated FROM stories WHERE word_count IS NOT NULL;

-- 3. CALCULATE MISSING READING TIMES
\echo '3. Calculating reading times (200 words/minute)...'

UPDATE stories
SET reading_time = GREATEST(1, CEIL(word_count / 200.0))
WHERE reading_time IS NULL
  AND word_count > 0;

SELECT COUNT(*) as reading_times_calculated FROM stories WHERE reading_time IS NOT NULL;

-- 4. SYNC STORYTELLER AVATARS FROM PROFILES
\echo '4. Syncing storyteller avatars from profiles...'

UPDATE storytellers st
SET
  avatar_url = COALESCE(p.profile_image_url, p.avatar_url),
  updated_at = NOW()
FROM profiles p
WHERE st.profile_id = p.id
  AND (st.avatar_url IS NULL OR st.avatar_url = '')
  AND (p.profile_image_url IS NOT NULL OR p.avatar_url IS NOT NULL);

SELECT COUNT(*) as avatars_synced FROM storytellers WHERE avatar_url IS NOT NULL;

-- 5. UPDATE STORYTELLER DATA FROM PROFILES
\echo '5. Syncing storyteller metadata from profiles...'

UPDATE storytellers st
SET
  display_name = COALESCE(NULLIF(p.display_name, ''), NULLIF(p.full_name, ''), st.display_name, 'Anonymous'),
  bio = COALESCE(NULLIF(p.bio, ''), st.bio),
  cultural_background = COALESCE(p.cultural_affiliations, st.cultural_background),
  language_skills = COALESCE(p.languages_spoken, st.language_skills),
  updated_at = NOW()
FROM profiles p
WHERE st.profile_id = p.id
  AND (
    st.display_name IS NULL
    OR st.bio IS NULL
    OR st.cultural_background IS NULL
    OR st.language_skills IS NULL
  );

SELECT COUNT(*) as storytellers_updated FROM storytellers WHERE updated_at > NOW() - INTERVAL '1 minute';

-- 6. FIX NULL BOOLEAN FLAGS
\echo '6. Setting default boolean flags...'

UPDATE stories
SET
  is_public = COALESCE(is_public, false),
  is_featured = COALESCE(is_featured, false),
  is_archived = COALESCE(is_archived, false),
  syndication_enabled = COALESCE(syndication_enabled, false),
  embeds_enabled = COALESCE(embeds_enabled, true),
  sharing_enabled = COALESCE(sharing_enabled, true),
  has_explicit_consent = COALESCE(has_explicit_consent, false),
  requires_elder_review = COALESCE(requires_elder_review, false),
  elder_reviewed = COALESCE(elder_reviewed, false),
  cultural_sensitivity_flag = COALESCE(cultural_sensitivity_flag, false),
  traditional_knowledge_flag = COALESCE(traditional_knowledge_flag, false),
  enable_ai_processing = COALESCE(enable_ai_processing, true),
  notify_community = COALESCE(notify_community, false)
WHERE is_public IS NULL
   OR is_featured IS NULL
   OR is_archived IS NULL
   OR syndication_enabled IS NULL
   OR embeds_enabled IS NULL
   OR sharing_enabled IS NULL
   OR has_explicit_consent IS NULL
   OR requires_elder_review IS NULL
   OR elder_reviewed IS NULL
   OR cultural_sensitivity_flag IS NULL
   OR traditional_knowledge_flag IS NULL
   OR enable_ai_processing IS NULL
   OR notify_community IS NULL;

SELECT COUNT(*) as boolean_flags_fixed FROM stories;

-- 7. SET DEFAULT PERMISSION TIERS
\echo '7. Setting default permission tiers...'

UPDATE stories
SET permission_tier = 'public'
WHERE permission_tier IS NULL
  AND is_public = true
  AND status = 'published';

UPDATE stories
SET permission_tier = 'private'
WHERE permission_tier IS NULL
  AND (is_public = false OR status != 'published');

SELECT COUNT(*) as permission_tiers_set FROM stories WHERE permission_tier IS NOT NULL;

\echo ''
\echo '=== CLEANUP COMPLETE ==='
\echo ''
\echo 'Run full-audit.sql to verify data quality.'
\echo ''
