# Deploy RPC Workaround - Step by Step

## What This Does

Bypasses PostgREST's schema cache by using a stored procedure (RPC function) to insert stories directly into PostgreSQL. This allows story creation to work immediately while we wait for Supabase support to fix the cache issue.

---

## Step 1: Deploy the RPC Function (2 minutes)

1. **Open Supabase Dashboard**
   - Go to SQL Editor

2. **Run the SQL File**
   - Open `rpc-bypass-story-creation.sql` from this repo
   - Copy the entire contents
   - Paste into SQL Editor
   - Click "Run"

**Expected Output:**
```
Success. No rows returned
```

**What This Does:**
- Creates `insert_story(jsonb)` function
- Grants execute permission to authenticated users
- Function directly inserts into `stories` table, bypassing PostgREST cache

---

## Step 2: Verify the Function Works (1 minute)

Test the RPC function directly in SQL Editor:

```sql
SELECT insert_story('{
  "title": "RPC Test Story",
  "content": "Testing RPC bypass",
  "author_id": "00000000-0000-0000-0000-000000000000",
  "article_type": "story_feature",
  "tags": ["test"],
  "themes": ["Hope"],
  "status": "draft",
  "visibility": "private"
}'::jsonb);
```

**Expected Output:**
```json
{
  "id": "some-uuid-here",
  "created_at": "2026-01-10T..."
}
```

**If You Get Error:**
- Check that all columns exist in `stories` table
- Verify you ran the entire SQL file
- Check SQL Editor for error messages

---

## Step 3: Code Already Updated! ✅

The API route has been updated to use the RPC function:
- `src/app/api/stories/route.ts` now uses `supabase.rpc('insert_story', ...)`
- Feature flag `USE_RPC_WORKAROUND = true` enables the bypass
- Code is ready to test immediately

---

## Step 4: Test Story Creation (1 minute)

### Option A: Use Test Script
```bash
./test-postgrest-fix.sh
```

### Option B: Manual Test
```bash
curl -X POST http://localhost:3030/api/stories \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Test Story with New Fields",
    "content": "Testing article_type, themes, tags, and featured_image_id",
    "author_id": "00000000-0000-0000-0000-000000000000",
    "article_type": "story_feature",
    "slug": "test-story-'$(date +%s)'",
    "meta_title": "SEO Title",
    "meta_description": "SEO Description",
    "tags": ["test", "rpc", "workaround"],
    "themes": ["Resilience", "Hope", "Connection"],
    "status": "draft",
    "visibility": "private"
  }'
```

**Expected Response:**
```json
{
  "id": "some-uuid",
  "title": "Test Story with New Fields",
  "article_type": "story_feature",
  "themes": ["Resilience", "Hope", "Connection"],
  "tags": ["test", "rpc", "workaround"],
  ...
}
```

**Success Indicators:**
- ✅ No PGRST204 errors
- ✅ Story created with 201 status
- ✅ All new fields populated
- ✅ Story visible in Supabase Dashboard → stories table

---

## Step 5: Test in UI (2 minutes)

1. **Go to Story Creation Page**
   ```
   http://localhost:3030/stories/create
   ```

2. **Fill Out Form**
   - Title: "RPC Workaround Test"
   - Content: Add some text
   - Article Type: Select "Story Feature"
   - Tags: Add a few tags via autocomplete
   - Themes: Select 2-3 themes
   - Featured Image: (optional) Select an image

3. **Click "Save Draft"**

4. **Verify Success**
   - Should see success message
   - No console errors
   - Story appears in Supabase Dashboard

---

## Troubleshooting

### Error: "function insert_story(jsonb) does not exist"
**Fix:** Run `rpc-bypass-story-creation.sql` in SQL Editor

### Error: "permission denied for function insert_story"
**Fix:** Run this in SQL Editor:
```sql
GRANT EXECUTE ON FUNCTION insert_story(jsonb) TO authenticated;
```

### Error: "column does not exist"
**Fix:** The RPC function expects all columns to exist. Verify migration was applied:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'stories' AND column_name IN (
  'article_type', 'slug', 'meta_title', 'meta_description',
  'featured_image_id', 'syndication_destinations', 'themes', 'audience'
);
```

Should return 8 rows.

### Error: "null value in column violates not-null constraint"
**Fix:** Check which column is null. The RPC function sets defaults for most fields, but `title`, `content`, and `author_id` are required.

---

## Reverting Back to Normal (After Cache is Fixed)

Once Supabase Support fixes the PostgREST schema cache:

1. **Update Feature Flag**
   - Edit `src/app/api/stories/route.ts`
   - Change line 260: `const USE_RPC_WORKAROUND = false`

2. **Test Normal Insert**
   - Run test script: `./test-postgrest-fix.sh`
   - Should work without RPC function

3. **Optional: Remove RPC Function**
   ```sql
   DROP FUNCTION IF EXISTS insert_story(jsonb);
   ```

---

## What's Different?

**Before (Not Working):**
```typescript
const { data: story, error } = await supabase
  .from('stories')
  .insert([storyData])  // ❌ PostgREST cache doesn't see new columns
  .select()
  .single()
```

**After (Working):**
```typescript
const { data: rpcData, error } = await supabase
  .rpc('insert_story', { story_data: storyData })  // ✅ Bypasses cache

const { data: story } = await supabase
  .from('stories')
  .select()
  .eq('id', rpcData.id)
  .single()
```

---

## Files Modified

- ✅ `src/app/api/stories/route.ts` - Updated to use RPC bypass
- ✅ `rpc-bypass-story-creation.sql` - RPC function definition

---

## Timeline

- **Step 1-2:** 3 minutes (deploy and test RPC)
- **Step 3:** Already done ✅
- **Step 4:** 1 minute (API test)
- **Step 5:** 2 minutes (UI test)

**Total Time:** ~6 minutes to get story creation working!

---

## Next Steps After This Works

1. **Submit Supabase Support Ticket** (use template from ALTERNATIVE_FIX.md)
2. **Continue with Short-term Features:**
   - Review workflow UI
   - SEO meta tag generation
   - Email notifications
   - Analytics dashboard

3. **When Support Fixes Cache:**
   - Switch feature flag to `false`
   - Test normal insert
   - Remove RPC function
