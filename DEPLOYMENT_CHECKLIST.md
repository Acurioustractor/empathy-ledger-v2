# Deployment Checklist - Story Reading Page

## System Architecture

**✅ BULLETPROOF SETUP:**
- Using **Production Supabase Cloud** (not local)
- Database: `yvnuayzslukamizrlhwb.supabase.co`
- All data in production database
- No local Supabase needed - direct cloud connection

## Required Migration

### Story Engagement Counts Migration

**Status:** ⚠️ NEEDS TO BE APPLIED

**What It Does:**
- Adds `views_count`, `likes_count`, `shares_count` to stories table
- Creates helper functions for incrementing counts
- Adds indexes for performance

**How to Apply:**

### Option 1: Via Supabase Dashboard (RECOMMENDED)

1. Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql

2. Click "New Query"

3. Paste this SQL:

```sql
-- Add engagement tracking columns to stories table
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0 NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stories_views_count ON public.stories(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_stories_likes_count ON public.stories(likes_count DESC);

-- Add comments
COMMENT ON COLUMN public.stories.views_count IS 'Total number of times this story has been viewed';
COMMENT ON COLUMN public.stories.likes_count IS 'Total number of likes/hearts this story has received';
COMMENT ON COLUMN public.stories.shares_count IS 'Total number of times this story has been shared';

-- Create increment functions
CREATE OR REPLACE FUNCTION public.increment_story_view_count(story_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.stories
  SET views_count = views_count + 1
  WHERE id = story_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_story_view_count TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.increment_story_like_count(story_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.stories
  SET likes_count = likes_count + 1
  WHERE id = story_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_story_like_count TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.decrement_story_like_count(story_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.stories
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = story_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.decrement_story_like_count TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.increment_story_share_count(story_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.stories
  SET shares_count = shares_count + 1
  WHERE id = story_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_story_share_count TO authenticated, anon;
```

4. Click "Run" (or press Cmd/Ctrl + Enter)

5. Verify success - you should see "Success. No rows returned"

### Option 2: Via CLI

```bash
# Set your database password
export PGPASSWORD="your_supabase_postgres_password"

# Run the migration
psql "postgresql://postgres.yvnuayzslukamizrlhwb@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations/20251223140000_add_story_engagement_counts.sql
```

### Verify Migration Applied

Run this script to verify:

```bash
node scripts/validation/verify-story-schema.js
```

You should see:
- ✅ All schema validations passed
- ✅ Engagement counts exist
- ✅ Stories with view/like/share counts

## Pre-Deployment Checklist

- [x] Story reading page redesigned ([src/app/stories/[id]/page.tsx](src/app/stories/[id]/page.tsx))
- [x] API updated to fetch storyteller data ([src/app/api/stories/[id]/route.ts](src/app/api/stories/[id]/route.ts:23-44))
- [x] Profile images using correct field (`profile_image_url`)
- [ ] **Engagement counts migration applied to production database**
- [x] Documentation created
- [x] Validation scripts created

## Post-Deployment Verification

### 1. Test Story Page

```bash
# Start dev server
npm run dev

# Visit any story
open http://localhost:3000/stories/[story-id]
```

**Check:**
- ✅ Story title displays
- ✅ Profile image shows (or initials fallback)
- ✅ Elder badge for elders
- ✅ Featured badge for featured stories
- ✅ Storyteller bio appears
- ✅ Content formats into paragraphs
- ✅ Engagement buttons work
- ✅ View count displays (after migration)

### 2. Test API Endpoint

```bash
curl https://empathy-ledger-v2.vercel.app/api/stories/[story-id]
```

**Check Response:**
- ✅ `storyteller` object present
- ✅ `profile_image_url` field populated
- ✅ `views_count`, `likes_count`, `shares_count` exist (after migration)

### 3. Test Admin Page

```bash
open http://localhost:3000/admin/stories
```

**Check:**
- ✅ Grid/List views work
- ✅ Profile images display
- ✅ ACT Farm sharing toggle works
- ✅ Search and filters work

## Known Issues & Solutions

### Issue 1: Engagement Counts Missing

**Symptom:** Story page shows `undefined` for views/likes/shares

**Cause:** Migration not applied yet

**Solution:** Apply the migration via Supabase dashboard (see above)

### Issue 2: Profile Images Not Showing

**Status:** ✅ FIXED

**Solution:** Already using correct field `profile_image_url`

### Issue 3: Local Supabase Not Running

**Status:** ✅ NOT AN ISSUE

**Explanation:** We're using production Supabase cloud, not local instance. This is the correct bulletproof setup.

## Files Modified

### Created
- `src/app/stories/[id]/page.tsx` - Beautiful story reading page
- `supabase/migrations/20251223140000_add_story_engagement_counts.sql` - Engagement counts migration
- `scripts/validation/verify-story-schema.js` - Schema validation script
- `scripts/data-management/apply-engagement-counts.js` - Migration helper
- `docs/STORY_PAGE_GUIDE.md` - Complete implementation guide
- `STORY_READING_EXPERIENCE.md` - Feature overview
- `DEPLOYMENT_CHECKLIST.md` - This file

### Modified
- `src/app/api/stories/[id]/route.ts` - Added storyteller fetch
- `IMPLEMENTATION_PRIORITY.md` - Updated status

## Next Steps

1. **Apply the migration** (see Option 1 above)
2. **Verify** with `node scripts/validation/verify-story-schema.js`
3. **Test** story page in dev environment
4. **Deploy** to Vercel (if not auto-deployed)
5. **Start transforming poor-quality stories** with story-craft skill

## Environment Status

**Current Setup:**
- ✅ Production Supabase Cloud
- ✅ All services connected
- ✅ No local database needed
- ✅ Direct cloud access
- ✅ Bulletproof configuration

**No Local Supabase:** This is intentional and correct. We're using the production cloud database directly.

---

**Status:** Ready for migration deployment
**Last Updated:** 2025-12-23
