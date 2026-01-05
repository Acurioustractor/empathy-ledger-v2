# Sprint 2 Migrations - Deployment Guide

## Quick Deployment via Supabase Dashboard (RECOMMENDED)

Since automated deployment has authentication challenges, the easiest and safest way is to use the Supabase Dashboard SQL Editor.

### Step-by-Step Instructions

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new
   - Or: Dashboard → SQL Editor → New Query

2. **Copy Migration SQL**
   - Open file: `deploy_sprint2_migrations.sql`
   - Select all content (Cmd+A)
   - Copy (Cmd+C)

3. **Execute Migration**
   - Paste into SQL Editor
   - Click "Run" button (or Cmd+Enter)
   - Wait for execution (~10-20 seconds)

4. **Verify Results**
   - Scroll to bottom of results
   - You should see a table showing the new columns
   - Verify `excerpt`, `story_type`, `cultural_sensitivity_level` appear for stories
   - Verify `caption`, `cultural_tags`, `culturally_sensitive` appear for media_assets

5. **Expected Output**
   ```
   ALTER TABLE
   ALTER TABLE
   CREATE INDEX
   CREATE FUNCTION
   CREATE TRIGGER
   ...

   column_name               | data_type | is_nullable
   --------------------------+-----------+-------------
   cultural_sensitivity_level| text      | YES
   excerpt                   | text      | YES
   reading_time              | integer   | YES
   requires_elder_review     | boolean   | YES
   story_type                | text      | YES
   word_count                | integer   | YES
   ```

### What Gets Deployed

**Stories Table Enhancements:**
- ✅ 16 new fields (excerpt, story_type, cultural_sensitivity_level, etc.)
- ✅ 3 new indexes (performance optimization)
- ✅ 2 triggers (auto-calculate word count, auto-require Elder review)
- ✅ 5 RLS policies (security)

**Media Assets Table Enhancements:**
- ✅ 5 new fields (caption, cultural_tags, culturally_sensitive, etc.)
- ✅ 2 new indexes
- ✅ 1 trigger (require alt text for images)
- ✅ 5 RLS policies

### Troubleshooting

**Issue: "relation does not exist"**
- Solution: Table might have different name. Check with:
  ```sql
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('stories', 'media_assets');
  ```

**Issue: "column already exists"**
- Solution: Migration already partially applied. This is OK!
- The SQL uses `IF NOT EXISTS` so it's safe to re-run

**Issue: Trigger or function errors**
- Solution: Drop and recreate manually:
  ```sql
  DROP TRIGGER IF EXISTS auto_require_elder_review_trigger ON public.stories;
  DROP FUNCTION IF EXISTS public.auto_require_elder_review();
  ```
  Then run migration again.

### Verification After Deployment

Run this query to confirm everything worked:

```sql
-- Check stories table
SELECT
  COUNT(*) FILTER (WHERE column_name = 'excerpt') as has_excerpt,
  COUNT(*) FILTER (WHERE column_name = 'story_type') as has_story_type,
  COUNT(*) FILTER (WHERE column_name = 'cultural_sensitivity_level') as has_cultural_sensitivity,
  COUNT(*) FILTER (WHERE column_name = 'requires_elder_review') as has_requires_elder_review,
  COUNT(*) FILTER (WHERE column_name = 'word_count') as has_word_count,
  COUNT(*) FILTER (WHERE column_name = 'reading_time') as has_reading_time
FROM information_schema.columns
WHERE table_name = 'stories';

-- Should return: 1, 1, 1, 1, 1, 1 (all fields exist)

-- Check media_assets table
SELECT
  COUNT(*) FILTER (WHERE column_name = 'caption') as has_caption,
  COUNT(*) FILTER (WHERE column_name = 'cultural_tags') as has_cultural_tags,
  COUNT(*) FILTER (WHERE column_name = 'culturally_sensitive') as has_culturally_sensitive,
  COUNT(*) FILTER (WHERE column_name = 'requires_attribution') as has_requires_attribution
FROM information_schema.columns
WHERE table_name = 'media_assets';

-- Should return: 1, 1, 1, 1 (all fields exist)
```

Expected result: All counts should be `1`.

### After Successful Deployment

1. **Test the APIs**
   - Create a new story via dashboard
   - Upload and tag media
   - Try publishing a story

2. **Update Migration History** (optional)
   ```bash
   npx supabase migration list
   # Should show 20260104000001 and 20260104000002 as applied
   ```

3. **Regenerate TypeScript Types** (if needed)
   ```bash
   npx supabase gen types typescript --linked > src/types/supabase-generated.ts
   ```

4. **Test in Production**
   - Visit your app
   - Try creating a story
   - Check for any console errors

---

## Alternative: Automated Deployment (When Auth is Fixed)

If you get database credentials working, you can use:

```bash
# Option 1: Via Supabase CLI
npx supabase db push

# Option 2: Via psql directly
psql "your-connection-string" -f deploy_sprint2_migrations.sql
```

But for now, **manual deployment via Dashboard is fastest and most reliable**! 🚀

---

## Files Reference

- **Migration SQL**: `deploy_sprint2_migrations.sql`
- **Original Migrations**:
  - `supabase/migrations/20260104000001_stories_sprint2_fields.sql`
  - `supabase/migrations/20260104000002_media_assets_sprint2_fields.sql`

---

**Time Required:** 5-10 minutes
**Difficulty:** Easy (copy/paste)
**Safety:** 100% safe - all migrations use `IF NOT EXISTS`

**Ready to deploy!** 🎉
