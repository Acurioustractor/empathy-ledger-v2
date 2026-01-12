# Profiles vs Storytellers: Critical Architecture Decision

**Date**: January 11, 2026
**Issue**: Dual identity system causing confusion and complexity
**Decision Required**: Keep both, merge, or clarify distinct purposes

---

## 🔍 Current State Analysis

### Data Inventory

| Table | Records | Relationship |
|-------|---------|--------------|
| **profiles** | 251 | Base identity (auth.users) |
| **storytellers** | 235 | Extended storyteller identity |
| **Overlap** | 235 | Storytellers have profiles (FK) |
| **Profiles without storyteller** | 16 | Non-storyteller users (admins, staff, etc.) |
| **Legacy links** | 210 | profiles.legacy_storyteller_id populated |

### Key Finding:
- **storytellers.profile_id** → **profiles.id** (UNIQUE, NOT NULL)
- Every storyteller MUST have a profile
- Not every profile is a storyteller (16 profiles are not)

---

## 📊 Schema Comparison

### profiles Table (47 columns)
**Purpose**: Universal user identity + authentication

**Core Identity:**
- id (uuid) - Auth user ID
- tenant_id - Multi-tenant isolation
- full_name, email, bio
- profile_image_url

**Storyteller-Specific (duplicated in storytellers):**
- cultural_background
- display_name
- bio
- preferred_pronouns

**Privacy & Consent (UNIQUE to profiles):**
- consent_given, consent_date, consent_version
- privacy_preferences (jsonb)
- story_visibility_level
- quote_sharing_consent
- ai_processing_consent, ai_consent_date, ai_consent_scope
- narrative_ownership_level
- attribution_preferences (jsonb)
- story_use_permissions (jsonb)
- platform_benefit_sharing (jsonb)

**Collaboration (UNIQUE to profiles):**
- open_to_mentoring
- available_for_collaboration
- seeking_organizational_connections
- interested_in_peer_support

**Professional (UNIQUE to profiles):**
- phone_number, date_of_birth, age_range
- current_role, current_organization
- years_of_experience
- professional_summary
- industry_sectors

**Legacy:**
- legacy_storyteller_id (210 populated)
- airtable_record_id

---

### storytellers Table (22 columns)
**Purpose**: Public storytelling profile

**Core Identity (duplicates profiles):**
- display_name (also in profiles)
- bio (also in profiles)
- cultural_background (also in profiles as text, here as text[])
- email (also in profiles)
- location

**Storytelling-Specific (UNIQUE):**
- language_skills (text[])
- storytelling_experience
- areas_of_expertise (text[])
- preferred_contact_method

**Platform Features:**
- is_active, is_featured, is_elder
- is_justicehub_featured, justicehub_enabled
- author_role ('admin', 'act_team', 'community_storyteller', 'external_contributor')
- can_review_content

**Legacy:**
- consent_to_share (redundant with profiles consent system)
- avatar_url (vs profiles.profile_image_url)

---

## 🔗 Foreign Key Usage

### Tables Referencing PROFILES (20+ tables)

**Core Content:**
- stories (author_id, elder_approved_by, elder_reviewer_id, reviewed_by)
- quotes (author_id)
- transcripts (elder_reviewed_by)
- media_assets (uploader_id, consent_granted_by)

**Organization/Project:**
- organizations (created_by)
- projects (created_by)
- storyteller_organizations (storyteller_id → profiles.id ❗)
- storyteller_projects (storyteller_id → profiles.id ❗)

**Activity/Privacy:**
- events (user_id)
- privacy_changes (user_id)
- cultural_protocols (created_by, approved_by)

### Tables Referencing STORYTELLERS (17 tables)

**Core Content:**
- stories (storyteller_id)
- transcripts (storyteller_id)
- articles (author_storyteller_id, elder_reviewer_id, last_reviewed_by)

**Media/AI:**
- media_ai_analysis (storyteller_id, cultural_reviewer_id, consent_granted_by)
- media_person_recognition (linked_storyteller_id, uploader_consent_by)
- media_narrative_themes (verified_by)
- media_storytellers (storyteller_id)
- video_link_storytellers (storyteller_id)

**Syndication:**
- content_syndication (consent_granted_by, revoked_by, syndication_request_by)

**Reviews:**
- article_reviews (reviewer_id)

---

## ⚠️ Problems with Current Dual System

### 1. **Data Duplication**
Fields exist in BOTH tables:
- display_name
- bio
- cultural_background (text vs text[])
- email

**Risk**: Data drift, inconsistency, confusion about source of truth

### 2. **Inconsistent Foreign Keys**
Some tables use `profile_id`, others use `storyteller_id`:
- `stories` has BOTH storyteller_id AND author_id (profile)
- `transcripts` has BOTH storyteller_id AND elder_reviewed_by (profile)
- `storyteller_organizations` uses storyteller_id but points to profiles table ❗

**Risk**: Query complexity, join inconsistency, developer confusion

### 3. **Unclear Ownership**
Who owns what data?
- Consent: profiles table
- Cultural data: profiles? storytellers? both?
- Display settings: profiles? storytellers? both?

### 4. **Migration Complexity**
- 210 profiles have legacy_storyteller_id
- What was the migration path?
- Are we mid-migration?

---

## 🎯 Three Strategic Options

### Option A: **Merge into PROFILES** (Simplify)

**Approach**: Eliminate storytellers table, move unique columns to profiles

**Pros:**
- ✅ Single source of truth
- ✅ All user data in one place
- ✅ Simpler RLS policies
- ✅ Clearer ownership model
- ✅ Easier to understand

**Cons:**
- ❌ Profiles table even larger (69 columns)
- ❌ Big migration effort (17 tables reference storytellers)
- ❌ Lose separation of concerns (not all profiles are public storytellers)
- ❌ Breaking change for existing code

**Migration Plan:**
1. Add storyteller columns to profiles (language_skills, storytelling_experience, etc.)
2. Migrate data from storytellers → profiles
3. Update 17 FK references from storytellers → profiles
4. Update application code
5. Drop storytellers table

**Effort**: HIGH (2-3 weeks)

---

### Option B: **Merge into STORYTELLERS** (Content-First)

**Approach**: Make storytellers the primary identity, profiles become auth-only

**Pros:**
- ✅ Content-focused architecture (platform is for storytellers)
- ✅ Cleaner separation: auth vs public identity
- ✅ storytellers table is more focused (22 cols vs 47)

**Cons:**
- ❌ Lose rich consent/privacy framework in profiles
- ❌ Have to duplicate auth-related fields
- ❌ Non-storyteller users (admins, staff) awkward
- ❌ 20+ tables reference profiles
- ❌ Bigger migration than Option A

**Migration Plan:**
1. Move consent/privacy/professional data to storytellers
2. Update 20+ FK references from profiles → storytellers
3. Keep profiles minimal (id, email, auth fields only)
4. Create storytellers for non-storyteller users (awkward)

**Effort**: VERY HIGH (3-4 weeks)

---

### Option C: **Keep Both, Clarify Purpose** (Current State, Improved)

**Approach**: Maintain dual system but define clear boundaries

**Pros:**
- ✅ No migration needed
- ✅ Can fix immediately
- ✅ Separation of concerns preserved
- ✅ Non-storyteller users (admins) handled naturally

**Cons:**
- ❌ Complexity remains
- ❌ Need strict rules to prevent drift
- ❌ Developers must understand two models

**Clear Definition:**

| Concept | Table | Purpose | Visibility |
|---------|-------|---------|------------|
| **User** | profiles | Authentication, consent, privacy, personal data | Private |
| **Storyteller** | storytellers | Public storytelling identity, platform features | Public/Semi-public |

**Rules:**
1. **profiles** = "Who you are to the system" (auth, consent, privacy)
2. **storytellers** = "Who you are to the community" (public profile, storytelling)
3. **profiles** owns: consent, privacy, personal data, collaboration preferences
4. **storytellers** owns: public bio, cultural sharing, storytelling features, platform status
5. **Data in BOTH** → MOVE to appropriate table (no duplication)

**What to Move:**
- `storytellers.bio` → DELETE (use profiles.bio)
- `storytellers.email` → DELETE (use profiles.email via FK)
- `profiles.cultural_background` → DELETE (use storytellers.cultural_background)
- `profiles.display_name` → Keep (used for auth/private), storytellers.display_name for public
- `storytellers.consent_to_share` → DELETE (use profiles consent system)
- `storytellers.avatar_url` → RENAME to public_avatar_url, profiles.profile_image_url for private

**Effort**: LOW (1-2 days to clean up, document, enforce)

---

## 💡 Recommendation: Option C with Cleanup

### Why Option C?

1. **Least Disruption**: No major migration, can fix incrementally
2. **Natural Fit**: Platform DOES have two concepts (user vs public storyteller)
3. **Handles Edge Cases**: Admins, staff, non-storyteller users naturally in profiles
4. **Privacy Architecture**: profiles consent system is sophisticated and complete
5. **Quick to Fix**: Can clean up duplication in 1-2 days

### Implementation Plan

**Phase 1: Define Clear Boundaries (1 day)**

Create schema migration to:
1. Remove duplicate columns from storytellers (bio, email, consent_to_share)
2. Add missing index: storytellers(profile_id) UNIQUE
3. Document which table owns what data
4. Add CHECK constraints to enforce rules

**Phase 2: Update Application Code (1 day)**

Update queries to:
1. Always join profiles ← storytellers for full user data
2. Use profiles for consent/privacy checks
3. Use storytellers for public display
4. Fix storyteller_organizations, storyteller_projects FK confusion

**Phase 3: Enforce at Database Level (ongoing)**

```sql
-- Function to ensure data consistency
CREATE OR REPLACE FUNCTION enforce_storyteller_profile_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure storyteller has valid profile
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.profile_id) THEN
    RAISE EXCEPTION 'Storyteller must have valid profile';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on storytellers
CREATE TRIGGER ensure_profile_exists
  BEFORE INSERT OR UPDATE ON storytellers
  FOR EACH ROW
  EXECUTE FUNCTION enforce_storyteller_profile_consistency();
```

---

## 📋 Option C: Detailed Cleanup Migration

```sql
-- Migration: Clean up profiles vs storytellers duplication
-- Date: 2026-01-12

-- 1. Remove duplicate email from storytellers (use profiles.email via FK)
ALTER TABLE storytellers DROP COLUMN IF EXISTS email;

-- 2. Remove duplicate bio from storytellers (use profiles.bio for private, keep storytellers.bio for public)
-- DECISION NEEDED: Keep bio in both for public vs private distinction?

-- 3. Remove duplicate consent from storytellers (use profiles consent system)
ALTER TABLE storytellers DROP COLUMN IF EXISTS consent_to_share;

-- 4. Clarify avatar URLs
ALTER TABLE storytellers RENAME COLUMN avatar_url TO public_avatar_url;
COMMENT ON COLUMN storytellers.public_avatar_url IS 'Public-facing avatar (vs profiles.profile_image_url for private)';

-- 5. Ensure profile_id is unique and not null
ALTER TABLE storytellers ALTER COLUMN profile_id SET NOT NULL;
-- Already has unique constraint

-- 6. Fix storyteller_organizations FK
ALTER TABLE storyteller_organizations
  DROP CONSTRAINT IF EXISTS storyteller_organizations_storyteller_id_fkey;
ALTER TABLE storyteller_organizations
  ADD CONSTRAINT storyteller_organizations_storyteller_id_fkey
  FOREIGN KEY (storyteller_id) REFERENCES storytellers(id) ON DELETE CASCADE;

-- 7. Fix storyteller_projects FK
ALTER TABLE storyteller_projects
  DROP CONSTRAINT IF EXISTS storyteller_projects_storyteller_id_fkey;
ALTER TABLE storyteller_projects
  ADD CONSTRAINT storyteller_projects_storyteller_id_fkey
  FOREIGN KEY (storyteller_id) REFERENCES storytellers(id) ON DELETE CASCADE;

-- 8. Add helpful view for full storyteller data
CREATE OR REPLACE VIEW storyteller_full_profile AS
SELECT
  s.*,
  p.full_name,
  p.email,
  p.bio as private_bio,
  p.profile_image_url as private_avatar,
  p.consent_given,
  p.consent_date,
  p.ai_processing_consent,
  p.privacy_preferences,
  p.story_visibility_level,
  p.narrative_ownership_level
FROM storytellers s
JOIN profiles p ON p.id = s.profile_id;

COMMENT ON VIEW storyteller_full_profile IS
  'Complete storyteller profile combining public (storytellers) and private (profiles) data';
```

---

## 🎯 Final Recommendation

**CHOOSE OPTION C: Keep both, clean up duplication, enforce clear boundaries**

### Immediate Actions:
1. ✅ Document clear definition (this document)
2. ✅ Remove duplicate columns (bio, email, consent)
3. ✅ Fix FK issues (storyteller_organizations, storyteller_projects)
4. ✅ Create storyteller_full_profile view
5. ✅ Update RLS policies to respect both tables
6. ✅ Add to developer documentation

### Rules Going Forward:

**Use PROFILES for:**
- Authentication (auth.users link)
- Consent & privacy
- Personal data (phone, DOB, professional)
- Cross-tenant sharing preferences
- Collaboration preferences

**Use STORYTELLERS for:**
- Public storytelling identity
- Cultural background & language
- Storytelling experience & expertise
- Platform features (featured, elder, active)
- Content authorship
- JusticeHub integration

**NEVER duplicate data between tables**

---

## 🤔 Decision Required

**Which option do you prefer?**

**A.** Merge everything into profiles (simplify, single source of truth)
**B.** Merge everything into storytellers (content-first)
**C.** Keep both, clean up duplication (recommended)

**Or a different approach?**

This decision affects:
- Phase 2 security (which RLS policies to create)
- Unified analysis system (which table to analyze)
- All future development

**What should we do?**
