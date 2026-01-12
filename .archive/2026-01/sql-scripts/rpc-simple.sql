-- Simple RPC that only uses confirmed existing columns
DROP FUNCTION IF EXISTS insert_story(jsonb);

CREATE OR REPLACE FUNCTION insert_story(story_data jsonb)
RETURNS jsonb AS $$
DECLARE
  new_story_id uuid;
  new_tenant_id uuid;
BEGIN
  -- Get or create default tenant
  SELECT id INTO new_tenant_id FROM tenants LIMIT 1;

  IF new_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant found in database';
  END IF;

  INSERT INTO stories (
    tenant_id,
    author_id,
    title,
    content,
    article_type,
    slug,
    meta_title,
    meta_description,
    featured_image_id,
    syndication_destinations,
    audience,
    tags,
    themes,
    status,
    privacy_level
  )
  VALUES (
    COALESCE((story_data->>'tenant_id')::uuid, new_tenant_id),
    (story_data->>'author_id')::uuid,
    story_data->>'title',
    story_data->>'content',
    story_data->>'article_type',
    story_data->>'slug',
    story_data->>'meta_title',
    story_data->>'meta_description',
    (story_data->>'featured_image_id')::uuid,
    CASE WHEN story_data->'syndication_destinations' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(story_data->'syndication_destinations'))
      ELSE ARRAY[]::text[] END,
    story_data->>'audience',
    CASE WHEN story_data->'tags' IS NOT NULL
      THEN ARRAY(SELECT jsonb_array_elements_text(story_data->'tags'))
      ELSE ARRAY[]::text[] END,
    CASE WHEN story_data->'themes' IS NOT NULL
      THEN story_data->'themes'
      ELSE '[]'::jsonb END,
    COALESCE(story_data->>'status', 'draft'),
    COALESCE(story_data->>'privacy_level', story_data->>'visibility', 'private')
  )
  RETURNING id INTO new_story_id;

  RETURN jsonb_build_object('id', new_story_id, 'created_at', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION insert_story(jsonb) TO PUBLIC;
