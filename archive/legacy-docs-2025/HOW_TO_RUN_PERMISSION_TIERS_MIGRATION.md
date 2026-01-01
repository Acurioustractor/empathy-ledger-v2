# How to Run Permission Tiers Migration

**Status:** Ready to run
**Migration File:** `supabase/migrations/20251224000000_permission_tiers.sql`

---

## ✅ BEST METHOD: Supabase Dashboard SQL Editor

This is the most reliable method and works 100% of the time.

### Step 1: Open SQL Editor

Go to: **https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new**

### Step 2: Copy Migration SQL

Copy the entire contents of:
```
supabase/migrations/20251224000000_permission_tiers.sql
```

### Step 3: Paste and Run

1. Paste the SQL into the editor
2. Click the green **"Run"** button (or press Cmd/Ctrl + Enter)
3. Wait for execution (should take ~5-10 seconds)

### Step 4: Verify Success

You should see:
- ✅ "Success. No rows returned" (this is normal - DDL statements don't return rows)
- Or specific success messages for each operation

### Step 5: Confirm Migration Applied

Run this query in the SQL Editor to verify:

```sql
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'stories'
  AND column_name IN (
    'permission_tier',
    'consent_verified_at',
    'archive_consent_given',
    'elder_reviewed'
  )
ORDER BY column_name;
```

Expected result: 4 rows showing the new columns.

---

## Alternative Method: Supabase CLI (if you prefer command line)

### Prerequisites
1. Project must be linked:
```bash
npx supabase link --project-ref yvnuayzslukamizrlhwb --password "Drillsquare99"
```

### Step 1: Preview Changes
```bash
npx supabase db push --dry-run
```

This shows which migrations will be applied.

### Step 2: Push Migrations
```bash
npx supabase db push
```

Type `Y` when prompted.

### ⚠️ Known Issue with CLI Method

If you see errors like `policy "..." already exists`, it means some older migrations weren't idempotent. In this case:

**Option A:** Use Dashboard SQL Editor instead (recommended)

**Option B:** Mark old migrations as applied manually:

1. Create the migrations table if it doesn't exist:
```sql
CREATE SCHEMA IF NOT EXISTS supabase_migrations;

CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version TEXT PRIMARY KEY,
  statements TEXT[],
  name TEXT
);
```

2. Mark problematic migrations as already applied:
```sql
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES
  ('20251214', 'world_tour_tables'),
  ('20251220090000', 'saas_org_tier_and_distribution_policy'),
  ('20251220093000', 'multi_org_tenants'),
  ('20251223000000', 'story_access_tokens'),
  ('20251223120000', 'storyteller_media_library'),
  ('20251223140000', 'add_story_engagement_counts')
ON CONFLICT (version) DO NOTHING;
```

3. Then run:
```bash
npx supabase db push
```

This will only apply the new `permission_tiers` migration.

---

## What the Migration Does

The migration creates:

### 1. Enum Type
```sql
CREATE TYPE permission_tier AS ENUM (
  'private',        -- Only storyteller can see
  'trusted_circle', -- Only people with access codes
  'community',      -- OK for community spaces/events
  'public',         -- OK for public sharing (social media, websites)
  'archive'         -- Permanent public record (cannot withdraw)
);
```

### 2. New Columns on `stories` Table
- `permission_tier` (defaults to 'private')
- `consent_verified_at` (timestamp)
- `archive_consent_given` (boolean)
- `elder_reviewed` (boolean)
- `elder_reviewed_at` (timestamp)
- `elder_reviewer_id` (UUID)

### 3. Database Functions
- `validate_archive_consent()` - Prevents accidental archival
- `can_create_share_link(story_id, purpose)` - Validates permissions before token creation

### 4. Triggers
- Auto-updates `consent_verified_at` when tier changes
- Prevents withdrawing archived stories

### 5. View
- `stories_with_trust_indicators` - Pre-computed trust badges for UI

### 6. Data Migration
- Sets existing published stories to 'public' tier
- Sets existing drafts/withdrawn to 'private' tier
- Populates `consent_verified_at` with existing `updated_at`

---

## Verification Queries

### Check New Columns Exist
```sql
\d stories
```

Look for the new columns in the table definition.

### Count Stories by Permission Tier
```sql
SELECT
  permission_tier,
  COUNT(*) as story_count
FROM stories
GROUP BY permission_tier
ORDER BY permission_tier;
```

Expected: Should see counts for 'public' and 'private' tiers.

### Test `can_create_share_link()` Function
```sql
SELECT * FROM can_create_share_link(
  (SELECT id FROM stories LIMIT 1),
  'social-media'
);
```

Should return a row with `allowed`, `reason`, and `tier` columns.

### View Trust Indicators
```sql
SELECT
  id,
  title,
  permission_tier_label,
  permission_tier_emoji,
  has_elder_review,
  consent_recently_verified
FROM stories_with_trust_indicators
LIMIT 5;
```

---

## Troubleshooting

### Error: "type permission_tier already exists"
**Cause:** Migration was partially applied before.

**Solution:** The migration uses `IF NOT EXISTS` patterns, so this shouldn't happen. But if it does, the rest of the migration should still succeed. Check if all columns were created.

### Error: "column permission_tier already exists"
**Cause:** Migration was already applied successfully.

**Solution:** No action needed! Verify with the verification queries above.

### Error: "function can_create_share_link already exists"
**Cause:** Migration was partially applied.

**Solution:** Use `CREATE OR REPLACE FUNCTION` instead of `CREATE FUNCTION`. The migration file already uses this pattern, so you're safe to re-run.

### Error: Connection timeout
**Cause:** Network issue or database is busy.

**Solution:**
1. Try again in a few minutes
2. Use Dashboard SQL Editor instead (more reliable)

---

## After Migration

Once the migration is applied:

1. **Frontend will automatically work** - Components check for `permission_tier` field and render badges when present

2. **Update API queries** - Add permission tier fields to story queries:
```typescript
const { data } = await supabase
  .from('stories')
  .select(`
    *,
    permission_tier,
    consent_verified_at,
    elder_reviewed,
    elder_reviewed_at
  `)
```

3. **Test in browser** - Story cards should show permission tier badges

4. **Next steps:**
   - Build permission tier selector component
   - Update share link API to validate permissions
   - Add ethical guidelines page

---

## Resources

- **Dashboard SQL Editor:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new
- **Table Inspector:** https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/editor
- **Migration File:** `supabase/migrations/20251224000000_permission_tiers.sql`
- **Supabase CLI Docs:** https://supabase.com/docs/reference/cli/supabase-db-push

---

**Estimated Time:** 2-5 minutes
**Difficulty:** Easy (just copy-paste into Dashboard)
**Risk:** Low (migration is idempotent and safe to re-run)
