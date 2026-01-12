# Fix PostgREST Schema Cache - Quick Steps

## What You Need To Do

Since Supabase Cloud only has "Restart project" (not separate instance restart), follow these steps:

### Step 1: Restart Your Project (2-3 minutes)

1. Open Supabase Dashboard
2. Go to Settings → General
3. Click "Restart project"
4. Wait for restart to complete (watch for "Project is online" message)

### Step 2: Run the Fix SQL (30 seconds)

1. In Supabase Dashboard, go to SQL Editor
2. Open the file `fix-postgrest-cache.sql` from this repo
3. Copy the SQL and paste it into SQL Editor:

```sql
DO $$
BEGIN
  PERFORM pg_sleep(1);
  PERFORM pg_notify('pgrst', 'reload schema');
END $$;
```

4. Click "Run"
5. **Wait 5 seconds** before testing

### Step 3: Test the Fix (30 seconds)

Run this command in your terminal:

```bash
cd /Users/benknight/Code/empathy-ledger-v2
./test-postgrest-fix.sh
```

**Expected Output:**
```
✅ SUCCESS: Story created with new columns!
   Story ID: [some-uuid]
```

**If You See Error:**
```
❌ FAILED: Schema cache still not updated
```

Then proceed to Step 4.

### Step 4: Set Up Permanent Fix (1 minute)

This ensures the problem never happens again on future migrations:

1. In SQL Editor, open `setup-auto-schema-reload.sql`
2. Copy and run the entire SQL file
3. Verify you see a row returned showing the trigger is enabled

This creates an event trigger that automatically reloads PostgREST schema whenever you run migrations.

### Step 5: If Still Broken - Contact Support

If the above steps don't work, contact Supabase Support:

**Subject:** PostgREST schema cache not recognizing new columns after migration

**Message:**
```
PostgREST schema cache is not recognizing columns added via migration.

Error: PGRST204 - Could not find the 'article_type' column of 'stories' in the schema cache

Steps attempted:
- Project restart
- NOTIFY pgrst, 'reload schema' with pg_sleep(1) delay
- Waited 5+ minutes

Verified columns exist in PostgreSQL via psql.

Request: Manual schema cache invalidation for PostgREST

Project: [YOUR_PROJECT_NAME]
Table: stories
Columns not recognized: article_type, slug, meta_title, meta_description, featured_image_id, syndication_destinations, themes, audience
```

---

## Quick Reference

**Files Created:**
- `fix-postgrest-cache.sql` - Run this in SQL Editor after project restart
- `setup-auto-schema-reload.sql` - Run this once for permanent fix
- `test-postgrest-fix.sh` - Test script to verify fix worked

**Total Time:** ~5 minutes

**Success Indicator:** Story creation works without PGRST204 errors
