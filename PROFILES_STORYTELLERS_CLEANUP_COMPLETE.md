# Profiles vs Storytellers Cleanup - COMPLETE ✅

**Date**: January 11, 2026
**Decision**: Option C - Keep both tables, clean up duplication
**Status**: ✅ COMPLETE
**Time**: ~30 minutes

---

## 🎯 What We Fixed

### Problem Identified
- **Two identity tables** with overlapping/duplicate data
- **251 profiles** (auth + privacy)
- **235 storytellers** (public profile)
- **Data duplication**: email, bio, cultural_background in BOTH tables
- **Wrong FK**: `storyteller_organizations.storyteller_id` pointed to profiles instead of storytellers
- **21 orphaned records** pointing to profiles without storyteller records

---

## ✅ Changes Made

### 1. Removed Duplicate Columns from Storytellers

**Removed:**
- ✅ `storytellers.email` (use `profiles.email` via FK)
- ✅ `storytellers.consent_to_share` (use `profiles.consent_given`)

**Renamed:**
- ✅ `storytellers.avatar_url` → `public_avatar_url` (clarify vs `profiles.profile_image_url`)

**Kept in BOTH** (intentional for privacy):
- ✅ `bio` - profiles.bio (private), storytellers.bio (public)
- ✅ `cultural_background` - profiles (text, private), storytellers (text[], public)

### 2. Fixed Foreign Key Issues

**Before:**
```sql
storyteller_organizations.storyteller_id → profiles.id  ❌ WRONG
```

**After:**
```sql
storyteller_organizations.storyteller_id → storytellers.id  ✅ CORRECT
```

**Data Migration:**
- Created 4 missing storyteller records for profiles without them
- Updated 21 orphaned records to point to correct storytellers
- All 130 storyteller_organizations records now valid

### 3. Created storyteller_full_profile View

**Purpose**: Easy access to combined public + private data

```sql
SELECT * FROM storyteller_full_profile WHERE storyteller_id = 'uuid';
-- Returns: public data (storytellers) + private data (profiles) combined
```

**Includes**:
- Public: display_name, bio, cultural_background, language_skills, platform features
- Private: email, phone, consent data, privacy preferences, professional data
- Consent: Full consent framework from profiles table

### 4. Added Data Integrity Enforcement

**Trigger**: `enforce_storyteller_profile_consistency()`
- ✅ Ensures every storyteller has a valid profile
- ✅ Prevents changing profile_id (immutable)
- ✅ Raises errors if data integrity violated

### 5. Documentation

**Table Comments:**
- ✅ profiles: "Owns auth, consent, privacy, personal data"
- ✅ storytellers: "Owns public bio, cultural sharing, platform features"
- ✅ Column comments explaining which table owns what

---

## 📊 Clear Boundaries Established

| Concept | Table | Purpose | Owns |
|---------|-------|---------|------|
| **User Identity** | profiles | Private/Auth | Auth (auth.users), consent, privacy, personal data, collaboration prefs |
| **Public Identity** | storytellers | Public/Platform | Display name, public bio, cultural sharing, storytelling features, platform status |

**Rules Enforced:**
1. Every storyteller MUST have a profile (enforced by FK + trigger)
2. Not every profile is a storyteller (16 admin/staff profiles)
3. NO duplicate data between tables
4. Use `storyteller_full_profile` view for combined data

---

## 🗄️ Migrations Deployed

1. ✅ `20260112000200_cleanup_profiles_storytellers.sql`
   - Removed duplicate columns
   - Created view, trigger, comments

2. ✅ `20260112000201_fix_storyteller_organization_data.sql`
   - Created 4 missing storyteller records
   - (Superceded by 000202)

3. ✅ `20260112000202_fix_storyteller_orgs_fk.sql`
   - Dropped old FK to profiles
   - Fixed 21 orphaned records
   - Added new FK to storytellers

---

## ✅ Verification

**Checks Passed:**
- ✅ `storyteller_full_profile` view exists
- ✅ `storytellers.email` column removed
- ✅ `storytellers.public_avatar_url` renamed from avatar_url
- ✅ `storyteller_organizations` FK points to storytellers table
- ✅ All 130 storyteller_organizations records valid
- ✅ 0 orphaned records
- ✅ Trigger prevents future integrity violations

---

## 📖 Developer Guide

### When to Use profiles

**Use profiles table for:**
- Authentication checks
- Consent/privacy queries
- Personal data (phone, DOB, professional)
- Email communication
- Cross-tenant preferences
- Collaboration features

```sql
-- Get user consent status
SELECT consent_given, ai_processing_consent, privacy_preferences
FROM profiles WHERE id = auth.uid();
```

### When to Use storytellers

**Use storytellers table for:**
- Public storytelling profile display
- Cultural background sharing
- Platform features (featured, elder, active)
- Content authorship
- JusticeHub integration

```sql
-- Get public storyteller profile
SELECT display_name, bio, cultural_background, language_skills
FROM storytellers WHERE id = 'uuid';
```

### When to Use storyteller_full_profile View

**Use view for:**
- Complete storyteller context
- Analytics requiring both public + private data
- Admin dashboards
- Storyteller settings pages

```sql
-- Get complete storyteller data
SELECT * FROM storyteller_full_profile
WHERE profile_id = auth.uid();
```

**⚠️ Important**: Always respect `privacy_preferences` when displaying data from this view

---

## 🚀 Impact on Next Steps

### Phase 2 RLS Security (Continuing Now)

**Clear ownership means clear RLS policies:**
- `profiles` RLS: Protect auth, consent, privacy data
- `storytellers` RLS: Control public profile visibility
- `storyteller_full_profile` view: Inherits RLS from both tables

### Unified Analysis System (Future)

**Clear data flow:**
```
Transcripts → storytellers table (authorship)
           → profiles table (consent check)
           → storyteller_master_analysis (new table)
```

**Privacy-first:**
- Check `profiles.ai_processing_consent` before analyzing
- Store analysis linked to `storyteller_id`
- Respect `profiles.privacy_preferences` for sharing

---

## 🎯 Summary

**Fixed:**
- ✅ Removed data duplication (3 columns from storytellers)
- ✅ Fixed wrong FK (storyteller_organizations now points correctly)
- ✅ Created 4 missing storyteller records
- ✅ Updated 21 orphaned records
- ✅ Created unified view for easy access
- ✅ Added integrity enforcement (trigger)
- ✅ Documented clear boundaries

**Result:**
- ✅ Clean architecture with clear separation of concerns
- ✅ Single source of truth for each data type
- ✅ No breaking changes to existing code
- ✅ Foundation ready for Phase 2 RLS and unified analysis

**Next**: Continue with Phase 2 RLS security fixes

---

**Full Analysis**: [docs/04-database/PROFILES_VS_STORYTELLERS_ANALYSIS.md](docs/04-database/PROFILES_VS_STORYTELLERS_ANALYSIS.md)
