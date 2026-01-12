-- RPC Bypass for Story Creation
-- This bypasses PostgREST's schema cache by using a stored procedure
-- Run this in Supabase SQL Editor

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS insert_story(jsonb);

-- Create the story insertion function
CREATE OR REPLACE FUNCTION insert_story(story_data jsonb)
RETURNS jsonb AS $$
DECLARE
  new_story_id uuid;
  result jsonb;
BEGIN
  -- Insert the story
  INSERT INTO stories (
    title,
    content,
    article_type,
    slug,
    meta_title,
    meta_description,
    featured_image_id,
    syndication_destinations,
    tags,
    themes,
    status,
    visibility,
    author_id,
    story_type,
    audience,
    cultural_sensitivity_level,
    elder_approval_required,
    cultural_review_required,
    location,
    cultural_context,
    featured,
    storyteller_id,
    organization_id,
    tenant_id,
    created_at,
    updated_at
  )
  VALUES (
    story_data->>'title',
    story_data->>'content',
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
    CASE
      WHEN story_data->'tags' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(story_data->'tags'))
      ELSE ARRAY[]::text[]
    END,
    CASE
      WHEN story_data->'themes' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(story_data->'themes'))
      ELSE ARRAY[]::text[]
    END,
    COALESCE(story_data->>'status', 'draft'),
    COALESCE(story_data->>'visibility', 'private'),
    (story_data->>'author_id')::uuid,
    story_data->>'story_type',
    story_data->>'audience',
    story_data->>'cultural_sensitivity_level',
    COALESCE((story_data->>'elder_approval_required')::boolean, false),
    COALESCE((story_data->>'cultural_review_required')::boolean, false),
    story_data->>'location',
    story_data->>'cultural_context',
    COALESCE((story_data->>'featured')::boolean, false),
    (story_data->>'storyteller_id')::uuid,
    (story_data->>'organization_id')::uuid,
    (story_data->>'tenant_id')::uuid,
    NOW(),
    NOW()
  )
  RETURNING id INTO new_story_id;

  -- Build the result object
  SELECT jsonb_build_object(
    'id', new_story_id,
    'created_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_story(jsonb) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION insert_story(jsonb) IS
  'Temporary workaround for PostgREST schema cache issue.
   Bypasses cache by directly inserting stories via RPC.
   Remove this function once PostgREST cache is fixed.';

-- Test the function (optional)
-- SELECT insert_story('{"title": "Test", "content": "Test content", "author_id": "00000000-0000-0000-0000-000000000000", "status": "draft", "visibility": "private"}'::jsonb);
