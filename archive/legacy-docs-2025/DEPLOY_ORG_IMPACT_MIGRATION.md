# Deploy Organization Impact Analytics Migration

## Quick Deploy Guide

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"** button

### Step 2: Copy Migration SQL

Open this file: `supabase/migrations/20251224000001_organization_impact_analytics.sql`

**Or copy from here**: [View File](../supabase/migrations/20251224000001_organization_impact_analytics.sql)

### Step 3: Paste and Run

1. Paste the entire SQL into the SQL Editor
2. Click **"Run"** button (or press Cmd/Ctrl + Enter)
3. Wait for confirmation (should take 2-3 seconds)

### Step 4: Verify Tables Created

Run this query to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'organization_%'
ORDER BY table_name;
```

**Expected output** (4 new tables):
- `organization_cross_transcript_insights`
- `organization_impact_metrics`
- `organization_storyteller_network`
- `organization_theme_analytics`

### Step 5: Test RLS Policies

```sql
-- Check policies were created
SELECT tablename, policyname
FROM pg_policies
WHERE tablename LIKE 'organization_%';
```

**Expected**: 5-6 policies across the 4 tables

### What This Migration Creates

**4 New Tables**:

1. **organization_impact_metrics**
   - Aggregated impact scores for organizations
   - Theme diversity, quote counts, impact dimensions
   - Auto-updated via triggers

2. **organization_theme_analytics**
   - Theme usage tracking over time
   - Monthly trends, cultural relevance
   - Representative quotes per theme

3. **organization_cross_transcript_insights**
   - AI-generated insights from analyzing transcripts together
   - Dominant patterns, emerging themes, cultural markers
   - Confidence scoring and significance levels

4. **organization_storyteller_network**
   - Connection graph between storytellers
   - Shared themes, projects, cultural backgrounds
   - Connection strength scoring

**Features Added**:
- ✅ Row-Level Security policies
- ✅ Auto-calculation trigger on transcript analysis
- ✅ Helper function: `calculate_organization_impact_metrics(org_id)`
- ✅ Initial data seeded for existing organizations

### Troubleshooting

**Error: relation "organizations" does not exist**
- Fixed in latest version (commit eefa366)
- Make sure you're using the updated file

**Error: permission denied**
- Ensure you're logged in as the database owner
- Use the SQL Editor in Supabase dashboard (not psql)

**Error: duplicate key value**
- Migration has already been run
- Check if tables exist: `\dt organization_*`

### After Migration Success

You can now:
1. Call `SELECT calculate_organization_impact_metrics('org-uuid-here');`
2. Query `organization_impact_metrics` table for dashboard data
3. Use the organization impact APIs (once built)

### Next Steps

1. **Test the migration** - Verify all 4 tables exist
2. **Run initial calculation** - `calculate_organization_impact_metrics()` for each org
3. **Build dashboard API** - `GET /api/organizations/[id]/impact-dashboard`
4. **Activate transcript analysis** - Populate data for the analytics

---

**Migration File**: `supabase/migrations/20251224000001_organization_impact_analytics.sql`
**Last Updated**: December 24, 2025
**Status**: ✅ Ready to deploy (table name fix applied)
