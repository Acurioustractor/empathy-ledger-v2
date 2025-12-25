# Profiles Table Audit - Critical Findings & Recommendations

## Executive Summary

**Total Profiles**: 235
**Total Fields**: 116 fields (⚠️ Very high - indicates bloat)
**Data Quality**: Multiple critical issues found

---

## 🚨 Critical Issues Found

### 1. **IMAGE FIELD DUPLICATION** (High Priority)
**Problem**: Two separate image fields causing confusion
- `avatar_url`
- `profile_image_url`

**Impact**:
- Code inconsistency - some places use avatar_url, others use profile_image_url
- Potential for images to get out of sync
- Increased storage and complexity

**Recommendation**:
```sql
-- Standardize on profile_image_url
-- Migration script needed to:
1. Copy avatar_url → profile_image_url (where profile_image_url is null)
2. Drop avatar_url column
3. Update all code references to use profile_image_url only
```

---

### 2. **ORGANIZATION REFERENCE CONFUSION** (High Priority)
**Problem**: Three different organization reference fields
- `tenant_id`: 235 profiles (100%) ⚠️
- `primary_organization_id`: 232 profiles (99%)
- `legacy_organization_id`: Unknown usage

**Current State**:
- Both tenant_id AND primary_organization_id are populated
- Suggests incomplete migration from old multi-tenant model
- Creates confusion about which is source of truth

**Recommendation**:
```sql
-- Phase out tenant_id in favor of primary_organization_id
1. Verify all code uses primary_organization_id (not tenant_id)
2. Create migration to ensure 100% coverage on primary_organization_id
3. Drop tenant_id column after verification
4. Drop legacy_organization_id if truly unused
```

---

### 3. **MISSING EMAIL ADDRESSES** (Medium Priority)
**Problem**: 213 profiles (91%) missing email

**Analysis**:
- If email is required: Major data integrity issue
- If email is optional: Field should be nullable and code should handle nulls

**Recommendation**:
```typescript
// Decision needed:
Option A: Email is optional (storytellers don't need accounts)
  → Ensure all code handles null emails gracefully
  → Consider adding "has_account" boolean field

Option B: Email is required
  → Run data migration to populate missing emails
  → Add database constraint to prevent nulls
```

---

### 4. **MISSING LOCATIONS** (Medium Priority)
**Problem**: 194 profiles (83%) without locations

**Current Coverage**: Only 41 profiles have location data

**Recommendation**:
✅ **Solution already built**: Use `/admin/locations` tool to backfill

**Action Plan**:
1. Prioritize high-value profiles (elders, featured, with stories)
2. Extract locations from bio/personal_statement fields (AI-assisted)
3. Manual review for remaining profiles

---

### 5. **PROFILES WITHOUT ORGANIZATIONS** (Medium Priority)
**Problem**: 12 profiles (5%) not linked to any organization

**Current State**:
- `profile_organizations` table has 245 relationships
- 223 unique profiles have org links
- 12 profiles orphaned

**Recommendation**:
```sql
-- Find orphaned profiles
SELECT p.id, p.display_name, p.email
FROM profiles p
LEFT JOIN profile_organizations po ON p.id = po.profile_id
WHERE po.profile_id IS NULL;

-- Decision: Archive, assign to default org, or delete?
```

---

### 6. **LOCATION FIELD REDUNDANCY** (Low Priority)
**Problem**: Three location-related fields
- `location_data`: Unknown purpose
- `legacy_location_id`: Legacy reference
- `location_id`: Current FK to locations table

**Recommendation**:
```sql
-- Clean up if unused
1. Check if location_data has any non-null values
2. Check if legacy_location_id is still referenced
3. Drop unused fields
```

---

## 📊 Linked Tables Analysis

### profile_organizations ✅ Mostly Healthy
- **Total relationships**: 245
- **Profiles with orgs**: 223 (95%)
- **Issues**: 12 profiles without orgs

### profile_locations ⚠️ Needs Attention
- **Total relationships**: 41
- **Profiles with locations**: 41 (17%)
- **Issues**: 194 profiles (83%) missing locations
- **Action**: Use admin tool at `/admin/locations`

### project_participants ⚠️ Concerning
- **Total relationships**: 13
- **Unique profiles in projects**: 0 (0%)
- **Issue**: Data suggests nobody is assigned to projects OR query issue

**Investigation Needed**:
```sql
-- Verify project_participants data
SELECT * FROM project_participants LIMIT 10;

-- Check if profile_id column exists and is populated
-- May need to rename storyteller_id → profile_id
```

---

## 🗑️ Fields to Consider Removing/Moving

### AI/Analytics Fields (10 fields)
These 10 AI-related fields clutter the main profiles table:
- `ai_processing_consent`
- `ai_consent_date`
- `ai_consent_scope`
- `generated_themes`
- `ai_enhanced_bio`
- `ai_personality_insights`
- `ai_themes`
- `allow_ai_analysis`
- `narrative_themes`
- (and more)

**Recommendation**: Create separate `profile_analytics` table
```sql
CREATE TABLE profile_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- AI/ML fields
  ai_processing_consent BOOLEAN,
  ai_consent_date TIMESTAMP,
  generated_themes JSONB,
  ai_enhanced_bio TEXT,
  ai_personality_insights JSONB,
  narrative_themes JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Benefits**:
- Cleaner profiles table (106 fields → 96 fields)
- Better performance (smaller row size)
- Easier to manage AI features separately
- Can delete all analytics without affecting core profile

### Visibility Fields (11 fields)
Separate privacy/visibility concerns:
```sql
CREATE TABLE profile_privacy_settings (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id),
  profile_visibility TEXT,
  basic_info_visibility TEXT,
  professional_visibility TEXT,
  cultural_identity_visibility TEXT,
  stories_visibility TEXT,
  media_visibility TEXT,
  -- etc.
);
```

---

## 💡 Recommended Action Plan

### Phase 1: Critical Fixes (This Week)
1. ✅ **Standardize Image Field**
   - Audit code for avatar_url vs profile_image_url usage
   - Create migration to consolidate to profile_image_url
   - Update all code references

2. ✅ **Clarify Organization References**
   - Verify primary_organization_id is source of truth everywhere
   - Plan deprecation of tenant_id
   - Document decision in codebase

3. ✅ **Email Field Strategy**
   - Decide if email is required or optional
   - Update database constraints accordingly
   - Fix code to handle null emails if optional

### Phase 2: Data Quality (Next 2 Weeks)
4. **Backfill Missing Locations** (194 profiles)
   - Use `/admin/locations` tool
   - Prioritize: Elders → Featured → Active storytellers
   - AI-extract from bios where possible

5. **Fix Orphaned Profiles** (12 profiles)
   - Review profiles without organizations
   - Assign to appropriate org or archive

6. **Investigate project_participants**
   - Verify table structure and data
   - Fix relationship if broken

### Phase 3: Table Optimization (Next Month)
7. **Extract AI/Analytics Fields**
   - Create `profile_analytics` table
   - Migrate 10 AI fields
   - Update queries

8. **Extract Privacy Settings**
   - Create `profile_privacy_settings` table
   - Migrate 11 visibility fields
   - Cleaner separation of concerns

9. **Remove Legacy Fields**
   - Drop `legacy_location_id`
   - Drop `legacy_organization_id`
   - Drop `tenant_id` (after full migration)
   - Drop `location_data` (if unused)

---

## 📈 Expected Outcomes

### After Phase 1:
- ✅ Image references consistent across codebase
- ✅ Clear organization reference model
- ✅ Email handling clear and bug-free

### After Phase 2:
- ✅ 90%+ profiles have locations
- ✅ All profiles linked to organizations
- ✅ Clean project participation data

### After Phase 3:
- ✅ Profiles table: 116 fields → ~80 fields (30% reduction)
- ✅ Faster queries (smaller row size)
- ✅ Clearer data model
- ✅ No legacy fields

---

## 🔧 Migration Scripts Needed

### 1. Image Field Consolidation
```sql
-- Step 1: Copy avatar_url to profile_image_url where needed
UPDATE profiles
SET profile_image_url = avatar_url
WHERE profile_image_url IS NULL
  AND avatar_url IS NOT NULL;

-- Step 2: Verify no data loss
SELECT COUNT(*) FROM profiles WHERE avatar_url IS NOT NULL;
SELECT COUNT(*) FROM profiles WHERE profile_image_url IS NOT NULL;

-- Step 3: Drop avatar_url (after code update)
ALTER TABLE profiles DROP COLUMN avatar_url;
```

### 2. Organization Reference Cleanup
```sql
-- Step 1: Ensure 100% primary_organization_id coverage
UPDATE profiles
SET primary_organization_id = (
  SELECT organization_id
  FROM profile_organizations
  WHERE profile_id = profiles.id
  AND is_active = true
  LIMIT 1
)
WHERE primary_organization_id IS NULL;

-- Step 2: Verify tenant_id not used in queries
-- (Manual code audit required)

-- Step 3: Drop tenant_id
ALTER TABLE profiles DROP COLUMN tenant_id;
ALTER TABLE profiles DROP COLUMN legacy_organization_id;
```

### 3. Extract AI Fields
```sql
-- Step 1: Create new table
CREATE TABLE profile_analytics (
  -- Schema shown above
);

-- Step 2: Migrate data
INSERT INTO profile_analytics (
  profile_id, ai_processing_consent, ai_consent_date, ...
)
SELECT
  id, ai_processing_consent, ai_consent_date, ...
FROM profiles;

-- Step 3: Drop old columns
ALTER TABLE profiles
  DROP COLUMN ai_processing_consent,
  DROP COLUMN ai_consent_date,
  -- etc.
```

---

## Summary

**Current State**: 116-field profiles table with multiple redundancies and data quality issues

**Target State**: ~80-field profiles table with:
- Clean, consistent field naming
- No duplicate/legacy fields
- Separate tables for analytics and privacy settings
- 90%+ data completeness on key fields

**Risk Level**: Medium
- Changes require careful migration
- Code updates across multiple files
- Need testing before dropping columns

**Time Estimate**:
- Phase 1: 1 week
- Phase 2: 2 weeks
- Phase 3: 3-4 weeks

**Priority**: Start with Phase 1 (critical fixes) immediately