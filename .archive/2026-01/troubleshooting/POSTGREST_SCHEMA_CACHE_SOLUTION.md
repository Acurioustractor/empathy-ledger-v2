# PostgREST Schema Cache Issue - Comprehensive Solution Guide

## Problem Summary

**Error:** `PGRST204 - Could not find the 'article_type' column of 'stories' in the schema cache`

**Impact:** Story creation completely blocked despite columns existing in PostgreSQL database

**Affected Columns:** article_type, slug, meta_title, meta_description, featured_image_id, syndication_destinations, themes, audience

**Root Cause:** PostgREST API layer has stale schema cache that hasn't refreshed after database migration

---

## Verified Database State

Columns DO exist in PostgreSQL (verified via psql):

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'stories'
AND column_name IN ('article_type', 'slug', 'meta_title', 'meta_description', 'featured_image_id', 'syndication_destinations', 'themes', 'audience');
```

**Result:** All 8 columns confirmed present in database schema

---

## Solution 1: Restart Project + Delayed NOTIFY (RECOMMENDED FOR SUPABASE CLOUD)

**Note:** Supabase Cloud typically doesn't expose separate Postgres instance restart - only "Restart project" is available.

### Steps:

1. **Restart Project in Supabase Dashboard**
   - Go to Settings → General
   - Click "Restart project"
   - Wait 2-3 minutes for restart to complete

2. **Run Delayed NOTIFY Command**
   - Go to SQL Editor
   - Run the SQL from `fix-postgrest-cache.sql`:
   ```sql
   DO $$
   BEGIN
     PERFORM pg_sleep(1);
     PERFORM pg_notify('pgrst', 'reload schema');
   END $$;
   ```

3. **Wait 5 Seconds**
   - Important: Give PostgREST time to process the notification

4. **Verify Fix**
   ```bash
   ./test-postgrest-fix.sh
   ```
   Or manually:
   ```bash
   curl -X POST http://localhost:3030/api/stories \
     -H 'Content-Type: application/json' \
     -d '{
       "title": "Test Story",
       "content": "Test content",
       "article_type": "story_feature",
       "status": "draft",
       "visibility": "private"
     }'
   ```

**Why This Works:** Project restart + delayed notification workaround addresses the Postgres notification delivery bug

---

## Solution 2: Delayed NOTIFY Command (If Restart Unavailable)

### Steps:

1. **Go to SQL Editor in Supabase Dashboard**

2. **Run This SQL:**
   ```sql
   DO $$
   BEGIN
     PERFORM pg_sleep(1);
     PERFORM pg_notify('pgrst', 'reload schema');
   END $$;
   ```

3. **Wait 5 seconds**

4. **Test Story Creation Again**

**Why This Works:** The delay gives PostgREST time to process the notification properly (works around timing bug)

---

## Solution 3: Event Trigger for Automatic Reload (PERMANENT FIX)

Set up automatic schema reload whenever DDL changes occur:

### Steps:

1. **Create Event Trigger Function**
   ```sql
   CREATE OR REPLACE FUNCTION public.pgrst_ddl_watch() RETURNS event_trigger AS $$
   BEGIN
     PERFORM pg_notify('pgrst', 'reload schema');
   END;
   $$ LANGUAGE plpgsql;
   ```

2. **Create Event Trigger**
   ```sql
   CREATE EVENT TRIGGER pgrst_ddl_watch
     ON ddl_command_end
     EXECUTE PROCEDURE public.pgrst_ddl_watch();
   ```

3. **Verify Trigger Created**
   ```sql
   SELECT evtname, evtevent, evtowner
   FROM pg_event_trigger
   WHERE evtname = 'pgrst_ddl_watch';
   ```

4. **Test by Running a Harmless DDL**
   ```sql
   COMMENT ON TABLE stories IS 'Test trigger';
   ```

5. **Check PostgREST Logs** (should see schema reload message)

**Benefits:**
- Automatic schema reload on future migrations
- No manual intervention needed
- Prevents this issue from recurring

**Note:** This won't fix the current cache issue - you still need to do Solution 1 or 2 first!

---

## Solution 4: Contact Supabase Support (LAST RESORT)

If none of the above work, Supabase support can manually invalidate the schema cache.

### Steps:

1. **Go to Supabase Dashboard → Support**

2. **Create New Ticket:**
   - **Subject:** PostgREST schema cache not recognizing new columns
   - **Priority:** High (story creation completely broken)
   - **Message:**
   ```
   PostgREST schema cache is not recognizing columns added via migration.

   Error: PGRST204 - Could not find the 'article_type' column of 'stories' in the schema cache

   Verified columns exist in PostgreSQL via psql.
   Tried: NOTIFY pgrst, 'reload schema' - didn't work
   Tried: Project restart - didn't work

   Request: Manual schema cache invalidation for PostgREST

   Project ID: [YOUR_PROJECT_ID]
   Affected Table: stories
   Affected Columns: article_type, slug, meta_title, meta_description, featured_image_id, syndication_destinations, themes, audience
   ```

3. **Include Evidence:**
   - Screenshot of error from browser console
   - Screenshot of psql query showing columns exist
   - Migration file that added columns

**Response Time:**
- Free tier: 24-48 hours
- Pro tier: 4-8 hours (priority support)

---

## Common Misconceptions Debunked

### ❌ "Schema cache refreshes automatically every X minutes"
**FALSE** - There is NO automatic time-based refresh. Cache only refreshes on:
- Postgres instance restart
- Manual NOTIFY command
- Event trigger (if configured)

### ❌ "Restarting the project will fix it"
**FALSE** - Project restart only restarts PostgREST service, NOT Postgres instance. Cache persists.

### ❌ "NOTIFY command works instantly"
**PARTIALLY TRUE** - Works in self-hosted PostgREST, but Supabase has a notification delivery bug requiring delays.

### ❌ "This is a PostgREST bug"
**FALSE** - Root cause is Postgres notification delivery, not PostgREST itself.

---

## Prevention Strategy

To avoid this issue in the future:

1. **Always Set Up Event Trigger** (Solution 3 above)
   - Run this ONCE after project creation
   - All future migrations will auto-reload schema

2. **After Each Migration:**
   - Wait 10 seconds
   - Run `NOTIFY pgrst, 'reload schema';` in SQL Editor
   - Verify new columns via API: `GET /rest/v1/table_name?select=new_column`

3. **Test Schema Visibility:**
   ```bash
   # Check if PostgREST sees new columns
   curl "https://[PROJECT_REF].supabase.co/rest/v1/stories?select=article_type&limit=1"
   ```

4. **Document Migration Checklist:**
   ```
   ✅ Write migration SQL
   ✅ Test in local Supabase
   ✅ Apply to production
   ✅ Run NOTIFY command
   ✅ Verify via API call
   ✅ Test UI form submission
   ```

---

## Testing After Fix

Once you've implemented a solution, test thoroughly:

### 1. API Direct Test
```bash
curl -X POST http://localhost:3030/api/stories \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "PostgREST Cache Test",
    "content": "Testing new columns after cache fix",
    "article_type": "story_feature",
    "slug": "postgrest-cache-test",
    "meta_title": "SEO Title Test",
    "meta_description": "SEO Description Test",
    "tags": ["test", "postgrest"],
    "themes": ["Resilience", "Hope"],
    "status": "draft",
    "visibility": "private",
    "syndication_destinations": ["empathy-ledger", "justicehub"]
  }'
```

**Expected:** `201 Created` with story ID returned

### 2. UI Form Test
1. Go to http://localhost:3030/stories/create
2. Fill in all fields including:
   - Article Type selector
   - Tags autocomplete
   - Themes autocomplete
   - Featured image picker
3. Click "Save Draft"
4. **Expected:** Success message, no console errors

### 3. Database Verification
```sql
SELECT id, title, article_type, slug, meta_title, themes, tags
FROM stories
WHERE title = 'PostgREST Cache Test';
```

**Expected:** All new columns populated with test data

### 4. Supabase Dashboard Check
- Go to Table Editor → stories
- Verify new row appears
- Check all new columns have values

---

## References

- **Supabase PostgREST Schema Cache Docs:** https://supabase.com/docs/guides/api/schema-cache
- **PostgREST Schema Cache Docs:** https://postgrest.org/en/stable/references/schema_cache.html
- **GitHub Issue (Notification Bug):** https://github.com/orgs/supabase/discussions/2935
- **GitHub Issue (Event Triggers):** https://github.com/PostgREST/postgrest/issues/2791

---

## Next Steps

**Immediate Action Required:**

1. Try Solution 1 (Restart Postgres Instance) - **RECOMMENDED**
2. If no restart option available, try Solution 2 (Delayed NOTIFY)
3. Set up Solution 3 (Event Trigger) for permanent fix
4. If all else fails, contact Supabase Support (Solution 4)

**Once Fixed:**
- Mark "Immediate features implementation" as 100% complete
- Move to next pending tasks:
  - Build review workflow UI
  - Add SEO meta tag generation
  - Implement email notifications
  - Create analytics dashboard

**Current Status:** 5 of 9 features complete (immediate features done, short-term pending)
