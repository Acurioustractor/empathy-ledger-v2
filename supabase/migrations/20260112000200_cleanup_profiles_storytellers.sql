-- Migration: Clean up profiles vs storytellers duplication (Option C)
-- Date: 2026-01-12
-- Purpose: Define clear boundaries between profiles (private) and storytellers (public)
-- Decision: Keep both tables, remove duplication, enforce separation of concerns

-- ============================================================================
-- PART 1: REMOVE DUPLICATE COLUMNS FROM STORYTELLERS
-- ============================================================================

-- 1. Remove duplicate email from storytellers (use profiles.email via FK)
-- Check if column exists first
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'storytellers' AND column_name = 'email'
    ) THEN
        ALTER TABLE storytellers DROP COLUMN email;
    END IF;
END $$;

COMMENT ON TABLE storytellers IS
  'Public storytelling profile. Use profiles table for auth, consent, privacy, and personal data.';

-- 2. Remove duplicate consent from storytellers (use profiles.consent_given and consent system)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'storytellers' AND column_name = 'consent_to_share'
    ) THEN
        ALTER TABLE storytellers DROP COLUMN consent_to_share;
    END IF;
END $$;

-- 3. Clarify avatar URLs (public vs private)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'storytellers' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE storytellers RENAME COLUMN avatar_url TO public_avatar_url;
    END IF;
END $$;

COMMENT ON COLUMN storytellers.public_avatar_url IS
  'Public-facing avatar URL (vs profiles.profile_image_url for private/internal use)';

-- Note: Keeping bio in BOTH tables for now:
-- - profiles.bio = private personal statement
-- - storytellers.bio = public storytelling bio
-- This is intentional for privacy control

-- ============================================================================
-- PART 2: FIX FOREIGN KEY ISSUES
-- ============================================================================

-- 4. Fix storyteller_organizations FK (should point to storytellers, not profiles)
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'storyteller_organizations') THEN
        -- Drop old constraint if exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'storyteller_organizations_storyteller_id_fkey'
              AND table_name = 'storyteller_organizations'
        ) THEN
            ALTER TABLE storyteller_organizations
              DROP CONSTRAINT storyteller_organizations_storyteller_id_fkey;
        END IF;

        -- Add correct constraint
        ALTER TABLE storyteller_organizations
          ADD CONSTRAINT storyteller_organizations_storyteller_id_fkey
          FOREIGN KEY (storyteller_id) REFERENCES storytellers(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Fix storyteller_projects FK (should point to storytellers, not profiles)
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'storyteller_projects') THEN
        -- Drop old constraint if exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'storyteller_projects_storyteller_id_fkey'
              AND table_name = 'storyteller_projects'
        ) THEN
            ALTER TABLE storyteller_projects
              DROP CONSTRAINT storyteller_projects_storyteller_id_fkey;
        END IF;

        -- Add correct constraint
        ALTER TABLE storyteller_projects
          ADD CONSTRAINT storyteller_projects_storyteller_id_fkey
          FOREIGN KEY (storyteller_id) REFERENCES storytellers(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- PART 3: ENSURE DATA INTEGRITY
-- ============================================================================

-- 6. Ensure profile_id is NOT NULL (already should be, but enforce)
ALTER TABLE storytellers ALTER COLUMN profile_id SET NOT NULL;

-- 7. Create function to enforce storyteller-profile consistency
CREATE OR REPLACE FUNCTION enforce_storyteller_profile_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure storyteller has valid profile
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.profile_id) THEN
    RAISE EXCEPTION 'Storyteller must have a valid profile';
  END IF;

  -- Ensure profile_id doesn't change (should be immutable)
  IF TG_OP = 'UPDATE' AND OLD.profile_id IS DISTINCT FROM NEW.profile_id THEN
    RAISE EXCEPTION 'Cannot change storyteller profile_id (immutable)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger on storytellers
DROP TRIGGER IF EXISTS ensure_profile_exists ON storytellers;
CREATE TRIGGER ensure_profile_exists
  BEFORE INSERT OR UPDATE ON storytellers
  FOR EACH ROW
  EXECUTE FUNCTION enforce_storyteller_profile_consistency();

-- ============================================================================
-- PART 4: CREATE HELPFUL VIEW FOR COMBINED DATA
-- ============================================================================

-- 9. Create view for full storyteller profile (public + private data combined)
CREATE OR REPLACE VIEW storyteller_full_profile AS
SELECT
  -- Storyteller data (public)
  s.id as storyteller_id,
  s.profile_id,
  s.display_name as public_display_name,
  s.bio as public_bio,
  s.cultural_background as public_cultural_background,
  s.language_skills,
  s.preferred_contact_method,
  s.storytelling_experience,
  s.areas_of_expertise,
  s.is_active,
  s.is_featured,
  s.is_elder,
  s.is_justicehub_featured,
  s.location as public_location,
  s.justicehub_enabled,
  s.author_role,
  s.can_review_content,
  s.public_avatar_url,
  s.created_at as storyteller_created_at,
  s.updated_at as storyteller_updated_at,

  -- Profile data (private/auth)
  p.tenant_id,
  p.full_name,
  p.email,
  p.bio as private_bio,
  p.profile_image_url as private_avatar_url,
  p.cultural_background as private_cultural_background,
  p.preferred_pronouns,
  p.phone_number,
  p.date_of_birth,
  p.age_range,

  -- Consent & Privacy (from profiles only)
  p.consent_given,
  p.consent_date,
  p.consent_version,
  p.privacy_preferences,
  p.story_visibility_level,
  p.quote_sharing_consent,
  p.impact_story_promotion,
  p.wisdom_sharing_level,
  p.narrative_ownership_level,
  p.attribution_preferences,
  p.story_use_permissions,
  p.platform_benefit_sharing,
  p.ai_processing_consent,
  p.ai_consent_date,
  p.ai_consent_scope,

  -- Collaboration (from profiles only)
  p.open_to_mentoring,
  p.available_for_collaboration,
  p.seeking_organizational_connections,
  p.interested_in_peer_support,

  -- Professional (from profiles only)
  p.current_role,
  p.current_organization,
  p.years_of_experience,
  p.professional_summary,
  p.industry_sectors,

  -- Other
  p.generated_themes,
  p.profile_visibility,
  p.cross_tenant_sharing,
  p.geographic_connections,
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at

FROM storytellers s
INNER JOIN profiles p ON p.id = s.profile_id;

COMMENT ON VIEW storyteller_full_profile IS
  'Complete storyteller profile combining public data (storytellers table) and private data (profiles table).
   Use this view for full context, but respect privacy_preferences when displaying data.';

-- ============================================================================
-- PART 5: ADD DOCUMENTATION COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS
  'User identity and authentication. Owns: auth, consent, privacy, personal data, collaboration preferences.
   Links to auth.users. Not all profiles are storytellers (admins, staff).';

COMMENT ON TABLE storytellers IS
  'Public storytelling profile. Owns: public bio, cultural sharing, storytelling features, platform status.
   Every storyteller has a profile (FK to profiles.id). Use storyteller_full_profile view for combined data.';

-- Add column comments for clarity
COMMENT ON COLUMN storytellers.profile_id IS
  'FK to profiles.id (REQUIRED). Every storyteller must have a profile for auth/consent/privacy.';

COMMENT ON COLUMN storytellers.bio IS
  'Public storytelling bio (vs profiles.bio for private personal statement)';

COMMENT ON COLUMN storytellers.cultural_background IS
  'Public cultural background for storytelling (array). Profiles.cultural_background is private text field.';

COMMENT ON COLUMN profiles.bio IS
  'Private personal statement (vs storytellers.bio for public storytelling bio)';

COMMENT ON COLUMN profiles.profile_image_url IS
  'Private/internal avatar (vs storytellers.public_avatar_url for public display)';

-- ============================================================================
-- SUMMARY OF CHANGES
-- ============================================================================

-- REMOVED from storytellers:
--   - email (use profiles.email)
--   - consent_to_share (use profiles.consent_given)

-- RENAMED in storytellers:
--   - avatar_url → public_avatar_url (clarify vs profiles.profile_image_url)

-- FIXED:
--   - storyteller_organizations FK now points to storytellers (not profiles)
--   - storyteller_projects FK now points to storytellers (not profiles)

-- ADDED:
--   - storyteller_full_profile view (combines public + private data)
--   - enforce_storyteller_profile_consistency() function + trigger
--   - Documentation comments on all tables/columns

-- CLEAR BOUNDARIES:
--   profiles  = Private identity (auth, consent, privacy, personal)
--   storytellers = Public identity (display, cultural, platform features)
