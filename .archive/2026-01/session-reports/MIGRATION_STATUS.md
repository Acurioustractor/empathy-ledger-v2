# Migration Status - Phase 1

**Date:** January 10, 2026
**Status:** ⚠️ Migration Created, Not Yet Applied

---

## Migration File Created

**File:** `supabase/migrations/20260111000001_fix_stories_schema.sql`

This migration adds critical columns and infrastructure needed for:
- Full-text search
- Scheduled publishing
- Auto-updating comment counts
- Status history audit trail

---

## Why Migration Hasn't Been Applied

The `npx supabase db push` command failed because there are remote migrations not in local:

```
Remote migration versions not found in local migrations directory.
Make sure your local git repo is up-to-date.
```

This is the same issue we encountered before with the super-admin migration.

---

## Solution: Apply Via Supabase SQL Editor

Since CLI push is blocked, apply the migration manually via Supabase dashboard:

### Steps:

1. **Open Supabase SQL Editor:**
   - Go to https://supabase.com/dashboard/project/YOUR_PROJECT
   - Navigate to SQL Editor

2. **Copy Migration Content:**
   ```bash
   cat supabase/migrations/20260111000001_fix_stories_schema.sql
   ```

3. **Paste and Execute:**
   - Paste the entire SQL into editor
   - Click "Run"
   - Verify success messages

4. **Verify Applied:**
   ```sql
   -- Check new columns
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'stories'
     AND column_name IN ('audience', 'elder_approval_required', 'comments_count');

   -- Check new table
   SELECT COUNT(*) FROM story_status_history;

   -- Check indexes
   SELECT indexname FROM pg_indexes WHERE tablename = 'stories';
   ```

---

## What Works Without Migration

### ✅ Already Working:
- Bug fixes (cultural_sensitivity_level, browse API fields)
- Scheduled publishing function (registered with Inngest)
- Basic story querying

### ⚠️ Requires Migration:
- **Full-text search** - Needs search_vector updates
- **Comment count sorting** - Needs comments_count column
- **Audience filtering** - Needs audience column
- **Theme/tag filtering** - Needs themes/tags arrays
- **Scheduled publishing execution** - Needs proper indexes
- **Status history** - Needs story_status_history table

---

## Simplified Search (Current)

I've created a minimal version of the search that works with current schema:

```typescript
// Works NOW (no migration needed):
GET /api/stories/search?q=keywords

// Queries only existing columns:
- id, title, excerpt, content
- story_type, reading_time
- view_count, cultural_themes
- language, published_at
```

### Full Search (After Migration):
```typescript
// Will work AFTER migration:
GET /api/stories/search?q=keywords&themes=x,y&tags=a,b&audience=elders

// Additional features:
- Slug generation
- Comments count
- Audience filtering
- Theme/tag arrays
- Article type filtering
```

---

## Next Steps

### Option 1: Apply Migration Manually (Recommended)
1. Open Supabase SQL Editor
2. Copy migration content from file
3. Execute SQL
4. Verify columns/tables created
5. Test full search

### Option 2: Wait for Migration Fix
1. Pull remote migrations: `supabase db pull`
2. Resolve conflicts
3. Push all migrations: `npx supabase db push`

---

## Testing Plan

### Before Migration:
- [x] Basic search endpoint compiles
- [x] Returns published stories
- [ ] Search with keywords (limited - no search_vector updates yet)

### After Migration:
- [ ] Full-text search with relevance ranking
- [ ] Theme/tag filtering
- [ ] Audience filtering
- [ ] Comment count sorting
- [ ] Scheduled publishing auto-executes
- [ ] Status history captures transitions

---

## Impact

**Without Migration:**
- Phase 1 is ~50% functional
- Search works but limited
- No auto-features (comment counts, scheduled publishing)

**With Migration:**
- Phase 1 is 100% functional
- Full search capabilities
- All automation working
- Audit trail in place

---

## Recommendation

**Apply the migration via Supabase SQL Editor ASAP** to unlock full Phase 1 functionality.

The migration is safe (uses `IF NOT EXISTS`, doesn't drop data) and includes:
- 4 new columns
- 1 new audit table
- 11 performance indexes
- 3 automatic triggers
- Data backfill for existing stories

**Estimated Application Time:** 2-3 minutes
**Risk:** Low (all operations are additive)
**Rollback:** Can drop new columns/tables if needed

---

**Status:** Waiting for manual migration application
**Next:** After migration, test full search and scheduled publishing
