# Backed Up Migrations - 2025-12-25

## What Happened

On 2025-12-25, we encountered migration sync issues where local migrations conflicted with the remote database state. Some schema changes had been applied to the remote database (likely via Supabase Studio) but the migrations weren't properly tracked.

## Resolution Strategy

We chose to **pull the current remote state as the source of truth** rather than continue fixing each migration individually.

### Steps Taken:

1. **Backed up conflicting migrations** to `supabase/migrations_backup/`
2. **Marked migrations as reverted** in remote history:
   - 20251214
   - 20251220090000
   - 20251224000000
3. **Created fresh snapshot**: `20251225160903_remote_schema_snapshot.sql` (699KB)
4. **Generated new types**: Updated `src/types/database.ts` (17,180 lines)
5. **Marked snapshot as applied**: Since it represents current remote state

## Backed Up Files (18 total)

These migrations are preserved here for reference:

- `20251214_world_tour_tables.sql` - Tour requests, dream orgs, tour stops
- `20251220090000_saas_org_tier_and_distribution_policy.sql` - Org tiers
- `20251220093000_multi_org_tenants.sql` - Multi-tenant foundation (29KB)
- `20251223000000_story_access_tokens.sql` - Token-based story access
- `20251223120000_storyteller_media_library.sql` - Media library tables
- `20251223140000_add_story_engagement_counts.sql` - Engagement tracking
- `20251224000000_permission_tiers.sql` - Permission system
- `20251224000001_act_project_tagging_system_fixed.sql` - ACT project tagging
- `20251224000001_organization_impact_analytics.sql` - Impact analytics
- `20251224000002_act_integration_idempotent.sql` - ACT integration
- `20251224000003_act_integration_final.sql` - ACT integration final
- `20251224000003_act_multi_site_ecosystem.sql` - Multi-site ecosystem
- `20251224000004_act_minimal.sql` - ACT minimal
- `20251224000005_add_all_37_projects.sql` - Seed 37 ACT projects
- `20251224000006_cleanup_non_projects.sql` - Cleanup non-projects
- `20251225000000_grant_super_admin_hi_act_place.sql` - Super admin grant
- `20251225000001_impact_analysis_phase1.sql` - Impact analysis
- `20251225000001_impact_analysis_phase1_clean.sql` - Impact analysis clean

## Important Notes

### Schema Changes ARE Applied
All the schema changes from these migrations ARE currently in the remote database. The backup is for historical reference only.

### If You Need to Recreate a Change
If you discover you need one of these changes and it's NOT in the current remote:

1. Review the backed-up migration file
2. Create a NEW migration:
   ```bash
   supabase migration new add_missing_feature
   ```
3. Copy the relevant SQL (making it idempotent)
4. Test locally: `npm run db:reset`
5. Push: `npm run db:push`

### Going Forward

✅ **Clean State**: Local and remote now perfectly in sync
✅ **Source of Truth**: `20251225160903_remote_schema_snapshot.sql`
✅ **Best Practice**: Always use the workflow in `docs/DATABASE_WORKFLOW.md`

## Lessons Learned

1. **Always use migrations** - Never make changes directly in Supabase Studio without pulling them to migrations
2. **Pull regularly** - `npm run db:pull` after any Studio changes
3. **Idempotent SQL** - Always use `IF NOT EXISTS`, `DROP IF EXISTS`, etc.
4. **Test locally** - Use `npm run db:reset` to test migrations before pushing

## Recovery

If you absolutely need to restore these exact migrations:
```bash
# DON'T DO THIS unless you know what you're doing
cp supabase/migrations_backup/*.sql supabase/migrations/
# Then fix idempotency issues one by one
```

Better approach: Create NEW migrations for any missing features.
