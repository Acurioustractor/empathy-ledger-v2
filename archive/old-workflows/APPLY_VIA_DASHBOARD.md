# How to Force PostgREST Cache Refresh via Supabase Dashboard

## The Problem
PostgREST's schema cache hasn't picked up the new columns we added to the `profiles` table, even though they exist in PostgreSQL.

## The Solution
Apply a migration through Supabase's dashboard SQL Editor. When you run SQL through the dashboard, it automatically refreshes the PostgREST cache.

## Step-by-Step Instructions

### Option 1: SQL Editor (Simplest)

1. **Go to SQL Editor**
   - Navigate to: https://app.supabase.com/project/yvnuayzslukamizrlhwb/sql/new

2. **Copy and paste this SQL**:
   ```sql
   -- Force PostgREST cache refresh by making a trivial schema change
   COMMENT ON TABLE profiles IS 'Storyteller and user profiles - refreshed at 2025-10-05';

   -- Verify all columns exist
   SELECT column_name
   FROM information_schema.columns
   WHERE table_name = 'profiles'
   ORDER BY ordinal_position;
   ```

3. **Click "Run"**

4. **Verify the output** - You should see all 54 columns listed, including:
   - avatar_media_id
   - cover_media_id
   - email
   - phone_number
   - tenant_id
   - is_storyteller
   - etc.

5. **Wait 30 seconds** for PostgREST to pick up the change

6. **Test the wizard** - Try creating a storyteller through the wizard again

### Option 2: Restart the Project (Nuclear Option)

If Option 1 doesn't work:

1. Go to: https://app.supabase.com/project/yvnuayzslukamizrlhwb/settings/general
2. Scroll to "Pause project"
3. Click "Pause project"
4. Wait 1 minute
5. Click "Resume project"
6. Wait for project to fully restart (2-3 minutes)
7. PostgREST cache will be completely rebuilt

### Option 3: Add a Dummy Column (Forces Cache Refresh)

1. Go to: https://app.supabase.com/project/yvnuayzslukamizrlhwb/sql/new

2. Run this SQL:
   ```sql
   -- Add a temporary column to force cache refresh
   ALTER TABLE profiles
   ADD COLUMN IF NOT EXISTS _cache_refresh_trigger TIMESTAMP DEFAULT NOW();

   -- Immediately drop it
   ALTER TABLE profiles
   DROP COLUMN IF EXISTS _cache_refresh_trigger;
   ```

3. This ALTER TABLE operation will force Supabase to reload the entire profiles table schema into PostgREST cache

## How to Verify It Worked

After trying any of the above options, test with this API call:

```bash
curl -X POST 'http://localhost:3031/api/profiles/create' \
  -H 'Content-Type: application/json' \
  -d '{
    "display_name": "Cache Test User",
    "full_name": "Cache Test User",
    "first_name": "Cache",
    "last_name": "Test",
    "bio": "Testing cache refresh",
    "is_storyteller": true
  }'
```

If you get a successful response (not a cache error), the cache is refreshed!

## Why This Works

- Using `psql` directly bypasses PostgREST's awareness system
- Running SQL through Supabase dashboard triggers their internal cache refresh mechanism
- ALTER TABLE operations always trigger cache refresh
- Pausing/resuming the project rebuilds the entire cache from scratch

## Current Status

✅ **Database Schema** - All 54 columns exist in PostgreSQL
✅ **organizations.tenant_id** - Cache refreshed (visible to PostgREST)
❌ **profiles columns** - Cache NOT refreshed (avatar_media_id not visible to PostgREST)

Once you complete any of these steps, the wizard should work perfectly!
