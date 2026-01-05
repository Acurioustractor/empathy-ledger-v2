-- Fix audit_trigger_function to use correct column names
-- The trigger references user_id but the table uses actor_id

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    audit_action TEXT;
    changes JSONB;
BEGIN
    -- Determine audit action
    IF TG_OP = 'DELETE' THEN
        audit_action := 'delete';
        changes := to_jsonb(OLD);
    ELSIF TG_OP = 'UPDATE' THEN
        audit_action := 'update';
        changes := jsonb_build_object(
            'before', to_jsonb(OLD),
            'after', to_jsonb(NEW)
        );
    ELSIF TG_OP = 'INSERT' THEN
        audit_action := 'create';
        changes := to_jsonb(NEW);
    END IF;

    -- Insert audit log with correct column names
    -- Map table names to entity types (stories -> story, etc.)
    INSERT INTO audit_logs (
        tenant_id,
        actor_id,
        action,
        entity_type,
        entity_id,
        new_state,
        metadata,
        created_at
    ) VALUES (
        COALESCE(NEW.tenant_id, OLD.tenant_id),
        auth.uid(),
        audit_action,
        CASE TG_TABLE_NAME
            WHEN 'stories' THEN 'story'
            WHEN 'media_assets' THEN 'media'
            WHEN 'profiles' THEN 'profile'
            WHEN 'embed_tokens' THEN 'embed_token'
            WHEN 'consents' THEN 'consent'
            WHEN 'distributions' THEN 'distribution'
            WHEN 'deletion_requests' THEN 'deletion_request'
            ELSE TG_TABLE_NAME
        END,
        COALESCE(NEW.id, OLD.id),
        changes,
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'timestamp', NOW()
        ),
        NOW()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the function was created
SELECT proname, pg_get_functiondef(oid) AS definition
FROM pg_proc
WHERE proname = 'audit_trigger_function'
LIMIT 1;
