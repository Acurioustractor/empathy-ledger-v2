# Database Security Audit & Fix Plan
## Production Readiness Security Review

**Date**: January 11, 2026
**Status**: 🔴 BLOCKING ISSUES FOUND - NOT PRODUCTION READY
**Priority**: CRITICAL - Must fix before launching unified analysis system

---

## 🚨 Critical Security Findings

### BLOCKING ISSUE #1: 55 Tables Without RLS (27% of database)

**Impact**: Complete data exposure - anyone with database access can read/modify these tables

**High-Risk Tables (contain sensitive data):**
1. `extracted_quotes` - Storyteller quotes (0 policies)
2. `organization_members` - RLS enabled but 0 policies (COMPLETELY BLOCKED)
3. `organization_invitations` - RLS enabled but 0 policies
4. `media_person_recognition` - Face recognition data
5. `locations` - Geographic PII
6. `professional_competencies` - Profile data
7. `profile_locations`, `profile_galleries`, `profile_projects` - Profile associations
8. `project_media`, `project_organizations`, `project_participants`, `project_storytellers` - Project data
9. `storyteller_media_links`, `storyteller_organizations`, `storyteller_projects` - Storyteller associations

**Infrastructure Tables (lower risk, but should have service-role-only access):**
- `_migration_backup_phase1`
- `ai_processing_logs`, `analysis_jobs`
- `content_cache`, `content_syndication`
- `data_quality_metrics`, `data_sources`
- `empathy_sync_log`
- `events_2024_01`, `events_2025_08`, `events_2025_09` (old event tables)

### BLOCKING ISSUE #2: Tables with RLS but No Policies

**These tables are COMPLETELY INACCESSIBLE** (RLS enabled = block all by default):

1. **organization_members** (0 policies)
   - **CRITICAL**: Users can't access organization membership data
   - **Impact**: Organization features completely broken
   - **Priority**: P0 - FIX IMMEDIATELY

2. **organization_invitations** (0 policies)
   - **Impact**: Can't invite people to organizations
   - **Priority**: P0 - FIX IMMEDIATELY

3. **report_feedback** (0 policies)
   - **Impact**: Can't submit report feedback
   - **Priority**: P2 - Non-critical feature

4. **report_sections** (0 policies)
   - **Impact**: Can't create report sections
   - **Priority**: P2 - Non-critical feature

5. **syndication_webhook_events** (0 policies)
   - **Impact**: Can't track syndication webhooks
   - **Priority**: P2 - Non-critical feature

---

## 📊 Current RLS Coverage

| Status | Tables | Percentage | Examples |
|--------|--------|------------|----------|
| ✅ RLS with policies (1+ policy) | **147 tables** | 71% | profiles (20 policies), stories (12), media_assets (10) |
| ⚠️ RLS enabled, 0 policies | **5 tables** | 2% | organization_members, organization_invitations |
| 🔴 No RLS at all | **55 tables** | 27% | extracted_quotes, locations, project associations |

**Total tables**: 207

---

## 🔒 Security Standards Required

### Standard 1: Multi-Tenant Isolation

Every table with `tenant_id` or `organization_id` must enforce tenant boundaries:

```sql
-- Tenant isolation pattern
CREATE POLICY "tenant_isolation"
  ON table_name
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );
```

### Standard 2: Ownership

Tables with owner/creator must restrict to owner + admins:

```sql
-- Owner pattern
CREATE POLICY "owner_access"
  ON table_name
  FOR ALL
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = true
    )
  );
```

### Standard 3: Privacy Levels

Tables with `privacy_level` must respect visibility:

```sql
-- Privacy pattern
CREATE POLICY "privacy_aware"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (
    privacy_level = 'public'
    OR (privacy_level = 'organization' AND tenant_id = user_tenant())
    OR owner_id = auth.uid()
  );
```

### Standard 4: Organization Membership

Organization-scoped tables must check membership:

```sql
-- Org membership pattern
CREATE POLICY "org_members_only"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid()
    )
  );
```

---

## 🛠️ Fix Plan

### Phase 1: CRITICAL BLOCKERS (DO NOW)

#### Fix 1.1: organization_members (P0 - BLOCKING)

**Issue**: RLS enabled, 0 policies = completely blocked
**Impact**: Organization features broken
**Fix**:

```sql
-- supabase/migrations/20260112000100_fix_organization_members_rls.sql

-- Members can view their own membership
CREATE POLICY "Members can view own membership"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Members can view other members in same org
CREATE POLICY "Members can view org members"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid()
    )
  );

-- Admins/Elders can manage membership
CREATE POLICY "Admins can manage membership"
  ON organization_members
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid()
        AND role IN ('admin', 'elder', 'cultural_advisor')
    )
  );

-- Super admins full access
CREATE POLICY "Super admins full access"
  ON organization_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = true
    )
  );
```

#### Fix 1.2: organization_invitations (P0 - BLOCKING)

```sql
-- supabase/migrations/20260112000101_fix_organization_invitations_rls.sql

-- Users can view invitations sent to them
CREATE POLICY "Users can view own invitations"
  ON organization_invitations
  FOR SELECT
  TO authenticated
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR inviter_id = auth.uid()
  );

-- Org admins can create invitations
CREATE POLICY "Org admins can invite"
  ON organization_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid()
        AND role IN ('admin', 'elder')
    )
  );

-- Org admins can view org invitations
CREATE POLICY "Org admins can view org invitations"
  ON organization_invitations
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid()
        AND role IN ('admin', 'elder')
    )
  );

-- Users can update their own invitations (accept/decline)
CREATE POLICY "Users can respond to invitations"
  ON organization_invitations
  FOR UPDATE
  TO authenticated
  USING (
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
```

#### Fix 1.3: extracted_quotes (P0 - HIGH RISK)

```sql
-- supabase/migrations/20260112000102_fix_extracted_quotes_rls.sql

-- Enable RLS
ALTER TABLE extracted_quotes ENABLE ROW LEVEL SECURITY;

-- Author owns their quotes
CREATE POLICY "Authors can view own quotes"
  ON extracted_quotes
  FOR SELECT
  TO authenticated
  USING (
    author_id = auth.uid()
    OR privacy_level = 'public'
  );

-- Org members can view org quotes
CREATE POLICY "Org members can view org quotes"
  ON extracted_quotes
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid()
    )
  );

-- Service role can insert (from AI analysis)
CREATE POLICY "Service role can manage quotes"
  ON extracted_quotes
  FOR ALL
  TO service_role
  USING (true);
```

---

### Phase 2: HIGH-RISK DATA TABLES (WEEK 1)

#### Profile Association Tables

```sql
-- Enable RLS on all profile association tables
ALTER TABLE profile_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_competencies ENABLE ROW LEVEL SECURITY;

-- Standard owner-only pattern
CREATE POLICY "Owner access only" ON profile_locations
  FOR ALL TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Owner access only" ON profile_galleries
  FOR ALL TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Owner access only" ON profile_projects
  FOR ALL TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Owner access only" ON professional_competencies
  FOR ALL TO authenticated
  USING (storyteller_id IN (SELECT id FROM storytellers WHERE profile_id = auth.uid()));
```

#### Project Association Tables

```sql
-- Enable RLS on project associations
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- Org members can access project data
CREATE POLICY "Org members access project associations" ON project_media
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE om.profile_id = auth.uid()
    )
  );

-- Repeat for other project tables...
```

#### Storyteller Association Tables

```sql
-- Enable RLS on storyteller associations
ALTER TABLE storyteller_media_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_projects ENABLE ROW LEVEL SECURITY;

-- Storyteller owns their associations
CREATE POLICY "Storyteller owns associations" ON storyteller_media_links
  FOR ALL TO authenticated
  USING (
    storyteller_id IN (SELECT id FROM storytellers WHERE profile_id = auth.uid())
  );

-- Org admins can manage
CREATE POLICY "Org admins can manage" ON storyteller_organizations
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE profile_id = auth.uid() AND role IN ('admin', 'elder')
    )
  );
```

#### Geographic/PII Tables

```sql
-- Enable RLS on sensitive data
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_person_recognition ENABLE ROW LEVEL SECURITY;

-- Public locations or org-owned
CREATE POLICY "Public or org locations" ON locations
  FOR SELECT TO authenticated
  USING (
    is_public = true
    OR organization_id IN (
      SELECT organization_id FROM organization_members WHERE profile_id = auth.uid()
    )
  );

-- Only subject and admins see face recognition
CREATE POLICY "Subject owns face data" ON media_person_recognition
  FOR SELECT TO authenticated
  USING (
    recognized_person_id = auth.uid()
    OR media_id IN (
      SELECT id FROM media_assets WHERE created_by = auth.uid()
    )
  );
```

---

### Phase 3: INFRASTRUCTURE TABLES (WEEK 1)

```sql
-- Service-role-only tables (logs, cache, processing)
ALTER TABLE ai_processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE empathy_sync_log ENABLE ROW LEVEL SECURITY;

-- Super admins + service role only
CREATE POLICY "Service role only" ON ai_processing_logs
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Super admins can view logs" ON ai_processing_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM super_admin_permissions
      WHERE profile_id = auth.uid() AND is_active = true
    )
  );

-- Repeat for all infrastructure tables...
```

---

### Phase 4: ARCHIVE/CLEANUP (WEEK 2)

#### Archive Old Event Tables

```sql
-- Move to archive schema
CREATE SCHEMA IF NOT EXISTS archive;
ALTER TABLE events_2024_01 SET SCHEMA archive;
ALTER TABLE events_2025_08 SET SCHEMA archive;
ALTER TABLE events_2025_09 SET SCHEMA archive;

-- Archive migration backup
ALTER TABLE _migration_backup_phase1 SET SCHEMA archive;
```

#### Unused Association Tables

Decision needed: Are these actually unused or just not queried in current code?

```sql
-- Potentially archive these (VERIFY FIRST)
ALTER TABLE theme_associations SET SCHEMA archive; -- 0 rows, replaced by story_themes?
ALTER TABLE themes SET SCHEMA archive; -- 0 rows, replaced by narrative_themes?
ALTER TABLE gallery_media_associations SET SCHEMA archive; -- 0 rows, replaced by gallery_media?
```

---

## 🔍 Verification Plan

### Step 1: Deploy Critical Fixes

```bash
# Deploy Phase 1 fixes
npx supabase db push --file supabase/migrations/20260112000100_fix_organization_members_rls.sql
npx supabase db push --file supabase/migrations/20260112000101_fix_organization_invitations_rls.sql
npx supabase db push --file supabase/migrations/20260112000102_fix_extracted_quotes_rls.sql
```

### Step 2: Test RLS Policies

```typescript
// Test script: scripts/test-rls-security.ts

// Test as storyteller
const { data: ownQuotes } = await supabase
  .from('extracted_quotes')
  .select('*')
  .eq('author_id', storytellerId);
// Should see own quotes

// Test as org member
const { data: orgMembers } = await supabase
  .from('organization_members')
  .select('*');
// Should see members in user's orgs only

// Test as non-member
const { data: otherOrgMembers } = await supabase
  .from('organization_members')
  .select('*')
  .eq('organization_id', otherOrgId);
// Should see 0 rows (not in that org)
```

### Step 3: RLS Coverage Report

```sql
-- Generate final RLS report
SELECT
  COUNT(*) FILTER (WHERE rowsecurity = true AND policy_count > 0) as secured_tables,
  COUNT(*) FILTER (WHERE rowsecurity = true AND policy_count = 0) as blocked_tables,
  COUNT(*) FILTER (WHERE rowsecurity = false) as exposed_tables,
  COUNT(*) as total_tables
FROM (
  SELECT
    t.tablename,
    t.rowsecurity,
    COUNT(p.policyname) as policy_count
  FROM pg_tables t
  LEFT JOIN pg_policies p ON p.tablename = t.tablename
  WHERE t.schemaname = 'public'
  GROUP BY t.tablename, t.rowsecurity
) stats;

-- Goal: 100% secured (207/207 tables with RLS + policies)
```

---

## 📋 Implementation Checklist

### Phase 1: Critical Blockers (DO NOW - 1 day)
- [ ] Fix organization_members RLS (4 policies)
- [ ] Fix organization_invitations RLS (4 policies)
- [ ] Fix extracted_quotes RLS (3 policies)
- [ ] Deploy to production
- [ ] Verify organization features work
- [ ] Test quote access controls

### Phase 2: High-Risk Tables (Week 1 - 3 days)
- [ ] Profile associations (4 tables, ~3 policies each)
- [ ] Project associations (5 tables, ~2 policies each)
- [ ] Storyteller associations (3 tables, ~2 policies each)
- [ ] Geographic/PII tables (2 tables, ~2 policies each)
- [ ] Deploy batch 1
- [ ] Test with real users

### Phase 3: Infrastructure (Week 1 - 2 days)
- [ ] Service-role-only tables (5 tables, ~2 policies each)
- [ ] Logging/processing tables
- [ ] Cache tables
- [ ] Deploy batch 2

### Phase 4: Archive & Cleanup (Week 2 - 1 day)
- [ ] Archive old event tables (3 tables)
- [ ] Archive migration backups
- [ ] Review unused tables
- [ ] Document archival decisions

### Phase 5: Final Verification (Week 2 - 1 day)
- [ ] Generate final RLS coverage report
- [ ] Test all user roles (storyteller, admin, elder, super_admin)
- [ ] Security audit by stakeholder
- [ ] Document all RLS policies
- [ ] Update security documentation

---

## 🎯 Success Criteria

**Production Ready When:**
- ✅ 100% RLS coverage (207/207 tables with policies)
- ✅ 0 tables with RLS enabled but 0 policies
- ✅ All high-risk tables (PII, quotes, associations) secured
- ✅ Multi-tenant isolation verified
- ✅ Organization features working with RLS
- ✅ Test suite passes for all user roles
- ✅ Security documentation complete

**Current Status:**
- ❌ 71% secured (147/207)
- ❌ 5 blocked tables (RLS but no policies)
- ❌ 27% exposed (55/207)
- ❌ Organization members BLOCKED (breaking feature)
- ❌ Quotes completely exposed (privacy violation)

---

## ⏱️ Timeline

| Phase | Duration | Completion Date |
|-------|----------|-----------------|
| Phase 1: Critical | 1 day | Jan 12, 2026 |
| Phase 2: High-Risk | 3 days | Jan 15, 2026 |
| Phase 3: Infrastructure | 2 days | Jan 17, 2026 |
| Phase 4: Archive | 1 day | Jan 18, 2026 |
| Phase 5: Verification | 1 day | Jan 19, 2026 |
| **TOTAL** | **8 days** | **Jan 19, 2026** |

**After Jan 19**: Database is production-ready and secure for building unified analysis system.

---

## 📞 Next Step

**IMMEDIATE ACTION REQUIRED:**

1. Review this audit report
2. Approve Phase 1 critical fixes
3. I'll create and deploy the 3 blocking migrations
4. We'll test organization features
5. Then continue with Phase 2-5

**Ready to start Phase 1 (critical blockers)?**
