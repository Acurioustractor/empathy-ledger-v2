-- Audit Triggers for GDPR Compliance
-- Created: 2026-01-01
-- Issue: https://github.com/Acurioustractor/empathy-ledger-v2/issues/128
--
-- Automatically log all changes to sensitive tables.
-- Required for GDPR Article 30 (Records of Processing Activities).

-- ============================================================================
-- VERIFICATION: Confirm we're on Supabase Production
-- ============================================================================

DO $$
DECLARE
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'AUDIT TRIGGERS DEPLOYMENT';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'Profiles: % (expected: 251)', profile_count;
    RAISE NOTICE '========================================';

    IF profile_count < 200 THEN
        RAISE EXCEPTION 'DANGER: Only % profiles found. Expected 251. Wrong database!', profile_count;
    END IF;
END $$;

-- ============================================================================
-- AUDIT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    audit_action TEXT;
    old_data JSONB;
    new_data JSONB;
    changes JSONB;
BEGIN
    -- Determine action
    IF (TG_OP = 'INSERT') THEN
        audit_action := 'create';
        new_data := to_jsonb(NEW);
        changes := new_data;
    ELSIF (TG_OP = 'UPDATE') THEN
        audit_action := 'update';
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        -- Calculate what changed
        changes := jsonb_build_object(
            'before', old_data,
            'after', new_data
        );
    ELSIF (TG_OP = 'DELETE') THEN
        audit_action := 'delete';
        old_data := to_jsonb(OLD);
        changes := old_data;
    END IF;

    -- Insert audit log
    INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        changes,
        metadata,
        created_at
    ) VALUES (
        COALESCE(
            current_setting('request.jwt.claims', true)::json->>'sub',
            auth.uid()::text
        ),
        audit_action,
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        changes,
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'timestamp', NOW()
        ),
        NOW()
    );

    -- Return appropriate row
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- APPLY TRIGGERS TO SENSITIVE TABLES
-- ============================================================================

-- Transcripts (core storytelling content)
DROP TRIGGER IF EXISTS audit_transcripts ON transcripts;
CREATE TRIGGER audit_transcripts
    AFTER INSERT OR UPDATE OR DELETE ON transcripts
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Stories (published narratives)
DROP TRIGGER IF EXISTS audit_stories ON stories;
CREATE TRIGGER audit_stories
    AFTER INSERT OR UPDATE OR DELETE ON stories
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Profiles (user PII)
DROP TRIGGER IF EXISTS audit_profiles ON profiles;
CREATE TRIGGER audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Media Assets (sensitive content)
DROP TRIGGER IF EXISTS audit_media_assets ON media_assets;
CREATE TRIGGER audit_media_assets
    AFTER INSERT OR UPDATE OR DELETE ON media_assets
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Organizations (business data)
DROP TRIGGER IF EXISTS audit_organizations ON organizations;
CREATE TRIGGER audit_organizations
    AFTER INSERT OR UPDATE OR DELETE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Consent Changes (CRITICAL for GDPR)
-- Special handling: audit ANY change to consent-related columns
CREATE OR REPLACE FUNCTION audit_consent_changes()
RETURNS TRIGGER AS $$
DECLARE
    consent_fields TEXT[] := ARRAY[
        'ai_processing_consent',
        'consent_for_ai_analysis',
        'cultural_consent',
        'elder_review_consent'
    ];
    field TEXT;
    old_value BOOLEAN;
    new_value BOOLEAN;
BEGIN
    -- Check each consent field for changes
    FOREACH field IN ARRAY consent_fields
    LOOP
        -- Get old and new values (if column exists)
        BEGIN
            EXECUTE format('SELECT ($1).%I, ($2).%I', field, field)
                INTO old_value, new_value
                USING OLD, NEW;

            -- If changed, log to audit_logs
            IF (old_value IS DISTINCT FROM new_value) THEN
                INSERT INTO audit_logs (
                    user_id,
                    action,
                    resource_type,
                    resource_id,
                    changes,
                    metadata,
                    created_at
                ) VALUES (
                    auth.uid()::text,
                    'consent_change',
                    TG_TABLE_NAME,
                    NEW.id::text,
                    jsonb_build_object(
                        'field', field,
                        'old_value', old_value,
                        'new_value', new_value
                    ),
                    jsonb_build_object(
                        'timestamp', NOW(),
                        'table', TG_TABLE_NAME,
                        'consent_field', field
                    ),
                    NOW()
                );

                -- Also log to consent_change_log (specific table)
                INSERT INTO consent_change_log (
                    user_id,
                    resource_type,
                    resource_id,
                    consent_type,
                    old_value,
                    new_value,
                    changed_at
                ) VALUES (
                    auth.uid(),
                    TG_TABLE_NAME,
                    NEW.id,
                    field,
                    old_value,
                    new_value,
                    NOW()
                );
            END IF;
        EXCEPTION
            WHEN undefined_column THEN
                -- Column doesn't exist in this table, skip
                NULL;
        END;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply consent trigger to transcripts
DROP TRIGGER IF EXISTS audit_consent_transcripts ON transcripts;
CREATE TRIGGER audit_consent_transcripts
    AFTER UPDATE ON transcripts
    FOR EACH ROW
    EXECUTE FUNCTION audit_consent_changes();

-- Apply consent trigger to profiles
DROP TRIGGER IF EXISTS audit_consent_profiles ON profiles;
CREATE TRIGGER audit_consent_profiles
    AFTER UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION audit_consent_changes();

-- ============================================================================
-- BACKFILL: Create historical audit entries
-- ============================================================================

-- Estimate recent activity and create audit entries
-- This gives us a baseline so audit_logs isn't empty

DO $$
DECLARE
    recent_transcript_count INTEGER;
BEGIN
    -- Count recent transcripts (created in last 30 days)
    SELECT COUNT(*) INTO recent_transcript_count
    FROM transcripts
    WHERE created_at > NOW() - INTERVAL '30 days';

    RAISE NOTICE 'Creating backfill audit entries...';
    RAISE NOTICE 'Recent transcripts: %', recent_transcript_count;

    -- Backfill: Log creation of recent transcripts
    INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        changes,
        metadata,
        created_at
    )
    SELECT
        storyteller_id::text,
        'create',
        'transcripts',
        id::text,
        jsonb_build_object(
            'title', title,
            'storyteller_id', storyteller_id
        ),
        jsonb_build_object(
            'backfill', true,
            'estimated_date', created_at
        ),
        created_at
    FROM transcripts
    WHERE created_at > NOW() - INTERVAL '30 days';

    -- Backfill: Log creation of recent stories
    INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        changes,
        metadata,
        created_at
    )
    SELECT
        author_id::text,
        'create',
        'stories',
        id::text,
        jsonb_build_object(
            'title', title,
            'author_id', author_id
        ),
        jsonb_build_object(
            'backfill', true,
            'estimated_date', created_at
        ),
        created_at
    FROM stories
    WHERE created_at > NOW() - INTERVAL '30 days';

    RAISE NOTICE 'Backfill complete!';
END $$;

-- ============================================================================
-- VERIFICATION: Check audit log entries
-- ============================================================================

DO $$
DECLARE
    audit_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO audit_count FROM audit_logs;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'AUDIT TRIGGERS VERIFICATION';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Audit log entries: %', audit_count;
    RAISE NOTICE 'Triggers created: 7';
    RAISE NOTICE 'Tables monitored: transcripts, stories, profiles, media_assets, organizations';
    RAISE NOTICE 'Consent tracking: ACTIVE';
    RAISE NOTICE '========================================';

    IF audit_count = 0 THEN
        RAISE WARNING 'No audit entries yet. Triggers are active and will log future changes.';
    END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON FUNCTION audit_trigger_function() IS 'Automatically logs all table changes to audit_logs for GDPR compliance';
COMMENT ON FUNCTION audit_consent_changes() IS 'Logs consent changes to both audit_logs and consent_change_log';
