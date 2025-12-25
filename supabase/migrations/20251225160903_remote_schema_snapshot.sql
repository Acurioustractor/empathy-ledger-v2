

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'Organization Impact Analytics - Migration 20251224000001 applied';



CREATE TYPE "public"."billing_status" AS ENUM (
    'active',
    'trialing',
    'past_due',
    'paused',
    'canceled'
);


ALTER TYPE "public"."billing_status" OWNER TO "postgres";


CREATE TYPE "public"."collaboration_type" AS ENUM (
    'shared_project',
    'knowledge_exchange',
    'ceremonial_partnership',
    'educational_alliance',
    'cultural_preservation',
    'research_partnership',
    'language_revitalization'
);


ALTER TYPE "public"."collaboration_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."collaboration_type" IS 'Types of inter-organizational collaborations supporting indigenous cultural preservation, knowledge sharing, and community building efforts.';



CREATE TYPE "public"."content_type" AS ENUM (
    'story',
    'transcript',
    'media_asset',
    'gallery',
    'project'
);


ALTER TYPE "public"."content_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."content_type" IS 'Types of cultural content managed within the platform for appropriate access control and cultural sensitivity handling.';



CREATE TYPE "public"."cultural_permission_level" AS ENUM (
    'sacred',
    'restricted',
    'community_only',
    'educational',
    'public'
);


ALTER TYPE "public"."cultural_permission_level" OWNER TO "postgres";


COMMENT ON TYPE "public"."cultural_permission_level" IS 'Cultural sensitivity levels for content access control. Sacred content requires elder approval, restricted content needs cultural keeper oversight, and community content is limited to verified community members.';



CREATE TYPE "public"."organization_role" AS ENUM (
    'elder',
    'cultural_keeper',
    'knowledge_holder',
    'admin',
    'project_leader',
    'storyteller',
    'community_member',
    'guest',
    'cultural_liaison',
    'archivist'
);


ALTER TYPE "public"."organization_role" OWNER TO "postgres";


COMMENT ON TYPE "public"."organization_role" IS 'Indigenous-first role hierarchy respecting traditional governance structures. Elder authority supersedes all other roles, with cultural keepers having special privileges for sacred and restricted content.';



CREATE TYPE "public"."organization_status" AS ENUM (
    'active',
    'inactive',
    'under_review',
    'suspended',
    'archived'
);


ALTER TYPE "public"."organization_status" OWNER TO "postgres";


CREATE TYPE "public"."organization_tier" AS ENUM (
    'community',
    'basic',
    'standard',
    'premium',
    'enterprise'
);


ALTER TYPE "public"."organization_tier" OWNER TO "postgres";


CREATE TYPE "public"."permission_tier" AS ENUM (
    'private',
    'trusted_circle',
    'community',
    'public',
    'archive'
);


ALTER TYPE "public"."permission_tier" OWNER TO "postgres";


COMMENT ON TYPE "public"."permission_tier" IS 'Graduated sharing levels: private (storyteller only) → trusted_circle (limited sharing) → community (community events) → public (social media OK) → archive (permanent record)';



CREATE TYPE "public"."sharing_policy" AS ENUM (
    'open',
    'request_based',
    'elder_approved',
    'restricted',
    'never'
);


ALTER TYPE "public"."sharing_policy" OWNER TO "postgres";


COMMENT ON TYPE "public"."sharing_policy" IS 'Organizational policies for content sharing that respect indigenous cultural protocols and maintain appropriate access controls.';



CREATE TYPE "public"."tag_category" AS ENUM (
    'traditional_knowledge',
    'ceremonial',
    'ecological_knowledge',
    'medicinal_knowledge',
    'language_preservation',
    'cultural_practice',
    'historical_event',
    'geographical_place',
    'family_clan',
    'seasonal_activity',
    'artistic_tradition',
    'spiritual_practice'
);


ALTER TYPE "public"."tag_category" OWNER TO "postgres";


COMMENT ON TYPE "public"."tag_category" IS 'Cultural content categorization system based on indigenous knowledge organization principles and traditional ways of understanding the world.';



CREATE TYPE "public"."tag_source" AS ENUM (
    'manual',
    'ai_generated',
    'community_suggested',
    'elder_designated',
    'imported'
);


ALTER TYPE "public"."tag_source" OWNER TO "postgres";


COMMENT ON TYPE "public"."tag_source" IS 'Source tracking for content tags with special recognition of elder authority in cultural content designation and community input validation.';



CREATE OR REPLACE FUNCTION "public"."aggregate_daily_engagement"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Aggregate yesterday's events into daily table
  INSERT INTO story_engagement_daily (
    story_id,
    storyteller_id,
    platform_name,
    date,
    view_count,
    read_count,
    share_count,
    action_count,
    total_read_time_seconds,
    avg_scroll_depth,
    top_countries,
    mobile_percent,
    desktop_percent
  )
  SELECT
    story_id,
    storyteller_id,
    platform_name,
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE event_type = 'view') as view_count,
    COUNT(*) FILTER (WHERE event_type = 'read') as read_count,
    COUNT(*) FILTER (WHERE event_type = 'share') as share_count,
    COUNT(*) FILTER (WHERE event_type = 'action') as action_count,
    COALESCE(SUM(read_time_seconds), 0) as total_read_time_seconds,
    AVG(scroll_depth)::INTEGER as avg_scroll_depth,
    (
      SELECT jsonb_agg(jsonb_build_object('country', country_code, 'count', cnt))
      FROM (
        SELECT country_code, COUNT(*) as cnt
        FROM story_engagement_events e2
        WHERE e2.story_id = story_engagement_events.story_id
          AND DATE(e2.created_at) = DATE(story_engagement_events.created_at)
          AND e2.country_code IS NOT NULL
        GROUP BY country_code
        ORDER BY cnt DESC
        LIMIT 3
      ) top
    ) as top_countries,
    (COUNT(*) FILTER (WHERE device_type = 'mobile') * 100 / NULLIF(COUNT(*), 0))::INTEGER as mobile_percent,
    (COUNT(*) FILTER (WHERE device_type = 'desktop') * 100 / NULLIF(COUNT(*), 0))::INTEGER as desktop_percent
  FROM story_engagement_events
  WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY story_id, storyteller_id, platform_name, DATE(created_at)
  ON CONFLICT (story_id, platform_name, date)
  DO UPDATE SET
    view_count = EXCLUDED.view_count,
    read_count = EXCLUDED.read_count,
    share_count = EXCLUDED.share_count,
    action_count = EXCLUDED.action_count,
    total_read_time_seconds = EXCLUDED.total_read_time_seconds,
    avg_scroll_depth = EXCLUDED.avg_scroll_depth,
    top_countries = EXCLUDED.top_countries,
    mobile_percent = EXCLUDED.mobile_percent,
    desktop_percent = EXCLUDED.desktop_percent,
    updated_at = NOW();
END;
$$;


ALTER FUNCTION "public"."aggregate_daily_engagement"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."approve_for_publishing"("queue_id" "uuid", "reviewer_id" "uuid", "notes" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE content_approval_queue
    SET status = 'approved',
        reviewed_by = reviewer_id,
        reviewed_at = NOW(),
        review_notes = notes
    WHERE id = queue_id;

    -- Update empathy entry
    UPDATE empathy_entries
    SET publish_status = 'approved',
        approved_by = reviewer_id,
        approved_at = NOW()
    WHERE id = (SELECT empathy_entry_id FROM content_approval_queue WHERE id = queue_id);
END;
$$;


ALTER FUNCTION "public"."approve_for_publishing"("queue_id" "uuid", "reviewer_id" "uuid", "notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."approve_story_feature"("tag_id" "uuid", "admin_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if admin has permission
  IF NOT EXISTS (
    SELECT 1 FROM act_admin_permissions
    WHERE user_id = admin_uuid
    AND is_active = TRUE
    AND can_approve_stories = TRUE
  ) THEN
    RAISE EXCEPTION 'User does not have permission to approve stories';
  END IF;

  -- Approve the tag
  UPDATE story_project_tags
  SET
    act_approved = TRUE,
    act_approved_at = NOW(),
    act_approved_by = admin_uuid,
    updated_at = NOW()
  WHERE id = tag_id;

  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."approve_story_feature"("tag_id" "uuid", "admin_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."approve_storyteller_feature"("feature_id" "uuid", "admin_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if admin has permission
  IF NOT EXISTS (
    SELECT 1 FROM act_admin_permissions
    WHERE user_id = admin_uuid
    AND is_active = TRUE
    AND can_approve_storytellers = TRUE
  ) THEN
    RAISE EXCEPTION 'User does not have permission to approve storytellers';
  END IF;

  -- Approve the feature
  UPDATE storyteller_project_features
  SET
    approved_by_act = TRUE,
    approved_at = NOW(),
    approved_by = admin_uuid,
    updated_at = NOW()
  WHERE id = feature_id;

  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."approve_storyteller_feature"("feature_id" "uuid", "admin_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."archive_story"("p_story_id" "uuid", "p_archived_by" "uuid", "p_reason" "text" DEFAULT NULL::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.stories
  SET
    is_archived = true,
    archived_at = NOW(),
    archived_by = p_archived_by,
    archive_reason = p_reason,
    status = 'archived'
  WHERE id = p_story_id AND (author_id = p_archived_by OR storyteller_id = p_archived_by);

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Revoke all distributions
  PERFORM public.revoke_all_story_distributions(p_story_id, p_archived_by, 'Story archived');

  RETURN true;
END;
$$;


ALTER FUNCTION "public"."archive_story"("p_story_id" "uuid", "p_archived_by" "uuid", "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_generate_video_metadata"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Extract YouTube ID if it's a YouTube URL
    IF NEW.video_url LIKE '%youtube.com%' OR NEW.video_url LIKE '%youtu.be%' THEN
        NEW.video_type := 'youtube';
        NEW.video_id := extract_youtube_id(NEW.video_url);

        -- Generate embed code if not provided
        IF NEW.embed_code IS NULL AND NEW.video_id IS NOT NULL THEN
            NEW.embed_code := generate_youtube_embed(NEW.video_id);
        END IF;

        -- Generate thumbnail if not provided
        IF NEW.thumbnail_url IS NULL AND NEW.video_id IS NOT NULL THEN
            NEW.thumbnail_url := format('https://img.youtube.com/vi/%s/maxresdefault.jpg', NEW.video_id);
        END IF;

    -- Extract Descript ID if it's a Descript URL
    ELSIF NEW.video_url LIKE '%share.descript.com%' THEN
        NEW.video_type := 'descript';
        NEW.video_id := extract_descript_id(NEW.video_url);

        -- Generate embed code if not provided
        IF NEW.embed_code IS NULL AND NEW.video_id IS NOT NULL THEN
            NEW.embed_code := generate_descript_embed(NEW.video_id);
        END IF;

        -- Descript doesn't have automatic thumbnails, but you can add manually
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_generate_video_metadata"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_connection_strength"("p_storyteller_a_id" "uuid", "p_storyteller_b_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    theme_similarity DECIMAL := 0.0;
    geographic_similarity DECIMAL := 0.0;
    demographic_similarity DECIMAL := 0.0;
    final_strength DECIMAL := 0.0;
BEGIN
    -- Calculate theme similarity
    SELECT COALESCE(
        (COUNT(DISTINCT sta.theme_id) * 1.0) / GREATEST(
            (SELECT COUNT(DISTINCT theme_id) FROM storyteller_themes WHERE storyteller_id = p_storyteller_a_id),
            (SELECT COUNT(DISTINCT theme_id) FROM storyteller_themes WHERE storyteller_id = p_storyteller_b_id)
        ), 0.0
    ) INTO theme_similarity
    FROM storyteller_themes sta
    INNER JOIN storyteller_themes stb ON sta.theme_id = stb.theme_id
    WHERE sta.storyteller_id = p_storyteller_a_id
      AND stb.storyteller_id = p_storyteller_b_id;

    -- Calculate geographic similarity (simplified)
    SELECT CASE
        WHEN sda.current_location->>'city' = sdb.current_location->>'city' THEN 1.0
        WHEN sda.current_location->>'state' = sdb.current_location->>'state' THEN 0.7
        WHEN sda.current_location->>'country' = sdb.current_location->>'country' THEN 0.4
        ELSE 0.0
    END INTO geographic_similarity
    FROM storyteller_demographics sda, storyteller_demographics sdb
    WHERE sda.storyteller_id = p_storyteller_a_id
      AND sdb.storyteller_id = p_storyteller_b_id;

    -- Calculate weighted final strength
    final_strength := (theme_similarity * 0.5) + (geographic_similarity * 0.3) + (demographic_similarity * 0.2);

    RETURN LEAST(final_strength, 1.0);
END;
$$;


ALTER FUNCTION "public"."calculate_connection_strength"("p_storyteller_a_id" "uuid", "p_storyteller_b_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_engagement_score"("p_storyteller_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    recent_engagement RECORD;
    engagement_score DECIMAL := 0.0;
BEGIN
    -- Get recent engagement data (last 30 days)
    SELECT
        COALESCE(SUM(stories_created), 0) as stories,
        COALESCE(SUM(connections_made), 0) as connections,
        COALESCE(SUM(story_views), 0) as views,
        COALESCE(SUM(active_minutes), 0) as minutes,
        COALESCE(AVG(average_story_rating), 0.0) as rating
    INTO recent_engagement
    FROM storyteller_engagement
    WHERE storyteller_id = p_storyteller_id
      AND period_start >= NOW() - INTERVAL '30 days';

    -- Calculate weighted engagement score
    engagement_score := (
        (recent_engagement.stories * 10.0) +
        (recent_engagement.connections * 5.0) +
        (recent_engagement.views * 0.1) +
        (recent_engagement.minutes * 0.05) +
        (recent_engagement.rating * 20.0)
    );

    RETURN LEAST(engagement_score, 100.0);
END;
$$;


ALTER FUNCTION "public"."calculate_engagement_score"("p_storyteller_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_organization_completeness"("org_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    total_fields INTEGER := 10;
    filled_fields INTEGER := 0;
    org_record RECORD;
BEGIN
    SELECT * INTO org_record FROM organizations WHERE id = org_id;
    
    IF FOUND THEN
        -- Count filled core fields
        IF org_record.name IS NOT NULL AND LENGTH(org_record.name) > 0 THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF org_record.description IS NOT NULL AND LENGTH(org_record.description) > 20 THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF org_record.website_url IS NOT NULL THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF org_record.email IS NOT NULL THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF org_record.phone IS NOT NULL THEN
            filled_fields := filled_fields + 1;
        END IF;
        IF org_record.address IS NOT NULL THEN
            filled_fields := filled_fields + 1;
        END IF;
        
        -- Check for services
        IF EXISTS(SELECT 1 FROM scraped_services WHERE organization_id = org_id AND active = true) THEN
            filled_fields := filled_fields + 1;
        END IF;
        
        -- Check for enrichment data
        IF EXISTS(SELECT 1 FROM organization_enrichment WHERE organization_id = org_id AND active = true) THEN
            filled_fields := filled_fields + 1;
        END IF;
        
        -- Additional quality indicators
        IF org_record.created_at > CURRENT_TIMESTAMP - INTERVAL '90 days' THEN
            filled_fields := filled_fields + 1;
        END IF;
        
        -- Validation status
        IF EXISTS(SELECT 1 FROM scraping_metadata WHERE organization_id = org_id AND validation_status = 'approved') THEN
            filled_fields := filled_fields + 1;
        END IF;
    END IF;
    
    RETURN ROUND(filled_fields::DECIMAL / total_fields, 2);
END;
$$;


ALTER FUNCTION "public"."calculate_organization_completeness"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_organization_impact_metrics"("org_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  tenant_uuid UUID;
  storyteller_ids UUID[];
  transcript_count INT;
  analyzed_count INT;
  story_count INT;
  published_count INT;
  all_themes TEXT[];
  diversity_score DECIMAL;
BEGIN
  -- Get tenant_id
  SELECT tenant_id INTO tenant_uuid
  FROM organizations WHERE id = org_id;

  -- Get storyteller IDs
  SELECT ARRAY_AGG(profile_id) INTO storyteller_ids
  FROM organization_members
  WHERE organization_id = org_id
    AND profile_id IN (SELECT id FROM profiles WHERE is_storyteller = TRUE);

  -- Count transcripts
  SELECT COUNT(*) INTO transcript_count
  FROM transcripts WHERE storyteller_id = ANY(storyteller_ids);

  SELECT COUNT(*) INTO analyzed_count
  FROM transcripts
  WHERE storyteller_id = ANY(storyteller_ids)
    AND themes IS NOT NULL AND array_length(themes, 1) > 0;

  -- Count stories
  SELECT COUNT(*) INTO story_count
  FROM stories WHERE storyteller_id = ANY(storyteller_ids);

  SELECT COUNT(*) INTO published_count
  FROM stories
  WHERE storyteller_id = ANY(storyteller_ids)
    AND status = 'published';

  -- Extract all themes
  SELECT ARRAY_AGG(DISTINCT theme) INTO all_themes
  FROM (
    SELECT unnest(themes) as theme
    FROM transcripts
    WHERE storyteller_id = ANY(storyteller_ids)
      AND themes IS NOT NULL
  ) t;

  -- Calculate diversity (simple version: unique themes / total transcripts)
  diversity_score := CASE
    WHEN analyzed_count > 0 THEN
      LEAST(1.0, array_length(all_themes, 1)::DECIMAL / analyzed_count::DECIMAL)
    ELSE 0
  END;

  -- Upsert metrics
  INSERT INTO organization_impact_metrics (
    organization_id,
    tenant_id,
    total_transcripts,
    analyzed_transcripts,
    total_stories,
    published_stories,
    primary_themes,
    theme_diversity_score,
    last_calculated_at
  ) VALUES (
    org_id,
    tenant_uuid,
    transcript_count,
    analyzed_count,
    story_count,
    published_count,
    all_themes,
    diversity_score,
    NOW()
  )
  ON CONFLICT (organization_id) DO UPDATE SET
    total_transcripts = EXCLUDED.total_transcripts,
    analyzed_transcripts = EXCLUDED.analyzed_transcripts,
    total_stories = EXCLUDED.total_stories,
    published_stories = EXCLUDED.published_stories,
    primary_themes = EXCLUDED.primary_themes,
    theme_diversity_score = EXCLUDED.theme_diversity_score,
    last_calculated_at = NOW();
END;
$$;


ALTER FUNCTION "public"."calculate_organization_impact_metrics"("org_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calculate_organization_impact_metrics"("org_id" "uuid") IS 'Recalculate impact metrics for a given organization';



CREATE OR REPLACE FUNCTION "public"."calculate_outcome_progress"("outcome_id" "uuid") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    baseline NUMERIC;
    target NUMERIC;
    current NUMERIC;
    progress NUMERIC;
BEGIN
    SELECT baseline_value, target_value, current_value
    INTO baseline, target, current
    FROM public.outcomes
    WHERE id = outcome_id;

    IF baseline IS NULL OR target IS NULL OR current IS NULL THEN
        RETURN NULL;
    END IF;

    IF target = baseline THEN
        RETURN 100;
    END IF;

    progress := ((current - baseline) / (target - baseline)) * 100;
    RETURN LEAST(100, GREATEST(0, progress));
END;
$$;


ALTER FUNCTION "public"."calculate_outcome_progress"("outcome_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_sroi_outcome_value"("p_outcome_id" "uuid", "p_discount_rate" double precision DEFAULT 0.035) RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_outcome RECORD;
  v_gross_value DECIMAL(12,2);
  v_net_value DECIMAL(12,2);
  v_total_value DECIMAL(12,2) := 0;
  v_yearly_value DECIMAL(12,2);
  v_discount_factor FLOAT;
  v_year INTEGER;
BEGIN
  SELECT * INTO v_outcome FROM sroi_outcomes WHERE id = p_outcome_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  v_gross_value := v_outcome.quantity * v_outcome.financial_proxy;
  v_net_value := v_gross_value * (1 - v_outcome.deadweight) * v_outcome.attribution * (1 - v_outcome.displacement);

  FOR v_year IN 1..v_outcome.duration_years LOOP
    v_yearly_value := v_net_value * POWER(1 - v_outcome.drop_off, v_year - 1);
    v_discount_factor := POWER(1 + p_discount_rate, v_year);
    v_total_value := v_total_value + (v_yearly_value / v_discount_factor);
  END LOOP;

  UPDATE sroi_outcomes SET total_value = v_total_value WHERE id = p_outcome_id;

  RETURN v_total_value;
END;
$$;


ALTER FUNCTION "public"."calculate_sroi_outcome_value"("p_outcome_id" "uuid", "p_discount_rate" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_storyteller_analytics"("p_storyteller_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO storyteller_analytics (storyteller_id, tenant_id, total_stories, total_transcripts, last_calculated_at)
    SELECT
        p_storyteller_id,
        p.tenant_id,
        COALESCE((SELECT COUNT(*) FROM stories WHERE storyteller_id = p_storyteller_id), 0),
        COALESCE((SELECT COUNT(*) FROM transcripts WHERE storyteller_id = p_storyteller_id), 0),
        NOW()
    FROM profiles p
    WHERE p.id = p_storyteller_id
    ON CONFLICT (storyteller_id) DO UPDATE SET
        total_stories = EXCLUDED.total_stories,
        total_transcripts = EXCLUDED.total_transcripts,
        last_calculated_at = EXCLUDED.last_calculated_at,
        updated_at = NOW();
END;
$$;


ALTER FUNCTION "public"."calculate_storyteller_analytics"("p_storyteller_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_create_share_link"("p_story_id" "uuid", "p_purpose" "text") RETURNS TABLE("allowed" boolean, "reason" "text", "tier" "public"."permission_tier")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_story RECORD;
BEGIN
  -- Get story permission tier
  SELECT permission_tier, status INTO v_story
  FROM stories
  WHERE id = p_story_id;

  -- Story not found
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Story not found'::TEXT, NULL::permission_tier;
    RETURN;
  END IF;

  -- Story withdrawn
  IF v_story.status = 'withdrawn' THEN
    RETURN QUERY SELECT false, 'Story has been withdrawn'::TEXT, v_story.permission_tier;
    RETURN;
  END IF;

  -- Check permission tier
  CASE v_story.permission_tier
    WHEN 'private' THEN
      -- No sharing allowed
      RETURN QUERY SELECT false, 'Story is private - sharing not allowed'::TEXT, v_story.permission_tier;

    WHEN 'trusted_circle' THEN
      -- Only direct share or email
      IF p_purpose NOT IN ('direct-share', 'email') THEN
        RETURN QUERY SELECT false, 'Trusted circle tier only allows direct sharing or email'::TEXT, v_story.permission_tier;
      ELSE
        RETURN QUERY SELECT true, 'Allowed for trusted circle'::TEXT, v_story.permission_tier;
      END IF;

    WHEN 'community' THEN
      -- No social media or embed
      IF p_purpose IN ('social-media', 'embed') THEN
        RETURN QUERY SELECT false, 'Community tier does not allow social media or embed sharing'::TEXT, v_story.permission_tier;
      ELSE
        RETURN QUERY SELECT true, 'Allowed for community sharing'::TEXT, v_story.permission_tier;
      END IF;

    WHEN 'public' THEN
      -- All sharing allowed
      RETURN QUERY SELECT true, 'Allowed for public sharing'::TEXT, v_story.permission_tier;

    WHEN 'archive' THEN
      -- All sharing allowed (permanent)
      RETURN QUERY SELECT true, 'Allowed for archive (permanent)'::TEXT, v_story.permission_tier;

    ELSE
      RETURN QUERY SELECT false, 'Unknown permission tier'::TEXT, v_story.permission_tier;
  END CASE;
END;
$$;


ALTER FUNCTION "public"."can_create_share_link"("p_story_id" "uuid", "p_purpose" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_create_share_link"("p_story_id" "uuid", "p_purpose" "text") IS 'Validates if a share link can be created based on story permission tier and intended purpose';



CREATE OR REPLACE FUNCTION "public"."check_cultural_protocol"("protocol_type_param" "text", "resource_data" "jsonb" DEFAULT '{}'::"jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    tenant_protocols RECORD;
BEGIN
    -- Get active protocols for user's tenant
    SELECT * INTO tenant_protocols
    FROM public.cultural_protocols 
    WHERE tenant_id = public.get_user_tenant_id()
    AND protocol_type = protocol_type_param
    AND status = 'active'
    AND (expiry_date IS NULL OR expiry_date > NOW())
    LIMIT 1;
    
    -- If no protocols found, allow by default
    IF NOT FOUND THEN
        RETURN true;
    END IF;
    
    -- Check enforcement level
    CASE tenant_protocols.enforcement_level
        WHEN 'advisory' THEN
            RETURN true;  -- Advisory only, don't block
        WHEN 'required' THEN
            -- Implement specific rule checking here based on rules JSONB
            RETURN true;  -- For now, allow (implement specific logic as needed)
        WHEN 'blocking' THEN
            -- Strict enforcement - implement specific rule checking
            RETURN true;  -- For now, allow (implement specific logic as needed)
        ELSE
            RETURN false;
    END CASE;
END;
$$;


ALTER FUNCTION "public"."check_cultural_protocol"("protocol_type_param" "text", "resource_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_storyteller_milestones"("p_storyteller_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    story_count INTEGER;
    connection_count INTEGER;
BEGIN
    -- Get current stats
    SELECT total_stories, connection_count INTO story_count, connection_count
    FROM storyteller_analytics
    WHERE storyteller_id = p_storyteller_id;

    -- Award first story milestone
    IF story_count >= 1 THEN
        INSERT INTO storyteller_milestones (storyteller_id, tenant_id, milestone_type, milestone_title, milestone_description, achievement_value, achieved_at)
        SELECT p_storyteller_id, tenant_id, 'first_story', 'First Story Shared', 'Congratulations on sharing your first story!', 1, NOW()
        FROM profiles WHERE id = p_storyteller_id
        ON CONFLICT (storyteller_id, milestone_type) DO NOTHING;
    END IF;

    -- Award connection milestones
    IF connection_count >= 5 THEN
        INSERT INTO storyteller_milestones (storyteller_id, tenant_id, milestone_type, milestone_title, milestone_description, achievement_value, achieved_at)
        SELECT p_storyteller_id, tenant_id, 'connection_count', 'Network Builder', 'You''ve connected with 5 fellow storytellers!', 5, NOW()
        FROM profiles WHERE id = p_storyteller_id
        ON CONFLICT (storyteller_id, milestone_type) DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION "public"."check_storyteller_milestones"("p_storyteller_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_webhook_failures"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.consecutive_failures >= NEW.max_consecutive_failures THEN
    NEW.is_active = false;
    RAISE NOTICE 'Webhook % disabled after % consecutive failures', NEW.id, NEW.consecutive_failures;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_webhook_failures"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_expired_tokens"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM story_access_tokens
  WHERE expires_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_expired_tokens"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_notifications"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  DELETE FROM notifications
  WHERE (expires_at IS NOT NULL AND expires_at < NOW())
     OR (is_read = true AND created_at < NOW() - INTERVAL '30 days');
END;
$$;


ALTER FUNCTION "public"."cleanup_old_notifications"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_dashboard_config"("p_storyteller_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO storyteller_dashboard_config (storyteller_id, tenant_id)
    SELECT p_storyteller_id, tenant_id
    FROM profiles
    WHERE id = p_storyteller_id
    ON CONFLICT (storyteller_id) DO NOTHING;
END;
$$;


ALTER FUNCTION "public"."create_default_dashboard_config"("p_storyteller_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_dashboard_config_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.is_storyteller = true AND (OLD.is_storyteller IS NULL OR OLD.is_storyteller = false) THEN
        PERFORM create_default_dashboard_config(NEW.id);
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_default_dashboard_config_trigger"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "full_name" "text",
    "email" "text",
    "bio" "text",
    "profile_image_url" "text",
    "cultural_background" "text",
    "preferred_pronouns" "text",
    "tenant_roles" "text"[] DEFAULT '{storyteller}'::"text"[],
    "cross_tenant_sharing" boolean DEFAULT false,
    "legacy_storyteller_id" "uuid",
    "airtable_record_id" "text",
    "geographic_connections" "jsonb" DEFAULT '[]'::"jsonb",
    "consent_given" boolean DEFAULT false,
    "consent_date" timestamp with time zone,
    "consent_version" "text" DEFAULT '1.0'::"text",
    "privacy_preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "story_visibility_level" "text" DEFAULT 'private'::"text",
    "quote_sharing_consent" boolean DEFAULT false,
    "impact_story_promotion" boolean DEFAULT false,
    "wisdom_sharing_level" "text" DEFAULT 'private'::"text",
    "open_to_mentoring" boolean DEFAULT false,
    "available_for_collaboration" boolean DEFAULT false,
    "seeking_organizational_connections" boolean DEFAULT false,
    "interested_in_peer_support" boolean DEFAULT false,
    "narrative_ownership_level" "text" DEFAULT 'full_control'::"text",
    "attribution_preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "story_use_permissions" "jsonb" DEFAULT '{}'::"jsonb",
    "platform_benefit_sharing" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_processing_consent" boolean DEFAULT false,
    "ai_consent_date" timestamp with time zone,
    "ai_consent_scope" "jsonb" DEFAULT '{}'::"jsonb",
    "generated_themes" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "display_name" "text",
    "personal_statement" "text",
    "life_motto" "text",
    "phone_number" "text",
    "date_of_birth" "date",
    "age_range" "text",
    "current_role" "text",
    "current_organization" "text",
    "years_of_experience" integer,
    "professional_summary" "text",
    "industry_sectors" "text"[],
    "profile_visibility" "text" DEFAULT 'community'::"text",
    "profile_image_alt_text" "text",
    "website_url" "text",
    "linkedin_profile_url" "text",
    "resume_url" "text",
    "legacy_organization_id" "uuid",
    "legacy_project_id" "uuid",
    "legacy_location_id" "uuid",
    "legacy_user_id" "uuid",
    "legacy_airtable_id" "text",
    "migrated_at" timestamp with time zone,
    "migration_quality_score" integer,
    "ai_enhanced_bio" "text",
    "ai_personality_insights" "jsonb",
    "ai_themes" "jsonb" DEFAULT '[]'::"jsonb",
    "basic_info_visibility" "text",
    "professional_visibility" "text",
    "cultural_identity_visibility" "text",
    "cultural_communities_visibility" "text",
    "language_communities_visibility" "text",
    "stories_visibility" "text",
    "transcripts_visibility" "text",
    "media_visibility" "text",
    "allow_ai_analysis" boolean,
    "allow_research_participation" boolean,
    "allow_community_recommendations" boolean,
    "requires_elder_review" boolean,
    "traditional_knowledge_flag" boolean,
    "cultural_protocol_level" "text",
    "profile_status" "text",
    "is_storyteller" boolean DEFAULT false,
    "is_elder" boolean DEFAULT false,
    "onboarding_completed" boolean DEFAULT true,
    "video_introduction_url" "text",
    "video_portfolio_urls" "text"[] DEFAULT '{}'::"text"[],
    "featured_video_url" "text",
    "video_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "is_featured" boolean DEFAULT false,
    "total_impact_insights" integer DEFAULT 0,
    "primary_impact_type" "text",
    "impact_confidence_score" numeric(3,2),
    "cultural_protocol_score" numeric(3,2) DEFAULT 0,
    "community_leadership_score" numeric(3,2) DEFAULT 0,
    "knowledge_transmission_score" numeric(3,2) DEFAULT 0,
    "healing_integration_score" numeric(3,2) DEFAULT 0,
    "relationship_building_score" numeric(3,2) DEFAULT 0,
    "system_navigation_score" numeric(3,2) DEFAULT 0,
    "last_impact_analysis" timestamp with time zone,
    "impact_badges" "text"[] DEFAULT '{}'::"text"[],
    "storyteller_ranking" integer,
    "analytics_preferences" "jsonb" DEFAULT '{"show_metrics": true, "privacy_level": "public", "dashboard_themes": ["impact", "network", "themes", "quotes"], "show_recommendations": true}'::"jsonb",
    "network_visibility" character varying(20) DEFAULT 'public'::character varying,
    "recommendation_opt_in" boolean DEFAULT true,
    "impact_score" numeric(5,2) DEFAULT 0.0,
    "narrative_themes" "text"[] DEFAULT '{}'::"text"[],
    "connection_strength_scores" "jsonb" DEFAULT '{}'::"jsonb",
    "impact_focus_areas" "text"[] DEFAULT '{}'::"text"[],
    "expertise_areas" "text"[] DEFAULT '{}'::"text"[],
    "collaboration_preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "storytelling_methods" "text"[] DEFAULT '{}'::"text"[],
    "community_roles" "text"[] DEFAULT '{}'::"text"[],
    "change_maker_type" "text",
    "geographic_scope" "text" DEFAULT 'local'::"text",
    "years_of_community_work" integer DEFAULT 0,
    "mentor_availability" boolean DEFAULT false,
    "speaking_availability" boolean DEFAULT false,
    "primary_organization_id" "uuid",
    "location_id" "uuid",
    "avatar_media_id" "uuid",
    "cover_media_id" "uuid",
    "first_name" "text",
    "last_name" "text",
    "preferred_name" "text",
    "pronouns" "text",
    "traditional_knowledge_keeper" boolean DEFAULT false,
    "cultural_affiliations" "text"[],
    "languages_spoken" "text"[],
    "timezone" "text",
    "storytelling_experience" "text",
    "cultural_permissions" "jsonb",
    "cultural_protocols" "jsonb",
    "social_links" "jsonb",
    "emergency_contact" "jsonb",
    "address" "jsonb",
    "dietary_requirements" "text"[],
    "accessibility_needs" "text"[],
    "preferred_communication" "text"[],
    "interests" "text"[],
    "occupation" "text",
    "job_title" "text",
    "user_id" "uuid",
    "community_role" "text",
    "phone" "text",
    "gender" "text",
    "indigenous_status" "text" DEFAULT 'Aboriginal or Torres Strait Islander'::"text",
    "location" "text" DEFAULT 'Palm Island'::"text",
    "traditional_country" "text",
    "language_group" "text",
    "storyteller_type" "text" DEFAULT 'community_member'::"text",
    "is_cultural_advisor" boolean DEFAULT false,
    "is_service_provider" boolean DEFAULT false,
    "stories_contributed" integer DEFAULT 0,
    "last_story_date" timestamp without time zone,
    "engagement_score" integer DEFAULT 0,
    "can_share_traditional_knowledge" boolean DEFAULT false,
    "face_recognition_consent" boolean DEFAULT false,
    "face_recognition_consent_date" timestamp without time zone,
    "photo_consent_contexts" "text"[],
    "show_in_directory" boolean DEFAULT true,
    "allow_messages" boolean DEFAULT true,
    "created_by" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "justicehub_enabled" boolean DEFAULT false,
    "justicehub_role" "text",
    "justicehub_featured" boolean DEFAULT false,
    "justicehub_synced_at" timestamp without time zone,
    "avatar_url" "text",
    "super_admin" boolean DEFAULT false,
    CONSTRAINT "profiles_network_visibility_check" CHECK ((("network_visibility")::"text" = ANY ((ARRAY['public'::character varying, 'network'::character varying, 'private'::character varying])::"text"[]))),
    CONSTRAINT "profiles_story_visibility_level_check" CHECK (("story_visibility_level" = ANY (ARRAY['private'::"text", 'community'::"text", 'public'::"text"]))),
    CONSTRAINT "profiles_storyteller_type_check" CHECK (("storyteller_type" = ANY (ARRAY['community_member'::"text", 'elder'::"text", 'youth'::"text", 'service_provider'::"text", 'cultural_advisor'::"text", 'visitor'::"text"]))),
    CONSTRAINT "profiles_visibility_check" CHECK (("profile_visibility" = ANY (ARRAY['public'::"text", 'community'::"text", 'private'::"text"]))),
    CONSTRAINT "profiles_wisdom_sharing_level_check" CHECK (("wisdom_sharing_level" = ANY (ARRAY['private'::"text", 'community'::"text", 'open'::"text", 'restricted'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'Storyteller and user profiles - cache refresh trigger';



COMMENT ON COLUMN "public"."profiles"."tenant_id" IS 'Primary tenant/organization this profile belongs to. Can be null for system-wide profiles.';



COMMENT ON COLUMN "public"."profiles"."email" IS 'Email address for the profile. Used for invitations and notifications.';



COMMENT ON COLUMN "public"."profiles"."tenant_roles" IS 'Array of roles within the tenant (e.g., storyteller, admin, member)';



COMMENT ON COLUMN "public"."profiles"."phone_number" IS 'Phone number for the profile. Alternative to email for some workflows.';



COMMENT ON COLUMN "public"."profiles"."profile_visibility" IS 'Overall profile visibility level following OCAP principles';



COMMENT ON COLUMN "public"."profiles"."ai_enhanced_bio" IS 'AI-generated or enhanced biography text';



COMMENT ON COLUMN "public"."profiles"."ai_personality_insights" IS 'AI-generated personality insights and analysis';



COMMENT ON COLUMN "public"."profiles"."ai_themes" IS 'AI-identified themes from user content';



COMMENT ON COLUMN "public"."profiles"."cultural_identity_visibility" IS 'Enhanced protection for cultural identity information';



COMMENT ON COLUMN "public"."profiles"."traditional_knowledge_flag" IS 'Flags content containing traditional Indigenous knowledge';



COMMENT ON COLUMN "public"."profiles"."cultural_protocol_level" IS 'Level of cultural protocol enforcement: standard, enhanced, maximum';



COMMENT ON COLUMN "public"."profiles"."profile_status" IS 'Status: active, pending_activation, pending, suspended, deleted';



COMMENT ON COLUMN "public"."profiles"."is_storyteller" IS 'Flag indicating if this profile is a storyteller';



COMMENT ON COLUMN "public"."profiles"."video_introduction_url" IS 'Primary introduction video URL for storyteller';



COMMENT ON COLUMN "public"."profiles"."video_portfolio_urls" IS 'Array of portfolio/showcase video URLs';



COMMENT ON COLUMN "public"."profiles"."featured_video_url" IS 'Featured/highlight video URL for storyteller profile';



COMMENT ON COLUMN "public"."profiles"."video_metadata" IS 'Additional video metadata like titles, descriptions, durations';



COMMENT ON COLUMN "public"."profiles"."impact_focus_areas" IS 'Community sectors this storyteller focuses on (e.g., education, health, housing, justice)';



COMMENT ON COLUMN "public"."profiles"."expertise_areas" IS 'Professional/community knowledge areas (e.g., traditional healing, youth mentorship, policy advocacy)';



COMMENT ON COLUMN "public"."profiles"."collaboration_preferences" IS 'How they prefer to work with others (meeting styles, communication preferences, etc.)';



COMMENT ON COLUMN "public"."profiles"."storytelling_methods" IS 'Preferred storytelling formats (video, audio, written, art, performance, etc.)';



COMMENT ON COLUMN "public"."profiles"."community_roles" IS 'Roles in community (elder, advocate, educator, healer, bridge-builder, etc.)';



COMMENT ON COLUMN "public"."profiles"."change_maker_type" IS 'Type of change maker (system navigator, culture keeper, bridge builder, etc.)';



COMMENT ON COLUMN "public"."profiles"."geographic_scope" IS 'Geographic scope of impact (local, regional, national, international)';



COMMENT ON COLUMN "public"."profiles"."years_of_community_work" IS 'Years of experience in community impact work';



COMMENT ON COLUMN "public"."profiles"."mentor_availability" IS 'Whether this storyteller is available to mentor others';



COMMENT ON COLUMN "public"."profiles"."speaking_availability" IS 'Whether this storyteller is available for speaking engagements';



COMMENT ON COLUMN "public"."profiles"."justicehub_enabled" IS 'Controls if profile appears on JusticeHub platform';



COMMENT ON COLUMN "public"."profiles"."justicehub_role" IS 'User role on JusticeHub (founder, leader, advocate, practitioner, researcher, lived-experience, community-member)';



COMMENT ON COLUMN "public"."profiles"."justicehub_featured" IS 'Show prominently on JusticeHub homepage';



COMMENT ON COLUMN "public"."profiles"."justicehub_synced_at" IS 'When profile was last synced to JusticeHub';



CREATE OR REPLACE FUNCTION "public"."create_profile_with_media"("p_display_name" "text", "p_full_name" "text" DEFAULT NULL::"text", "p_bio" "text" DEFAULT NULL::"text", "p_avatar_media_id" "uuid" DEFAULT NULL::"uuid", "p_cover_media_id" "uuid" DEFAULT NULL::"uuid", "p_email" "text" DEFAULT NULL::"text", "p_phone_number" "text" DEFAULT NULL::"text", "p_tenant_id" "uuid" DEFAULT NULL::"uuid", "p_is_storyteller" boolean DEFAULT false) RETURNS SETOF "public"."profiles"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  INSERT INTO profiles (
    display_name,
    full_name,
    bio,
    avatar_media_id,
    cover_media_id,
    email,
    phone_number,
    tenant_id,
    is_storyteller,
    tenant_roles,
    profile_status
  )
  VALUES (
    p_display_name,
    COALESCE(p_full_name, p_display_name),
    p_bio,
    p_avatar_media_id,
    p_cover_media_id,
    p_email,
    p_phone_number,
    p_tenant_id,
    p_is_storyteller,
    CASE WHEN p_is_storyteller THEN ARRAY['storyteller']::TEXT[] ELSE ARRAY[]::TEXT[] END,
    CASE WHEN p_email IS NOT NULL THEN 'pending_activation' ELSE 'active' END
  )
  RETURNING profiles.*;
END;
$$;


ALTER FUNCTION "public"."create_profile_with_media"("p_display_name" "text", "p_full_name" "text", "p_bio" "text", "p_avatar_media_id" "uuid", "p_cover_media_id" "uuid", "p_email" "text", "p_phone_number" "text", "p_tenant_id" "uuid", "p_is_storyteller" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_story_like_count"("story_uuid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.stories
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = story_uuid;
END;
$$;


ALTER FUNCTION "public"."decrement_story_like_count"("story_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_single_primary_media_link"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    -- Unset primary flag for other links by this storyteller
    UPDATE storyteller_media_links 
    SET is_primary = FALSE 
    WHERE storyteller_id = NEW.storyteller_id 
      AND id != NEW.id 
      AND is_primary = TRUE;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_single_primary_media_link"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."exec"("sql" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    EXECUTE sql;
END;
$$;


ALTER FUNCTION "public"."exec"("sql" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."exec"("sql" "text") IS 'Custom function to execute dynamic SQL for schema deployment';



CREATE OR REPLACE FUNCTION "public"."exec_sql"("sql" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result_info jsonb;
BEGIN
    EXECUTE sql;
    result_info := jsonb_build_object(
        'status', 'success',
        'message', 'SQL executed successfully',
        'executed_at', now()
    );
    RETURN result_info;
EXCEPTION WHEN OTHERS THEN
    result_info := jsonb_build_object(
        'status', 'error',
        'message', SQLERRM,
        'error_code', SQLSTATE,
        'executed_at', now()
    );
    RETURN result_info;
END;
$$;


ALTER FUNCTION "public"."exec_sql"("sql" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."exec_sql"("sql" "text") IS 'Custom function to execute dynamic SQL with error handling and result info';



CREATE OR REPLACE FUNCTION "public"."expire_pending_requests"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE story_syndication_requests
  SET status = 'expired'
  WHERE status = 'pending'
  AND expires_at < now();
END;
$$;


ALTER FUNCTION "public"."expire_pending_requests"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."extract_descript_id"("url" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    video_id TEXT;
BEGIN
    -- Extract from share.descript.com/view/VIDEO_ID
    video_id := substring(url from 'share\.descript\.com/view/([a-zA-Z0-9_-]+)');

    -- Extract from share.descript.com/embed/VIDEO_ID
    IF video_id IS NULL THEN
        video_id := substring(url from 'share\.descript\.com/embed/([a-zA-Z0-9_-]+)');
    END IF;

    RETURN video_id;
END;
$$;


ALTER FUNCTION "public"."extract_descript_id"("url" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."extract_descript_id"("url" "text") IS 'Extracts video ID from Descript share URLs';



CREATE OR REPLACE FUNCTION "public"."extract_youtube_id"("url" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    video_id TEXT;
BEGIN
    -- Extract from youtube.com/watch?v=VIDEO_ID
    video_id := substring(url from 'watch\?v=([a-zA-Z0-9_-]+)');

    -- Extract from youtu.be/VIDEO_ID
    IF video_id IS NULL THEN
        video_id := substring(url from 'youtu\.be/([a-zA-Z0-9_-]+)');
    END IF;

    -- Extract from youtube.com/embed/VIDEO_ID
    IF video_id IS NULL THEN
        video_id := substring(url from 'embed/([a-zA-Z0-9_-]+)');
    END IF;

    RETURN video_id;
END;
$$;


ALTER FUNCTION "public"."extract_youtube_id"("url" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."find_collaborators"("user_tenant_id" "uuid", "skill_keywords" "text"[] DEFAULT NULL::"text"[], "collaboration_type" "text" DEFAULT 'any'::"text") RETURNS TABLE("profile_id" "uuid", "full_name" "text", "skills_match" "text"[], "collaboration_available" boolean, "mentoring_available" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        CASE 
            WHEN skill_keywords IS NOT NULL THEN
                array(select unnest(p.skills_discovered) intersect select unnest(skill_keywords))
            ELSE p.skills_discovered
        END as skills_match,
        p.available_for_collaboration,
        p.open_to_mentoring
    FROM public.profiles p
    WHERE p.tenant_id = user_tenant_id
    AND p.id != auth.uid()
    AND (
        (collaboration_type = 'collaboration' AND p.available_for_collaboration = true) OR
        (collaboration_type = 'mentoring' AND p.open_to_mentoring = true) OR
        (collaboration_type = 'any' AND (p.available_for_collaboration = true OR p.open_to_mentoring = true))
    )
    AND (
        skill_keywords IS NULL OR 
        p.skills_discovered && skill_keywords OR
        p.expertise_areas && skill_keywords
    );
END;
$$;


ALTER FUNCTION "public"."find_collaborators"("user_tenant_id" "uuid", "skill_keywords" "text"[], "collaboration_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."find_storyteller_connections"("p_storyteller_id" "uuid", "p_connection_types" "text"[] DEFAULT ARRAY['narrative_similarity'::"text", 'thematic'::"text", 'geographic'::"text"], "p_min_strength" numeric DEFAULT 0.3, "p_limit" integer DEFAULT 20) RETURNS TABLE("connection_id" "uuid", "potential_connection_id" "uuid", "connection_type" character varying, "strength" numeric, "shared_themes" "text"[], "reason" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        sc.id,
        CASE
            WHEN sc.storyteller_a_id = p_storyteller_id THEN sc.storyteller_b_id
            ELSE sc.storyteller_a_id
        END,
        sc.connection_type,
        sc.connection_strength,
        sc.shared_themes,
        sc.ai_reasoning
    FROM storyteller_connections sc
    WHERE (sc.storyteller_a_id = p_storyteller_id OR sc.storyteller_b_id = p_storyteller_id)
      AND sc.connection_type = ANY(p_connection_types)
      AND sc.connection_strength >= p_min_strength
      AND sc.status = 'suggested'
    ORDER BY sc.connection_strength DESC, sc.created_at DESC
    LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."find_storyteller_connections"("p_storyteller_id" "uuid", "p_connection_types" "text"[], "p_min_strength" numeric, "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_descript_embed"("video_id" "text", "width" "text" DEFAULT '100%'::"text", "height" "text" DEFAULT '400'::"text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN format(
        '<iframe src="https://share.descript.com/embed/%s" ' ||
        'width="%s" height="%s" frameborder="0" allowfullscreen></iframe>',
        video_id, width, height
    );
END;
$$;


ALTER FUNCTION "public"."generate_descript_embed"("video_id" "text", "width" "text", "height" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_descript_embed"("video_id" "text", "width" "text", "height" "text") IS 'Generates iframe embed code for Descript videos';



CREATE OR REPLACE FUNCTION "public"."generate_youtube_embed"("video_id" "text", "width" "text" DEFAULT '100%'::"text", "height" "text" DEFAULT '400'::"text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN format(
        '<iframe width="%s" height="%s" src="https://www.youtube.com/embed/%s" ' ||
        'title="YouTube video player" frameborder="0" ' ||
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' ||
        'allowfullscreen></iframe>',
        width, height, video_id
    );
END;
$$;


ALTER FUNCTION "public"."generate_youtube_embed"("video_id" "text", "width" "text", "height" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_database_schema"() RETURNS TABLE("table_name" "text", "column_count" bigint, "has_rls" boolean, "row_count" bigint, "table_size" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tablename::TEXT as table_name,
    (
      SELECT COUNT(*)::BIGINT
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = t.tablename
    ) as column_count,
    (
      SELECT COUNT(*) > 0
      FROM pg_policies p
      WHERE p.schemaname = 'public'
        AND p.tablename = t.tablename
    ) as has_rls,
    (
      SELECT COALESCE(reltuples::BIGINT, 0)
      FROM pg_class
      WHERE oid = ('public.' || t.tablename)::regclass
    ) as row_count,
    (
      SELECT pg_size_pretty(pg_total_relation_size(('public.' || t.tablename)::regclass))
      FROM pg_class
      WHERE oid = ('public.' || t.tablename)::regclass
      LIMIT 1
    ) as table_size
  FROM pg_tables t
  WHERE t.schemaname = 'public'
  ORDER BY t.tablename;
END;
$$;


ALTER FUNCTION "public"."get_database_schema"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_database_schema"() IS 'Returns list of all tables with metadata (column count, RLS status, row count, size)';



CREATE OR REPLACE FUNCTION "public"."get_database_stats"() RETURNS TABLE("total_tables" bigint, "total_columns" bigint, "total_indexes" bigint, "total_functions" bigint, "total_policies" bigint, "database_size" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::BIGINT FROM pg_tables WHERE schemaname = 'public') as total_tables,
    (SELECT COUNT(*)::BIGINT FROM information_schema.columns WHERE table_schema = 'public') as total_columns,
    (SELECT COUNT(*)::BIGINT FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
    (SELECT COUNT(*)::BIGINT FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public') as total_functions,
    (SELECT COUNT(*)::BIGINT FROM pg_policies WHERE schemaname = 'public') as total_policies,
    (SELECT pg_size_pretty(pg_database_size(current_database()))) as database_size;
END;
$$;


ALTER FUNCTION "public"."get_database_stats"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_database_stats"() IS 'Returns overall database statistics';



CREATE OR REPLACE FUNCTION "public"."get_justicehub_organizations"() RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "type" "text", "justicehub_synced_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.name,
    o.slug,
    o.type,
    o.justicehub_synced_at
  FROM organizations o
  WHERE o.justicehub_enabled = true
  ORDER BY o.name ASC;
END;
$$;


ALTER FUNCTION "public"."get_justicehub_organizations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_justicehub_profiles"() RETURNS TABLE("id" "uuid", "email" "text", "display_name" "text", "full_name" "text", "bio" "text", "profile_image_url" "text", "cultural_background" "text", "justicehub_role" "text", "justicehub_featured" boolean, "justicehub_synced_at" timestamp with time zone, "is_elder" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.display_name,
    p.full_name,
    p.bio,
    p.profile_image_url,
    p.cultural_background,
    p.justicehub_role,
    p.justicehub_featured,
    p.justicehub_synced_at,
    p.is_elder
  FROM profiles p
  WHERE p.justicehub_enabled = true
  ORDER BY p.justicehub_featured DESC, p.display_name ASC;
END;
$$;


ALTER FUNCTION "public"."get_justicehub_profiles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_justicehub_projects"() RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "description" "text", "organization_id" "uuid", "justicehub_program_type" "text", "justicehub_synced_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    p.organization_id,
    p.justicehub_program_type,
    p.justicehub_synced_at
  FROM projects p
  WHERE p.justicehub_enabled = true
  ORDER BY p.name ASC;
END;
$$;


ALTER FUNCTION "public"."get_justicehub_projects"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_organization_stats"("org_uuid" "uuid") RETURNS TABLE("total_members" integer, "active_services" integer, "total_stories" integer, "stories_this_year" integer, "total_reports" integer, "published_reports" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM organization_members 
     WHERE organization_id = org_uuid AND is_active = true),
    (SELECT COUNT(*)::INTEGER FROM organization_services 
     WHERE organization_id = org_uuid AND is_active = true),
    (SELECT COUNT(*)::INTEGER FROM stories 
     WHERE organization_id = org_uuid),
    (SELECT COUNT(*)::INTEGER FROM stories 
     WHERE organization_id = org_uuid 
     AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)),
    (SELECT COUNT(*)::INTEGER FROM annual_reports 
     WHERE organization_id = org_uuid),
    (SELECT COUNT(*)::INTEGER FROM annual_reports 
     WHERE organization_id = org_uuid AND status = 'published');
END;
$$;


ALTER FUNCTION "public"."get_organization_stats"("org_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_project_context"("p_project_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_context_model TEXT;
  v_result JSONB;
BEGIN
  -- Get context model type
  SELECT context_model INTO v_context_model
  FROM projects
  WHERE id = p_project_id;

  IF v_context_model = 'quick' THEN
    -- Return simple description
    SELECT jsonb_build_object(
      'model', 'quick',
      'description', context_description
    ) INTO v_result
    FROM projects
    WHERE id = p_project_id;

  ELSIF v_context_model = 'full' THEN
    -- Return full profile
    SELECT jsonb_build_object(
      'model', 'full',
      'mission', pp.mission,
      'primary_goals', pp.primary_goals,
      'key_activities', pp.key_activities,
      'outcome_categories', pp.outcome_categories,
      'success_indicators', pp.success_indicators,
      'positive_language', pp.positive_language,
      'cultural_values', pp.cultural_values,
      'cultural_approaches', pp.cultural_approaches
    ) INTO v_result
    FROM project_profiles pp
    WHERE pp.project_id = p_project_id;

  ELSE
    -- No context
    v_result := jsonb_build_object('model', 'none');
  END IF;

  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."get_project_context"("p_project_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_project_context"("p_project_id" "uuid") IS 'Returns project context in format suitable for AI analysis';



CREATE OR REPLACE FUNCTION "public"."get_service_summary"("p_service_area" "text", "p_organization_id" "uuid", "p_start_date" "date" DEFAULT NULL::"date", "p_end_date" "date" DEFAULT NULL::"date") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'service_area', p_service_area,
        'total_activities', COUNT(DISTINCT a.id),
        'total_participants', SUM(a.participant_count),
        'total_outcomes', COUNT(DISTINCT o.id),
        'outcomes_achieved', COUNT(DISTINCT o.id) FILTER (WHERE o.current_value >= o.target_value),
        'average_progress', AVG(calculate_outcome_progress(o.id))
    )
    INTO result
    FROM public.activities a
    LEFT JOIN public.outcomes o ON o.service_area = a.service_area
    WHERE a.service_area = p_service_area
        AND a.organization_id = p_organization_id
        AND (p_start_date IS NULL OR a.activity_date >= p_start_date)
        AND (p_end_date IS NULL OR a.activity_date <= p_end_date);

    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_service_summary"("p_service_area" "text", "p_organization_id" "uuid", "p_start_date" "date", "p_end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_stories_for_report"("org_uuid" "uuid", "year_value" integer, "limit_count" integer DEFAULT 50) RETURNS TABLE("story_id" "uuid", "story_title" "text", "category" "text", "impact_score" integer, "relevance_score" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id as story_id,
    s.title as story_title,
    s.category,
    (s.views + s.shares * 2 + s.likes) as impact_score,
    CASE 
      WHEN s.is_featured THEN 1.0
      WHEN s.is_verified THEN 0.9
      WHEN s.contains_traditional_knowledge THEN 0.8
      ELSE 0.7
    END as relevance_score
  FROM stories s
  WHERE s.organization_id = org_uuid
    AND s.status = 'published'
    AND EXTRACT(YEAR FROM s.created_at) = year_value
  ORDER BY relevance_score DESC, impact_score DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_stories_for_report"("org_uuid" "uuid", "year_value" integer, "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_story_media_path"("story_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT s.tenant_id::text || '/' || s.id::text
        FROM public.stories s
        WHERE s.id = story_id
        AND s.author_id = auth.uid()
    );
END;
$$;


ALTER FUNCTION "public"."get_story_media_path"("story_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_storyteller_dashboard_summary"("p_storyteller_id" "uuid") RETURNS TABLE("total_stories" integer, "total_connections" integer, "impact_score" numeric, "top_themes" "text"[], "recent_activity_count" integer, "pending_recommendations" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    WITH storyteller_stats AS (
        SELECT
            sa.total_stories,
            sa.connection_count,
            sim.overall_impact_score,
            sa.primary_themes
        FROM storyteller_analytics sa
        LEFT JOIN storyteller_impact_metrics sim ON sa.storyteller_id = sim.storyteller_id
        WHERE sa.storyteller_id = p_storyteller_id
    ),
    recent_activity AS (
        SELECT COUNT(*) as activity_count
        FROM storyteller_engagement se
        WHERE se.storyteller_id = p_storyteller_id
          AND se.period_start >= NOW() - INTERVAL '7 days'
    ),
    pending_recs AS (
        SELECT COUNT(*) as rec_count
        FROM storyteller_recommendations sr
        WHERE sr.storyteller_id = p_storyteller_id
          AND sr.status = 'active'
    )
    SELECT
        COALESCE(ss.total_stories, 0),
        COALESCE(ss.connection_count, 0),
        COALESCE(ss.overall_impact_score, 0.0),
        COALESCE(ss.primary_themes, ARRAY[]::TEXT[]),
        COALESCE(ra.activity_count, 0)::INTEGER,
        COALESCE(pr.rec_count, 0)::INTEGER
    FROM storyteller_stats ss
    CROSS JOIN recent_activity ra
    CROSS JOIN pending_recs pr;
END;
$$;


ALTER FUNCTION "public"."get_storyteller_dashboard_summary"("p_storyteller_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_storyteller_media_links"("storyteller_uuid" "uuid") RETURNS TABLE("id" "uuid", "title" character varying, "url" "text", "description" "text", "link_type" character varying, "video_stage" character varying, "platform" character varying, "duration_seconds" integer, "thumbnail_url" "text", "tags" "text"[], "is_primary" boolean, "is_public" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sml.id,
    sml.title,
    sml.url,
    sml.description,
    sml.link_type,
    sml.video_stage,
    sml.platform,
    sml.duration_seconds,
    sml.thumbnail_url,
    sml.tags,
    sml.is_primary,
    sml.is_public,
    sml.created_at,
    sml.updated_at
  FROM storyteller_media_links sml
  WHERE sml.storyteller_id = storyteller_uuid
    AND sml.is_public = TRUE
  ORDER BY 
    sml.is_primary DESC,
    sml.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_storyteller_media_links"("storyteller_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_storyteller_recommendations"("p_storyteller_id" "uuid", "p_recommendation_types" "text"[] DEFAULT ARRAY['connection'::"text", 'story_idea'::"text", 'collaboration'::"text"], "p_min_relevance" numeric DEFAULT 0.5, "p_limit" integer DEFAULT 10) RETURNS TABLE("recommendation_id" "uuid", "rec_type" character varying, "title" character varying, "description" "text", "relevance_score" numeric, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        sr.id,
        sr.recommendation_type,
        sr.title,
        sr.description,
        sr.relevance_score,
        sr.created_at
    FROM storyteller_recommendations sr
    WHERE sr.storyteller_id = p_storyteller_id
      AND sr.recommendation_type = ANY(p_recommendation_types)
      AND sr.relevance_score >= p_min_relevance
      AND sr.status = 'active'
      AND (sr.expires_at IS NULL OR sr.expires_at > NOW())
    ORDER BY sr.priority_score DESC, sr.relevance_score DESC, sr.created_at DESC
    LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."get_storyteller_recommendations"("p_storyteller_id" "uuid", "p_recommendation_types" "text"[], "p_min_relevance" numeric, "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_storyteller_syndication_stats"("p_storyteller_id" "uuid") RETURNS TABLE("app_name" "text", "app_display_name" "text", "total_stories_shared" bigint, "total_views" bigint, "last_accessed" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    ea.app_name,
    ea.app_display_name,
    COUNT(DISTINCT ssc.story_id)::BIGINT AS total_stories_shared,
    COALESCE(SUM(access_counts.view_count), 0)::BIGINT AS total_views,
    MAX(access_counts.last_access) AS last_accessed
  FROM external_applications ea
  LEFT JOIN story_syndication_consent ssc ON ea.id = ssc.app_id
    AND ssc.storyteller_id = p_storyteller_id
    AND ssc.consent_granted = true
    AND ssc.consent_revoked_at IS NULL
  LEFT JOIN (
    SELECT
      sal.app_id,
      sal.story_id,
      COUNT(*) AS view_count,
      MAX(sal.accessed_at) AS last_access
    FROM story_access_log sal
    JOIN stories s ON sal.story_id = s.id
    WHERE s.storyteller_id = p_storyteller_id
    GROUP BY sal.app_id, sal.story_id
  ) access_counts ON ea.id = access_counts.app_id AND ssc.story_id = access_counts.story_id
  WHERE ea.is_active = true
  GROUP BY ea.app_name, ea.app_display_name
  ORDER BY total_stories_shared DESC;
END;
$$;


ALTER FUNCTION "public"."get_storyteller_syndication_stats"("p_storyteller_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_storyteller_top_themes"("p_storyteller_id" "uuid", "p_limit" integer DEFAULT 10) RETURNS TABLE("theme_name" "text", "prominence_score" numeric, "frequency_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        nt.theme_name,
        st.prominence_score,
        st.frequency_count
    FROM storyteller_themes st
    JOIN narrative_themes nt ON st.theme_id = nt.id
    WHERE st.storyteller_id = p_storyteller_id
    ORDER BY st.prominence_score DESC, st.frequency_count DESC
    LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."get_storyteller_top_themes"("p_storyteller_id" "uuid", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_syndicated_stories_for_app"("target_app_name" "text") RETURNS TABLE("story_id" "uuid", "title" "text", "content" "text", "storyteller_name" "text", "story_type" "text", "themes" "text"[], "story_date" timestamp with time zone, "cultural_restrictions" "jsonb", "share_media" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    ss.story_id,
    ss.title,
    ss.content,
    ss.storyteller_name,
    ss.story_type,
    ss.themes,
    ss.story_date,
    ss.cultural_restrictions,
    ss.share_media
  FROM syndicated_stories ss
  WHERE ss.requesting_app = target_app_name
  ORDER BY ss.story_date DESC;
END;
$$;


ALTER FUNCTION "public"."get_syndicated_stories_for_app"("target_app_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_table_columns"("p_table_name" "text") RETURNS TABLE("column_name" "text", "data_type" "text", "is_nullable" "text", "column_default" "text", "is_primary_key" boolean, "is_foreign_key" boolean, "foreign_table" "text", "foreign_column" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.column_name::TEXT,
    c.data_type::TEXT,
    c.is_nullable::TEXT,
    c.column_default::TEXT,
    EXISTS (
      SELECT 1
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = p_table_name
        AND tc.constraint_type = 'PRIMARY KEY'
        AND kcu.column_name = c.column_name
    ) as is_primary_key,
    EXISTS (
      SELECT 1
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = p_table_name
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = c.column_name
    ) as is_foreign_key,
    (
      SELECT ccu.table_name::TEXT
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = p_table_name
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = c.column_name
      LIMIT 1
    ) as foreign_table,
    (
      SELECT ccu.column_name::TEXT
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = p_table_name
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = c.column_name
      LIMIT 1
    ) as foreign_column
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = p_table_name
  ORDER BY c.ordinal_position;
END;
$$;


ALTER FUNCTION "public"."get_table_columns"("p_table_name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_table_columns"("p_table_name" "text") IS 'Returns detailed column information for a specific table';



CREATE OR REPLACE FUNCTION "public"."get_table_policies"("p_table_name" "text") RETURNS TABLE("policy_name" "text", "policy_command" "text", "policy_roles" "text"[], "policy_qual" "text", "policy_check" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.policyname::TEXT as policy_name,
    p.cmd::TEXT as policy_command,
    p.roles::TEXT[] as policy_roles,
    p.qual::TEXT as policy_qual,
    p.with_check::TEXT as policy_check
  FROM pg_policies p
  WHERE p.schemaname = 'public'
    AND p.tablename = p_table_name
  ORDER BY p.policyname;
END;
$$;


ALTER FUNCTION "public"."get_table_policies"("p_table_name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_table_policies"("p_table_name" "text") IS 'Returns all RLS policies for a specific table';



CREATE OR REPLACE FUNCTION "public"."get_table_relationships"() RETURNS TABLE("from_table" "text", "from_column" "text", "to_table" "text", "to_column" "text", "constraint_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    kcu.table_name::TEXT as from_table,
    kcu.column_name::TEXT as from_column,
    ccu.table_name::TEXT as to_table,
    ccu.column_name::TEXT as to_column,
    tc.constraint_name::TEXT
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
  ORDER BY kcu.table_name, kcu.column_name;
END;
$$;


ALTER FUNCTION "public"."get_table_relationships"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_table_relationships"() IS 'Returns all foreign key relationships in the database';



CREATE OR REPLACE FUNCTION "public"."get_transcripts_with_source_video"("org_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("transcript_id" "uuid", "title" character varying, "storyteller_name" "text", "source_video_url" "text", "source_video_title" character varying, "source_video_platform" character varying, "source_video_duration" integer, "has_source_video" boolean)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    p.full_name,
    t.source_video_url,
    t.source_video_title,
    t.source_video_platform,
    t.source_video_duration,
    CASE WHEN t.source_video_url IS NOT NULL THEN TRUE ELSE FALSE END
  FROM transcripts t
  LEFT JOIN profiles p ON t.storyteller_id = p.id
  WHERE (org_id IS NULL OR t.organization_id = org_id)
  ORDER BY t.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_transcripts_with_source_video"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_organization_role"("org_id" "uuid", "user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS "public"."organization_role"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM organization_roles 
    WHERE organization_id = org_id 
      AND profile_id = user_id 
      AND is_active = true
    LIMIT 1
  );
END;
$$;


ALTER FUNCTION "public"."get_user_organization_role"("org_id" "uuid", "user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_organization_role"("org_id" "uuid", "user_id" "uuid") IS 'Returns the active role of a user in an organization';



CREATE OR REPLACE FUNCTION "public"."get_user_storage_path"("bucket_name" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT tenant_id::text || '/' || auth.uid()::text
        FROM public.profiles 
        WHERE id = auth.uid()
    );
END;
$$;


ALTER FUNCTION "public"."get_user_storage_path"("bucket_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_tenant_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT tenant_id 
        FROM public.profiles 
        WHERE id = auth.uid()
    );
END;
$$;


ALTER FUNCTION "public"."get_user_tenant_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role, permissions, is_active, project_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'contributor'),
        COALESCE(
            ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'permissions')),
            ARRAY[]::TEXT[]
        ),
        COALESCE((NEW.raw_user_meta_data->>'is_active')::BOOLEAN, true),
        COALESCE((NEW.raw_user_meta_data->>'project_id')::UUID, NULL)
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_organization_role_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Update the updated_at timestamp
  NEW.updated_at = NOW();
  
  -- If revoking a role, set revoked_at
  IF OLD.is_active = true AND NEW.is_active = false THEN
    NEW.revoked_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_organization_role_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_request_approval"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Create consent record
    INSERT INTO story_syndication_consent (
      story_id,
      app_id,
      consent_granted,
      share_full_content,
      share_summary_only,
      consent_granted_at
    ) VALUES (
      NEW.story_id,
      NEW.app_id,
      true,
      (SELECT allow_full_content FROM partner_projects WHERE id = NEW.project_id),
      NOT (SELECT allow_full_content FROM partner_projects WHERE id = NEW.project_id),
      now()
    )
    ON CONFLICT (story_id, app_id) DO UPDATE SET
      consent_granted = true,
      consent_revoked_at = NULL,
      consent_granted_at = now()
    RETURNING id INTO NEW.consent_id;

    NEW.responded_at = now();
  END IF;

  IF NEW.status = 'revoked' AND OLD.status = 'approved' THEN
    -- Update consent record
    UPDATE story_syndication_consent
    SET consent_granted = false,
        consent_revoked_at = now()
    WHERE id = OLD.consent_id;

    NEW.responded_at = now();
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_request_approval"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_distribution_view"("distribution_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.story_distributions
  SET
    view_count = view_count + 1,
    last_viewed_at = NOW()
  WHERE id = distribution_id;
END;
$$;


ALTER FUNCTION "public"."increment_distribution_view"("distribution_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_embed_usage"("p_token_hash" "text", "p_domain" "text", "p_ip" "inet") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_token_id UUID;
BEGIN
  UPDATE public.embed_tokens
  SET
    usage_count = usage_count + 1,
    last_used_at = NOW(),
    last_used_domain = p_domain,
    last_used_ip = p_ip
  WHERE token_hash = p_token_hash AND status = 'active'
  RETURNING id INTO v_token_id;

  RETURN v_token_id;
END;
$$;


ALTER FUNCTION "public"."increment_embed_usage"("p_token_hash" "text", "p_domain" "text", "p_ip" "inet") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_media_view_count"("asset_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.media_assets 
  SET view_count = view_count + 1,
      last_accessed_at = NOW()
  WHERE id = asset_id;
END;
$$;


ALTER FUNCTION "public"."increment_media_view_count"("asset_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_story_like_count"("story_uuid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.stories
  SET likes_count = likes_count + 1
  WHERE id = story_uuid;
END;
$$;


ALTER FUNCTION "public"."increment_story_like_count"("story_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_story_share_count"("story_uuid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.stories
  SET shares_count = shares_count + 1
  WHERE id = story_uuid;
END;
$$;


ALTER FUNCTION "public"."increment_story_share_count"("story_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_story_view_count"("story_uuid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.stories
  SET views_count = views_count + 1
  WHERE id = story_uuid;
END;
$$;


ALTER FUNCTION "public"."increment_story_view_count"("story_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_template_usage"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE report_templates
  SET usage_count = usage_count + 1
  WHERE template_name = NEW.template_name;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."increment_template_usage"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_act_admin"("user_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM act_admin_permissions
    WHERE user_id = user_uuid
    AND is_active = TRUE
  );
END;
$$;


ALTER FUNCTION "public"."is_act_admin"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT raw_user_meta_data->>'role' = 'admin'
        FROM auth.users
        WHERE id = auth.uid()
    );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_story_syndicated"("p_story_id" "uuid", "p_app_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM syndicated_stories ss
    WHERE ss.story_id = p_story_id
    AND ss.requesting_app = p_app_name
  );
END;
$$;


ALTER FUNCTION "public"."is_story_syndicated"("p_story_id" "uuid", "p_app_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_activity"("p_user_id" "uuid", "p_user_name" "text", "p_user_role" "text", "p_action" "text", "p_action_category" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_entity_title" "text", "p_details" "jsonb" DEFAULT '{}'::"jsonb", "p_organization_id" "uuid" DEFAULT NULL::"uuid", "p_requires_attention" boolean DEFAULT false) RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO activity_log (
    user_id, user_name, user_role, action, action_category,
    entity_type, entity_id, entity_title, details, organization_id, requires_attention
  ) VALUES (
    p_user_id, p_user_name, p_user_role, p_action, p_action_category,
    p_entity_type, p_entity_id, p_entity_title, p_details, p_organization_id, p_requires_attention
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;


ALTER FUNCTION "public"."log_activity"("p_user_id" "uuid", "p_user_name" "text", "p_user_role" "text", "p_action" "text", "p_action_category" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_entity_title" "text", "p_details" "jsonb", "p_organization_id" "uuid", "p_requires_attention" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_ready_to_publish"("entry_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE empathy_entries
    SET ready_to_publish = TRUE,
        publish_status = 'ready',
        updated_at = NOW()
    WHERE id = entry_id;

    -- Create approval queue entry
    INSERT INTO content_approval_queue (
        empathy_entry_id,
        content_type,
        title,
        summary,
        status,
        submitted_at
    )
    SELECT
        id,
        'story',
        title,
        LEFT(narrative, 200),
        'pending',
        NOW()
    FROM empathy_entries
    WHERE id = entry_id;
END;
$$;


ALTER FUNCTION "public"."mark_ready_to_publish"("entry_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."migrate_locations_from_profiles"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  profile_record RECORD;
  location_name TEXT;
  new_location_id UUID;
  inserted_count INTEGER := 0;
BEGIN
  FOR profile_record IN 
    SELECT id, tenant_id, geographic_connections, cultural_communities
    FROM public.profiles 
    WHERE tenant_id IS NOT NULL 
    AND (
      jsonb_array_length(COALESCE(geographic_connections, '[]'::jsonb)) > 0 OR
      jsonb_array_length(COALESCE(cultural_communities, '[]'::jsonb)) > 0
    )
  LOOP
    -- Extract from geographic_connections
    IF profile_record.geographic_connections IS NOT NULL THEN
      FOR location_name IN SELECT jsonb_array_elements_text(profile_record.geographic_connections)
      LOOP
        INSERT INTO public.locations (tenant_id, name, location_type, cultural_significance)
        VALUES (profile_record.tenant_id, location_name, 'community', 'From storyteller geographic connections')
        ON CONFLICT (tenant_id, name) DO NOTHING
        RETURNING id INTO new_location_id;
        
        IF new_location_id IS NULL THEN
          SELECT id INTO new_location_id FROM public.locations 
          WHERE tenant_id = profile_record.tenant_id AND name = location_name;
        END IF;
        
        INSERT INTO public.storyteller_locations (storyteller_id, location_id, tenant_id, relationship_type)
        VALUES (profile_record.id, new_location_id, profile_record.tenant_id, 'geographic_connection')
        ON CONFLICT (storyteller_id, location_id) DO NOTHING;
        
        inserted_count := inserted_count + 1;
      END LOOP;
    END IF;
    
    -- Extract from cultural_communities  
    IF profile_record.cultural_communities IS NOT NULL THEN
      FOR location_name IN SELECT jsonb_array_elements_text(profile_record.cultural_communities)
      LOOP
        INSERT INTO public.locations (tenant_id, name, location_type, cultural_significance)
        VALUES (profile_record.tenant_id, location_name, 'cultural', 'From storyteller cultural communities')
        ON CONFLICT (tenant_id, name) DO NOTHING
        RETURNING id INTO new_location_id;
        
        IF new_location_id IS NULL THEN
          SELECT id INTO new_location_id FROM public.locations 
          WHERE tenant_id = profile_record.tenant_id AND name = location_name;
        END IF;
        
        INSERT INTO public.storyteller_locations (storyteller_id, location_id, tenant_id, relationship_type)
        VALUES (profile_record.id, new_location_id, profile_record.tenant_id, 'cultural_community')
        ON CONFLICT (storyteller_id, location_id) DO NOTHING;
        
        inserted_count := inserted_count + 1;
      END LOOP;
    END IF;
    
  END LOOP;
  
  RETURN inserted_count;
END;
$$;


ALTER FUNCTION "public"."migrate_locations_from_profiles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."migrate_organizations_from_profiles"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  profile_record RECORD;
  org_name TEXT;
  org_id UUID;
  inserted_count INTEGER := 0;
BEGIN
  -- Loop through all profiles with organization data
  FOR profile_record IN 
    SELECT id, tenant_id, organizations_mentioned, affiliations_expressed, partnerships_described
    FROM public.profiles 
    WHERE tenant_id IS NOT NULL 
    AND (
      jsonb_array_length(COALESCE(organizations_mentioned, '[]'::jsonb)) > 0 OR
      jsonb_array_length(COALESCE(affiliations_expressed, '[]'::jsonb)) > 0 OR
      jsonb_array_length(COALESCE(partnerships_described, '[]'::jsonb)) > 0
    )
  LOOP
    -- Extract from organizations_mentioned
    IF profile_record.organizations_mentioned IS NOT NULL THEN
      FOR org_name IN SELECT jsonb_array_elements_text(profile_record.organizations_mentioned)
      LOOP
        -- Insert organization if not exists
        INSERT INTO public.organizations (tenant_id, name, type, description)
        VALUES (profile_record.tenant_id, org_name, 'community', 'Extracted from storyteller profiles')
        ON CONFLICT (tenant_id, name) DO NOTHING
        RETURNING id INTO org_id;
        
        -- Get the org_id if it already existed
        IF org_id IS NULL THEN
          SELECT id INTO org_id FROM public.organizations 
          WHERE tenant_id = profile_record.tenant_id AND name = org_name;
        END IF;
        
        -- Create relationship
        INSERT INTO public.storyteller_organizations (storyteller_id, organization_id, tenant_id, relationship_type)
        VALUES (profile_record.id, org_id, profile_record.tenant_id, 'mentioned')
        ON CONFLICT (storyteller_id, organization_id) DO NOTHING;
        
        inserted_count := inserted_count + 1;
      END LOOP;
    END IF;
    
    -- Extract from affiliations_expressed
    IF profile_record.affiliations_expressed IS NOT NULL THEN
      FOR org_name IN SELECT jsonb_array_elements_text(profile_record.affiliations_expressed)
      LOOP
        INSERT INTO public.organizations (tenant_id, name, type, description)
        VALUES (profile_record.tenant_id, org_name, 'affiliation', 'From storyteller affiliations')
        ON CONFLICT (tenant_id, name) DO NOTHING
        RETURNING id INTO org_id;
        
        IF org_id IS NULL THEN
          SELECT id INTO org_id FROM public.organizations 
          WHERE tenant_id = profile_record.tenant_id AND name = org_name;
        END IF;
        
        INSERT INTO public.storyteller_organizations (storyteller_id, organization_id, tenant_id, relationship_type)
        VALUES (profile_record.id, org_id, profile_record.tenant_id, 'affiliated')
        ON CONFLICT (storyteller_id, organization_id) DO NOTHING;
        
        inserted_count := inserted_count + 1;
      END LOOP;
    END IF;
    
  END LOOP;
  
  RETURN inserted_count;
END;
$$;


ALTER FUNCTION "public"."migrate_organizations_from_profiles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_elder_review_assigned"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- This function can be extended to call a webhook or queue a notification
  -- For now, it just logs the assignment
  IF NEW.assigned_elder_id IS NOT NULL AND (OLD.assigned_elder_id IS NULL OR OLD.assigned_elder_id != NEW.assigned_elder_id) THEN
    RAISE NOTICE 'Elder review assigned: % to elder %', NEW.id, NEW.assigned_elder_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_elder_review_assigned"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_tenant_analytics"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.tenant_analytics;
END;
$$;


ALTER FUNCTION "public"."refresh_tenant_analytics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reject_content"("queue_id" "uuid", "reviewer_id" "uuid", "reason" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE content_approval_queue
    SET status = 'rejected',
        reviewed_by = reviewer_id,
        reviewed_at = NOW(),
        review_notes = reason
    WHERE id = queue_id;

    -- Update empathy entry
    UPDATE empathy_entries
    SET publish_status = 'rejected',
        rejection_reason = reason
    WHERE id = (SELECT empathy_entry_id FROM content_approval_queue WHERE id = queue_id);
END;
$$;


ALTER FUNCTION "public"."reject_content"("queue_id" "uuid", "reviewer_id" "uuid", "reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."restore_story"("p_story_id" "uuid", "p_restored_by" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.stories
  SET
    is_archived = false,
    archived_at = NULL,
    archived_by = NULL,
    archive_reason = NULL,
    status = 'draft' -- Return to draft status for review
  WHERE id = p_story_id
    AND is_archived = true
    AND (author_id = p_restored_by OR storyteller_id = p_restored_by);

  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."restore_story"("p_story_id" "uuid", "p_restored_by" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."revoke_all_story_distributions"("p_story_id" "uuid", "p_revoked_by" "uuid", "p_reason" "text" DEFAULT 'Story revoked by owner'::"text") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.story_distributions
  SET
    status = 'revoked',
    revoked_at = NOW(),
    revoked_by = p_revoked_by,
    revocation_reason = p_reason
  WHERE story_id = p_story_id AND status = 'active';

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Also revoke all embed tokens
  UPDATE public.embed_tokens
  SET
    status = 'revoked',
    revoked_at = NOW(),
    revoked_by = p_revoked_by,
    revocation_reason = p_reason
  WHERE story_id = p_story_id AND status = 'active';

  RETURN v_count;
END;
$$;


ALTER FUNCTION "public"."revoke_all_story_distributions"("p_story_id" "uuid", "p_revoked_by" "uuid", "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."revoke_tokens_on_story_withdrawal"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- If story status changed to 'withdrawn', revoke all tokens
  IF NEW.status = 'withdrawn' AND OLD.status != 'withdrawn' THEN
    UPDATE story_access_tokens
    SET revoked = true
    WHERE story_id = NEW.id
      AND revoked = false;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."revoke_tokens_on_story_withdrawal"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."revoke_tokens_on_story_withdrawal"() IS 'Auto-revokes all story tokens when story status changes to withdrawn';



CREATE OR REPLACE FUNCTION "public"."search_schema"("p_search_term" "text") RETURNS TABLE("result_type" "text", "table_name" "text", "column_name" "text", "data_type" "text", "description" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  -- Search table names
  SELECT
    'table'::TEXT as result_type,
    t.tablename::TEXT as table_name,
    NULL::TEXT as column_name,
    NULL::TEXT as data_type,
    obj_description(('public.' || t.tablename)::regclass)::TEXT as description
  FROM pg_tables t
  WHERE t.schemaname = 'public'
    AND t.tablename ILIKE '%' || p_search_term || '%'

  UNION ALL

  -- Search column names
  SELECT
    'column'::TEXT as result_type,
    c.table_name::TEXT,
    c.column_name::TEXT,
    c.data_type::TEXT,
    col_description(('public.' || c.table_name)::regclass, c.ordinal_position::int)::TEXT as description
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.column_name ILIKE '%' || p_search_term || '%'

  ORDER BY result_type, table_name, column_name;
END;
$$;


ALTER FUNCTION "public"."search_schema"("p_search_term" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."search_schema"("p_search_term" "text") IS 'Search for tables and columns by name';



CREATE OR REPLACE FUNCTION "public"."search_stories"("search_query" "text", "user_tenant_id" "uuid", "limit_count" integer DEFAULT 20) RETURNS TABLE("story_id" "uuid", "title" "text", "content_snippet" "text", "author_name" "text", "themes" "text"[], "relevance_score" real)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        left(s.content, 200) || '...' as content_snippet,
        p.full_name,
        s.themes,
        ts_rank(to_tsvector('english', s.title || ' ' || s.content), plainto_tsquery('english', search_query)) as relevance_score
    FROM public.stories s
    JOIN public.profiles p ON s.author_id = p.id
    WHERE s.tenant_id = user_tenant_id
    AND (s.privacy_level = 'public' OR s.privacy_level = 'community')
    AND to_tsvector('english', s.title || ' ' || s.content) @@ plainto_tsquery('english', search_query)
    ORDER BY relevance_score DESC
    LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."search_stories"("search_query" "text", "user_tenant_id" "uuid", "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_update_org_metrics"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Only trigger if analysis status changed to 'completed'
  IF NEW.ai_processing_status = 'completed' AND
     (OLD.ai_processing_status IS NULL OR OLD.ai_processing_status != 'completed') THEN

    -- Find all organizations for this storyteller
    PERFORM calculate_organization_impact_metrics(om.organization_id)
    FROM organization_members om
    WHERE om.profile_id = NEW.storyteller_id;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_update_org_metrics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_update_quality_metrics"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    PERFORM update_data_quality_metrics(NEW.organization_id);
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_update_quality_metrics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_ai_usage_daily"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO ai_usage_daily (
    date, tenant_id, organization_id, agent_name, model,
    request_count, success_count, failure_count,
    total_prompt_tokens, total_completion_tokens, total_tokens,
    total_cost_usd, total_duration_ms,
    flagged_count, blocked_count
  ) VALUES (
    DATE(NEW.created_at),
    NEW.tenant_id,
    NEW.organization_id,
    NEW.agent_name,
    NEW.model,
    1,
    CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    COALESCE(NEW.prompt_tokens, 0),
    COALESCE(NEW.completion_tokens, 0),
    COALESCE(NEW.prompt_tokens, 0) + COALESCE(NEW.completion_tokens, 0),
    COALESCE(NEW.cost_usd_est, 0),
    COALESCE(NEW.duration_ms, 0),
    CASE WHEN NEW.safety_status = 'flagged' THEN 1 ELSE 0 END,
    CASE WHEN NEW.safety_status = 'blocked' THEN 1 ELSE 0 END
  )
  ON CONFLICT (date, tenant_id, organization_id, agent_name, model)
  DO UPDATE SET
    request_count = ai_usage_daily.request_count + 1,
    success_count = ai_usage_daily.success_count + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    failure_count = ai_usage_daily.failure_count + CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    total_prompt_tokens = ai_usage_daily.total_prompt_tokens + COALESCE(NEW.prompt_tokens, 0),
    total_completion_tokens = ai_usage_daily.total_completion_tokens + COALESCE(NEW.completion_tokens, 0),
    total_tokens = ai_usage_daily.total_tokens + COALESCE(NEW.prompt_tokens, 0) + COALESCE(NEW.completion_tokens, 0),
    total_cost_usd = ai_usage_daily.total_cost_usd + COALESCE(NEW.cost_usd_est, 0),
    total_duration_ms = ai_usage_daily.total_duration_ms + COALESCE(NEW.duration_ms, 0),
    flagged_count = ai_usage_daily.flagged_count + CASE WHEN NEW.safety_status = 'flagged' THEN 1 ELSE 0 END,
    blocked_count = ai_usage_daily.blocked_count + CASE WHEN NEW.safety_status = 'blocked' THEN 1 ELSE 0 END,
    updated_at = NOW();

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_ai_usage_daily"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_analytics_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_analytics_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_blog_posts_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_blog_posts_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_cultural_safety_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_cultural_safety_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_data_quality_metrics"("org_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Update completeness metric
    INSERT INTO data_quality_metrics (organization_id, metric_type, metric_value, data_source)
    VALUES (org_id, 'completeness', calculate_organization_completeness(org_id), 'ai_scraper')
    ON CONFLICT (organization_id, metric_type) DO UPDATE SET
        metric_value = EXCLUDED.metric_value,
        measurement_date = CURRENT_TIMESTAMP;
        
    -- Additional metrics can be added here
END;
$$;


ALTER FUNCTION "public"."update_data_quality_metrics"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_gallery_photo_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.photo_galleries 
    SET photo_count = photo_count + 1,
        last_updated_at = NOW()
    WHERE id = NEW.gallery_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.photo_galleries 
    SET photo_count = GREATEST(photo_count - 1, 0),
        last_updated_at = NOW()
    WHERE id = OLD.gallery_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_gallery_photo_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_invitation_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_invitation_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_last_login"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.users
    SET
        last_login_at = NOW(),
        login_count = login_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_last_login"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_media_assets_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_media_assets_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_media_link_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_media_link_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_organization_contexts_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_organization_contexts_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_platform_stats"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO platform_stats_cache (id, updated_at,
    total_stories, total_storytellers, total_organizations, total_projects,
    stories_last_7_days, stories_last_30_days,
    pending_reviews, pending_elder_reviews)
  VALUES (
    'global',
    NOW(),
    (SELECT COUNT(*) FROM stories WHERE status != 'deleted'),
    (SELECT COUNT(*) FROM profiles WHERE is_storyteller = true),
    (SELECT COUNT(*) FROM organizations WHERE status = 'active'),
    (SELECT COUNT(*) FROM projects WHERE status = 'active'),
    (SELECT COUNT(*) FROM stories WHERE created_at > NOW() - INTERVAL '7 days'),
    (SELECT COUNT(*) FROM stories WHERE created_at > NOW() - INTERVAL '30 days'),
    (SELECT COUNT(*) FROM stories WHERE status = 'review'),
    (SELECT COUNT(*) FROM elder_review_queue WHERE status = 'pending')
  )
  ON CONFLICT (id) DO UPDATE SET
    updated_at = NOW(),
    total_stories = EXCLUDED.total_stories,
    total_storytellers = EXCLUDED.total_storytellers,
    total_organizations = EXCLUDED.total_organizations,
    total_projects = EXCLUDED.total_projects,
    stories_last_7_days = EXCLUDED.stories_last_7_days,
    stories_last_30_days = EXCLUDED.stories_last_30_days,
    pending_reviews = EXCLUDED.pending_reviews,
    pending_elder_reviews = EXCLUDED.pending_elder_reviews;
END;
$$;


ALTER FUNCTION "public"."update_platform_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_project_analyses_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_project_analyses_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_project_contexts_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_project_contexts_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_project_profiles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_project_profiles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_project_seed_interviews_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_project_seed_interviews_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_project_stories_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Update the count for affected project
  UPDATE partner_projects
  SET stories_count = (
    SELECT COUNT(*) FROM story_syndication_requests
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    AND status = 'approved'
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_project_stories_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_service_story_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.service_id IS NOT NULL THEN
    UPDATE organization_services
    SET story_count = story_count + 1
    WHERE id = NEW.service_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_service_story_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_story_media_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_story_media_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_story_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'C');
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_story_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_tenant_ai_usage"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Reset daily usage if new day
  UPDATE tenant_ai_policies
  SET
    current_day_usage_usd = CASE
      WHEN last_reset_date < CURRENT_DATE THEN COALESCE(NEW.cost_usd_est, 0)
      ELSE current_day_usage_usd + COALESCE(NEW.cost_usd_est, 0)
    END,
    current_month_usage_usd = CASE
      WHEN DATE_TRUNC('month', last_reset_date) < DATE_TRUNC('month', CURRENT_DATE) THEN COALESCE(NEW.cost_usd_est, 0)
      ELSE current_month_usage_usd + COALESCE(NEW.cost_usd_est, 0)
    END,
    last_reset_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE tenant_id = NEW.tenant_id;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_tenant_ai_usage"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_tour_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_tour_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_transcript_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.transcript_content, '')), 'B');
    
    -- Update word and character counts
    NEW.word_count := array_length(string_to_array(NEW.transcript_content, ' '), 1);
    NEW.character_count := length(NEW.transcript_content);
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_transcript_search_vector"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_webhook_subscription_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_webhook_subscription_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_organization_role"("org_id" "uuid", "required_role" "public"."organization_role", "user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_role organization_role;
BEGIN
  user_role := get_user_organization_role(org_id, user_id);

  -- Check role hierarchy based on indigenous governance principles
  RETURN CASE
    WHEN required_role = 'guest' THEN user_role IS NOT NULL
    WHEN required_role = 'community_member' THEN user_role IN ('community_member', 'storyteller', 'project_leader', 'archivist', 'cultural_liaison', 'knowledge_holder', 'cultural_keeper', 'admin', 'elder')
    WHEN required_role = 'storyteller' THEN user_role IN ('storyteller', 'project_leader', 'archivist', 'knowledge_holder', 'cultural_keeper', 'admin', 'elder')
    WHEN required_role = 'project_leader' THEN user_role IN ('project_leader', 'knowledge_holder', 'cultural_keeper', 'admin', 'elder')
    WHEN required_role = 'admin' THEN user_role IN ('admin', 'cultural_keeper', 'elder')
    WHEN required_role = 'knowledge_holder' THEN user_role IN ('knowledge_holder', 'cultural_keeper', 'elder')
    WHEN required_role = 'cultural_keeper' THEN user_role IN ('cultural_keeper', 'elder')
    WHEN required_role = 'elder' THEN user_role = 'elder'
    ELSE false
  END;
END;
$$;


ALTER FUNCTION "public"."user_has_organization_role"("org_id" "uuid", "required_role" "public"."organization_role", "user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."user_has_organization_role"("org_id" "uuid", "required_role" "public"."organization_role", "user_id" "uuid") IS 'Checks if user has required role or higher in organization';



CREATE OR REPLACE FUNCTION "public"."user_has_role"("role_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() 
        AND role_name = ANY(tenant_roles)
    );
END;
$$;


ALTER FUNCTION "public"."user_has_role"("role_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_and_increment_token"("p_token" "text") RETURNS TABLE("is_valid" boolean, "story_id" "uuid", "reason" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_token story_access_tokens%ROWTYPE;
  v_story stories%ROWTYPE;
BEGIN
  -- Get token
  SELECT * INTO v_token
  FROM story_access_tokens
  WHERE token = p_token;

  -- Token not found
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Token not found';
    RETURN;
  END IF;

  -- Token revoked
  IF v_token.revoked THEN
    RETURN QUERY SELECT false, v_token.story_id, 'Token has been revoked';
    RETURN;
  END IF;

  -- Token expired
  IF v_token.expires_at < NOW() THEN
    RETURN QUERY SELECT false, v_token.story_id, 'Token has expired';
    RETURN;
  END IF;

  -- Max views reached
  IF v_token.max_views IS NOT NULL AND v_token.view_count >= v_token.max_views THEN
    RETURN QUERY SELECT false, v_token.story_id, 'Maximum views reached';
    RETURN;
  END IF;

  -- Check story status
  SELECT * INTO v_story
  FROM stories
  WHERE id = v_token.story_id;

  IF v_story.status = 'withdrawn' THEN
    RETURN QUERY SELECT false, v_token.story_id, 'Story has been withdrawn';
    RETURN;
  END IF;

  -- Valid - increment view count
  UPDATE story_access_tokens
  SET
    view_count = view_count + 1,
    last_accessed_at = NOW()
  WHERE id = v_token.id;

  RETURN QUERY SELECT true, v_token.story_id, 'Valid'::TEXT;
END;
$$;


ALTER FUNCTION "public"."validate_and_increment_token"("p_token" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."validate_and_increment_token"("p_token" "text") IS 'Validates token and increments view count. Returns validity status, story_id, and reason.';



CREATE OR REPLACE FUNCTION "public"."validate_archive_consent"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- If changing to archive tier, must have explicit consent
  IF NEW.permission_tier = 'archive' AND NEW.archive_consent_given = false THEN
    RAISE EXCEPTION 'Archive tier requires explicit consent (archive_consent_given = true)';
  END IF;

  -- If archive tier, cannot be withdrawn
  IF OLD.permission_tier = 'archive' AND NEW.status = 'withdrawn' THEN
    RAISE EXCEPTION 'Stories in archive tier cannot be withdrawn - they are permanent public record';
  END IF;

  -- Update consent verification timestamp when tier changes
  IF OLD.permission_tier IS DISTINCT FROM NEW.permission_tier THEN
    NEW.consent_verified_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_archive_consent"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_collaboration_settings"("data" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  IF jsonb_typeof(data) != 'object' THEN
    RETURN FALSE;
  END IF;
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."validate_collaboration_settings"("data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_cultural_identity"("data" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  -- Basic validation - ensure it's an object
  IF jsonb_typeof(data) != 'object' THEN
    RETURN FALSE;
  END IF;
  
  -- Add more specific validation as needed
  -- For now, just ensure it's valid JSONB object
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."validate_cultural_identity"("data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_cultural_protocols"("data" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  IF jsonb_typeof(data) != 'object' THEN
    RETURN FALSE;
  END IF;
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."validate_cultural_protocols"("data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_default_permissions"("data" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  IF jsonb_typeof(data) != 'object' THEN
    RETURN FALSE;
  END IF;
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."validate_default_permissions"("data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_embed_token"("p_token_hash" "text", "p_domain" "text") RETURNS TABLE("is_valid" boolean, "story_id" "uuid", "token_id" "uuid", "error_message" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_token RECORD;
BEGIN
  SELECT * INTO v_token
  FROM public.embed_tokens
  WHERE token_hash = p_token_hash;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, 'Token not found';
    RETURN;
  END IF;

  IF v_token.status != 'active' THEN
    RETURN QUERY SELECT false, v_token.story_id, v_token.id, 'Token is ' || v_token.status;
    RETURN;
  END IF;

  IF v_token.expires_at IS NOT NULL AND v_token.expires_at < NOW() THEN
    RETURN QUERY SELECT false, v_token.story_id, v_token.id, 'Token has expired';
    RETURN;
  END IF;

  IF v_token.allowed_domains IS NOT NULL AND array_length(v_token.allowed_domains, 1) > 0 THEN
    IF NOT (p_domain = ANY(v_token.allowed_domains)) THEN
      RETURN QUERY SELECT false, v_token.story_id, v_token.id, 'Domain not allowed';
      RETURN;
    END IF;
  END IF;

  RETURN QUERY SELECT true, v_token.story_id, v_token.id, NULL::TEXT;
END;
$$;


ALTER FUNCTION "public"."validate_embed_token"("p_token_hash" "text", "p_domain" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_governance_structure"("data" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  IF jsonb_typeof(data) != 'object' THEN
    RETURN FALSE;
  END IF;
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."validate_governance_structure"("data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_role_hierarchy"("assigner_role" "public"."organization_role", "assigned_role" "public"."organization_role") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Elder can assign any role
    IF assigner_role = 'elder' THEN
        RETURN TRUE;
    END IF;
    
    -- Cultural keepers can assign roles below them in hierarchy
    IF assigner_role = 'cultural_keeper' AND assigned_role NOT IN ('elder', 'cultural_keeper') THEN
        RETURN TRUE;
    END IF;
    
    -- Knowledge holders can assign storyteller, community_member, guest roles
    IF assigner_role = 'knowledge_holder' AND assigned_role IN ('storyteller', 'community_member', 'guest') THEN
        RETURN TRUE;
    END IF;
    
    -- Admins can assign technical roles but not cultural authority roles
    IF assigner_role = 'admin' AND assigned_role IN ('admin', 'project_leader', 'storyteller', 'community_member', 'guest', 'archivist') THEN
        RETURN TRUE;
    END IF;
    
    -- Project leaders can assign limited roles
    IF assigner_role = 'project_leader' AND assigned_role IN ('storyteller', 'community_member', 'guest') THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."validate_role_hierarchy"("assigner_role" "public"."organization_role", "assigned_role" "public"."organization_role") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."validate_role_hierarchy"("assigner_role" "public"."organization_role", "assigned_role" "public"."organization_role") IS 'Validates role assignment permissions based on indigenous hierarchy principles. Ensures cultural authority roles (elder, cultural_keeper) maintain proper oversight over role assignments while allowing technical roles appropriate permissions.';



CREATE TABLE IF NOT EXISTS "public"."act_admin_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "permission_level" "text" DEFAULT 'viewer'::"text",
    "can_approve_storytellers" boolean DEFAULT false,
    "can_approve_stories" boolean DEFAULT false,
    "can_manage_projects" boolean DEFAULT false,
    "can_view_analytics" boolean DEFAULT false,
    "can_manage_admins" boolean DEFAULT false,
    "project_ids" "uuid"[],
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"(),
    "notes" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "act_admin_permissions_permission_level_check" CHECK (("permission_level" = ANY (ARRAY['viewer'::"text", 'editor'::"text", 'admin'::"text", 'super_admin'::"text"])))
);


ALTER TABLE "public"."act_admin_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."act_admin_permissions" IS 'ACT staff who can approve storytellers and stories for featuring';



CREATE TABLE IF NOT EXISTS "public"."act_admins" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'admin'::"text" NOT NULL,
    "can_approve_storytellers" boolean DEFAULT true,
    "can_approve_stories" boolean DEFAULT true,
    "can_manage_projects" boolean DEFAULT true,
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"(),
    "revoked_at" timestamp with time zone,
    CONSTRAINT "act_admins_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))
);


ALTER TABLE "public"."act_admins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."act_feature_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "act_project_id" "uuid" NOT NULL,
    "request_type" "text" DEFAULT 'storyteller'::"text",
    "why_feature_me" "text",
    "relevant_experience" "text",
    "alignment_notes" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "review_notes" "text",
    "decline_reason" "text",
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "act_feature_requests_request_type_check" CHECK (("request_type" = ANY (ARRAY['storyteller'::"text", 'story'::"text", 'storyteller_and_stories'::"text"]))),
    CONSTRAINT "act_feature_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'under_review'::"text", 'approved'::"text", 'declined'::"text", 'withdrawn'::"text"])))
);


ALTER TABLE "public"."act_feature_requests" OWNER TO "postgres";


COMMENT ON TABLE "public"."act_feature_requests" IS 'Storytellers can request to be featured on ACT projects';



CREATE TABLE IF NOT EXISTS "public"."act_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "website_url" "text",
    "project_site_url" "text",
    "organization_name" "text",
    "organization_id" "uuid",
    "focus_areas" "text"[] DEFAULT '{}'::"text"[],
    "themes" "text"[] DEFAULT '{}'::"text"[],
    "is_active" boolean DEFAULT true,
    "allows_storyteller_optin" boolean DEFAULT true,
    "allows_story_featuring" boolean DEFAULT true,
    "display_config" "jsonb" DEFAULT '{"max_stories": 3, "max_storytellers": 5, "auto_approve_stories": false, "auto_approve_storytellers": false}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."act_projects" OWNER TO "postgres";


COMMENT ON TABLE "public"."act_projects" IS 'Cleaned up to show only actual ACT projects. Deactivated: 11 timeline/event entries and 3 infrastructure items. 25 active projects remain.';



CREATE TABLE IF NOT EXISTS "public"."storyteller_project_features" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "act_project_id" "uuid" NOT NULL,
    "opted_in" boolean DEFAULT false,
    "opted_in_at" timestamp with time zone,
    "opt_in_method" "text",
    "approved_by_act" boolean DEFAULT false,
    "approved_at" timestamp with time zone,
    "approved_by" "uuid",
    "is_visible" boolean GENERATED ALWAYS AS (("opted_in" AND "approved_by_act")) STORED,
    "feature_bio" boolean DEFAULT true,
    "feature_stories" boolean DEFAULT true,
    "featured_priority" integer DEFAULT 0,
    "custom_bio" "text",
    "custom_tagline" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."storyteller_project_features" OWNER TO "postgres";


COMMENT ON TABLE "public"."storyteller_project_features" IS 'Bidirectional control: storytellers opt-in, ACT admins approve';



CREATE OR REPLACE VIEW "public"."act_featured_storytellers" AS
 SELECT "spf"."id",
    "spf"."storyteller_id",
    "spf"."act_project_id",
    "p"."slug" AS "project_slug",
    "p"."title" AS "project_title",
    "u"."email" AS "storyteller_email",
    ("u"."raw_user_meta_data" ->> 'display_name'::"text") AS "display_name",
    ("u"."raw_user_meta_data" ->> 'profile_image_url'::"text") AS "profile_image_url",
    "spf"."custom_bio" AS "featured_bio",
    "spf"."custom_tagline" AS "featured_tagline",
    ("u"."raw_user_meta_data" ->> 'profile_image_url'::"text") AS "featured_image_url",
    "spf"."opted_in_at",
    "spf"."approved_at",
    "spf"."created_at",
    "spf"."updated_at"
   FROM (("public"."storyteller_project_features" "spf"
     JOIN "public"."act_projects" "p" ON (("p"."id" = "spf"."act_project_id")))
     JOIN "auth"."users" "u" ON (("u"."id" = "spf"."storyteller_id")))
  WHERE (("spf"."is_visible" = true) AND ("p"."is_active" = true));


ALTER VIEW "public"."act_featured_storytellers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "activity_type" "text" NOT NULL,
    "service_area" "text" NOT NULL,
    "activity_date" "date" NOT NULL,
    "start_time" time without time zone,
    "end_time" time without time zone,
    "duration_minutes" integer,
    "location" "text",
    "on_country" boolean DEFAULT false,
    "participant_count" integer,
    "participant_age_range" "text",
    "participant_gender_breakdown" "jsonb",
    "language_groups" "text"[],
    "communities_represented" "text"[],
    "facilitators" "text"[],
    "elder_involvement" boolean DEFAULT false,
    "elders_involved" "text"[],
    "cultural_authority_present" boolean DEFAULT false,
    "cultural_protocols_followed" boolean DEFAULT true,
    "traditional_knowledge_shared" boolean DEFAULT false,
    "knowledge_topics" "text"[],
    "language_use" "text"[],
    "cultural_materials_used" "text"[],
    "budget_allocated" numeric,
    "actual_cost" numeric,
    "partners_involved" "text"[],
    "transport_provided" boolean DEFAULT false,
    "meals_provided" boolean DEFAULT false,
    "outputs" "text"[],
    "outcomes_observed" "text"[],
    "participant_feedback" "text"[],
    "facilitator_reflections" "text",
    "photos_taken" integer DEFAULT 0,
    "videos_recorded" integer DEFAULT 0,
    "related_outcome_ids" "uuid"[],
    "source_document_id" "uuid",
    "media_ids" "uuid"[],
    "follow_up_required" boolean DEFAULT false,
    "follow_up_notes" "text",
    "follow_up_date" "date",
    "recorded_by" "uuid",
    "verified_by" "uuid",
    "verification_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "activities_activity_type_check" CHECK (("activity_type" = ANY (ARRAY['mentoring_session'::"text", 'on_country_camp'::"text", 'deep_listening_circle'::"text", 'service_navigation'::"text", 'community_event'::"text", 'cultural_healing'::"text", 'skill_building'::"text", 'leadership_development'::"text", 'referral'::"text", 'consultation'::"text", 'other'::"text"]))),
    CONSTRAINT "activities_service_area_check" CHECK (("service_area" = ANY (ARRAY['youth_mentorship'::"text", 'true_justice'::"text", 'atnarpa_homestead'::"text", 'cultural_brokerage'::"text", 'good_news_stories'::"text", 'general'::"text"])))
);


ALTER TABLE "public"."activities" OWNER TO "postgres";


COMMENT ON TABLE "public"."activities" IS 'Records all program activities that produce outcomes';



CREATE TABLE IF NOT EXISTS "public"."activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "user_name" "text",
    "user_role" "text",
    "action" "text" NOT NULL,
    "action_category" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid",
    "entity_title" "text",
    "details" "jsonb" DEFAULT '{}'::"jsonb",
    "changes" "jsonb" DEFAULT '{}'::"jsonb",
    "organization_id" "uuid",
    "is_system_action" boolean DEFAULT false,
    "requires_attention" boolean DEFAULT false,
    "attention_resolved_at" timestamp with time zone,
    "attention_resolved_by" "uuid"
);


ALTER TABLE "public"."activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "sender_id" "uuid",
    "sender_name" "text",
    "subject" "text" NOT NULL,
    "body" "text" NOT NULL,
    "message_type" "text" DEFAULT 'announcement'::"text" NOT NULL,
    "target_type" "text" NOT NULL,
    "target_organization_id" "uuid",
    "target_project_id" "uuid",
    "target_user_ids" "uuid"[],
    "target_filter" "jsonb",
    "channels" "text"[] DEFAULT ARRAY['in_app'::"text"],
    "scheduled_at" timestamp with time zone,
    "sent_at" timestamp with time zone,
    "status" "text" DEFAULT 'draft'::"text",
    "recipient_count" integer DEFAULT 0,
    "delivered_count" integer DEFAULT 0,
    "read_count" integer DEFAULT 0,
    "template_vars" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."admin_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_agent_registry" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "description" "text",
    "version" "text" DEFAULT '1.0.0'::"text",
    "agent_type" "text" NOT NULL,
    "default_model" "text" DEFAULT 'gpt-4o-mini'::"text",
    "fallback_model" "text" DEFAULT 'gpt-4o-mini'::"text",
    "max_tokens" integer DEFAULT 4096,
    "temperature" numeric(3,2) DEFAULT 0.7,
    "avg_prompt_tokens" integer DEFAULT 500,
    "avg_completion_tokens" integer DEFAULT 500,
    "avg_cost_usd" numeric(10,6) DEFAULT 0.01,
    "requires_safety_check" boolean DEFAULT true,
    "requires_elder_review" boolean DEFAULT false,
    "cultural_sensitivity_level" "text" DEFAULT 'medium'::"text",
    "is_active" boolean DEFAULT true,
    "is_beta" boolean DEFAULT false,
    "config" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_agent_registry_agent_type_check" CHECK (("agent_type" = ANY (ARRAY['intake'::"text", 'analyzer'::"text", 'synthesizer'::"text", 'composer'::"text", 'escalation'::"text", 'governance'::"text", 'cost'::"text"]))),
    CONSTRAINT "ai_agent_registry_cultural_sensitivity_level_check" CHECK (("cultural_sensitivity_level" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'sacred'::"text"])))
);


ALTER TABLE "public"."ai_agent_registry" OWNER TO "postgres";


COMMENT ON TABLE "public"."ai_agent_registry" IS 'Registry of available AI agents and their configurations';



CREATE TABLE IF NOT EXISTS "public"."ai_analysis_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "job_type" "text" NOT NULL,
    "entity_type" "text",
    "entity_id" "uuid",
    "priority" integer DEFAULT 5,
    "scheduled_for" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'pending'::"text",
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "result" "jsonb",
    "error_message" "text",
    "retry_count" integer DEFAULT 0,
    "max_retries" integer DEFAULT 3,
    "triggered_by" "uuid",
    "trigger_reason" "text"
);


ALTER TABLE "public"."ai_analysis_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_moderation_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_id" "uuid" NOT NULL,
    "content_type" "text" NOT NULL,
    "author_id" "uuid",
    "moderation_status" "text",
    "cultural_issues_detected" integer DEFAULT 0,
    "elder_review_required" boolean DEFAULT false,
    "moderated_at" timestamp with time zone,
    "elder_id" "uuid",
    "elder_decision" "text",
    "elder_notes" "text",
    "elder_conditions" "text"[],
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_moderation_logs_elder_decision_check" CHECK ((("elder_decision" IS NULL) OR ("elder_decision" = ANY (ARRAY['approved'::"text", 'rejected'::"text", 'needs_consultation'::"text"]))))
);


ALTER TABLE "public"."ai_moderation_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."ai_moderation_logs" IS 'Audit trail for all moderation activity';



CREATE TABLE IF NOT EXISTS "public"."ai_processing_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "request_id" "uuid" NOT NULL,
    "organization_id" "uuid",
    "ai_model_used" character varying(50) NOT NULL,
    "prompt_hash" character varying(64),
    "input_content_hash" character varying(64),
    "extracted_data" "jsonb",
    "confidence_scores" "jsonb",
    "processing_time_ms" integer,
    "token_usage" "jsonb",
    "error_message" "text",
    "quality_flags" "jsonb" DEFAULT '[]'::"jsonb",
    "processing_timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."ai_processing_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."ai_processing_logs" IS 'Detailed logs of AI processing for debugging and optimization';



CREATE TABLE IF NOT EXISTS "public"."ai_safety_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "operation" "text" NOT NULL,
    "context_type" "text",
    "content_preview" "text",
    "safety_result" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "safety_level" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_safety_logs_safety_level_check" CHECK (("safety_level" = ANY (ARRAY['safe'::"text", 'review_required'::"text", 'blocked'::"text"])))
);


ALTER TABLE "public"."ai_safety_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."ai_safety_logs" IS 'Audit trail for AI safety middleware checks';



CREATE TABLE IF NOT EXISTS "public"."ai_usage_daily" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "date" "date" NOT NULL,
    "tenant_id" "uuid",
    "organization_id" "uuid",
    "agent_name" "text" NOT NULL,
    "model" "text" NOT NULL,
    "request_count" integer DEFAULT 0,
    "success_count" integer DEFAULT 0,
    "failure_count" integer DEFAULT 0,
    "total_prompt_tokens" bigint DEFAULT 0,
    "total_completion_tokens" bigint DEFAULT 0,
    "total_tokens" bigint DEFAULT 0,
    "total_cost_usd" numeric(10,4) DEFAULT 0,
    "total_duration_ms" bigint DEFAULT 0,
    "avg_duration_ms" integer,
    "p95_duration_ms" integer,
    "flagged_count" integer DEFAULT 0,
    "blocked_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_usage_daily" OWNER TO "postgres";


COMMENT ON TABLE "public"."ai_usage_daily" IS 'Daily aggregated AI usage metrics for dashboards';



CREATE TABLE IF NOT EXISTS "public"."ai_usage_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid",
    "organization_id" "uuid",
    "user_id" "uuid",
    "agent_name" "text" NOT NULL,
    "agent_version" "text" DEFAULT '1.0.0'::"text",
    "request_id" "uuid" DEFAULT "gen_random_uuid"(),
    "parent_request_id" "uuid",
    "model" "text" NOT NULL,
    "model_provider" "text" NOT NULL,
    "prompt_tokens" integer DEFAULT 0,
    "completion_tokens" integer DEFAULT 0,
    "total_tokens" integer GENERATED ALWAYS AS (("prompt_tokens" + "completion_tokens")) STORED,
    "cost_usd_est" numeric(10,6) DEFAULT 0,
    "duration_ms" integer,
    "time_to_first_token_ms" integer,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "error_code" "text",
    "error_message" "text",
    "safety_status" "text" DEFAULT 'unchecked'::"text",
    "safety_flags" "jsonb" DEFAULT '[]'::"jsonb",
    "input_preview" "text",
    "output_preview" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    CONSTRAINT "ai_usage_events_safety_status_check" CHECK (("safety_status" = ANY (ARRAY['unchecked'::"text", 'safe'::"text", 'flagged'::"text", 'blocked'::"text"]))),
    CONSTRAINT "ai_usage_events_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'running'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "valid_duration" CHECK ((("duration_ms" IS NULL) OR ("duration_ms" >= 0))),
    CONSTRAINT "valid_tokens" CHECK ((("prompt_tokens" >= 0) AND ("completion_tokens" >= 0)))
);


ALTER TABLE "public"."ai_usage_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."ai_usage_events" IS 'Tracks all AI agent invocations for billing, observability, and cost control';



CREATE TABLE IF NOT EXISTS "public"."analysis_jobs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid",
    "job_type" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "transcript_ids" "uuid"[],
    "ai_model_used" "text",
    "processing_time_seconds" integer,
    "results_data" "jsonb",
    "error_message" "text",
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "analysis_jobs_job_type_check" CHECK (("job_type" = ANY (ARRAY['full_analysis'::"text", 'skills_extraction'::"text", 'impact_stories'::"text", 'recommendations'::"text"]))),
    CONSTRAINT "analysis_jobs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."analysis_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_processing_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "job_type" character varying(50) NOT NULL,
    "job_status" character varying(20) DEFAULT 'pending'::character varying,
    "storyteller_id" "uuid",
    "entity_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "entity_types" character varying(50)[] DEFAULT '{}'::character varying[],
    "total_items" integer DEFAULT 0,
    "processed_items" integer DEFAULT 0,
    "failed_items" integer DEFAULT 0,
    "success_rate" numeric(3,2) GENERATED ALWAYS AS (
CASE
    WHEN ("total_items" > 0) THEN (("processed_items")::numeric / ("total_items")::numeric)
    ELSE 0.0
END) STORED,
    "results_summary" "jsonb" DEFAULT '{}'::"jsonb",
    "output_data" "jsonb" DEFAULT '{}'::"jsonb",
    "error_details" "text",
    "warnings" "text"[],
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "processing_time_seconds" integer GENERATED ALWAYS AS (
CASE
    WHEN (("started_at" IS NOT NULL) AND ("completed_at" IS NOT NULL)) THEN (EXTRACT(epoch FROM ("completed_at" - "started_at")))::integer
    ELSE NULL::integer
END) STORED,
    "ai_model_used" character varying(100),
    "ai_model_version" character varying(50),
    "ai_processing_cost" numeric(8,4),
    "priority" integer DEFAULT 5,
    "scheduled_for" timestamp with time zone,
    "retry_count" integer DEFAULT 0,
    "max_retries" integer DEFAULT 3,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "analytics_processing_jobs_job_status_check" CHECK ((("job_status")::"text" = ANY ((ARRAY['pending'::character varying, 'running'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying])::"text"[]))),
    CONSTRAINT "analytics_processing_jobs_job_type_check" CHECK ((("job_type")::"text" = ANY ((ARRAY['theme_analysis'::character varying, 'quote_extraction'::character varying, 'connection_discovery'::character varying, 'insights_generation'::character varying, 'analytics_calculation'::character varying, 'embedding_generation'::character varying])::"text"[]))),
    CONSTRAINT "analytics_processing_jobs_priority_check" CHECK ((("priority" >= 1) AND ("priority" <= 10)))
);


ALTER TABLE "public"."analytics_processing_jobs" OWNER TO "postgres";


COMMENT ON TABLE "public"."analytics_processing_jobs" IS 'Background job tracking for analytics processing and AI analysis';



CREATE TABLE IF NOT EXISTS "public"."annual_report_stories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "story_id" "uuid" NOT NULL,
    "inclusion_reason" "text",
    "section_placement" "text",
    "display_order" integer DEFAULT 0,
    "is_featured" boolean DEFAULT false,
    "custom_title" "text",
    "custom_excerpt" "text",
    "include_full_text" boolean DEFAULT true,
    "selected_media_ids" "uuid"[],
    "added_at" timestamp without time zone DEFAULT "now"(),
    "added_by" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."annual_report_stories" OWNER TO "postgres";


COMMENT ON TABLE "public"."annual_report_stories" IS 'Links stories to annual reports with placement and customization options';



CREATE TABLE IF NOT EXISTS "public"."annual_reports" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "report_year" integer NOT NULL,
    "reporting_period_start" "date" NOT NULL,
    "reporting_period_end" "date" NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "theme" "text",
    "status" "text" DEFAULT 'planning'::"text",
    "template_name" "text" DEFAULT 'traditional'::"text",
    "cover_image_url" "text",
    "featured_story_ids" "uuid"[],
    "auto_include_criteria" "jsonb",
    "exclude_story_ids" "uuid"[],
    "sections_config" "jsonb" DEFAULT '[{"type": "executive_summary", "order": 1, "enabled": true}, {"type": "leadership_message", "order": 2, "enabled": true}, {"type": "year_overview", "order": 3, "enabled": true}, {"type": "community_stories", "order": 4, "enabled": true}, {"type": "service_highlights", "order": 5, "enabled": true}, {"type": "impact_data", "order": 6, "enabled": true}, {"type": "financial_summary", "order": 7, "enabled": false}, {"type": "looking_forward", "order": 8, "enabled": true}, {"type": "acknowledgments", "order": 9, "enabled": true}]'::"jsonb",
    "executive_summary" "text",
    "leadership_message" "text",
    "leadership_message_author" "uuid",
    "year_highlights" "text"[],
    "looking_forward" "text",
    "acknowledgments" "text",
    "statistics" "jsonb" DEFAULT '{}'::"jsonb",
    "elder_approval_required" boolean DEFAULT true,
    "elder_approvals" "uuid"[],
    "elder_approval_date" timestamp without time zone,
    "cultural_advisor_review" boolean DEFAULT false,
    "cultural_notes" "text",
    "auto_generated" boolean DEFAULT false,
    "generation_date" timestamp without time zone,
    "generated_by" "uuid",
    "published_date" timestamp without time zone,
    "published_by" "uuid",
    "pdf_url" "text",
    "web_version_url" "text",
    "distribution_list" "text"[],
    "distribution_date" timestamp without time zone,
    "views" integer DEFAULT 0,
    "downloads" integer DEFAULT 0,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "created_by" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "reports_status_check" CHECK (("status" = ANY (ARRAY['planning'::"text", 'collecting'::"text", 'drafting'::"text", 'review'::"text", 'approved'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."annual_reports" OWNER TO "postgres";


COMMENT ON TABLE "public"."annual_reports" IS 'Annual report management with automated generation from stories and impact data';



CREATE OR REPLACE VIEW "public"."annual_reports_with_stats" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"uuid" AS "organization_id",
    NULL::integer AS "report_year",
    NULL::"date" AS "reporting_period_start",
    NULL::"date" AS "reporting_period_end",
    NULL::"text" AS "title",
    NULL::"text" AS "subtitle",
    NULL::"text" AS "theme",
    NULL::"text" AS "status",
    NULL::"text" AS "template_name",
    NULL::"text" AS "cover_image_url",
    NULL::"uuid"[] AS "featured_story_ids",
    NULL::"jsonb" AS "auto_include_criteria",
    NULL::"uuid"[] AS "exclude_story_ids",
    NULL::"jsonb" AS "sections_config",
    NULL::"text" AS "executive_summary",
    NULL::"text" AS "leadership_message",
    NULL::"uuid" AS "leadership_message_author",
    NULL::"text"[] AS "year_highlights",
    NULL::"text" AS "looking_forward",
    NULL::"text" AS "acknowledgments",
    NULL::"jsonb" AS "statistics",
    NULL::boolean AS "elder_approval_required",
    NULL::"uuid"[] AS "elder_approvals",
    NULL::timestamp without time zone AS "elder_approval_date",
    NULL::boolean AS "cultural_advisor_review",
    NULL::"text" AS "cultural_notes",
    NULL::boolean AS "auto_generated",
    NULL::timestamp without time zone AS "generation_date",
    NULL::"uuid" AS "generated_by",
    NULL::timestamp without time zone AS "published_date",
    NULL::"uuid" AS "published_by",
    NULL::"text" AS "pdf_url",
    NULL::"text" AS "web_version_url",
    NULL::"text"[] AS "distribution_list",
    NULL::timestamp without time zone AS "distribution_date",
    NULL::integer AS "views",
    NULL::integer AS "downloads",
    NULL::timestamp without time zone AS "created_at",
    NULL::timestamp without time zone AS "updated_at",
    NULL::"uuid" AS "created_by",
    NULL::"jsonb" AS "metadata",
    NULL::"text" AS "organization_name",
    NULL::"text" AS "organization_logo",
    NULL::bigint AS "story_count",
    NULL::bigint AS "feedback_count",
    NULL::numeric AS "average_rating";


ALTER VIEW "public"."annual_reports_with_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audio_emotion_analysis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "audio_id" "uuid" NOT NULL,
    "story_id" "uuid",
    "emotion_label" character varying(20),
    "arousal" double precision,
    "valence" double precision,
    "confidence" double precision,
    "temporal_segments" "jsonb",
    "analysis_method" character varying(50) DEFAULT 'openai_whisper'::character varying,
    "model_version" character varying(20),
    "culturally_validated" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "audio_emotion_analysis_arousal_check" CHECK ((("arousal" >= (0)::double precision) AND ("arousal" <= (1)::double precision))),
    CONSTRAINT "audio_emotion_analysis_confidence_check" CHECK ((("confidence" >= (0)::double precision) AND ("confidence" <= (1)::double precision))),
    CONSTRAINT "audio_emotion_analysis_valence_check" CHECK ((("valence" >= ('-1'::integer)::double precision) AND ("valence" <= (1)::double precision)))
);


ALTER TABLE "public"."audio_emotion_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audio_prosodic_analysis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "audio_id" "uuid" NOT NULL,
    "story_id" "uuid",
    "mean_pitch_hz" double precision,
    "pitch_range_hz" double precision,
    "pitch_std_hz" double precision,
    "pitch_range_semitones" double precision,
    "mean_intensity_db" double precision,
    "intensity_range_db" double precision,
    "intensity_std_db" double precision,
    "speech_rate_sps" double precision,
    "articulation_rate_sps" double precision,
    "pause_count" integer,
    "mean_pause_duration_s" double precision,
    "speaking_time_s" double precision,
    "total_duration_s" double precision,
    "voiced_fraction" double precision,
    "jitter" double precision,
    "shimmer" double precision,
    "hnr_db" double precision,
    "analysis_method" character varying(50) DEFAULT 'praat'::character varying,
    "analysis_version" character varying(20) DEFAULT 'v1.0'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audio_prosodic_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "action_category" "text",
    "actor_id" "uuid",
    "actor_type" "text",
    "actor_ip" "inet",
    "actor_user_agent" "text",
    "previous_state" "jsonb",
    "new_state" "jsonb",
    "change_summary" "text",
    "change_diff" "jsonb",
    "related_entity_type" "text",
    "related_entity_id" "uuid",
    "request_id" "text",
    "session_id" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "audit_logs_action_category_check" CHECK (("action_category" = ANY (ARRAY['ownership'::"text", 'distribution'::"text", 'consent'::"text", 'access'::"text", 'revocation'::"text", 'gdpr'::"text", 'cultural'::"text"]))),
    CONSTRAINT "audit_logs_action_check" CHECK (("action" = ANY (ARRAY['create'::"text", 'update'::"text", 'delete'::"text", 'archive'::"text", 'restore'::"text", 'share'::"text", 'revoke'::"text", 'view'::"text", 'download'::"text", 'embed'::"text", 'consent_grant'::"text", 'consent_withdraw'::"text", 'consent_update'::"text", 'anonymize'::"text", 'export'::"text", 'transfer_ownership'::"text", 'token_generate'::"text", 'token_revoke'::"text", 'token_use'::"text", 'webhook_send'::"text", 'webhook_fail'::"text", 'elder_review_request'::"text", 'elder_review_complete'::"text"]))),
    CONSTRAINT "audit_logs_actor_type_check" CHECK (("actor_type" = ANY (ARRAY['user'::"text", 'system'::"text", 'webhook'::"text", 'api'::"text", 'cron'::"text", 'admin'::"text"]))),
    CONSTRAINT "audit_logs_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['story'::"text", 'distribution'::"text", 'embed_token'::"text", 'consent'::"text", 'media'::"text", 'profile'::"text", 'deletion_request'::"text"])))
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."audit_logs" IS 'Comprehensive audit trail for all ownership, distribution, and consent actions';



CREATE TABLE IF NOT EXISTS "public"."blog_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "title" "text" NOT NULL,
    "excerpt" "text" NOT NULL,
    "content" "text" NOT NULL,
    "author" "text",
    "type" "text" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "hero_image" "text",
    "gallery" "text"[] DEFAULT '{}'::"text"[],
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "published_at" timestamp with time zone,
    "read_time" integer,
    "storyteller_id" "uuid",
    "elder_approved" boolean DEFAULT false,
    "curated_by" "text",
    "cultural_review" "text",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "source_notion_page_id" "text",
    CONSTRAINT "blog_posts_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"]))),
    CONSTRAINT "blog_posts_type_check" CHECK (("type" = ANY (ARRAY['community-story'::"text", 'cultural-insight'::"text", 'youth-work'::"text", 'historical-truth'::"text", 'transformation'::"text"]))),
    CONSTRAINT "content_not_empty" CHECK (("length"(TRIM(BOTH FROM "content")) > 0)),
    CONSTRAINT "excerpt_not_empty" CHECK (("length"(TRIM(BOTH FROM "excerpt")) > 0)),
    CONSTRAINT "title_not_empty" CHECK (("length"(TRIM(BOTH FROM "title")) > 0))
);


ALTER TABLE "public"."blog_posts" OWNER TO "postgres";


COMMENT ON TABLE "public"."blog_posts" IS 'Blog posts for community stories, cultural insights, and youth work narratives';



COMMENT ON COLUMN "public"."blog_posts"."type" IS 'Category: community-story, cultural-insight, youth-work, historical-truth, or transformation';



COMMENT ON COLUMN "public"."blog_posts"."elder_approved" IS 'Indicates if the content has been reviewed and approved by cultural elders';



COMMENT ON COLUMN "public"."blog_posts"."cultural_review" IS 'Notes from cultural review process';



COMMENT ON COLUMN "public"."blog_posts"."source_notion_page_id" IS 'Notion page ID that this blog post was synced from';



CREATE TABLE IF NOT EXISTS "public"."community_interpretation_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid",
    "theme_id" "uuid",
    "session_date" "date" NOT NULL,
    "participant_count" integer,
    "interpretation_type" character varying(50),
    "session_notes" "text",
    "key_interpretations" "text"[],
    "consensus_points" "text"[],
    "divergent_views" "text"[],
    "cultural_context" "text",
    "recommendations" "text"[],
    "facilitator_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."community_interpretation_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_story_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "responder_id" "uuid",
    "response_type" character varying(50),
    "response_text" "text",
    "emotional_reaction" character varying(50),
    "personal_connection" "text",
    "action_inspired" "text",
    "shared_with_others" boolean DEFAULT false,
    "response_date" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."community_story_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."consent_change_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "consent_id" "uuid" NOT NULL,
    "story_id" "uuid" NOT NULL,
    "app_id" "uuid" NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "change_type" "text" NOT NULL,
    "previous_state" "jsonb",
    "new_state" "jsonb",
    "changed_by" "uuid",
    "change_reason" "text",
    "webhooks_triggered" boolean DEFAULT false,
    "webhooks_delivered_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."consent_change_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."consent_change_log" IS 'History of all consent changes for audit and webhook triggering';



CREATE TABLE IF NOT EXISTS "public"."content_approval_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empathy_entry_id" "uuid",
    "content_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "summary" "text",
    "content_preview" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "privacy_level" "text" DEFAULT 'private'::"text",
    "submitted_by" "uuid",
    "submitted_at" timestamp with time zone DEFAULT "now"(),
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "review_notes" "text",
    "cultural_review_required" boolean DEFAULT true,
    "cultural_reviewer_id" "uuid",
    "cultural_review_notes" "text",
    "cultural_approved" boolean DEFAULT false,
    "elder_review_required" boolean DEFAULT false,
    "elder_reviewer_id" "uuid",
    "elder_review_notes" "text",
    "elder_approved" boolean DEFAULT false,
    "publish_to_website" boolean DEFAULT false,
    "published_at" timestamp with time zone,
    "published_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "content_approval_queue_content_type_check" CHECK (("content_type" = ANY (ARRAY['story'::"text", 'outcome'::"text", 'media'::"text", 'transcript'::"text"]))),
    CONSTRAINT "content_approval_queue_privacy_level_check" CHECK (("privacy_level" = ANY (ARRAY['private'::"text", 'internal'::"text", 'public'::"text"]))),
    CONSTRAINT "content_approval_queue_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'published'::"text"])))
);


ALTER TABLE "public"."content_approval_queue" OWNER TO "postgres";


COMMENT ON TABLE "public"."content_approval_queue" IS 'Tracks content pending approval from Empathy Ledger';



CREATE TABLE IF NOT EXISTS "public"."content_cache" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "url_hash" character varying(64) NOT NULL,
    "url" "text" NOT NULL,
    "content_hash" character varying(64) NOT NULL,
    "content_type" character varying(50),
    "raw_content" "text",
    "processed_content" "jsonb",
    "extraction_metadata" "jsonb",
    "cache_timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "expiry_timestamp" timestamp with time zone,
    "access_count" integer DEFAULT 0,
    "last_accessed" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "content_size_bytes" integer,
    "compression_used" boolean DEFAULT false
);


ALTER TABLE "public"."content_cache" OWNER TO "postgres";


COMMENT ON TABLE "public"."content_cache" IS 'Caches web content to avoid redundant scraping';



CREATE TABLE IF NOT EXISTS "public"."cross_narrative_insights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "insight_type" character varying(50) NOT NULL,
    "insight_category" character varying(50),
    "title" character varying(200) NOT NULL,
    "description" "text" NOT NULL,
    "significance" "text",
    "implications" "text",
    "recommendations" "text",
    "affected_storytellers" "uuid"[] DEFAULT '{}'::"uuid"[],
    "storyteller_count" integer DEFAULT 0,
    "geographic_scope" "text"[] DEFAULT '{}'::"text"[],
    "demographic_scope" "text"[] DEFAULT '{}'::"text"[],
    "supporting_quotes" "uuid"[] DEFAULT '{}'::"uuid"[],
    "supporting_themes" "uuid"[] DEFAULT '{}'::"uuid"[],
    "supporting_connections" "uuid"[] DEFAULT '{}'::"uuid"[],
    "statistical_evidence" "jsonb" DEFAULT '{}'::"jsonb",
    "data_sources" "text"[] DEFAULT '{}'::"text"[],
    "time_period_start" timestamp with time zone,
    "time_period_end" timestamp with time zone,
    "trend_direction" character varying(20),
    "velocity_score" numeric(3,2) DEFAULT 0.0,
    "confidence_level" numeric(3,2) DEFAULT 0.0,
    "ai_model_version" character varying(50),
    "validation_method" character varying(50),
    "peer_reviewed" boolean DEFAULT false,
    "potential_reach" integer DEFAULT 0,
    "actionability_score" numeric(3,2) DEFAULT 0.0,
    "urgency_level" character varying(20) DEFAULT 'medium'::character varying,
    "visibility_level" character varying(20) DEFAULT 'public'::character varying,
    "status" character varying(20) DEFAULT 'active'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cross_narrative_insights_confidence_level_check" CHECK ((("confidence_level" >= 0.0) AND ("confidence_level" <= 1.0))),
    CONSTRAINT "cross_narrative_insights_insight_type_check" CHECK ((("insight_type")::"text" = ANY ((ARRAY['trend'::character varying, 'pattern'::character varying, 'correlation'::character varying, 'emergence'::character varying, 'decline'::character varying, 'seasonal'::character varying, 'demographic'::character varying, 'geographic'::character varying, 'thematic'::character varying, 'network'::character varying])::"text"[]))),
    CONSTRAINT "cross_narrative_insights_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'archived'::character varying, 'disputed'::character varying, 'outdated'::character varying])::"text"[]))),
    CONSTRAINT "cross_narrative_insights_trend_direction_check" CHECK ((("trend_direction")::"text" = ANY ((ARRAY['increasing'::character varying, 'decreasing'::character varying, 'stable'::character varying, 'emerging'::character varying, 'declining'::character varying, 'cyclical'::character varying])::"text"[]))),
    CONSTRAINT "cross_narrative_insights_urgency_level_check" CHECK ((("urgency_level")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::"text"[]))),
    CONSTRAINT "cross_narrative_insights_visibility_level_check" CHECK ((("visibility_level")::"text" = ANY ((ARRAY['public'::character varying, 'network'::character varying, 'admin'::character varying, 'private'::character varying])::"text"[])))
);


ALTER TABLE "public"."cross_narrative_insights" OWNER TO "postgres";


COMMENT ON TABLE "public"."cross_narrative_insights" IS 'Platform-wide insights discovered across multiple storytellers';



CREATE TABLE IF NOT EXISTS "public"."cross_sector_insights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "primary_sector" "text" NOT NULL,
    "secondary_sector" "text" NOT NULL,
    "storyteller_connections" "jsonb" DEFAULT '{}'::"jsonb",
    "shared_themes" "text"[] DEFAULT '{}'::"text"[],
    "collaboration_opportunities" "text"[] DEFAULT '{}'::"text"[],
    "combined_impact_potential" integer DEFAULT 0,
    "resource_sharing_opportunities" "text"[] DEFAULT '{}'::"text"[],
    "policy_change_potential" "text"[] DEFAULT '{}'::"text"[],
    "supporting_stories" "text"[] DEFAULT '{}'::"text"[],
    "ai_confidence_score" numeric DEFAULT 0.0,
    "human_verified" boolean DEFAULT false,
    "verification_notes" "text",
    "geographic_regions" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."cross_sector_insights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cultural_protocols" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "protocol_name" "text" NOT NULL,
    "protocol_type" "text" NOT NULL,
    "description" "text",
    "rules" "jsonb" NOT NULL,
    "enforcement_level" "text" DEFAULT 'advisory'::"text",
    "created_by" "uuid",
    "approved_by" "uuid",
    "effective_date" timestamp with time zone DEFAULT "now"(),
    "expiry_date" timestamp with time zone,
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "legacy_project_id" "uuid",
    "organization_id" "uuid",
    CONSTRAINT "cultural_protocols_enforcement_level_check" CHECK (("enforcement_level" = ANY (ARRAY['advisory'::"text", 'required'::"text", 'blocking'::"text"]))),
    CONSTRAINT "cultural_protocols_protocol_type_check" CHECK (("protocol_type" = ANY (ARRAY['story_sharing'::"text", 'ai_processing'::"text", 'media_usage'::"text", 'community_governance'::"text", 'data_sovereignty'::"text", 'project_governance'::"text"]))),
    CONSTRAINT "cultural_protocols_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'active'::"text", 'suspended'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."cultural_protocols" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cultural_speech_patterns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "audio_id" "uuid" NOT NULL,
    "story_id" "uuid",
    "pattern_type" character varying(50),
    "time_start" double precision,
    "time_end" double precision,
    "confidence" double precision,
    "description" "text",
    "cultural_context" "text",
    "detected_by" character varying(50),
    "validated_by_community" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "cultural_speech_patterns_confidence_check" CHECK ((("confidence" >= (0)::double precision) AND ("confidence" <= (1)::double precision)))
);


ALTER TABLE "public"."cultural_speech_patterns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cultural_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "category" "text" NOT NULL,
    "cultural_sensitivity_level" "text" DEFAULT 'low'::"text",
    "usage_count" integer DEFAULT 0,
    CONSTRAINT "cultural_tags_cultural_sensitivity_level_check" CHECK (("cultural_sensitivity_level" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"])))
);


ALTER TABLE "public"."cultural_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."data_quality_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "metric_type" character varying(50) NOT NULL,
    "metric_value" numeric(5,4) NOT NULL,
    "metric_details" "jsonb",
    "measurement_date" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "data_source" character varying(100),
    "benchmark_comparison" "jsonb",
    "improvement_suggestions" "text"[],
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."data_quality_metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."data_quality_metrics" IS 'Metrics tracking data quality and completeness';



CREATE TABLE IF NOT EXISTS "public"."data_sources" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "type" character varying(50) NOT NULL,
    "base_url" "text" NOT NULL,
    "api_endpoint" "text",
    "scraping_config" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "discovery_patterns" "jsonb" DEFAULT '[]'::"jsonb",
    "update_frequency" character varying(20) DEFAULT 'weekly'::character varying,
    "reliability_score" numeric(3,2) DEFAULT 0.5,
    "last_successful_scrape" timestamp with time zone,
    "last_error_message" "text",
    "active" boolean DEFAULT true,
    "rate_limit_ms" integer DEFAULT 1000,
    "max_concurrent_requests" integer DEFAULT 1,
    "respect_robots_txt" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."data_sources" OWNER TO "postgres";


COMMENT ON TABLE "public"."data_sources" IS 'Configuration and monitoring of external data sources';



CREATE TABLE IF NOT EXISTS "public"."deletion_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "request_type" "text" NOT NULL,
    "scope" "jsonb",
    "reason" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "verified_at" timestamp with time zone,
    "processing_started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "items_total" integer DEFAULT 0,
    "items_processed" integer DEFAULT 0,
    "items_failed" integer DEFAULT 0,
    "processing_log" "jsonb" DEFAULT '[]'::"jsonb",
    "error_message" "text",
    "verification_token" "text",
    "verification_expires_at" timestamp with time zone,
    "verification_attempts" integer DEFAULT 0,
    "completion_report" "jsonb",
    "data_export_url" "text",
    "data_export_expires_at" timestamp with time zone,
    "processed_by" "uuid",
    "admin_notes" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "deletion_requests_request_type_check" CHECK (("request_type" = ANY (ARRAY['anonymize_story'::"text", 'anonymize_profile'::"text", 'delete_account'::"text", 'export_data'::"text", 'delete_specific'::"text"]))),
    CONSTRAINT "deletion_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'verified'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."deletion_requests" OWNER TO "postgres";


COMMENT ON TABLE "public"."deletion_requests" IS 'GDPR compliance: tracks data deletion and anonymization requests';



CREATE TABLE IF NOT EXISTS "public"."development_plans" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid",
    "short_term_goals" "text"[],
    "long_term_goals" "text"[],
    "skill_development_priorities" "text"[],
    "recommended_courses" "text"[],
    "networking_opportunities" "text"[],
    "mentorship_suggestions" "text"[],
    "cultural_preservation_activities" "text"[],
    "community_engagement_opportunities" "text"[],
    "traditional_knowledge_development" "text"[],
    "milestones" "jsonb",
    "progress_indicators" "text"[],
    "success_metrics" "text"[],
    "plan_duration" "text",
    "next_review_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."development_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."document_outcomes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "outcome_id" "uuid" NOT NULL,
    "evidence_type" "text",
    "relevance_score" numeric,
    "extraction_method" "text",
    "evidence_text" "text",
    "evidence_page" integer,
    "confidence_score" numeric,
    "extracted_at" timestamp with time zone DEFAULT "now"(),
    "extracted_by" "uuid",
    "verified_at" timestamp with time zone,
    "verified_by" "uuid",
    CONSTRAINT "document_outcomes_confidence_score_check" CHECK ((("confidence_score" >= (0)::numeric) AND ("confidence_score" <= (1)::numeric))),
    CONSTRAINT "document_outcomes_evidence_type_check" CHECK (("evidence_type" = ANY (ARRAY['quantitative'::"text", 'qualitative'::"text", 'mixed'::"text"]))),
    CONSTRAINT "document_outcomes_extraction_method_check" CHECK (("extraction_method" = ANY (ARRAY['manual'::"text", 'ai_extracted'::"text", 'verified'::"text"]))),
    CONSTRAINT "document_outcomes_relevance_score_check" CHECK ((("relevance_score" >= (0)::numeric) AND ("relevance_score" <= (1)::numeric)))
);


ALTER TABLE "public"."document_outcomes" OWNER TO "postgres";


COMMENT ON TABLE "public"."document_outcomes" IS 'Links documents to outcomes they evidence';



CREATE TABLE IF NOT EXISTS "public"."dream_organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "logo_url" "text",
    "website_url" "text",
    "description" "text" NOT NULL,
    "why_connect" "text" NOT NULL,
    "category" "text" NOT NULL,
    "location_text" "text",
    "city" "text",
    "country" "text",
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "contact_status" "text" DEFAULT 'dream'::"text",
    "priority" integer DEFAULT 5,
    "contact_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."dream_organizations" OWNER TO "postgres";


COMMENT ON TABLE "public"."dream_organizations" IS 'Aspirational partner organizations for the Empathy Ledger mission';



COMMENT ON COLUMN "public"."dream_organizations"."priority" IS 'Priority ranking 1-10, where 1 is highest priority';



CREATE TABLE IF NOT EXISTS "public"."elder_review_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_id" "uuid" NOT NULL,
    "content_type" "text" NOT NULL,
    "cultural_issues" "jsonb" DEFAULT '[]'::"jsonb",
    "priority" "text" DEFAULT 'medium'::"text" NOT NULL,
    "assigned_elder_id" "uuid",
    "assigned_at" timestamp with time zone,
    "due_date" timestamp with time zone,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "community_input_required" boolean DEFAULT false,
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "review_notes" "text",
    "review_conditions" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "elder_review_queue_content_type_check" CHECK (("content_type" = ANY (ARRAY['story'::"text", 'media'::"text", 'gallery'::"text", 'profile'::"text", 'comment'::"text"]))),
    CONSTRAINT "elder_review_queue_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "elder_review_queue_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_review'::"text", 'approved'::"text", 'rejected'::"text", 'needs_consultation'::"text"])))
);


ALTER TABLE "public"."elder_review_queue" OWNER TO "postgres";


COMMENT ON TABLE "public"."elder_review_queue" IS 'Queue of content requiring elder cultural review';



CREATE TABLE IF NOT EXISTS "public"."galleries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "cover_image_id" "uuid",
    "created_by" "uuid" NOT NULL,
    "organization_id" "uuid",
    "cultural_theme" "text",
    "cultural_context" "jsonb" DEFAULT '{}'::"jsonb",
    "cultural_significance" "text",
    "cultural_sensitivity_level" "text" DEFAULT 'medium'::"text",
    "visibility" "text" DEFAULT 'private'::"text",
    "status" "text" DEFAULT 'active'::"text",
    "photo_count" integer DEFAULT 0,
    "view_count" integer DEFAULT 0,
    "featured" boolean DEFAULT false,
    "is_public" boolean DEFAULT true,
    "cover_image" "text",
    CONSTRAINT "galleries_cultural_sensitivity_level_check" CHECK (("cultural_sensitivity_level" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "galleries_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'archived'::"text", 'draft'::"text"]))),
    CONSTRAINT "galleries_visibility_check" CHECK (("visibility" = ANY (ARRAY['public'::"text", 'community'::"text", 'organization'::"text", 'private'::"text"])))
);


ALTER TABLE "public"."galleries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "author_id" "uuid",
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "summary" "text",
    "media_url" "text",
    "transcription" "text",
    "video_embed_code" "text",
    "story_image_url" "text",
    "story_image_file" "text",
    "themes" "jsonb" DEFAULT '[]'::"jsonb",
    "story_category" "text",
    "story_type" "text" DEFAULT 'personal_narrative'::"text",
    "privacy_level" "text" DEFAULT 'private'::"text",
    "is_public" boolean DEFAULT false,
    "is_featured" boolean DEFAULT false,
    "cultural_sensitivity_level" "text" DEFAULT 'standard'::"text",
    "cultural_warnings" "jsonb" DEFAULT '[]'::"jsonb",
    "requires_elder_approval" boolean DEFAULT false,
    "elder_approved_by" "uuid",
    "elder_approved_at" timestamp with time zone,
    "sharing_permissions" "jsonb" DEFAULT '{}'::"jsonb",
    "cross_tenant_visibility" "text"[] DEFAULT '{}'::"text"[],
    "embedding" "public"."vector"(1536),
    "ai_processed" boolean DEFAULT false,
    "ai_processing_consent_verified" boolean DEFAULT false,
    "ai_confidence_scores" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_generated_summary" boolean DEFAULT false,
    "search_vector" "tsvector",
    "community_status" "text" DEFAULT 'draft'::"text",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "review_notes" "text",
    "legacy_story_id" "uuid",
    "airtable_record_id" "text",
    "fellowship_phase" "text",
    "fellow_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "cultural_themes" "text"[] DEFAULT '{}'::"text"[],
    "legacy_storyteller_id" "uuid",
    "legacy_airtable_id" "text",
    "legacy_fellow_id" "uuid",
    "legacy_author" "text",
    "migrated_at" timestamp with time zone,
    "migration_quality_score" integer,
    "ai_enhanced_content" "text",
    "media_urls" "text"[] DEFAULT '{}'::"text"[],
    "published_at" timestamp with time zone,
    "status" "text" DEFAULT 'draft'::"text",
    "media_metadata" "jsonb",
    "cultural_sensitivity_flag" boolean,
    "traditional_knowledge_flag" boolean,
    "story_stage" character varying(50) DEFAULT 'draft'::character varying,
    "video_stage" character varying(50),
    "source_links" "jsonb",
    "storyteller_id" "uuid",
    "transcript_id" "uuid",
    "media_attachments" "jsonb",
    "has_explicit_consent" boolean DEFAULT true,
    "consent_details" "jsonb",
    "project_id" "uuid",
    "organization_id" "uuid",
    "location_id" "uuid",
    "location_text" "text",
    "latitude" numeric,
    "longitude" numeric,
    "service_id" "uuid",
    "source_empathy_entry_id" "uuid",
    "sync_date" timestamp with time zone,
    "is_archived" boolean DEFAULT false,
    "archived_at" timestamp with time zone,
    "archived_by" "uuid",
    "archive_reason" "text",
    "embeds_enabled" boolean DEFAULT true,
    "sharing_enabled" boolean DEFAULT true,
    "allowed_embed_domains" "text"[],
    "consent_withdrawn_at" timestamp with time zone,
    "consent_withdrawal_reason" "text",
    "anonymization_status" "text",
    "anonymization_requested_at" timestamp with time zone,
    "anonymized_at" timestamp with time zone,
    "anonymized_fields" "jsonb",
    "original_author_display" "text",
    "ownership_status" "text" DEFAULT 'owned'::"text",
    "original_author_id" "uuid",
    "ownership_transferred_at" timestamp with time zone,
    "provenance_chain" "jsonb" DEFAULT '[]'::"jsonb",
    "views_count" integer DEFAULT 0 NOT NULL,
    "likes_count" integer DEFAULT 0 NOT NULL,
    "shares_count" integer DEFAULT 0 NOT NULL,
    "permission_tier" "public"."permission_tier" DEFAULT 'private'::"public"."permission_tier",
    "consent_verified_at" timestamp with time zone,
    "archive_consent_given" boolean DEFAULT false,
    "elder_reviewed" boolean DEFAULT false,
    "elder_reviewed_at" timestamp with time zone,
    "elder_reviewer_id" "uuid",
    CONSTRAINT "stories_anonymization_status_check" CHECK (("anonymization_status" = ANY (ARRAY['none'::"text", 'pending'::"text", 'partial'::"text", 'full'::"text"]))),
    CONSTRAINT "stories_community_status_check" CHECK (("community_status" = ANY (ARRAY['draft'::"text", 'pending_review'::"text", 'community_approved'::"text", 'published'::"text", 'archived'::"text"]))),
    CONSTRAINT "stories_cultural_sensitivity_level_check" CHECK (("cultural_sensitivity_level" = ANY (ARRAY['standard'::"text", 'sensitive'::"text", 'sacred'::"text", 'restricted'::"text"]))),
    CONSTRAINT "stories_ownership_status_check" CHECK (("ownership_status" = ANY (ARRAY['owned'::"text", 'transferred'::"text", 'shared'::"text", 'disputed'::"text"]))),
    CONSTRAINT "stories_privacy_level_check" CHECK (("privacy_level" = ANY (ARRAY['private'::"text", 'community'::"text", 'public'::"text"]))),
    CONSTRAINT "stories_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"]))),
    CONSTRAINT "valid_story_stage" CHECK ((("story_stage")::"text" = ANY ((ARRAY['draft'::character varying, 'review'::character varying, 'editing'::character varying, 'final'::character varying, 'published'::character varying])::"text"[]))),
    CONSTRAINT "valid_story_video_stage" CHECK ((("video_stage" IS NULL) OR (("video_stage")::"text" = ANY ((ARRAY['raw'::character varying, 'draft'::character varying, 'editing'::character varying, 'produced'::character varying, 'final'::character varying])::"text"[]))))
);


ALTER TABLE "public"."stories" OWNER TO "postgres";


COMMENT ON COLUMN "public"."stories"."privacy_level" IS 'Story-specific privacy level that can override profile default';



COMMENT ON COLUMN "public"."stories"."cultural_sensitivity_flag" IS 'Auto-detected flag for culturally sensitive content';



COMMENT ON COLUMN "public"."stories"."story_stage" IS 'Development stage of the story';



COMMENT ON COLUMN "public"."stories"."video_stage" IS 'Production stage if story has video component';



COMMENT ON COLUMN "public"."stories"."is_archived" IS 'Soft delete flag - archived stories are hidden but not deleted';



COMMENT ON COLUMN "public"."stories"."embeds_enabled" IS 'Whether embeds are allowed for this story';



COMMENT ON COLUMN "public"."stories"."allowed_embed_domains" IS 'List of domains allowed to embed this story (empty = all allowed)';



COMMENT ON COLUMN "public"."stories"."anonymization_status" IS 'GDPR anonymization status: none, pending, partial, full';



COMMENT ON COLUMN "public"."stories"."provenance_chain" IS 'JSON array tracking ownership history for audit trail';



COMMENT ON COLUMN "public"."stories"."views_count" IS 'Total number of times this story has been viewed';



COMMENT ON COLUMN "public"."stories"."likes_count" IS 'Total number of likes/hearts this story has received';



COMMENT ON COLUMN "public"."stories"."shares_count" IS 'Total number of times this story has been shared';



COMMENT ON COLUMN "public"."stories"."permission_tier" IS 'Controls who can access and share this story';



COMMENT ON COLUMN "public"."stories"."consent_verified_at" IS 'Last time storyteller confirmed consent for current permission level';



COMMENT ON COLUMN "public"."stories"."archive_consent_given" IS 'Explicit consent given for permanent archival (cannot be withdrawn)';



COMMENT ON COLUMN "public"."stories"."elder_reviewed" IS 'Story has been reviewed and approved by community Elders';



COMMENT ON COLUMN "public"."stories"."elder_reviewed_at" IS 'Timestamp of Elder review approval';



CREATE OR REPLACE VIEW "public"."elder_review_dashboard" AS
 SELECT "erq"."id",
    "erq"."content_id",
    "erq"."content_type",
    "erq"."cultural_issues",
    "erq"."priority",
    "erq"."assigned_elder_id",
    "erq"."assigned_at",
    "erq"."due_date",
    "erq"."status",
    "erq"."community_input_required",
    "erq"."reviewed_by",
    "erq"."reviewed_at",
    "erq"."review_notes",
    "erq"."review_conditions",
    "erq"."created_at",
    "erq"."updated_at",
        CASE
            WHEN ("erq"."content_type" = 'story'::"text") THEN ( SELECT "stories"."title"
               FROM "public"."stories"
              WHERE ("stories"."id" = "erq"."content_id"))
            WHEN ("erq"."content_type" = 'gallery'::"text") THEN ( SELECT "galleries"."title"
               FROM "public"."galleries"
              WHERE ("galleries"."id" = "erq"."content_id"))
            ELSE 'Untitled'::"text"
        END AS "content_title",
        CASE
            WHEN ("erq"."content_type" = 'story'::"text") THEN ( SELECT "left"("stories"."content", 300) AS "left"
               FROM "public"."stories"
              WHERE ("stories"."id" = "erq"."content_id"))
            ELSE NULL::"text"
        END AS "content_preview",
    "p"."display_name" AS "assigned_elder_name"
   FROM ("public"."elder_review_queue" "erq"
     LEFT JOIN "public"."profiles" "p" ON (("erq"."assigned_elder_id" = "p"."id")));


ALTER VIEW "public"."elder_review_dashboard" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."embed_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "token" "text" NOT NULL,
    "token_hash" "text" NOT NULL,
    "allowed_domains" "text"[],
    "status" "text" DEFAULT 'active'::"text",
    "expires_at" timestamp with time zone,
    "usage_count" integer DEFAULT 0,
    "last_used_at" timestamp with time zone,
    "last_used_domain" "text",
    "last_used_ip" "inet",
    "revoked_at" timestamp with time zone,
    "revoked_by" "uuid",
    "revocation_reason" "text",
    "allow_analytics" boolean DEFAULT true,
    "show_attribution" boolean DEFAULT true,
    "custom_styles" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "distribution_id" "uuid",
    CONSTRAINT "embed_tokens_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'revoked'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."embed_tokens" OWNER TO "postgres";


COMMENT ON TABLE "public"."embed_tokens" IS 'Secure tokens for authorizing embed API access with domain restrictions';



CREATE TABLE IF NOT EXISTS "public"."empathy_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "narrative" "text" NOT NULL,
    "storyteller_name" "text",
    "storyteller_consent" boolean DEFAULT false,
    "impact_indicator" "text",
    "outcome_level" "text",
    "timeframe" "text",
    "service_area" "text",
    "target_group" "text",
    "change_pathway" "text",
    "media_urls" "text"[],
    "document_urls" "text"[],
    "ready_to_publish" boolean DEFAULT false,
    "synced_to_oonchiumpa" boolean DEFAULT false,
    "sync_date" timestamp with time zone,
    "linked_story_id" "uuid",
    "linked_outcome_id" "uuid",
    "linked_transcript_id" "uuid",
    "publish_status" "text" DEFAULT 'draft'::"text",
    "privacy_level" "text" DEFAULT 'private'::"text",
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "rejection_reason" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "empathy_entries_outcome_level_check" CHECK (("outcome_level" = ANY (ARRAY['output'::"text", 'short_term'::"text", 'medium_term'::"text", 'long_term'::"text", 'impact'::"text"]))),
    CONSTRAINT "empathy_entries_privacy_level_check" CHECK (("privacy_level" = ANY (ARRAY['private'::"text", 'internal'::"text", 'public'::"text"]))),
    CONSTRAINT "empathy_entries_publish_status_check" CHECK (("publish_status" = ANY (ARRAY['draft'::"text", 'ready'::"text", 'synced'::"text", 'approved'::"text", 'published'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."empathy_entries" OWNER TO "postgres";


COMMENT ON TABLE "public"."empathy_entries" IS 'Core Empathy Ledger entries from storytelling sessions';



COMMENT ON COLUMN "public"."empathy_entries"."ready_to_publish" IS 'Staff marks this when content is ready for review';



COMMENT ON COLUMN "public"."empathy_entries"."publish_status" IS 'Workflow: draft → ready → synced → approved → published';



COMMENT ON COLUMN "public"."empathy_entries"."privacy_level" IS 'Controls visibility: private (Empathy Ledger only), internal (staff), public (website)';



CREATE TABLE IF NOT EXISTS "public"."empathy_sync_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "empathy_entry_id" "uuid",
    "sync_type" "text" NOT NULL,
    "sync_status" "text" NOT NULL,
    "created_story_id" "uuid",
    "created_outcome_id" "uuid",
    "created_transcript_id" "uuid",
    "created_media_ids" "uuid"[],
    "error_message" "text",
    "error_details" "jsonb",
    "synced_by" "uuid",
    "synced_at" timestamp with time zone DEFAULT "now"(),
    "source_data" "jsonb",
    CONSTRAINT "empathy_sync_log_sync_status_check" CHECK (("sync_status" = ANY (ARRAY['started'::"text", 'success'::"text", 'failed'::"text", 'partial'::"text"]))),
    CONSTRAINT "empathy_sync_log_sync_type_check" CHECK (("sync_type" = ANY (ARRAY['story'::"text", 'outcome'::"text", 'media'::"text", 'transcript'::"text", 'all'::"text"])))
);


ALTER TABLE "public"."empathy_sync_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."empathy_sync_log" IS 'Logs all sync operations between Empathy Ledger and Oonchiumpa';



CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "event_type" "text" NOT NULL,
    "event_data" "jsonb" DEFAULT '{}'::"jsonb",
    "resource_type" "text",
    "resource_id" "uuid",
    "user_agent" "text",
    "ip_address" "inet",
    "session_id" "uuid",
    "anonymized" boolean DEFAULT false,
    "retention_expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
)
PARTITION BY RANGE ("created_at");


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events_2024_01" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "event_type" "text" NOT NULL,
    "event_data" "jsonb" DEFAULT '{}'::"jsonb",
    "resource_type" "text",
    "resource_id" "uuid",
    "user_agent" "text",
    "ip_address" "inet",
    "session_id" "uuid",
    "anonymized" boolean DEFAULT false,
    "retention_expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."events_2024_01" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events_2025_08" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "event_type" "text" NOT NULL,
    "event_data" "jsonb" DEFAULT '{}'::"jsonb",
    "resource_type" "text",
    "resource_id" "uuid",
    "user_agent" "text",
    "ip_address" "inet",
    "session_id" "uuid",
    "anonymized" boolean DEFAULT false,
    "retention_expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."events_2025_08" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events_2025_09" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "event_type" "text" NOT NULL,
    "event_data" "jsonb" DEFAULT '{}'::"jsonb",
    "resource_type" "text",
    "resource_id" "uuid",
    "user_agent" "text",
    "ip_address" "inet",
    "session_id" "uuid",
    "anonymized" boolean DEFAULT false,
    "retention_expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."events_2025_09" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."external_applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "app_name" "text" NOT NULL,
    "app_display_name" "text" NOT NULL,
    "app_description" "text",
    "api_key_hash" "text" NOT NULL,
    "allowed_story_types" "text"[],
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "portal_enabled" boolean DEFAULT true,
    "portal_settings" "jsonb" DEFAULT '{"branding": {}, "allow_story_requests": true, "max_pending_requests": 50, "allow_storyteller_messaging": true, "require_approval_for_requests": false}'::"jsonb",
    "onboarding_completed_at" timestamp with time zone
);


ALTER TABLE "public"."external_applications" OWNER TO "postgres";


COMMENT ON TABLE "public"."external_applications" IS 'Registry of external applications that can consume stories via API';



COMMENT ON COLUMN "public"."external_applications"."app_name" IS 'Unique identifier for the app (lowercase, no spaces)';



COMMENT ON COLUMN "public"."external_applications"."api_key_hash" IS 'API key for authentication - compare directly in simple mode';



COMMENT ON COLUMN "public"."external_applications"."allowed_story_types" IS 'Story types this app can access (e.g., testimony, case_study, advocacy)';



CREATE TABLE IF NOT EXISTS "public"."extracted_quotes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "quote_text" "text" NOT NULL,
    "author_id" "uuid",
    "author_name" character varying(255),
    "source_type" character varying(50),
    "source_id" "uuid",
    "context" "text",
    "themes" "text"[],
    "sentiment" character varying(20),
    "impact_score" numeric DEFAULT 0,
    "organization_id" "uuid",
    "project_id" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "search_vector" "tsvector" GENERATED ALWAYS AS ("to_tsvector"('"english"'::"regconfig", (("quote_text" || ' '::"text") || COALESCE("context", ''::"text")))) STORED
);


ALTER TABLE "public"."extracted_quotes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gallery_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "url" "text" NOT NULL,
    "media_type" "text" NOT NULL,
    "category" "text" DEFAULT 'gallery'::"text",
    "display_order" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "gallery_media_media_type_check" CHECK (("media_type" = ANY (ARRAY['photo'::"text", 'video'::"text"])))
);


ALTER TABLE "public"."gallery_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gallery_media_associations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "gallery_id" "uuid" NOT NULL,
    "media_asset_id" "uuid" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "is_cover_image" boolean DEFAULT false,
    "caption" "text",
    "cultural_context" "text"
);


ALTER TABLE "public"."gallery_media_associations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gallery_photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "gallery_id" "uuid" NOT NULL,
    "photo_url" "text" NOT NULL,
    "caption" "text",
    "photographer" "text",
    "order_index" integer DEFAULT 0,
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "source_empathy_entry_id" "uuid",
    "sync_date" timestamp with time zone,
    "privacy_level" "text" DEFAULT 'public'::"text"
);


ALTER TABLE "public"."gallery_photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."geographic_impact_patterns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "location_id" "uuid",
    "geographic_scope" "text" NOT NULL,
    "region_name" "text" NOT NULL,
    "primary_themes" "text"[] DEFAULT '{}'::"text"[],
    "storyteller_density" integer DEFAULT 0,
    "community_engagement_level" "text",
    "emerging_issues" "text"[] DEFAULT '{}'::"text"[],
    "success_patterns" "text"[] DEFAULT '{}'::"text"[],
    "resource_needs" "text"[] DEFAULT '{}'::"text"[],
    "collaboration_networks" "jsonb" DEFAULT '{}'::"jsonb",
    "theme_evolution_data" "jsonb" DEFAULT '{}'::"jsonb",
    "impact_trajectory" "text",
    "supporting_storytellers" "uuid"[] DEFAULT '{}'::"uuid"[],
    "key_stories" "text"[] DEFAULT '{}'::"text"[],
    "ai_analysis_confidence" numeric DEFAULT 0.0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."geographic_impact_patterns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."harvested_outcomes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "story_id" "uuid",
    "outcome_description" "text" NOT NULL,
    "change_type" character varying(50),
    "significance_level" character varying(20),
    "who_changed" "text",
    "what_changed" "text",
    "how_much_changed" "text",
    "contribution_narrative" "text",
    "evidence_source" "text",
    "evidence_quotes" "text"[],
    "is_unexpected" boolean DEFAULT false,
    "harvested_by" "uuid",
    "harvested_date" "date",
    "community_validated" boolean DEFAULT false,
    "validated_by" "uuid",
    "validated_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."harvested_outcomes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."impact_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "number" "text" NOT NULL,
    "label" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "display_order" integer DEFAULT 0,
    "section" "text" DEFAULT 'about'::"text",
    "is_visible" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."impact_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."impact_stories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid",
    "title" "text" NOT NULL,
    "narrative" "text" NOT NULL,
    "context" "text",
    "timeframe" "text",
    "measurable_outcomes" "text"[],
    "beneficiaries" "text"[],
    "scale_of_impact" "text",
    "suitable_for" "text"[],
    "professional_summary" "text",
    "key_achievements" "text"[],
    "cultural_significance" "text",
    "traditional_knowledge_involved" boolean DEFAULT false,
    "community_approval_required" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."impact_stories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "name" character varying(255) NOT NULL,
    "city" character varying(255),
    "state" character varying(255),
    "country" character varying(255) DEFAULT 'Australia'::character varying,
    "postal_code" character varying(20),
    "latitude" numeric(10,8),
    "longitude" numeric(11,8)
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."media_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "original_filename" character varying(255) NOT NULL,
    "display_name" character varying(255),
    "file_size" bigint NOT NULL,
    "file_type" character varying(100) NOT NULL,
    "storage_bucket" character varying(50) NOT NULL,
    "storage_path" "text" NOT NULL,
    "cdn_url" "text",
    "thumbnail_url" "text",
    "medium_url" "text",
    "large_url" "text",
    "processing_status" character varying(50) DEFAULT 'pending'::character varying,
    "processing_metadata" "jsonb",
    "cultural_sensitivity_level" character varying(50) DEFAULT 'standard'::character varying NOT NULL,
    "privacy_level" character varying(50) DEFAULT 'private'::character varying NOT NULL,
    "requires_consent" boolean DEFAULT false,
    "consent_granted" boolean DEFAULT false,
    "consent_granted_by" "uuid",
    "consent_granted_at" timestamp with time zone,
    "tenant_id" "uuid" NOT NULL,
    "uploader_id" "uuid" NOT NULL,
    "story_id" "uuid",
    "collection_id" "uuid",
    "title" character varying(255),
    "description" "text",
    "alt_text" "text",
    "width" integer,
    "height" integer,
    "duration" integer,
    "fps" numeric(5,2),
    "bitrate" integer,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "location_name" character varying(255),
    "taken_at" timestamp with time zone,
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "view_count" integer DEFAULT 0,
    "download_count" integer DEFAULT 0,
    "last_accessed_at" timestamp with time zone,
    "search_vector" "tsvector" GENERATED ALWAYS AS (((("setweight"("to_tsvector"('"english"'::"regconfig", (COALESCE("title", ''::character varying))::"text"), 'A'::"char") || "setweight"("to_tsvector"('"english"'::"regconfig", COALESCE("description", ''::"text")), 'B'::"char")) || "setweight"("to_tsvector"('"english"'::"regconfig", COALESCE("alt_text", ''::"text")), 'C'::"char")) || "setweight"("to_tsvector"('"english"'::"regconfig", (COALESCE("original_filename", ''::character varying))::"text"), 'D'::"char"))) STORED,
    "filename" "text",
    "url" "text",
    "media_type" "text",
    "transcript_id" "uuid",
    "file_path" "text",
    "mime_type" "text",
    "uploaded_by" "uuid",
    "organization_id" "uuid",
    "project_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "checksum" "text",
    "file_hash" "text",
    "source_type" "text" DEFAULT 'upload'::"text",
    "source_url" "text",
    "transcript_file_path" "text",
    "transcript_format" "text",
    "status" "text" DEFAULT 'active'::"text",
    "visibility" "text" DEFAULT 'public'::"text",
    "cultural_sensitivity" "text",
    "elder_approved" boolean DEFAULT false,
    "consent_obtained" boolean DEFAULT false,
    "usage_rights" "text",
    "views_count" integer DEFAULT 0,
    "downloads_count" integer DEFAULT 0,
    CONSTRAINT "media_assets_cultural_sensitivity_level_check" CHECK ((("cultural_sensitivity_level")::"text" = ANY ((ARRAY['standard'::character varying, 'culturally_sensitive'::character varying, 'requires_elder_approval'::character varying, 'sacred_content'::character varying])::"text"[]))),
    CONSTRAINT "media_assets_media_type_check" CHECK (("media_type" = ANY (ARRAY['image'::"text", 'video'::"text", 'audio'::"text", 'document'::"text", 'file'::"text"]))),
    CONSTRAINT "media_assets_privacy_level_check" CHECK ((("privacy_level")::"text" = ANY ((ARRAY['private'::character varying, 'organization'::character varying, 'community'::character varying, 'public'::character varying])::"text"[]))),
    CONSTRAINT "media_assets_processing_status_check" CHECK ((("processing_status")::"text" = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::"text"[]))),
    CONSTRAINT "media_assets_storage_bucket_check" CHECK ((("storage_bucket")::"text" = ANY ((ARRAY['media'::character varying, 'cultural'::character varying, 'documents'::character varying, 'thumbnails'::character varying, 'temp'::character varying])::"text"[])))
);


ALTER TABLE "public"."media_assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."media_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "type" "text" NOT NULL,
    "category" "text" NOT NULL,
    "url" "text" NOT NULL,
    "thumbnail_url" "text",
    "file_size" bigint NOT NULL,
    "duration" integer,
    "dimensions" "jsonb",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_by" "text" NOT NULL,
    "storyteller_id" "uuid",
    "story_id" "uuid",
    "cultural_sensitivity" "text" DEFAULT 'community'::"text" NOT NULL,
    "elder_approved" boolean DEFAULT false,
    "project_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "media_files_category_check" CHECK (("category" = ANY (ARRAY['story-media'::"text", 'team-photos'::"text", 'cultural-artifacts'::"text", 'community-events'::"text", 'educational'::"text", 'service-photos'::"text"]))),
    CONSTRAINT "media_files_cultural_sensitivity_check" CHECK (("cultural_sensitivity" = ANY (ARRAY['public'::"text", 'community'::"text", 'private'::"text", 'sacred'::"text"]))),
    CONSTRAINT "media_files_type_check" CHECK (("type" = ANY (ARRAY['image'::"text", 'video'::"text", 'audio'::"text", 'document'::"text"])))
);


ALTER TABLE "public"."media_files" OWNER TO "postgres";


COMMENT ON TABLE "public"."media_files" IS 'Media library for photos, videos, audio files with cultural sensitivity controls';



CREATE TABLE IF NOT EXISTS "public"."media_import_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "files" "jsonb" DEFAULT '[]'::"jsonb",
    "grouped_stories" "jsonb" DEFAULT '[]'::"jsonb",
    "stories_created" integer DEFAULT 0,
    "media_linked" integer DEFAULT 0,
    "errors" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "public"."media_import_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."media_usage_tracking" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "media_asset_id" "uuid",
    "used_in_type" "text",
    "used_in_id" "uuid",
    "usage_context" "text",
    "usage_role" "text",
    "added_by" "uuid",
    "ordinal_position" integer DEFAULT 0,
    CONSTRAINT "media_usage_tracking_usage_role_check" CHECK (("usage_role" = ANY (ARRAY['primary'::"text", 'thumbnail'::"text", 'background'::"text", 'inline'::"text", 'attachment'::"text"]))),
    CONSTRAINT "media_usage_tracking_used_in_type_check" CHECK (("used_in_type" = ANY (ARRAY['story'::"text", 'project'::"text", 'gallery'::"text", 'profile'::"text", 'organization'::"text"])))
);


ALTER TABLE "public"."media_usage_tracking" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."message_recipients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message_id" "uuid" NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "in_app_delivered_at" timestamp with time zone,
    "in_app_read_at" timestamp with time zone,
    "email_sent_at" timestamp with time zone,
    "email_opened_at" timestamp with time zone,
    "sms_sent_at" timestamp with time zone,
    "delivery_error" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."message_recipients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moderation_appeals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moderation_request_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "appeal_reason" "text" NOT NULL,
    "additional_context" "text",
    "appeal_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reviewed_at" timestamp with time zone,
    "reviewed_by" "uuid",
    "review_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "moderation_appeals_appeal_status_check" CHECK (("appeal_status" = ANY (ARRAY['pending'::"text", 'under_review'::"text", 'approved'::"text", 'denied'::"text"])))
);


ALTER TABLE "public"."moderation_appeals" OWNER TO "postgres";


COMMENT ON TABLE "public"."moderation_appeals" IS 'Appeals submitted for moderation decisions';



CREATE TABLE IF NOT EXISTS "public"."moderation_results" (
    "id" "text" NOT NULL,
    "content_id" "uuid" NOT NULL,
    "content_type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "moderation_details" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "elder_assignment" "jsonb",
    "review_deadline" timestamp with time zone,
    "appeals_available" boolean DEFAULT true,
    "moderated_by" "text" DEFAULT 'ai_system'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "moderation_results_content_type_check" CHECK (("content_type" = ANY (ARRAY['story'::"text", 'media'::"text", 'gallery'::"text", 'profile'::"text", 'comment'::"text"]))),
    CONSTRAINT "moderation_results_status_check" CHECK (("status" = ANY (ARRAY['approved'::"text", 'flagged'::"text", 'blocked'::"text", 'elder_review_required'::"text"])))
);


ALTER TABLE "public"."moderation_results" OWNER TO "postgres";


COMMENT ON TABLE "public"."moderation_results" IS 'Results from AI and elder cultural safety moderation';



CREATE OR REPLACE VIEW "public"."moderation_statistics" AS
 SELECT "date_trunc"('day'::"text", "created_at") AS "date",
    "count"(*) AS "total_moderated",
    "count"(*) FILTER (WHERE ("status" = 'approved'::"text")) AS "approved_count",
    "count"(*) FILTER (WHERE ("status" = 'flagged'::"text")) AS "flagged_count",
    "count"(*) FILTER (WHERE ("status" = 'blocked'::"text")) AS "blocked_count",
    "count"(*) FILTER (WHERE ("status" = 'elder_review_required'::"text")) AS "elder_review_count"
   FROM "public"."moderation_results"
  GROUP BY ("date_trunc"('day'::"text", "created_at"))
  ORDER BY ("date_trunc"('day'::"text", "created_at")) DESC;


ALTER VIEW "public"."moderation_statistics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."narrative_themes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "theme_name" character varying(100) NOT NULL,
    "theme_category" character varying(50),
    "theme_description" "text",
    "ai_confidence_score" numeric(3,2) DEFAULT 0.0,
    "related_themes" "text"[] DEFAULT '{}'::"text"[],
    "sentiment_score" numeric(3,2) DEFAULT 0.0,
    "usage_count" integer DEFAULT 0,
    "storyteller_count" integer DEFAULT 0,
    "first_detected_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "narrative_themes_ai_confidence_score_check" CHECK ((("ai_confidence_score" >= 0.0) AND ("ai_confidence_score" <= 1.0))),
    CONSTRAINT "narrative_themes_sentiment_score_check" CHECK ((("sentiment_score" >= '-1.0'::numeric) AND ("sentiment_score" <= 1.0)))
);


ALTER TABLE "public"."narrative_themes" OWNER TO "postgres";


COMMENT ON TABLE "public"."narrative_themes" IS 'AI-extracted and manually curated themes from storytelling content';



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "priority" "text" DEFAULT 'normal'::"text" NOT NULL,
    "action_url" "text",
    "action_label" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "is_read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notifications_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


COMMENT ON TABLE "public"."notifications" IS 'In-app notifications for users';



COMMENT ON COLUMN "public"."notifications"."type" IS 'Type of notification (moderation_result, elder_review_assigned, etc.)';



COMMENT ON COLUMN "public"."notifications"."priority" IS 'Priority level: low, normal, high, urgent';



COMMENT ON COLUMN "public"."notifications"."metadata" IS 'Additional context-specific data as JSON';



CREATE TABLE IF NOT EXISTS "public"."opportunity_recommendations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid",
    "opportunity_type" "text",
    "title" "text" NOT NULL,
    "organization" "text",
    "description" "text",
    "match_score" integer,
    "matching_skills" "text"[],
    "skill_gaps" "text"[],
    "application_strategy" "text",
    "suggested_approach" "text",
    "cultural_fit_analysis" "text",
    "funding_amount" "text",
    "salary_range" "text",
    "application_deadline" "date",
    "url" "text",
    "cultural_focus" boolean DEFAULT false,
    "community_impact_potential" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "opportunity_recommendations_match_score_check" CHECK ((("match_score" >= 0) AND ("match_score" <= 100))),
    CONSTRAINT "opportunity_recommendations_opportunity_type_check" CHECK (("opportunity_type" = ANY (ARRAY['career'::"text", 'grant'::"text", 'education'::"text", 'volunteer'::"text"])))
);


ALTER TABLE "public"."opportunity_recommendations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "themes" "jsonb" DEFAULT '[]'::"jsonb",
    "theme_count" integer DEFAULT 0,
    "dominant_themes" "text"[] DEFAULT ARRAY[]::"text"[],
    "key_quotes" "jsonb" DEFAULT '[]'::"jsonb",
    "quote_count" integer DEFAULT 0,
    "network_data" "jsonb" DEFAULT '{}'::"jsonb",
    "storyteller_connections" "jsonb" DEFAULT '{}'::"jsonb",
    "key_insights" "text"[] DEFAULT ARRAY[]::"text"[],
    "executive_summary" "text",
    "sentiment_analysis" "jsonb" DEFAULT '{}'::"jsonb",
    "transcript_count" integer DEFAULT 0,
    "story_count" integer DEFAULT 0,
    "total_word_count" integer DEFAULT 0,
    "generated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "last_analysis_at" timestamp with time zone
);


ALTER TABLE "public"."organization_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_contexts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "mission" "text",
    "vision" "text",
    "values" "text"[],
    "approach_description" "text",
    "cultural_frameworks" "text"[],
    "key_principles" "text"[],
    "impact_philosophy" "text",
    "impact_domains" "jsonb",
    "measurement_approach" "text",
    "website" "text",
    "theory_of_change_url" "text",
    "impact_report_urls" "text"[],
    "seed_interview_responses" "jsonb",
    "imported_document_text" "text",
    "context_type" character varying(20),
    "extraction_quality_score" integer,
    "ai_model_used" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "last_updated_by" "uuid",
    CONSTRAINT "organization_contexts_context_type_check" CHECK ((("context_type")::"text" = ANY ((ARRAY['seed_interview'::character varying, 'imported'::character varying, 'manual'::character varying])::"text"[]))),
    CONSTRAINT "organization_contexts_extraction_quality_score_check" CHECK ((("extraction_quality_score" >= 0) AND ("extraction_quality_score" <= 100)))
);


ALTER TABLE "public"."organization_contexts" OWNER TO "postgres";


COMMENT ON TABLE "public"."organization_contexts" IS 'Self-service context management for organizations. Stores mission, values, impact methodology used for AI analysis.';



COMMENT ON COLUMN "public"."organization_contexts"."impact_domains" IS 'JSONB structure organizing impact areas by level (individual, family, community, systems)';



COMMENT ON COLUMN "public"."organization_contexts"."seed_interview_responses" IS 'Original Q&A from seed interview for reference and re-processing';



COMMENT ON COLUMN "public"."organization_contexts"."extraction_quality_score" IS 'AI confidence in extraction quality (0-100). Helps identify contexts needing human review.';



CREATE TABLE IF NOT EXISTS "public"."organization_cross_transcript_insights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "insight_type" "text" NOT NULL,
    "insight_title" "text" NOT NULL,
    "insight_description" "text",
    "supporting_transcripts" "uuid"[] DEFAULT '{}'::"uuid"[],
    "supporting_quotes" "jsonb" DEFAULT '[]'::"jsonb",
    "related_themes" "text"[] DEFAULT '{}'::"text"[],
    "confidence_score" numeric(3,2) DEFAULT 0,
    "storyteller_coverage" integer DEFAULT 0,
    "significance" "text" DEFAULT 'medium'::"text",
    "generated_by" "text",
    "generated_at" timestamp with time zone DEFAULT "now"(),
    "is_featured" boolean DEFAULT false,
    "is_public" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "organization_cross_transcript_insights_confidence_score_check" CHECK ((("confidence_score" >= (0)::numeric) AND ("confidence_score" <= (1)::numeric))),
    CONSTRAINT "organization_cross_transcript_insights_insight_type_check" CHECK (("insight_type" = ANY (ARRAY['dominant_pattern'::"text", 'emerging_theme'::"text", 'cultural_marker'::"text", 'community_strength'::"text", 'knowledge_gap'::"text", 'connection_opportunity'::"text", 'impact_highlight'::"text"]))),
    CONSTRAINT "organization_cross_transcript_insights_significance_check" CHECK (("significance" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"])))
);


ALTER TABLE "public"."organization_cross_transcript_insights" OWNER TO "postgres";


COMMENT ON TABLE "public"."organization_cross_transcript_insights" IS 'AI-generated insights from analyzing organization transcripts collectively';



CREATE TABLE IF NOT EXISTS "public"."organization_duplicates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "primary_organization_id" "uuid",
    "duplicate_organization_id" "uuid",
    "similarity_score" numeric(5,4) NOT NULL,
    "matching_fields" "text"[] DEFAULT '{}'::"text"[],
    "confidence_level" character varying(20) NOT NULL,
    "resolution_status" character varying(20) DEFAULT 'pending'::character varying,
    "resolution_notes" "text",
    "detected_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" timestamp with time zone,
    "resolved_by" character varying(255),
    CONSTRAINT "organization_duplicates_check" CHECK (("primary_organization_id" <> "duplicate_organization_id"))
);


ALTER TABLE "public"."organization_duplicates" OWNER TO "postgres";


COMMENT ON TABLE "public"."organization_duplicates" IS 'Tracks potential duplicate organizations for entity resolution';



CREATE TABLE IF NOT EXISTS "public"."organization_enrichment" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "enrichment_type" character varying(50) NOT NULL,
    "data" "jsonb" NOT NULL,
    "confidence_score" numeric(3,2) NOT NULL,
    "source_metadata" "jsonb",
    "validation_status" character varying(20) DEFAULT 'pending'::character varying,
    "validated_by" character varying(255),
    "validated_at" timestamp with time zone,
    "validation_notes" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."organization_enrichment" OWNER TO "postgres";


COMMENT ON TABLE "public"."organization_enrichment" IS 'AI-extracted enrichment data for organizations';



CREATE TABLE IF NOT EXISTS "public"."organization_impact_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "total_storytellers" integer DEFAULT 0,
    "active_storytellers" integer DEFAULT 0,
    "featured_storytellers" integer DEFAULT 0,
    "elder_storytellers" integer DEFAULT 0,
    "total_transcripts" integer DEFAULT 0,
    "analyzed_transcripts" integer DEFAULT 0,
    "total_stories" integer DEFAULT 0,
    "published_stories" integer DEFAULT 0,
    "primary_themes" "text"[] DEFAULT '{}'::"text"[],
    "cultural_themes" "text"[] DEFAULT '{}'::"text"[],
    "theme_diversity_score" numeric(3,2) DEFAULT 0,
    "total_quotes" integer DEFAULT 0,
    "high_impact_quotes" integer DEFAULT 0,
    "most_powerful_quotes" "jsonb" DEFAULT '[]'::"jsonb",
    "storyteller_connection_density" numeric(3,2) DEFAULT 0,
    "cross_cultural_connections" integer DEFAULT 0,
    "overall_impact_score" numeric(5,2) DEFAULT 0,
    "cultural_preservation_score" numeric(5,2) DEFAULT 0,
    "community_engagement_score" numeric(5,2) DEFAULT 0,
    "knowledge_transmission_score" numeric(5,2) DEFAULT 0,
    "last_calculated_at" timestamp with time zone DEFAULT "now"(),
    "calculation_version" "text" DEFAULT 'v1'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organization_impact_metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."organization_impact_metrics" IS 'Aggregated impact metrics for organizations derived from storyteller transcripts and stories';



CREATE TABLE IF NOT EXISTS "public"."organization_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'member'::"text" NOT NULL,
    "profile_id" "uuid",
    "invitation_code" "text" DEFAULT "substr"("md5"((("random"())::"text" || ("clock_timestamp"())::"text")), 1, 32) NOT NULL,
    "invited_by" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "expires_at" timestamp with time zone NOT NULL,
    "accepted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."organization_invitations" OWNER TO "postgres";


COMMENT ON TABLE "public"."organization_invitations" IS 'Tracks email invitations sent to users to join organizations. Includes invitation codes and expiry dates.';



CREATE TABLE IF NOT EXISTS "public"."organization_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text" NOT NULL,
    "service_id" "uuid",
    "can_approve_stories" boolean DEFAULT false,
    "can_manage_reports" boolean DEFAULT false,
    "can_view_analytics" boolean DEFAULT false,
    "can_manage_members" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "join_date" "date" DEFAULT CURRENT_DATE,
    "end_date" "date",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "members_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'manager'::"text", 'coordinator'::"text", 'staff'::"text", 'member'::"text", 'contributor'::"text", 'elder'::"text", 'cultural_advisor'::"text", 'board_member'::"text"])))
);


ALTER TABLE "public"."organization_members" OWNER TO "postgres";


COMMENT ON TABLE "public"."organization_members" IS 'Links profiles (storytellers) to organizations with roles and permissions';



CREATE OR REPLACE VIEW "public"."organization_overview" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"uuid" AS "tenant_id",
    NULL::"text" AS "name",
    NULL::"text" AS "description",
    NULL::"text" AS "type",
    NULL::"text" AS "location",
    NULL::"text" AS "website_url",
    NULL::"text" AS "contact_email",
    NULL::"text" AS "logo_url",
    NULL::"jsonb" AS "cultural_protocols",
    NULL::"text" AS "cultural_significance",
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "updated_at",
    NULL::"text" AS "slug",
    NULL::"text" AS "subscription_tier",
    NULL::"text" AS "subscription_status",
    NULL::"text" AS "domain",
    NULL::"jsonb" AS "settings",
    NULL::timestamp with time zone AS "onboarded_at",
    NULL::"uuid" AS "location_id",
    NULL::"text" AS "legal_name",
    NULL::"text" AS "short_name",
    NULL::"text" AS "primary_color",
    NULL::"text" AS "secondary_color",
    NULL::"text" AS "tagline",
    NULL::"text" AS "mission_statement",
    NULL::"text" AS "traditional_country",
    NULL::"text"[] AS "language_groups",
    NULL::"text"[] AS "service_locations",
    NULL::"point" AS "coordinates",
    NULL::"text" AS "website",
    NULL::"text" AS "email",
    NULL::"text" AS "phone",
    NULL::"text" AS "postal_address",
    NULL::"text" AS "physical_address",
    NULL::"date" AS "established_date",
    NULL::"text" AS "abn",
    NULL::boolean AS "indigenous_controlled",
    NULL::"text" AS "governance_model",
    NULL::boolean AS "empathy_ledger_enabled",
    NULL::boolean AS "annual_reports_enabled",
    NULL::boolean AS "impact_tracking_enabled",
    NULL::boolean AS "has_cultural_protocols",
    NULL::boolean AS "elder_approval_required",
    NULL::"uuid"[] AS "cultural_advisor_ids",
    NULL::"text" AS "default_story_access_level",
    NULL::boolean AS "require_story_approval",
    NULL::"uuid" AS "created_by",
    NULL::"jsonb" AS "metadata",
    NULL::bigint AS "member_count",
    NULL::bigint AS "service_count",
    NULL::bigint AS "story_count",
    NULL::bigint AS "report_count";


ALTER VIEW "public"."organization_overview" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "role" "public"."organization_role" DEFAULT 'community_member'::"public"."organization_role" NOT NULL,
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"(),
    "revoked_at" timestamp with time zone,
    "is_active" boolean GENERATED ALWAYS AS (("revoked_at" IS NULL)) STORED,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organization_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."organization_roles" IS 'Manages user roles within organizations with full audit trail';



COMMENT ON COLUMN "public"."organization_roles"."granted_by" IS 'The user who granted this role (NULL for system/initial grants)';



COMMENT ON COLUMN "public"."organization_roles"."is_active" IS 'Computed column: true when role is not revoked';



CREATE TABLE IF NOT EXISTS "public"."organization_services" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "service_name" "text" NOT NULL,
    "service_slug" "text" NOT NULL,
    "description" "text",
    "service_category" "text" NOT NULL,
    "manager_profile_id" "uuid",
    "staff_count" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "start_date" "date",
    "clients_served_annual" integer,
    "budget_annual" numeric,
    "impact_categories" "text"[],
    "story_count" integer DEFAULT 0,
    "service_color" "text",
    "icon_name" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "services_category_check" CHECK (("service_category" = ANY (ARRAY['health'::"text", 'youth'::"text", 'family'::"text", 'education'::"text", 'culture'::"text", 'environment'::"text", 'economic'::"text", 'justice'::"text", 'housing'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."organization_services" OWNER TO "postgres";


COMMENT ON TABLE "public"."organization_services" IS 'Programs, departments, or services within an organization';



CREATE TABLE IF NOT EXISTS "public"."organization_storyteller_network" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "storyteller_a_id" "uuid" NOT NULL,
    "storyteller_b_id" "uuid" NOT NULL,
    "connection_type" "text" NOT NULL,
    "connection_strength" numeric(3,2) DEFAULT 0,
    "shared_themes" "text"[] DEFAULT '{}'::"text"[],
    "shared_projects" "uuid"[] DEFAULT '{}'::"uuid"[],
    "shared_cultural_background" "text",
    "geographic_proximity" "text",
    "theme_overlap_count" integer DEFAULT 0,
    "collaboration_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "different_storytellers" CHECK (("storyteller_a_id" <> "storyteller_b_id")),
    CONSTRAINT "ordered_storytellers" CHECK (("storyteller_a_id" < "storyteller_b_id")),
    CONSTRAINT "organization_storyteller_network_connection_strength_check" CHECK ((("connection_strength" >= (0)::numeric) AND ("connection_strength" <= (1)::numeric))),
    CONSTRAINT "organization_storyteller_network_connection_type_check" CHECK (("connection_type" = ANY (ARRAY['theme_overlap'::"text", 'geographic'::"text", 'cultural_affiliation'::"text", 'project_collaboration'::"text", 'mentor_mentee'::"text", 'knowledge_exchange'::"text"])))
);


ALTER TABLE "public"."organization_storyteller_network" OWNER TO "postgres";


COMMENT ON TABLE "public"."organization_storyteller_network" IS 'Network graph of storyteller connections within organizations';



CREATE TABLE IF NOT EXISTS "public"."organization_theme_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "theme" "text" NOT NULL,
    "theme_category" "text",
    "total_occurrences" integer DEFAULT 0,
    "transcript_count" integer DEFAULT 0,
    "story_count" integer DEFAULT 0,
    "storyteller_count" integer DEFAULT 0,
    "first_occurrence_date" timestamp with time zone,
    "last_occurrence_date" timestamp with time zone,
    "monthly_trend" "jsonb" DEFAULT '[]'::"jsonb",
    "average_confidence_score" numeric(3,2) DEFAULT 0,
    "cultural_relevance" "text" DEFAULT 'medium'::"text",
    "representative_quotes" "text"[] DEFAULT '{}'::"text"[],
    "key_storytellers" "uuid"[] DEFAULT '{}'::"uuid"[],
    "related_themes" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "organization_theme_analytics_cultural_relevance_check" CHECK (("cultural_relevance" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'sacred'::"text"]))),
    CONSTRAINT "organization_theme_analytics_theme_category_check" CHECK (("theme_category" = ANY (ARRAY['cultural'::"text", 'family'::"text", 'land'::"text", 'resilience'::"text", 'knowledge'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."organization_theme_analytics" OWNER TO "postgres";


COMMENT ON TABLE "public"."organization_theme_analytics" IS 'Theme analytics and evolution tracking for organizations';



CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "type" "text" DEFAULT 'community'::"text",
    "location" "text",
    "website_url" "text",
    "contact_email" "text",
    "logo_url" "text",
    "cultural_protocols" "jsonb" DEFAULT '{}'::"jsonb",
    "cultural_significance" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "slug" "text",
    "subscription_tier" "text" DEFAULT 'free'::"text",
    "subscription_status" "text" DEFAULT 'active'::"text",
    "domain" "text",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "onboarded_at" timestamp with time zone,
    "location_id" "uuid",
    "legal_name" "text",
    "short_name" "text",
    "primary_color" "text",
    "secondary_color" "text",
    "tagline" "text",
    "mission_statement" "text",
    "traditional_country" "text",
    "language_groups" "text"[],
    "service_locations" "text"[],
    "coordinates" "point",
    "website" "text",
    "email" "text",
    "phone" "text",
    "postal_address" "text",
    "physical_address" "text",
    "established_date" "date",
    "abn" "text",
    "indigenous_controlled" boolean DEFAULT true,
    "governance_model" "text",
    "empathy_ledger_enabled" boolean DEFAULT true,
    "annual_reports_enabled" boolean DEFAULT true,
    "impact_tracking_enabled" boolean DEFAULT true,
    "has_cultural_protocols" boolean DEFAULT true,
    "elder_approval_required" boolean DEFAULT false,
    "cultural_advisor_ids" "uuid"[],
    "default_story_access_level" "text" DEFAULT 'community'::"text",
    "require_story_approval" boolean DEFAULT false,
    "created_by" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "justicehub_enabled" boolean DEFAULT false,
    "justicehub_synced_at" timestamp without time zone,
    "cultural_identity" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "governance_structure" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "default_permissions" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "elder_oversight_required" boolean DEFAULT false,
    "community_approval_required" boolean DEFAULT false,
    "collaboration_settings" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "shared_vocabularies" "text"[] DEFAULT ARRAY[]::"text"[],
    "status" "public"."organization_status" DEFAULT 'active'::"public"."organization_status",
    "guest_pin" character varying(10),
    "guest_access_enabled" boolean DEFAULT false,
    "tier" "public"."organization_tier" DEFAULT 'community'::"public"."organization_tier",
    "billing_status" "public"."billing_status" DEFAULT 'active'::"public"."billing_status",
    "billing_contact_email" "text",
    "distribution_policy" "jsonb" DEFAULT '{"embed": {"enabled": true, "default_domains": []}, "defaults": {"block_sacred_external": true, "require_verified_consent": true, "require_elder_approval_high": true}, "webhooks": {"enabled": true}, "external_syndication": {"enabled": true}}'::"jsonb" NOT NULL,
    CONSTRAINT "chk_collaboration_settings_valid" CHECK ("public"."validate_collaboration_settings"("collaboration_settings")),
    CONSTRAINT "chk_cultural_identity_valid" CHECK ("public"."validate_cultural_identity"("cultural_identity")),
    CONSTRAINT "chk_cultural_protocols_valid" CHECK ("public"."validate_cultural_protocols"("cultural_protocols")),
    CONSTRAINT "chk_default_permissions_valid" CHECK ("public"."validate_default_permissions"("default_permissions")),
    CONSTRAINT "chk_governance_structure_valid" CHECK ("public"."validate_governance_structure"("governance_structure")),
    CONSTRAINT "organizations_type_check" CHECK (("type" = ANY (ARRAY['aboriginal_community'::"text", 'torres_strait_islander'::"text", 'indigenous_ngo'::"text", 'government_service'::"text", 'healthcare'::"text", 'education'::"text", 'environmental'::"text", 'social_services'::"text", 'arts_culture'::"text", 'economic_development'::"text", 'other'::"text", 'community'::"text", 'philanthropy'::"text"])))
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


COMMENT ON TABLE "public"."organizations" IS 'Any organization using Empathy Ledger - Indigenous communities, NGOs, government services';



COMMENT ON COLUMN "public"."organizations"."tenant_id" IS 'Tenant identifier for multi-tenant support. Defaults to organization ID.';



COMMENT ON COLUMN "public"."organizations"."cultural_protocols" IS 'JSONB containing cultural protocols, guidelines, and ceremonial practices';



COMMENT ON COLUMN "public"."organizations"."justicehub_enabled" IS 'Controls if organization appears on JusticeHub';



COMMENT ON COLUMN "public"."organizations"."justicehub_synced_at" IS 'When organization was last synced to JusticeHub';



COMMENT ON COLUMN "public"."organizations"."cultural_identity" IS 'JSONB containing cultural identity information including traditions, values, and practices';



COMMENT ON COLUMN "public"."organizations"."governance_structure" IS 'JSONB containing governance model, decision-making processes, and leadership structure';



COMMENT ON COLUMN "public"."organizations"."default_permissions" IS 'JSONB containing default access permissions for organization members and resources';



COMMENT ON COLUMN "public"."organizations"."elder_oversight_required" IS 'Boolean indicating if elder oversight is required for sensitive content';



COMMENT ON COLUMN "public"."organizations"."community_approval_required" IS 'Boolean indicating if community approval is required for public content';



COMMENT ON COLUMN "public"."organizations"."collaboration_settings" IS 'JSONB containing settings for cross-organizational collaboration';



COMMENT ON COLUMN "public"."organizations"."shared_vocabularies" IS 'Array of shared vocabulary terms and cultural concepts';



COMMENT ON COLUMN "public"."organizations"."status" IS 'Organization operational status using enum values';



COMMENT ON COLUMN "public"."organizations"."guest_pin" IS 'PIN code for field worker guest access (4-6 digits)';



COMMENT ON COLUMN "public"."organizations"."guest_access_enabled" IS 'Whether guest/field worker PIN access is enabled';



CREATE TABLE IF NOT EXISTS "public"."outcomes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "outcome_type" "text" NOT NULL,
    "outcome_level" "text" NOT NULL,
    "service_area" "text" NOT NULL,
    "indicator_name" "text" NOT NULL,
    "measurement_method" "text",
    "baseline_value" numeric,
    "target_value" numeric,
    "current_value" numeric,
    "unit" "text",
    "qualitative_evidence" "text"[],
    "success_stories" "text"[],
    "challenges" "text"[],
    "learnings" "text"[],
    "source_document_ids" "uuid"[],
    "related_story_ids" "uuid"[],
    "activity_ids" "uuid"[],
    "participant_count" integer,
    "cultural_protocols_followed" boolean DEFAULT true,
    "elder_involvement" boolean DEFAULT false,
    "traditional_knowledge_transmitted" boolean DEFAULT false,
    "on_country_component" boolean DEFAULT false,
    "language_use" "text"[],
    "measurement_date" "date",
    "reported_by" "uuid",
    "verified_by" "uuid",
    "verification_date" "date",
    "data_quality" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "source_empathy_entry_id" "uuid",
    "sync_date" timestamp with time zone,
    CONSTRAINT "outcomes_data_quality_check" CHECK (("data_quality" = ANY (ARRAY['excellent'::"text", 'good'::"text", 'fair'::"text", 'needs_improvement'::"text"]))),
    CONSTRAINT "outcomes_outcome_level_check" CHECK (("outcome_level" = ANY (ARRAY['output'::"text", 'short_term'::"text", 'medium_term'::"text", 'long_term'::"text", 'impact'::"text"]))),
    CONSTRAINT "outcomes_outcome_type_check" CHECK (("outcome_type" = ANY (ARRAY['individual'::"text", 'program'::"text", 'community'::"text", 'systemic'::"text"]))),
    CONSTRAINT "outcomes_service_area_check" CHECK (("service_area" = ANY (ARRAY['youth_mentorship'::"text", 'true_justice'::"text", 'atnarpa_homestead'::"text", 'cultural_brokerage'::"text", 'good_news_stories'::"text", 'general'::"text"]))),
    CONSTRAINT "positive_values" CHECK (((("baseline_value" IS NULL) OR ("baseline_value" >= (0)::numeric)) AND (("target_value" IS NULL) OR ("target_value" >= (0)::numeric)) AND (("current_value" IS NULL) OR ("current_value" >= (0)::numeric))))
);


ALTER TABLE "public"."outcomes" OWNER TO "postgres";


COMMENT ON TABLE "public"."outcomes" IS 'Tracks measured outcomes across all Oonchiumpa services';



CREATE TABLE IF NOT EXISTS "public"."partner_analytics_daily" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "app_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "date" "date" NOT NULL,
    "total_views" integer DEFAULT 0,
    "unique_visitors" integer DEFAULT 0,
    "total_read_time_seconds" integer DEFAULT 0,
    "avg_scroll_depth" numeric(5,2),
    "shares" integer DEFAULT 0,
    "clicks_to_empathy_ledger" integer DEFAULT 0,
    "stories_displayed" integer DEFAULT 0,
    "stories_with_engagement" integer DEFAULT 0,
    "top_stories" "jsonb" DEFAULT '[]'::"jsonb",
    "top_countries" "jsonb" DEFAULT '[]'::"jsonb",
    "top_cities" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."partner_analytics_daily" OWNER TO "postgres";


COMMENT ON TABLE "public"."partner_analytics_daily" IS 'Daily aggregated engagement metrics per partner and project';



CREATE TABLE IF NOT EXISTS "public"."partner_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "thread_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "parent_message_id" "uuid",
    "app_id" "uuid" NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "sender_type" "text" NOT NULL,
    "sender_user_id" "uuid",
    "subject" "text",
    "content" "text" NOT NULL,
    "content_html" "text",
    "story_id" "uuid",
    "project_id" "uuid",
    "request_id" "uuid",
    "is_read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "is_archived" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "partner_messages_sender_type_check" CHECK (("sender_type" = ANY (ARRAY['partner'::"text", 'storyteller'::"text"])))
);


ALTER TABLE "public"."partner_messages" OWNER TO "postgres";


COMMENT ON TABLE "public"."partner_messages" IS 'Secure messaging between partners and storytellers without exposing contact info';



CREATE TABLE IF NOT EXISTS "public"."partner_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "app_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "slug" "text" NOT NULL,
    "themes" "text"[] DEFAULT '{}'::"text"[],
    "story_types" "text"[] DEFAULT '{}'::"text"[],
    "geographic_focus" "text",
    "show_storyteller_names" boolean DEFAULT true,
    "show_storyteller_photos" boolean DEFAULT true,
    "allow_full_content" boolean DEFAULT true,
    "custom_branding" "jsonb" DEFAULT '{}'::"jsonb",
    "embed_config" "jsonb" DEFAULT '{"limit": 12, "theme": "light", "layout": "grid", "columns": 3, "showFilters": true}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "stories_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."partner_projects" OWNER TO "postgres";


COMMENT ON TABLE "public"."partner_projects" IS 'Collections of stories organized by campaign, theme, or purpose for partner organizations';



CREATE TABLE IF NOT EXISTS "public"."partner_team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "app_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text",
    "invited_by" "uuid",
    "invited_email" "text",
    "invitation_token" "uuid" DEFAULT "gen_random_uuid"(),
    "invited_at" timestamp with time zone DEFAULT "now"(),
    "accepted_at" timestamp with time zone,
    "permissions" "jsonb" DEFAULT '{"can_manage_team": false, "can_send_messages": true, "can_view_analytics": true, "can_manage_projects": true, "can_manage_settings": false, "can_request_stories": true}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "partner_team_members_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'member'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."partner_team_members" OWNER TO "postgres";


COMMENT ON TABLE "public"."partner_team_members" IS 'Team members who can manage a partner organization account';



CREATE TABLE IF NOT EXISTS "public"."story_syndication_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "app_id" "uuid" NOT NULL,
    "requested_by" "uuid",
    "request_message" "text",
    "requested_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'pending'::"text",
    "responded_at" timestamp with time zone,
    "decline_reason" "text",
    "consent_id" "uuid",
    "expires_at" timestamp with time zone DEFAULT ("now"() + '30 days'::interval),
    CONSTRAINT "story_syndication_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'declined'::"text", 'revoked'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."story_syndication_requests" OWNER TO "postgres";


COMMENT ON TABLE "public"."story_syndication_requests" IS 'Requests from partners to feature stories, requiring storyteller approval';



CREATE OR REPLACE VIEW "public"."partner_dashboard_summary" AS
 SELECT "ptm"."app_id",
    "ptm"."user_id",
    "ea"."app_name",
    ( SELECT "count"(*) AS "count"
           FROM "public"."partner_projects"
          WHERE (("partner_projects"."app_id" = "ptm"."app_id") AND ("partner_projects"."is_active" = true))) AS "active_projects",
    ( SELECT "count"(*) AS "count"
           FROM "public"."story_syndication_requests"
          WHERE (("story_syndication_requests"."app_id" = "ptm"."app_id") AND ("story_syndication_requests"."status" = 'approved'::"text"))) AS "approved_stories",
    ( SELECT "count"(*) AS "count"
           FROM "public"."story_syndication_requests"
          WHERE (("story_syndication_requests"."app_id" = "ptm"."app_id") AND ("story_syndication_requests"."status" = 'pending'::"text"))) AS "pending_requests",
    ( SELECT "count"(*) AS "count"
           FROM "public"."partner_messages"
          WHERE (("partner_messages"."app_id" = "ptm"."app_id") AND ("partner_messages"."is_read" = false) AND ("partner_messages"."sender_type" = 'storyteller'::"text"))) AS "unread_messages",
    ( SELECT "sum"("partner_analytics_daily"."total_views") AS "sum"
           FROM "public"."partner_analytics_daily"
          WHERE (("partner_analytics_daily"."app_id" = "ptm"."app_id") AND ("partner_analytics_daily"."date" >= (CURRENT_DATE - '30 days'::interval)))) AS "views_30d"
   FROM ("public"."partner_team_members" "ptm"
     JOIN "public"."external_applications" "ea" ON (("ea"."id" = "ptm"."app_id")))
  WHERE ("ptm"."accepted_at" IS NOT NULL);


ALTER VIEW "public"."partner_dashboard_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."partner_message_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "content" "text" NOT NULL,
    "category" "text" DEFAULT 'general'::"text",
    "variables" "text"[] DEFAULT '{}'::"text"[],
    "times_used" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "partner_message_templates_category_check" CHECK (("category" = ANY (ARRAY['general'::"text", 'request'::"text", 'follow_up'::"text", 'thank_you'::"text", 'impact'::"text"])))
);


ALTER TABLE "public"."partner_message_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."partners" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "category" "text" NOT NULL,
    "logo_url" "text",
    "website" "text",
    "display_order" integer DEFAULT 0,
    "is_visible" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."partners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."personal_insights" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid",
    "narrative_themes" "text"[],
    "core_values" "text"[],
    "life_philosophy" "text",
    "personal_strengths" "text"[],
    "growth_areas" "text"[],
    "cultural_identity_markers" "text"[],
    "traditional_knowledge_areas" "text"[],
    "community_connections" "text"[],
    "transcript_count" integer DEFAULT 0,
    "confidence_score" numeric(3,2) DEFAULT 0.0,
    "last_analyzed_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."personal_insights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photo_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "media_asset_id" "uuid" NOT NULL,
    "gallery_id" "uuid",
    "view_count" integer DEFAULT 0,
    "download_count" integer DEFAULT 0,
    "share_count" integer DEFAULT 0,
    "like_count" integer DEFAULT 0,
    "comment_count" integer DEFAULT 0,
    "search_appearances" integer DEFAULT 0,
    "recommendation_clicks" integer DEFAULT 0,
    "face_recognition_uses" integer DEFAULT 0,
    "tag_contributions" integer DEFAULT 0,
    "load_time_avg_ms" integer,
    "cdn_cache_hits" integer DEFAULT 0,
    "storage_tier" character varying(20),
    "last_viewed_at" timestamp with time zone,
    "last_downloaded_at" timestamp with time zone,
    "last_shared_at" timestamp with time zone,
    "cultural_engagement_score" double precision,
    "community_impact_score" double precision,
    "tenant_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."photo_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photo_faces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "media_asset_id" "uuid" NOT NULL,
    "face_encoding" "jsonb",
    "bounding_box" "jsonb" NOT NULL,
    "landmarks" "jsonb",
    "detection_confidence" double precision NOT NULL,
    "person_id" "uuid",
    "person_confidence" double precision,
    "is_confirmed" boolean DEFAULT false,
    "confirmed_by" "uuid",
    "confirmed_at" timestamp with time zone,
    "cluster_id" "uuid",
    "cluster_confidence" double precision,
    "privacy_level" character varying(50) DEFAULT 'private'::character varying,
    "cultural_sensitivity" character varying(50) DEFAULT 'standard'::character varying,
    "requires_consent" boolean DEFAULT true,
    "detection_model" character varying(100),
    "processing_version" character varying(50),
    "tenant_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "photo_faces_detection_confidence_check" CHECK ((("detection_confidence" >= (0)::double precision) AND ("detection_confidence" <= (1)::double precision))),
    CONSTRAINT "photo_faces_person_confidence_check" CHECK ((("person_confidence" >= (0)::double precision) AND ("person_confidence" <= (1)::double precision)))
);


ALTER TABLE "public"."photo_faces" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photo_galleries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "cover_photo_id" "uuid",
    "gallery_type" character varying(50) NOT NULL,
    "storyteller_id" "uuid",
    "organization_id" "uuid",
    "project_id" "uuid",
    "privacy_level" character varying(50) DEFAULT 'private'::character varying NOT NULL,
    "cultural_sensitivity_level" character varying(50) DEFAULT 'standard'::character varying NOT NULL,
    "requires_elder_approval" boolean DEFAULT false,
    "photo_count" integer DEFAULT 0,
    "total_size_bytes" bigint DEFAULT 0,
    "last_updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "auto_organize_enabled" boolean DEFAULT true,
    "face_grouping_enabled" boolean DEFAULT false,
    "location_grouping_enabled" boolean DEFAULT true,
    "search_vector" "tsvector" GENERATED ALWAYS AS (("setweight"("to_tsvector"('"english"'::"regconfig", (COALESCE("title", ''::character varying))::"text"), 'A'::"char") || "setweight"("to_tsvector"('"english"'::"regconfig", COALESCE("description", ''::"text")), 'B'::"char"))) STORED,
    CONSTRAINT "photo_galleries_cultural_sensitivity_level_check" CHECK ((("cultural_sensitivity_level")::"text" = ANY ((ARRAY['standard'::character varying, 'culturally_sensitive'::character varying, 'requires_elder_approval'::character varying, 'sacred_content'::character varying])::"text"[]))),
    CONSTRAINT "photo_galleries_gallery_type_check" CHECK ((("gallery_type")::"text" = ANY ((ARRAY['storyteller'::character varying, 'organization'::character varying, 'project'::character varying, 'standalone'::character varying, 'shared'::character varying])::"text"[]))),
    CONSTRAINT "photo_galleries_privacy_level_check" CHECK ((("privacy_level")::"text" = ANY ((ARRAY['private'::character varying, 'organization'::character varying, 'community'::character varying, 'public'::character varying])::"text"[])))
);


ALTER TABLE "public"."photo_galleries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photo_gallery_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "gallery_id" "uuid" NOT NULL,
    "media_asset_id" "uuid" NOT NULL,
    "display_order" integer,
    "is_featured" boolean DEFAULT false,
    "caption" "text",
    "added_at" timestamp with time zone DEFAULT "now"(),
    "added_by" "uuid" NOT NULL
);


ALTER TABLE "public"."photo_gallery_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photo_locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "photo_id" "uuid" NOT NULL,
    "location_id" "uuid" NOT NULL,
    "location_context" character varying(50) DEFAULT 'taken_at'::character varying NOT NULL,
    "description" "text",
    "gps_accuracy_meters" integer,
    "is_approximate" boolean DEFAULT false,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "photo_locations_location_context_check" CHECK ((("location_context")::"text" = ANY ((ARRAY['taken_at'::character varying, 'depicts'::character varying, 'related_to'::character varying, 'near'::character varying])::"text"[])))
);


ALTER TABLE "public"."photo_locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photo_memories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "subtitle" character varying(255),
    "description" "text",
    "memory_type" character varying(50) NOT NULL,
    "media_asset_ids" "uuid"[] NOT NULL,
    "cover_photo_id" "uuid",
    "gallery_id" "uuid",
    "for_user_id" "uuid",
    "for_organization_id" "uuid",
    "tenant_id" "uuid" NOT NULL,
    "display_date" "date" NOT NULL,
    "is_active" boolean DEFAULT true,
    "was_viewed" boolean DEFAULT false,
    "viewed_at" timestamp with time zone,
    "view_count" integer DEFAULT 0,
    "cultural_sensitivity_level" character varying(50) DEFAULT 'standard'::character varying,
    "privacy_level" character varying(50) DEFAULT 'private'::character varying,
    "generation_metadata" "jsonb",
    "generation_model" character varying(100),
    "generation_confidence" double precision,
    "engagement_score" double precision,
    "quality_score" double precision,
    "created_by_ai" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    CONSTRAINT "photo_memories_memory_type_check" CHECK ((("memory_type")::"text" = ANY ((ARRAY['this_day'::character varying, 'recent_highlights'::character varying, 'trip'::character varying, 'person'::character varying, 'event'::character varying, 'year_review'::character varying, 'cultural_celebration'::character varying, 'organization_milestone'::character varying])::"text"[])))
);


ALTER TABLE "public"."photo_memories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photo_organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "photo_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "organization_role" character varying(50) DEFAULT 'activity'::character varying NOT NULL,
    "description" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "photo_organizations_organization_role_check" CHECK ((("organization_role")::"text" = ANY ((ARRAY['activity'::character varying, 'event'::character varying, 'milestone'::character varying, 'collaboration'::character varying, 'service'::character varying])::"text"[])))
);


ALTER TABLE "public"."photo_organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photo_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "photo_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "project_role" character varying(50) DEFAULT 'documentation'::character varying NOT NULL,
    "description" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "photo_projects_project_role_check" CHECK ((("project_role")::"text" = ANY ((ARRAY['documentation'::character varying, 'milestone'::character varying, 'activity'::character varying, 'outcome'::character varying, 'planning'::character varying])::"text"[])))
);


ALTER TABLE "public"."photo_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photo_storytellers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "photo_id" "uuid" NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "relationship_type" character varying(50) DEFAULT 'featured_in'::character varying NOT NULL,
    "role_description" "text",
    "consent_given" boolean DEFAULT true,
    "consent_date" timestamp with time zone DEFAULT "now"(),
    "privacy_override" character varying(50),
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "photo_storytellers_relationship_type_check" CHECK ((("relationship_type")::"text" = ANY ((ARRAY['featured_in'::character varying, 'photographed_by'::character varying, 'mentioned_in'::character varying, 'related_to'::character varying])::"text"[])))
);


ALTER TABLE "public"."photo_storytellers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photo_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "media_asset_id" "uuid" NOT NULL,
    "tag_type" character varying(50) NOT NULL,
    "tag_value" "text" NOT NULL,
    "confidence_score" double precision,
    "source" character varying(50) NOT NULL,
    "person_id" "uuid",
    "organization_id" "uuid",
    "project_id" "uuid",
    "location_name" character varying(255),
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "location_confidence" double precision,
    "is_verified" boolean DEFAULT false,
    "verified_by" "uuid",
    "verified_at" timestamp with time zone,
    "cultural_sensitivity" character varying(50) DEFAULT 'standard'::character varying,
    "requires_review" boolean DEFAULT false,
    "tenant_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "photo_tags_confidence_score_check" CHECK ((("confidence_score" >= (0)::double precision) AND ("confidence_score" <= (1)::double precision))),
    CONSTRAINT "photo_tags_source_check" CHECK ((("source")::"text" = ANY ((ARRAY['manual'::character varying, 'ai_vision'::character varying, 'ai_facial'::character varying, 'ai_object'::character varying, 'ai_scene'::character varying, 'exif'::character varying, 'user'::character varying, 'claude_vision'::character varying])::"text"[]))),
    CONSTRAINT "photo_tags_tag_type_check" CHECK ((("tag_type")::"text" = ANY ((ARRAY['person'::character varying, 'organization'::character varying, 'project'::character varying, 'location'::character varying, 'event'::character varying, 'object'::character varying, 'scene'::character varying, 'emotion'::character varying, 'custom'::character varying])::"text"[])))
);


ALTER TABLE "public"."photo_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."platform_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "period_start" timestamp with time zone NOT NULL,
    "period_end" timestamp with time zone NOT NULL,
    "period_type" character varying(20) NOT NULL,
    "total_storytellers" integer DEFAULT 0,
    "active_storytellers" integer DEFAULT 0,
    "new_storytellers" integer DEFAULT 0,
    "returning_storytellers" integer DEFAULT 0,
    "total_stories" integer DEFAULT 0,
    "stories_created" integer DEFAULT 0,
    "total_transcripts" integer DEFAULT 0,
    "transcripts_processed" integer DEFAULT 0,
    "total_quotes" integer DEFAULT 0,
    "quotes_extracted" integer DEFAULT 0,
    "total_themes" integer DEFAULT 0,
    "new_themes_discovered" integer DEFAULT 0,
    "top_themes" "jsonb" DEFAULT '{}'::"jsonb",
    "theme_distribution" "jsonb" DEFAULT '{}'::"jsonb",
    "trending_themes" "text"[] DEFAULT '{}'::"text"[],
    "total_connections" integer DEFAULT 0,
    "new_connections" integer DEFAULT 0,
    "connection_success_rate" numeric(3,2) DEFAULT 0.0,
    "average_connections_per_storyteller" numeric(5,2) DEFAULT 0.0,
    "average_story_quality" numeric(3,2) DEFAULT 0.0,
    "average_ai_confidence" numeric(3,2) DEFAULT 0.0,
    "high_impact_stories_count" integer DEFAULT 0,
    "viral_content_count" integer DEFAULT 0,
    "storyteller_locations" "jsonb" DEFAULT '{}'::"jsonb",
    "demographic_distribution" "jsonb" DEFAULT '{}'::"jsonb",
    "geographic_diversity_score" numeric(3,2) DEFAULT 0.0,
    "cultural_diversity_score" numeric(3,2) DEFAULT 0.0,
    "user_retention_rate" numeric(3,2) DEFAULT 0.0,
    "content_creation_velocity" numeric(5,2) DEFAULT 0.0,
    "community_health_score" numeric(3,2) DEFAULT 0.0,
    "system_performance_score" numeric(3,2) DEFAULT 0.0,
    "ai_jobs_completed" integer DEFAULT 0,
    "ai_processing_success_rate" numeric(3,2) DEFAULT 0.0,
    "average_ai_processing_time" numeric(6,2) DEFAULT 0.0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "platform_analytics_period_type_check" CHECK ((("period_type")::"text" = ANY ((ARRAY['daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'quarterly'::character varying, 'yearly'::character varying])::"text"[])))
);


ALTER TABLE "public"."platform_analytics" OWNER TO "postgres";


COMMENT ON TABLE "public"."platform_analytics" IS 'High-level platform metrics and KPIs for administrative dashboards';



CREATE TABLE IF NOT EXISTS "public"."platform_stats_cache" (
    "id" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "total_stories" integer DEFAULT 0,
    "total_storytellers" integer DEFAULT 0,
    "total_organizations" integer DEFAULT 0,
    "total_projects" integer DEFAULT 0,
    "total_transcripts" integer DEFAULT 0,
    "total_media_assets" integer DEFAULT 0,
    "stories_last_7_days" integer DEFAULT 0,
    "stories_last_30_days" integer DEFAULT 0,
    "active_users_last_7_days" integer DEFAULT 0,
    "active_users_last_30_days" integer DEFAULT 0,
    "stories_with_analysis" integer DEFAULT 0,
    "analysis_coverage_percent" numeric(5,2) DEFAULT 0,
    "stale_analysis_count" integer DEFAULT 0,
    "total_storage_bytes" bigint DEFAULT 0,
    "theme_trends" "jsonb" DEFAULT '[]'::"jsonb",
    "pending_reviews" integer DEFAULT 0,
    "pending_elder_reviews" integer DEFAULT 0,
    "failed_uploads" integer DEFAULT 0,
    "ai_jobs_pending" integer DEFAULT 0,
    "ai_jobs_failed_24h" integer DEFAULT 0,
    "webhook_failures_24h" integer DEFAULT 0
);


ALTER TABLE "public"."platform_stats_cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."privacy_changes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "field_name" "text",
    "old_value" "text",
    "new_value" "text",
    "changes" "jsonb",
    "impact" "jsonb",
    "reason" "text",
    "timestamp" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."privacy_changes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."processing_jobs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "type" character varying(50) NOT NULL,
    "status" character varying(20) DEFAULT 'queued'::character varying,
    "priority" character varying(20) DEFAULT 'medium'::character varying,
    "source_urls" "text"[] DEFAULT '{}'::"text"[],
    "data_source_id" "uuid",
    "configuration" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "progress_percentage" integer DEFAULT 0,
    "results_summary" "jsonb",
    "error_message" "text",
    "retry_count" integer DEFAULT 0,
    "max_retries" integer DEFAULT 3,
    "scheduled_at" timestamp with time zone,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "estimated_completion" timestamp with time zone,
    "created_by" character varying(255),
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."processing_jobs" OWNER TO "postgres";


COMMENT ON TABLE "public"."processing_jobs" IS 'Queue and status tracking for scraping and processing jobs';



CREATE TABLE IF NOT EXISTS "public"."professional_competencies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid",
    "skill_name" "text" NOT NULL,
    "skill_category" "text",
    "competency_level" integer,
    "market_value_score" integer,
    "evidence_from_transcript" "text",
    "real_world_applications" "text"[],
    "transferable_contexts" "text"[],
    "development_opportunities" "text"[],
    "skill_gap_analysis" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "professional_competencies_competency_level_check" CHECK ((("competency_level" >= 1) AND ("competency_level" <= 10))),
    CONSTRAINT "professional_competencies_market_value_score_check" CHECK ((("market_value_score" >= 1) AND ("market_value_score" <= 10)))
);


ALTER TABLE "public"."professional_competencies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_galleries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "profile_id" "uuid" NOT NULL,
    "gallery_id" "uuid" NOT NULL,
    "role" character varying(100) DEFAULT 'contributor'::character varying
);


ALTER TABLE "public"."profile_galleries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "profile_id" "uuid" NOT NULL,
    "location_id" "uuid" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "location_type" character varying(50)
);


ALTER TABLE "public"."profile_locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "profile_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "role" character varying(100) DEFAULT 'member'::character varying,
    "joined_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."profile_organizations" OWNER TO "postgres";


COMMENT ON TABLE "public"."profile_organizations" IS 'Junction table linking profiles to organizations with role information. Supports multi-tenant users belonging to multiple organizations.';



CREATE TABLE IF NOT EXISTS "public"."profile_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "profile_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "role" character varying(100) DEFAULT 'participant'::character varying,
    "joined_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profile_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_analyses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "model_used" "text" NOT NULL,
    "analysis_type" "text" NOT NULL,
    "content_hash" "text" NOT NULL,
    "analysis_data" "jsonb" NOT NULL,
    "analyzed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."project_analyses" OWNER TO "postgres";


COMMENT ON TABLE "public"."project_analyses" IS 'Cached AI analysis results for projects to avoid regenerating on every page load';



CREATE TABLE IF NOT EXISTS "public"."project_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "themes" "jsonb" DEFAULT '[]'::"jsonb",
    "theme_count" integer DEFAULT 0,
    "project_objectives" "jsonb" DEFAULT '[]'::"jsonb",
    "participant_quotes" "jsonb" DEFAULT '[]'::"jsonb",
    "success_stories" "jsonb" DEFAULT '[]'::"jsonb",
    "stakeholder_network" "jsonb" DEFAULT '{}'::"jsonb",
    "participant_demographics" "jsonb" DEFAULT '{}'::"jsonb",
    "impact_metrics" "jsonb" DEFAULT '{}'::"jsonb",
    "outcomes" "jsonb" DEFAULT '[]'::"jsonb",
    "milestones" "jsonb" DEFAULT '[]'::"jsonb",
    "key_learnings" "text"[] DEFAULT ARRAY[]::"text"[],
    "recommendations" "text"[] DEFAULT ARRAY[]::"text"[],
    "challenges" "text"[] DEFAULT ARRAY[]::"text"[],
    "participant_count" integer DEFAULT 0,
    "transcript_count" integer DEFAULT 0,
    "total_engagement_hours" numeric,
    "generated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "last_analysis_at" timestamp with time zone
);


ALTER TABLE "public"."project_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_contexts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "purpose" "text",
    "context" "text",
    "target_population" "text",
    "expected_outcomes" "jsonb",
    "success_criteria" "text"[],
    "timeframe" "text",
    "program_model" "text",
    "cultural_approaches" "text"[],
    "key_activities" "text"[],
    "seed_interview_text" "text",
    "existing_documents" "text",
    "context_type" character varying(20),
    "ai_extracted" boolean DEFAULT false,
    "extraction_quality_score" integer,
    "ai_model_used" character varying(50),
    "inherits_from_org" boolean DEFAULT true,
    "custom_fields" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "last_updated_by" "uuid",
    CONSTRAINT "project_contexts_context_type_check" CHECK ((("context_type")::"text" = ANY ((ARRAY['quick'::character varying, 'full'::character varying, 'imported'::character varying, 'manual'::character varying])::"text"[]))),
    CONSTRAINT "project_contexts_extraction_quality_score_check" CHECK ((("extraction_quality_score" >= 0) AND ("extraction_quality_score" <= 100)))
);


ALTER TABLE "public"."project_contexts" OWNER TO "postgres";


COMMENT ON TABLE "public"."project_contexts" IS 'Self-service context management for projects. Enables project-specific outcomes tracking instead of generic metrics.';



COMMENT ON COLUMN "public"."project_contexts"."expected_outcomes" IS 'Structured JSONB array of project outcomes with categories, descriptions, indicators, and timeframes for AI analysis';



COMMENT ON COLUMN "public"."project_contexts"."context_type" IS 'How context was created: quick (basic), full (seed interview), imported (from docs), manual (hand-entered)';



COMMENT ON COLUMN "public"."project_contexts"."inherits_from_org" IS 'If TRUE, project inherits cultural frameworks and values from organization context';



CREATE TABLE IF NOT EXISTS "public"."project_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "media_asset_id" "uuid",
    "usage_context" "text" DEFAULT 'general'::"text",
    "display_order" integer DEFAULT 0,
    "uploaded_by" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'partner'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "storyteller_id" "uuid",
    "role" "text" DEFAULT 'participant'::"text",
    "joined_at" timestamp without time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'active'::"text",
    "notes" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "mission" "text",
    "primary_goals" "text"[],
    "target_population" "text",
    "origin_story" "text",
    "community_need" "text",
    "who_initiated" "text",
    "program_model" "text",
    "key_activities" "text"[],
    "cultural_approaches" "text"[],
    "cultural_protocols" "text"[],
    "outcome_categories" "jsonb"[],
    "short_term_outcomes" "text"[],
    "medium_term_outcomes" "text"[],
    "long_term_outcomes" "text"[],
    "success_indicators" "jsonb"[],
    "positive_language" "text"[],
    "challenge_language" "text"[],
    "transformation_markers" "text"[],
    "individual_impact" "text"[],
    "family_impact" "text"[],
    "community_impact" "text"[],
    "systems_impact" "text"[],
    "cultural_values" "text"[],
    "indigenous_frameworks" "text"[],
    "community_wisdom" "text"[],
    "completeness_score" integer,
    "last_reviewed_at" timestamp with time zone,
    "approved_by" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."project_profiles" IS 'Extracted project profiles for AI-guided analysis';



CREATE TABLE IF NOT EXISTS "public"."project_seed_interviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "interview_transcript" "text",
    "interview_audio_url" "text",
    "interview_date" timestamp with time zone DEFAULT "now"(),
    "interviewed_by" "text",
    "extracted_context" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_seed_interviews" OWNER TO "postgres";


COMMENT ON TABLE "public"."project_seed_interviews" IS 'Seed interview transcripts for full project context setup';



CREATE TABLE IF NOT EXISTS "public"."project_storytellers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'participant'::"text",
    "joined_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_storytellers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_updates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_updates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "organization_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "location" "text",
    "status" "text" DEFAULT 'active'::"text",
    "start_date" "date",
    "end_date" "date",
    "budget" numeric(12,2),
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "location_id" "uuid",
    "context_model" "text" DEFAULT 'none'::"text",
    "context_description" "text",
    "context_updated_at" timestamp with time zone,
    "justicehub_enabled" boolean DEFAULT false,
    "justicehub_program_type" "text",
    "justicehub_synced_at" timestamp without time zone,
    CONSTRAINT "projects_context_model_check" CHECK (("context_model" = ANY (ARRAY['none'::"text", 'quick'::"text", 'full'::"text"]))),
    CONSTRAINT "projects_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'completed'::"text", 'on_hold'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


COMMENT ON COLUMN "public"."projects"."context_model" IS 'Type of context: none, quick (simple text), full (seed interview)';



COMMENT ON COLUMN "public"."projects"."context_description" IS 'Quick setup: Free-text project description for AI context';



COMMENT ON COLUMN "public"."projects"."justicehub_enabled" IS 'Controls if project appears on JusticeHub as community program';



COMMENT ON COLUMN "public"."projects"."justicehub_program_type" IS 'Type of community program for JusticeHub categorization';



COMMENT ON COLUMN "public"."projects"."justicehub_synced_at" IS 'When project was last synced to JusticeHub';



CREATE TABLE IF NOT EXISTS "public"."quotes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "story_id" "uuid",
    "author_id" "uuid" NOT NULL,
    "quote_text" "text" NOT NULL,
    "context_before" "text",
    "context_after" "text",
    "extracted_by_ai" boolean DEFAULT false,
    "ai_confidence_score" numeric(3,2),
    "extraction_model" "text",
    "themes" "jsonb" DEFAULT '[]'::"jsonb",
    "emotional_tone" "text",
    "significance_score" numeric(3,2),
    "quote_type" "text",
    "cultural_sensitivity" "text" DEFAULT 'standard'::"text",
    "requires_attribution" boolean DEFAULT true,
    "attribution_approved" boolean DEFAULT false,
    "storyteller_approved" boolean DEFAULT false,
    "usage_permissions" "jsonb" DEFAULT '[]'::"jsonb",
    "usage_count" integer DEFAULT 0,
    "last_used_at" timestamp with time zone,
    "visibility" "text" DEFAULT 'private'::"text",
    "legacy_quote_id" "uuid",
    "transcript_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "legacy_story_id" "uuid",
    "legacy_transcript_id" "uuid",
    "legacy_storyteller_id" "uuid",
    "migrated_at" timestamp with time zone,
    CONSTRAINT "quotes_visibility_check" CHECK (("visibility" = ANY (ARRAY['private'::"text", 'community'::"text", 'public'::"text"])))
);


ALTER TABLE "public"."quotes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report_feedback" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "profile_id" "uuid",
    "feedback_type" "text" NOT NULL,
    "rating" integer,
    "feedback_text" "text",
    "liked_sections" "text"[],
    "improvement_areas" "text"[],
    "missing_content" "text",
    "design_feedback" "text",
    "is_addressed" boolean DEFAULT false,
    "response_text" "text",
    "responded_by" "uuid",
    "responded_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "report_feedback_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."report_feedback" OWNER TO "postgres";


COMMENT ON TABLE "public"."report_feedback" IS 'Community and stakeholder feedback on published reports';



CREATE TABLE IF NOT EXISTS "public"."report_sections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "section_type" "text" NOT NULL,
    "section_title" "text" NOT NULL,
    "section_content" "text",
    "display_order" integer DEFAULT 0,
    "page_break_before" boolean DEFAULT false,
    "layout_style" "text" DEFAULT 'standard'::"text",
    "background_color" "text",
    "include_stories" boolean DEFAULT false,
    "story_ids" "uuid"[],
    "include_media" boolean DEFAULT false,
    "media_ids" "uuid"[],
    "include_data_viz" boolean DEFAULT false,
    "data_viz_config" "jsonb",
    "custom_content" "text",
    "content_format" "text" DEFAULT 'markdown'::"text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "created_by" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."report_sections" OWNER TO "postgres";


COMMENT ON TABLE "public"."report_sections" IS 'Custom content sections within annual reports';



CREATE TABLE IF NOT EXISTS "public"."report_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "template_name" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "description" "text",
    "category" "text" DEFAULT 'general'::"text",
    "design_config" "jsonb" DEFAULT '{"typography": "traditional", "colorScheme": "earth_tones", "layoutStyle": "storytelling", "patternStyle": "indigenous", "includePatterns": true}'::"jsonb" NOT NULL,
    "default_sections" "jsonb" NOT NULL,
    "cover_template_url" "text",
    "header_template_url" "text",
    "footer_template_url" "text",
    "is_public" boolean DEFAULT true,
    "organization_id" "uuid",
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "created_by" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."report_templates" OWNER TO "postgres";


COMMENT ON TABLE "public"."report_templates" IS 'Reusable report design templates';



CREATE TABLE IF NOT EXISTS "public"."ripple_effects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid",
    "project_id" "uuid",
    "ripple_level" integer,
    "ripple_label" character varying(50),
    "effect_description" "text" NOT NULL,
    "people_affected" integer,
    "geographic_scope" character varying(100),
    "time_lag_days" integer,
    "triggered_by" "uuid",
    "evidence" "text",
    "reported_by" "uuid",
    "reported_date" timestamp with time zone DEFAULT "now"(),
    "verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ripple_effects_ripple_level_check" CHECK ((("ripple_level" >= 1) AND ("ripple_level" <= 5)))
);


ALTER TABLE "public"."ripple_effects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scraped_services" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "name" character varying(255) NOT NULL,
    "description" "text",
    "category" character varying(100),
    "subcategory" character varying(100),
    "eligibility_criteria" "text"[],
    "cost_structure" character varying(50),
    "availability_schedule" "jsonb",
    "contact_info" "jsonb",
    "outcomes_evidence" "text"[],
    "geographical_coverage" "jsonb",
    "target_demographics" "jsonb",
    "capacity_indicators" "jsonb",
    "confidence_score" numeric(3,2) NOT NULL,
    "source_url" "text",
    "extraction_timestamp" timestamp with time zone,
    "validation_status" character varying(20) DEFAULT 'pending'::character varying,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."scraped_services" OWNER TO "postgres";


COMMENT ON TABLE "public"."scraped_services" IS 'Service offerings discovered through AI scraping';



CREATE TABLE IF NOT EXISTS "public"."scraper_health_metrics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "data_source_id" "uuid",
    "metric_name" character varying(100) NOT NULL,
    "metric_value" numeric(10,4),
    "metric_unit" character varying(20),
    "status" character varying(20) DEFAULT 'normal'::character varying,
    "threshold_warning" numeric(10,4),
    "threshold_critical" numeric(10,4),
    "measurement_timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "alert_sent" boolean DEFAULT false,
    "alert_sent_at" timestamp with time zone,
    "notes" "text"
);


ALTER TABLE "public"."scraper_health_metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."scraper_health_metrics" IS 'Monitoring metrics for scraper system health';



CREATE TABLE IF NOT EXISTS "public"."scraping_metadata" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid",
    "source_type" character varying(50) NOT NULL,
    "source_url" "text" NOT NULL,
    "discovery_method" character varying(50) NOT NULL,
    "extraction_method" character varying(50) NOT NULL,
    "scraping_timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "ai_processing_version" character varying(20) NOT NULL,
    "confidence_scores" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "validation_status" character varying(20) DEFAULT 'pending'::character varying,
    "data_lineage" "jsonb" DEFAULT '[]'::"jsonb",
    "quality_flags" "jsonb" DEFAULT '[]'::"jsonb",
    "last_updated" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."scraping_metadata" OWNER TO "postgres";


COMMENT ON TABLE "public"."scraping_metadata" IS 'Tracks metadata about AI scraping processes for organizations';



CREATE TABLE IF NOT EXISTS "public"."service_impact" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "service_area" "text" NOT NULL,
    "reporting_period" "text" NOT NULL,
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "total_participants" integer,
    "new_participants" integer,
    "returning_participants" integer,
    "completion_rate" numeric,
    "retention_rate" numeric,
    "activities_delivered" integer,
    "total_activity_hours" numeric,
    "on_country_hours" numeric,
    "elder_involvement_hours" numeric,
    "outcomes_achieved" integer,
    "outcomes_in_progress" integer,
    "target_achievement_rate" numeric,
    "cultural_connection_improved" integer,
    "skills_developed" integer,
    "leadership_roles_assumed" integer,
    "school_reengagement" integer,
    "reduced_justice_involvement" integer,
    "community_events_held" integer,
    "community_participation" integer,
    "partnerships_activated" integer,
    "service_referrals_made" integer,
    "referral_success_rate" numeric,
    "traditional_knowledge_sessions" integer,
    "language_use_sessions" integer,
    "cultural_protocols_maintained_rate" numeric,
    "elder_satisfaction_rate" numeric,
    "success_stories_count" integer,
    "key_achievements" "text"[],
    "challenges_faced" "text"[],
    "learnings_identified" "text"[],
    "testimonials" "text"[],
    "photos_collected" integer,
    "videos_produced" integer,
    "documents_created" integer,
    "stories_published" integer,
    "budget_allocated" numeric,
    "budget_spent" numeric,
    "cost_per_participant" numeric,
    "outcome_ids" "uuid"[],
    "activity_ids" "uuid"[],
    "document_ids" "uuid"[],
    "story_ids" "uuid"[],
    "compiled_by" "uuid",
    "reviewed_by" "uuid",
    "approved_by" "uuid",
    "approval_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "service_impact_service_area_check" CHECK (("service_area" = ANY (ARRAY['youth_mentorship'::"text", 'true_justice'::"text", 'atnarpa_homestead'::"text", 'cultural_brokerage'::"text", 'good_news_stories'::"text"]))),
    CONSTRAINT "valid_period" CHECK (("period_end" >= "period_start")),
    CONSTRAINT "valid_rates" CHECK (((("completion_rate" IS NULL) OR (("completion_rate" >= (0)::numeric) AND ("completion_rate" <= (100)::numeric))) AND (("retention_rate" IS NULL) OR (("retention_rate" >= (0)::numeric) AND ("retention_rate" <= (100)::numeric))) AND (("target_achievement_rate" IS NULL) OR (("target_achievement_rate" >= (0)::numeric) AND ("target_achievement_rate" <= (100)::numeric)))))
);


ALTER TABLE "public"."service_impact" OWNER TO "postgres";


COMMENT ON TABLE "public"."service_impact" IS 'Aggregates impact data by service area for reporting';



CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "image_url" "text",
    "features" "jsonb" DEFAULT '[]'::"jsonb",
    "icon_svg" "text",
    "display_order" integer DEFAULT 0,
    "is_visible" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sroi_calculations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sroi_input_id" "uuid" NOT NULL,
    "total_investment" numeric(12,2) NOT NULL,
    "total_social_value" numeric(12,2) NOT NULL,
    "net_social_value" numeric(12,2),
    "sroi_ratio" numeric(10,2) NOT NULL,
    "sensitivity_conservative" numeric(10,2),
    "sensitivity_optimistic" numeric(10,2),
    "calculation_date" timestamp with time zone DEFAULT "now"(),
    "calculated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sroi_calculations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sroi_inputs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "organization_id" "uuid",
    "total_investment" numeric(12,2) NOT NULL,
    "funding_sources" "jsonb",
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "discount_rate" double precision DEFAULT 0.035,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sroi_inputs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sroi_outcomes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sroi_input_id" "uuid" NOT NULL,
    "outcome_type" character varying(50) NOT NULL,
    "outcome_description" "text" NOT NULL,
    "stakeholder_group" character varying(50) NOT NULL,
    "beneficiary_count" integer,
    "unit_of_measurement" character varying(50),
    "quantity" numeric(12,2),
    "financial_proxy" numeric(12,2),
    "deadweight" double precision DEFAULT 0,
    "attribution" double precision DEFAULT 1.0,
    "drop_off" double precision DEFAULT 0,
    "displacement" double precision DEFAULT 0,
    "duration_years" integer DEFAULT 1,
    "total_value" numeric(12,2),
    "evidence_source" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sroi_outcomes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."stories_with_trust_indicators" AS
 SELECT "id",
    "tenant_id",
    "author_id",
    "title",
    "content",
    "summary",
    "media_url",
    "transcription",
    "video_embed_code",
    "story_image_url",
    "story_image_file",
    "themes",
    "story_category",
    "story_type",
    "privacy_level",
    "is_public",
    "is_featured",
    "cultural_sensitivity_level",
    "cultural_warnings",
    "requires_elder_approval",
    "elder_approved_by",
    "elder_approved_at",
    "sharing_permissions",
    "cross_tenant_visibility",
    "embedding",
    "ai_processed",
    "ai_processing_consent_verified",
    "ai_confidence_scores",
    "ai_generated_summary",
    "search_vector",
    "community_status",
    "reviewed_by",
    "reviewed_at",
    "review_notes",
    "legacy_story_id",
    "airtable_record_id",
    "fellowship_phase",
    "fellow_id",
    "created_at",
    "updated_at",
    "cultural_themes",
    "legacy_storyteller_id",
    "legacy_airtable_id",
    "legacy_fellow_id",
    "legacy_author",
    "migrated_at",
    "migration_quality_score",
    "ai_enhanced_content",
    "media_urls",
    "published_at",
    "status",
    "media_metadata",
    "cultural_sensitivity_flag",
    "traditional_knowledge_flag",
    "story_stage",
    "video_stage",
    "source_links",
    "storyteller_id",
    "transcript_id",
    "media_attachments",
    "has_explicit_consent",
    "consent_details",
    "project_id",
    "organization_id",
    "location_id",
    "location_text",
    "latitude",
    "longitude",
    "service_id",
    "source_empathy_entry_id",
    "sync_date",
    "is_archived",
    "archived_at",
    "archived_by",
    "archive_reason",
    "embeds_enabled",
    "sharing_enabled",
    "allowed_embed_domains",
    "consent_withdrawn_at",
    "consent_withdrawal_reason",
    "anonymization_status",
    "anonymization_requested_at",
    "anonymized_at",
    "anonymized_fields",
    "original_author_display",
    "ownership_status",
    "original_author_id",
    "ownership_transferred_at",
    "provenance_chain",
    "views_count",
    "likes_count",
    "shares_count",
    "permission_tier",
    "consent_verified_at",
    "archive_consent_given",
    "elder_reviewed",
    "elder_reviewed_at",
    "elder_reviewer_id",
        CASE
            WHEN ("permission_tier" = 'private'::"public"."permission_tier") THEN 'Private'::"text"
            WHEN ("permission_tier" = 'trusted_circle'::"public"."permission_tier") THEN 'Trusted Circle'::"text"
            WHEN ("permission_tier" = 'community'::"public"."permission_tier") THEN 'Community'::"text"
            WHEN ("permission_tier" = 'public'::"public"."permission_tier") THEN 'Public'::"text"
            WHEN ("permission_tier" = 'archive'::"public"."permission_tier") THEN 'Archive'::"text"
            ELSE NULL::"text"
        END AS "permission_tier_label",
        CASE
            WHEN ("permission_tier" = 'private'::"public"."permission_tier") THEN '🔴'::"text"
            WHEN ("permission_tier" = 'trusted_circle'::"public"."permission_tier") THEN '🟡'::"text"
            WHEN ("permission_tier" = 'community'::"public"."permission_tier") THEN '🟢'::"text"
            WHEN ("permission_tier" = 'public'::"public"."permission_tier") THEN '🔵'::"text"
            WHEN ("permission_tier" = 'archive'::"public"."permission_tier") THEN '⚪'::"text"
            ELSE NULL::"text"
        END AS "permission_tier_emoji",
    "elder_reviewed" AS "has_elder_review",
        CASE
            WHEN "elder_reviewed" THEN '👑'::"text"
            ELSE ''::"text"
        END AS "elder_badge",
        CASE
            WHEN ("consent_verified_at" > ("now"() - '30 days'::interval)) THEN true
            ELSE false
        END AS "consent_recently_verified",
    (("status" = 'published'::"text") AND ("permission_tier" = ANY (ARRAY['public'::"public"."permission_tier", 'archive'::"public"."permission_tier"]))) AS "is_publicly_shareable"
   FROM "public"."stories" "s";


ALTER VIEW "public"."stories_with_trust_indicators" OWNER TO "postgres";


COMMENT ON VIEW "public"."stories_with_trust_indicators" IS 'Stories with computed trust badge indicators for UI display';



CREATE TABLE IF NOT EXISTS "public"."story_access_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "app_id" "uuid" NOT NULL,
    "access_type" "text" NOT NULL,
    "accessed_at" timestamp with time zone DEFAULT "now"(),
    "accessor_ip" "text",
    "accessor_user_agent" "text",
    "access_context" "jsonb",
    CONSTRAINT "story_access_log_access_type_check" CHECK (("access_type" = ANY (ARRAY['view'::"text", 'embed'::"text", 'export'::"text"])))
);


ALTER TABLE "public"."story_access_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."story_access_log" IS 'Audit trail for all external story access';



COMMENT ON COLUMN "public"."story_access_log"."access_type" IS 'Type of access: view, embed, or export';



COMMENT ON COLUMN "public"."story_access_log"."access_context" IS 'Additional context about the access (page URL, etc.)';



CREATE TABLE IF NOT EXISTS "public"."story_access_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "token" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "revoked" boolean DEFAULT false NOT NULL,
    "max_views" integer,
    "view_count" integer DEFAULT 0 NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_accessed_at" timestamp with time zone,
    "purpose" "text",
    "shared_to" "text"[],
    "watermark_text" "text",
    "tenant_id" "uuid" NOT NULL,
    CONSTRAINT "story_access_tokens_purpose_check" CHECK (("purpose" = ANY (ARRAY['social-media'::"text", 'email'::"text", 'embed'::"text", 'direct-share'::"text", 'partner'::"text"])))
);


ALTER TABLE "public"."story_access_tokens" OWNER TO "postgres";


COMMENT ON TABLE "public"."story_access_tokens" IS 'Ephemeral, revocable access tokens for story sharing. Enables storytellers to control their shared content.';



COMMENT ON COLUMN "public"."story_access_tokens"."token" IS 'Unique URL-safe token (e.g., nanoid). Used in shareable URLs: /s/{token}';



COMMENT ON COLUMN "public"."story_access_tokens"."purpose" IS 'Why this token was created: social-media, email, embed, direct-share, partner';



COMMENT ON COLUMN "public"."story_access_tokens"."shared_to" IS 'Array tracking where this link was shared: [twitter, facebook, email, etc.]';



COMMENT ON COLUMN "public"."story_access_tokens"."watermark_text" IS 'Optional watermark to apply to images when accessed via this token';



CREATE TABLE IF NOT EXISTS "public"."story_distributions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "platform" "text" NOT NULL,
    "platform_post_id" "text",
    "distribution_url" "text",
    "embed_domain" "text",
    "status" "text" DEFAULT 'active'::"text",
    "revoked_at" timestamp with time zone,
    "revoked_by" "uuid",
    "revocation_reason" "text",
    "view_count" integer DEFAULT 0,
    "last_viewed_at" timestamp with time zone,
    "click_count" integer DEFAULT 0,
    "consent_version" "text",
    "consent_snapshot" "jsonb",
    "webhook_url" "text",
    "webhook_secret" "text",
    "webhook_notified_at" timestamp with time zone,
    "webhook_response" "jsonb",
    "webhook_retry_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "notes" "text",
    "expires_at" timestamp with time zone,
    CONSTRAINT "story_distributions_platform_check" CHECK (("platform" = ANY (ARRAY['embed'::"text", 'twitter'::"text", 'facebook'::"text", 'linkedin'::"text", 'website'::"text", 'blog'::"text", 'api'::"text", 'rss'::"text", 'newsletter'::"text", 'custom'::"text"]))),
    CONSTRAINT "story_distributions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'revoked'::"text", 'expired'::"text", 'pending'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."story_distributions" OWNER TO "postgres";


COMMENT ON TABLE "public"."story_distributions" IS 'Tracks where stories have been distributed externally (embeds, social media, websites)';



CREATE TABLE IF NOT EXISTS "public"."story_engagement_daily" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "storyteller_id" "uuid",
    "platform_name" "text" NOT NULL,
    "date" "date" NOT NULL,
    "view_count" integer DEFAULT 0 NOT NULL,
    "read_count" integer DEFAULT 0 NOT NULL,
    "share_count" integer DEFAULT 0 NOT NULL,
    "action_count" integer DEFAULT 0 NOT NULL,
    "total_read_time_seconds" integer DEFAULT 0 NOT NULL,
    "avg_scroll_depth" integer,
    "top_countries" "jsonb",
    "mobile_percent" integer,
    "desktop_percent" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."story_engagement_daily" OWNER TO "postgres";


COMMENT ON TABLE "public"."story_engagement_daily" IS 'Aggregated daily engagement stats for dashboard performance';



CREATE TABLE IF NOT EXISTS "public"."story_engagement_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "storyteller_id" "uuid",
    "platform_id" "uuid",
    "platform_name" "text" DEFAULT 'empathy_ledger'::"text" NOT NULL,
    "event_type" "text" NOT NULL,
    "read_time_seconds" integer,
    "scroll_depth" integer,
    "referrer" "text",
    "utm_source" "text",
    "utm_medium" "text",
    "utm_campaign" "text",
    "country_code" "text",
    "region" "text",
    "city" "text",
    "device_type" "text",
    "browser" "text",
    "session_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "story_engagement_events_device_type_check" CHECK (("device_type" = ANY (ARRAY['mobile'::"text", 'tablet'::"text", 'desktop'::"text", 'unknown'::"text"]))),
    CONSTRAINT "story_engagement_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['view'::"text", 'read'::"text", 'share'::"text", 'click'::"text", 'action'::"text"])))
);


ALTER TABLE "public"."story_engagement_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."story_engagement_events" IS 'Raw engagement events from all platforms displaying stories';



COMMENT ON COLUMN "public"."story_engagement_events"."platform_name" IS 'Platform that displayed the story (justicehub, act_place, empathy_ledger, etc.)';



COMMENT ON COLUMN "public"."story_engagement_events"."session_id" IS 'Anonymous session ID for deduplication (not user-identifying)';



CREATE TABLE IF NOT EXISTS "public"."story_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "storage_path" "text" NOT NULL,
    "public_url" "text" NOT NULL,
    "thumbnail_url" "text",
    "alt_text" "text",
    "caption" "text",
    "photographer_name" "text",
    "photographer_id" "uuid",
    "photo_location" "text",
    "photo_date" "date",
    "is_primary" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "width" integer,
    "height" integer,
    "file_size" integer,
    "mime_type" "text",
    "cultural_sensitivity_flag" boolean DEFAULT false,
    "requires_elder_approval" boolean DEFAULT false,
    "elder_approved" boolean DEFAULT false,
    "uploaded_at" timestamp without time zone DEFAULT "now"(),
    "uploaded_by" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."story_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."story_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "media_type" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "supabase_bucket" "text" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_size" bigint,
    "media_embedding" "public"."vector"(512),
    "ml_analysis" "jsonb",
    "requires_permission" boolean DEFAULT false,
    "people_in_media" "uuid"[],
    "all_permissions_obtained" boolean DEFAULT false,
    "caption" "text",
    "alt_text" "text",
    "display_order" integer DEFAULT 0,
    "is_public" boolean DEFAULT true,
    "is_featured" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "created_by" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "story_media_media_type_check" CHECK (("media_type" = ANY (ARRAY['photo'::"text", 'video'::"text", 'audio'::"text", 'document'::"text"])))
);


ALTER TABLE "public"."story_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."story_narrative_arcs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "arc_type" character varying(50) NOT NULL,
    "arc_confidence" double precision,
    "trajectory_data" "jsonb" NOT NULL,
    "segments" "jsonb",
    "emotional_range" double precision,
    "volatility" double precision,
    "transformation_score" double precision,
    "peak_moment" double precision,
    "valley_moment" double precision,
    "analyzed_at" timestamp with time zone DEFAULT "now"(),
    "analysis_version" character varying(20) DEFAULT 'v1.0'::character varying,
    "analysis_method" character varying(50) DEFAULT 'openai_gpt4'::character varying,
    "community_validated" boolean DEFAULT false,
    "validated_by" "uuid",
    "validation_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "story_narrative_arcs_arc_confidence_check" CHECK ((("arc_confidence" >= (0)::double precision) AND ("arc_confidence" <= (1)::double precision)))
);


ALTER TABLE "public"."story_narrative_arcs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."story_project_features" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "act_project_id" "uuid" NOT NULL,
    "approved_by_act" boolean DEFAULT false NOT NULL,
    "is_visible" boolean GENERATED ALWAYS AS ("approved_by_act") STORED,
    "featured_quote" "text",
    "featured_image_url" "text",
    "tagged_at" timestamp with time zone DEFAULT "now"(),
    "tagged_by" "uuid",
    "approved_at" timestamp with time zone,
    "approved_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."story_project_features" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."story_project_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "act_project_id" "uuid" NOT NULL,
    "tagged_by" "uuid",
    "tagged_at" timestamp with time zone DEFAULT "now"(),
    "tag_source" "text" DEFAULT 'manual'::"text",
    "storyteller_approved" boolean DEFAULT true,
    "storyteller_approved_at" timestamp with time zone,
    "act_approved" boolean DEFAULT false,
    "act_approved_at" timestamp with time zone,
    "act_approved_by" "uuid",
    "is_featured" boolean GENERATED ALWAYS AS (("storyteller_approved" AND "act_approved")) STORED,
    "featured_priority" integer DEFAULT 0,
    "featured_as_hero" boolean DEFAULT false,
    "relevance_score" integer,
    "ai_reasoning" "text",
    "suggested_themes" "text"[],
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "story_project_tags_relevance_score_check" CHECK ((("relevance_score" >= 0) AND ("relevance_score" <= 100))),
    CONSTRAINT "story_project_tags_tag_source_check" CHECK (("tag_source" = ANY (ARRAY['manual'::"text", 'ai_suggested'::"text", 'admin_added'::"text", 'bulk_import'::"text"])))
);


ALTER TABLE "public"."story_project_tags" OWNER TO "postgres";


COMMENT ON TABLE "public"."story_project_tags" IS 'Flexible story-to-project associations with bidirectional approval';



CREATE TABLE IF NOT EXISTS "public"."story_review_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "storyteller_id" "uuid",
    "storyteller_email" "text",
    "storyteller_phone" "text",
    "storyteller_name" "text" NOT NULL,
    "token" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "sent_via" "text" DEFAULT 'none'::"text" NOT NULL,
    "sent_at" timestamp with time zone,
    "accepted_at" timestamp with time zone,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "story_review_invitations_sent_via_check" CHECK (("sent_via" = ANY (ARRAY['email'::"text", 'sms'::"text", 'qr'::"text", 'none'::"text"])))
);


ALTER TABLE "public"."story_review_invitations" OWNER TO "postgres";


COMMENT ON TABLE "public"."story_review_invitations" IS 'Tracks magic link invitations for storytellers to review/access their stories';



COMMENT ON COLUMN "public"."story_review_invitations"."token" IS 'Secure random token for magic link authentication';



COMMENT ON COLUMN "public"."story_review_invitations"."sent_via" IS 'How the invitation was delivered: email, sms, qr, or none';



COMMENT ON COLUMN "public"."story_review_invitations"."accepted_at" IS 'When the storyteller accepted the invitation and logged in';



CREATE TABLE IF NOT EXISTS "public"."story_syndication_consent" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "story_id" "uuid" NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "app_id" "uuid" NOT NULL,
    "consent_granted" boolean DEFAULT false,
    "consent_granted_at" timestamp with time zone,
    "consent_revoked_at" timestamp with time zone,
    "consent_expires_at" timestamp with time zone,
    "share_full_content" boolean DEFAULT false,
    "share_summary_only" boolean DEFAULT true,
    "share_media" boolean DEFAULT false,
    "share_attribution" boolean DEFAULT true,
    "anonymous_sharing" boolean DEFAULT false,
    "cultural_restrictions" "jsonb" DEFAULT '{}'::"jsonb",
    "requires_cultural_approval" boolean DEFAULT false,
    "cultural_approval_status" "text",
    "cultural_approver_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "story_syndication_consent_cultural_approval_status_check" CHECK (("cultural_approval_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'denied'::"text"])))
);


ALTER TABLE "public"."story_syndication_consent" OWNER TO "postgres";


COMMENT ON TABLE "public"."story_syndication_consent" IS 'Tracks storyteller consent for sharing stories with external applications';



COMMENT ON COLUMN "public"."story_syndication_consent"."share_full_content" IS 'If true, full story content is shared; otherwise only summary';



COMMENT ON COLUMN "public"."story_syndication_consent"."anonymous_sharing" IS 'If true, story is shared without storyteller attribution';



COMMENT ON COLUMN "public"."story_syndication_consent"."cultural_restrictions" IS 'JSON object with cultural protocol restrictions for this sharing';



CREATE TABLE IF NOT EXISTS "public"."storyteller_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "total_stories" integer DEFAULT 0,
    "total_transcripts" integer DEFAULT 0,
    "total_word_count" integer DEFAULT 0,
    "total_engagement_score" numeric(10,2) DEFAULT 0.0,
    "impact_reach" integer DEFAULT 0,
    "primary_themes" "text"[] DEFAULT '{}'::"text"[],
    "theme_distribution" "jsonb" DEFAULT '{}'::"jsonb",
    "theme_evolution" "jsonb" DEFAULT '{}'::"jsonb",
    "storytelling_style" character varying(50),
    "emotional_tone_profile" "jsonb" DEFAULT '{}'::"jsonb",
    "cultural_elements_frequency" "jsonb" DEFAULT '{}'::"jsonb",
    "connection_count" integer DEFAULT 0,
    "shared_narrative_count" integer DEFAULT 0,
    "collaboration_score" numeric(5,2) DEFAULT 0.0,
    "story_view_count" integer DEFAULT 0,
    "story_share_count" integer DEFAULT 0,
    "quote_citation_count" integer DEFAULT 0,
    "inspiration_impact_score" numeric(10,2) DEFAULT 0.0,
    "last_calculated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."storyteller_analytics" OWNER TO "postgres";


COMMENT ON TABLE "public"."storyteller_analytics" IS 'Central hub for all storyteller metrics and analytics data';



CREATE TABLE IF NOT EXISTS "public"."storyteller_connections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_a_id" "uuid" NOT NULL,
    "storyteller_b_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "connection_strength" numeric(3,2) DEFAULT 0.0,
    "connection_type" character varying(50) NOT NULL,
    "shared_themes" "text"[] DEFAULT '{}'::"text"[],
    "theme_similarity_score" numeric(3,2) DEFAULT 0.0,
    "geographic_proximity_score" numeric(3,2) DEFAULT 0.0,
    "cultural_similarity_score" numeric(3,2) DEFAULT 0.0,
    "narrative_style_similarity" numeric(3,2) DEFAULT 0.0,
    "life_experience_similarity" numeric(3,2) DEFAULT 0.0,
    "professional_alignment_score" numeric(3,2) DEFAULT 0.0,
    "shared_locations" "text"[] DEFAULT '{}'::"text"[],
    "similar_experiences" "text"[] DEFAULT '{}'::"text"[],
    "complementary_skills" "text"[] DEFAULT '{}'::"text"[],
    "potential_collaboration_areas" "text"[] DEFAULT '{}'::"text"[],
    "mutual_themes_count" integer DEFAULT 0,
    "matching_quotes" "uuid"[] DEFAULT '{}'::"uuid"[],
    "evidence_examples" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_reasoning" "text",
    "ai_confidence" numeric(3,2) DEFAULT 0.0,
    "ai_model_version" character varying(50),
    "calculated_at" timestamp with time zone DEFAULT "now"(),
    "status" character varying(20) DEFAULT 'suggested'::character varying,
    "suggested_at" timestamp with time zone DEFAULT "now"(),
    "viewed_at" timestamp with time zone,
    "connected_at" timestamp with time zone,
    "declined_at" timestamp with time zone,
    "initiated_by" "uuid",
    "is_mutual" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "storyteller_connections_ai_confidence_check" CHECK ((("ai_confidence" >= 0.0) AND ("ai_confidence" <= 1.0))),
    CONSTRAINT "storyteller_connections_check" CHECK (("storyteller_a_id" <> "storyteller_b_id")),
    CONSTRAINT "storyteller_connections_connection_strength_check" CHECK ((("connection_strength" >= 0.0) AND ("connection_strength" <= 1.0))),
    CONSTRAINT "storyteller_connections_connection_type_check" CHECK ((("connection_type")::"text" = ANY ((ARRAY['narrative_similarity'::character varying, 'geographic'::character varying, 'thematic'::character varying, 'cultural'::character varying, 'professional'::character varying, 'generational'::character varying, 'experiential'::character varying, 'collaborative'::character varying])::"text"[]))),
    CONSTRAINT "storyteller_connections_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['suggested'::character varying, 'viewed'::character varying, 'connected'::character varying, 'declined'::character varying, 'hidden'::character varying, 'blocked'::character varying])::"text"[])))
);


ALTER TABLE "public"."storyteller_connections" OWNER TO "postgres";


COMMENT ON TABLE "public"."storyteller_connections" IS 'AI-discovered connections between storytellers based on narrative similarity';



CREATE TABLE IF NOT EXISTS "public"."storyteller_dashboard_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "dashboard_layout" character varying(50) DEFAULT 'default'::character varying,
    "enabled_widgets" "jsonb" DEFAULT '{"growth_trends": true, "quote_gallery": true, "story_metrics": true, "theme_analysis": true, "impact_overview": true, "recent_activity": true, "recommendations": true, "network_connections": true}'::"jsonb",
    "widget_positions" "jsonb" DEFAULT '{}'::"jsonb",
    "widget_sizes" "jsonb" DEFAULT '{}'::"jsonb",
    "theme_preferences" "jsonb" DEFAULT '{"density": "comfortable", "chart_style": "modern", "color_scheme": "default"}'::"jsonb",
    "public_dashboard" boolean DEFAULT false,
    "shared_with_network" boolean DEFAULT true,
    "analytics_sharing_level" character varying(20) DEFAULT 'summary'::character varying,
    "notification_preferences" "jsonb" DEFAULT '{"monthly_report": true, "weekly_summary": true, "new_connections": true, "quote_citations": true, "story_milestones": true}'::"jsonb",
    "auto_refresh_enabled" boolean DEFAULT true,
    "refresh_interval_minutes" integer DEFAULT 60,
    "last_refreshed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "storyteller_dashboard_config_analytics_sharing_level_check" CHECK ((("analytics_sharing_level")::"text" = ANY ((ARRAY['private'::character varying, 'summary'::character varying, 'detailed'::character varying, 'full'::character varying])::"text"[]))),
    CONSTRAINT "storyteller_dashboard_config_dashboard_layout_check" CHECK ((("dashboard_layout")::"text" = ANY ((ARRAY['default'::character varying, 'minimal'::character varying, 'comprehensive'::character varying, 'focus'::character varying, 'network'::character varying, 'analytics'::character varying])::"text"[])))
);


ALTER TABLE "public"."storyteller_dashboard_config" OWNER TO "postgres";


COMMENT ON TABLE "public"."storyteller_dashboard_config" IS 'Customizable dashboard configurations for each storyteller';



CREATE TABLE IF NOT EXISTS "public"."storyteller_demographics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "current_location" "jsonb",
    "location_history" "jsonb"[] DEFAULT '{}'::"jsonb"[],
    "places_of_significance" "text"[] DEFAULT '{}'::"text"[],
    "geographic_region" character varying(100),
    "cultural_background" "text"[] DEFAULT '{}'::"text"[],
    "languages_spoken" "text"[] DEFAULT '{}'::"text"[],
    "cultural_protocols_followed" "text"[] DEFAULT '{}'::"text"[],
    "traditional_knowledge_areas" "text"[] DEFAULT '{}'::"text"[],
    "professional_background" "text"[] DEFAULT '{}'::"text"[],
    "areas_of_expertise" "text"[] DEFAULT '{}'::"text"[],
    "interests_and_passions" "text"[] DEFAULT '{}'::"text"[],
    "skills_and_talents" "text"[] DEFAULT '{}'::"text"[],
    "significant_life_events" "text"[] DEFAULT '{}'::"text"[],
    "challenges_overcome" "text"[] DEFAULT '{}'::"text"[],
    "achievements_and_milestones" "text"[] DEFAULT '{}'::"text"[],
    "life_transitions" "text"[] DEFAULT '{}'::"text"[],
    "organizations_involved" "text"[] DEFAULT '{}'::"text"[],
    "causes_supported" "text"[] DEFAULT '{}'::"text"[],
    "volunteer_work" "text"[] DEFAULT '{}'::"text"[],
    "community_roles" "text"[] DEFAULT '{}'::"text"[],
    "generation_category" character varying(50),
    "family_roles" "text"[] DEFAULT '{}'::"text"[],
    "mentorship_roles" "text"[] DEFAULT '{}'::"text"[],
    "location_sharing_level" character varying(20) DEFAULT 'city'::character varying,
    "demographic_sharing_level" character varying(20) DEFAULT 'public'::character varying,
    "cultural_info_sharing" character varying(20) DEFAULT 'public'::character varying,
    "data_sources" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_extracted_confidence" numeric(3,2) DEFAULT 0.0,
    "manually_verified" boolean DEFAULT false,
    "last_updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "storyteller_demographics_cultural_info_sharing_check" CHECK ((("cultural_info_sharing")::"text" = ANY ((ARRAY['public'::character varying, 'cultural-community'::character varying, 'connections'::character varying, 'private'::character varying])::"text"[]))),
    CONSTRAINT "storyteller_demographics_demographic_sharing_level_check" CHECK ((("demographic_sharing_level")::"text" = ANY ((ARRAY['public'::character varying, 'network'::character varying, 'connections'::character varying, 'private'::character varying])::"text"[]))),
    CONSTRAINT "storyteller_demographics_location_sharing_level_check" CHECK ((("location_sharing_level")::"text" = ANY ((ARRAY['exact'::character varying, 'city'::character varying, 'state'::character varying, 'country'::character varying, 'region'::character varying, 'hidden'::character varying])::"text"[])))
);


ALTER TABLE "public"."storyteller_demographics" OWNER TO "postgres";


COMMENT ON TABLE "public"."storyteller_demographics" IS 'Rich demographic and geographic data for network discovery';



CREATE TABLE IF NOT EXISTS "public"."storyteller_engagement" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "period_start" timestamp with time zone NOT NULL,
    "period_end" timestamp with time zone NOT NULL,
    "period_type" character varying(20) NOT NULL,
    "stories_created" integer DEFAULT 0,
    "transcripts_processed" integer DEFAULT 0,
    "quotes_shared" integer DEFAULT 0,
    "themes_explored" integer DEFAULT 0,
    "media_items_uploaded" integer DEFAULT 0,
    "connections_made" integer DEFAULT 0,
    "connections_accepted" integer DEFAULT 0,
    "recommendations_viewed" integer DEFAULT 0,
    "recommendations_acted_upon" integer DEFAULT 0,
    "profile_views" integer DEFAULT 0,
    "story_views" integer DEFAULT 0,
    "story_shares" integer DEFAULT 0,
    "quote_citations" integer DEFAULT 0,
    "comments_received" integer DEFAULT 0,
    "comments_given" integer DEFAULT 0,
    "login_days" integer DEFAULT 0,
    "active_minutes" integer DEFAULT 0,
    "features_used" "text"[] DEFAULT '{}'::"text"[],
    "page_views" integer DEFAULT 0,
    "average_story_rating" numeric(3,2) DEFAULT 0.0,
    "story_completion_rate" numeric(3,2) DEFAULT 0.0,
    "ai_analysis_requests" integer DEFAULT 0,
    "high_impact_content_count" integer DEFAULT 0,
    "new_themes_discovered" integer DEFAULT 0,
    "skill_development_activities" integer DEFAULT 0,
    "tutorial_completions" integer DEFAULT 0,
    "collaborative_projects" integer DEFAULT 0,
    "community_contributions" integer DEFAULT 0,
    "mentoring_activities" integer DEFAULT 0,
    "engagement_score" numeric(5,2) DEFAULT 0.0,
    "growth_score" numeric(5,2) DEFAULT 0.0,
    "impact_score" numeric(5,2) DEFAULT 0.0,
    "consistency_score" numeric(5,2) DEFAULT 0.0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "storyteller_engagement_period_type_check" CHECK ((("period_type")::"text" = ANY ((ARRAY['daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'yearly'::character varying])::"text"[])))
);


ALTER TABLE "public"."storyteller_engagement" OWNER TO "postgres";


COMMENT ON TABLE "public"."storyteller_engagement" IS 'Tracks storyteller engagement metrics over time for analytics dashboards';



CREATE TABLE IF NOT EXISTS "public"."storyteller_impact_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "total_content_views" integer DEFAULT 0,
    "unique_viewers" integer DEFAULT 0,
    "content_shares" integer DEFAULT 0,
    "content_bookmarks" integer DEFAULT 0,
    "quotes_cited_by_others" integer DEFAULT 0,
    "stories_that_inspired_others" integer DEFAULT 0,
    "mentorship_connections" integer DEFAULT 0,
    "people_directly_impacted" integer DEFAULT 0,
    "cultural_preservation_contributions" integer DEFAULT 0,
    "community_initiatives_started" integer DEFAULT 0,
    "cross_cultural_connections" integer DEFAULT 0,
    "intergenerational_bridges" integer DEFAULT 0,
    "professional_opportunities_created" integer DEFAULT 0,
    "learning_resources_contributed" integer DEFAULT 0,
    "skills_taught_or_shared" integer DEFAULT 0,
    "career_guidance_provided" integer DEFAULT 0,
    "network_size" integer DEFAULT 0,
    "network_diversity_score" numeric(3,2) DEFAULT 0.0,
    "connection_quality_score" numeric(3,2) DEFAULT 0.0,
    "network_growth_rate" numeric(3,2) DEFAULT 0.0,
    "average_content_rating" numeric(3,2) DEFAULT 0.0,
    "content_completion_rate" numeric(3,2) DEFAULT 0.0,
    "repeat_audience_percentage" numeric(3,2) DEFAULT 0.0,
    "content_longevity_score" numeric(3,2) DEFAULT 0.0,
    "overall_impact_score" numeric(5,2) DEFAULT 0.0,
    "cultural_impact_score" numeric(5,2) DEFAULT 0.0,
    "community_impact_score" numeric(5,2) DEFAULT 0.0,
    "inspirational_impact_score" numeric(5,2) DEFAULT 0.0,
    "first_impact_date" timestamp with time zone,
    "peak_impact_date" timestamp with time zone,
    "last_significant_impact" timestamp with time zone,
    "impact_velocity" numeric(5,2) DEFAULT 0.0,
    "impact_consistency" numeric(3,2) DEFAULT 0.0,
    "impact_trend" character varying(20) DEFAULT 'stable'::character varying,
    "last_calculated_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "storyteller_impact_metrics_impact_trend_check" CHECK ((("impact_trend")::"text" = ANY ((ARRAY['growing'::character varying, 'stable'::character varying, 'declining'::character varying, 'emerging'::character varying, 'peak'::character varying])::"text"[])))
);


ALTER TABLE "public"."storyteller_impact_metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."storyteller_impact_metrics" IS 'Measures storyteller influence, reach, and community impact';



CREATE TABLE IF NOT EXISTS "public"."storyteller_locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "location_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "relationship_type" "text" DEFAULT 'connected_to'::"text",
    "significance" "text",
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."storyteller_locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storyteller_media_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "title" character varying(255) NOT NULL,
    "url" "text" NOT NULL,
    "description" "text",
    "link_type" character varying(50) NOT NULL,
    "video_stage" character varying(50),
    "platform" character varying(50) DEFAULT 'custom'::character varying,
    "duration_seconds" integer,
    "thumbnail_url" "text",
    "tags" "text"[] DEFAULT ARRAY[]::"text"[],
    "is_primary" boolean DEFAULT false,
    "is_public" boolean DEFAULT true,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "storyteller_media_links_link_type_check" CHECK ((("link_type")::"text" = ANY ((ARRAY['video'::character varying, 'audio'::character varying, 'document'::character varying, 'website'::character varying, 'social'::character varying])::"text"[]))),
    CONSTRAINT "storyteller_media_links_platform_check" CHECK ((("platform")::"text" = ANY ((ARRAY['descript'::character varying, 'youtube'::character varying, 'vimeo'::character varying, 'custom'::character varying, 'other'::character varying])::"text"[]))),
    CONSTRAINT "storyteller_media_links_video_stage_check" CHECK ((("video_stage" IS NULL) OR (("video_stage")::"text" = ANY ((ARRAY['raw'::character varying, 'draft'::character varying, 'editing'::character varying, 'produced'::character varying, 'final'::character varying])::"text"[]))))
);


ALTER TABLE "public"."storyteller_media_links" OWNER TO "postgres";


COMMENT ON TABLE "public"."storyteller_media_links" IS 'Stores multiple media links per storyteller with categorization and metadata';



COMMENT ON COLUMN "public"."storyteller_media_links"."link_type" IS 'Type of media: video, audio, document, website, social';



COMMENT ON COLUMN "public"."storyteller_media_links"."video_stage" IS 'Production stage for video content: raw, draft, editing, produced, final';



COMMENT ON COLUMN "public"."storyteller_media_links"."tags" IS 'Array of tags for categorization and search';



COMMENT ON COLUMN "public"."storyteller_media_links"."is_primary" IS 'Designates the primary/featured media link for this storyteller';



CREATE TABLE IF NOT EXISTS "public"."storyteller_milestones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "milestone_type" character varying(50) NOT NULL,
    "milestone_title" character varying(200) NOT NULL,
    "milestone_description" "text",
    "achievement_value" integer,
    "achievement_threshold" integer,
    "progress_percentage" numeric(3,2) DEFAULT 0.0,
    "status" character varying(20) DEFAULT 'achieved'::character varying,
    "achieved_at" timestamp with time zone,
    "verified_at" timestamp with time zone,
    "supporting_data" "jsonb" DEFAULT '{}'::"jsonb",
    "evidence_items" "uuid"[] DEFAULT '{}'::"uuid"[],
    "is_public" boolean DEFAULT true,
    "celebration_shared" boolean DEFAULT false,
    "badge_earned" character varying(100),
    "peer_congratulations" integer DEFAULT 0,
    "mentor_recognition" boolean DEFAULT false,
    "featured_milestone" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "storyteller_milestones_milestone_type_check" CHECK ((("milestone_type")::"text" = ANY ((ARRAY['first_story'::character varying, 'story_count'::character varying, 'connection_count'::character varying, 'quote_citation'::character varying, 'theme_mastery'::character varying, 'network_influencer'::character varying, 'cultural_contributor'::character varying, 'community_leader'::character varying, 'mentor_recognition'::character varying, 'impact_achievement'::character varying])::"text"[]))),
    CONSTRAINT "storyteller_milestones_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['achieved'::character varying, 'in_progress'::character varying, 'pending_verification'::character varying, 'expired'::character varying])::"text"[])))
);


ALTER TABLE "public"."storyteller_milestones" OWNER TO "postgres";


COMMENT ON TABLE "public"."storyteller_milestones" IS 'Achievement tracking and milestone recognition system';



CREATE TABLE IF NOT EXISTS "public"."storyteller_organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "role" "text",
    "relationship_type" "text" DEFAULT 'member'::"text",
    "start_date" "date",
    "end_date" "date",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."storyteller_organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storyteller_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "role" "text",
    "involvement_level" "text" DEFAULT 'participant'::"text",
    "start_date" "date",
    "end_date" "date",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."storyteller_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."storyteller_quotes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "quote_text" "text" NOT NULL,
    "context_before" "text",
    "context_after" "text",
    "source_type" character varying(20) NOT NULL,
    "source_id" "uuid" NOT NULL,
    "source_title" character varying(200),
    "timestamp_in_source" integer,
    "page_or_section" character varying(100),
    "emotional_impact_score" numeric(3,2) DEFAULT 0.0,
    "wisdom_score" numeric(3,2) DEFAULT 0.0,
    "quotability_score" numeric(3,2) DEFAULT 0.0,
    "inspiration_score" numeric(3,2) DEFAULT 0.0,
    "themes" "text"[] DEFAULT '{}'::"text"[],
    "sentiment_score" numeric(3,2) DEFAULT 0.0,
    "quote_category" character varying(50),
    "citation_count" integer DEFAULT 0,
    "share_count" integer DEFAULT 0,
    "view_count" integer DEFAULT 0,
    "inspiration_rating" numeric(3,2) DEFAULT 0.0,
    "is_public" boolean DEFAULT true,
    "requires_approval" boolean DEFAULT false,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "storyteller_quotes_emotional_impact_score_check" CHECK ((("emotional_impact_score" >= 0.0) AND ("emotional_impact_score" <= 1.0))),
    CONSTRAINT "storyteller_quotes_inspiration_score_check" CHECK ((("inspiration_score" >= 0.0) AND ("inspiration_score" <= 1.0))),
    CONSTRAINT "storyteller_quotes_quotability_score_check" CHECK ((("quotability_score" >= 0.0) AND ("quotability_score" <= 1.0))),
    CONSTRAINT "storyteller_quotes_quote_text_check" CHECK (("length"("quote_text") > 0)),
    CONSTRAINT "storyteller_quotes_sentiment_score_check" CHECK ((("sentiment_score" >= '-1.0'::numeric) AND ("sentiment_score" <= 1.0))),
    CONSTRAINT "storyteller_quotes_source_type_check" CHECK ((("source_type")::"text" = ANY ((ARRAY['transcript'::character varying, 'story'::character varying, 'interview'::character varying, 'media'::character varying])::"text"[]))),
    CONSTRAINT "storyteller_quotes_wisdom_score_check" CHECK ((("wisdom_score" >= 0.0) AND ("wisdom_score" <= 1.0)))
);


ALTER TABLE "public"."storyteller_quotes" OWNER TO "postgres";


COMMENT ON TABLE "public"."storyteller_quotes" IS 'Powerful, quotable moments extracted from storyteller content';



CREATE TABLE IF NOT EXISTS "public"."storyteller_recommendations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "recommendation_type" character varying(50) NOT NULL,
    "recommended_entity_type" character varying(50) NOT NULL,
    "recommended_entity_id" "uuid",
    "title" character varying(200) NOT NULL,
    "description" "text",
    "reason" "text",
    "potential_impact" "text",
    "call_to_action" character varying(200),
    "relevance_score" numeric(3,2) DEFAULT 0.0,
    "impact_potential_score" numeric(3,2) DEFAULT 0.0,
    "confidence_score" numeric(3,2) DEFAULT 0.0,
    "priority_score" numeric(3,2) DEFAULT 0.0,
    "supporting_data" "jsonb" DEFAULT '{}'::"jsonb",
    "connection_context" "jsonb" DEFAULT '{}'::"jsonb",
    "success_indicators" "text"[] DEFAULT '{}'::"text"[],
    "ai_model_version" character varying(50),
    "generation_method" character varying(50),
    "based_on_themes" "text"[] DEFAULT '{}'::"text"[],
    "based_on_connections" "uuid"[] DEFAULT '{}'::"uuid"[],
    "based_on_activities" "text"[] DEFAULT '{}'::"text"[],
    "status" character varying(20) DEFAULT 'active'::character varying,
    "viewed_at" timestamp with time zone,
    "acted_upon_at" timestamp with time zone,
    "dismissed_at" timestamp with time zone,
    "engagement_score" numeric(3,2) DEFAULT 0.0,
    "user_feedback" character varying(20),
    "feedback_notes" "text",
    "recommendation_outcome" character varying(50),
    "expires_at" timestamp with time zone,
    "optimal_display_time" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "storyteller_recommendations_confidence_score_check" CHECK ((("confidence_score" >= 0.0) AND ("confidence_score" <= 1.0))),
    CONSTRAINT "storyteller_recommendations_impact_potential_score_check" CHECK ((("impact_potential_score" >= 0.0) AND ("impact_potential_score" <= 1.0))),
    CONSTRAINT "storyteller_recommendations_priority_score_check" CHECK ((("priority_score" >= 0.0) AND ("priority_score" <= 1.0))),
    CONSTRAINT "storyteller_recommendations_recommendation_type_check" CHECK ((("recommendation_type")::"text" = ANY ((ARRAY['connection'::character varying, 'story_idea'::character varying, 'collaboration'::character varying, 'theme_exploration'::character varying, 'quote_inspiration'::character varying, 'network_expansion'::character varying, 'cultural_connection'::character varying, 'professional_opportunity'::character varying, 'learning_opportunity'::character varying])::"text"[]))),
    CONSTRAINT "storyteller_recommendations_recommended_entity_type_check" CHECK ((("recommended_entity_type")::"text" = ANY ((ARRAY['storyteller'::character varying, 'theme'::character varying, 'location'::character varying, 'project'::character varying, 'story_template'::character varying, 'quote'::character varying, 'collaboration_opportunity'::character varying, 'event'::character varying, 'resource'::character varying])::"text"[]))),
    CONSTRAINT "storyteller_recommendations_relevance_score_check" CHECK ((("relevance_score" >= 0.0) AND ("relevance_score" <= 1.0))),
    CONSTRAINT "storyteller_recommendations_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'viewed'::character varying, 'acted_upon'::character varying, 'dismissed'::character varying, 'expired'::character varying, 'hidden'::character varying])::"text"[]))),
    CONSTRAINT "storyteller_recommendations_user_feedback_check" CHECK ((("user_feedback")::"text" = ANY ((ARRAY['helpful'::character varying, 'not_helpful'::character varying, 'irrelevant'::character varying, 'offensive'::character varying])::"text"[])))
);


ALTER TABLE "public"."storyteller_recommendations" OWNER TO "postgres";


COMMENT ON TABLE "public"."storyteller_recommendations" IS 'Personalized recommendations for storytellers';



CREATE TABLE IF NOT EXISTS "public"."storyteller_themes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "storyteller_id" "uuid" NOT NULL,
    "theme_id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "prominence_score" numeric(5,2) DEFAULT 0.0,
    "frequency_count" integer DEFAULT 0,
    "first_occurrence" timestamp with time zone DEFAULT "now"(),
    "last_occurrence" timestamp with time zone DEFAULT "now"(),
    "source_stories" "uuid"[] DEFAULT '{}'::"uuid"[],
    "source_transcripts" "uuid"[] DEFAULT '{}'::"uuid"[],
    "key_quotes" "text"[] DEFAULT '{}'::"text"[],
    "context_examples" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "storyteller_themes_prominence_score_check" CHECK (("prominence_score" >= 0.0))
);


ALTER TABLE "public"."storyteller_themes" OWNER TO "postgres";


COMMENT ON TABLE "public"."storyteller_themes" IS 'Connection between storytellers and their prominent narrative themes';



CREATE TABLE IF NOT EXISTS "public"."storytelling_circle_evaluations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "circle_date" "date" NOT NULL,
    "participant_count" integer,
    "circle_theme" character varying(200),
    "protocols_followed" "text"[],
    "stories_shared" integer,
    "collective_insights" "text"[],
    "emotional_tone" character varying(50),
    "safety_rating" integer,
    "facilitator_notes" "text",
    "facilitator_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "storytelling_circle_evaluations_safety_rating_check" CHECK ((("safety_rating" >= 1) AND ("safety_rating" <= 5)))
);


ALTER TABLE "public"."storytelling_circle_evaluations" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."syndicated_stories" AS
 SELECT "s"."id" AS "story_id",
    "s"."title",
        CASE
            WHEN "ssc"."share_full_content" THEN "s"."content"
            ELSE "s"."summary"
        END AS "content",
        CASE
            WHEN ("ssc"."share_attribution" AND (NOT "ssc"."anonymous_sharing")) THEN "p"."display_name"
            ELSE 'Anonymous Storyteller'::"text"
        END AS "storyteller_name",
        CASE
            WHEN ("ssc"."share_attribution" AND (NOT "ssc"."anonymous_sharing")) THEN "p"."id"
            ELSE NULL::"uuid"
        END AS "storyteller_id",
    "s"."story_type",
    "s"."themes",
    "s"."created_at" AS "story_date",
    "ea"."id" AS "app_id",
    "ea"."app_name" AS "requesting_app",
    "ssc"."cultural_restrictions",
    "ssc"."share_media",
    "ssc"."consent_expires_at"
   FROM ((("public"."stories" "s"
     JOIN "public"."story_syndication_consent" "ssc" ON (("s"."id" = "ssc"."story_id")))
     JOIN "public"."external_applications" "ea" ON (("ssc"."app_id" = "ea"."id")))
     JOIN "public"."profiles" "p" ON (("s"."storyteller_id" = "p"."id")))
  WHERE (("ssc"."consent_granted" = true) AND (("ssc"."consent_expires_at" IS NULL) OR ("ssc"."consent_expires_at" > "now"())) AND ("ssc"."consent_revoked_at" IS NULL) AND ("ea"."is_active" = true) AND ((NOT "ssc"."requires_cultural_approval") OR ("ssc"."cultural_approval_status" = 'approved'::"text")));


ALTER VIEW "public"."syndicated_stories" OWNER TO "postgres";


COMMENT ON VIEW "public"."syndicated_stories" IS 'Stories available for external syndication with proper consent';



CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "tribe" "text",
    "description" "text",
    "quote" "text",
    "avatar_url" "text",
    "display_order" integer DEFAULT 0,
    "is_visible" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenant_ai_policies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "monthly_budget_usd" numeric(10,2) DEFAULT 100.00,
    "daily_budget_usd" numeric(10,2) DEFAULT 10.00,
    "per_request_max_usd" numeric(10,4) DEFAULT 1.00,
    "current_month_usage_usd" numeric(10,2) DEFAULT 0,
    "current_day_usage_usd" numeric(10,2) DEFAULT 0,
    "last_reset_date" "date" DEFAULT CURRENT_DATE,
    "allowed_models" "text"[] DEFAULT ARRAY['gpt-4o-mini'::"text", 'claude-3-haiku'::"text", 'whisper-1'::"text"],
    "blocked_models" "text"[] DEFAULT ARRAY[]::"text"[],
    "default_model" "text" DEFAULT 'gpt-4o-mini'::"text",
    "auto_downgrade_enabled" boolean DEFAULT true,
    "downgrade_threshold_pct" integer DEFAULT 80,
    "downgrade_model" "text" DEFAULT 'gpt-4o-mini'::"text",
    "requests_per_minute" integer DEFAULT 60,
    "requests_per_hour" integer DEFAULT 500,
    "allow_streaming" boolean DEFAULT true,
    "allow_function_calling" boolean DEFAULT true,
    "allow_vision" boolean DEFAULT false,
    "require_safety_check" boolean DEFAULT true,
    "block_on_safety_flag" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tenant_ai_policies" OWNER TO "postgres";


COMMENT ON TABLE "public"."tenant_ai_policies" IS 'Per-tenant configuration for AI usage limits and model access';



CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "domain" "text",
    "description" "text",
    "contact_email" "text",
    "website_url" "text",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "cultural_protocols" "jsonb" DEFAULT '{}'::"jsonb",
    "subscription_tier" "text" DEFAULT 'community'::"text",
    "status" "text" DEFAULT 'active'::"text",
    "onboarded_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "legacy_org_id" "uuid",
    "location" "text",
    CONSTRAINT "tenants_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'suspended'::"text", 'archived'::"text"]))),
    CONSTRAINT "tenants_subscription_tier_check" CHECK (("subscription_tier" = ANY (ARRAY['community'::"text", 'professional'::"text", 'enterprise'::"text"])))
);


ALTER TABLE "public"."tenants" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."tenant_analytics" AS
 SELECT "t"."id" AS "tenant_id",
    "t"."name" AS "tenant_name",
    "t"."slug",
    "count"(DISTINCT "p"."id") AS "total_storytellers",
    "count"(DISTINCT "s"."id") AS "total_stories",
    "count"(DISTINCT "q"."id") AS "total_quotes",
    "count"(DISTINCT
        CASE
            WHEN ("p"."available_for_collaboration" = true) THEN "p"."id"
            ELSE NULL::"uuid"
        END) AS "available_for_collaboration",
    "count"(DISTINCT
        CASE
            WHEN ("p"."open_to_mentoring" = true) THEN "p"."id"
            ELSE NULL::"uuid"
        END) AS "available_for_mentoring",
    "count"(DISTINCT
        CASE
            WHEN ("s"."is_public" = true) THEN "s"."id"
            ELSE NULL::"uuid"
        END) AS "public_stories",
    "avg"("p"."migration_quality_score") AS "avg_storyteller_quality",
    "avg"("s"."migration_quality_score") AS "avg_story_quality",
    "max"("p"."updated_at") AS "last_profile_update",
    "max"("s"."updated_at") AS "last_story_update"
   FROM ((("public"."tenants" "t"
     LEFT JOIN "public"."profiles" "p" ON (("t"."id" = "p"."tenant_id")))
     LEFT JOIN "public"."stories" "s" ON (("t"."id" = "s"."tenant_id")))
     LEFT JOIN "public"."quotes" "q" ON (("t"."id" = "q"."tenant_id")))
  GROUP BY "t"."id", "t"."name", "t"."slug"
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."tenant_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."testimonials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "quote" "text" NOT NULL,
    "context" "text",
    "avatar_url" "text",
    "specialties" "jsonb" DEFAULT '[]'::"jsonb",
    "source" "text",
    "impact_statement" "text",
    "category" "text",
    "display_order" integer DEFAULT 0,
    "is_visible" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."testimonials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."theme_associations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "theme_id" "uuid",
    "entity_type" character varying(50) NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "strength" numeric DEFAULT 1.0,
    "context" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."theme_associations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."theme_concept_evolution" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "theme_id" "uuid" NOT NULL,
    "original_concept" "text" NOT NULL,
    "evolved_concept" "text",
    "semantic_shift" double precision,
    "evidence_quotes" "text"[],
    "evolution_narrative" "text",
    "detected_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."theme_concept_evolution" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."theme_evolution" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "theme_id" "uuid" NOT NULL,
    "time_period_start" "date" NOT NULL,
    "time_period_end" "date" NOT NULL,
    "story_count" integer DEFAULT 0,
    "prominence_score" double precision,
    "current_status" character varying(20) DEFAULT 'stable'::character varying,
    "peak_moment" timestamp with time zone,
    "valley_moment" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "theme_evolution_prominence_score_check" CHECK ((("prominence_score" >= (0)::double precision) AND ("prominence_score" <= (1)::double precision)))
);


ALTER TABLE "public"."theme_evolution" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."theme_evolution_tracking" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "theme_name" "text" NOT NULL,
    "theme_category" "text",
    "first_appearance" "date" NOT NULL,
    "peak_prominence_date" "date",
    "current_frequency_score" numeric DEFAULT 0.0,
    "trend_direction" "text",
    "related_themes" "text"[] DEFAULT '{}'::"text"[],
    "storyteller_contributors" "uuid"[] DEFAULT '{}'::"uuid"[],
    "geographic_distribution" "jsonb" DEFAULT '{}'::"jsonb",
    "community_response_indicators" "text"[] DEFAULT '{}'::"text"[],
    "policy_influence_events" "text"[] DEFAULT '{}'::"text"[],
    "resource_mobilization_evidence" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."theme_evolution_tracking" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."themes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "category" character varying(100),
    "color" character varying(7),
    "weight" numeric DEFAULT 1.0,
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."themes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."theory_of_change" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "inputs" "jsonb",
    "activities" "jsonb",
    "outputs" "jsonb",
    "outcomes" "jsonb",
    "impact" "jsonb",
    "assumptions" "text"[],
    "external_factors" "text"[],
    "indicators" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."theory_of_change" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."title_suggestions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "story_id" "uuid",
    "transcript_id" "uuid",
    "suggestions" "jsonb" NOT NULL,
    "selected_title" "text",
    "selected_at" timestamp with time zone,
    "selected_by" "uuid",
    "status" "text" DEFAULT 'pending'::"text"
);


ALTER TABLE "public"."title_suggestions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tour_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "location_text" "text" NOT NULL,
    "city" "text",
    "country" "text",
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "why_visit" "text" NOT NULL,
    "storytellers_description" "text",
    "organization_name" "text",
    "organization_role" "text",
    "how_can_help" "text"[],
    "status" "text" DEFAULT 'pending'::"text",
    "notes" "text",
    "ghl_contact_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tour_requests" OWNER TO "postgres";


COMMENT ON TABLE "public"."tour_requests" IS 'Community nominations for Empathy Ledger World Tour visits';



COMMENT ON COLUMN "public"."tour_requests"."how_can_help" IS 'Array of ways the person can help: host, connect, fund, volunteer, other';



COMMENT ON COLUMN "public"."tour_requests"."ghl_contact_id" IS 'Go High Level CRM contact ID for follow-up automation';



CREATE TABLE IF NOT EXISTS "public"."tour_stops" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "location_text" "text" NOT NULL,
    "city" "text",
    "country" "text",
    "latitude" numeric(10,8) NOT NULL,
    "longitude" numeric(11,8) NOT NULL,
    "status" "text" DEFAULT 'planned'::"text",
    "date_start" "date",
    "date_end" "date",
    "title" "text",
    "description" "text",
    "partner_organizations" "text"[],
    "stories_collected" integer DEFAULT 0,
    "storytellers_met" integer DEFAULT 0,
    "highlights" "text",
    "cover_image_url" "text",
    "gallery_urls" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tour_stops" OWNER TO "postgres";


COMMENT ON TABLE "public"."tour_stops" IS 'Confirmed and completed tour stop locations';



COMMENT ON COLUMN "public"."tour_stops"."partner_organizations" IS 'Array of organization names or IDs involved in this stop';



CREATE TABLE IF NOT EXISTS "public"."transcription_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "media_asset_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "priority" integer DEFAULT 0,
    "attempts" integer DEFAULT 0,
    "max_attempts" integer DEFAULT 3,
    "error_message" "text",
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_by" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "transcription_jobs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."transcription_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transcripts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "storyteller_id" "uuid",
    "tenant_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "transcript_content" "text" NOT NULL,
    "recording_date" timestamp with time zone DEFAULT "now"(),
    "duration_seconds" integer,
    "ai_processing_consent" boolean DEFAULT false,
    "processing_status" "text" DEFAULT 'pending'::"text",
    "transcript_quality" "text" DEFAULT 'fair'::"text",
    "word_count" integer,
    "character_count" integer,
    "cultural_sensitivity" "text" DEFAULT 'standard'::"text",
    "requires_elder_review" boolean DEFAULT false,
    "elder_reviewed_by" "uuid",
    "elder_reviewed_at" timestamp with time zone,
    "audio_url" "text",
    "video_url" "text",
    "media_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "legacy_transcript_id" "uuid",
    "legacy_story_id" "uuid",
    "content_embedding" "public"."vector"(1536),
    "search_vector" "tsvector",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "ai_processing_date" timestamp with time zone,
    "ai_model_version" "text" DEFAULT 'claude-3.5-sonnet'::"text",
    "ai_confidence_score" numeric(3,2),
    "processing_consent" boolean,
    "ai_analysis_allowed" boolean,
    "anonymization_level" "text",
    "privacy_level" "text",
    "source_video_url" "text",
    "source_video_title" character varying(255),
    "source_video_platform" character varying(50) DEFAULT 'descript'::character varying,
    "source_video_duration" integer,
    "source_video_thumbnail" "text",
    "media_asset_id" "uuid",
    "text" "text",
    "formatted_text" "text",
    "segments" "jsonb",
    "language" "text" DEFAULT 'en'::"text",
    "status" "text" DEFAULT 'pending'::"text",
    "duration" double precision,
    "confidence" double precision,
    "created_by" "uuid",
    "error_message" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "project_id" "uuid",
    "story_id" "uuid",
    "location_id" "uuid",
    "organization_id" "uuid",
    "ai_processing_status" "text" DEFAULT 'not_started'::"text",
    "themes" "text"[] DEFAULT '{}'::"text"[],
    "key_quotes" "text"[] DEFAULT '{}'::"text"[],
    "ai_summary" "text",
    "source_empathy_entry_id" "uuid",
    "sync_date" timestamp with time zone,
    "content" "text",
    CONSTRAINT "transcripts_cultural_sensitivity_check" CHECK (("cultural_sensitivity" = ANY (ARRAY['standard'::"text", 'sensitive'::"text", 'sacred'::"text", 'restricted'::"text"]))),
    CONSTRAINT "transcripts_processing_status_check" CHECK (("processing_status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text", 'paused'::"text", 'consent_required'::"text", 'synthetic'::"text", 'test'::"text"]))),
    CONSTRAINT "transcripts_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text", 'needs_review'::"text"]))),
    CONSTRAINT "transcripts_transcript_quality_check" CHECK (("transcript_quality" = ANY (ARRAY['excellent'::"text", 'good'::"text", 'fair'::"text", 'poor'::"text", 'synthetic'::"text"]))),
    CONSTRAINT "valid_source_video_platform" CHECK ((("source_video_platform" IS NULL) OR (("source_video_platform")::"text" = ANY ((ARRAY['descript'::character varying, 'youtube'::character varying, 'vimeo'::character varying, 'custom'::character varying, 'other'::character varying])::"text"[]))))
);


ALTER TABLE "public"."transcripts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."transcripts"."storyteller_id" IS 'UUID of the primary storyteller. Can be null for organization/project transcripts where storytellers are added later.';



COMMENT ON COLUMN "public"."transcripts"."ai_processing_date" IS 'Timestamp when AI processing started';



COMMENT ON COLUMN "public"."transcripts"."ai_model_version" IS 'AI model used for processing (e.g., claude-3.5-sonnet)';



COMMENT ON COLUMN "public"."transcripts"."ai_confidence_score" IS 'AI confidence score (0.00-1.00)';



COMMENT ON COLUMN "public"."transcripts"."anonymization_level" IS 'Level of anonymization required: full, partial, none';



COMMENT ON COLUMN "public"."transcripts"."source_video_url" IS 'Direct link to source video (e.g., Descript project)';



COMMENT ON COLUMN "public"."transcripts"."source_video_platform" IS 'Platform where source video is hosted';



COMMENT ON COLUMN "public"."transcripts"."ai_processing_status" IS 'Status of AI analysis: not_started, queued, processing, completed, failed';



COMMENT ON COLUMN "public"."transcripts"."themes" IS 'Array of themes extracted from transcript';



COMMENT ON COLUMN "public"."transcripts"."key_quotes" IS 'Array of key quotes from transcript';



COMMENT ON COLUMN "public"."transcripts"."ai_summary" IS 'AI-generated summary of transcript';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "phone" "text",
    "role" "text" DEFAULT 'contributor'::"text" NOT NULL,
    "permissions" "text"[] DEFAULT ARRAY[]::"text"[],
    "department" "text",
    "position" "text",
    "bio" "text",
    "is_active" boolean DEFAULT true,
    "is_verified" boolean DEFAULT false,
    "last_login_at" timestamp with time zone,
    "login_count" integer DEFAULT 0,
    "avatar_url" "text",
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "project_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'editor'::"text", 'contributor'::"text", 'elder'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Extended user profiles for Oonchiumpa staff members';



COMMENT ON COLUMN "public"."users"."id" IS 'Primary key matching Supabase Auth user ID';



COMMENT ON COLUMN "public"."users"."role" IS 'User role: admin, editor, contributor, or elder';



COMMENT ON COLUMN "public"."users"."permissions" IS 'Array of permission strings for granular access control';



COMMENT ON COLUMN "public"."users"."is_active" IS 'Whether user account is active and can log in';



COMMENT ON COLUMN "public"."users"."is_verified" IS 'Whether user email has been verified';



COMMENT ON COLUMN "public"."users"."project_id" IS 'Project ID for multi-tenant support';



CREATE OR REPLACE VIEW "public"."users_public" AS
 SELECT "id",
    "email",
    "full_name",
    "role",
    "department",
    "position",
    "bio",
    "avatar_url",
    "is_active",
    "created_at"
   FROM "public"."users"
  WHERE ("is_active" = true);


ALTER VIEW "public"."users_public" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_agent_usage_stats" AS
 SELECT "agent_name",
    "date_trunc"('day'::"text", "created_at") AS "day",
    "count"(*) AS "total_requests",
    "count"(*) FILTER (WHERE ("status" = 'completed'::"text")) AS "successful",
    "count"(*) FILTER (WHERE ("status" = 'failed'::"text")) AS "failed",
    "avg"("duration_ms") AS "avg_duration_ms",
    "sum"("total_tokens") AS "total_tokens",
    "sum"("cost_usd_est") AS "total_cost_usd",
    "count"(*) FILTER (WHERE ("safety_status" = 'flagged'::"text")) AS "flagged",
    "count"(*) FILTER (WHERE ("safety_status" = 'blocked'::"text")) AS "blocked"
   FROM "public"."ai_usage_events"
  WHERE ("created_at" > ("now"() - '30 days'::interval))
  GROUP BY "agent_name", ("date_trunc"('day'::"text", "created_at"))
  ORDER BY ("date_trunc"('day'::"text", "created_at")) DESC, "agent_name";


ALTER VIEW "public"."v_agent_usage_stats" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_tenant_ai_usage_summary" AS
 SELECT "t"."id" AS "tenant_id",
    "t"."name" AS "tenant_name",
    "tap"."monthly_budget_usd",
    "tap"."current_month_usage_usd",
    "round"((("tap"."current_month_usage_usd" / NULLIF("tap"."monthly_budget_usd", (0)::numeric)) * (100)::numeric), 1) AS "budget_used_pct",
    "tap"."daily_budget_usd",
    "tap"."current_day_usage_usd",
    "tap"."allowed_models",
    "tap"."auto_downgrade_enabled",
    "tap"."downgrade_threshold_pct"
   FROM ("public"."tenants" "t"
     LEFT JOIN "public"."tenant_ai_policies" "tap" ON (("tap"."tenant_id" = "t"."id")));


ALTER VIEW "public"."v_tenant_ai_usage_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."videos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "video_url" "text" NOT NULL,
    "video_type" "text",
    "video_id" "text",
    "embed_code" "text",
    "thumbnail_url" "text",
    "tags" "text"[],
    "category" "text",
    "service_area" "text",
    "source_blog_post_id" "uuid",
    "source_empathy_entry_id" "uuid",
    "source_notion_page_id" "text",
    "duration" integer,
    "view_count" integer DEFAULT 0,
    "featured" boolean DEFAULT false,
    "is_public" boolean DEFAULT true,
    "privacy_level" "text" DEFAULT 'public'::"text",
    "cultural_review_required" boolean DEFAULT true,
    "cultural_approved" boolean DEFAULT false,
    "elder_approved" boolean DEFAULT false,
    "status" "text" DEFAULT 'published'::"text",
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "videos_privacy_level_check" CHECK (("privacy_level" = ANY (ARRAY['private'::"text", 'internal'::"text", 'public'::"text"]))),
    CONSTRAINT "videos_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"]))),
    CONSTRAINT "videos_video_type_check" CHECK (("video_type" = ANY (ARRAY['youtube'::"text", 'vimeo'::"text", 'descript'::"text", 'direct'::"text"])))
);


ALTER TABLE "public"."videos" OWNER TO "postgres";


COMMENT ON TABLE "public"."videos" IS 'Unified video gallery - all videos from blog posts, Empathy Ledger, and direct uploads';



COMMENT ON COLUMN "public"."videos"."video_id" IS 'Extracted video ID from YouTube/Vimeo URL';



COMMENT ON COLUMN "public"."videos"."embed_code" IS 'Auto-generated iframe embed code';



COMMENT ON COLUMN "public"."videos"."source_blog_post_id" IS 'Links to blog post if video came from a blog';



COMMENT ON COLUMN "public"."videos"."source_empathy_entry_id" IS 'Links to empathy entry if video came from Empathy Ledger';



COMMENT ON COLUMN "public"."videos"."source_notion_page_id" IS 'Notion page ID if synced from Notion';



CREATE TABLE IF NOT EXISTS "public"."webhook_delivery_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subscription_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "event_payload" "jsonb" NOT NULL,
    "attempt_number" integer DEFAULT 1,
    "delivered_at" timestamp with time zone DEFAULT "now"(),
    "response_status" integer,
    "response_body" "text",
    "response_time_ms" integer,
    "success" boolean DEFAULT false,
    "error_message" "text",
    "next_retry_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."webhook_delivery_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."webhook_delivery_log" IS 'Audit log of all webhook delivery attempts';



CREATE TABLE IF NOT EXISTS "public"."webhook_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "app_id" "uuid" NOT NULL,
    "webhook_url" "text" NOT NULL,
    "secret_key" "text" NOT NULL,
    "events" "text"[] DEFAULT ARRAY['consent.revoked'::"text"] NOT NULL,
    "is_active" boolean DEFAULT true,
    "last_triggered_at" timestamp with time zone,
    "last_success_at" timestamp with time zone,
    "last_failure_at" timestamp with time zone,
    "failure_count" integer DEFAULT 0,
    "consecutive_failures" integer DEFAULT 0,
    "max_consecutive_failures" integer DEFAULT 5,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."webhook_subscriptions" OWNER TO "postgres";


COMMENT ON TABLE "public"."webhook_subscriptions" IS 'Webhook endpoints registered by external apps for real-time notifications';



COMMENT ON COLUMN "public"."webhook_subscriptions"."secret_key" IS 'Used for HMAC-SHA256 signature verification';



COMMENT ON COLUMN "public"."webhook_subscriptions"."events" IS 'Array of event types this webhook subscribes to';



ALTER TABLE ONLY "public"."events" ATTACH PARTITION "public"."events_2024_01" FOR VALUES FROM ('2024-01-01 00:00:00+00') TO ('2024-12-31 00:00:00+00');



ALTER TABLE ONLY "public"."events" ATTACH PARTITION "public"."events_2025_08" FOR VALUES FROM ('2025-08-01 00:00:00+00') TO ('2025-09-01 00:00:00+00');



ALTER TABLE ONLY "public"."events" ATTACH PARTITION "public"."events_2025_09" FOR VALUES FROM ('2025-09-01 00:00:00+00') TO ('2025-10-01 00:00:00+00');



ALTER TABLE ONLY "public"."act_admin_permissions"
    ADD CONSTRAINT "act_admin_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."act_admin_permissions"
    ADD CONSTRAINT "act_admin_permissions_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."act_admins"
    ADD CONSTRAINT "act_admins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."act_admins"
    ADD CONSTRAINT "act_admins_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."act_feature_requests"
    ADD CONSTRAINT "act_feature_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."act_projects"
    ADD CONSTRAINT "act_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."act_projects"
    ADD CONSTRAINT "act_projects_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_messages"
    ADD CONSTRAINT "admin_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_agent_registry"
    ADD CONSTRAINT "ai_agent_registry_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."ai_agent_registry"
    ADD CONSTRAINT "ai_agent_registry_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_analysis_jobs"
    ADD CONSTRAINT "ai_analysis_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_moderation_logs"
    ADD CONSTRAINT "ai_moderation_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_processing_logs"
    ADD CONSTRAINT "ai_processing_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_safety_logs"
    ADD CONSTRAINT "ai_safety_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_usage_daily"
    ADD CONSTRAINT "ai_usage_daily_date_tenant_id_organization_id_agent_name_mo_key" UNIQUE ("date", "tenant_id", "organization_id", "agent_name", "model");



ALTER TABLE ONLY "public"."ai_usage_daily"
    ADD CONSTRAINT "ai_usage_daily_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_usage_events"
    ADD CONSTRAINT "ai_usage_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analysis_jobs"
    ADD CONSTRAINT "analysis_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_processing_jobs"
    ADD CONSTRAINT "analytics_processing_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."annual_report_stories"
    ADD CONSTRAINT "annual_report_stories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."annual_report_stories"
    ADD CONSTRAINT "annual_report_stories_report_id_story_id_key" UNIQUE ("report_id", "story_id");



ALTER TABLE ONLY "public"."annual_reports"
    ADD CONSTRAINT "annual_reports_organization_id_report_year_key" UNIQUE ("organization_id", "report_year");



ALTER TABLE ONLY "public"."annual_reports"
    ADD CONSTRAINT "annual_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audio_emotion_analysis"
    ADD CONSTRAINT "audio_emotion_analysis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audio_prosodic_analysis"
    ADD CONSTRAINT "audio_prosodic_analysis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_interpretation_sessions"
    ADD CONSTRAINT "community_interpretation_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_story_responses"
    ADD CONSTRAINT "community_story_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."consent_change_log"
    ADD CONSTRAINT "consent_change_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_approval_queue"
    ADD CONSTRAINT "content_approval_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_cache"
    ADD CONSTRAINT "content_cache_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_cache"
    ADD CONSTRAINT "content_cache_url_hash_key" UNIQUE ("url_hash");



ALTER TABLE ONLY "public"."cross_narrative_insights"
    ADD CONSTRAINT "cross_narrative_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cross_sector_insights"
    ADD CONSTRAINT "cross_sector_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cross_sector_insights"
    ADD CONSTRAINT "cross_sector_insights_tenant_id_primary_sector_secondary_se_key" UNIQUE ("tenant_id", "primary_sector", "secondary_sector");



ALTER TABLE ONLY "public"."cultural_protocols"
    ADD CONSTRAINT "cultural_protocols_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cultural_speech_patterns"
    ADD CONSTRAINT "cultural_speech_patterns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cultural_tags"
    ADD CONSTRAINT "cultural_tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."cultural_tags"
    ADD CONSTRAINT "cultural_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cultural_tags"
    ADD CONSTRAINT "cultural_tags_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."data_quality_metrics"
    ADD CONSTRAINT "data_quality_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."data_sources"
    ADD CONSTRAINT "data_sources_name_type_key" UNIQUE ("name", "type");



ALTER TABLE ONLY "public"."data_sources"
    ADD CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deletion_requests"
    ADD CONSTRAINT "deletion_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."development_plans"
    ADD CONSTRAINT "development_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_outcomes"
    ADD CONSTRAINT "document_outcomes_document_id_outcome_id_key" UNIQUE ("document_id", "outcome_id");



ALTER TABLE ONLY "public"."document_outcomes"
    ADD CONSTRAINT "document_outcomes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dream_organizations"
    ADD CONSTRAINT "dream_organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."elder_review_queue"
    ADD CONSTRAINT "elder_review_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."embed_tokens"
    ADD CONSTRAINT "embed_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."embed_tokens"
    ADD CONSTRAINT "embed_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."empathy_entries"
    ADD CONSTRAINT "empathy_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."empathy_sync_log"
    ADD CONSTRAINT "empathy_sync_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id", "created_at");



ALTER TABLE ONLY "public"."events_2024_01"
    ADD CONSTRAINT "events_2024_01_pkey" PRIMARY KEY ("id", "created_at");



ALTER TABLE ONLY "public"."events_2025_08"
    ADD CONSTRAINT "events_2025_08_pkey" PRIMARY KEY ("id", "created_at");



ALTER TABLE ONLY "public"."events_2025_09"
    ADD CONSTRAINT "events_2025_09_pkey" PRIMARY KEY ("id", "created_at");



ALTER TABLE ONLY "public"."external_applications"
    ADD CONSTRAINT "external_applications_app_name_key" UNIQUE ("app_name");



ALTER TABLE ONLY "public"."external_applications"
    ADD CONSTRAINT "external_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."extracted_quotes"
    ADD CONSTRAINT "extracted_quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."galleries"
    ADD CONSTRAINT "galleries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."galleries"
    ADD CONSTRAINT "galleries_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."gallery_media_associations"
    ADD CONSTRAINT "gallery_media_associations_gallery_id_media_asset_id_key" UNIQUE ("gallery_id", "media_asset_id");



ALTER TABLE ONLY "public"."gallery_media_associations"
    ADD CONSTRAINT "gallery_media_associations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gallery_media"
    ADD CONSTRAINT "gallery_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gallery_photos"
    ADD CONSTRAINT "gallery_photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."geographic_impact_patterns"
    ADD CONSTRAINT "geographic_impact_patterns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."geographic_impact_patterns"
    ADD CONSTRAINT "geographic_impact_patterns_tenant_id_location_id_geographic_key" UNIQUE ("tenant_id", "location_id", "geographic_scope");



ALTER TABLE ONLY "public"."harvested_outcomes"
    ADD CONSTRAINT "harvested_outcomes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."impact_stats"
    ADD CONSTRAINT "impact_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."impact_stories"
    ADD CONSTRAINT "impact_stories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media_files"
    ADD CONSTRAINT "media_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media_import_sessions"
    ADD CONSTRAINT "media_import_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media_usage_tracking"
    ADD CONSTRAINT "media_usage_tracking_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."message_recipients"
    ADD CONSTRAINT "message_recipients_message_id_recipient_id_key" UNIQUE ("message_id", "recipient_id");



ALTER TABLE ONLY "public"."message_recipients"
    ADD CONSTRAINT "message_recipients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moderation_appeals"
    ADD CONSTRAINT "moderation_appeals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moderation_results"
    ADD CONSTRAINT "moderation_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."narrative_themes"
    ADD CONSTRAINT "narrative_themes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."narrative_themes"
    ADD CONSTRAINT "narrative_themes_tenant_id_theme_name_key" UNIQUE ("tenant_id", "theme_name");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."opportunity_recommendations"
    ADD CONSTRAINT "opportunity_recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_analytics"
    ADD CONSTRAINT "organization_analytics_organization_id_key" UNIQUE ("organization_id");



ALTER TABLE ONLY "public"."organization_analytics"
    ADD CONSTRAINT "organization_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_contexts"
    ADD CONSTRAINT "organization_contexts_organization_id_key" UNIQUE ("organization_id");



ALTER TABLE ONLY "public"."organization_contexts"
    ADD CONSTRAINT "organization_contexts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_cross_transcript_insights"
    ADD CONSTRAINT "organization_cross_transcript_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_duplicates"
    ADD CONSTRAINT "organization_duplicates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_enrichment"
    ADD CONSTRAINT "organization_enrichment_organization_id_enrichment_type_cre_key" UNIQUE ("organization_id", "enrichment_type", "created_at");



ALTER TABLE ONLY "public"."organization_enrichment"
    ADD CONSTRAINT "organization_enrichment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_impact_metrics"
    ADD CONSTRAINT "organization_impact_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_profile_id_key" UNIQUE ("organization_id", "profile_id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_roles"
    ADD CONSTRAINT "organization_roles_organization_id_profile_id_is_active_key" UNIQUE ("organization_id", "profile_id", "is_active") DEFERRABLE INITIALLY DEFERRED;



ALTER TABLE ONLY "public"."organization_roles"
    ADD CONSTRAINT "organization_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_services"
    ADD CONSTRAINT "organization_services_organization_id_service_slug_key" UNIQUE ("organization_id", "service_slug");



ALTER TABLE ONLY "public"."organization_services"
    ADD CONSTRAINT "organization_services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_storyteller_network"
    ADD CONSTRAINT "organization_storyteller_network_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_theme_analytics"
    ADD CONSTRAINT "organization_theme_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_tenant_id_name_key" UNIQUE ("tenant_id", "name");



ALTER TABLE ONLY "public"."outcomes"
    ADD CONSTRAINT "outcomes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."partner_analytics_daily"
    ADD CONSTRAINT "partner_analytics_daily_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."partner_message_templates"
    ADD CONSTRAINT "partner_message_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."partner_messages"
    ADD CONSTRAINT "partner_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."partner_projects"
    ADD CONSTRAINT "partner_projects_app_id_slug_key" UNIQUE ("app_id", "slug");



ALTER TABLE ONLY "public"."partner_projects"
    ADD CONSTRAINT "partner_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."partner_team_members"
    ADD CONSTRAINT "partner_team_members_app_id_user_id_key" UNIQUE ("app_id", "user_id");



ALTER TABLE ONLY "public"."partner_team_members"
    ADD CONSTRAINT "partner_team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."partners"
    ADD CONSTRAINT "partners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."personal_insights"
    ADD CONSTRAINT "personal_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_analytics"
    ADD CONSTRAINT "photo_analytics_media_asset_id_key" UNIQUE ("media_asset_id");



ALTER TABLE ONLY "public"."photo_analytics"
    ADD CONSTRAINT "photo_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_faces"
    ADD CONSTRAINT "photo_faces_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_galleries"
    ADD CONSTRAINT "photo_galleries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_gallery_items"
    ADD CONSTRAINT "photo_gallery_items_gallery_id_media_asset_id_key" UNIQUE ("gallery_id", "media_asset_id");



ALTER TABLE ONLY "public"."photo_gallery_items"
    ADD CONSTRAINT "photo_gallery_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_locations"
    ADD CONSTRAINT "photo_locations_photo_id_location_id_key" UNIQUE ("photo_id", "location_id");



ALTER TABLE ONLY "public"."photo_locations"
    ADD CONSTRAINT "photo_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_memories"
    ADD CONSTRAINT "photo_memories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_organizations"
    ADD CONSTRAINT "photo_organizations_photo_id_organization_id_key" UNIQUE ("photo_id", "organization_id");



ALTER TABLE ONLY "public"."photo_organizations"
    ADD CONSTRAINT "photo_organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_projects"
    ADD CONSTRAINT "photo_projects_photo_id_project_id_key" UNIQUE ("photo_id", "project_id");



ALTER TABLE ONLY "public"."photo_projects"
    ADD CONSTRAINT "photo_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_storytellers"
    ADD CONSTRAINT "photo_storytellers_photo_id_storyteller_id_relationship_typ_key" UNIQUE ("photo_id", "storyteller_id", "relationship_type");



ALTER TABLE ONLY "public"."photo_storytellers"
    ADD CONSTRAINT "photo_storytellers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photo_tags"
    ADD CONSTRAINT "photo_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_analytics"
    ADD CONSTRAINT "platform_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_stats_cache"
    ADD CONSTRAINT "platform_stats_cache_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."privacy_changes"
    ADD CONSTRAINT "privacy_changes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."processing_jobs"
    ADD CONSTRAINT "processing_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professional_competencies"
    ADD CONSTRAINT "professional_competencies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."professional_competencies"
    ADD CONSTRAINT "professional_competencies_profile_id_skill_name_key" UNIQUE ("profile_id", "skill_name");



ALTER TABLE ONLY "public"."profile_galleries"
    ADD CONSTRAINT "profile_galleries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_galleries"
    ADD CONSTRAINT "profile_galleries_profile_id_gallery_id_key" UNIQUE ("profile_id", "gallery_id");



ALTER TABLE ONLY "public"."profile_locations"
    ADD CONSTRAINT "profile_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_locations"
    ADD CONSTRAINT "profile_locations_profile_id_location_id_key" UNIQUE ("profile_id", "location_id");



ALTER TABLE ONLY "public"."profile_organizations"
    ADD CONSTRAINT "profile_organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_organizations"
    ADD CONSTRAINT "profile_organizations_profile_id_organization_id_key" UNIQUE ("profile_id", "organization_id");



ALTER TABLE ONLY "public"."profile_projects"
    ADD CONSTRAINT "profile_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_projects"
    ADD CONSTRAINT "profile_projects_profile_id_project_id_key" UNIQUE ("profile_id", "project_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_analyses"
    ADD CONSTRAINT "project_analyses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_analyses"
    ADD CONSTRAINT "project_analyses_project_id_model_used_content_hash_key" UNIQUE ("project_id", "model_used", "content_hash");



ALTER TABLE ONLY "public"."project_analytics"
    ADD CONSTRAINT "project_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_analytics"
    ADD CONSTRAINT "project_analytics_project_id_key" UNIQUE ("project_id");



ALTER TABLE ONLY "public"."project_contexts"
    ADD CONSTRAINT "project_contexts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_contexts"
    ADD CONSTRAINT "project_contexts_project_id_key" UNIQUE ("project_id");



ALTER TABLE ONLY "public"."project_media"
    ADD CONSTRAINT "project_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_media"
    ADD CONSTRAINT "project_media_project_id_media_asset_id_key" UNIQUE ("project_id", "media_asset_id");



ALTER TABLE ONLY "public"."project_organizations"
    ADD CONSTRAINT "project_organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_organizations"
    ADD CONSTRAINT "project_organizations_project_id_organization_id_key" UNIQUE ("project_id", "organization_id");



ALTER TABLE ONLY "public"."project_participants"
    ADD CONSTRAINT "project_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_participants"
    ADD CONSTRAINT "project_participants_project_id_storyteller_id_key" UNIQUE ("project_id", "storyteller_id");



ALTER TABLE ONLY "public"."project_profiles"
    ADD CONSTRAINT "project_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_profiles"
    ADD CONSTRAINT "project_profiles_project_id_key" UNIQUE ("project_id");



ALTER TABLE ONLY "public"."project_seed_interviews"
    ADD CONSTRAINT "project_seed_interviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_seed_interviews"
    ADD CONSTRAINT "project_seed_interviews_project_id_key" UNIQUE ("project_id");



ALTER TABLE ONLY "public"."project_storytellers"
    ADD CONSTRAINT "project_storytellers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_storytellers"
    ADD CONSTRAINT "project_storytellers_project_id_storyteller_id_key" UNIQUE ("project_id", "storyteller_id");



ALTER TABLE ONLY "public"."project_updates"
    ADD CONSTRAINT "project_updates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_tenant_id_name_key" UNIQUE ("tenant_id", "name");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_feedback"
    ADD CONSTRAINT "report_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_sections"
    ADD CONSTRAINT "report_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_templates"
    ADD CONSTRAINT "report_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_templates"
    ADD CONSTRAINT "report_templates_template_name_key" UNIQUE ("template_name");



ALTER TABLE ONLY "public"."ripple_effects"
    ADD CONSTRAINT "ripple_effects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scraped_services"
    ADD CONSTRAINT "scraped_services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scraper_health_metrics"
    ADD CONSTRAINT "scraper_health_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scraping_metadata"
    ADD CONSTRAINT "scraping_metadata_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_impact"
    ADD CONSTRAINT "service_impact_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."sroi_calculations"
    ADD CONSTRAINT "sroi_calculations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sroi_inputs"
    ADD CONSTRAINT "sroi_inputs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sroi_outcomes"
    ADD CONSTRAINT "sroi_outcomes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_access_log"
    ADD CONSTRAINT "story_access_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_access_tokens"
    ADD CONSTRAINT "story_access_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_access_tokens"
    ADD CONSTRAINT "story_access_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."story_distributions"
    ADD CONSTRAINT "story_distributions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_engagement_daily"
    ADD CONSTRAINT "story_engagement_daily_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_engagement_daily"
    ADD CONSTRAINT "story_engagement_daily_story_id_platform_name_date_key" UNIQUE ("story_id", "platform_name", "date");



ALTER TABLE ONLY "public"."story_engagement_events"
    ADD CONSTRAINT "story_engagement_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_images"
    ADD CONSTRAINT "story_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_media"
    ADD CONSTRAINT "story_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_narrative_arcs"
    ADD CONSTRAINT "story_narrative_arcs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_narrative_arcs"
    ADD CONSTRAINT "story_narrative_arcs_story_id_key" UNIQUE ("story_id");



ALTER TABLE ONLY "public"."story_project_features"
    ADD CONSTRAINT "story_project_features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_project_features"
    ADD CONSTRAINT "story_project_features_story_id_act_project_id_key" UNIQUE ("story_id", "act_project_id");



ALTER TABLE ONLY "public"."story_project_tags"
    ADD CONSTRAINT "story_project_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_project_tags"
    ADD CONSTRAINT "story_project_tags_story_id_act_project_id_key" UNIQUE ("story_id", "act_project_id");



ALTER TABLE ONLY "public"."story_review_invitations"
    ADD CONSTRAINT "story_review_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_review_invitations"
    ADD CONSTRAINT "story_review_invitations_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."story_syndication_consent"
    ADD CONSTRAINT "story_syndication_consent_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_syndication_consent"
    ADD CONSTRAINT "story_syndication_consent_story_id_app_id_key" UNIQUE ("story_id", "app_id");



ALTER TABLE ONLY "public"."story_syndication_requests"
    ADD CONSTRAINT "story_syndication_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."story_syndication_requests"
    ADD CONSTRAINT "story_syndication_requests_story_id_project_id_key" UNIQUE ("story_id", "project_id");



ALTER TABLE ONLY "public"."storyteller_analytics"
    ADD CONSTRAINT "storyteller_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storyteller_analytics"
    ADD CONSTRAINT "storyteller_analytics_storyteller_id_key" UNIQUE ("storyteller_id");



ALTER TABLE ONLY "public"."storyteller_connections"
    ADD CONSTRAINT "storyteller_connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storyteller_connections"
    ADD CONSTRAINT "storyteller_connections_storyteller_a_id_storyteller_b_id_key" UNIQUE ("storyteller_a_id", "storyteller_b_id");



ALTER TABLE ONLY "public"."storyteller_dashboard_config"
    ADD CONSTRAINT "storyteller_dashboard_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storyteller_dashboard_config"
    ADD CONSTRAINT "storyteller_dashboard_config_storyteller_id_key" UNIQUE ("storyteller_id");



ALTER TABLE ONLY "public"."storyteller_demographics"
    ADD CONSTRAINT "storyteller_demographics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storyteller_demographics"
    ADD CONSTRAINT "storyteller_demographics_storyteller_id_key" UNIQUE ("storyteller_id");



ALTER TABLE ONLY "public"."storyteller_engagement"
    ADD CONSTRAINT "storyteller_engagement_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storyteller_impact_metrics"
    ADD CONSTRAINT "storyteller_impact_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storyteller_impact_metrics"
    ADD CONSTRAINT "storyteller_impact_metrics_storyteller_id_key" UNIQUE ("storyteller_id");



ALTER TABLE ONLY "public"."storyteller_locations"
    ADD CONSTRAINT "storyteller_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storyteller_locations"
    ADD CONSTRAINT "storyteller_locations_storyteller_id_location_id_key" UNIQUE ("storyteller_id", "location_id");



ALTER TABLE ONLY "public"."storyteller_media_links"
    ADD CONSTRAINT "storyteller_media_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storyteller_milestones"
    ADD CONSTRAINT "storyteller_milestones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storyteller_organizations"
    ADD CONSTRAINT "storyteller_organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storyteller_organizations"
    ADD CONSTRAINT "storyteller_organizations_storyteller_id_organization_id_key" UNIQUE ("storyteller_id", "organization_id");



ALTER TABLE ONLY "public"."storyteller_project_features"
    ADD CONSTRAINT "storyteller_project_features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storyteller_project_features"
    ADD CONSTRAINT "storyteller_project_features_storyteller_id_act_project_id_key" UNIQUE ("storyteller_id", "act_project_id");



ALTER TABLE ONLY "public"."storyteller_projects"
    ADD CONSTRAINT "storyteller_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storyteller_projects"
    ADD CONSTRAINT "storyteller_projects_storyteller_id_project_id_key" UNIQUE ("storyteller_id", "project_id");



ALTER TABLE ONLY "public"."storyteller_quotes"
    ADD CONSTRAINT "storyteller_quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storyteller_recommendations"
    ADD CONSTRAINT "storyteller_recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storyteller_themes"
    ADD CONSTRAINT "storyteller_themes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."storyteller_themes"
    ADD CONSTRAINT "storyteller_themes_storyteller_id_theme_id_key" UNIQUE ("storyteller_id", "theme_id");



ALTER TABLE ONLY "public"."storytelling_circle_evaluations"
    ADD CONSTRAINT "storytelling_circle_evaluations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenant_ai_policies"
    ADD CONSTRAINT "tenant_ai_policies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenant_ai_policies"
    ADD CONSTRAINT "tenant_ai_policies_tenant_id_key" UNIQUE ("tenant_id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_domain_key" UNIQUE ("domain");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theme_associations"
    ADD CONSTRAINT "theme_associations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theme_associations"
    ADD CONSTRAINT "theme_associations_theme_id_entity_type_entity_id_key" UNIQUE ("theme_id", "entity_type", "entity_id");



ALTER TABLE ONLY "public"."theme_concept_evolution"
    ADD CONSTRAINT "theme_concept_evolution_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theme_evolution"
    ADD CONSTRAINT "theme_evolution_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theme_evolution_tracking"
    ADD CONSTRAINT "theme_evolution_tracking_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theme_evolution_tracking"
    ADD CONSTRAINT "theme_evolution_tracking_tenant_id_theme_name_key" UNIQUE ("tenant_id", "theme_name");



ALTER TABLE ONLY "public"."themes"
    ADD CONSTRAINT "themes_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."themes"
    ADD CONSTRAINT "themes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."theory_of_change"
    ADD CONSTRAINT "theory_of_change_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."title_suggestions"
    ADD CONSTRAINT "title_suggestions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tour_requests"
    ADD CONSTRAINT "tour_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tour_stops"
    ADD CONSTRAINT "tour_stops_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transcription_jobs"
    ADD CONSTRAINT "transcription_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_impact_metrics"
    ADD CONSTRAINT "unique_org_metrics" UNIQUE ("organization_id");



ALTER TABLE ONLY "public"."organization_theme_analytics"
    ADD CONSTRAINT "unique_org_theme" UNIQUE ("organization_id", "theme");



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "unique_pending_invitation" UNIQUE ("organization_id", "email", "status");



ALTER TABLE ONLY "public"."organization_storyteller_network"
    ADD CONSTRAINT "unique_storyteller_pair" UNIQUE ("storyteller_a_id", "storyteller_b_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."videos"
    ADD CONSTRAINT "videos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webhook_delivery_log"
    ADD CONSTRAINT "webhook_delivery_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webhook_subscriptions"
    ADD CONSTRAINT "webhook_subscriptions_app_id_webhook_url_key" UNIQUE ("app_id", "webhook_url");



ALTER TABLE ONLY "public"."webhook_subscriptions"
    ADD CONSTRAINT "webhook_subscriptions_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "blog_posts_source_notion_page_id_unique" ON "public"."blog_posts" USING "btree" ("source_notion_page_id") WHERE ("source_notion_page_id" IS NOT NULL);



CREATE INDEX "idx_events_created_at" ON ONLY "public"."events" USING "btree" ("created_at" DESC);



CREATE INDEX "events_2024_01_created_at_idx" ON "public"."events_2024_01" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_events_type" ON ONLY "public"."events" USING "btree" ("event_type", "created_at");



CREATE INDEX "events_2024_01_event_type_created_at_idx" ON "public"."events_2024_01" USING "btree" ("event_type", "created_at");



CREATE INDEX "idx_events_event_type" ON ONLY "public"."events" USING "btree" ("event_type");



CREATE INDEX "events_2024_01_event_type_idx" ON "public"."events_2024_01" USING "btree" ("event_type");



CREATE INDEX "idx_events_resource" ON ONLY "public"."events" USING "btree" ("resource_type", "resource_id");



CREATE INDEX "events_2024_01_resource_type_resource_id_idx" ON "public"."events_2024_01" USING "btree" ("resource_type", "resource_id");



CREATE INDEX "idx_events_tenant_id" ON ONLY "public"."events" USING "btree" ("tenant_id", "created_at");



CREATE INDEX "events_2024_01_tenant_id_created_at_idx" ON "public"."events_2024_01" USING "btree" ("tenant_id", "created_at");



CREATE INDEX "idx_events_tenant_type_date" ON ONLY "public"."events" USING "btree" ("tenant_id", "event_type", "created_at" DESC);



CREATE INDEX "events_2024_01_tenant_id_event_type_created_at_idx" ON "public"."events_2024_01" USING "btree" ("tenant_id", "event_type", "created_at" DESC);



CREATE INDEX "idx_events_tenant_user" ON ONLY "public"."events" USING "btree" ("tenant_id", "user_id");



CREATE INDEX "events_2024_01_tenant_id_user_id_idx" ON "public"."events_2024_01" USING "btree" ("tenant_id", "user_id");



CREATE INDEX "events_2025_08_created_at_idx" ON "public"."events_2025_08" USING "btree" ("created_at" DESC);



CREATE INDEX "events_2025_08_event_type_created_at_idx" ON "public"."events_2025_08" USING "btree" ("event_type", "created_at");



CREATE INDEX "events_2025_08_event_type_idx" ON "public"."events_2025_08" USING "btree" ("event_type");



CREATE INDEX "events_2025_08_resource_type_resource_id_idx" ON "public"."events_2025_08" USING "btree" ("resource_type", "resource_id");



CREATE INDEX "events_2025_08_tenant_id_created_at_idx" ON "public"."events_2025_08" USING "btree" ("tenant_id", "created_at");



CREATE INDEX "events_2025_08_tenant_id_event_type_created_at_idx" ON "public"."events_2025_08" USING "btree" ("tenant_id", "event_type", "created_at" DESC);



CREATE INDEX "events_2025_08_tenant_id_user_id_idx" ON "public"."events_2025_08" USING "btree" ("tenant_id", "user_id");



CREATE INDEX "events_2025_09_created_at_idx" ON "public"."events_2025_09" USING "btree" ("created_at" DESC);



CREATE INDEX "events_2025_09_event_type_created_at_idx" ON "public"."events_2025_09" USING "btree" ("event_type", "created_at");



CREATE INDEX "events_2025_09_event_type_idx" ON "public"."events_2025_09" USING "btree" ("event_type");



CREATE INDEX "events_2025_09_resource_type_resource_id_idx" ON "public"."events_2025_09" USING "btree" ("resource_type", "resource_id");



CREATE INDEX "events_2025_09_tenant_id_created_at_idx" ON "public"."events_2025_09" USING "btree" ("tenant_id", "created_at");



CREATE INDEX "events_2025_09_tenant_id_event_type_created_at_idx" ON "public"."events_2025_09" USING "btree" ("tenant_id", "event_type", "created_at" DESC);



CREATE INDEX "events_2025_09_tenant_id_user_id_idx" ON "public"."events_2025_09" USING "btree" ("tenant_id", "user_id");



CREATE INDEX "idx_act_admins_active" ON "public"."act_admin_permissions" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_act_admins_level" ON "public"."act_admin_permissions" USING "btree" ("permission_level");



CREATE INDEX "idx_act_admins_user" ON "public"."act_admin_permissions" USING "btree" ("user_id");



CREATE INDEX "idx_act_admins_user_id" ON "public"."act_admins" USING "btree" ("user_id");



CREATE INDEX "idx_act_projects_active" ON "public"."act_projects" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_act_projects_organization" ON "public"."act_projects" USING "btree" ("organization_name");



CREATE INDEX "idx_act_projects_slug" ON "public"."act_projects" USING "btree" ("slug");



CREATE INDEX "idx_activities_date" ON "public"."activities" USING "btree" ("activity_date");



CREATE INDEX "idx_activities_organization" ON "public"."activities" USING "btree" ("organization_id");



CREATE INDEX "idx_activities_service_area" ON "public"."activities" USING "btree" ("service_area");



CREATE INDEX "idx_activities_tenant" ON "public"."activities" USING "btree" ("tenant_id");



CREATE INDEX "idx_activities_type" ON "public"."activities" USING "btree" ("activity_type");



CREATE INDEX "idx_activity_log_action_category" ON "public"."activity_log" USING "btree" ("action_category");



CREATE INDEX "idx_activity_log_attention" ON "public"."activity_log" USING "btree" ("requires_attention") WHERE ("requires_attention" = true);



CREATE INDEX "idx_activity_log_created_at" ON "public"."activity_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_activity_log_entity" ON "public"."activity_log" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_activity_log_organization" ON "public"."activity_log" USING "btree" ("organization_id");



CREATE INDEX "idx_activity_log_user_id" ON "public"."activity_log" USING "btree" ("user_id");



CREATE INDEX "idx_admin_messages_scheduled" ON "public"."admin_messages" USING "btree" ("scheduled_at") WHERE ("scheduled_at" IS NOT NULL);



CREATE INDEX "idx_admin_messages_sender" ON "public"."admin_messages" USING "btree" ("sender_id");



CREATE INDEX "idx_admin_messages_status" ON "public"."admin_messages" USING "btree" ("status");



CREATE INDEX "idx_ai_jobs_entity" ON "public"."ai_analysis_jobs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_ai_jobs_scheduled" ON "public"."ai_analysis_jobs" USING "btree" ("scheduled_for") WHERE ("status" = 'pending'::"text");



CREATE INDEX "idx_ai_jobs_status" ON "public"."ai_analysis_jobs" USING "btree" ("status");



CREATE INDEX "idx_ai_moderation_logs_author" ON "public"."ai_moderation_logs" USING "btree" ("author_id");



CREATE INDEX "idx_ai_moderation_logs_content" ON "public"."ai_moderation_logs" USING "btree" ("content_id");



CREATE INDEX "idx_ai_moderation_logs_created" ON "public"."ai_moderation_logs" USING "btree" ("created_at");



CREATE INDEX "idx_ai_moderation_logs_elder" ON "public"."ai_moderation_logs" USING "btree" ("elder_id");



CREATE INDEX "idx_ai_processing_logs_model" ON "public"."ai_processing_logs" USING "btree" ("ai_model_used");



CREATE INDEX "idx_ai_processing_logs_request_id" ON "public"."ai_processing_logs" USING "btree" ("request_id");



CREATE INDEX "idx_ai_processing_logs_timestamp" ON "public"."ai_processing_logs" USING "btree" ("processing_timestamp");



CREATE INDEX "idx_ai_safety_logs_created" ON "public"."ai_safety_logs" USING "btree" ("created_at");



CREATE INDEX "idx_ai_safety_logs_level" ON "public"."ai_safety_logs" USING "btree" ("safety_level");



CREATE INDEX "idx_ai_safety_logs_operation" ON "public"."ai_safety_logs" USING "btree" ("operation");



CREATE INDEX "idx_ai_safety_logs_user" ON "public"."ai_safety_logs" USING "btree" ("user_id");



CREATE INDEX "idx_ai_usage_agent" ON "public"."ai_usage_events" USING "btree" ("agent_name", "created_at" DESC);



CREATE INDEX "idx_ai_usage_daily_org" ON "public"."ai_usage_daily" USING "btree" ("organization_id", "date" DESC);



CREATE INDEX "idx_ai_usage_daily_tenant" ON "public"."ai_usage_daily" USING "btree" ("tenant_id", "date" DESC);



CREATE INDEX "idx_ai_usage_model" ON "public"."ai_usage_events" USING "btree" ("model", "created_at" DESC);



CREATE INDEX "idx_ai_usage_org" ON "public"."ai_usage_events" USING "btree" ("organization_id", "created_at" DESC);



CREATE INDEX "idx_ai_usage_parent" ON "public"."ai_usage_events" USING "btree" ("parent_request_id") WHERE ("parent_request_id" IS NOT NULL);



CREATE INDEX "idx_ai_usage_request" ON "public"."ai_usage_events" USING "btree" ("request_id");



CREATE INDEX "idx_ai_usage_status" ON "public"."ai_usage_events" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "idx_ai_usage_tenant" ON "public"."ai_usage_events" USING "btree" ("tenant_id", "created_at" DESC);



CREATE INDEX "idx_analysis_jobs_profile" ON "public"."analysis_jobs" USING "btree" ("profile_id");



CREATE INDEX "idx_analysis_jobs_status" ON "public"."analysis_jobs" USING "btree" ("status");



CREATE INDEX "idx_analysis_jobs_type" ON "public"."analysis_jobs" USING "btree" ("job_type");



CREATE INDEX "idx_analytics_gallery" ON "public"."photo_analytics" USING "btree" ("gallery_id") WHERE ("gallery_id" IS NOT NULL);



CREATE INDEX "idx_analytics_jobs_priority" ON "public"."analytics_processing_jobs" USING "btree" ("priority" DESC, "created_at");



CREATE INDEX "idx_analytics_jobs_scheduled" ON "public"."analytics_processing_jobs" USING "btree" ("scheduled_for") WHERE ("scheduled_for" IS NOT NULL);



CREATE INDEX "idx_analytics_jobs_status" ON "public"."analytics_processing_jobs" USING "btree" ("job_status");



CREATE INDEX "idx_analytics_jobs_storyteller" ON "public"."analytics_processing_jobs" USING "btree" ("storyteller_id") WHERE ("storyteller_id" IS NOT NULL);



CREATE INDEX "idx_analytics_jobs_tenant" ON "public"."analytics_processing_jobs" USING "btree" ("tenant_id");



CREATE INDEX "idx_analytics_jobs_type" ON "public"."analytics_processing_jobs" USING "btree" ("job_type");



CREATE INDEX "idx_analytics_tenant" ON "public"."photo_analytics" USING "btree" ("tenant_id");



CREATE INDEX "idx_approval_content_type" ON "public"."content_approval_queue" USING "btree" ("content_type");



CREATE INDEX "idx_approval_privacy" ON "public"."content_approval_queue" USING "btree" ("privacy_level");



CREATE INDEX "idx_approval_status" ON "public"."content_approval_queue" USING "btree" ("status");



CREATE INDEX "idx_approval_submitted_at" ON "public"."content_approval_queue" USING "btree" ("submitted_at");



CREATE INDEX "idx_audio_emotion_audio" ON "public"."audio_emotion_analysis" USING "btree" ("audio_id");



CREATE INDEX "idx_audio_emotion_primary" ON "public"."audio_emotion_analysis" USING "btree" ("emotion_label");



CREATE INDEX "idx_audio_emotion_story" ON "public"."audio_emotion_analysis" USING "btree" ("story_id");



CREATE INDEX "idx_audio_prosody_audio" ON "public"."audio_prosodic_analysis" USING "btree" ("audio_id");



CREATE INDEX "idx_audio_prosody_story" ON "public"."audio_prosodic_analysis" USING "btree" ("story_id");



CREATE INDEX "idx_audit_logs_action" ON "public"."audit_logs" USING "btree" ("action");



CREATE INDEX "idx_audit_logs_actor_id" ON "public"."audit_logs" USING "btree" ("actor_id");



CREATE INDEX "idx_audit_logs_category" ON "public"."audit_logs" USING "btree" ("action_category");



CREATE INDEX "idx_audit_logs_created_at" ON "public"."audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_logs_entity" ON "public"."audit_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_audit_logs_request_id" ON "public"."audit_logs" USING "btree" ("request_id");



CREATE INDEX "idx_audit_logs_tenant_id" ON "public"."audit_logs" USING "btree" ("tenant_id");



CREATE INDEX "idx_blog_posts_elder_approved" ON "public"."blog_posts" USING "btree" ("elder_approved");



CREATE INDEX "idx_blog_posts_project_id" ON "public"."blog_posts" USING "btree" ("project_id");



CREATE INDEX "idx_blog_posts_published_at" ON "public"."blog_posts" USING "btree" ("published_at" DESC);



CREATE INDEX "idx_blog_posts_search" ON "public"."blog_posts" USING "gin" ("to_tsvector"('"english"'::"regconfig", (((("title" || ' '::"text") || "excerpt") || ' '::"text") || "content")));



CREATE INDEX "idx_blog_posts_status" ON "public"."blog_posts" USING "btree" ("status");



CREATE INDEX "idx_blog_posts_tags" ON "public"."blog_posts" USING "gin" ("tags");



CREATE INDEX "idx_blog_posts_type" ON "public"."blog_posts" USING "btree" ("type");



CREATE INDEX "idx_circle_date" ON "public"."storytelling_circle_evaluations" USING "btree" ("circle_date" DESC);



CREATE INDEX "idx_circle_project" ON "public"."storytelling_circle_evaluations" USING "btree" ("project_id");



CREATE INDEX "idx_consent_change_log_app" ON "public"."consent_change_log" USING "btree" ("app_id");



CREATE INDEX "idx_consent_change_log_story" ON "public"."consent_change_log" USING "btree" ("story_id");



CREATE INDEX "idx_content_cache_content_hash" ON "public"."content_cache" USING "btree" ("content_hash");



CREATE INDEX "idx_content_cache_expiry" ON "public"."content_cache" USING "btree" ("expiry_timestamp");



CREATE INDEX "idx_content_cache_timestamp" ON "public"."content_cache" USING "btree" ("cache_timestamp");



CREATE INDEX "idx_content_cache_url_hash" ON "public"."content_cache" USING "btree" ("url_hash");



CREATE INDEX "idx_cross_narrative_insights_category" ON "public"."cross_narrative_insights" USING "btree" ("insight_category");



CREATE INDEX "idx_cross_narrative_insights_confidence" ON "public"."cross_narrative_insights" USING "btree" ("confidence_level" DESC);



CREATE INDEX "idx_cross_narrative_insights_reach" ON "public"."cross_narrative_insights" USING "btree" ("potential_reach" DESC);



CREATE INDEX "idx_cross_narrative_insights_status" ON "public"."cross_narrative_insights" USING "btree" ("status", "visibility_level");



CREATE INDEX "idx_cross_narrative_insights_time_period" ON "public"."cross_narrative_insights" USING "btree" ("time_period_start", "time_period_end");



CREATE INDEX "idx_cross_narrative_insights_type" ON "public"."cross_narrative_insights" USING "btree" ("insight_type");



CREATE INDEX "idx_cross_narrative_insights_urgency" ON "public"."cross_narrative_insights" USING "btree" ("urgency_level", "confidence_level" DESC);



CREATE INDEX "idx_cross_sector_insights_sectors" ON "public"."cross_sector_insights" USING "btree" ("primary_sector", "secondary_sector");



CREATE INDEX "idx_cross_sector_insights_tenant_id" ON "public"."cross_sector_insights" USING "btree" ("tenant_id");



CREATE INDEX "idx_cross_sector_insights_themes" ON "public"."cross_sector_insights" USING "gin" ("shared_themes");



CREATE INDEX "idx_cultural_patterns_audio" ON "public"."cultural_speech_patterns" USING "btree" ("audio_id");



CREATE INDEX "idx_cultural_patterns_type" ON "public"."cultural_speech_patterns" USING "btree" ("pattern_type");



CREATE INDEX "idx_cultural_protocols_legacy_project_id" ON "public"."cultural_protocols" USING "btree" ("legacy_project_id");



CREATE INDEX "idx_cultural_protocols_organization_id" ON "public"."cultural_protocols" USING "btree" ("organization_id");



CREATE INDEX "idx_cultural_protocols_status" ON "public"."cultural_protocols" USING "btree" ("status", "effective_date");



CREATE INDEX "idx_cultural_protocols_tenant" ON "public"."cultural_protocols" USING "btree" ("tenant_id");



CREATE INDEX "idx_cultural_protocols_tenant_status" ON "public"."cultural_protocols" USING "btree" ("tenant_id", "status");



CREATE INDEX "idx_cultural_protocols_type" ON "public"."cultural_protocols" USING "btree" ("protocol_type");



CREATE INDEX "idx_daily_story_date" ON "public"."story_engagement_daily" USING "btree" ("story_id", "date" DESC);



CREATE INDEX "idx_daily_storyteller_date" ON "public"."story_engagement_daily" USING "btree" ("storyteller_id", "date" DESC) WHERE ("storyteller_id" IS NOT NULL);



CREATE INDEX "idx_data_quality_metrics_date" ON "public"."data_quality_metrics" USING "btree" ("measurement_date");



CREATE INDEX "idx_data_quality_metrics_org_id" ON "public"."data_quality_metrics" USING "btree" ("organization_id");



CREATE INDEX "idx_data_quality_metrics_type" ON "public"."data_quality_metrics" USING "btree" ("metric_type");



CREATE INDEX "idx_data_sources_active" ON "public"."data_sources" USING "btree" ("active");



CREATE INDEX "idx_data_sources_last_scrape" ON "public"."data_sources" USING "btree" ("last_successful_scrape");



CREATE INDEX "idx_data_sources_type" ON "public"."data_sources" USING "btree" ("type");



CREATE INDEX "idx_deletion_requests_created" ON "public"."deletion_requests" USING "btree" ("requested_at" DESC);



CREATE INDEX "idx_deletion_requests_status" ON "public"."deletion_requests" USING "btree" ("status");



CREATE INDEX "idx_deletion_requests_tenant_id" ON "public"."deletion_requests" USING "btree" ("tenant_id");



CREATE INDEX "idx_deletion_requests_type" ON "public"."deletion_requests" USING "btree" ("request_type");



CREATE INDEX "idx_deletion_requests_user_id" ON "public"."deletion_requests" USING "btree" ("user_id");



CREATE INDEX "idx_development_plans_profile" ON "public"."development_plans" USING "btree" ("profile_id");



CREATE INDEX "idx_development_plans_review" ON "public"."development_plans" USING "btree" ("next_review_date");



CREATE INDEX "idx_document_outcomes_document" ON "public"."document_outcomes" USING "btree" ("document_id");



CREATE INDEX "idx_document_outcomes_outcome" ON "public"."document_outcomes" USING "btree" ("outcome_id");



CREATE INDEX "idx_dream_orgs_category" ON "public"."dream_organizations" USING "btree" ("category");



CREATE INDEX "idx_dream_orgs_priority" ON "public"."dream_organizations" USING "btree" ("priority");



CREATE INDEX "idx_dream_orgs_status" ON "public"."dream_organizations" USING "btree" ("contact_status");



CREATE INDEX "idx_elder_review_queue_assigned_elder" ON "public"."elder_review_queue" USING "btree" ("assigned_elder_id");



CREATE INDEX "idx_elder_review_queue_content" ON "public"."elder_review_queue" USING "btree" ("content_id", "content_type");



CREATE INDEX "idx_elder_review_queue_due_date" ON "public"."elder_review_queue" USING "btree" ("due_date");



CREATE INDEX "idx_elder_review_queue_priority" ON "public"."elder_review_queue" USING "btree" ("priority");



CREATE INDEX "idx_elder_review_queue_status" ON "public"."elder_review_queue" USING "btree" ("status");



CREATE INDEX "idx_embed_tokens_status" ON "public"."embed_tokens" USING "btree" ("status");



CREATE INDEX "idx_embed_tokens_story_id" ON "public"."embed_tokens" USING "btree" ("story_id");



CREATE INDEX "idx_embed_tokens_tenant_id" ON "public"."embed_tokens" USING "btree" ("tenant_id");



CREATE INDEX "idx_embed_tokens_token_hash" ON "public"."embed_tokens" USING "btree" ("token_hash");



CREATE INDEX "idx_empathy_created_at" ON "public"."empathy_entries" USING "btree" ("created_at");



CREATE INDEX "idx_empathy_org" ON "public"."empathy_entries" USING "btree" ("organization_id");



CREATE INDEX "idx_empathy_privacy_level" ON "public"."empathy_entries" USING "btree" ("privacy_level");



CREATE INDEX "idx_empathy_publish_status" ON "public"."empathy_entries" USING "btree" ("publish_status");



CREATE INDEX "idx_empathy_ready_to_publish" ON "public"."empathy_entries" USING "btree" ("ready_to_publish");



CREATE INDEX "idx_engagement_created_at" ON "public"."story_engagement_events" USING "btree" ("created_at");



CREATE INDEX "idx_engagement_event_type" ON "public"."story_engagement_events" USING "btree" ("event_type");



CREATE INDEX "idx_engagement_platform" ON "public"."story_engagement_events" USING "btree" ("platform_name");



CREATE INDEX "idx_engagement_session" ON "public"."story_engagement_events" USING "btree" ("session_id") WHERE ("session_id" IS NOT NULL);



CREATE INDEX "idx_engagement_story_date" ON "public"."story_engagement_events" USING "btree" ("story_id", "created_at" DESC);



CREATE INDEX "idx_engagement_story_id" ON "public"."story_engagement_events" USING "btree" ("story_id");



CREATE INDEX "idx_engagement_storyteller_date" ON "public"."story_engagement_events" USING "btree" ("storyteller_id", "created_at" DESC) WHERE ("storyteller_id" IS NOT NULL);



CREATE INDEX "idx_engagement_storyteller_id" ON "public"."story_engagement_events" USING "btree" ("storyteller_id") WHERE ("storyteller_id" IS NOT NULL);



CREATE INDEX "idx_external_applications_active" ON "public"."external_applications" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_faces_cluster" ON "public"."photo_faces" USING "btree" ("cluster_id") WHERE ("cluster_id" IS NOT NULL);



CREATE INDEX "idx_faces_confirmed" ON "public"."photo_faces" USING "btree" ("is_confirmed") WHERE ("is_confirmed" = true);



CREATE INDEX "idx_faces_media_asset" ON "public"."photo_faces" USING "btree" ("media_asset_id");



CREATE INDEX "idx_faces_person" ON "public"."photo_faces" USING "btree" ("person_id") WHERE ("person_id" IS NOT NULL);



CREATE INDEX "idx_faces_tenant" ON "public"."photo_faces" USING "btree" ("tenant_id");



CREATE INDEX "idx_feature_requests_pending" ON "public"."act_feature_requests" USING "btree" ("act_project_id", "status") WHERE ("status" = 'pending'::"text");



CREATE INDEX "idx_feature_requests_project" ON "public"."act_feature_requests" USING "btree" ("act_project_id");



CREATE INDEX "idx_feature_requests_status" ON "public"."act_feature_requests" USING "btree" ("status");



CREATE INDEX "idx_feature_requests_storyteller" ON "public"."act_feature_requests" USING "btree" ("storyteller_id");



CREATE INDEX "idx_galleries_created_by" ON "public"."photo_galleries" USING "btree" ("created_by");



CREATE INDEX "idx_galleries_cultural" ON "public"."photo_galleries" USING "btree" ("cultural_sensitivity_level");



CREATE INDEX "idx_galleries_organization_id" ON "public"."galleries" USING "btree" ("organization_id");



CREATE INDEX "idx_galleries_privacy" ON "public"."photo_galleries" USING "btree" ("privacy_level");



CREATE INDEX "idx_galleries_search" ON "public"."photo_galleries" USING "gin" ("search_vector");



CREATE INDEX "idx_galleries_tenant_id" ON "public"."photo_galleries" USING "btree" ("tenant_id");



CREATE INDEX "idx_galleries_type" ON "public"."photo_galleries" USING "btree" ("gallery_type");



CREATE INDEX "idx_galleries_updated_at" ON "public"."photo_galleries" USING "btree" ("last_updated_at" DESC);



CREATE INDEX "idx_gallery_items_featured" ON "public"."photo_gallery_items" USING "btree" ("gallery_id", "is_featured") WHERE ("is_featured" = true);



CREATE INDEX "idx_gallery_items_gallery" ON "public"."photo_gallery_items" USING "btree" ("gallery_id");



CREATE INDEX "idx_gallery_items_media" ON "public"."photo_gallery_items" USING "btree" ("media_asset_id");



CREATE INDEX "idx_gallery_items_order" ON "public"."photo_gallery_items" USING "btree" ("gallery_id", "display_order");



CREATE INDEX "idx_gallery_media_category" ON "public"."gallery_media" USING "btree" ("category");



CREATE INDEX "idx_gallery_media_tenant" ON "public"."gallery_media" USING "btree" ("tenant_id");



CREATE INDEX "idx_gallery_media_type" ON "public"."gallery_media" USING "btree" ("media_type");



CREATE INDEX "idx_gallery_photos_gallery_id" ON "public"."gallery_photos" USING "btree" ("gallery_id");



CREATE INDEX "idx_geographic_impact_patterns_location" ON "public"."geographic_impact_patterns" USING "btree" ("location_id");



CREATE INDEX "idx_geographic_impact_patterns_scope" ON "public"."geographic_impact_patterns" USING "btree" ("geographic_scope");



CREATE INDEX "idx_geographic_impact_patterns_tenant_id" ON "public"."geographic_impact_patterns" USING "btree" ("tenant_id");



CREATE INDEX "idx_geographic_impact_patterns_themes" ON "public"."geographic_impact_patterns" USING "gin" ("primary_themes");



CREATE INDEX "idx_harvested_project" ON "public"."harvested_outcomes" USING "btree" ("project_id");



CREATE INDEX "idx_harvested_type" ON "public"."harvested_outcomes" USING "btree" ("change_type");



CREATE INDEX "idx_impact_stories_profile" ON "public"."impact_stories" USING "btree" ("profile_id");



CREATE INDEX "idx_impact_stories_suitable" ON "public"."impact_stories" USING "gin" ("suitable_for");



CREATE INDEX "idx_impact_stories_timeframe" ON "public"."impact_stories" USING "btree" ("timeframe");



CREATE INDEX "idx_import_sessions_status" ON "public"."media_import_sessions" USING "btree" ("status");



CREATE INDEX "idx_import_sessions_user" ON "public"."media_import_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_interp_date" ON "public"."community_interpretation_sessions" USING "btree" ("session_date" DESC);



CREATE INDEX "idx_interp_story" ON "public"."community_interpretation_sessions" USING "btree" ("story_id");



CREATE INDEX "idx_invitations_email" ON "public"."story_review_invitations" USING "btree" ("storyteller_email") WHERE ("storyteller_email" IS NOT NULL);



CREATE INDEX "idx_invitations_expires_at" ON "public"."story_review_invitations" USING "btree" ("expires_at");



CREATE INDEX "idx_invitations_story_id" ON "public"."story_review_invitations" USING "btree" ("story_id");



CREATE INDEX "idx_invitations_storyteller_id" ON "public"."story_review_invitations" USING "btree" ("storyteller_id") WHERE ("storyteller_id" IS NOT NULL);



CREATE INDEX "idx_invitations_token" ON "public"."story_review_invitations" USING "btree" ("token");



CREATE UNIQUE INDEX "idx_locations_unique" ON "public"."locations" USING "btree" (COALESCE("name", ''::character varying), COALESCE("city", ''::character varying), COALESCE("state", ''::character varying), COALESCE("country", ''::character varying));



CREATE INDEX "idx_media_assets_bucket_status" ON "public"."media_assets" USING "btree" ("storage_bucket", "processing_status");



CREATE INDEX "idx_media_assets_checksum" ON "public"."media_assets" USING "btree" ("checksum") WHERE ("checksum" IS NOT NULL);



CREATE INDEX "idx_media_assets_collection_id" ON "public"."media_assets" USING "btree" ("collection_id") WHERE ("collection_id" IS NOT NULL);



CREATE INDEX "idx_media_assets_created_at" ON "public"."media_assets" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_media_assets_cultural_sensitivity" ON "public"."media_assets" USING "btree" ("cultural_sensitivity_level");



CREATE INDEX "idx_media_assets_file_hash" ON "public"."media_assets" USING "btree" ("file_hash") WHERE ("file_hash" IS NOT NULL);



CREATE INDEX "idx_media_assets_file_type" ON "public"."media_assets" USING "btree" ("file_type");



CREATE INDEX "idx_media_assets_location" ON "public"."media_assets" USING "btree" ("latitude", "longitude") WHERE (("latitude" IS NOT NULL) AND ("longitude" IS NOT NULL));



CREATE INDEX "idx_media_assets_media_type" ON "public"."media_assets" USING "btree" ("media_type");



CREATE INDEX "idx_media_assets_organization" ON "public"."media_assets" USING "btree" ("organization_id");



CREATE INDEX "idx_media_assets_organization_id" ON "public"."media_assets" USING "btree" ("organization_id");



CREATE INDEX "idx_media_assets_popular" ON "public"."media_assets" USING "btree" ("view_count" DESC, "created_at" DESC);



CREATE INDEX "idx_media_assets_privacy_level" ON "public"."media_assets" USING "btree" ("privacy_level");



CREATE INDEX "idx_media_assets_processing_status" ON "public"."media_assets" USING "btree" ("processing_status");



CREATE INDEX "idx_media_assets_project_id" ON "public"."media_assets" USING "btree" ("project_id");



CREATE INDEX "idx_media_assets_search" ON "public"."media_assets" USING "gin" ("search_vector");



CREATE INDEX "idx_media_assets_status" ON "public"."media_assets" USING "btree" ("status");



CREATE INDEX "idx_media_assets_storage_bucket" ON "public"."media_assets" USING "btree" ("storage_bucket");



CREATE INDEX "idx_media_assets_story_id" ON "public"."media_assets" USING "btree" ("story_id") WHERE ("story_id" IS NOT NULL);



CREATE INDEX "idx_media_assets_taken_at" ON "public"."media_assets" USING "btree" ("taken_at" DESC) WHERE ("taken_at" IS NOT NULL);



CREATE INDEX "idx_media_assets_tenant_date" ON "public"."media_assets" USING "btree" ("tenant_id", "created_at" DESC);



CREATE INDEX "idx_media_assets_tenant_id" ON "public"."media_assets" USING "btree" ("tenant_id");



CREATE INDEX "idx_media_assets_uploaded_by" ON "public"."media_assets" USING "btree" ("uploaded_by");



CREATE INDEX "idx_media_assets_uploader_date" ON "public"."media_assets" USING "btree" ("uploader_id", "created_at" DESC);



CREATE INDEX "idx_media_assets_uploader_id" ON "public"."media_assets" USING "btree" ("uploader_id");



CREATE INDEX "idx_media_files_category" ON "public"."media_files" USING "btree" ("category");



CREATE INDEX "idx_media_files_project" ON "public"."media_files" USING "btree" ("project_id");



CREATE INDEX "idx_media_files_sensitivity" ON "public"."media_files" USING "btree" ("cultural_sensitivity");



CREATE INDEX "idx_media_files_story" ON "public"."media_files" USING "btree" ("story_id");



CREATE INDEX "idx_media_files_storyteller" ON "public"."media_files" USING "btree" ("storyteller_id");



CREATE INDEX "idx_media_files_tags" ON "public"."media_files" USING "gin" ("tags");



CREATE INDEX "idx_media_files_type" ON "public"."media_files" USING "btree" ("type");



CREATE INDEX "idx_media_usage_media_asset_id" ON "public"."media_usage_tracking" USING "btree" ("media_asset_id");



CREATE INDEX "idx_media_usage_used_in" ON "public"."media_usage_tracking" USING "btree" ("used_in_type", "used_in_id");



CREATE INDEX "idx_memories_active" ON "public"."photo_memories" USING "btree" ("is_active", "display_date" DESC) WHERE ("is_active" = true);



CREATE INDEX "idx_memories_org_date" ON "public"."photo_memories" USING "btree" ("for_organization_id", "display_date" DESC) WHERE ("for_organization_id" IS NOT NULL);



CREATE INDEX "idx_memories_tenant" ON "public"."photo_memories" USING "btree" ("tenant_id");



CREATE INDEX "idx_memories_type" ON "public"."photo_memories" USING "btree" ("memory_type");



CREATE INDEX "idx_memories_user_date" ON "public"."photo_memories" USING "btree" ("for_user_id", "display_date" DESC) WHERE ("for_user_id" IS NOT NULL);



CREATE INDEX "idx_message_recipients_message" ON "public"."message_recipients" USING "btree" ("message_id");



CREATE INDEX "idx_message_recipients_recipient" ON "public"."message_recipients" USING "btree" ("recipient_id");



CREATE INDEX "idx_moderation_appeals_moderation" ON "public"."moderation_appeals" USING "btree" ("moderation_request_id");



CREATE INDEX "idx_moderation_appeals_status" ON "public"."moderation_appeals" USING "btree" ("appeal_status");



CREATE INDEX "idx_moderation_appeals_user" ON "public"."moderation_appeals" USING "btree" ("user_id");



CREATE INDEX "idx_moderation_results_content" ON "public"."moderation_results" USING "btree" ("content_id", "content_type");



CREATE INDEX "idx_moderation_results_created" ON "public"."moderation_results" USING "btree" ("created_at");



CREATE INDEX "idx_moderation_results_status" ON "public"."moderation_results" USING "btree" ("status");



CREATE INDEX "idx_narrative_themes_category" ON "public"."narrative_themes" USING "btree" ("theme_category");



CREATE INDEX "idx_narrative_themes_confidence" ON "public"."narrative_themes" USING "btree" ("ai_confidence_score" DESC);



CREATE INDEX "idx_narrative_themes_tenant" ON "public"."narrative_themes" USING "btree" ("tenant_id");



CREATE INDEX "idx_narrative_themes_usage" ON "public"."narrative_themes" USING "btree" ("usage_count" DESC);



CREATE INDEX "idx_notifications_created" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_expires" ON "public"."notifications" USING "btree" ("expires_at") WHERE ("expires_at" IS NOT NULL);



CREATE INDEX "idx_notifications_recipient" ON "public"."notifications" USING "btree" ("recipient_id");



CREATE INDEX "idx_notifications_recipient_unread" ON "public"."notifications" USING "btree" ("recipient_id") WHERE ("is_read" = false);



CREATE INDEX "idx_notifications_type" ON "public"."notifications" USING "btree" ("type");



CREATE INDEX "idx_opportunity_recommendations_match" ON "public"."opportunity_recommendations" USING "btree" ("match_score" DESC);



CREATE INDEX "idx_opportunity_recommendations_profile" ON "public"."opportunity_recommendations" USING "btree" ("profile_id");



CREATE INDEX "idx_opportunity_recommendations_type" ON "public"."opportunity_recommendations" USING "btree" ("opportunity_type");



CREATE INDEX "idx_org_analytics_org_id" ON "public"."organization_analytics" USING "btree" ("organization_id");



CREATE INDEX "idx_org_contexts_org_id" ON "public"."organization_contexts" USING "btree" ("organization_id");



CREATE INDEX "idx_org_impact_org" ON "public"."organization_impact_metrics" USING "btree" ("organization_id");



CREATE INDEX "idx_org_impact_score" ON "public"."organization_impact_metrics" USING "btree" ("overall_impact_score" DESC);



CREATE INDEX "idx_org_impact_tenant" ON "public"."organization_impact_metrics" USING "btree" ("tenant_id");



CREATE INDEX "idx_org_insights_confidence" ON "public"."organization_cross_transcript_insights" USING "btree" ("confidence_score" DESC);



CREATE INDEX "idx_org_insights_featured" ON "public"."organization_cross_transcript_insights" USING "btree" ("is_featured") WHERE ("is_featured" = true);



CREATE INDEX "idx_org_insights_org" ON "public"."organization_cross_transcript_insights" USING "btree" ("organization_id");



CREATE INDEX "idx_org_insights_significance" ON "public"."organization_cross_transcript_insights" USING "btree" ("significance") WHERE ("significance" = ANY (ARRAY['high'::"text", 'critical'::"text"]));



CREATE INDEX "idx_org_insights_type" ON "public"."organization_cross_transcript_insights" USING "btree" ("insight_type");



CREATE INDEX "idx_org_invitations_code" ON "public"."organization_invitations" USING "btree" ("invitation_code");



CREATE INDEX "idx_org_invitations_email" ON "public"."organization_invitations" USING "btree" ("email");



CREATE INDEX "idx_org_invitations_org" ON "public"."organization_invitations" USING "btree" ("organization_id");



CREATE INDEX "idx_org_invitations_profile" ON "public"."organization_invitations" USING "btree" ("profile_id");



CREATE INDEX "idx_org_invitations_status" ON "public"."organization_invitations" USING "btree" ("status");



CREATE INDEX "idx_org_network_org" ON "public"."organization_storyteller_network" USING "btree" ("organization_id");



CREATE INDEX "idx_org_network_storyteller_a" ON "public"."organization_storyteller_network" USING "btree" ("storyteller_a_id");



CREATE INDEX "idx_org_network_storyteller_b" ON "public"."organization_storyteller_network" USING "btree" ("storyteller_b_id");



CREATE INDEX "idx_org_network_strength" ON "public"."organization_storyteller_network" USING "btree" ("connection_strength" DESC);



CREATE INDEX "idx_org_network_type" ON "public"."organization_storyteller_network" USING "btree" ("connection_type");



CREATE INDEX "idx_org_theme_category" ON "public"."organization_theme_analytics" USING "btree" ("theme_category");



CREATE INDEX "idx_org_theme_cultural" ON "public"."organization_theme_analytics" USING "btree" ("cultural_relevance") WHERE ("cultural_relevance" = ANY (ARRAY['high'::"text", 'sacred'::"text"]));



CREATE INDEX "idx_org_theme_occurrences" ON "public"."organization_theme_analytics" USING "btree" ("total_occurrences" DESC);



CREATE INDEX "idx_org_theme_org" ON "public"."organization_theme_analytics" USING "btree" ("organization_id");



CREATE INDEX "idx_org_theme_theme" ON "public"."organization_theme_analytics" USING "btree" ("theme");



CREATE INDEX "idx_organization_duplicates_duplicate" ON "public"."organization_duplicates" USING "btree" ("duplicate_organization_id");



CREATE INDEX "idx_organization_duplicates_primary" ON "public"."organization_duplicates" USING "btree" ("primary_organization_id");



CREATE INDEX "idx_organization_duplicates_score" ON "public"."organization_duplicates" USING "btree" ("similarity_score");



CREATE INDEX "idx_organization_duplicates_status" ON "public"."organization_duplicates" USING "btree" ("resolution_status");



CREATE INDEX "idx_organization_enrichment_confidence" ON "public"."organization_enrichment" USING "btree" ("confidence_score");



CREATE INDEX "idx_organization_enrichment_org_id" ON "public"."organization_enrichment" USING "btree" ("organization_id");



CREATE INDEX "idx_organization_enrichment_type" ON "public"."organization_enrichment" USING "btree" ("enrichment_type");



CREATE INDEX "idx_organization_enrichment_validation" ON "public"."organization_enrichment" USING "btree" ("validation_status");



CREATE INDEX "idx_organization_roles_active" ON "public"."organization_roles" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_organization_roles_granted_at" ON "public"."organization_roles" USING "btree" ("granted_at");



CREATE INDEX "idx_organization_roles_organization_id" ON "public"."organization_roles" USING "btree" ("organization_id");



CREATE INDEX "idx_organization_roles_profile_id" ON "public"."organization_roles" USING "btree" ("profile_id");



CREATE INDEX "idx_organization_roles_role" ON "public"."organization_roles" USING "btree" ("role");



CREATE INDEX "idx_organizations_billing_status" ON "public"."organizations" USING "btree" ("billing_status");



CREATE INDEX "idx_organizations_collaboration_settings" ON "public"."organizations" USING "gin" ("collaboration_settings");



CREATE INDEX "idx_organizations_community_approval" ON "public"."organizations" USING "btree" ("community_approval_required");



CREATE INDEX "idx_organizations_cultural_identity" ON "public"."organizations" USING "gin" ("cultural_identity");



CREATE INDEX "idx_organizations_cultural_protocols" ON "public"."organizations" USING "gin" ("cultural_protocols");



CREATE INDEX "idx_organizations_default_permissions" ON "public"."organizations" USING "gin" ("default_permissions");



CREATE INDEX "idx_organizations_distribution_policy" ON "public"."organizations" USING "gin" ("distribution_policy");



CREATE INDEX "idx_organizations_domain" ON "public"."organizations" USING "btree" ("domain");



CREATE INDEX "idx_organizations_elder_oversight" ON "public"."organizations" USING "btree" ("elder_oversight_required");



CREATE INDEX "idx_organizations_governance_structure" ON "public"."organizations" USING "gin" ("governance_structure");



CREATE INDEX "idx_organizations_guest_pin" ON "public"."organizations" USING "btree" ("guest_pin") WHERE ("guest_access_enabled" = true);



CREATE INDEX "idx_organizations_justicehub" ON "public"."organizations" USING "btree" ("justicehub_enabled") WHERE ("justicehub_enabled" = true);



CREATE INDEX "idx_organizations_justicehub_enabled" ON "public"."organizations" USING "btree" ("justicehub_enabled") WHERE ("justicehub_enabled" = true);



CREATE INDEX "idx_organizations_location" ON "public"."organizations" USING "btree" ("location_id");



CREATE INDEX "idx_organizations_name" ON "public"."organizations" USING "btree" ("name");



CREATE INDEX "idx_organizations_shared_vocabularies" ON "public"."organizations" USING "gin" ("shared_vocabularies");



CREATE INDEX "idx_organizations_slug" ON "public"."organizations" USING "btree" ("slug");



CREATE INDEX "idx_organizations_status" ON "public"."organizations" USING "btree" ("status");



CREATE INDEX "idx_organizations_subscription_tier" ON "public"."organizations" USING "btree" ("subscription_tier");



CREATE INDEX "idx_organizations_tenant" ON "public"."organizations" USING "btree" ("tenant_id");



CREATE INDEX "idx_organizations_tier" ON "public"."organizations" USING "btree" ("tier");



CREATE INDEX "idx_organizations_type" ON "public"."organizations" USING "btree" ("type");



CREATE INDEX "idx_outcomes_level" ON "public"."outcomes" USING "btree" ("outcome_level");



CREATE INDEX "idx_outcomes_measurement_date" ON "public"."outcomes" USING "btree" ("measurement_date");



CREATE INDEX "idx_outcomes_organization" ON "public"."outcomes" USING "btree" ("organization_id");



CREATE INDEX "idx_outcomes_service_area" ON "public"."outcomes" USING "btree" ("service_area");



CREATE INDEX "idx_outcomes_tenant" ON "public"."outcomes" USING "btree" ("tenant_id");



CREATE INDEX "idx_outcomes_type" ON "public"."outcomes" USING "btree" ("outcome_type");



CREATE UNIQUE INDEX "idx_partner_analytics_daily_unique" ON "public"."partner_analytics_daily" USING "btree" ("app_id", COALESCE("project_id", '00000000-0000-0000-0000-000000000000'::"uuid"), "date");



CREATE INDEX "idx_partner_analytics_date" ON "public"."partner_analytics_daily" USING "btree" ("app_id", "date");



CREATE INDEX "idx_partner_analytics_project" ON "public"."partner_analytics_daily" USING "btree" ("project_id", "date");



CREATE INDEX "idx_partner_messages_app" ON "public"."partner_messages" USING "btree" ("app_id");



CREATE INDEX "idx_partner_messages_storyteller" ON "public"."partner_messages" USING "btree" ("storyteller_id");



CREATE INDEX "idx_partner_messages_thread" ON "public"."partner_messages" USING "btree" ("thread_id");



CREATE INDEX "idx_partner_messages_unread" ON "public"."partner_messages" USING "btree" ("storyteller_id", "is_read") WHERE ("is_read" = false);



CREATE INDEX "idx_partner_projects_active" ON "public"."partner_projects" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_partner_projects_app" ON "public"."partner_projects" USING "btree" ("app_id");



CREATE INDEX "idx_partner_team_app" ON "public"."partner_team_members" USING "btree" ("app_id");



CREATE INDEX "idx_partner_team_invitation" ON "public"."partner_team_members" USING "btree" ("invitation_token") WHERE ("accepted_at" IS NULL);



CREATE INDEX "idx_partner_team_user" ON "public"."partner_team_members" USING "btree" ("user_id");



CREATE INDEX "idx_personal_insights_analyzed" ON "public"."personal_insights" USING "btree" ("last_analyzed_at");



CREATE INDEX "idx_personal_insights_profile" ON "public"."personal_insights" USING "btree" ("profile_id");



CREATE INDEX "idx_photo_galleries_organization" ON "public"."photo_galleries" USING "btree" ("organization_id");



CREATE INDEX "idx_photo_galleries_project_id" ON "public"."photo_galleries" USING "btree" ("project_id");



CREATE INDEX "idx_photo_locations_context" ON "public"."photo_locations" USING "btree" ("location_context");



CREATE INDEX "idx_photo_locations_location" ON "public"."photo_locations" USING "btree" ("location_id");



CREATE INDEX "idx_photo_locations_photo" ON "public"."photo_locations" USING "btree" ("photo_id");



CREATE INDEX "idx_photo_organizations_org" ON "public"."photo_organizations" USING "btree" ("organization_id");



CREATE INDEX "idx_photo_organizations_photo" ON "public"."photo_organizations" USING "btree" ("photo_id");



CREATE INDEX "idx_photo_organizations_role" ON "public"."photo_organizations" USING "btree" ("organization_role");



CREATE INDEX "idx_photo_projects_photo" ON "public"."photo_projects" USING "btree" ("photo_id");



CREATE INDEX "idx_photo_projects_project" ON "public"."photo_projects" USING "btree" ("project_id");



CREATE INDEX "idx_photo_projects_role" ON "public"."photo_projects" USING "btree" ("project_role");



CREATE INDEX "idx_photo_storytellers_consent" ON "public"."photo_storytellers" USING "btree" ("consent_given") WHERE ("consent_given" = true);



CREATE INDEX "idx_photo_storytellers_photo" ON "public"."photo_storytellers" USING "btree" ("photo_id");



CREATE INDEX "idx_photo_storytellers_relationship" ON "public"."photo_storytellers" USING "btree" ("relationship_type");



CREATE INDEX "idx_photo_storytellers_storyteller" ON "public"."photo_storytellers" USING "btree" ("storyteller_id");



CREATE INDEX "idx_platform_analytics_period" ON "public"."platform_analytics" USING "btree" ("period_start", "period_end");



CREATE INDEX "idx_platform_analytics_tenant" ON "public"."platform_analytics" USING "btree" ("tenant_id");



CREATE INDEX "idx_platform_analytics_type" ON "public"."platform_analytics" USING "btree" ("period_type");



CREATE INDEX "idx_privacy_changes_user_timestamp" ON "public"."privacy_changes" USING "btree" ("user_id", "timestamp" DESC);



CREATE INDEX "idx_processing_jobs_created_at" ON "public"."processing_jobs" USING "btree" ("created_at");



CREATE INDEX "idx_processing_jobs_priority" ON "public"."processing_jobs" USING "btree" ("priority");



CREATE INDEX "idx_processing_jobs_status" ON "public"."processing_jobs" USING "btree" ("status");



CREATE INDEX "idx_processing_jobs_type" ON "public"."processing_jobs" USING "btree" ("type");



CREATE INDEX "idx_professional_competencies_category" ON "public"."professional_competencies" USING "btree" ("skill_category");



CREATE INDEX "idx_professional_competencies_profile" ON "public"."professional_competencies" USING "btree" ("profile_id");



CREATE INDEX "idx_professional_competencies_value" ON "public"."professional_competencies" USING "btree" ("market_value_score" DESC);



CREATE INDEX "idx_profile_galleries_gallery_id" ON "public"."profile_galleries" USING "btree" ("gallery_id");



CREATE INDEX "idx_profile_galleries_profile_id" ON "public"."profile_galleries" USING "btree" ("profile_id");



CREATE INDEX "idx_profile_locations_location_id" ON "public"."profile_locations" USING "btree" ("location_id");



CREATE INDEX "idx_profile_locations_profile_id" ON "public"."profile_locations" USING "btree" ("profile_id");



CREATE INDEX "idx_profile_organizations_active" ON "public"."profile_organizations" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_profile_organizations_org" ON "public"."profile_organizations" USING "btree" ("organization_id");



CREATE INDEX "idx_profile_organizations_organization_id" ON "public"."profile_organizations" USING "btree" ("organization_id");



CREATE INDEX "idx_profile_organizations_profile" ON "public"."profile_organizations" USING "btree" ("profile_id");



CREATE INDEX "idx_profile_organizations_profile_id" ON "public"."profile_organizations" USING "btree" ("profile_id");



CREATE INDEX "idx_profile_organizations_role" ON "public"."profile_organizations" USING "btree" ("role");



CREATE INDEX "idx_profile_projects_profile_id" ON "public"."profile_projects" USING "btree" ("profile_id");



CREATE INDEX "idx_profile_projects_project_id" ON "public"."profile_projects" USING "btree" ("project_id");



CREATE INDEX "idx_profiles_ai_personality_gin" ON "public"."profiles" USING "gin" ("ai_personality_insights");



CREATE INDEX "idx_profiles_ai_themes_gin" ON "public"."profiles" USING "gin" ("ai_themes");



CREATE INDEX "idx_profiles_bio_gin" ON "public"."profiles" USING "gin" ("bio" "public"."gin_trgm_ops");



CREATE INDEX "idx_profiles_change_maker_type" ON "public"."profiles" USING "btree" ("change_maker_type");



CREATE INDEX "idx_profiles_collaboration" ON "public"."profiles" USING "btree" ("available_for_collaboration") WHERE ("available_for_collaboration" = true);



CREATE INDEX "idx_profiles_community_roles" ON "public"."profiles" USING "gin" ("community_roles");



CREATE INDEX "idx_profiles_consent" ON "public"."profiles" USING "btree" ("consent_given", "ai_processing_consent");



CREATE INDEX "idx_profiles_created_by" ON "public"."profiles" USING "btree" ("created_by");



CREATE INDEX "idx_profiles_cultural_affiliations" ON "public"."profiles" USING "gin" ("cultural_affiliations");



CREATE INDEX "idx_profiles_display_name_gin" ON "public"."profiles" USING "gin" ("display_name" "public"."gin_trgm_ops");



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email") WHERE ("email" IS NOT NULL);



CREATE INDEX "idx_profiles_expertise_areas" ON "public"."profiles" USING "gin" ("expertise_areas");



CREATE INDEX "idx_profiles_featured_video" ON "public"."profiles" USING "btree" ("featured_video_url") WHERE ("featured_video_url" IS NOT NULL);



CREATE INDEX "idx_profiles_fts" ON "public"."profiles" USING "gin" ("to_tsvector"('"english"'::"regconfig", ((((COALESCE("full_name", ''::"text") || ' '::"text") || COALESCE("bio", ''::"text")) || ' '::"text") || COALESCE("personal_statement", ''::"text"))));



CREATE INDEX "idx_profiles_full_name" ON "public"."profiles" USING "btree" ("full_name");



CREATE INDEX "idx_profiles_full_name_gin" ON "public"."profiles" USING "gin" ("full_name" "public"."gin_trgm_ops");



CREATE INDEX "idx_profiles_geographic_scope" ON "public"."profiles" USING "btree" ("geographic_scope");



CREATE INDEX "idx_profiles_impact_focus_areas" ON "public"."profiles" USING "gin" ("impact_focus_areas");



CREATE INDEX "idx_profiles_is_featured" ON "public"."profiles" USING "btree" ("is_featured");



CREATE INDEX "idx_profiles_is_storyteller" ON "public"."profiles" USING "btree" ("is_storyteller") WHERE ("is_storyteller" = true);



CREATE INDEX "idx_profiles_justicehub" ON "public"."profiles" USING "btree" ("justicehub_enabled") WHERE ("justicehub_enabled" = true);



CREATE INDEX "idx_profiles_justicehub_enabled" ON "public"."profiles" USING "btree" ("justicehub_enabled") WHERE ("justicehub_enabled" = true);



CREATE INDEX "idx_profiles_languages" ON "public"."profiles" USING "gin" ("languages_spoken");



CREATE INDEX "idx_profiles_legacy_id" ON "public"."profiles" USING "btree" ("legacy_storyteller_id");



CREATE INDEX "idx_profiles_legacy_storyteller_id" ON "public"."profiles" USING "btree" ("legacy_storyteller_id");



CREATE INDEX "idx_profiles_location" ON "public"."profiles" USING "btree" ("location_id");



CREATE INDEX "idx_profiles_mentor_availability" ON "public"."profiles" USING "btree" ("mentor_availability") WHERE ("mentor_availability" = true);



CREATE INDEX "idx_profiles_mentoring" ON "public"."profiles" USING "btree" ("open_to_mentoring") WHERE ("open_to_mentoring" = true);



CREATE INDEX "idx_profiles_phone" ON "public"."profiles" USING "btree" ("phone_number") WHERE ("phone_number" IS NOT NULL);



CREATE INDEX "idx_profiles_primary_org" ON "public"."profiles" USING "btree" ("primary_organization_id");



CREATE INDEX "idx_profiles_speaking_availability" ON "public"."profiles" USING "btree" ("speaking_availability") WHERE ("speaking_availability" = true);



CREATE INDEX "idx_profiles_status" ON "public"."profiles" USING "btree" ("profile_status");



CREATE INDEX "idx_profiles_storytelling_methods" ON "public"."profiles" USING "gin" ("storytelling_methods");



CREATE INDEX "idx_profiles_tenant" ON "public"."profiles" USING "btree" ("tenant_id") WHERE ("tenant_id" IS NOT NULL);



CREATE INDEX "idx_profiles_tenant_id" ON "public"."profiles" USING "btree" ("tenant_id");



CREATE INDEX "idx_profiles_tenant_roles" ON "public"."profiles" USING "gin" ("tenant_roles");



CREATE INDEX "idx_profiles_video_introduction" ON "public"."profiles" USING "btree" ("video_introduction_url") WHERE ("video_introduction_url" IS NOT NULL);



CREATE INDEX "idx_profiles_video_portfolio" ON "public"."profiles" USING "gin" ("video_portfolio_urls") WHERE ("video_portfolio_urls" <> '{}'::"text"[]);



CREATE INDEX "idx_profiles_visibility" ON "public"."profiles" USING "btree" ("story_visibility_level");



CREATE INDEX "idx_proj_analytics_proj_id" ON "public"."project_analytics" USING "btree" ("project_id");



CREATE INDEX "idx_project_analyses_analyzed_at" ON "public"."project_analyses" USING "btree" ("analyzed_at" DESC);



CREATE INDEX "idx_project_analyses_content_hash" ON "public"."project_analyses" USING "btree" ("content_hash");



CREATE INDEX "idx_project_analyses_project_id" ON "public"."project_analyses" USING "btree" ("project_id");



CREATE INDEX "idx_project_contexts_inherits" ON "public"."project_contexts" USING "btree" ("organization_id") WHERE ("inherits_from_org" = true);



CREATE INDEX "idx_project_contexts_org_id" ON "public"."project_contexts" USING "btree" ("organization_id");



CREATE INDEX "idx_project_contexts_project_id" ON "public"."project_contexts" USING "btree" ("project_id");



CREATE INDEX "idx_project_organizations_organization_id" ON "public"."project_organizations" USING "btree" ("organization_id");



CREATE INDEX "idx_project_organizations_project_id" ON "public"."project_organizations" USING "btree" ("project_id");



CREATE INDEX "idx_project_profiles_project" ON "public"."project_profiles" USING "btree" ("project_id");



CREATE INDEX "idx_project_storytellers_project_id" ON "public"."project_storytellers" USING "btree" ("project_id");



CREATE INDEX "idx_project_storytellers_storyteller_id" ON "public"."project_storytellers" USING "btree" ("storyteller_id");



CREATE INDEX "idx_project_updates_created_at" ON "public"."project_updates" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_project_updates_project_id" ON "public"."project_updates" USING "btree" ("project_id");



CREATE INDEX "idx_projects_context_model" ON "public"."projects" USING "btree" ("context_model") WHERE ("context_model" <> 'none'::"text");



CREATE INDEX "idx_projects_created_by" ON "public"."projects" USING "btree" ("created_by");



CREATE INDEX "idx_projects_justicehub" ON "public"."projects" USING "btree" ("justicehub_enabled") WHERE ("justicehub_enabled" = true);



CREATE INDEX "idx_projects_justicehub_enabled" ON "public"."projects" USING "btree" ("justicehub_enabled") WHERE ("justicehub_enabled" = true);



CREATE INDEX "idx_projects_location" ON "public"."projects" USING "btree" ("location_id");



CREATE INDEX "idx_projects_organization" ON "public"."projects" USING "btree" ("organization_id");



CREATE INDEX "idx_projects_status" ON "public"."projects" USING "btree" ("status");



CREATE INDEX "idx_projects_tenant" ON "public"."projects" USING "btree" ("tenant_id");



CREATE INDEX "idx_quotes_approval" ON "public"."quotes" USING "btree" ("attribution_approved", "storyteller_approved");



CREATE INDEX "idx_quotes_author_id" ON "public"."quotes" USING "btree" ("author_id");



CREATE INDEX "idx_quotes_fts" ON "public"."quotes" USING "gin" ("to_tsvector"('"english"'::"regconfig", ((((COALESCE("quote_text", ''::"text") || ' '::"text") || COALESCE("context_before", ''::"text")) || ' '::"text") || COALESCE("context_after", ''::"text"))));



CREATE INDEX "idx_quotes_legacy_quote_id" ON "public"."quotes" USING "btree" ("legacy_quote_id");



CREATE INDEX "idx_quotes_org_id" ON "public"."extracted_quotes" USING "btree" ("organization_id");



CREATE INDEX "idx_quotes_proj_id" ON "public"."extracted_quotes" USING "btree" ("project_id");



CREATE INDEX "idx_quotes_quote_text_gin" ON "public"."quotes" USING "gin" ("quote_text" "public"."gin_trgm_ops");



CREATE INDEX "idx_quotes_search" ON "public"."extracted_quotes" USING "gin" ("search_vector");



CREATE INDEX "idx_quotes_significance_score" ON "public"."quotes" USING "btree" ("significance_score" DESC);



CREATE INDEX "idx_quotes_story_id" ON "public"."quotes" USING "btree" ("story_id");



CREATE INDEX "idx_quotes_storyteller_approved" ON "public"."quotes" USING "btree" ("storyteller_approved") WHERE ("storyteller_approved" = true);



CREATE INDEX "idx_quotes_tenant_author" ON "public"."quotes" USING "btree" ("tenant_id", "author_id");



CREATE INDEX "idx_quotes_tenant_id" ON "public"."quotes" USING "btree" ("tenant_id");



CREATE INDEX "idx_quotes_themes" ON "public"."quotes" USING "gin" ("themes");



CREATE INDEX "idx_quotes_themes_gin" ON "public"."quotes" USING "gin" ("themes");



CREATE INDEX "idx_response_story" ON "public"."community_story_responses" USING "btree" ("story_id");



CREATE INDEX "idx_response_type" ON "public"."community_story_responses" USING "btree" ("response_type");



CREATE INDEX "idx_ripple_level" ON "public"."ripple_effects" USING "btree" ("ripple_level");



CREATE INDEX "idx_ripple_story" ON "public"."ripple_effects" USING "btree" ("story_id");



CREATE INDEX "idx_scraped_services_category" ON "public"."scraped_services" USING "btree" ("category");



CREATE INDEX "idx_scraped_services_confidence" ON "public"."scraped_services" USING "btree" ("confidence_score");



CREATE INDEX "idx_scraped_services_org_id" ON "public"."scraped_services" USING "btree" ("organization_id");



CREATE INDEX "idx_scraped_services_validation" ON "public"."scraped_services" USING "btree" ("validation_status");



CREATE INDEX "idx_scraper_health_source_id" ON "public"."scraper_health_metrics" USING "btree" ("data_source_id");



CREATE INDEX "idx_scraper_health_status" ON "public"."scraper_health_metrics" USING "btree" ("status");



CREATE INDEX "idx_scraper_health_timestamp" ON "public"."scraper_health_metrics" USING "btree" ("measurement_timestamp");



CREATE INDEX "idx_scraping_metadata_org_id" ON "public"."scraping_metadata" USING "btree" ("organization_id");



CREATE INDEX "idx_scraping_metadata_source_type" ON "public"."scraping_metadata" USING "btree" ("source_type");



CREATE INDEX "idx_scraping_metadata_timestamp" ON "public"."scraping_metadata" USING "btree" ("scraping_timestamp");



CREATE INDEX "idx_scraping_metadata_validation_status" ON "public"."scraping_metadata" USING "btree" ("validation_status");



CREATE INDEX "idx_seed_interviews_project" ON "public"."project_seed_interviews" USING "btree" ("project_id");



CREATE INDEX "idx_service_impact_organization" ON "public"."service_impact" USING "btree" ("organization_id");



CREATE INDEX "idx_service_impact_period" ON "public"."service_impact" USING "btree" ("period_start", "period_end");



CREATE INDEX "idx_service_impact_service" ON "public"."service_impact" USING "btree" ("service_area");



CREATE INDEX "idx_sroi_calc_input" ON "public"."sroi_calculations" USING "btree" ("sroi_input_id");



CREATE INDEX "idx_sroi_inputs_org" ON "public"."sroi_inputs" USING "btree" ("organization_id");



CREATE INDEX "idx_sroi_inputs_project" ON "public"."sroi_inputs" USING "btree" ("project_id");



CREATE INDEX "idx_sroi_outcomes_input" ON "public"."sroi_outcomes" USING "btree" ("sroi_input_id");



CREATE INDEX "idx_sroi_outcomes_stakeholder" ON "public"."sroi_outcomes" USING "btree" ("stakeholder_group");



CREATE INDEX "idx_stories_author_id" ON "public"."stories" USING "btree" ("author_id");



CREATE INDEX "idx_stories_content_gin" ON "public"."stories" USING "gin" ("content" "public"."gin_trgm_ops");



CREATE INDEX "idx_stories_cultural_level" ON "public"."stories" USING "btree" ("cultural_sensitivity_level");



CREATE INDEX "idx_stories_cultural_themes_gin" ON "public"."stories" USING "gin" ("cultural_themes");



CREATE INDEX "idx_stories_elder_reviewed" ON "public"."stories" USING "btree" ("elder_reviewed") WHERE ("elder_reviewed" = true);



CREATE INDEX "idx_stories_embedding" ON "public"."stories" USING "hnsw" ("embedding" "public"."vector_cosine_ops");



CREATE INDEX "idx_stories_fellowship_phase" ON "public"."stories" USING "btree" ("fellowship_phase");



CREATE INDEX "idx_stories_fts" ON "public"."stories" USING "gin" ("to_tsvector"('"english"'::"regconfig", ((((COALESCE("title", ''::"text") || ' '::"text") || COALESCE("content", ''::"text")) || ' '::"text") || COALESCE("summary", ''::"text"))));



CREATE INDEX "idx_stories_is_featured" ON "public"."stories" USING "btree" ("is_featured") WHERE ("is_featured" = true);



CREATE INDEX "idx_stories_legacy_story_id" ON "public"."stories" USING "btree" ("legacy_story_id");



CREATE INDEX "idx_stories_likes_count" ON "public"."stories" USING "btree" ("likes_count" DESC);



CREATE INDEX "idx_stories_organization" ON "public"."stories" USING "btree" ("organization_id");



CREATE INDEX "idx_stories_permission_tier" ON "public"."stories" USING "btree" ("permission_tier");



CREATE INDEX "idx_stories_privacy" ON "public"."stories" USING "btree" ("privacy_level", "is_public");



CREATE INDEX "idx_stories_privacy_level" ON "public"."stories" USING "btree" ("privacy_level");



CREATE INDEX "idx_stories_published_at" ON "public"."stories" USING "btree" ("published_at");



CREATE INDEX "idx_stories_search" ON "public"."stories" USING "gin" ("search_vector");



CREATE INDEX "idx_stories_stage" ON "public"."stories" USING "btree" ("story_stage");



CREATE INDEX "idx_stories_status" ON "public"."stories" USING "btree" ("status");



CREATE INDEX "idx_stories_story_category" ON "public"."stories" USING "btree" ("story_category");



CREATE INDEX "idx_stories_storyteller_id" ON "public"."stories" USING "btree" ("storyteller_id");



CREATE INDEX "idx_stories_tenant_author" ON "public"."stories" USING "btree" ("tenant_id", "author_id");



CREATE INDEX "idx_stories_tenant_id" ON "public"."stories" USING "btree" ("tenant_id");



CREATE INDEX "idx_stories_themes" ON "public"."stories" USING "gin" ("themes");



CREATE INDEX "idx_stories_themes_gin" ON "public"."stories" USING "gin" ("themes");



CREATE INDEX "idx_stories_title_gin" ON "public"."stories" USING "gin" ("title" "public"."gin_trgm_ops");



CREATE INDEX "idx_stories_transcript_id" ON "public"."stories" USING "btree" ("transcript_id");



CREATE INDEX "idx_stories_video_stage" ON "public"."stories" USING "btree" ("video_stage") WHERE ("video_stage" IS NOT NULL);



CREATE INDEX "idx_stories_views_count" ON "public"."stories" USING "btree" ("views_count" DESC);



CREATE INDEX "idx_story_access_log_accessed_at" ON "public"."story_access_log" USING "btree" ("accessed_at" DESC);



CREATE INDEX "idx_story_access_log_app" ON "public"."story_access_log" USING "btree" ("app_id");



CREATE INDEX "idx_story_access_log_story" ON "public"."story_access_log" USING "btree" ("story_id");



CREATE INDEX "idx_story_access_tokens_active" ON "public"."story_access_tokens" USING "btree" ("token", "revoked", "expires_at") WHERE ("revoked" = false);



CREATE INDEX "idx_story_access_tokens_expires_at" ON "public"."story_access_tokens" USING "btree" ("expires_at");



CREATE INDEX "idx_story_access_tokens_story_id" ON "public"."story_access_tokens" USING "btree" ("story_id");



CREATE INDEX "idx_story_access_tokens_tenant_id" ON "public"."story_access_tokens" USING "btree" ("tenant_id");



CREATE INDEX "idx_story_access_tokens_token" ON "public"."story_access_tokens" USING "btree" ("token");



CREATE INDEX "idx_story_arcs_analyzed_at" ON "public"."story_narrative_arcs" USING "btree" ("analyzed_at" DESC);



CREATE INDEX "idx_story_arcs_story_id" ON "public"."story_narrative_arcs" USING "btree" ("story_id");



CREATE INDEX "idx_story_arcs_type" ON "public"."story_narrative_arcs" USING "btree" ("arc_type");



CREATE INDEX "idx_story_distributions_created_at" ON "public"."story_distributions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_story_distributions_embed_domain" ON "public"."story_distributions" USING "btree" ("embed_domain");



CREATE INDEX "idx_story_distributions_platform" ON "public"."story_distributions" USING "btree" ("platform");



CREATE INDEX "idx_story_distributions_status" ON "public"."story_distributions" USING "btree" ("status");



CREATE INDEX "idx_story_distributions_story_id" ON "public"."story_distributions" USING "btree" ("story_id");



CREATE INDEX "idx_story_distributions_tenant_id" ON "public"."story_distributions" USING "btree" ("tenant_id");



CREATE INDEX "idx_story_features_project" ON "public"."story_project_features" USING "btree" ("act_project_id");



CREATE INDEX "idx_story_features_story" ON "public"."story_project_features" USING "btree" ("story_id");



CREATE INDEX "idx_story_features_visible" ON "public"."story_project_features" USING "btree" ("is_visible") WHERE ("is_visible" = true);



CREATE INDEX "idx_story_requests_app" ON "public"."story_syndication_requests" USING "btree" ("app_id");



CREATE INDEX "idx_story_requests_pending" ON "public"."story_syndication_requests" USING "btree" ("status", "expires_at") WHERE ("status" = 'pending'::"text");



CREATE INDEX "idx_story_requests_project" ON "public"."story_syndication_requests" USING "btree" ("project_id");



CREATE INDEX "idx_story_requests_status" ON "public"."story_syndication_requests" USING "btree" ("status");



CREATE INDEX "idx_story_requests_story" ON "public"."story_syndication_requests" USING "btree" ("story_id");



CREATE INDEX "idx_story_syndication_consent_app" ON "public"."story_syndication_consent" USING "btree" ("app_id");



CREATE INDEX "idx_story_syndication_consent_granted" ON "public"."story_syndication_consent" USING "btree" ("consent_granted") WHERE ("consent_granted" = true);



CREATE INDEX "idx_story_syndication_consent_story" ON "public"."story_syndication_consent" USING "btree" ("story_id");



CREATE INDEX "idx_story_syndication_consent_storyteller" ON "public"."story_syndication_consent" USING "btree" ("storyteller_id");



CREATE INDEX "idx_story_tags_ai_score" ON "public"."story_project_tags" USING "btree" ("relevance_score" DESC) WHERE ("relevance_score" IS NOT NULL);



CREATE INDEX "idx_story_tags_featured" ON "public"."story_project_tags" USING "btree" ("act_project_id", "is_featured") WHERE ("is_featured" = true);



CREATE INDEX "idx_story_tags_priority" ON "public"."story_project_tags" USING "btree" ("act_project_id", "featured_priority" DESC) WHERE ("is_featured" = true);



CREATE INDEX "idx_story_tags_project" ON "public"."story_project_tags" USING "btree" ("act_project_id");



CREATE INDEX "idx_story_tags_story" ON "public"."story_project_tags" USING "btree" ("story_id");



CREATE INDEX "idx_storyteller_analytics_engagement" ON "public"."storyteller_analytics" USING "btree" ("total_engagement_score" DESC);



CREATE INDEX "idx_storyteller_analytics_impact_score" ON "public"."storyteller_analytics" USING "btree" ("impact_reach" DESC);



CREATE INDEX "idx_storyteller_analytics_storyteller_id" ON "public"."storyteller_analytics" USING "btree" ("storyteller_id");



CREATE INDEX "idx_storyteller_analytics_tenant_id" ON "public"."storyteller_analytics" USING "btree" ("tenant_id");



CREATE INDEX "idx_storyteller_connections_a" ON "public"."storyteller_connections" USING "btree" ("storyteller_a_id");



CREATE INDEX "idx_storyteller_connections_b" ON "public"."storyteller_connections" USING "btree" ("storyteller_b_id");



CREATE INDEX "idx_storyteller_connections_mutual" ON "public"."storyteller_connections" USING "btree" ("is_mutual") WHERE ("is_mutual" = true);



CREATE INDEX "idx_storyteller_connections_status" ON "public"."storyteller_connections" USING "btree" ("status");



CREATE INDEX "idx_storyteller_connections_strength" ON "public"."storyteller_connections" USING "btree" ("connection_strength" DESC);



CREATE INDEX "idx_storyteller_connections_suggested" ON "public"."storyteller_connections" USING "btree" ("suggested_at" DESC) WHERE (("status")::"text" = 'suggested'::"text");



CREATE INDEX "idx_storyteller_connections_type" ON "public"."storyteller_connections" USING "btree" ("connection_type");



CREATE INDEX "idx_storyteller_dashboard_config_storyteller" ON "public"."storyteller_dashboard_config" USING "btree" ("storyteller_id");



CREATE INDEX "idx_storyteller_demographics_cultural" ON "public"."storyteller_demographics" USING "gin" ("cultural_background");



CREATE INDEX "idx_storyteller_demographics_generation" ON "public"."storyteller_demographics" USING "btree" ("generation_category");



CREATE INDEX "idx_storyteller_demographics_location" ON "public"."storyteller_demographics" USING "gin" ((("current_location" -> 'city'::"text")));



CREATE INDEX "idx_storyteller_demographics_professional" ON "public"."storyteller_demographics" USING "gin" ("professional_background");



CREATE INDEX "idx_storyteller_demographics_region" ON "public"."storyteller_demographics" USING "btree" ("geographic_region");



CREATE INDEX "idx_storyteller_demographics_storyteller" ON "public"."storyteller_demographics" USING "btree" ("storyteller_id");



CREATE INDEX "idx_storyteller_engagement_period" ON "public"."storyteller_engagement" USING "btree" ("period_start", "period_end");



CREATE INDEX "idx_storyteller_engagement_scores" ON "public"."storyteller_engagement" USING "btree" ("engagement_score" DESC, "impact_score" DESC);



CREATE INDEX "idx_storyteller_engagement_storyteller" ON "public"."storyteller_engagement" USING "btree" ("storyteller_id");



CREATE INDEX "idx_storyteller_engagement_type" ON "public"."storyteller_engagement" USING "btree" ("period_type");



CREATE INDEX "idx_storyteller_features_priority" ON "public"."storyteller_project_features" USING "btree" ("act_project_id", "featured_priority" DESC) WHERE ("is_visible" = true);



CREATE INDEX "idx_storyteller_features_project" ON "public"."storyteller_project_features" USING "btree" ("act_project_id");



CREATE INDEX "idx_storyteller_features_storyteller" ON "public"."storyteller_project_features" USING "btree" ("storyteller_id");



CREATE INDEX "idx_storyteller_features_visible" ON "public"."storyteller_project_features" USING "btree" ("act_project_id", "is_visible") WHERE ("is_visible" = true);



CREATE INDEX "idx_storyteller_impact_cultural_score" ON "public"."storyteller_impact_metrics" USING "btree" ("cultural_impact_score" DESC);



CREATE INDEX "idx_storyteller_impact_metrics_storyteller_id" ON "public"."storyteller_impact_metrics" USING "btree" ("storyteller_id");



CREATE INDEX "idx_storyteller_impact_metrics_tenant_id" ON "public"."storyteller_impact_metrics" USING "btree" ("tenant_id");



CREATE INDEX "idx_storyteller_impact_overall_score" ON "public"."storyteller_impact_metrics" USING "btree" ("overall_impact_score" DESC);



CREATE INDEX "idx_storyteller_impact_storyteller" ON "public"."storyteller_impact_metrics" USING "btree" ("storyteller_id");



CREATE INDEX "idx_storyteller_impact_trend" ON "public"."storyteller_impact_metrics" USING "btree" ("impact_trend");



CREATE INDEX "idx_storyteller_impact_velocity" ON "public"."storyteller_impact_metrics" USING "btree" ("impact_velocity" DESC);



CREATE INDEX "idx_storyteller_locations_location" ON "public"."storyteller_locations" USING "btree" ("location_id");



CREATE INDEX "idx_storyteller_locations_storyteller" ON "public"."storyteller_locations" USING "btree" ("storyteller_id");



CREATE INDEX "idx_storyteller_locations_tenant" ON "public"."storyteller_locations" USING "btree" ("tenant_id");



CREATE INDEX "idx_storyteller_media_links_primary" ON "public"."storyteller_media_links" USING "btree" ("is_primary") WHERE ("is_primary" = true);



CREATE INDEX "idx_storyteller_media_links_public" ON "public"."storyteller_media_links" USING "btree" ("is_public");



CREATE INDEX "idx_storyteller_media_links_stage" ON "public"."storyteller_media_links" USING "btree" ("video_stage");



CREATE INDEX "idx_storyteller_media_links_storyteller_id" ON "public"."storyteller_media_links" USING "btree" ("storyteller_id");



CREATE INDEX "idx_storyteller_media_links_tags" ON "public"."storyteller_media_links" USING "gin" ("tags");



CREATE INDEX "idx_storyteller_media_links_type" ON "public"."storyteller_media_links" USING "btree" ("link_type");



CREATE INDEX "idx_storyteller_milestones_achieved" ON "public"."storyteller_milestones" USING "btree" ("achieved_at" DESC) WHERE (("status")::"text" = 'achieved'::"text");



CREATE INDEX "idx_storyteller_milestones_public" ON "public"."storyteller_milestones" USING "btree" ("is_public", "featured_milestone");



CREATE INDEX "idx_storyteller_milestones_storyteller" ON "public"."storyteller_milestones" USING "btree" ("storyteller_id");



CREATE INDEX "idx_storyteller_milestones_type" ON "public"."storyteller_milestones" USING "btree" ("milestone_type");



CREATE INDEX "idx_storyteller_orgs_organization" ON "public"."storyteller_organizations" USING "btree" ("organization_id");



CREATE INDEX "idx_storyteller_orgs_storyteller" ON "public"."storyteller_organizations" USING "btree" ("storyteller_id");



CREATE INDEX "idx_storyteller_orgs_tenant" ON "public"."storyteller_organizations" USING "btree" ("tenant_id");



CREATE INDEX "idx_storyteller_projects_project" ON "public"."storyteller_projects" USING "btree" ("project_id");



CREATE INDEX "idx_storyteller_projects_storyteller" ON "public"."storyteller_projects" USING "btree" ("storyteller_id");



CREATE INDEX "idx_storyteller_projects_tenant" ON "public"."storyteller_projects" USING "btree" ("tenant_id");



CREATE INDEX "idx_storyteller_quotes_category" ON "public"."storyteller_quotes" USING "btree" ("quote_category");



CREATE INDEX "idx_storyteller_quotes_public" ON "public"."storyteller_quotes" USING "btree" ("is_public", "requires_approval");



CREATE INDEX "idx_storyteller_quotes_quotability" ON "public"."storyteller_quotes" USING "btree" ("quotability_score" DESC);



CREATE INDEX "idx_storyteller_quotes_source" ON "public"."storyteller_quotes" USING "btree" ("source_type", "source_id");



CREATE INDEX "idx_storyteller_quotes_storyteller" ON "public"."storyteller_quotes" USING "btree" ("storyteller_id");



CREATE INDEX "idx_storyteller_quotes_themes" ON "public"."storyteller_quotes" USING "gin" ("themes");



CREATE INDEX "idx_storyteller_recommendations_active" ON "public"."storyteller_recommendations" USING "btree" ("storyteller_id", "status") WHERE (("status")::"text" = 'active'::"text");



CREATE INDEX "idx_storyteller_recommendations_entity" ON "public"."storyteller_recommendations" USING "btree" ("recommended_entity_type", "recommended_entity_id");



CREATE INDEX "idx_storyteller_recommendations_priority" ON "public"."storyteller_recommendations" USING "btree" ("priority_score" DESC);



CREATE INDEX "idx_storyteller_recommendations_relevance" ON "public"."storyteller_recommendations" USING "btree" ("relevance_score" DESC);



CREATE INDEX "idx_storyteller_recommendations_status" ON "public"."storyteller_recommendations" USING "btree" ("status");



CREATE INDEX "idx_storyteller_recommendations_storyteller" ON "public"."storyteller_recommendations" USING "btree" ("storyteller_id");



CREATE INDEX "idx_storyteller_recommendations_type" ON "public"."storyteller_recommendations" USING "btree" ("recommendation_type");



CREATE INDEX "idx_storyteller_themes_frequency" ON "public"."storyteller_themes" USING "btree" ("frequency_count" DESC);



CREATE INDEX "idx_storyteller_themes_prominence" ON "public"."storyteller_themes" USING "btree" ("prominence_score" DESC);



CREATE INDEX "idx_storyteller_themes_storyteller" ON "public"."storyteller_themes" USING "btree" ("storyteller_id");



CREATE INDEX "idx_storyteller_themes_theme" ON "public"."storyteller_themes" USING "btree" ("theme_id");



CREATE INDEX "idx_sync_log_date" ON "public"."empathy_sync_log" USING "btree" ("synced_at");



CREATE INDEX "idx_sync_log_entry" ON "public"."empathy_sync_log" USING "btree" ("empathy_entry_id");



CREATE INDEX "idx_sync_log_status" ON "public"."empathy_sync_log" USING "btree" ("sync_status");



CREATE INDEX "idx_tags_confidence" ON "public"."photo_tags" USING "btree" ("confidence_score" DESC);



CREATE INDEX "idx_tags_media_asset" ON "public"."photo_tags" USING "btree" ("media_asset_id");



CREATE INDEX "idx_tags_person" ON "public"."photo_tags" USING "btree" ("person_id") WHERE ("person_id" IS NOT NULL);



CREATE INDEX "idx_tags_source" ON "public"."photo_tags" USING "btree" ("source");



CREATE INDEX "idx_tags_tenant" ON "public"."photo_tags" USING "btree" ("tenant_id");



CREATE INDEX "idx_tags_type_value" ON "public"."photo_tags" USING "btree" ("tag_type", "tag_value");



CREATE INDEX "idx_tags_verified" ON "public"."photo_tags" USING "btree" ("is_verified") WHERE ("is_verified" = true);



CREATE UNIQUE INDEX "idx_tenant_analytics_tenant_id" ON "public"."tenant_analytics" USING "btree" ("tenant_id");



CREATE INDEX "idx_tenants_created_at" ON "public"."tenants" USING "btree" ("created_at");



CREATE INDEX "idx_tenants_legacy_org_id" ON "public"."tenants" USING "btree" ("legacy_org_id");



CREATE INDEX "idx_tenants_slug" ON "public"."tenants" USING "btree" ("slug");



CREATE INDEX "idx_tenants_status" ON "public"."tenants" USING "btree" ("status");



CREATE INDEX "idx_theme_associations_entity" ON "public"."theme_associations" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_theme_concept_theme" ON "public"."theme_concept_evolution" USING "btree" ("theme_id");



CREATE INDEX "idx_theme_evolution_period" ON "public"."theme_evolution" USING "btree" ("time_period_start", "time_period_end");



CREATE INDEX "idx_theme_evolution_theme" ON "public"."theme_evolution" USING "btree" ("theme_id");



CREATE INDEX "idx_theme_evolution_tracking_category" ON "public"."theme_evolution_tracking" USING "btree" ("theme_category");



CREATE INDEX "idx_theme_evolution_tracking_tenant_id" ON "public"."theme_evolution_tracking" USING "btree" ("tenant_id");



CREATE INDEX "idx_theme_evolution_tracking_theme" ON "public"."theme_evolution_tracking" USING "btree" ("theme_name");



CREATE INDEX "idx_theme_evolution_tracking_trend" ON "public"."theme_evolution_tracking" USING "btree" ("trend_direction");



CREATE INDEX "idx_title_suggestions_story" ON "public"."title_suggestions" USING "btree" ("story_id");



CREATE INDEX "idx_toc_project" ON "public"."theory_of_change" USING "btree" ("project_id");



CREATE INDEX "idx_tour_requests_country" ON "public"."tour_requests" USING "btree" ("country");



CREATE INDEX "idx_tour_requests_created" ON "public"."tour_requests" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_tour_requests_status" ON "public"."tour_requests" USING "btree" ("status");



CREATE INDEX "idx_tour_stops_country" ON "public"."tour_stops" USING "btree" ("country");



CREATE INDEX "idx_tour_stops_dates" ON "public"."tour_stops" USING "btree" ("date_start", "date_end");



CREATE INDEX "idx_tour_stops_status" ON "public"."tour_stops" USING "btree" ("status");



CREATE INDEX "idx_transcription_jobs_media_asset_id" ON "public"."transcription_jobs" USING "btree" ("media_asset_id");



CREATE INDEX "idx_transcription_jobs_status" ON "public"."transcription_jobs" USING "btree" ("status");



CREATE INDEX "idx_transcripts_ai_confidence_score" ON "public"."transcripts" USING "btree" ("ai_confidence_score") WHERE ("ai_confidence_score" IS NOT NULL);



CREATE INDEX "idx_transcripts_ai_model_version" ON "public"."transcripts" USING "btree" ("ai_model_version") WHERE ("ai_model_version" IS NOT NULL);



CREATE INDEX "idx_transcripts_ai_processing_date" ON "public"."transcripts" USING "btree" ("ai_processing_date") WHERE ("ai_processing_date" IS NOT NULL);



CREATE INDEX "idx_transcripts_ai_status" ON "public"."transcripts" USING "btree" ("ai_processing_status");



CREATE INDEX "idx_transcripts_language" ON "public"."transcripts" USING "btree" ("language");



CREATE INDEX "idx_transcripts_legacy_story" ON "public"."transcripts" USING "btree" ("legacy_story_id");



CREATE INDEX "idx_transcripts_media_asset_id" ON "public"."transcripts" USING "btree" ("media_asset_id");



CREATE INDEX "idx_transcripts_privacy_level" ON "public"."transcripts" USING "btree" ("privacy_level");



CREATE INDEX "idx_transcripts_processing" ON "public"."transcripts" USING "btree" ("processing_status", "ai_processing_consent");



CREATE INDEX "idx_transcripts_quality" ON "public"."transcripts" USING "btree" ("transcript_quality", "word_count");



CREATE INDEX "idx_transcripts_search" ON "public"."transcripts" USING "gin" ("search_vector");



CREATE INDEX "idx_transcripts_source_platform" ON "public"."transcripts" USING "btree" ("source_video_platform");



CREATE INDEX "idx_transcripts_source_video" ON "public"."transcripts" USING "btree" ("source_video_url") WHERE ("source_video_url" IS NOT NULL);



CREATE INDEX "idx_transcripts_status" ON "public"."transcripts" USING "btree" ("status");



CREATE INDEX "idx_transcripts_story_id" ON "public"."transcripts" USING "btree" ("story_id");



CREATE INDEX "idx_transcripts_storyteller" ON "public"."transcripts" USING "btree" ("storyteller_id", "created_at");



CREATE INDEX "idx_transcripts_tenant" ON "public"."transcripts" USING "btree" ("tenant_id");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_is_active" ON "public"."users" USING "btree" ("is_active");



CREATE INDEX "idx_users_project_id" ON "public"."users" USING "btree" ("project_id");



CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role");



CREATE INDEX "idx_videos_published_at" ON "public"."videos" USING "btree" ("published_at" DESC);



CREATE INDEX "idx_videos_service_area" ON "public"."videos" USING "btree" ("service_area");



CREATE INDEX "idx_videos_source_blog" ON "public"."videos" USING "btree" ("source_blog_post_id");



CREATE INDEX "idx_videos_status" ON "public"."videos" USING "btree" ("status");



CREATE INDEX "idx_videos_tags" ON "public"."videos" USING "gin" ("tags");



CREATE INDEX "idx_videos_video_type" ON "public"."videos" USING "btree" ("video_type");



CREATE INDEX "idx_webhook_delivery_pending" ON "public"."webhook_delivery_log" USING "btree" ("next_retry_at") WHERE (("success" = false) AND ("next_retry_at" IS NOT NULL));



CREATE INDEX "idx_webhook_delivery_subscription" ON "public"."webhook_delivery_log" USING "btree" ("subscription_id");



CREATE INDEX "idx_webhook_subscriptions_active" ON "public"."webhook_subscriptions" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_webhook_subscriptions_app_id" ON "public"."webhook_subscriptions" USING "btree" ("app_id");



CREATE INDEX "members_active_idx" ON "public"."organization_members" USING "btree" ("is_active");



CREATE INDEX "members_org_id_idx" ON "public"."organization_members" USING "btree" ("organization_id");



CREATE INDEX "members_profile_id_idx" ON "public"."organization_members" USING "btree" ("profile_id");



CREATE INDEX "members_role_idx" ON "public"."organization_members" USING "btree" ("role");



CREATE INDEX "organizations_location_idx" ON "public"."organizations" USING "btree" ("location");



CREATE INDEX "organizations_type_idx" ON "public"."organizations" USING "btree" ("type");



CREATE INDEX "profiles_location_idx" ON "public"."profiles" USING "btree" ("location");



CREATE INDEX "profiles_storyteller_type_idx" ON "public"."profiles" USING "btree" ("storyteller_type");



CREATE INDEX "profiles_user_id_idx" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "report_sections_order_idx" ON "public"."report_sections" USING "btree" ("report_id", "display_order");



CREATE INDEX "report_sections_report_id_idx" ON "public"."report_sections" USING "btree" ("report_id");



CREATE INDEX "report_stories_report_id_idx" ON "public"."annual_report_stories" USING "btree" ("report_id");



CREATE INDEX "report_stories_story_id_idx" ON "public"."annual_report_stories" USING "btree" ("story_id");



CREATE INDEX "reports_org_id_idx" ON "public"."annual_reports" USING "btree" ("organization_id");



CREATE INDEX "reports_published_idx" ON "public"."annual_reports" USING "btree" ("published_date");



CREATE INDEX "reports_status_idx" ON "public"."annual_reports" USING "btree" ("status");



CREATE INDEX "reports_year_idx" ON "public"."annual_reports" USING "btree" ("report_year");



CREATE INDEX "services_active_idx" ON "public"."organization_services" USING "btree" ("is_active");



CREATE INDEX "services_category_idx" ON "public"."organization_services" USING "btree" ("service_category");



CREATE INDEX "services_org_id_idx" ON "public"."organization_services" USING "btree" ("organization_id");



CREATE INDEX "story_images_order_idx" ON "public"."story_images" USING "btree" ("story_id", "display_order");



CREATE INDEX "story_images_photographer_idx" ON "public"."story_images" USING "btree" ("photographer_id");



CREATE INDEX "story_images_story_id_idx" ON "public"."story_images" USING "btree" ("story_id");



CREATE INDEX "story_media_display_order_idx" ON "public"."story_media" USING "btree" ("display_order");



CREATE INDEX "story_media_is_public_idx" ON "public"."story_media" USING "btree" ("is_public");



CREATE INDEX "story_media_media_type_idx" ON "public"."story_media" USING "btree" ("media_type");



CREATE INDEX "story_media_story_id_idx" ON "public"."story_media" USING "btree" ("story_id");



ALTER INDEX "public"."idx_events_created_at" ATTACH PARTITION "public"."events_2024_01_created_at_idx";



ALTER INDEX "public"."idx_events_type" ATTACH PARTITION "public"."events_2024_01_event_type_created_at_idx";



ALTER INDEX "public"."idx_events_event_type" ATTACH PARTITION "public"."events_2024_01_event_type_idx";



ALTER INDEX "public"."events_pkey" ATTACH PARTITION "public"."events_2024_01_pkey";



ALTER INDEX "public"."idx_events_resource" ATTACH PARTITION "public"."events_2024_01_resource_type_resource_id_idx";



ALTER INDEX "public"."idx_events_tenant_id" ATTACH PARTITION "public"."events_2024_01_tenant_id_created_at_idx";



ALTER INDEX "public"."idx_events_tenant_type_date" ATTACH PARTITION "public"."events_2024_01_tenant_id_event_type_created_at_idx";



ALTER INDEX "public"."idx_events_tenant_user" ATTACH PARTITION "public"."events_2024_01_tenant_id_user_id_idx";



ALTER INDEX "public"."idx_events_created_at" ATTACH PARTITION "public"."events_2025_08_created_at_idx";



ALTER INDEX "public"."idx_events_type" ATTACH PARTITION "public"."events_2025_08_event_type_created_at_idx";



ALTER INDEX "public"."idx_events_event_type" ATTACH PARTITION "public"."events_2025_08_event_type_idx";



ALTER INDEX "public"."events_pkey" ATTACH PARTITION "public"."events_2025_08_pkey";



ALTER INDEX "public"."idx_events_resource" ATTACH PARTITION "public"."events_2025_08_resource_type_resource_id_idx";



ALTER INDEX "public"."idx_events_tenant_id" ATTACH PARTITION "public"."events_2025_08_tenant_id_created_at_idx";



ALTER INDEX "public"."idx_events_tenant_type_date" ATTACH PARTITION "public"."events_2025_08_tenant_id_event_type_created_at_idx";



ALTER INDEX "public"."idx_events_tenant_user" ATTACH PARTITION "public"."events_2025_08_tenant_id_user_id_idx";



ALTER INDEX "public"."idx_events_created_at" ATTACH PARTITION "public"."events_2025_09_created_at_idx";



ALTER INDEX "public"."idx_events_type" ATTACH PARTITION "public"."events_2025_09_event_type_created_at_idx";



ALTER INDEX "public"."idx_events_event_type" ATTACH PARTITION "public"."events_2025_09_event_type_idx";



ALTER INDEX "public"."events_pkey" ATTACH PARTITION "public"."events_2025_09_pkey";



ALTER INDEX "public"."idx_events_resource" ATTACH PARTITION "public"."events_2025_09_resource_type_resource_id_idx";



ALTER INDEX "public"."idx_events_tenant_id" ATTACH PARTITION "public"."events_2025_09_tenant_id_created_at_idx";



ALTER INDEX "public"."idx_events_tenant_type_date" ATTACH PARTITION "public"."events_2025_09_tenant_id_event_type_created_at_idx";



ALTER INDEX "public"."idx_events_tenant_user" ATTACH PARTITION "public"."events_2025_09_tenant_id_user_id_idx";



CREATE OR REPLACE VIEW "public"."organization_overview" AS
 SELECT "o"."id",
    "o"."tenant_id",
    "o"."name",
    "o"."description",
    "o"."type",
    "o"."location",
    "o"."website_url",
    "o"."contact_email",
    "o"."logo_url",
    "o"."cultural_protocols",
    "o"."cultural_significance",
    "o"."created_at",
    "o"."updated_at",
    "o"."slug",
    "o"."subscription_tier",
    "o"."subscription_status",
    "o"."domain",
    "o"."settings",
    "o"."onboarded_at",
    "o"."location_id",
    "o"."legal_name",
    "o"."short_name",
    "o"."primary_color",
    "o"."secondary_color",
    "o"."tagline",
    "o"."mission_statement",
    "o"."traditional_country",
    "o"."language_groups",
    "o"."service_locations",
    "o"."coordinates",
    "o"."website",
    "o"."email",
    "o"."phone",
    "o"."postal_address",
    "o"."physical_address",
    "o"."established_date",
    "o"."abn",
    "o"."indigenous_controlled",
    "o"."governance_model",
    "o"."empathy_ledger_enabled",
    "o"."annual_reports_enabled",
    "o"."impact_tracking_enabled",
    "o"."has_cultural_protocols",
    "o"."elder_approval_required",
    "o"."cultural_advisor_ids",
    "o"."default_story_access_level",
    "o"."require_story_approval",
    "o"."created_by",
    "o"."metadata",
    "count"(DISTINCT "om"."id") AS "member_count",
    "count"(DISTINCT "os"."id") AS "service_count",
    "count"(DISTINCT "s"."id") AS "story_count",
    "count"(DISTINCT "ar"."id") AS "report_count"
   FROM (((("public"."organizations" "o"
     LEFT JOIN "public"."organization_members" "om" ON ((("o"."id" = "om"."organization_id") AND ("om"."is_active" = true))))
     LEFT JOIN "public"."organization_services" "os" ON ((("o"."id" = "os"."organization_id") AND ("os"."is_active" = true))))
     LEFT JOIN "public"."stories" "s" ON (("o"."id" = "s"."organization_id")))
     LEFT JOIN "public"."annual_reports" "ar" ON (("o"."id" = "ar"."organization_id")))
  GROUP BY "o"."id";



CREATE OR REPLACE VIEW "public"."annual_reports_with_stats" AS
 SELECT "ar"."id",
    "ar"."organization_id",
    "ar"."report_year",
    "ar"."reporting_period_start",
    "ar"."reporting_period_end",
    "ar"."title",
    "ar"."subtitle",
    "ar"."theme",
    "ar"."status",
    "ar"."template_name",
    "ar"."cover_image_url",
    "ar"."featured_story_ids",
    "ar"."auto_include_criteria",
    "ar"."exclude_story_ids",
    "ar"."sections_config",
    "ar"."executive_summary",
    "ar"."leadership_message",
    "ar"."leadership_message_author",
    "ar"."year_highlights",
    "ar"."looking_forward",
    "ar"."acknowledgments",
    "ar"."statistics",
    "ar"."elder_approval_required",
    "ar"."elder_approvals",
    "ar"."elder_approval_date",
    "ar"."cultural_advisor_review",
    "ar"."cultural_notes",
    "ar"."auto_generated",
    "ar"."generation_date",
    "ar"."generated_by",
    "ar"."published_date",
    "ar"."published_by",
    "ar"."pdf_url",
    "ar"."web_version_url",
    "ar"."distribution_list",
    "ar"."distribution_date",
    "ar"."views",
    "ar"."downloads",
    "ar"."created_at",
    "ar"."updated_at",
    "ar"."created_by",
    "ar"."metadata",
    "o"."name" AS "organization_name",
    "o"."logo_url" AS "organization_logo",
    "count"(DISTINCT "ars"."story_id") AS "story_count",
    "count"(DISTINCT "rf"."id") AS "feedback_count",
    "avg"("rf"."rating") AS "average_rating"
   FROM ((("public"."annual_reports" "ar"
     JOIN "public"."organizations" "o" ON (("ar"."organization_id" = "o"."id")))
     LEFT JOIN "public"."annual_report_stories" "ars" ON (("ar"."id" = "ars"."report_id")))
     LEFT JOIN "public"."report_feedback" "rf" ON (("ar"."id" = "rf"."report_id")))
  GROUP BY "ar"."id", "o"."name", "o"."logo_url";



CREATE OR REPLACE TRIGGER "blog_posts_updated_at" BEFORE UPDATE ON "public"."blog_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_blog_posts_updated_at"();



CREATE OR REPLACE TRIGGER "dream_organizations_updated_at" BEFORE UPDATE ON "public"."dream_organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_tour_updated_at"();



CREATE OR REPLACE TRIGGER "elder_review_assignment_notification" AFTER INSERT OR UPDATE ON "public"."elder_review_queue" FOR EACH ROW EXECUTE FUNCTION "public"."notify_elder_review_assigned"();



CREATE OR REPLACE TRIGGER "increment_template_usage_on_report" AFTER INSERT ON "public"."annual_reports" FOR EACH ROW EXECUTE FUNCTION "public"."increment_template_usage"();



CREATE OR REPLACE TRIGGER "invitation_updated_at" BEFORE UPDATE ON "public"."story_review_invitations" FOR EACH ROW EXECUTE FUNCTION "public"."update_invitation_updated_at"();



CREATE OR REPLACE TRIGGER "organization_contexts_updated_at" BEFORE UPDATE ON "public"."organization_contexts" FOR EACH ROW EXECUTE FUNCTION "public"."update_organization_contexts_updated_at"();



CREATE OR REPLACE TRIGGER "project_contexts_updated_at" BEFORE UPDATE ON "public"."project_contexts" FOR EACH ROW EXECUTE FUNCTION "public"."update_project_contexts_updated_at"();



CREATE OR REPLACE TRIGGER "tour_requests_updated_at" BEFORE UPDATE ON "public"."tour_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_tour_updated_at"();



CREATE OR REPLACE TRIGGER "tour_stops_updated_at" BEFORE UPDATE ON "public"."tour_stops" FOR EACH ROW EXECUTE FUNCTION "public"."update_tour_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_auto_generate_video_metadata" BEFORE INSERT OR UPDATE ON "public"."videos" FOR EACH ROW EXECUTE FUNCTION "public"."auto_generate_video_metadata"();



CREATE OR REPLACE TRIGGER "trigger_create_dashboard_config" AFTER UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."create_default_dashboard_config_trigger"();



CREATE OR REPLACE TRIGGER "trigger_cultural_protocols_updated_at" BEFORE UPDATE ON "public"."cultural_protocols" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_ensure_single_primary_media_link" BEFORE INSERT OR UPDATE ON "public"."storyteller_media_links" FOR EACH ROW EXECUTE FUNCTION "public"."ensure_single_primary_media_link"();



CREATE OR REPLACE TRIGGER "trigger_handle_request_approval" BEFORE UPDATE ON "public"."story_syndication_requests" FOR EACH ROW EXECUTE FUNCTION "public"."handle_request_approval"();



CREATE OR REPLACE TRIGGER "trigger_media_assets_updated_at" BEFORE UPDATE ON "public"."media_assets" FOR EACH ROW EXECUTE FUNCTION "public"."update_media_assets_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_organization_role_change" BEFORE UPDATE ON "public"."organization_roles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_organization_role_change"();



CREATE OR REPLACE TRIGGER "trigger_photo_galleries_updated_at" BEFORE UPDATE ON "public"."photo_galleries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_photo_locations_updated_at" BEFORE UPDATE ON "public"."photo_locations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_photo_memories_updated_at" BEFORE UPDATE ON "public"."photo_memories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_photo_organizations_updated_at" BEFORE UPDATE ON "public"."photo_organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_photo_projects_updated_at" BEFORE UPDATE ON "public"."photo_projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_photo_storytellers_updated_at" BEFORE UPDATE ON "public"."photo_storytellers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_photo_tags_updated_at" BEFORE UPDATE ON "public"."photo_tags" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_quotes_updated_at" BEFORE UPDATE ON "public"."quotes" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_revoke_tokens_on_withdrawal" AFTER UPDATE OF "status" ON "public"."stories" FOR EACH ROW EXECUTE FUNCTION "public"."revoke_tokens_on_story_withdrawal"();



CREATE OR REPLACE TRIGGER "trigger_stories_search_vector" BEFORE INSERT OR UPDATE ON "public"."stories" FOR EACH ROW EXECUTE FUNCTION "public"."update_story_search_vector"();



CREATE OR REPLACE TRIGGER "trigger_stories_updated_at" BEFORE UPDATE ON "public"."stories" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_tenants_updated_at" BEFORE UPDATE ON "public"."tenants" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_transcripts_search_vector" BEFORE INSERT OR UPDATE ON "public"."transcripts" FOR EACH ROW EXECUTE FUNCTION "public"."update_transcript_search_vector"();



CREATE OR REPLACE TRIGGER "trigger_transcripts_updated_at" BEFORE UPDATE ON "public"."transcripts" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_ai_usage_daily" AFTER INSERT ON "public"."ai_usage_events" FOR EACH ROW EXECUTE FUNCTION "public"."update_ai_usage_daily"();



CREATE OR REPLACE TRIGGER "trigger_update_gallery_photo_count" AFTER INSERT OR DELETE ON "public"."photo_gallery_items" FOR EACH ROW EXECUTE FUNCTION "public"."update_gallery_photo_count"();



CREATE OR REPLACE TRIGGER "trigger_update_media_link_timestamp" BEFORE UPDATE ON "public"."storyteller_media_links" FOR EACH ROW EXECUTE FUNCTION "public"."update_media_link_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_update_project_stories_count" AFTER INSERT OR DELETE OR UPDATE ON "public"."story_syndication_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_project_stories_count"();



CREATE OR REPLACE TRIGGER "trigger_update_tenant_ai_usage" AFTER INSERT ON "public"."ai_usage_events" FOR EACH ROW WHEN ((("new"."status" = 'completed'::"text") AND ("new"."tenant_id" IS NOT NULL))) EXECUTE FUNCTION "public"."update_tenant_ai_usage"();



CREATE OR REPLACE TRIGGER "trigger_validate_archive_consent" BEFORE UPDATE OF "permission_tier", "status" ON "public"."stories" FOR EACH ROW EXECUTE FUNCTION "public"."validate_archive_consent"();



CREATE OR REPLACE TRIGGER "update_act_admins_updated_at" BEFORE UPDATE ON "public"."act_admin_permissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_act_projects_updated_at" BEFORE UPDATE ON "public"."act_projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_activities_updated_at" BEFORE UPDATE ON "public"."activities" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_approval_queue_updated_at" BEFORE UPDATE ON "public"."content_approval_queue" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_deletion_requests_updated_at" BEFORE UPDATE ON "public"."deletion_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_elder_review_queue_timestamp" BEFORE UPDATE ON "public"."elder_review_queue" FOR EACH ROW EXECUTE FUNCTION "public"."update_cultural_safety_timestamp"();



CREATE OR REPLACE TRIGGER "update_embed_tokens_updated_at" BEFORE UPDATE ON "public"."embed_tokens" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_empathy_entries_updated_at" BEFORE UPDATE ON "public"."empathy_entries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_external_applications_updated_at" BEFORE UPDATE ON "public"."external_applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_feature_requests_updated_at" BEFORE UPDATE ON "public"."act_feature_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_media_assets_updated_at" BEFORE UPDATE ON "public"."media_assets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_media_files_updated_at" BEFORE UPDATE ON "public"."media_files" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_media_usage_tracking_updated_at" BEFORE UPDATE ON "public"."media_usage_tracking" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_org_analytics_timestamp" BEFORE UPDATE ON "public"."organization_analytics" FOR EACH ROW EXECUTE FUNCTION "public"."update_analytics_timestamp"();



CREATE OR REPLACE TRIGGER "update_org_metrics_on_transcript_analysis" AFTER UPDATE ON "public"."transcripts" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_org_metrics"();



COMMENT ON TRIGGER "update_org_metrics_on_transcript_analysis" ON "public"."transcripts" IS 'Automatically update organization impact metrics when transcripts are analyzed';



CREATE OR REPLACE TRIGGER "update_organizations_updated_at" BEFORE UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_outcomes_updated_at" BEFORE UPDATE ON "public"."outcomes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profile_organizations_updated_at" BEFORE UPDATE ON "public"."profile_organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_proj_analytics_timestamp" BEFORE UPDATE ON "public"."project_analytics" FOR EACH ROW EXECUTE FUNCTION "public"."update_analytics_timestamp"();



CREATE OR REPLACE TRIGGER "update_project_analyses_updated_at" BEFORE UPDATE ON "public"."project_analyses" FOR EACH ROW EXECUTE FUNCTION "public"."update_project_analyses_updated_at"();



CREATE OR REPLACE TRIGGER "update_project_profiles_updated_at" BEFORE UPDATE ON "public"."project_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_project_profiles_updated_at"();



CREATE OR REPLACE TRIGGER "update_project_seed_interviews_updated_at" BEFORE UPDATE ON "public"."project_seed_interviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_project_seed_interviews_updated_at"();



CREATE OR REPLACE TRIGGER "update_quality_on_enrichment" AFTER INSERT OR UPDATE ON "public"."organization_enrichment" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_quality_metrics"();



CREATE OR REPLACE TRIGGER "update_quality_on_services" AFTER INSERT OR UPDATE ON "public"."scraped_services" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_quality_metrics"();



CREATE OR REPLACE TRIGGER "update_reports_updated_at" BEFORE UPDATE ON "public"."annual_reports" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_service_count_on_story" AFTER INSERT ON "public"."stories" FOR EACH ROW EXECUTE FUNCTION "public"."update_service_story_count"();



CREATE OR REPLACE TRIGGER "update_service_impact_updated_at" BEFORE UPDATE ON "public"."service_impact" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_services_updated_at" BEFORE UPDATE ON "public"."organization_services" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_story_distributions_updated_at" BEFORE UPDATE ON "public"."story_distributions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_story_media_updated_at_trigger" BEFORE UPDATE ON "public"."story_media" FOR EACH ROW EXECUTE FUNCTION "public"."update_story_media_updated_at"();



CREATE OR REPLACE TRIGGER "update_story_syndication_consent_updated_at" BEFORE UPDATE ON "public"."story_syndication_consent" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_story_tags_updated_at" BEFORE UPDATE ON "public"."story_project_tags" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_storyteller_features_updated_at" BEFORE UPDATE ON "public"."storyteller_project_features" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_transcription_jobs_updated_at" BEFORE UPDATE ON "public"."transcription_jobs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_transcripts_updated_at" BEFORE UPDATE ON "public"."transcripts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_videos_updated_at" BEFORE UPDATE ON "public"."videos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "webhook_failure_check" BEFORE UPDATE ON "public"."webhook_subscriptions" FOR EACH ROW WHEN (("new"."consecutive_failures" > "old"."consecutive_failures")) EXECUTE FUNCTION "public"."check_webhook_failures"();



CREATE OR REPLACE TRIGGER "webhook_subscription_updated" BEFORE UPDATE ON "public"."webhook_subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_webhook_subscription_timestamp"();



ALTER TABLE ONLY "public"."act_admin_permissions"
    ADD CONSTRAINT "act_admin_permissions_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."act_admin_permissions"
    ADD CONSTRAINT "act_admin_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."act_admins"
    ADD CONSTRAINT "act_admins_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."act_admins"
    ADD CONSTRAINT "act_admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."act_feature_requests"
    ADD CONSTRAINT "act_feature_requests_act_project_id_fkey" FOREIGN KEY ("act_project_id") REFERENCES "public"."act_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."act_feature_requests"
    ADD CONSTRAINT "act_feature_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."act_feature_requests"
    ADD CONSTRAINT "act_feature_requests_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id");



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_attention_resolved_by_fkey" FOREIGN KEY ("attention_resolved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_messages"
    ADD CONSTRAINT "admin_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_messages"
    ADD CONSTRAINT "admin_messages_target_organization_id_fkey" FOREIGN KEY ("target_organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."ai_analysis_jobs"
    ADD CONSTRAINT "ai_analysis_jobs_triggered_by_fkey" FOREIGN KEY ("triggered_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ai_moderation_logs"
    ADD CONSTRAINT "ai_moderation_logs_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ai_moderation_logs"
    ADD CONSTRAINT "ai_moderation_logs_elder_id_fkey" FOREIGN KEY ("elder_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."ai_processing_logs"
    ADD CONSTRAINT "ai_processing_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."ai_safety_logs"
    ADD CONSTRAINT "ai_safety_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ai_usage_daily"
    ADD CONSTRAINT "ai_usage_daily_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_usage_daily"
    ADD CONSTRAINT "ai_usage_daily_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_usage_events"
    ADD CONSTRAINT "ai_usage_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_usage_events"
    ADD CONSTRAINT "ai_usage_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_usage_events"
    ADD CONSTRAINT "ai_usage_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."analysis_jobs"
    ADD CONSTRAINT "analysis_jobs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analytics_processing_jobs"
    ADD CONSTRAINT "analytics_processing_jobs_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."annual_report_stories"
    ADD CONSTRAINT "annual_report_stories_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."annual_report_stories"
    ADD CONSTRAINT "annual_report_stories_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."annual_reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."annual_report_stories"
    ADD CONSTRAINT "annual_report_stories_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."annual_reports"
    ADD CONSTRAINT "annual_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."annual_reports"
    ADD CONSTRAINT "annual_reports_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."annual_reports"
    ADD CONSTRAINT "annual_reports_leadership_message_author_fkey" FOREIGN KEY ("leadership_message_author") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."annual_reports"
    ADD CONSTRAINT "annual_reports_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."annual_reports"
    ADD CONSTRAINT "annual_reports_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."audio_emotion_analysis"
    ADD CONSTRAINT "audio_emotion_analysis_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audio_prosodic_analysis"
    ADD CONSTRAINT "audio_prosodic_analysis_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."community_interpretation_sessions"
    ADD CONSTRAINT "community_interpretation_sessions_facilitator_id_fkey" FOREIGN KEY ("facilitator_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."community_interpretation_sessions"
    ADD CONSTRAINT "community_interpretation_sessions_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id");



ALTER TABLE ONLY "public"."community_interpretation_sessions"
    ADD CONSTRAINT "community_interpretation_sessions_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id");



ALTER TABLE ONLY "public"."community_story_responses"
    ADD CONSTRAINT "community_story_responses_responder_id_fkey" FOREIGN KEY ("responder_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."community_story_responses"
    ADD CONSTRAINT "community_story_responses_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consent_change_log"
    ADD CONSTRAINT "consent_change_log_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."external_applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consent_change_log"
    ADD CONSTRAINT "consent_change_log_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."consent_change_log"
    ADD CONSTRAINT "consent_change_log_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consent_change_log"
    ADD CONSTRAINT "consent_change_log_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."content_approval_queue"
    ADD CONSTRAINT "content_approval_queue_empathy_entry_id_fkey" FOREIGN KEY ("empathy_entry_id") REFERENCES "public"."empathy_entries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cultural_protocols"
    ADD CONSTRAINT "cultural_protocols_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."cultural_protocols"
    ADD CONSTRAINT "cultural_protocols_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."cultural_protocols"
    ADD CONSTRAINT "cultural_protocols_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cultural_speech_patterns"
    ADD CONSTRAINT "cultural_speech_patterns_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."data_quality_metrics"
    ADD CONSTRAINT "data_quality_metrics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."deletion_requests"
    ADD CONSTRAINT "deletion_requests_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."deletion_requests"
    ADD CONSTRAINT "deletion_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."development_plans"
    ADD CONSTRAINT "development_plans_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_outcomes"
    ADD CONSTRAINT "document_outcomes_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."transcripts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."document_outcomes"
    ADD CONSTRAINT "document_outcomes_outcome_id_fkey" FOREIGN KEY ("outcome_id") REFERENCES "public"."outcomes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."elder_review_queue"
    ADD CONSTRAINT "elder_review_queue_assigned_elder_id_fkey" FOREIGN KEY ("assigned_elder_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."elder_review_queue"
    ADD CONSTRAINT "elder_review_queue_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."embed_tokens"
    ADD CONSTRAINT "embed_tokens_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."embed_tokens"
    ADD CONSTRAINT "embed_tokens_distribution_id_fkey" FOREIGN KEY ("distribution_id") REFERENCES "public"."story_distributions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."embed_tokens"
    ADD CONSTRAINT "embed_tokens_revoked_by_fkey" FOREIGN KEY ("revoked_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."embed_tokens"
    ADD CONSTRAINT "embed_tokens_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."empathy_sync_log"
    ADD CONSTRAINT "empathy_sync_log_empathy_entry_id_fkey" FOREIGN KEY ("empathy_entry_id") REFERENCES "public"."empathy_entries"("id");



ALTER TABLE "public"."events"
    ADD CONSTRAINT "events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE "public"."events"
    ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."extracted_quotes"
    ADD CONSTRAINT "extracted_quotes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."extracted_quotes"
    ADD CONSTRAINT "extracted_quotes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."extracted_quotes"
    ADD CONSTRAINT "extracted_quotes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id");



ALTER TABLE ONLY "public"."photo_gallery_items"
    ADD CONSTRAINT "fk_gallery_items_media_asset" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_roles"
    ADD CONSTRAINT "fk_organization_roles_granted_by" FOREIGN KEY ("granted_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organization_roles"
    ADD CONSTRAINT "fk_organization_roles_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_roles"
    ADD CONSTRAINT "fk_organization_roles_profile" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_faces"
    ADD CONSTRAINT "fk_photo_faces_media_asset" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_galleries"
    ADD CONSTRAINT "fk_photo_galleries_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."photo_galleries"
    ADD CONSTRAINT "fk_photo_galleries_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."photo_locations"
    ADD CONSTRAINT "fk_photo_locations_media_asset" FOREIGN KEY ("photo_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_organizations"
    ADD CONSTRAINT "fk_photo_organizations_media_asset" FOREIGN KEY ("photo_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_projects"
    ADD CONSTRAINT "fk_photo_projects_media_asset" FOREIGN KEY ("photo_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_storytellers"
    ADD CONSTRAINT "fk_photo_storytellers_media_asset" FOREIGN KEY ("photo_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_tags"
    ADD CONSTRAINT "fk_photo_tags_media_asset" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_tags"
    ADD CONSTRAINT "fk_photo_tags_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."photo_tags"
    ADD CONSTRAINT "fk_photo_tags_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."gallery_media"
    ADD CONSTRAINT "gallery_media_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gallery_photos"
    ADD CONSTRAINT "gallery_photos_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gallery_photos"
    ADD CONSTRAINT "gallery_photos_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."geographic_impact_patterns"
    ADD CONSTRAINT "geographic_impact_patterns_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."harvested_outcomes"
    ADD CONSTRAINT "harvested_outcomes_harvested_by_fkey" FOREIGN KEY ("harvested_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."harvested_outcomes"
    ADD CONSTRAINT "harvested_outcomes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."harvested_outcomes"
    ADD CONSTRAINT "harvested_outcomes_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id");



ALTER TABLE ONLY "public"."harvested_outcomes"
    ADD CONSTRAINT "harvested_outcomes_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."impact_stories"
    ADD CONSTRAINT "impact_stories_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_consent_granted_by_fkey" FOREIGN KEY ("consent_granted_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."media_import_sessions"
    ADD CONSTRAINT "media_import_sessions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."media_import_sessions"
    ADD CONSTRAINT "media_import_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."media_usage_tracking"
    ADD CONSTRAINT "media_usage_tracking_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."media_usage_tracking"
    ADD CONSTRAINT "media_usage_tracking_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."message_recipients"
    ADD CONSTRAINT "message_recipients_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."admin_messages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."message_recipients"
    ADD CONSTRAINT "message_recipients_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moderation_appeals"
    ADD CONSTRAINT "moderation_appeals_moderation_request_id_fkey" FOREIGN KEY ("moderation_request_id") REFERENCES "public"."moderation_results"("id");



ALTER TABLE ONLY "public"."moderation_appeals"
    ADD CONSTRAINT "moderation_appeals_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."moderation_appeals"
    ADD CONSTRAINT "moderation_appeals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."opportunity_recommendations"
    ADD CONSTRAINT "opportunity_recommendations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_analytics"
    ADD CONSTRAINT "organization_analytics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_contexts"
    ADD CONSTRAINT "organization_contexts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."organization_contexts"
    ADD CONSTRAINT "organization_contexts_last_updated_by_fkey" FOREIGN KEY ("last_updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."organization_contexts"
    ADD CONSTRAINT "organization_contexts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_cross_transcript_insights"
    ADD CONSTRAINT "organization_cross_transcript_insights_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_cross_transcript_insights"
    ADD CONSTRAINT "organization_cross_transcript_insights_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_duplicates"
    ADD CONSTRAINT "organization_duplicates_duplicate_organization_id_fkey" FOREIGN KEY ("duplicate_organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."organization_duplicates"
    ADD CONSTRAINT "organization_duplicates_primary_organization_id_fkey" FOREIGN KEY ("primary_organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."organization_enrichment"
    ADD CONSTRAINT "organization_enrichment_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_impact_metrics"
    ADD CONSTRAINT "organization_impact_metrics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_impact_metrics"
    ADD CONSTRAINT "organization_impact_metrics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."organization_services"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organization_services"
    ADD CONSTRAINT "organization_services_manager_profile_id_fkey" FOREIGN KEY ("manager_profile_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."organization_services"
    ADD CONSTRAINT "organization_services_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_storyteller_network"
    ADD CONSTRAINT "organization_storyteller_network_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_storyteller_network"
    ADD CONSTRAINT "organization_storyteller_network_storyteller_a_id_fkey" FOREIGN KEY ("storyteller_a_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_storyteller_network"
    ADD CONSTRAINT "organization_storyteller_network_storyteller_b_id_fkey" FOREIGN KEY ("storyteller_b_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_storyteller_network"
    ADD CONSTRAINT "organization_storyteller_network_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_theme_analytics"
    ADD CONSTRAINT "organization_theme_analytics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_theme_analytics"
    ADD CONSTRAINT "organization_theme_analytics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."outcomes"
    ADD CONSTRAINT "outcomes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id");



ALTER TABLE ONLY "public"."partner_analytics_daily"
    ADD CONSTRAINT "partner_analytics_daily_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."external_applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."partner_analytics_daily"
    ADD CONSTRAINT "partner_analytics_daily_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."partner_projects"("id");



ALTER TABLE ONLY "public"."partner_messages"
    ADD CONSTRAINT "partner_messages_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."external_applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."partner_messages"
    ADD CONSTRAINT "partner_messages_parent_message_id_fkey" FOREIGN KEY ("parent_message_id") REFERENCES "public"."partner_messages"("id");



ALTER TABLE ONLY "public"."partner_messages"
    ADD CONSTRAINT "partner_messages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."partner_projects"("id");



ALTER TABLE ONLY "public"."partner_messages"
    ADD CONSTRAINT "partner_messages_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."story_syndication_requests"("id");



ALTER TABLE ONLY "public"."partner_messages"
    ADD CONSTRAINT "partner_messages_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."partner_messages"
    ADD CONSTRAINT "partner_messages_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id");



ALTER TABLE ONLY "public"."partner_messages"
    ADD CONSTRAINT "partner_messages_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."partner_projects"
    ADD CONSTRAINT "partner_projects_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."external_applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."partner_team_members"
    ADD CONSTRAINT "partner_team_members_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."external_applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."partner_team_members"
    ADD CONSTRAINT "partner_team_members_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."partner_team_members"
    ADD CONSTRAINT "partner_team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."personal_insights"
    ADD CONSTRAINT "personal_insights_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_analytics"
    ADD CONSTRAINT "photo_analytics_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "public"."photo_galleries"("id");



ALTER TABLE ONLY "public"."photo_analytics"
    ADD CONSTRAINT "photo_analytics_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."photo_faces"
    ADD CONSTRAINT "photo_faces_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."photo_faces"
    ADD CONSTRAINT "photo_faces_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."photo_faces"
    ADD CONSTRAINT "photo_faces_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."photo_faces"
    ADD CONSTRAINT "photo_faces_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."photo_galleries"
    ADD CONSTRAINT "photo_galleries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."photo_galleries"
    ADD CONSTRAINT "photo_galleries_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_galleries"
    ADD CONSTRAINT "photo_galleries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."photo_gallery_items"
    ADD CONSTRAINT "photo_gallery_items_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."photo_gallery_items"
    ADD CONSTRAINT "photo_gallery_items_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "public"."photo_galleries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_locations"
    ADD CONSTRAINT "photo_locations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."photo_memories"
    ADD CONSTRAINT "photo_memories_for_user_id_fkey" FOREIGN KEY ("for_user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."photo_memories"
    ADD CONSTRAINT "photo_memories_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "public"."photo_galleries"("id");



ALTER TABLE ONLY "public"."photo_memories"
    ADD CONSTRAINT "photo_memories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."photo_organizations"
    ADD CONSTRAINT "photo_organizations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."photo_organizations"
    ADD CONSTRAINT "photo_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_projects"
    ADD CONSTRAINT "photo_projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."photo_projects"
    ADD CONSTRAINT "photo_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_storytellers"
    ADD CONSTRAINT "photo_storytellers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."photo_storytellers"
    ADD CONSTRAINT "photo_storytellers_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photo_tags"
    ADD CONSTRAINT "photo_tags_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."photo_tags"
    ADD CONSTRAINT "photo_tags_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."photo_tags"
    ADD CONSTRAINT "photo_tags_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."photo_tags"
    ADD CONSTRAINT "photo_tags_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."privacy_changes"
    ADD CONSTRAINT "privacy_changes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."processing_jobs"
    ADD CONSTRAINT "processing_jobs_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "public"."data_sources"("id");



ALTER TABLE ONLY "public"."professional_competencies"
    ADD CONSTRAINT "professional_competencies_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_galleries"
    ADD CONSTRAINT "profile_galleries_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_galleries"
    ADD CONSTRAINT "profile_galleries_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_locations"
    ADD CONSTRAINT "profile_locations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_locations"
    ADD CONSTRAINT "profile_locations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_organizations"
    ADD CONSTRAINT "profile_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_organizations"
    ADD CONSTRAINT "profile_organizations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_projects"
    ADD CONSTRAINT "profile_projects_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_projects"
    ADD CONSTRAINT "profile_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_primary_organization_id_fkey" FOREIGN KEY ("primary_organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_analyses"
    ADD CONSTRAINT "project_analyses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_analytics"
    ADD CONSTRAINT "project_analytics_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_contexts"
    ADD CONSTRAINT "project_contexts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."project_contexts"
    ADD CONSTRAINT "project_contexts_last_updated_by_fkey" FOREIGN KEY ("last_updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."project_contexts"
    ADD CONSTRAINT "project_contexts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."project_contexts"
    ADD CONSTRAINT "project_contexts_organization_id_fkey1" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_contexts"
    ADD CONSTRAINT "project_contexts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_media"
    ADD CONSTRAINT "project_media_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_media"
    ADD CONSTRAINT "project_media_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_media"
    ADD CONSTRAINT "project_media_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."project_organizations"
    ADD CONSTRAINT "project_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_organizations"
    ADD CONSTRAINT "project_organizations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_participants"
    ADD CONSTRAINT "project_participants_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_participants"
    ADD CONSTRAINT "project_participants_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_profiles"
    ADD CONSTRAINT "project_profiles_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_seed_interviews"
    ADD CONSTRAINT "project_seed_interviews_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_storytellers"
    ADD CONSTRAINT "project_storytellers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_storytellers"
    ADD CONSTRAINT "project_storytellers_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_updates"
    ADD CONSTRAINT "project_updates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."project_updates"
    ADD CONSTRAINT "project_updates_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_feedback"
    ADD CONSTRAINT "report_feedback_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."report_feedback"
    ADD CONSTRAINT "report_feedback_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."annual_reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_feedback"
    ADD CONSTRAINT "report_feedback_responded_by_fkey" FOREIGN KEY ("responded_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."report_sections"
    ADD CONSTRAINT "report_sections_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."report_sections"
    ADD CONSTRAINT "report_sections_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."annual_reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_templates"
    ADD CONSTRAINT "report_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."report_templates"
    ADD CONSTRAINT "report_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."ripple_effects"
    ADD CONSTRAINT "ripple_effects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ripple_effects"
    ADD CONSTRAINT "ripple_effects_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."ripple_effects"
    ADD CONSTRAINT "ripple_effects_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ripple_effects"
    ADD CONSTRAINT "ripple_effects_triggered_by_fkey" FOREIGN KEY ("triggered_by") REFERENCES "public"."ripple_effects"("id");



ALTER TABLE ONLY "public"."scraped_services"
    ADD CONSTRAINT "scraped_services_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scraper_health_metrics"
    ADD CONSTRAINT "scraper_health_metrics_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "public"."data_sources"("id");



ALTER TABLE ONLY "public"."scraping_metadata"
    ADD CONSTRAINT "scraping_metadata_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_impact"
    ADD CONSTRAINT "service_impact_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id");



ALTER TABLE ONLY "public"."sroi_calculations"
    ADD CONSTRAINT "sroi_calculations_calculated_by_fkey" FOREIGN KEY ("calculated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."sroi_calculations"
    ADD CONSTRAINT "sroi_calculations_sroi_input_id_fkey" FOREIGN KEY ("sroi_input_id") REFERENCES "public"."sroi_inputs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sroi_inputs"
    ADD CONSTRAINT "sroi_inputs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."sroi_inputs"
    ADD CONSTRAINT "sroi_inputs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sroi_outcomes"
    ADD CONSTRAINT "sroi_outcomes_sroi_input_id_fkey" FOREIGN KEY ("sroi_input_id") REFERENCES "public"."sroi_inputs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_elder_approved_by_fkey" FOREIGN KEY ("elder_approved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_elder_reviewer_id_fkey" FOREIGN KEY ("elder_reviewer_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_original_author_id_fkey" FOREIGN KEY ("original_author_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."organization_services"("id");



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."stories"
    ADD CONSTRAINT "stories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_access_log"
    ADD CONSTRAINT "story_access_log_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."external_applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_access_log"
    ADD CONSTRAINT "story_access_log_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_access_tokens"
    ADD CONSTRAINT "story_access_tokens_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."story_access_tokens"
    ADD CONSTRAINT "story_access_tokens_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_access_tokens"
    ADD CONSTRAINT "story_access_tokens_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_distributions"
    ADD CONSTRAINT "story_distributions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."story_distributions"
    ADD CONSTRAINT "story_distributions_revoked_by_fkey" FOREIGN KEY ("revoked_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."story_distributions"
    ADD CONSTRAINT "story_distributions_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_engagement_daily"
    ADD CONSTRAINT "story_engagement_daily_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_engagement_daily"
    ADD CONSTRAINT "story_engagement_daily_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."story_engagement_events"
    ADD CONSTRAINT "story_engagement_events_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."external_applications"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."story_engagement_events"
    ADD CONSTRAINT "story_engagement_events_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_engagement_events"
    ADD CONSTRAINT "story_engagement_events_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."story_images"
    ADD CONSTRAINT "story_images_photographer_id_fkey" FOREIGN KEY ("photographer_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."story_images"
    ADD CONSTRAINT "story_images_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_images"
    ADD CONSTRAINT "story_images_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."story_media"
    ADD CONSTRAINT "story_media_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."story_media"
    ADD CONSTRAINT "story_media_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_narrative_arcs"
    ADD CONSTRAINT "story_narrative_arcs_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_narrative_arcs"
    ADD CONSTRAINT "story_narrative_arcs_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."story_project_features"
    ADD CONSTRAINT "story_project_features_act_project_id_fkey" FOREIGN KEY ("act_project_id") REFERENCES "public"."act_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_project_features"
    ADD CONSTRAINT "story_project_features_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."act_admins"("user_id");



ALTER TABLE ONLY "public"."story_project_features"
    ADD CONSTRAINT "story_project_features_tagged_by_fkey" FOREIGN KEY ("tagged_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."story_project_tags"
    ADD CONSTRAINT "story_project_tags_act_approved_by_fkey" FOREIGN KEY ("act_approved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."story_project_tags"
    ADD CONSTRAINT "story_project_tags_act_project_id_fkey" FOREIGN KEY ("act_project_id") REFERENCES "public"."act_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_project_tags"
    ADD CONSTRAINT "story_project_tags_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_project_tags"
    ADD CONSTRAINT "story_project_tags_tagged_by_fkey" FOREIGN KEY ("tagged_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."story_review_invitations"
    ADD CONSTRAINT "story_review_invitations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_review_invitations"
    ADD CONSTRAINT "story_review_invitations_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_review_invitations"
    ADD CONSTRAINT "story_review_invitations_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."story_syndication_consent"
    ADD CONSTRAINT "story_syndication_consent_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."external_applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_syndication_consent"
    ADD CONSTRAINT "story_syndication_consent_cultural_approver_id_fkey" FOREIGN KEY ("cultural_approver_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."story_syndication_consent"
    ADD CONSTRAINT "story_syndication_consent_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_syndication_consent"
    ADD CONSTRAINT "story_syndication_consent_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."story_syndication_requests"
    ADD CONSTRAINT "story_syndication_requests_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."external_applications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_syndication_requests"
    ADD CONSTRAINT "story_syndication_requests_consent_id_fkey" FOREIGN KEY ("consent_id") REFERENCES "public"."story_syndication_consent"("id");



ALTER TABLE ONLY "public"."story_syndication_requests"
    ADD CONSTRAINT "story_syndication_requests_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."partner_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."story_syndication_requests"
    ADD CONSTRAINT "story_syndication_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."story_syndication_requests"
    ADD CONSTRAINT "story_syndication_requests_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_analytics"
    ADD CONSTRAINT "storyteller_analytics_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_connections"
    ADD CONSTRAINT "storyteller_connections_initiated_by_fkey" FOREIGN KEY ("initiated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."storyteller_connections"
    ADD CONSTRAINT "storyteller_connections_storyteller_a_id_fkey" FOREIGN KEY ("storyteller_a_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_connections"
    ADD CONSTRAINT "storyteller_connections_storyteller_b_id_fkey" FOREIGN KEY ("storyteller_b_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_dashboard_config"
    ADD CONSTRAINT "storyteller_dashboard_config_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_demographics"
    ADD CONSTRAINT "storyteller_demographics_last_updated_by_fkey" FOREIGN KEY ("last_updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."storyteller_demographics"
    ADD CONSTRAINT "storyteller_demographics_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_engagement"
    ADD CONSTRAINT "storyteller_engagement_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_impact_metrics"
    ADD CONSTRAINT "storyteller_impact_metrics_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_locations"
    ADD CONSTRAINT "storyteller_locations_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_locations"
    ADD CONSTRAINT "storyteller_locations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."storyteller_media_links"
    ADD CONSTRAINT "storyteller_media_links_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_milestones"
    ADD CONSTRAINT "storyteller_milestones_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_organizations"
    ADD CONSTRAINT "storyteller_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_organizations"
    ADD CONSTRAINT "storyteller_organizations_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_organizations"
    ADD CONSTRAINT "storyteller_organizations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."storyteller_project_features"
    ADD CONSTRAINT "storyteller_project_features_act_project_id_fkey" FOREIGN KEY ("act_project_id") REFERENCES "public"."act_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_project_features"
    ADD CONSTRAINT "storyteller_project_features_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."storyteller_project_features"
    ADD CONSTRAINT "storyteller_project_features_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_projects"
    ADD CONSTRAINT "storyteller_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_projects"
    ADD CONSTRAINT "storyteller_projects_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_projects"
    ADD CONSTRAINT "storyteller_projects_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."storyteller_quotes"
    ADD CONSTRAINT "storyteller_quotes_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."storyteller_quotes"
    ADD CONSTRAINT "storyteller_quotes_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_recommendations"
    ADD CONSTRAINT "storyteller_recommendations_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_themes"
    ADD CONSTRAINT "storyteller_themes_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storyteller_themes"
    ADD CONSTRAINT "storyteller_themes_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "public"."narrative_themes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."storytelling_circle_evaluations"
    ADD CONSTRAINT "storytelling_circle_evaluations_facilitator_id_fkey" FOREIGN KEY ("facilitator_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."storytelling_circle_evaluations"
    ADD CONSTRAINT "storytelling_circle_evaluations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id");



ALTER TABLE ONLY "public"."tenant_ai_policies"
    ADD CONSTRAINT "tenant_ai_policies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."theme_associations"
    ADD CONSTRAINT "theme_associations_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."theme_concept_evolution"
    ADD CONSTRAINT "theme_concept_evolution_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."theme_evolution"
    ADD CONSTRAINT "theme_evolution_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."theory_of_change"
    ADD CONSTRAINT "theory_of_change_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."theory_of_change"
    ADD CONSTRAINT "theory_of_change_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."title_suggestions"
    ADD CONSTRAINT "title_suggestions_selected_by_fkey" FOREIGN KEY ("selected_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."title_suggestions"
    ADD CONSTRAINT "title_suggestions_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transcription_jobs"
    ADD CONSTRAINT "transcription_jobs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."transcription_jobs"
    ADD CONSTRAINT "transcription_jobs_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_elder_reviewed_by_fkey" FOREIGN KEY ("elder_reviewed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id");



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_storyteller_id_fkey" FOREIGN KEY ("storyteller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transcripts"
    ADD CONSTRAINT "transcripts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."videos"
    ADD CONSTRAINT "videos_source_blog_post_id_fkey" FOREIGN KEY ("source_blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."videos"
    ADD CONSTRAINT "videos_source_empathy_entry_id_fkey" FOREIGN KEY ("source_empathy_entry_id") REFERENCES "public"."empathy_entries"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."webhook_delivery_log"
    ADD CONSTRAINT "webhook_delivery_log_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."webhook_subscriptions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."webhook_subscriptions"
    ADD CONSTRAINT "webhook_subscriptions_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "public"."external_applications"("id") ON DELETE CASCADE;



CREATE POLICY "ACT admins can approve story tags" ON "public"."story_project_tags" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."act_admin_permissions"
  WHERE (("act_admin_permissions"."user_id" = "auth"."uid"()) AND ("act_admin_permissions"."is_active" = true) AND ("act_admin_permissions"."can_approve_stories" = true) AND (("act_admin_permissions"."project_ids" IS NULL) OR ("story_project_tags"."act_project_id" = ANY ("act_admin_permissions"."project_ids")))))));



CREATE POLICY "ACT admins can approve storyteller features" ON "public"."storyteller_project_features" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."act_admin_permissions"
  WHERE (("act_admin_permissions"."user_id" = "auth"."uid"()) AND ("act_admin_permissions"."is_active" = true) AND ("act_admin_permissions"."can_approve_storytellers" = true) AND (("act_admin_permissions"."project_ids" IS NULL) OR ("storyteller_project_features"."act_project_id" = ANY ("act_admin_permissions"."project_ids")))))));



CREATE POLICY "ACT admins can create story tags" ON "public"."story_project_tags" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."act_admin_permissions"
  WHERE (("act_admin_permissions"."user_id" = "auth"."uid"()) AND ("act_admin_permissions"."is_active" = true) AND ("act_admin_permissions"."can_approve_stories" = true)))));



CREATE POLICY "ACT admins can manage projects" ON "public"."act_projects" TO "authenticated" USING (true);



CREATE POLICY "ACT admins can manage story features" ON "public"."story_project_features" USING ((EXISTS ( SELECT 1
   FROM "public"."act_admins"
  WHERE (("act_admins"."user_id" = "auth"."uid"()) AND ("act_admins"."can_approve_stories" = true) AND ("act_admins"."revoked_at" IS NULL)))));



CREATE POLICY "ACT admins can update requests" ON "public"."act_feature_requests" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."act_admin_permissions"
  WHERE (("act_admin_permissions"."user_id" = "auth"."uid"()) AND ("act_admin_permissions"."is_active" = true)))));



CREATE POLICY "ACT admins can view all requests" ON "public"."act_feature_requests" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."act_admin_permissions"
  WHERE (("act_admin_permissions"."user_id" = "auth"."uid"()) AND ("act_admin_permissions"."is_active" = true)))));



CREATE POLICY "Admins can delete users" ON "public"."users" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Admins can insert users" ON "public"."users" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage AI jobs" ON "public"."ai_analysis_jobs" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (COALESCE("profiles"."super_admin", false) = true)))));



CREATE POLICY "Admins can manage all deletion requests" ON "public"."deletion_requests" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE ((("profiles"."id" = "auth"."uid"()) AND ('admin'::"text" = ANY ("profiles"."tenant_roles"))) OR ('super_admin'::"text" = ANY ("profiles"."tenant_roles"))))));



CREATE POLICY "Admins can manage all distributions" ON "public"."story_distributions" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE ((("profiles"."id" = "auth"."uid"()) AND ('admin'::"text" = ANY ("profiles"."tenant_roles"))) OR ('super_admin'::"text" = ANY ("profiles"."tenant_roles"))))));



CREATE POLICY "Admins can manage dream organizations" ON "public"."dream_organizations" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."tenant_roles" @> ARRAY['admin'::"text"]) OR ("profiles"."tenant_roles" @> ARRAY['super_admin'::"text"]))))));



CREATE POLICY "Admins can manage messages" ON "public"."admin_messages" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (COALESCE("profiles"."super_admin", false) = true)))));



CREATE POLICY "Admins can manage recipients" ON "public"."message_recipients" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (COALESCE("profiles"."super_admin", false) = true)))));



CREATE POLICY "Admins can manage service impact for their organization" ON "public"."service_impact" USING (("organization_id" = ("current_setting"('app.current_organization_id'::"text", true))::"uuid"));



CREATE POLICY "Admins can manage themes" ON "public"."narrative_themes" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (('admin'::"text" = ANY ("p"."tenant_roles")) OR ('super_admin'::"text" = ANY ("p"."tenant_roles")))))));



CREATE POLICY "Admins can manage tour stops" ON "public"."tour_stops" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."tenant_roles" @> ARRAY['admin'::"text"]) OR ("profiles"."tenant_roles" @> ARRAY['super_admin'::"text"]))))));



CREATE POLICY "Admins can update all users" ON "public"."users" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins can update approval queue" ON "public"."content_approval_queue" FOR UPDATE USING (true);



CREATE POLICY "Admins can update tour requests" ON "public"."tour_requests" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."tenant_roles" @> ARRAY['admin'::"text"]) OR ("profiles"."tenant_roles" @> ARRAY['super_admin'::"text"]))))));



CREATE POLICY "Admins can view all activity" ON "public"."activity_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (COALESCE("profiles"."super_admin", false) = true)))));



CREATE POLICY "Admins can view all audit logs" ON "public"."audit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE ((("profiles"."id" = "auth"."uid"()) AND ('admin'::"text" = ANY ("profiles"."tenant_roles"))) OR ('super_admin'::"text" = ANY ("profiles"."tenant_roles"))))));



CREATE POLICY "Admins can view all users" ON "public"."users" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view platform analytics" ON "public"."platform_analytics" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (('admin'::"text" = ANY ("p"."tenant_roles")) OR ('super_admin'::"text" = ANY ("p"."tenant_roles")))))));



CREATE POLICY "Admins can view their own permissions" ON "public"."act_admin_permissions" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Admins can view tour requests" ON "public"."tour_requests" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."tenant_roles" @> ARRAY['admin'::"text"]) OR ("profiles"."tenant_roles" @> ARRAY['super_admin'::"text"]))))));



CREATE POLICY "Allow anon delete to gallery_media" ON "public"."gallery_media" FOR DELETE TO "anon" USING (true);



CREATE POLICY "Allow authenticated delete to gallery_media" ON "public"."gallery_media" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated insert to gallery_media" ON "public"."gallery_media" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated manage impact_stats" ON "public"."impact_stats" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow authenticated manage media_files" ON "public"."media_files" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow authenticated manage partners" ON "public"."partners" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow authenticated manage services" ON "public"."services" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow authenticated manage team_members" ON "public"."team_members" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow authenticated manage testimonials" ON "public"."testimonials" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow authenticated update to gallery_media" ON "public"."gallery_media" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow public read access to gallery_media" ON "public"."gallery_media" FOR SELECT USING (true);



CREATE POLICY "Allow public read on impact_stats" ON "public"."impact_stats" FOR SELECT USING (true);



CREATE POLICY "Allow public read on partners" ON "public"."partners" FOR SELECT USING (true);



CREATE POLICY "Allow public read on public media" ON "public"."media_files" FOR SELECT USING (("cultural_sensitivity" = ANY (ARRAY['public'::"text", 'community'::"text"])));



CREATE POLICY "Allow public read on services" ON "public"."services" FOR SELECT USING (true);



CREATE POLICY "Allow public read on team_members" ON "public"."team_members" FOR SELECT USING (true);



CREATE POLICY "Allow public read on testimonials" ON "public"."testimonials" FOR SELECT USING (true);



CREATE POLICY "Anyone can read stats" ON "public"."platform_stats_cache" FOR SELECT USING (true);



CREATE POLICY "Anyone can submit tour requests" ON "public"."tour_requests" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can view active ACT projects" ON "public"."act_projects" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view agent registry" ON "public"."ai_agent_registry" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view approved features" ON "public"."storyteller_project_features" FOR SELECT USING (("is_visible" = true));



CREATE POLICY "Anyone can view dream organizations" ON "public"."dream_organizations" FOR SELECT USING (true);



CREATE POLICY "Anyone can view featured stories" ON "public"."story_project_tags" FOR SELECT USING (("is_featured" = true));



CREATE POLICY "Anyone can view tour requests for map" ON "public"."tour_requests" FOR SELECT USING (true);



CREATE POLICY "Anyone can view tour stops" ON "public"."tour_stops" FOR SELECT USING (true);



CREATE POLICY "Authenticated insert" ON "public"."community_interpretation_sessions" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated insert" ON "public"."community_story_responses" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated insert" ON "public"."harvested_outcomes" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated insert" ON "public"."ripple_effects" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can delete blog posts" ON "public"."blog_posts" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can insert blog posts" ON "public"."blog_posts" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can update blog posts" ON "public"."blog_posts" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can upload story images" ON "public"."story_images" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can view active apps" ON "public"."external_applications" FOR SELECT TO "authenticated" USING (("is_active" = true));



CREATE POLICY "Authors can delete their own stories" ON "public"."stories" FOR DELETE TO "authenticated" USING (("author_id" = "auth"."uid"()));



CREATE POLICY "Authors can insert own stories" ON "public"."stories" FOR INSERT WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Authors can insert quotes in their tenant" ON "public"."quotes" FOR INSERT TO "authenticated" WITH CHECK ((("author_id" = "auth"."uid"()) AND ("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())))));



CREATE POLICY "Authors can insert stories in their tenant" ON "public"."stories" FOR INSERT TO "authenticated" WITH CHECK ((("author_id" = "auth"."uid"()) AND ("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())))));



CREATE POLICY "Authors can update own stories" ON "public"."stories" FOR UPDATE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Authors can update their own quotes" ON "public"."quotes" FOR UPDATE TO "authenticated" USING (("author_id" = "auth"."uid"())) WITH CHECK (("author_id" = "auth"."uid"()));



CREATE POLICY "Authors can update their own stories" ON "public"."stories" FOR UPDATE TO "authenticated" USING (("author_id" = "auth"."uid"())) WITH CHECK ((("author_id" = "auth"."uid"()) AND ("tenant_id" = ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())))));



CREATE POLICY "Authors can view their content moderation" ON "public"."moderation_results" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "moderation_results"."content_id") AND (("stories"."author_id" = "auth"."uid"()) OR ("stories"."storyteller_id" = "auth"."uid"()))))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_elder" = true))))));



CREATE POLICY "Community profiles viewable by authenticated users" ON "public"."profiles" FOR SELECT USING ((("profile_visibility" = 'community'::"text") AND ("auth"."role"() = 'authenticated'::"text")));



CREATE POLICY "Demographics respect privacy settings" ON "public"."storyteller_demographics" FOR SELECT USING ((("storyteller_id" = "auth"."uid"()) OR (("demographic_sharing_level")::"text" = 'public'::"text") OR ((("demographic_sharing_level")::"text" = 'network'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."storyteller_connections" "sc"
  WHERE ((("sc"."storyteller_a_id" = "auth"."uid"()) AND ("sc"."storyteller_b_id" = "storyteller_demographics"."storyteller_id")) OR (("sc"."storyteller_b_id" = "auth"."uid"()) AND ("sc"."storyteller_a_id" = "storyteller_demographics"."storyteller_id") AND (("sc"."status")::"text" = 'connected'::"text")))))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (('admin'::"text" = ANY ("p"."tenant_roles")) OR ('super_admin'::"text" = ANY ("p"."tenant_roles"))))))));



CREATE POLICY "Elders and content authors can view logs" ON "public"."ai_moderation_logs" FOR SELECT TO "authenticated" USING ((("author_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_elder" = true))))));



CREATE POLICY "Elders can update appeals" ON "public"."moderation_appeals" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_elder" = true)))));



CREATE POLICY "Elders can update their reviews" ON "public"."elder_review_queue" FOR UPDATE TO "authenticated" USING ((("assigned_elder_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_elder" = true))))));



CREATE POLICY "Elders can view their assigned reviews" ON "public"."elder_review_queue" FOR SELECT TO "authenticated" USING ((("assigned_elder_id" = "auth"."uid"()) OR ("assigned_elder_id" IS NULL) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_elder" = true))))));



CREATE POLICY "Impact metrics respect sharing settings" ON "public"."storyteller_impact_metrics" FOR SELECT USING ((("storyteller_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."storyteller_dashboard_config" "sdc"
  WHERE (("sdc"."storyteller_id" = "storyteller_impact_metrics"."storyteller_id") AND (("sdc"."public_dashboard" = true) OR (("sdc"."shared_with_network" = true) AND (EXISTS ( SELECT 1
           FROM "public"."storyteller_connections" "sc"
          WHERE ((("sc"."storyteller_a_id" = "auth"."uid"()) AND ("sc"."storyteller_b_id" = "storyteller_impact_metrics"."storyteller_id")) OR (("sc"."storyteller_b_id" = "auth"."uid"()) AND ("sc"."storyteller_a_id" = "storyteller_impact_metrics"."storyteller_id") AND (("sc"."status")::"text" = 'connected'::"text")))))))))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (('admin'::"text" = ANY ("p"."tenant_roles")) OR ('super_admin'::"text" = ANY ("p"."tenant_roles"))))))));



CREATE POLICY "Insights respect visibility levels" ON "public"."cross_narrative_insights" FOR SELECT USING (((("visibility_level")::"text" = 'public'::"text") OR ((("visibility_level")::"text" = 'network'::"text") AND ("auth"."uid"() IS NOT NULL)) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (('admin'::"text" = ANY ("p"."tenant_roles")) OR ('super_admin'::"text" = ANY ("p"."tenant_roles"))))))));



CREATE POLICY "Media usage is viewable by everyone" ON "public"."media_usage_tracking" FOR SELECT USING (true);



CREATE POLICY "Members can view all org reports" ON "public"."annual_reports" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "annual_reports"."organization_id") AND ("organization_members"."profile_id" IN ( SELECT "profiles"."id"
           FROM "public"."profiles"
          WHERE ("profiles"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Members can view org details" ON "public"."organizations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "organizations"."id") AND ("organization_members"."profile_id" IN ( SELECT "profiles"."id"
           FROM "public"."profiles"
          WHERE ("profiles"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Members can view services" ON "public"."organization_services" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "organization_services"."organization_id") AND ("organization_members"."profile_id" IN ( SELECT "profiles"."id"
           FROM "public"."profiles"
          WHERE ("profiles"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Org admins can view AI policies" ON "public"."tenant_ai_policies" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profile_organizations" "po"
  WHERE (("po"."profile_id" = "auth"."uid"()) AND (("po"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'owner'::character varying])::"text"[])) AND ("po"."is_active" = true)))));



CREATE POLICY "Organization admins can manage context" ON "public"."organization_contexts" USING (("organization_id" IN ( SELECT "po"."organization_id"
   FROM "public"."profile_organizations" "po"
  WHERE (("po"."profile_id" = "auth"."uid"()) AND ("po"."is_active" = true) AND (("po"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Organization admins can manage roles in their organization" ON "public"."organization_roles" USING (("organization_id" IN ( SELECT "organization_roles_1"."organization_id"
   FROM "public"."organization_roles" "organization_roles_1"
  WHERE (("organization_roles_1"."profile_id" = "auth"."uid"()) AND ("organization_roles_1"."role" = ANY (ARRAY['admin'::"public"."organization_role", 'elder'::"public"."organization_role", 'cultural_keeper'::"public"."organization_role"])) AND ("organization_roles_1"."is_active" = true)))));



CREATE POLICY "Organization admins can update impact metrics" ON "public"."organization_impact_metrics" FOR UPDATE USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."profile_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['admin'::"text", 'owner'::"text"]))))));



CREATE POLICY "Organization admins can view all roles for their organization" ON "public"."organization_roles" FOR SELECT USING (("organization_id" IN ( SELECT "organization_roles_1"."organization_id"
   FROM "public"."organization_roles" "organization_roles_1"
  WHERE (("organization_roles_1"."profile_id" = "auth"."uid"()) AND ("organization_roles_1"."role" = ANY (ARRAY['admin'::"public"."organization_role", 'elder'::"public"."organization_role", 'cultural_keeper'::"public"."organization_role"])) AND ("organization_roles_1"."is_active" = true)))));



CREATE POLICY "Organization admins see all org media" ON "public"."media_assets";



CREATE POLICY "Organization admins see all org stories" ON "public"."stories";



CREATE POLICY "Organization admins see all org transcripts" ON "public"."transcripts";



CREATE POLICY "Organization members can view context" ON "public"."organization_contexts" FOR SELECT USING (("organization_id" IN ( SELECT "profile_organizations"."organization_id"
   FROM "public"."profile_organizations"
  WHERE (("profile_organizations"."profile_id" = "auth"."uid"()) AND ("profile_organizations"."is_active" = true)))));



CREATE POLICY "Organization members can view impact metrics" ON "public"."organization_impact_metrics" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."profile_id" = "auth"."uid"()))));



CREATE POLICY "Organization members can view insights" ON "public"."organization_cross_transcript_insights" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."profile_id" = "auth"."uid"()))));



CREATE POLICY "Organization members can view network" ON "public"."organization_storyteller_network" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."profile_id" = "auth"."uid"()))));



CREATE POLICY "Organization members can view project contexts" ON "public"."project_contexts" FOR SELECT USING (("organization_id" IN ( SELECT "profile_organizations"."organization_id"
   FROM "public"."profile_organizations"
  WHERE (("profile_organizations"."profile_id" = "auth"."uid"()) AND ("profile_organizations"."is_active" = true)))));



CREATE POLICY "Organization members can view theme analytics" ON "public"."organization_theme_analytics" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."profile_id" = "auth"."uid"()))));



CREATE POLICY "Private profiles viewable by owner" ON "public"."profiles" FOR SELECT USING ((("profile_visibility" = 'private'::"text") AND ("auth"."uid"() = "id")));



CREATE POLICY "Private stories viewable by author" ON "public"."stories" FOR SELECT USING ((("is_public" = false) AND ("auth"."uid"() = "author_id")));



CREATE POLICY "Project admins can manage contexts" ON "public"."project_contexts" USING (("organization_id" IN ( SELECT "po"."organization_id"
   FROM "public"."profile_organizations" "po"
  WHERE (("po"."profile_id" = "auth"."uid"()) AND ("po"."is_active" = true) AND (("po"."role")::"text" = ANY ((ARRAY['admin'::character varying, 'project_manager'::character varying])::"text"[]))))));



CREATE POLICY "Public can view active ACT projects" ON "public"."act_projects" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Public can view approved story features" ON "public"."story_project_features" FOR SELECT USING (("is_visible" = true));



CREATE POLICY "Public can view published story images" ON "public"."story_images" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_images"."story_id") AND ("stories"."is_public" = true) AND ("stories"."status" = 'published'::"text")))));



CREATE POLICY "Public insights are visible to all" ON "public"."organization_cross_transcript_insights" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Public media assets are viewable by everyone" ON "public"."media_assets" FOR SELECT USING ((COALESCE("visibility", 'public'::"text") = 'public'::"text"));



CREATE POLICY "Public media viewable by all" ON "public"."story_media" FOR SELECT USING ((("is_public" = true) AND (EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_media"."story_id") AND ("stories"."is_public" = true) AND ("stories"."status" = 'published'::"text"))))));



CREATE POLICY "Public milestones are viewable" ON "public"."storyteller_milestones" FOR SELECT USING ((("is_public" = true) OR ("storyteller_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (('admin'::"text" = ANY ("p"."tenant_roles")) OR ('super_admin'::"text" = ANY ("p"."tenant_roles"))))))));



CREATE POLICY "Public organizations viewable by all" ON "public"."organizations" FOR SELECT USING (("empathy_ledger_enabled" = true));



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (("profile_visibility" = 'public'::"text"));



CREATE POLICY "Public quotes are viewable" ON "public"."storyteller_quotes" FOR SELECT USING (((("is_public" = true) AND (("requires_approval" = false) OR ("approved_at" IS NOT NULL))) OR ("storyteller_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (('admin'::"text" = ANY ("p"."tenant_roles")) OR ('super_admin'::"text" = ANY ("p"."tenant_roles"))))))));



CREATE POLICY "Public read access" ON "public"."audio_emotion_analysis" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."audio_prosodic_analysis" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."community_interpretation_sessions" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."community_story_responses" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."cultural_speech_patterns" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."harvested_outcomes" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."ripple_effects" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."sroi_calculations" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."sroi_inputs" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."sroi_outcomes" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."story_narrative_arcs" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."storytelling_circle_evaluations" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."theme_concept_evolution" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."theme_evolution" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."theory_of_change" FOR SELECT USING (true);



CREATE POLICY "Public stories are viewable by everyone" ON "public"."stories" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Public templates viewable by all" ON "public"."report_templates" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Public themes are viewable" ON "public"."narrative_themes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Public transcripts are viewable by everyone" ON "public"."transcripts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."media_assets"
  WHERE (("media_assets"."id" = "transcripts"."media_asset_id") AND (COALESCE("media_assets"."visibility", 'public'::"text") = 'public'::"text")))));



CREATE POLICY "Public videos visible to all" ON "public"."videos" FOR SELECT USING ((("is_public" = true) AND ("status" = 'published'::"text")));



CREATE POLICY "Published blog posts are viewable by everyone" ON "public"."blog_posts" FOR SELECT USING ((("status" = 'published'::"text") AND ("elder_approved" = true)));



CREATE POLICY "Published reports viewable by authenticated users" ON "public"."annual_reports" FOR SELECT USING ((("status" = 'published'::"text") AND ("auth"."role"() = 'authenticated'::"text")));



CREATE POLICY "Report managers can create/edit reports" ON "public"."annual_reports" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "annual_reports"."organization_id") AND ("organization_members"."profile_id" IN ( SELECT "profiles"."id"
           FROM "public"."profiles"
          WHERE ("profiles"."user_id" = "auth"."uid"()))) AND ("organization_members"."can_manage_reports" = true)))));



CREATE POLICY "Report stories viewable with report" ON "public"."annual_report_stories" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."annual_reports"
  WHERE (("annual_reports"."id" = "annual_report_stories"."report_id") AND (("annual_reports"."status" = 'published'::"text") OR (EXISTS ( SELECT 1
           FROM "public"."organization_members"
          WHERE (("organization_members"."organization_id" = "annual_reports"."organization_id") AND ("organization_members"."profile_id" IN ( SELECT "profiles"."id"
                   FROM "public"."profiles"
                  WHERE ("profiles"."user_id" = "auth"."uid"())))))))))));



CREATE POLICY "Service role can insert access logs" ON "public"."story_access_log" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Service role can insert events" ON "public"."story_engagement_events" FOR INSERT WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can manage all tokens" ON "public"."story_access_tokens" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can read access logs" ON "public"."story_access_log" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Service role can read external_applications" ON "public"."external_applications" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Service role full access" ON "public"."story_review_invitations" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role full access" ON "public"."transcripts" TO "service_role" USING (true);



CREATE POLICY "Service role full access to consent" ON "public"."story_syndication_consent" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role has full access to ai_agent_registry" ON "public"."ai_agent_registry" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role has full access to ai_usage_daily" ON "public"."ai_usage_daily" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role has full access to ai_usage_events" ON "public"."ai_usage_events" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role has full access to cultural protocols" ON "public"."cultural_protocols" TO "service_role" USING (true);



CREATE POLICY "Service role has full access to events" ON "public"."events" TO "service_role" USING (true);



CREATE POLICY "Service role has full access to profiles" ON "public"."profiles" TO "service_role" USING (true);



CREATE POLICY "Service role has full access to quotes" ON "public"."quotes" TO "service_role" USING (true);



CREATE POLICY "Service role has full access to stories" ON "public"."stories" TO "service_role" USING (true);



CREATE POLICY "Service role has full access to tenant_ai_policies" ON "public"."tenant_ai_policies" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role has full access to tenants" ON "public"."tenants" TO "service_role" USING (true);



CREATE POLICY "Service role manages consent logs" ON "public"."consent_change_log" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages delivery logs" ON "public"."webhook_delivery_log" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role manages webhooks" ON "public"."webhook_subscriptions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Staff can insert activities for their organization" ON "public"."activities" FOR INSERT WITH CHECK (("organization_id" = ("current_setting"('app.current_organization_id'::"text", true))::"uuid"));



CREATE POLICY "Staff can insert outcomes for their organization" ON "public"."outcomes" FOR INSERT WITH CHECK (("organization_id" = ("current_setting"('app.current_organization_id'::"text", true))::"uuid"));



CREATE POLICY "Staff can insert to approval queue" ON "public"."content_approval_queue" FOR INSERT WITH CHECK (true);



CREATE POLICY "Staff can insert videos" ON "public"."videos" FOR INSERT WITH CHECK (true);



CREATE POLICY "Staff can update activities for their organization" ON "public"."activities" FOR UPDATE USING (("organization_id" = ("current_setting"('app.current_organization_id'::"text", true))::"uuid"));



CREATE POLICY "Staff can update outcomes for their organization" ON "public"."outcomes" FOR UPDATE USING (("organization_id" = ("current_setting"('app.current_organization_id'::"text", true))::"uuid"));



CREATE POLICY "Staff can update videos" ON "public"."videos" FOR UPDATE USING (true);



CREATE POLICY "Staff can view all videos" ON "public"."videos" FOR SELECT USING (true);



CREATE POLICY "Staff can view approval queue" ON "public"."content_approval_queue" FOR SELECT USING (true);



CREATE POLICY "Story authors can view daily stats" ON "public"."story_engagement_daily" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_engagement_daily"."story_id") AND ("stories"."author_id" = "auth"."uid"())))));



CREATE POLICY "Story authors can view engagement" ON "public"."story_engagement_events" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_engagement_events"."story_id") AND ("stories"."author_id" = "auth"."uid"())))));



CREATE POLICY "Story owners can create invitations" ON "public"."story_review_invitations" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_review_invitations"."story_id") AND ("stories"."author_id" = "auth"."uid"())))));



CREATE POLICY "Story owners can manage suggestions" ON "public"."title_suggestions" USING (((EXISTS ( SELECT 1
   FROM "public"."stories" "s"
  WHERE (("s"."id" = "title_suggestions"."story_id") AND (("s"."author_id" = "auth"."uid"()) OR ("s"."storyteller_id" = "auth"."uid"()))))) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND (COALESCE("profiles"."super_admin", false) = true))))));



CREATE POLICY "Story owners can view invitations" ON "public"."story_review_invitations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_review_invitations"."story_id") AND (("stories"."author_id" = "auth"."uid"()) OR ("stories"."storyteller_id" = "auth"."uid"()))))));



CREATE POLICY "Storytellers can create requests" ON "public"."act_feature_requests" FOR INSERT WITH CHECK (("storyteller_id" = "auth"."uid"()));



CREATE POLICY "Storytellers can create tokens for their own stories" ON "public"."story_access_tokens" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_access_tokens"."story_id") AND ("stories"."storyteller_id" = "auth"."uid"())))));



CREATE POLICY "Storytellers can delete their consent" ON "public"."story_syndication_consent" FOR DELETE TO "authenticated" USING (("storyteller_id" = "auth"."uid"()));



CREATE POLICY "Storytellers can insert consent for their stories" ON "public"."story_syndication_consent" FOR INSERT TO "authenticated" WITH CHECK ((("storyteller_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_syndication_consent"."story_id") AND ("stories"."storyteller_id" = "auth"."uid"()))))));



CREATE POLICY "Storytellers can manage their own dashboard config" ON "public"."storyteller_dashboard_config" USING (("storyteller_id" = "auth"."uid"()));



CREATE POLICY "Storytellers can opt-in to projects" ON "public"."storyteller_project_features" FOR INSERT WITH CHECK (("storyteller_id" = "auth"."uid"()));



CREATE POLICY "Storytellers can revoke their own story tokens" ON "public"."story_access_tokens" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_access_tokens"."story_id") AND ("stories"."storyteller_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_access_tokens"."story_id") AND ("stories"."storyteller_id" = "auth"."uid"())))));



CREATE POLICY "Storytellers can tag their own stories" ON "public"."story_project_tags" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_project_tags"."story_id") AND ("stories"."storyteller_id" = "auth"."uid"())))));



CREATE POLICY "Storytellers can update tags for their stories" ON "public"."story_project_tags" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_project_tags"."story_id") AND ("stories"."storyteller_id" = "auth"."uid"())))));



CREATE POLICY "Storytellers can update their consent" ON "public"."story_syndication_consent" FOR UPDATE TO "authenticated" USING (("storyteller_id" = "auth"."uid"())) WITH CHECK (("storyteller_id" = "auth"."uid"()));



CREATE POLICY "Storytellers can update their own feature settings" ON "public"."storyteller_project_features" FOR UPDATE USING (("storyteller_id" = "auth"."uid"())) WITH CHECK (("storyteller_id" = "auth"."uid"()));



CREATE POLICY "Storytellers can view access logs for their stories" ON "public"."story_access_log" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_access_log"."story_id") AND ("stories"."storyteller_id" = "auth"."uid"())))));



CREATE POLICY "Storytellers can view tags for their stories" ON "public"."story_project_tags" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_project_tags"."story_id") AND ("stories"."storyteller_id" = "auth"."uid"())))));



CREATE POLICY "Storytellers can view their consent records" ON "public"."story_syndication_consent" FOR SELECT TO "authenticated" USING (("storyteller_id" = "auth"."uid"()));



CREATE POLICY "Storytellers can view their daily stats" ON "public"."story_engagement_daily" FOR SELECT USING (("storyteller_id" = "auth"."uid"()));



CREATE POLICY "Storytellers can view their engagement" ON "public"."story_engagement_events" FOR SELECT USING (("storyteller_id" = "auth"."uid"()));



CREATE POLICY "Storytellers can view their own analytics" ON "public"."storyteller_analytics" FOR SELECT USING ((("storyteller_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (('admin'::"text" = ANY ("p"."tenant_roles")) OR ('super_admin'::"text" = ANY ("p"."tenant_roles"))))))));



CREATE POLICY "Storytellers can view their own engagement" ON "public"."storyteller_engagement" FOR SELECT USING ((("storyteller_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (('admin'::"text" = ANY ("p"."tenant_roles")) OR ('super_admin'::"text" = ANY ("p"."tenant_roles"))))))));



CREATE POLICY "Storytellers can view their own features" ON "public"."storyteller_project_features" FOR SELECT USING (("storyteller_id" = "auth"."uid"()));



CREATE POLICY "Storytellers can view their own requests" ON "public"."act_feature_requests" FOR SELECT USING (("storyteller_id" = "auth"."uid"()));



CREATE POLICY "Storytellers can view their own story tokens" ON "public"."story_access_tokens" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_access_tokens"."story_id") AND ("stories"."storyteller_id" = "auth"."uid"())))));



CREATE POLICY "Storytellers can view their own themes" ON "public"."storyteller_themes" FOR SELECT USING ((("storyteller_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (('admin'::"text" = ANY ("p"."tenant_roles")) OR ('super_admin'::"text" = ANY ("p"."tenant_roles"))))))));



CREATE POLICY "Super admins can manage all permissions" ON "public"."act_admin_permissions" USING ((EXISTS ( SELECT 1
   FROM "public"."act_admin_permissions" "act_admin_permissions_1"
  WHERE (("act_admin_permissions_1"."user_id" = "auth"."uid"()) AND ("act_admin_permissions_1"."is_active" = true) AND ("act_admin_permissions_1"."can_manage_admins" = true)))));



CREATE POLICY "Super admins can manage other admins" ON "public"."act_admins" USING ((EXISTS ( SELECT 1
   FROM "public"."act_admins" "act_admins_1"
  WHERE (("act_admins_1"."user_id" = "auth"."uid"()) AND ("act_admins_1"."role" = 'super_admin'::"text") AND ("act_admins_1"."revoked_at" IS NULL)))));



CREATE POLICY "System can insert events" ON "public"."events" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND ("tenant_id" IN ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())))));



CREATE POLICY "System can insert logs" ON "public"."ai_moderation_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "System can insert moderation results" ON "public"."moderation_results" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "System can insert notifications" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "System can insert review items" ON "public"."elder_review_queue" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "System can insert safety logs" ON "public"."ai_safety_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "System can manage analytics" ON "public"."storyteller_analytics" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (('admin'::"text" = ANY ("p"."tenant_roles")) OR ('super_admin'::"text" = ANY ("p"."tenant_roles")))))));



CREATE POLICY "Tenant admins can manage protocols" ON "public"."cultural_protocols" TO "authenticated" USING (("tenant_id" IN ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ('tenant_admin'::"text" = ANY ("profiles"."tenant_roles")))))) WITH CHECK (("tenant_id" IN ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ('tenant_admin'::"text" = ANY ("profiles"."tenant_roles"))))));



CREATE POLICY "Tenant admins can read tenant events" ON "public"."events" FOR SELECT TO "authenticated" USING (("tenant_id" IN ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ('tenant_admin'::"text" = ANY ("profiles"."tenant_roles"))))));



CREATE POLICY "Tenant admins can update their tenant" ON "public"."tenants" FOR UPDATE TO "authenticated" USING (("id" IN ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ('tenant_admin'::"text" = ANY ("profiles"."tenant_roles")))))) WITH CHECK (("id" IN ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ('tenant_admin'::"text" = ANY ("profiles"."tenant_roles"))))));



CREATE POLICY "Tenant transcript access" ON "public"."transcripts" USING (("tenant_id" IN ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = ("current_setting"('app.current_user_id'::"text", true))::"uuid"))));



CREATE POLICY "Users can create appeals" ON "public"."moderation_appeals" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create their own deletion requests" ON "public"."deletion_requests" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create transcription jobs" ON "public"."transcription_jobs" FOR INSERT WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can create transcripts for their media" ON "public"."transcripts" FOR INSERT WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can create transcripts for their stories" ON "public"."transcripts" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Users can delete their own notifications" ON "public"."notifications" FOR DELETE TO "authenticated" USING (("recipient_id" = "auth"."uid"()));



CREATE POLICY "Users can find collaborators in their tenant" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("tenant_id" IN ( SELECT "profiles_1"."tenant_id"
   FROM "public"."profiles" "profiles_1"
  WHERE ("profiles_1"."id" = "auth"."uid"()))) AND (("available_for_collaboration" = true) OR ("open_to_mentoring" = true) OR ("id" = "auth"."uid"()))));



CREATE POLICY "Users can insert empathy entries" ON "public"."empathy_entries" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can manage distributions for their own stories" ON "public"."story_distributions" USING (("story_id" IN ( SELECT "stories"."id"
   FROM "public"."stories"
  WHERE (("stories"."author_id" = "auth"."uid"()) OR ("stories"."storyteller_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own story media" ON "public"."story_media" USING ((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_media"."story_id") AND ("stories"."storyteller_id" IN ( SELECT "profiles"."id"
           FROM "public"."profiles"
          WHERE ("profiles"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Users can manage own transcripts" ON "public"."transcripts" TO "authenticated" USING (("storyteller_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their imports" ON "public"."media_import_sessions" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage their own connections" ON "public"."storyteller_connections" FOR UPDATE USING ((("storyteller_a_id" = "auth"."uid"()) OR ("storyteller_b_id" = "auth"."uid"())));



CREATE POLICY "Users can manage tokens for their own stories" ON "public"."embed_tokens" USING (("story_id" IN ( SELECT "stories"."id"
   FROM "public"."stories"
  WHERE (("stories"."author_id" = "auth"."uid"()) OR ("stories"."storyteller_id" = "auth"."uid"())))));



CREATE POLICY "Users can read profiles in their tenant" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("tenant_id" IN ( SELECT "profiles_1"."tenant_id"
   FROM "public"."profiles" "profiles_1"
  WHERE ("profiles_1"."id" = "auth"."uid"()))) AND (("story_visibility_level" = 'public'::"text") OR ("story_visibility_level" = 'community'::"text") OR ("id" = "auth"."uid"()))));



CREATE POLICY "Users can read protocols in their tenant" ON "public"."cultural_protocols" FOR SELECT TO "authenticated" USING ((("tenant_id" IN ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))) AND ("status" = 'active'::"text") AND (("expiry_date" IS NULL) OR ("expiry_date" > "now"()))));



CREATE POLICY "Users can read quotes based on visibility and consent" ON "public"."quotes" FOR SELECT TO "authenticated" USING (
CASE
    WHEN (("visibility" = 'public'::"text") AND ("attribution_approved" = true) AND ("storyteller_approved" = true)) THEN true
    WHEN (("visibility" = 'community'::"text") AND ("storyteller_approved" = true)) THEN ("tenant_id" IN ( SELECT "profiles"."tenant_id"
       FROM "public"."profiles"
      WHERE ("profiles"."id" = "auth"."uid"())))
    WHEN ("visibility" = 'private'::"text") THEN ("author_id" = "auth"."uid"())
    ELSE false
END);



CREATE POLICY "Users can read stories based on privacy and tenant" ON "public"."stories" FOR SELECT TO "authenticated" USING ((
CASE
    WHEN (("privacy_level" = 'public'::"text") AND ("is_public" = true)) THEN true
    WHEN ("privacy_level" = 'community'::"text") THEN ("tenant_id" IN ( SELECT "profiles"."tenant_id"
       FROM "public"."profiles"
      WHERE ("profiles"."id" = "auth"."uid"())))
    WHEN ("privacy_level" = 'private'::"text") THEN ("author_id" = "auth"."uid"())
    WHEN ("cardinality"("cross_tenant_visibility") > 0) THEN (EXISTS ( SELECT 1
       FROM "public"."profiles"
      WHERE (("profiles"."id" = "auth"."uid"()) AND (("profiles"."tenant_id")::"text" = ANY ("stories"."cross_tenant_visibility")))))
    ELSE false
END AND (("cultural_sensitivity_level" = ANY (ARRAY['standard'::"text", 'sensitive'::"text"])) OR (("cultural_sensitivity_level" = ANY (ARRAY['sacred'::"text", 'restricted'::"text"])) AND ("author_id" = "auth"."uid"())))));



CREATE POLICY "Users can read their own events" ON "public"."events" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read their tenant information" ON "public"."tenants" FOR SELECT TO "authenticated" USING (("id" IN ( SELECT "profiles"."tenant_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



CREATE POLICY "Users can track media usage" ON "public"."media_usage_tracking" FOR INSERT WITH CHECK (("added_by" = "auth"."uid"()));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK ((("auth"."uid"() = "id") AND ("role" = ( SELECT ("users_1"."raw_user_meta_data" ->> 'role'::"text")
   FROM "auth"."users" "users_1"
  WHERE ("users_1"."id" = "auth"."uid"())))));



CREATE POLICY "Users can update their org's empathy entries" ON "public"."empathy_entries" FOR UPDATE USING (true);



CREATE POLICY "Users can update their own media assets" ON "public"."media_assets" FOR UPDATE USING (("uploaded_by" = "auth"."uid"()));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("recipient_id" = "auth"."uid"())) WITH CHECK (("recipient_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK ((("id" = "auth"."uid"()) AND ("tenant_id" = ( SELECT "profiles_1"."tenant_id"
   FROM "public"."profiles" "profiles_1"
  WHERE ("profiles_1"."id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own recommendations" ON "public"."storyteller_recommendations" FOR UPDATE USING (("storyteller_id" = "auth"."uid"()));



CREATE POLICY "Users can update their transcripts" ON "public"."transcripts" FOR UPDATE USING ((("created_by" = "auth"."uid"()) OR ("storyteller_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."stories" "s"
  WHERE (("s"."id" = "transcripts"."story_id") AND (("s"."author_id" = "auth"."uid"()) OR ("s"."storyteller_id" = "auth"."uid"())))))));



CREATE POLICY "Users can upload media assets" ON "public"."media_assets" FOR INSERT WITH CHECK (("uploaded_by" = "auth"."uid"()));



CREATE POLICY "Users can upload media to own stories" ON "public"."story_media" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."stories"
  WHERE (("stories"."id" = "story_media"."story_id") AND ("stories"."storyteller_id" IN ( SELECT "profiles"."id"
           FROM "public"."profiles"
          WHERE ("profiles"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Users can view activities from their organization" ON "public"."activities" FOR SELECT USING (("organization_id" = ("current_setting"('app.current_organization_id'::"text", true))::"uuid"));



CREATE POLICY "Users can view audit logs for their own entities" ON "public"."audit_logs" FOR SELECT USING ((("actor_id" = "auth"."uid"()) OR ("entity_id" IN ( SELECT "stories"."id"
   FROM "public"."stories"
  WHERE (("stories"."author_id" = "auth"."uid"()) OR ("stories"."storyteller_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view distributions for their own stories" ON "public"."story_distributions" FOR SELECT USING (("story_id" IN ( SELECT "stories"."id"
   FROM "public"."stories"
  WHERE (("stories"."author_id" = "auth"."uid"()) OR ("stories"."storyteller_id" = "auth"."uid"())))));



CREATE POLICY "Users can view invitations they created" ON "public"."story_review_invitations" FOR SELECT USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can view outcomes from their organization" ON "public"."outcomes" FOR SELECT USING (("organization_id" = ("current_setting"('app.current_organization_id'::"text", true))::"uuid"));



CREATE POLICY "Users can view own profile" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view relevant jobs" ON "public"."analytics_processing_jobs" FOR SELECT USING ((("storyteller_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (('admin'::"text" = ANY ("p"."tenant_roles")) OR ('super_admin'::"text" = ANY ("p"."tenant_roles"))))))));



CREATE POLICY "Users can view service impact from their organization" ON "public"."service_impact" FOR SELECT USING (("organization_id" = ("current_setting"('app.current_organization_id'::"text", true))::"uuid"));



CREATE POLICY "Users can view their messages" ON "public"."message_recipients" FOR SELECT USING (("recipient_id" = "auth"."uid"()));



CREATE POLICY "Users can view their org's empathy entries" ON "public"."empathy_entries" FOR SELECT USING (true);



CREATE POLICY "Users can view their organization's AI usage" ON "public"."ai_usage_events" FOR SELECT USING (("organization_id" IN ( SELECT "profile_organizations"."organization_id"
   FROM "public"."profile_organizations"
  WHERE (("profile_organizations"."profile_id" = "auth"."uid"()) AND ("profile_organizations"."is_active" = true)))));



CREATE POLICY "Users can view their organization's daily usage" ON "public"."ai_usage_daily" FOR SELECT USING (("organization_id" IN ( SELECT "profile_organizations"."organization_id"
   FROM "public"."profile_organizations"
  WHERE (("profile_organizations"."profile_id" = "auth"."uid"()) AND ("profile_organizations"."is_active" = true)))));



CREATE POLICY "Users can view their own activity" ON "public"."activity_log" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own admin status" ON "public"."act_admins" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own appeals" ON "public"."moderation_appeals" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_elder" = true))))));



CREATE POLICY "Users can view their own connections" ON "public"."storyteller_connections" FOR SELECT USING ((("storyteller_a_id" = "auth"."uid"()) OR ("storyteller_b_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (('admin'::"text" = ANY ("p"."tenant_roles")) OR ('super_admin'::"text" = ANY ("p"."tenant_roles"))))))));



CREATE POLICY "Users can view their own deletion requests" ON "public"."deletion_requests" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own media assets" ON "public"."media_assets" FOR SELECT USING (("uploaded_by" = "auth"."uid"()));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("recipient_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own organization roles" ON "public"."organization_roles" FOR SELECT USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own recommendations" ON "public"."storyteller_recommendations" FOR SELECT USING ((("storyteller_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (('admin'::"text" = ANY ("p"."tenant_roles")) OR ('super_admin'::"text" = ANY ("p"."tenant_roles"))))))));



CREATE POLICY "Users can view their own safety logs" ON "public"."ai_safety_logs" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_elder" = true))))));



CREATE POLICY "Users can view their own transcription jobs" ON "public"."transcription_jobs" FOR SELECT USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can view tokens for their own stories" ON "public"."embed_tokens" FOR SELECT USING (("story_id" IN ( SELECT "stories"."id"
   FROM "public"."stories"
  WHERE (("stories"."author_id" = "auth"."uid"()) OR ("stories"."storyteller_id" = "auth"."uid"())))));



CREATE POLICY "Users can view transcripts for their media" ON "public"."transcripts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."media_assets"
  WHERE (("media_assets"."id" = "transcripts"."media_asset_id") AND ("media_assets"."uploaded_by" = "auth"."uid"())))));



CREATE POLICY "Users can view transcripts for their stories" ON "public"."transcripts" FOR SELECT USING ((("created_by" = "auth"."uid"()) OR ("storyteller_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."stories" "s"
  WHERE (("s"."id" = "transcripts"."story_id") AND (("s"."author_id" = "auth"."uid"()) OR ("s"."storyteller_id" = "auth"."uid"())))))));



ALTER TABLE "public"."act_admin_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."act_admins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."act_feature_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."act_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_agent_registry" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_analysis_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_moderation_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_safety_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_usage_daily" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_usage_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_processing_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."annual_report_stories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."annual_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audio_emotion_analysis" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audio_prosodic_analysis" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blog_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_interpretation_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_story_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."consent_change_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."content_approval_queue" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cross_narrative_insights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cross_sector_insights" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cross_sector_insights_tenant_isolation" ON "public"."cross_sector_insights" USING (("tenant_id" = (("auth"."jwt"() ->> 'tenant_id'::"text"))::"uuid"));



ALTER TABLE "public"."cultural_protocols" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cultural_speech_patterns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deletion_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dream_organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."elder_review_queue" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."embed_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."empathy_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."external_applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gallery_media" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."geographic_impact_patterns" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "geographic_impact_patterns_tenant_isolation" ON "public"."geographic_impact_patterns" USING (("tenant_id" = (("auth"."jwt"() ->> 'tenant_id'::"text"))::"uuid"));



ALTER TABLE "public"."harvested_outcomes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."impact_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."media_assets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."media_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."media_import_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."media_usage_tracking" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."message_recipients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."moderation_appeals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."moderation_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."narrative_themes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_contexts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_cross_transcript_insights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_impact_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_storyteller_network" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_theme_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."outcomes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."partner_analytics_daily" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "partner_analytics_select" ON "public"."partner_analytics_daily" FOR SELECT USING (("app_id" IN ( SELECT "partner_team_members"."app_id"
   FROM "public"."partner_team_members"
  WHERE ("partner_team_members"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."partner_messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "partner_messages_partner" ON "public"."partner_messages" USING (("app_id" IN ( SELECT "partner_team_members"."app_id"
   FROM "public"."partner_team_members"
  WHERE ("partner_team_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "partner_messages_storyteller" ON "public"."partner_messages" USING (("storyteller_id" = "auth"."uid"()));



ALTER TABLE "public"."partner_projects" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "partner_projects_insert" ON "public"."partner_projects" FOR INSERT WITH CHECK (("app_id" IN ( SELECT "partner_team_members"."app_id"
   FROM "public"."partner_team_members"
  WHERE (("partner_team_members"."user_id" = "auth"."uid"()) AND (("partner_team_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"])) OR ((("partner_team_members"."permissions" ->> 'can_manage_projects'::"text"))::boolean = true))))));



CREATE POLICY "partner_projects_select" ON "public"."partner_projects" FOR SELECT USING (("app_id" IN ( SELECT "partner_team_members"."app_id"
   FROM "public"."partner_team_members"
  WHERE ("partner_team_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "partner_projects_update" ON "public"."partner_projects" FOR UPDATE USING (("app_id" IN ( SELECT "partner_team_members"."app_id"
   FROM "public"."partner_team_members"
  WHERE (("partner_team_members"."user_id" = "auth"."uid"()) AND (("partner_team_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"])) OR ((("partner_team_members"."permissions" ->> 'can_manage_projects'::"text"))::boolean = true))))));



CREATE POLICY "partner_team_manage" ON "public"."partner_team_members" USING (("app_id" IN ( SELECT "partner_team_members_1"."app_id"
   FROM "public"."partner_team_members" "partner_team_members_1"
  WHERE (("partner_team_members_1"."user_id" = "auth"."uid"()) AND ("partner_team_members_1"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



ALTER TABLE "public"."partner_team_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "partner_team_select" ON "public"."partner_team_members" FOR SELECT USING ((("app_id" IN ( SELECT "partner_team_members_1"."app_id"
   FROM "public"."partner_team_members" "partner_team_members_1"
  WHERE ("partner_team_members_1"."user_id" = "auth"."uid"()))) OR ("user_id" = "auth"."uid"())));



ALTER TABLE "public"."partners" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform_stats_cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_analyses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "project_analyses_read" ON "public"."project_analyses" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "project_analyses"."project_id") AND (("p"."created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."profile_organizations" "po"
          WHERE (("po"."organization_id" = "p"."organization_id") AND ("po"."profile_id" = "auth"."uid"()) AND ("po"."is_active" = true)))))))));



CREATE POLICY "project_analyses_service" ON "public"."project_analyses" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



ALTER TABLE "public"."project_contexts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "project_profiles_org_access" ON "public"."project_profiles" USING ((EXISTS ( SELECT 1
   FROM ("public"."projects" "p"
     JOIN "public"."profile_organizations" "po" ON (("po"."organization_id" = "p"."organization_id")))
  WHERE (("p"."id" = "project_profiles"."project_id") AND ("po"."profile_id" = "auth"."uid"()) AND ("po"."is_active" = true)))));



CREATE POLICY "project_profiles_service" ON "public"."project_profiles" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



ALTER TABLE "public"."project_seed_interviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "project_seed_interviews_org_access" ON "public"."project_seed_interviews" USING ((EXISTS ( SELECT 1
   FROM ("public"."projects" "p"
     JOIN "public"."profile_organizations" "po" ON (("po"."organization_id" = "p"."organization_id")))
  WHERE (("p"."id" = "project_seed_interviews"."project_id") AND ("po"."profile_id" = "auth"."uid"()) AND ("po"."is_active" = true)))));



CREATE POLICY "project_seed_interviews_service" ON "public"."project_seed_interviews" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



ALTER TABLE "public"."quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."report_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."report_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."report_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ripple_effects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_impact" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sroi_calculations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sroi_inputs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sroi_outcomes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_access_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_access_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_distributions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_engagement_daily" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_engagement_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_media" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_narrative_arcs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_project_features" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_project_tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "story_requests_partner" ON "public"."story_syndication_requests" USING (("app_id" IN ( SELECT "partner_team_members"."app_id"
   FROM "public"."partner_team_members"
  WHERE ("partner_team_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "story_requests_storyteller" ON "public"."story_syndication_requests" FOR SELECT USING (("story_id" IN ( SELECT "s"."id"
   FROM "public"."stories" "s"
  WHERE (("s"."storyteller_id" = "auth"."uid"()) OR ("s"."author_id" = "auth"."uid"())))));



ALTER TABLE "public"."story_review_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_syndication_consent" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."story_syndication_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storyteller_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storyteller_connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storyteller_dashboard_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storyteller_demographics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storyteller_engagement" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storyteller_impact_metrics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "storyteller_impact_metrics_tenant_isolation" ON "public"."storyteller_impact_metrics" USING (("tenant_id" = (("auth"."jwt"() ->> 'tenant_id'::"text"))::"uuid"));



ALTER TABLE "public"."storyteller_milestones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storyteller_project_features" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storyteller_quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storyteller_recommendations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storyteller_themes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."storytelling_circle_evaluations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenant_ai_policies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."testimonials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."theme_concept_evolution" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."theme_evolution" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."theme_evolution_tracking" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "theme_evolution_tracking_tenant_isolation" ON "public"."theme_evolution_tracking" USING (("tenant_id" = (("auth"."jwt"() ->> 'tenant_id'::"text"))::"uuid"));



ALTER TABLE "public"."theory_of_change" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."title_suggestions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tour_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tour_stops" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transcription_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transcripts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."videos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."webhook_delivery_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."webhook_subscriptions" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."aggregate_daily_engagement"() TO "anon";
GRANT ALL ON FUNCTION "public"."aggregate_daily_engagement"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."aggregate_daily_engagement"() TO "service_role";



GRANT ALL ON FUNCTION "public"."approve_for_publishing"("queue_id" "uuid", "reviewer_id" "uuid", "notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_for_publishing"("queue_id" "uuid", "reviewer_id" "uuid", "notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_for_publishing"("queue_id" "uuid", "reviewer_id" "uuid", "notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."approve_story_feature"("tag_id" "uuid", "admin_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_story_feature"("tag_id" "uuid", "admin_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_story_feature"("tag_id" "uuid", "admin_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."approve_storyteller_feature"("feature_id" "uuid", "admin_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_storyteller_feature"("feature_id" "uuid", "admin_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_storyteller_feature"("feature_id" "uuid", "admin_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."archive_story"("p_story_id" "uuid", "p_archived_by" "uuid", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."archive_story"("p_story_id" "uuid", "p_archived_by" "uuid", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_story"("p_story_id" "uuid", "p_archived_by" "uuid", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_generate_video_metadata"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_generate_video_metadata"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_generate_video_metadata"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_connection_strength"("p_storyteller_a_id" "uuid", "p_storyteller_b_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_connection_strength"("p_storyteller_a_id" "uuid", "p_storyteller_b_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_connection_strength"("p_storyteller_a_id" "uuid", "p_storyteller_b_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_engagement_score"("p_storyteller_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_engagement_score"("p_storyteller_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_engagement_score"("p_storyteller_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_organization_completeness"("org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_organization_completeness"("org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_organization_completeness"("org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_organization_impact_metrics"("org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_organization_impact_metrics"("org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_organization_impact_metrics"("org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_outcome_progress"("outcome_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_outcome_progress"("outcome_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_outcome_progress"("outcome_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_sroi_outcome_value"("p_outcome_id" "uuid", "p_discount_rate" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_sroi_outcome_value"("p_outcome_id" "uuid", "p_discount_rate" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_sroi_outcome_value"("p_outcome_id" "uuid", "p_discount_rate" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_storyteller_analytics"("p_storyteller_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_storyteller_analytics"("p_storyteller_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_storyteller_analytics"("p_storyteller_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_create_share_link"("p_story_id" "uuid", "p_purpose" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."can_create_share_link"("p_story_id" "uuid", "p_purpose" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_create_share_link"("p_story_id" "uuid", "p_purpose" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_cultural_protocol"("protocol_type_param" "text", "resource_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."check_cultural_protocol"("protocol_type_param" "text", "resource_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_cultural_protocol"("protocol_type_param" "text", "resource_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_storyteller_milestones"("p_storyteller_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_storyteller_milestones"("p_storyteller_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_storyteller_milestones"("p_storyteller_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_webhook_failures"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_webhook_failures"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_webhook_failures"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_expired_tokens"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_expired_tokens"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_expired_tokens"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_notifications"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_notifications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_notifications"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_dashboard_config"("p_storyteller_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_dashboard_config"("p_storyteller_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_dashboard_config"("p_storyteller_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_dashboard_config_trigger"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_dashboard_config_trigger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_dashboard_config_trigger"() TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_profile_with_media"("p_display_name" "text", "p_full_name" "text", "p_bio" "text", "p_avatar_media_id" "uuid", "p_cover_media_id" "uuid", "p_email" "text", "p_phone_number" "text", "p_tenant_id" "uuid", "p_is_storyteller" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_with_media"("p_display_name" "text", "p_full_name" "text", "p_bio" "text", "p_avatar_media_id" "uuid", "p_cover_media_id" "uuid", "p_email" "text", "p_phone_number" "text", "p_tenant_id" "uuid", "p_is_storyteller" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_with_media"("p_display_name" "text", "p_full_name" "text", "p_bio" "text", "p_avatar_media_id" "uuid", "p_cover_media_id" "uuid", "p_email" "text", "p_phone_number" "text", "p_tenant_id" "uuid", "p_is_storyteller" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_story_like_count"("story_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_story_like_count"("story_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_story_like_count"("story_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_single_primary_media_link"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_single_primary_media_link"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_single_primary_media_link"() TO "service_role";



GRANT ALL ON FUNCTION "public"."exec"("sql" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."exec"("sql" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."exec"("sql" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."exec_sql"("sql" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."exec_sql"("sql" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."exec_sql"("sql" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."expire_pending_requests"() TO "anon";
GRANT ALL ON FUNCTION "public"."expire_pending_requests"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."expire_pending_requests"() TO "service_role";



GRANT ALL ON FUNCTION "public"."extract_descript_id"("url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."extract_descript_id"("url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."extract_descript_id"("url" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."extract_youtube_id"("url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."extract_youtube_id"("url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."extract_youtube_id"("url" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."find_collaborators"("user_tenant_id" "uuid", "skill_keywords" "text"[], "collaboration_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."find_collaborators"("user_tenant_id" "uuid", "skill_keywords" "text"[], "collaboration_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_collaborators"("user_tenant_id" "uuid", "skill_keywords" "text"[], "collaboration_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."find_storyteller_connections"("p_storyteller_id" "uuid", "p_connection_types" "text"[], "p_min_strength" numeric, "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."find_storyteller_connections"("p_storyteller_id" "uuid", "p_connection_types" "text"[], "p_min_strength" numeric, "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_storyteller_connections"("p_storyteller_id" "uuid", "p_connection_types" "text"[], "p_min_strength" numeric, "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_descript_embed"("video_id" "text", "width" "text", "height" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_descript_embed"("video_id" "text", "width" "text", "height" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_descript_embed"("video_id" "text", "width" "text", "height" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_youtube_embed"("video_id" "text", "width" "text", "height" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_youtube_embed"("video_id" "text", "width" "text", "height" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_youtube_embed"("video_id" "text", "width" "text", "height" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_database_schema"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_database_schema"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_database_schema"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_database_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_database_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_database_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_justicehub_organizations"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_justicehub_organizations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_justicehub_organizations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_justicehub_profiles"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_justicehub_profiles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_justicehub_profiles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_justicehub_projects"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_justicehub_projects"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_justicehub_projects"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_organization_stats"("org_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_organization_stats"("org_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_organization_stats"("org_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_project_context"("p_project_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_project_context"("p_project_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_project_context"("p_project_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_service_summary"("p_service_area" "text", "p_organization_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_service_summary"("p_service_area" "text", "p_organization_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_service_summary"("p_service_area" "text", "p_organization_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_stories_for_report"("org_uuid" "uuid", "year_value" integer, "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_stories_for_report"("org_uuid" "uuid", "year_value" integer, "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_stories_for_report"("org_uuid" "uuid", "year_value" integer, "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_story_media_path"("story_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_story_media_path"("story_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_story_media_path"("story_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_storyteller_dashboard_summary"("p_storyteller_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_storyteller_dashboard_summary"("p_storyteller_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_storyteller_dashboard_summary"("p_storyteller_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_storyteller_media_links"("storyteller_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_storyteller_media_links"("storyteller_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_storyteller_media_links"("storyteller_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_storyteller_recommendations"("p_storyteller_id" "uuid", "p_recommendation_types" "text"[], "p_min_relevance" numeric, "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_storyteller_recommendations"("p_storyteller_id" "uuid", "p_recommendation_types" "text"[], "p_min_relevance" numeric, "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_storyteller_recommendations"("p_storyteller_id" "uuid", "p_recommendation_types" "text"[], "p_min_relevance" numeric, "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_storyteller_syndication_stats"("p_storyteller_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_storyteller_syndication_stats"("p_storyteller_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_storyteller_syndication_stats"("p_storyteller_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_storyteller_top_themes"("p_storyteller_id" "uuid", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_storyteller_top_themes"("p_storyteller_id" "uuid", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_storyteller_top_themes"("p_storyteller_id" "uuid", "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_syndicated_stories_for_app"("target_app_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_syndicated_stories_for_app"("target_app_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_syndicated_stories_for_app"("target_app_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_table_columns"("p_table_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_table_columns"("p_table_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_table_columns"("p_table_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_table_policies"("p_table_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_table_policies"("p_table_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_table_policies"("p_table_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_table_relationships"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_table_relationships"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_table_relationships"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_transcripts_with_source_video"("org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_transcripts_with_source_video"("org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_transcripts_with_source_video"("org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_organization_role"("org_id" "uuid", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_organization_role"("org_id" "uuid", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_organization_role"("org_id" "uuid", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_storage_path"("bucket_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_storage_path"("bucket_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_storage_path"("bucket_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_tenant_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_tenant_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_tenant_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_organization_role_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_organization_role_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_organization_role_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_request_approval"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_request_approval"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_request_approval"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_distribution_view"("distribution_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_distribution_view"("distribution_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_distribution_view"("distribution_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_embed_usage"("p_token_hash" "text", "p_domain" "text", "p_ip" "inet") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_embed_usage"("p_token_hash" "text", "p_domain" "text", "p_ip" "inet") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_embed_usage"("p_token_hash" "text", "p_domain" "text", "p_ip" "inet") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_media_view_count"("asset_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_media_view_count"("asset_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_media_view_count"("asset_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_story_like_count"("story_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_story_like_count"("story_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_story_like_count"("story_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_story_share_count"("story_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_story_share_count"("story_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_story_share_count"("story_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_story_view_count"("story_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_story_view_count"("story_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_story_view_count"("story_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_template_usage"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_template_usage"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_template_usage"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_act_admin"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_act_admin"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_act_admin"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_story_syndicated"("p_story_id" "uuid", "p_app_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_story_syndicated"("p_story_id" "uuid", "p_app_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_story_syndicated"("p_story_id" "uuid", "p_app_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_activity"("p_user_id" "uuid", "p_user_name" "text", "p_user_role" "text", "p_action" "text", "p_action_category" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_entity_title" "text", "p_details" "jsonb", "p_organization_id" "uuid", "p_requires_attention" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."log_activity"("p_user_id" "uuid", "p_user_name" "text", "p_user_role" "text", "p_action" "text", "p_action_category" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_entity_title" "text", "p_details" "jsonb", "p_organization_id" "uuid", "p_requires_attention" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_activity"("p_user_id" "uuid", "p_user_name" "text", "p_user_role" "text", "p_action" "text", "p_action_category" "text", "p_entity_type" "text", "p_entity_id" "uuid", "p_entity_title" "text", "p_details" "jsonb", "p_organization_id" "uuid", "p_requires_attention" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_ready_to_publish"("entry_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_ready_to_publish"("entry_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_ready_to_publish"("entry_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."migrate_locations_from_profiles"() TO "anon";
GRANT ALL ON FUNCTION "public"."migrate_locations_from_profiles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."migrate_locations_from_profiles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."migrate_organizations_from_profiles"() TO "anon";
GRANT ALL ON FUNCTION "public"."migrate_organizations_from_profiles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."migrate_organizations_from_profiles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_elder_review_assigned"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_elder_review_assigned"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_elder_review_assigned"() TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_tenant_analytics"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_tenant_analytics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_tenant_analytics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reject_content"("queue_id" "uuid", "reviewer_id" "uuid", "reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."reject_content"("queue_id" "uuid", "reviewer_id" "uuid", "reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reject_content"("queue_id" "uuid", "reviewer_id" "uuid", "reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."restore_story"("p_story_id" "uuid", "p_restored_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."restore_story"("p_story_id" "uuid", "p_restored_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."restore_story"("p_story_id" "uuid", "p_restored_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."revoke_all_story_distributions"("p_story_id" "uuid", "p_revoked_by" "uuid", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."revoke_all_story_distributions"("p_story_id" "uuid", "p_revoked_by" "uuid", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."revoke_all_story_distributions"("p_story_id" "uuid", "p_revoked_by" "uuid", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."revoke_tokens_on_story_withdrawal"() TO "anon";
GRANT ALL ON FUNCTION "public"."revoke_tokens_on_story_withdrawal"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."revoke_tokens_on_story_withdrawal"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_schema"("p_search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_schema"("p_search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_schema"("p_search_term" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_stories"("search_query" "text", "user_tenant_id" "uuid", "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_stories"("search_query" "text", "user_tenant_id" "uuid", "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_stories"("search_query" "text", "user_tenant_id" "uuid", "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_update_org_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_update_org_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_update_org_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_update_quality_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_update_quality_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_update_quality_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_ai_usage_daily"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_ai_usage_daily"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_ai_usage_daily"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_analytics_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_analytics_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_analytics_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_blog_posts_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_blog_posts_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_blog_posts_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_cultural_safety_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_cultural_safety_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_cultural_safety_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_data_quality_metrics"("org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_data_quality_metrics"("org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_data_quality_metrics"("org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_gallery_photo_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_gallery_photo_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_gallery_photo_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_invitation_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_invitation_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_invitation_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_last_login"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_last_login"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_last_login"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_media_assets_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_media_assets_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_media_assets_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_media_link_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_media_link_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_media_link_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_organization_contexts_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_organization_contexts_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_organization_contexts_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_platform_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_platform_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_platform_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_project_analyses_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_project_analyses_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_project_analyses_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_project_contexts_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_project_contexts_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_project_contexts_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_project_profiles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_project_profiles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_project_profiles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_project_seed_interviews_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_project_seed_interviews_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_project_seed_interviews_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_project_stories_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_project_stories_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_project_stories_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_service_story_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_service_story_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_service_story_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_story_media_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_story_media_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_story_media_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_story_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_story_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_story_search_vector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_tenant_ai_usage"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_tenant_ai_usage"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_tenant_ai_usage"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_tour_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_tour_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_tour_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_transcript_search_vector"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_transcript_search_vector"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_transcript_search_vector"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_webhook_subscription_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_webhook_subscription_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_webhook_subscription_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_organization_role"("org_id" "uuid", "required_role" "public"."organization_role", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_organization_role"("org_id" "uuid", "required_role" "public"."organization_role", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_organization_role"("org_id" "uuid", "required_role" "public"."organization_role", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_role"("role_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_role"("role_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_role"("role_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_and_increment_token"("p_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_and_increment_token"("p_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_and_increment_token"("p_token" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_archive_consent"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_archive_consent"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_archive_consent"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_collaboration_settings"("data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_collaboration_settings"("data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_collaboration_settings"("data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_cultural_identity"("data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_cultural_identity"("data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_cultural_identity"("data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_cultural_protocols"("data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_cultural_protocols"("data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_cultural_protocols"("data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_default_permissions"("data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_default_permissions"("data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_default_permissions"("data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_embed_token"("p_token_hash" "text", "p_domain" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_embed_token"("p_token_hash" "text", "p_domain" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_embed_token"("p_token_hash" "text", "p_domain" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_governance_structure"("data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_governance_structure"("data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_governance_structure"("data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_role_hierarchy"("assigner_role" "public"."organization_role", "assigned_role" "public"."organization_role") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_role_hierarchy"("assigner_role" "public"."organization_role", "assigned_role" "public"."organization_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_role_hierarchy"("assigner_role" "public"."organization_role", "assigned_role" "public"."organization_role") TO "service_role";



GRANT ALL ON TABLE "public"."act_admin_permissions" TO "anon";
GRANT ALL ON TABLE "public"."act_admin_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."act_admin_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."act_admins" TO "anon";
GRANT ALL ON TABLE "public"."act_admins" TO "authenticated";
GRANT ALL ON TABLE "public"."act_admins" TO "service_role";



GRANT ALL ON TABLE "public"."act_feature_requests" TO "anon";
GRANT ALL ON TABLE "public"."act_feature_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."act_feature_requests" TO "service_role";



GRANT ALL ON TABLE "public"."act_projects" TO "anon";
GRANT ALL ON TABLE "public"."act_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."act_projects" TO "service_role";



GRANT ALL ON TABLE "public"."storyteller_project_features" TO "anon";
GRANT ALL ON TABLE "public"."storyteller_project_features" TO "authenticated";
GRANT ALL ON TABLE "public"."storyteller_project_features" TO "service_role";



GRANT ALL ON TABLE "public"."act_featured_storytellers" TO "anon";
GRANT ALL ON TABLE "public"."act_featured_storytellers" TO "authenticated";
GRANT ALL ON TABLE "public"."act_featured_storytellers" TO "service_role";



GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";



GRANT ALL ON TABLE "public"."activity_log" TO "anon";
GRANT ALL ON TABLE "public"."activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."admin_messages" TO "anon";
GRANT ALL ON TABLE "public"."admin_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_messages" TO "service_role";



GRANT ALL ON TABLE "public"."ai_agent_registry" TO "anon";
GRANT ALL ON TABLE "public"."ai_agent_registry" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_agent_registry" TO "service_role";



GRANT ALL ON TABLE "public"."ai_analysis_jobs" TO "anon";
GRANT ALL ON TABLE "public"."ai_analysis_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_analysis_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."ai_moderation_logs" TO "anon";
GRANT ALL ON TABLE "public"."ai_moderation_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_moderation_logs" TO "service_role";



GRANT ALL ON TABLE "public"."ai_processing_logs" TO "anon";
GRANT ALL ON TABLE "public"."ai_processing_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_processing_logs" TO "service_role";



GRANT ALL ON TABLE "public"."ai_safety_logs" TO "anon";
GRANT ALL ON TABLE "public"."ai_safety_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_safety_logs" TO "service_role";



GRANT ALL ON TABLE "public"."ai_usage_daily" TO "anon";
GRANT ALL ON TABLE "public"."ai_usage_daily" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_usage_daily" TO "service_role";



GRANT ALL ON TABLE "public"."ai_usage_events" TO "anon";
GRANT ALL ON TABLE "public"."ai_usage_events" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_usage_events" TO "service_role";



GRANT ALL ON TABLE "public"."analysis_jobs" TO "anon";
GRANT ALL ON TABLE "public"."analysis_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."analysis_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_processing_jobs" TO "anon";
GRANT ALL ON TABLE "public"."analytics_processing_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_processing_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."annual_report_stories" TO "anon";
GRANT ALL ON TABLE "public"."annual_report_stories" TO "authenticated";
GRANT ALL ON TABLE "public"."annual_report_stories" TO "service_role";



GRANT ALL ON TABLE "public"."annual_reports" TO "anon";
GRANT ALL ON TABLE "public"."annual_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."annual_reports" TO "service_role";



GRANT ALL ON TABLE "public"."annual_reports_with_stats" TO "anon";
GRANT ALL ON TABLE "public"."annual_reports_with_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."annual_reports_with_stats" TO "service_role";



GRANT ALL ON TABLE "public"."audio_emotion_analysis" TO "anon";
GRANT ALL ON TABLE "public"."audio_emotion_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."audio_emotion_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."audio_prosodic_analysis" TO "anon";
GRANT ALL ON TABLE "public"."audio_prosodic_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."audio_prosodic_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."blog_posts" TO "anon";
GRANT ALL ON TABLE "public"."blog_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts" TO "service_role";



GRANT ALL ON TABLE "public"."community_interpretation_sessions" TO "anon";
GRANT ALL ON TABLE "public"."community_interpretation_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."community_interpretation_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."community_story_responses" TO "anon";
GRANT ALL ON TABLE "public"."community_story_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."community_story_responses" TO "service_role";



GRANT ALL ON TABLE "public"."consent_change_log" TO "anon";
GRANT ALL ON TABLE "public"."consent_change_log" TO "authenticated";
GRANT ALL ON TABLE "public"."consent_change_log" TO "service_role";



GRANT ALL ON TABLE "public"."content_approval_queue" TO "anon";
GRANT ALL ON TABLE "public"."content_approval_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."content_approval_queue" TO "service_role";



GRANT ALL ON TABLE "public"."content_cache" TO "anon";
GRANT ALL ON TABLE "public"."content_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."content_cache" TO "service_role";



GRANT ALL ON TABLE "public"."cross_narrative_insights" TO "anon";
GRANT ALL ON TABLE "public"."cross_narrative_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."cross_narrative_insights" TO "service_role";



GRANT ALL ON TABLE "public"."cross_sector_insights" TO "anon";
GRANT ALL ON TABLE "public"."cross_sector_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."cross_sector_insights" TO "service_role";



GRANT ALL ON TABLE "public"."cultural_protocols" TO "anon";
GRANT ALL ON TABLE "public"."cultural_protocols" TO "authenticated";
GRANT ALL ON TABLE "public"."cultural_protocols" TO "service_role";



GRANT ALL ON TABLE "public"."cultural_speech_patterns" TO "anon";
GRANT ALL ON TABLE "public"."cultural_speech_patterns" TO "authenticated";
GRANT ALL ON TABLE "public"."cultural_speech_patterns" TO "service_role";



GRANT ALL ON TABLE "public"."cultural_tags" TO "anon";
GRANT ALL ON TABLE "public"."cultural_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."cultural_tags" TO "service_role";



GRANT ALL ON TABLE "public"."data_quality_metrics" TO "anon";
GRANT ALL ON TABLE "public"."data_quality_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."data_quality_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."data_sources" TO "anon";
GRANT ALL ON TABLE "public"."data_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."data_sources" TO "service_role";



GRANT ALL ON TABLE "public"."deletion_requests" TO "anon";
GRANT ALL ON TABLE "public"."deletion_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."deletion_requests" TO "service_role";



GRANT ALL ON TABLE "public"."development_plans" TO "anon";
GRANT ALL ON TABLE "public"."development_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."development_plans" TO "service_role";



GRANT ALL ON TABLE "public"."document_outcomes" TO "anon";
GRANT ALL ON TABLE "public"."document_outcomes" TO "authenticated";
GRANT ALL ON TABLE "public"."document_outcomes" TO "service_role";



GRANT ALL ON TABLE "public"."dream_organizations" TO "anon";
GRANT ALL ON TABLE "public"."dream_organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."dream_organizations" TO "service_role";



GRANT ALL ON TABLE "public"."elder_review_queue" TO "anon";
GRANT ALL ON TABLE "public"."elder_review_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."elder_review_queue" TO "service_role";



GRANT ALL ON TABLE "public"."galleries" TO "anon";
GRANT ALL ON TABLE "public"."galleries" TO "authenticated";
GRANT ALL ON TABLE "public"."galleries" TO "service_role";



GRANT ALL ON TABLE "public"."stories" TO "anon";
GRANT ALL ON TABLE "public"."stories" TO "authenticated";
GRANT ALL ON TABLE "public"."stories" TO "service_role";



GRANT ALL ON TABLE "public"."elder_review_dashboard" TO "anon";
GRANT ALL ON TABLE "public"."elder_review_dashboard" TO "authenticated";
GRANT ALL ON TABLE "public"."elder_review_dashboard" TO "service_role";



GRANT ALL ON TABLE "public"."embed_tokens" TO "anon";
GRANT ALL ON TABLE "public"."embed_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."embed_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."empathy_entries" TO "anon";
GRANT ALL ON TABLE "public"."empathy_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."empathy_entries" TO "service_role";



GRANT ALL ON TABLE "public"."empathy_sync_log" TO "anon";
GRANT ALL ON TABLE "public"."empathy_sync_log" TO "authenticated";
GRANT ALL ON TABLE "public"."empathy_sync_log" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."events_2024_01" TO "anon";
GRANT ALL ON TABLE "public"."events_2024_01" TO "authenticated";
GRANT ALL ON TABLE "public"."events_2024_01" TO "service_role";



GRANT ALL ON TABLE "public"."events_2025_08" TO "anon";
GRANT ALL ON TABLE "public"."events_2025_08" TO "authenticated";
GRANT ALL ON TABLE "public"."events_2025_08" TO "service_role";



GRANT ALL ON TABLE "public"."events_2025_09" TO "anon";
GRANT ALL ON TABLE "public"."events_2025_09" TO "authenticated";
GRANT ALL ON TABLE "public"."events_2025_09" TO "service_role";



GRANT ALL ON TABLE "public"."external_applications" TO "anon";
GRANT ALL ON TABLE "public"."external_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."external_applications" TO "service_role";



GRANT ALL ON TABLE "public"."extracted_quotes" TO "anon";
GRANT ALL ON TABLE "public"."extracted_quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."extracted_quotes" TO "service_role";



GRANT ALL ON TABLE "public"."gallery_media" TO "anon";
GRANT ALL ON TABLE "public"."gallery_media" TO "authenticated";
GRANT ALL ON TABLE "public"."gallery_media" TO "service_role";



GRANT ALL ON TABLE "public"."gallery_media_associations" TO "anon";
GRANT ALL ON TABLE "public"."gallery_media_associations" TO "authenticated";
GRANT ALL ON TABLE "public"."gallery_media_associations" TO "service_role";



GRANT ALL ON TABLE "public"."gallery_photos" TO "anon";
GRANT ALL ON TABLE "public"."gallery_photos" TO "authenticated";
GRANT ALL ON TABLE "public"."gallery_photos" TO "service_role";



GRANT ALL ON TABLE "public"."geographic_impact_patterns" TO "anon";
GRANT ALL ON TABLE "public"."geographic_impact_patterns" TO "authenticated";
GRANT ALL ON TABLE "public"."geographic_impact_patterns" TO "service_role";



GRANT ALL ON TABLE "public"."harvested_outcomes" TO "anon";
GRANT ALL ON TABLE "public"."harvested_outcomes" TO "authenticated";
GRANT ALL ON TABLE "public"."harvested_outcomes" TO "service_role";



GRANT ALL ON TABLE "public"."impact_stats" TO "anon";
GRANT ALL ON TABLE "public"."impact_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."impact_stats" TO "service_role";



GRANT ALL ON TABLE "public"."impact_stories" TO "anon";
GRANT ALL ON TABLE "public"."impact_stories" TO "authenticated";
GRANT ALL ON TABLE "public"."impact_stories" TO "service_role";



GRANT ALL ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";



GRANT ALL ON TABLE "public"."media_assets" TO "anon";
GRANT ALL ON TABLE "public"."media_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."media_assets" TO "service_role";



GRANT ALL ON TABLE "public"."media_files" TO "anon";
GRANT ALL ON TABLE "public"."media_files" TO "authenticated";
GRANT ALL ON TABLE "public"."media_files" TO "service_role";



GRANT ALL ON TABLE "public"."media_import_sessions" TO "anon";
GRANT ALL ON TABLE "public"."media_import_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."media_import_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."media_usage_tracking" TO "anon";
GRANT ALL ON TABLE "public"."media_usage_tracking" TO "authenticated";
GRANT ALL ON TABLE "public"."media_usage_tracking" TO "service_role";



GRANT ALL ON TABLE "public"."message_recipients" TO "anon";
GRANT ALL ON TABLE "public"."message_recipients" TO "authenticated";
GRANT ALL ON TABLE "public"."message_recipients" TO "service_role";



GRANT ALL ON TABLE "public"."moderation_appeals" TO "anon";
GRANT ALL ON TABLE "public"."moderation_appeals" TO "authenticated";
GRANT ALL ON TABLE "public"."moderation_appeals" TO "service_role";



GRANT ALL ON TABLE "public"."moderation_results" TO "anon";
GRANT ALL ON TABLE "public"."moderation_results" TO "authenticated";
GRANT ALL ON TABLE "public"."moderation_results" TO "service_role";



GRANT ALL ON TABLE "public"."moderation_statistics" TO "anon";
GRANT ALL ON TABLE "public"."moderation_statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."moderation_statistics" TO "service_role";



GRANT ALL ON TABLE "public"."narrative_themes" TO "anon";
GRANT ALL ON TABLE "public"."narrative_themes" TO "authenticated";
GRANT ALL ON TABLE "public"."narrative_themes" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."opportunity_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."opportunity_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."opportunity_recommendations" TO "service_role";



GRANT ALL ON TABLE "public"."organization_analytics" TO "anon";
GRANT ALL ON TABLE "public"."organization_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."organization_contexts" TO "anon";
GRANT ALL ON TABLE "public"."organization_contexts" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_contexts" TO "service_role";



GRANT ALL ON TABLE "public"."organization_cross_transcript_insights" TO "anon";
GRANT ALL ON TABLE "public"."organization_cross_transcript_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_cross_transcript_insights" TO "service_role";



GRANT ALL ON TABLE "public"."organization_duplicates" TO "anon";
GRANT ALL ON TABLE "public"."organization_duplicates" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_duplicates" TO "service_role";



GRANT ALL ON TABLE "public"."organization_enrichment" TO "anon";
GRANT ALL ON TABLE "public"."organization_enrichment" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_enrichment" TO "service_role";



GRANT ALL ON TABLE "public"."organization_impact_metrics" TO "anon";
GRANT ALL ON TABLE "public"."organization_impact_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_impact_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."organization_invitations" TO "anon";
GRANT ALL ON TABLE "public"."organization_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."organization_members" TO "anon";
GRANT ALL ON TABLE "public"."organization_members" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_members" TO "service_role";



GRANT ALL ON TABLE "public"."organization_overview" TO "anon";
GRANT ALL ON TABLE "public"."organization_overview" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_overview" TO "service_role";



GRANT ALL ON TABLE "public"."organization_roles" TO "anon";
GRANT ALL ON TABLE "public"."organization_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_roles" TO "service_role";



GRANT ALL ON TABLE "public"."organization_services" TO "anon";
GRANT ALL ON TABLE "public"."organization_services" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_services" TO "service_role";



GRANT ALL ON TABLE "public"."organization_storyteller_network" TO "anon";
GRANT ALL ON TABLE "public"."organization_storyteller_network" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_storyteller_network" TO "service_role";



GRANT ALL ON TABLE "public"."organization_theme_analytics" TO "anon";
GRANT ALL ON TABLE "public"."organization_theme_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_theme_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."outcomes" TO "anon";
GRANT ALL ON TABLE "public"."outcomes" TO "authenticated";
GRANT ALL ON TABLE "public"."outcomes" TO "service_role";



GRANT ALL ON TABLE "public"."partner_analytics_daily" TO "anon";
GRANT ALL ON TABLE "public"."partner_analytics_daily" TO "authenticated";
GRANT ALL ON TABLE "public"."partner_analytics_daily" TO "service_role";



GRANT ALL ON TABLE "public"."partner_messages" TO "anon";
GRANT ALL ON TABLE "public"."partner_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."partner_messages" TO "service_role";



GRANT ALL ON TABLE "public"."partner_projects" TO "anon";
GRANT ALL ON TABLE "public"."partner_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."partner_projects" TO "service_role";



GRANT ALL ON TABLE "public"."partner_team_members" TO "anon";
GRANT ALL ON TABLE "public"."partner_team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."partner_team_members" TO "service_role";



GRANT ALL ON TABLE "public"."story_syndication_requests" TO "anon";
GRANT ALL ON TABLE "public"."story_syndication_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."story_syndication_requests" TO "service_role";



GRANT ALL ON TABLE "public"."partner_dashboard_summary" TO "anon";
GRANT ALL ON TABLE "public"."partner_dashboard_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."partner_dashboard_summary" TO "service_role";



GRANT ALL ON TABLE "public"."partner_message_templates" TO "anon";
GRANT ALL ON TABLE "public"."partner_message_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."partner_message_templates" TO "service_role";



GRANT ALL ON TABLE "public"."partners" TO "anon";
GRANT ALL ON TABLE "public"."partners" TO "authenticated";
GRANT ALL ON TABLE "public"."partners" TO "service_role";



GRANT ALL ON TABLE "public"."personal_insights" TO "anon";
GRANT ALL ON TABLE "public"."personal_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."personal_insights" TO "service_role";



GRANT ALL ON TABLE "public"."photo_analytics" TO "anon";
GRANT ALL ON TABLE "public"."photo_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."photo_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."photo_faces" TO "anon";
GRANT ALL ON TABLE "public"."photo_faces" TO "authenticated";
GRANT ALL ON TABLE "public"."photo_faces" TO "service_role";



GRANT ALL ON TABLE "public"."photo_galleries" TO "anon";
GRANT ALL ON TABLE "public"."photo_galleries" TO "authenticated";
GRANT ALL ON TABLE "public"."photo_galleries" TO "service_role";



GRANT ALL ON TABLE "public"."photo_gallery_items" TO "anon";
GRANT ALL ON TABLE "public"."photo_gallery_items" TO "authenticated";
GRANT ALL ON TABLE "public"."photo_gallery_items" TO "service_role";



GRANT ALL ON TABLE "public"."photo_locations" TO "anon";
GRANT ALL ON TABLE "public"."photo_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."photo_locations" TO "service_role";



GRANT ALL ON TABLE "public"."photo_memories" TO "anon";
GRANT ALL ON TABLE "public"."photo_memories" TO "authenticated";
GRANT ALL ON TABLE "public"."photo_memories" TO "service_role";



GRANT ALL ON TABLE "public"."photo_organizations" TO "anon";
GRANT ALL ON TABLE "public"."photo_organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."photo_organizations" TO "service_role";



GRANT ALL ON TABLE "public"."photo_projects" TO "anon";
GRANT ALL ON TABLE "public"."photo_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."photo_projects" TO "service_role";



GRANT ALL ON TABLE "public"."photo_storytellers" TO "anon";
GRANT ALL ON TABLE "public"."photo_storytellers" TO "authenticated";
GRANT ALL ON TABLE "public"."photo_storytellers" TO "service_role";



GRANT ALL ON TABLE "public"."photo_tags" TO "anon";
GRANT ALL ON TABLE "public"."photo_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."photo_tags" TO "service_role";



GRANT ALL ON TABLE "public"."platform_analytics" TO "anon";
GRANT ALL ON TABLE "public"."platform_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."platform_stats_cache" TO "anon";
GRANT ALL ON TABLE "public"."platform_stats_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_stats_cache" TO "service_role";



GRANT ALL ON TABLE "public"."privacy_changes" TO "anon";
GRANT ALL ON TABLE "public"."privacy_changes" TO "authenticated";
GRANT ALL ON TABLE "public"."privacy_changes" TO "service_role";



GRANT ALL ON TABLE "public"."processing_jobs" TO "anon";
GRANT ALL ON TABLE "public"."processing_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."processing_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."professional_competencies" TO "anon";
GRANT ALL ON TABLE "public"."professional_competencies" TO "authenticated";
GRANT ALL ON TABLE "public"."professional_competencies" TO "service_role";



GRANT ALL ON TABLE "public"."profile_galleries" TO "anon";
GRANT ALL ON TABLE "public"."profile_galleries" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_galleries" TO "service_role";



GRANT ALL ON TABLE "public"."profile_locations" TO "anon";
GRANT ALL ON TABLE "public"."profile_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_locations" TO "service_role";



GRANT ALL ON TABLE "public"."profile_organizations" TO "anon";
GRANT ALL ON TABLE "public"."profile_organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_organizations" TO "service_role";



GRANT ALL ON TABLE "public"."profile_projects" TO "anon";
GRANT ALL ON TABLE "public"."profile_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_projects" TO "service_role";



GRANT ALL ON TABLE "public"."project_analyses" TO "anon";
GRANT ALL ON TABLE "public"."project_analyses" TO "authenticated";
GRANT ALL ON TABLE "public"."project_analyses" TO "service_role";



GRANT ALL ON TABLE "public"."project_analytics" TO "anon";
GRANT ALL ON TABLE "public"."project_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."project_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."project_contexts" TO "anon";
GRANT ALL ON TABLE "public"."project_contexts" TO "authenticated";
GRANT ALL ON TABLE "public"."project_contexts" TO "service_role";



GRANT ALL ON TABLE "public"."project_media" TO "anon";
GRANT ALL ON TABLE "public"."project_media" TO "authenticated";
GRANT ALL ON TABLE "public"."project_media" TO "service_role";



GRANT ALL ON TABLE "public"."project_organizations" TO "anon";
GRANT ALL ON TABLE "public"."project_organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."project_organizations" TO "service_role";



GRANT ALL ON TABLE "public"."project_participants" TO "anon";
GRANT ALL ON TABLE "public"."project_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."project_participants" TO "service_role";



GRANT ALL ON TABLE "public"."project_profiles" TO "anon";
GRANT ALL ON TABLE "public"."project_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."project_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."project_seed_interviews" TO "anon";
GRANT ALL ON TABLE "public"."project_seed_interviews" TO "authenticated";
GRANT ALL ON TABLE "public"."project_seed_interviews" TO "service_role";



GRANT ALL ON TABLE "public"."project_storytellers" TO "anon";
GRANT ALL ON TABLE "public"."project_storytellers" TO "authenticated";
GRANT ALL ON TABLE "public"."project_storytellers" TO "service_role";



GRANT ALL ON TABLE "public"."project_updates" TO "anon";
GRANT ALL ON TABLE "public"."project_updates" TO "authenticated";
GRANT ALL ON TABLE "public"."project_updates" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."quotes" TO "anon";
GRANT ALL ON TABLE "public"."quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."quotes" TO "service_role";



GRANT ALL ON TABLE "public"."report_feedback" TO "anon";
GRANT ALL ON TABLE "public"."report_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."report_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."report_sections" TO "anon";
GRANT ALL ON TABLE "public"."report_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."report_sections" TO "service_role";



GRANT ALL ON TABLE "public"."report_templates" TO "anon";
GRANT ALL ON TABLE "public"."report_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."report_templates" TO "service_role";



GRANT ALL ON TABLE "public"."ripple_effects" TO "anon";
GRANT ALL ON TABLE "public"."ripple_effects" TO "authenticated";
GRANT ALL ON TABLE "public"."ripple_effects" TO "service_role";



GRANT ALL ON TABLE "public"."scraped_services" TO "anon";
GRANT ALL ON TABLE "public"."scraped_services" TO "authenticated";
GRANT ALL ON TABLE "public"."scraped_services" TO "service_role";



GRANT ALL ON TABLE "public"."scraper_health_metrics" TO "anon";
GRANT ALL ON TABLE "public"."scraper_health_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."scraper_health_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."scraping_metadata" TO "anon";
GRANT ALL ON TABLE "public"."scraping_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."scraping_metadata" TO "service_role";



GRANT ALL ON TABLE "public"."service_impact" TO "anon";
GRANT ALL ON TABLE "public"."service_impact" TO "authenticated";
GRANT ALL ON TABLE "public"."service_impact" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."sroi_calculations" TO "anon";
GRANT ALL ON TABLE "public"."sroi_calculations" TO "authenticated";
GRANT ALL ON TABLE "public"."sroi_calculations" TO "service_role";



GRANT ALL ON TABLE "public"."sroi_inputs" TO "anon";
GRANT ALL ON TABLE "public"."sroi_inputs" TO "authenticated";
GRANT ALL ON TABLE "public"."sroi_inputs" TO "service_role";



GRANT ALL ON TABLE "public"."sroi_outcomes" TO "anon";
GRANT ALL ON TABLE "public"."sroi_outcomes" TO "authenticated";
GRANT ALL ON TABLE "public"."sroi_outcomes" TO "service_role";



GRANT ALL ON TABLE "public"."stories_with_trust_indicators" TO "anon";
GRANT ALL ON TABLE "public"."stories_with_trust_indicators" TO "authenticated";
GRANT ALL ON TABLE "public"."stories_with_trust_indicators" TO "service_role";



GRANT ALL ON TABLE "public"."story_access_log" TO "anon";
GRANT ALL ON TABLE "public"."story_access_log" TO "authenticated";
GRANT ALL ON TABLE "public"."story_access_log" TO "service_role";



GRANT ALL ON TABLE "public"."story_access_tokens" TO "anon";
GRANT ALL ON TABLE "public"."story_access_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."story_access_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."story_distributions" TO "anon";
GRANT ALL ON TABLE "public"."story_distributions" TO "authenticated";
GRANT ALL ON TABLE "public"."story_distributions" TO "service_role";



GRANT ALL ON TABLE "public"."story_engagement_daily" TO "anon";
GRANT ALL ON TABLE "public"."story_engagement_daily" TO "authenticated";
GRANT ALL ON TABLE "public"."story_engagement_daily" TO "service_role";



GRANT ALL ON TABLE "public"."story_engagement_events" TO "anon";
GRANT ALL ON TABLE "public"."story_engagement_events" TO "authenticated";
GRANT ALL ON TABLE "public"."story_engagement_events" TO "service_role";



GRANT ALL ON TABLE "public"."story_images" TO "anon";
GRANT ALL ON TABLE "public"."story_images" TO "authenticated";
GRANT ALL ON TABLE "public"."story_images" TO "service_role";



GRANT ALL ON TABLE "public"."story_media" TO "anon";
GRANT ALL ON TABLE "public"."story_media" TO "authenticated";
GRANT ALL ON TABLE "public"."story_media" TO "service_role";



GRANT ALL ON TABLE "public"."story_narrative_arcs" TO "anon";
GRANT ALL ON TABLE "public"."story_narrative_arcs" TO "authenticated";
GRANT ALL ON TABLE "public"."story_narrative_arcs" TO "service_role";



GRANT ALL ON TABLE "public"."story_project_features" TO "anon";
GRANT ALL ON TABLE "public"."story_project_features" TO "authenticated";
GRANT ALL ON TABLE "public"."story_project_features" TO "service_role";



GRANT ALL ON TABLE "public"."story_project_tags" TO "anon";
GRANT ALL ON TABLE "public"."story_project_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."story_project_tags" TO "service_role";



GRANT ALL ON TABLE "public"."story_review_invitations" TO "anon";
GRANT ALL ON TABLE "public"."story_review_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."story_review_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."story_syndication_consent" TO "anon";
GRANT ALL ON TABLE "public"."story_syndication_consent" TO "authenticated";
GRANT ALL ON TABLE "public"."story_syndication_consent" TO "service_role";



GRANT ALL ON TABLE "public"."storyteller_analytics" TO "anon";
GRANT ALL ON TABLE "public"."storyteller_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."storyteller_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."storyteller_connections" TO "anon";
GRANT ALL ON TABLE "public"."storyteller_connections" TO "authenticated";
GRANT ALL ON TABLE "public"."storyteller_connections" TO "service_role";



GRANT ALL ON TABLE "public"."storyteller_dashboard_config" TO "anon";
GRANT ALL ON TABLE "public"."storyteller_dashboard_config" TO "authenticated";
GRANT ALL ON TABLE "public"."storyteller_dashboard_config" TO "service_role";



GRANT ALL ON TABLE "public"."storyteller_demographics" TO "anon";
GRANT ALL ON TABLE "public"."storyteller_demographics" TO "authenticated";
GRANT ALL ON TABLE "public"."storyteller_demographics" TO "service_role";



GRANT ALL ON TABLE "public"."storyteller_engagement" TO "anon";
GRANT ALL ON TABLE "public"."storyteller_engagement" TO "authenticated";
GRANT ALL ON TABLE "public"."storyteller_engagement" TO "service_role";



GRANT ALL ON TABLE "public"."storyteller_impact_metrics" TO "anon";
GRANT ALL ON TABLE "public"."storyteller_impact_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."storyteller_impact_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."storyteller_locations" TO "anon";
GRANT ALL ON TABLE "public"."storyteller_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."storyteller_locations" TO "service_role";



GRANT ALL ON TABLE "public"."storyteller_media_links" TO "anon";
GRANT ALL ON TABLE "public"."storyteller_media_links" TO "authenticated";
GRANT ALL ON TABLE "public"."storyteller_media_links" TO "service_role";



GRANT ALL ON TABLE "public"."storyteller_milestones" TO "anon";
GRANT ALL ON TABLE "public"."storyteller_milestones" TO "authenticated";
GRANT ALL ON TABLE "public"."storyteller_milestones" TO "service_role";



GRANT ALL ON TABLE "public"."storyteller_organizations" TO "anon";
GRANT ALL ON TABLE "public"."storyteller_organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."storyteller_organizations" TO "service_role";



GRANT ALL ON TABLE "public"."storyteller_projects" TO "anon";
GRANT ALL ON TABLE "public"."storyteller_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."storyteller_projects" TO "service_role";



GRANT ALL ON TABLE "public"."storyteller_quotes" TO "anon";
GRANT ALL ON TABLE "public"."storyteller_quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."storyteller_quotes" TO "service_role";



GRANT ALL ON TABLE "public"."storyteller_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."storyteller_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."storyteller_recommendations" TO "service_role";



GRANT ALL ON TABLE "public"."storyteller_themes" TO "anon";
GRANT ALL ON TABLE "public"."storyteller_themes" TO "authenticated";
GRANT ALL ON TABLE "public"."storyteller_themes" TO "service_role";



GRANT ALL ON TABLE "public"."storytelling_circle_evaluations" TO "anon";
GRANT ALL ON TABLE "public"."storytelling_circle_evaluations" TO "authenticated";
GRANT ALL ON TABLE "public"."storytelling_circle_evaluations" TO "service_role";



GRANT ALL ON TABLE "public"."syndicated_stories" TO "anon";
GRANT ALL ON TABLE "public"."syndicated_stories" TO "authenticated";
GRANT ALL ON TABLE "public"."syndicated_stories" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."tenant_ai_policies" TO "anon";
GRANT ALL ON TABLE "public"."tenant_ai_policies" TO "authenticated";
GRANT ALL ON TABLE "public"."tenant_ai_policies" TO "service_role";



GRANT ALL ON TABLE "public"."tenants" TO "anon";
GRANT ALL ON TABLE "public"."tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants" TO "service_role";



GRANT ALL ON TABLE "public"."tenant_analytics" TO "anon";
GRANT ALL ON TABLE "public"."tenant_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."tenant_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."testimonials" TO "anon";
GRANT ALL ON TABLE "public"."testimonials" TO "authenticated";
GRANT ALL ON TABLE "public"."testimonials" TO "service_role";



GRANT ALL ON TABLE "public"."theme_associations" TO "anon";
GRANT ALL ON TABLE "public"."theme_associations" TO "authenticated";
GRANT ALL ON TABLE "public"."theme_associations" TO "service_role";



GRANT ALL ON TABLE "public"."theme_concept_evolution" TO "anon";
GRANT ALL ON TABLE "public"."theme_concept_evolution" TO "authenticated";
GRANT ALL ON TABLE "public"."theme_concept_evolution" TO "service_role";



GRANT ALL ON TABLE "public"."theme_evolution" TO "anon";
GRANT ALL ON TABLE "public"."theme_evolution" TO "authenticated";
GRANT ALL ON TABLE "public"."theme_evolution" TO "service_role";



GRANT ALL ON TABLE "public"."theme_evolution_tracking" TO "anon";
GRANT ALL ON TABLE "public"."theme_evolution_tracking" TO "authenticated";
GRANT ALL ON TABLE "public"."theme_evolution_tracking" TO "service_role";



GRANT ALL ON TABLE "public"."themes" TO "anon";
GRANT ALL ON TABLE "public"."themes" TO "authenticated";
GRANT ALL ON TABLE "public"."themes" TO "service_role";



GRANT ALL ON TABLE "public"."theory_of_change" TO "anon";
GRANT ALL ON TABLE "public"."theory_of_change" TO "authenticated";
GRANT ALL ON TABLE "public"."theory_of_change" TO "service_role";



GRANT ALL ON TABLE "public"."title_suggestions" TO "anon";
GRANT ALL ON TABLE "public"."title_suggestions" TO "authenticated";
GRANT ALL ON TABLE "public"."title_suggestions" TO "service_role";



GRANT ALL ON TABLE "public"."tour_requests" TO "anon";
GRANT ALL ON TABLE "public"."tour_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."tour_requests" TO "service_role";



GRANT ALL ON TABLE "public"."tour_stops" TO "anon";
GRANT ALL ON TABLE "public"."tour_stops" TO "authenticated";
GRANT ALL ON TABLE "public"."tour_stops" TO "service_role";



GRANT ALL ON TABLE "public"."transcription_jobs" TO "anon";
GRANT ALL ON TABLE "public"."transcription_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."transcription_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."transcripts" TO "anon";
GRANT ALL ON TABLE "public"."transcripts" TO "authenticated";
GRANT ALL ON TABLE "public"."transcripts" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."users_public" TO "anon";
GRANT ALL ON TABLE "public"."users_public" TO "authenticated";
GRANT ALL ON TABLE "public"."users_public" TO "service_role";



GRANT ALL ON TABLE "public"."v_agent_usage_stats" TO "anon";
GRANT ALL ON TABLE "public"."v_agent_usage_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."v_agent_usage_stats" TO "service_role";



GRANT ALL ON TABLE "public"."v_tenant_ai_usage_summary" TO "anon";
GRANT ALL ON TABLE "public"."v_tenant_ai_usage_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."v_tenant_ai_usage_summary" TO "service_role";



GRANT ALL ON TABLE "public"."videos" TO "anon";
GRANT ALL ON TABLE "public"."videos" TO "authenticated";
GRANT ALL ON TABLE "public"."videos" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_delivery_log" TO "anon";
GRANT ALL ON TABLE "public"."webhook_delivery_log" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_delivery_log" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."webhook_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_subscriptions" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






