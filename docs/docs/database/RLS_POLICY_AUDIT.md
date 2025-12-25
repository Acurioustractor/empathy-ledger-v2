# RLS Policy Audit Report

**Generated:** 2025-12-25

## Summary

- **Total Policies:** 273
- **Reported in UI:** 210
- **Discrepancy:** 63 policies (may be dropped/replaced policies)

## Key Findings

### 🚨 Major Issues

1. **15 duplicate "Public read access" policies**
   - These could be consolidated using a pattern or helper function
   - Currently spread across multiple tables

2. **Top migration has 31 policies** (`multi_org_tenants.sql`)
   - Should be reviewed for consolidation opportunities
   - Likely has separate policies for each CRUD operation per table

3. **Redundant policy patterns:**
   - 4x "Authenticated insert"
   - 3x "ACT admins can manage projects"
   - Multiple duplicate "Service role" policies

### 📊 Policy Distribution

#### By Operation Type
- SELECT: 21 explicit policies
- INSERT: 4 explicit policies
- UPDATE: 0 explicit policies
- DELETE: 0 explicit policies
- ALL operations: 6 policies
- **Unspecified:** ~242 policies (concerning - these default to ALL)

#### Top 10 Tables by Policy Count
1. `public.*` - 12 policies (schema-level)
2. `story_project_tags` - 6 policies
3. `act_projects` - 6 policies
4. `storyteller_project_features` - 5 policies
5. `story_project_features` - 4 policies
6. `ripple_effects` - 4 policies
7. `project_analyses` - 4 policies
8. `community_story_responses` - 4 policies
9. `act_feature_requests` - 4 policies
10. `act_admins` - 4 policies

#### Top 5 Migration Files
1. `multi_org_tenants.sql` - 31 policies
2. `impact_analysis_phase1_clean.sql` - 19 policies
3. `act_project_tagging_system_fixed.sql` - 19 policies
4. `media_system.sql` - 15 policies
5. `storyteller_media_library.sql` - 12 policies

## Recommendations

### 1. **Consolidate Duplicate Policies** (High Priority)
Create helper functions for common patterns:

```sql
-- Instead of 15 separate "Public read access" policies
CREATE FUNCTION create_public_read_policy(table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format(
    'CREATE POLICY public_read ON %I FOR SELECT USING (true)',
    table_name
  );
END;
$$ LANGUAGE plpgsql;
```

**Estimated reduction:** ~40-60 policies

### 2. **Use Policy Templates** (High Priority)
For multi-tenant tables, use a standard pattern:

```sql
-- Standard tenant isolation pattern
CREATE POLICY tenant_isolation ON table_name
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Standard role-based pattern
CREATE POLICY admin_full_access ON table_name
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

**Estimated reduction:** ~50-70 policies

### 3. **Combine CRUD Policies** (Medium Priority)
Instead of 4 separate policies (SELECT, INSERT, UPDATE, DELETE):

```sql
-- Before: 4 policies
CREATE POLICY users_select...
CREATE POLICY users_insert...
CREATE POLICY users_update...
CREATE POLICY users_delete...

-- After: 1 policy
CREATE POLICY users_full_access
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Estimated reduction:** ~30-50 policies

### 4. **Review "Service Role" Policies** (Low Priority)
Service role bypasses RLS anyway. Consider removing these policies:
- "Service role full access to consent"
- "Service role can read access logs"
- "Service role can insert access logs"

**Estimated reduction:** ~10-15 policies

### 5. **Audit Multi-Org Migration** (High Priority)
The `multi_org_tenants.sql` file has 31 policies. Review for:
- Duplicate patterns
- Overly granular policies
- Missing operation specifications

## Proposed Refactoring Plan

### Phase 1: Quick Wins (Reduce by ~50 policies)
1. Remove service role policies (bypassed anyway)
2. Consolidate "Public read access" using helper function
3. Combine duplicate "Authenticated insert" policies

### Phase 2: Pattern Consolidation (Reduce by ~80 policies)
1. Create tenant isolation helper
2. Create role-based access helper
3. Refactor multi_org_tenants migration
4. Combine CRUD into FOR ALL where appropriate

### Phase 3: Maintenance (Ongoing)
1. Create policy templates in migration boilerplate
2. Document standard patterns in CLAUDE.md
3. Add pre-commit hook to flag duplicate policy names

## Expected Outcome

**Target:** ~120-140 policies (reduction of 130-150)

**Benefits:**
- Easier to maintain
- Faster to audit
- Less cognitive overhead
- Better performance (fewer policy checks)
- Clearer security model

## Next Steps

1. Review this audit with team
2. Create consolidation migration
3. Test in staging environment
4. Deploy to production
5. Update documentation
