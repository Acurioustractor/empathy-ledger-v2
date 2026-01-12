# Alternative Fix: Contact Supabase Support

Since the delayed NOTIFY approach isn't working, here's what to do:

## Option 1: Try the Event Trigger First

Run `setup-auto-schema-reload.sql` in SQL Editor, then manually add a dummy column to trigger the reload:

```sql
-- This will trigger the event and force schema reload
ALTER TABLE stories ADD COLUMN IF NOT EXISTS _cache_refresh_trigger BOOLEAN DEFAULT NULL;
ALTER TABLE stories DROP COLUMN IF EXISTS _cache_refresh_trigger;
```

Wait 10 seconds, then test.

## Option 2: Contact Supabase Support (RECOMMENDED)

The PostgREST schema cache notification system has a known bug in Supabase Cloud. Support can manually invalidate the cache.

### Support Ticket Template:

**Go to:** Supabase Dashboard → Support → New Ticket

**Subject:** PostgREST schema cache not updating after migration - PGRST204 error

**Priority:** High (blocking production feature)

**Message:**
```
Hello Supabase Support,

I'm experiencing a PostgREST schema cache issue that's blocking story creation in my application.

PROBLEM:
PostgREST schema cache is not recognizing columns added via migration, returning error:
"Could not find the 'article_type' column of 'stories' in the schema cache"

VERIFICATION:
- Columns DO exist in PostgreSQL (verified via psql)
- Migration was successfully applied
- Problem persists after project restart

TROUBLESHOOTING ATTEMPTED:
✅ Project restart (Settings → General → Restart project)
✅ NOTIFY pgrst, 'reload schema' with pg_sleep delays (multiple attempts)
✅ Waited 10+ minutes for potential auto-refresh
❌ Still getting PGRST204 errors

REQUEST:
Please manually invalidate the PostgREST schema cache for my project.

PROJECT DETAILS:
- Project: [YOUR_PROJECT_NAME]
- Table: stories
- Columns not recognized: article_type, slug, meta_title, meta_description, featured_image_id, syndication_destinations, themes, audience

AFFECTED COLUMNS SQL:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'stories'
AND column_name IN ('article_type', 'slug', 'meta_title', 'meta_description', 'featured_image_id', 'syndication_destinations', 'themes', 'audience');

ERROR DETAILS:
{
  "code": "PGRST204",
  "message": "Could not find the 'article_type' column of 'stories' in the schema cache"
}

Thank you for your assistance!
```

**Expected Response Time:**
- Free tier: 24-48 hours
- Pro tier: 4-8 hours

**What Support Will Do:**
- Manually restart your PostgREST instance
- Clear the schema cache
- Verify columns are visible to API

## Option 3: Workaround - Use Supabase Client Instead of API Route

While waiting for support, you can temporarily bypass PostgREST by using the Supabase client directly:

### Modify `/api/stories/route.ts`:

Instead of letting PostgREST handle the insert, use the JavaScript client:

```typescript
// Instead of this (uses PostgREST):
const { data, error } = await supabase
  .from('stories')
  .insert(storyData)
  .select()
  .single();

// Use this (bypasses PostgREST cache):
const { data, error } = await supabase
  .rpc('insert_story', { story_data: storyData });
```

Then create the RPC function in SQL:

```sql
CREATE OR REPLACE FUNCTION insert_story(story_data jsonb)
RETURNS TABLE (
  id uuid,
  title text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO stories (
    title, content, article_type, slug, meta_title, meta_description,
    featured_image_id, syndication_destinations, tags, themes,
    status, visibility, author_id, story_type, audience
  )
  VALUES (
    story_data->>'title',
    story_data->>'content',
    story_data->>'article_type',
    story_data->>'slug',
    story_data->>'meta_title',
    story_data->>'meta_description',
    (story_data->>'featured_image_id')::uuid,
    (story_data->'syndication_destinations')::text[],
    (story_data->'tags')::text[],
    (story_data->'themes')::text[],
    story_data->>'status',
    story_data->>'visibility',
    (story_data->>'author_id')::uuid,
    story_data->>'story_type',
    story_data->>'audience'
  )
  RETURNING id, title, created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

This completely bypasses PostgREST's schema cache by using a stored procedure.

## Recommendation

**For immediate fix:** Use Option 3 (RPC workaround)
**For permanent fix:** Contact support (Option 2) + set up event trigger

The root cause is a known Postgres notification delivery issue in Supabase Cloud. This will likely be fixed in a future platform update.
