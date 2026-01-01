-- Sync Transcript Consent from Profiles
-- Created: 2026-01-01
-- Issue: https://github.com/Acurioustractor/empathy-ledger-v2/issues/130
--
-- Problem: Profiles have ai_processing_consent, but transcripts don't inherit it.
-- Solution: Sync consent from profiles to their transcripts.

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    profile_count INTEGER;
    transcript_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO transcript_count FROM transcripts;

    RAISE NOTICE '======================================';
    RAISE NOTICE 'SYNC TRANSCRIPT CONSENT';
    RAISE NOTICE '======================================';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'Profiles: % (expected: 251)', profile_count;
    RAISE NOTICE 'Transcripts: % (expected: 251)', transcript_count;
    RAISE NOTICE '======================================';

    IF profile_count < 200 THEN
        RAISE EXCEPTION 'DANGER: Only % profiles found. Expected 251. Wrong database!', profile_count;
    END IF;
END $$;

-- ============================================================================
-- SYNC CONSENT FROM PROFILES TO TRANSCRIPTS
-- ============================================================================

-- Update all transcripts to match their storyteller's consent preference
UPDATE transcripts t
SET
    ai_processing_consent = p.ai_processing_consent,
    updated_at = CASE
        WHEN t.ai_processing_consent IS DISTINCT FROM p.ai_processing_consent
        THEN NOW()
        ELSE t.updated_at
    END
FROM profiles p
WHERE t.storyteller_id = p.id
  AND t.ai_processing_consent IS DISTINCT FROM p.ai_processing_consent;

-- ============================================================================
-- CREATE TRIGGER TO KEEP IN SYNC
-- ============================================================================

-- Function to sync consent when profile changes
CREATE OR REPLACE FUNCTION sync_transcript_consent_from_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Only sync if ai_processing_consent changed
    IF (OLD.ai_processing_consent IS DISTINCT FROM NEW.ai_processing_consent) THEN
        UPDATE transcripts
        SET
            ai_processing_consent = NEW.ai_processing_consent,
            updated_at = NOW()
        WHERE storyteller_id = NEW.id;

        RAISE NOTICE 'Synced consent (%) to % transcripts for storyteller %',
            NEW.ai_processing_consent,
            (SELECT COUNT(*) FROM transcripts WHERE storyteller_id = NEW.id),
            NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on profile updates
DROP TRIGGER IF EXISTS sync_transcript_consent ON profiles;
CREATE TRIGGER sync_transcript_consent
    AFTER UPDATE ON profiles
    FOR EACH ROW
    WHEN (OLD.ai_processing_consent IS DISTINCT FROM NEW.ai_processing_consent)
    EXECUTE FUNCTION sync_transcript_consent_from_profile();

-- ============================================================================
-- VERIFICATION AFTER SYNC
-- ============================================================================

DO $$
DECLARE
    synced_count INTEGER;
    total_with_consent INTEGER;
BEGIN
    SELECT COUNT(*) INTO synced_count
    FROM transcripts t
    JOIN profiles p ON t.storyteller_id = p.id
    WHERE t.ai_processing_consent = p.ai_processing_consent;

    SELECT COUNT(*) INTO total_with_consent
    FROM transcripts
    WHERE ai_processing_consent = true;

    RAISE NOTICE '======================================';
    RAISE NOTICE 'SYNC COMPLETE';
    RAISE NOTICE '======================================';
    RAISE NOTICE 'Transcripts synced with profile consent: %', synced_count;
    RAISE NOTICE 'Transcripts WITH consent: %', total_with_consent;
    RAISE NOTICE 'Trigger created: sync_transcript_consent';
    RAISE NOTICE '======================================';
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON FUNCTION sync_transcript_consent_from_profile() IS
'Automatically syncs ai_processing_consent from profiles to their transcripts when changed.';
