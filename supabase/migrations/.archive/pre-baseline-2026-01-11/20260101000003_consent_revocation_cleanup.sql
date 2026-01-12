-- Consent Revocation Data Cleanup Function
-- Created: 2026-01-01
-- Issue: https://github.com/Acurioustractor/empathy-ledger-v2/issues/129
--
-- When storyteller revokes AI processing consent, this function removes:
-- - AI-extracted themes from transcripts
-- - AI-extracted quotes
-- - AI-generated storyteller connections
-- - AI analysis metadata
--
-- Honors GDPR Article 7 (Right to Withdraw Consent)
-- Preserves storyteller's original transcripts (only AI-generated data removed)

-- ============================================================================
-- DELETE STORYTELLER AI DATA FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_storyteller_ai_data(storyteller_id_param UUID)
RETURNS VOID AS $$
BEGIN
    -- Remove AI-extracted themes from transcripts
    UPDATE transcripts
    SET
        themes = NULL,
        key_quotes = NULL,
        ai_summary = NULL,
        ai_confidence_score = NULL,
        ai_model_version = NULL,
        ai_processing_date = NULL,
        ai_processing_status = NULL,
        updated_at = NOW()
    WHERE storyteller_id = storyteller_id_param;

    -- Remove storyteller connections (only those involving this storyteller)
    DELETE FROM storyteller_connections
    WHERE storyteller_1_id = storyteller_id_param
       OR storyteller_2_id = storyteller_id_param;

    -- Remove storyteller theme associations
    DELETE FROM storyteller_themes
    WHERE storyteller_id = storyteller_id_param;

    -- Remove extracted quotes
    DELETE FROM storyteller_quotes
    WHERE storyteller_id = storyteller_id_param;

    -- Remove AI analysis job results
    DELETE FROM ai_analysis_jobs
    WHERE entity_id IN (
        SELECT id::text FROM transcripts WHERE storyteller_id = storyteller_id_param
    );

    -- Log the cleanup
    RAISE NOTICE 'AI data deleted for storyteller: %', storyteller_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_storyteller_ai_data(UUID) TO authenticated;

-- ============================================================================
-- CONSENT CHANGE TRIGGER
-- ============================================================================

-- Automatically clean up AI data when consent is revoked
CREATE OR REPLACE FUNCTION trigger_consent_revocation_cleanup()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger if ai_processing_consent changed from TRUE to FALSE
    IF (OLD.ai_processing_consent = TRUE) AND (NEW.ai_processing_consent = FALSE) THEN
        -- Delete AI-generated data
        PERFORM delete_storyteller_ai_data(NEW.id);

        RAISE NOTICE 'Consent revoked - AI data cleaned for storyteller: %', NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS consent_revocation_cleanup ON profiles;
CREATE TRIGGER consent_revocation_cleanup
    AFTER UPDATE ON profiles
    FOR EACH ROW
    WHEN (OLD.ai_processing_consent IS DISTINCT FROM NEW.ai_processing_consent)
    EXECUTE FUNCTION trigger_consent_revocation_cleanup();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;

    RAISE NOTICE '======================================';
    RAISE NOTICE 'CONSENT REVOCATION CLEANUP MIGRATION';
    RAISE NOTICE '======================================';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'Profiles: % (expected: 251)', profile_count;
    RAISE NOTICE 'Function created: delete_storyteller_ai_data()';
    RAISE NOTICE 'Trigger created: consent_revocation_cleanup';
    RAISE NOTICE '======================================';

    IF profile_count < 200 THEN
        RAISE EXCEPTION 'DANGER: Only % profiles found. Expected 251. Wrong database!', profile_count;
    END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON FUNCTION delete_storyteller_ai_data(UUID) IS
'Deletes all AI-generated data for a storyteller when consent is revoked. Honors GDPR Article 7.';

COMMENT ON FUNCTION trigger_consent_revocation_cleanup() IS
'Automatically triggers AI data cleanup when storyteller revokes ai_processing_consent.';
