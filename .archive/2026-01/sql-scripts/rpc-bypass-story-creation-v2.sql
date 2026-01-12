-- RPC Bypass for Story Creation - Updated for Actual Schema
-- This matches the ACTUAL columns in your stories table

DROP FUNCTION IF EXISTS insert_story(jsonb);

CREATE OR REPLACE FUNCTION insert_story(story_data jsonb)
RETURNS jsonb AS $$
DECLARE
  new_story_id uuid;
  result jsonb;
BEGIN
  INSERT INTO stories (
    -- Required fields
    title,
    content,
    tenant_id,
    author_id,

    -- New editorial fields (after migration)
    article_type,
    slug,
    meta_title,
    meta_description,
    featured_image_id,
    syndication_destinations,
    audience,

    -- Existing fields
    summary,
    status,
    story_type,
    privacy_level,
    cultural_sensitivity_level,
    tags,
    themes,
    location,
    storyteller_id,
    organization_id,
    project_id,
    has_explicit_consent,
    requires_elder_review,
    language,
    enable_ai_processing,
    notify_community,

    -- Timestamps
    created_at,
    updated_at
  )
  VALUES (
    -- Required
    story_data->>'title',
    story_data->>'content',
    COALESCE((story_data->>'tenant_id')::uuid, (SELECT id FROM tenants LIMIT 1)),
    (story_data->>'author_id')::uuid,

    -- New editorial fields
    story_data->>'article_type',
    story_data->>'slug',
    story_data->>'meta_title',
    story_data->>'meta_description',
    (story_data->>'featured_image_id')::uuid,
    CASE
      WHEN story_data->'syndication_destinations' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(story_data->'syndication_destinations'))
      ELSE ARRAY[]::text[]
    END,
    story_data->>'audience',

    -- Existing fields
    COALESCE(story_data->>'summary', story_data->>'excerpt'),
    COALESCE(story_data->>'status', 'draft'),
    story_data->>'story_type',
    COALESCE(story_data->>'privacy_level', story_data->>'visibility', 'private'),
    story_data->>'cultural_sensitivity_level',
    -- tags: convert from JSON array to TEXT[]
    CASE
      WHEN story_data->'tags' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(story_data->'tags'))
      ELSE ARRAY[]::text[]
    END,
    -- themes: keep as JSONB (convert from array to JSONB array)
    CASE
      WHEN story_data->'themes' IS NOT NULL
      THEN story_data->'themes'
      ELSE '[]'::jsonb
    END,
    story_data->>'location',
    (story_data->>'storyteller_id')::uuid,
    (story_data->>'organization_id')::uuid,
    (story_data->>'project_id')::uuid,
    COALESCE((story_data->>'has_explicit_consent')::boolean, true),
    COALESCE((story_data->>'requires_elder_review')::boolean, false),
    COALESCE(story_data->>'language', 'en'),
    COALESCE((story_data->>'enable_ai_processing')::boolean, true),
    COALESCE((story_data->>'notify_community')::boolean, true),

    -- Timestamps
    NOW(),
    NOW()
  )
  RETURNING id INTO new_story_id;

  -- Return result
  SELECT jsonb_build_object(
    'id', new_story_id,
    'created_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION insert_story(jsonb) TO authenticated;

COMMENT ON FUNCTION insert_story(jsonb) IS
  'Temporary workaround for PostgREST schema cache issue.
   Bypasses cache by directly inserting stories via RPC.
   Remove this function once PostgREST cache is fixed.';
