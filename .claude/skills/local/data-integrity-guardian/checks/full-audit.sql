-- Full Data Integrity Audit for Empathy Ledger
-- Run this before JusticeHub API launch or major releases

\echo '=== EMPATHY LEDGER DATA INTEGRITY AUDIT ==='
\echo ''

-- 1. RELATIONSHIP INTEGRITY
\echo '1. RELATIONSHIP INTEGRITY CHECKS'
\echo '================================'

SELECT '1.1 Stories without storytellers:' as check_name;
SELECT COUNT(*) as orphaned_stories, 'Expected: 0' as target
FROM stories s
LEFT JOIN storytellers st ON s.storyteller_id = st.id
WHERE s.storyteller_id IS NOT NULL AND st.id IS NULL;

SELECT '1.2 Storytellers without profiles:' as check_name;
SELECT COUNT(*) as orphaned_storytellers, 'Expected: 0' as target
FROM storytellers st
LEFT JOIN profiles p ON st.profile_id = p.id
WHERE p.id IS NULL;

SELECT '1.3 Stories with invalid transcript refs:' as check_name;
SELECT COUNT(*) as invalid_refs, 'Expected: 0' as target
FROM stories s
LEFT JOIN transcripts t ON s.transcript_id = t.id
WHERE s.transcript_id IS NOT NULL AND t.id IS NULL;

\echo ''

-- 2. DATA COMPLETENESS
\echo '2. DATA COMPLETENESS CHECKS'
\echo '==========================='

SELECT '2.1 Published Stories - Missing Essential Fields:' as check_name;
SELECT
  COUNT(*) as total_published,
  COUNT(*) FILTER (WHERE title IS NULL OR title = '') as missing_title,
  COUNT(*) FILTER (WHERE content IS NULL OR content = '') as missing_content,
  COUNT(*) FILTER (WHERE storyteller_id IS NULL) as missing_storyteller,
  COUNT(*) FILTER (WHERE excerpt IS NULL OR excerpt = '') as missing_excerpt,
  COUNT(*) FILTER (WHERE cultural_themes IS NULL OR array_length(cultural_themes, 1) = 0) as missing_themes
FROM stories
WHERE status = 'published' AND is_public = true;

SELECT '2.2 Storyteller Avatar Coverage:' as check_name;
SELECT
  COUNT(*) as active_storytellers,
  COUNT(*) FILTER (WHERE avatar_url IS NOT NULL) as with_avatars,
  ROUND(COUNT(*) FILTER (WHERE avatar_url IS NOT NULL) * 100.0 / COUNT(*), 1) as coverage_percent,
  'Target: >85%' as target
FROM storytellers
WHERE is_active = true;

\echo ''

-- 3. CULTURAL SAFETY COMPLIANCE
\echo '3. CULTURAL SAFETY COMPLIANCE'
\echo '============================='

SELECT '3.1 Elder Review Status:' as check_name;
SELECT
  COUNT(*) as requires_review,
  COUNT(*) FILTER (WHERE elder_reviewed = true) as reviewed,
  COUNT(*) FILTER (WHERE elder_approved_by IS NOT NULL) as approved,
  COUNT(*) FILTER (WHERE elder_reviewed = false AND is_public = true) as public_without_review,
  'public_without_review should be 0' as note
FROM stories
WHERE requires_elder_review = true
  AND status = 'published';

SELECT '3.2 Cultural Sensitivity Flags:' as check_name;
SELECT
  COUNT(*) as flagged_stories,
  COUNT(*) FILTER (WHERE elder_reviewed = true) as reviewed,
  COUNT(*) FILTER (WHERE is_public = true AND (elder_reviewed = false OR elder_reviewed IS NULL)) as public_unreviewed,
  'public_unreviewed should be 0' as note
FROM stories
WHERE cultural_sensitivity_flag = true
  AND status = 'published';

SELECT '3.3 Traditional Knowledge Protection:' as check_name;
SELECT
  COUNT(*) as tk_stories,
  COUNT(*) FILTER (WHERE permission_tier = 'restricted') as properly_restricted,
  COUNT(*) FILTER (WHERE is_public = true AND (permission_tier != 'restricted' OR permission_tier IS NULL)) as potentially_exposed,
  'potentially_exposed should be 0' as note
FROM stories
WHERE traditional_knowledge_flag = true;

\echo ''

-- 4. CONSENT VERIFICATION
\echo '4. CONSENT VERIFICATION'
\echo '======================='

SELECT '4.1 Story-Level Consent:' as check_name;
SELECT
  COUNT(*) as public_stories,
  COUNT(*) FILTER (WHERE has_explicit_consent = true) as with_consent,
  COUNT(*) FILTER (WHERE has_explicit_consent = false OR has_explicit_consent IS NULL) as missing_consent,
  COUNT(*) FILTER (WHERE consent_withdrawn_at IS NOT NULL) as consent_withdrawn,
  'missing_consent + consent_withdrawn should be 0' as note
FROM stories
WHERE status = 'published' AND is_public = true;

SELECT '4.2 Syndication Consent:' as check_name;
SELECT
  COUNT(*) as syndication_enabled_stories,
  COUNT(*) FILTER (
    EXISTS (
      SELECT 1 FROM story_syndication_consent ssc
      WHERE ssc.story_id = stories.id
        AND ssc.consent_given = true
        AND (ssc.expires_at IS NULL OR ssc.expires_at > NOW())
    )
  ) as with_valid_consent,
  COUNT(*) - COUNT(*) FILTER (
    EXISTS (
      SELECT 1 FROM story_syndication_consent ssc
      WHERE ssc.story_id = stories.id
    )
  ) as missing_consent_record,
  'missing_consent_record should be 0' as note
FROM stories
WHERE syndication_enabled = true
  AND status = 'published';

\echo ''

-- 5. MISSION ALIGNMENT
\echo '5. MISSION ALIGNMENT'
\echo '===================='

SELECT '5.1 Story Quality Metrics:' as check_name;
SELECT
  COUNT(*) as total_stories,
  ROUND(AVG(word_count), 0) as avg_word_count,
  COUNT(*) FILTER (WHERE word_count < 50) as too_short,
  COUNT(*) FILTER (WHERE reading_time IS NULL) as missing_reading_time,
  ROUND(AVG(array_length(cultural_themes, 1)), 1) as avg_themes_per_story,
  COUNT(*) FILTER (WHERE array_length(cultural_themes, 1) = 0 OR cultural_themes IS NULL) as no_themes
FROM stories
WHERE status = 'published' AND is_public = true;

SELECT '5.2 OCAP Compliance:' as check_name;
SELECT
  COUNT(*) as total_public_stories,
  COUNT(*) FILTER (WHERE has_explicit_consent = true) as with_consent,
  COUNT(*) FILTER (WHERE permission_tier IN ('public', 'partner', 'private')) as with_permission_tier,
  COUNT(*) FILTER (WHERE storyteller_id IS NOT NULL) as with_storyteller,
  ROUND(
    COUNT(*) FILTER (
      WHERE has_explicit_consent = true
        AND permission_tier IS NOT NULL
        AND storyteller_id IS NOT NULL
    ) * 100.0 / NULLIF(COUNT(*), 0),
    1
  ) as ocap_compliance_percent,
  'Target: 100%' as target
FROM stories
WHERE status = 'published' AND is_public = true;

\echo ''

-- 6. JUSTICEHUB API READINESS
\echo '6. JUSTICEHUB API READINESS'
\echo '==========================='

SELECT '6.1 Stories Ready for JusticeHub:' as check_name;
SELECT
  COUNT(*) as total_published,
  COUNT(*) FILTER (
    WHERE title IS NOT NULL AND title != ''
      AND excerpt IS NOT NULL AND excerpt != ''
      AND content IS NOT NULL AND content != ''
      AND storyteller_id IS NOT NULL
      AND array_length(cultural_themes, 1) > 0
      AND has_explicit_consent = true
      AND syndication_enabled = true
      AND (requires_elder_review = false OR elder_reviewed = true)
  ) as ready_for_justicehub,
  ROUND(
    COUNT(*) FILTER (
      WHERE title IS NOT NULL AND title != ''
        AND excerpt IS NOT NULL AND excerpt != ''
        AND content IS NOT NULL AND content != ''
        AND storyteller_id IS NOT NULL
        AND array_length(cultural_themes, 1) > 0
        AND has_explicit_consent = true
        AND syndication_enabled = true
        AND (requires_elder_review = false OR elder_reviewed = true)
    ) * 100.0 / NULLIF(COUNT(*), 0),
    1
  ) as percentage_ready
FROM stories
WHERE status = 'published' AND is_public = true;

\echo ''

-- 7. THEME DIVERSITY
\echo '7. THEME DIVERSITY'
\echo '=================='

SELECT '7.1 Top 10 Themes by Usage:' as check_name;
SELECT
  theme,
  COUNT(*) as story_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM stories WHERE status = 'published'), 1) as percentage
FROM stories
CROSS JOIN LATERAL unnest(cultural_themes) as theme
WHERE status = 'published'
GROUP BY theme
ORDER BY story_count DESC
LIMIT 10;

\echo ''
\echo '=== AUDIT COMPLETE ==='
\echo ''
\echo 'Review results above. All "Expected: 0" checks should show 0.'
\echo 'OCAP Compliance and Avatar Coverage should meet targets.'
\echo ''
