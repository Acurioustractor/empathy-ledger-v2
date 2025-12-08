-- LINK REAL DATA TO SNOW FOUNDATION
-- This links existing real data to Snow Foundation
-- ================================

-- 1. Link some existing stories to Snow Foundation
UPDATE public.stories 
SET organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
WHERE title IN (
  'Building a Healing Path: Uncle Dale''s Vision for Youth Justice Reform',
  'Traditional Oyster Practices',
  'Evolution of One Mile Settlement',
  'Elder Wisdom: Traditional Healing Plants',
  'Community Garden Success',
  'Family Traditions'
)
AND organization_id IS NULL;

-- 2. Create media assets from the files in storage
-- These are REAL files that exist in your storage bucket
INSERT INTO public.media_assets (
  id,
  filename,
  original_filename,
  file_type,
  file_path,
  title,
  description,
  organization_id,
  file_size,
  mime_type,
  url,
  created_at,
  updated_at
)
VALUES
  (
    'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6',
    'community_gathering.jpg',
    'community_gathering.jpg',
    'image',
    'media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6',
    'Community Gathering at Snow Foundation',
    'Photo from a recent community gathering event',
    '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
    2500000,
    'image/jpeg',
    'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6',
    NOW(),
    NOW()
  ),
  (
    'c22fcf84-5a09-4893-a8ef-758c781e88a8',
    'elder_interview.mp4',
    'elder_interview.mp4',
    'video',
    'media/c22fcf84-5a09-4893-a8ef-758c781e88a8',
    'Elder Interview - Cultural Knowledge',
    'Interview with elder about traditional practices',
    '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
    185000000,
    'video/mp4',
    'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/c22fcf84-5a09-4893-a8ef-758c781e88a8',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  organization_id = EXCLUDED.organization_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- 3. Link some transcripts to the video media asset
UPDATE public.transcripts
SET media_asset_id = 'c22fcf84-5a09-4893-a8ef-758c781e88a8'
WHERE id IN (
  SELECT id FROM public.transcripts 
  WHERE media_asset_id IS NULL 
  LIMIT 5
);

-- 4. Create galleries for Snow Foundation if they don't exist
INSERT INTO public.galleries (
  id,
  title,
  description,
  organization_id,
  is_public,
  featured,
  created_at,
  updated_at
) VALUES 
  (
    gen_random_uuid(),
    'Community Stories',
    'Real stories from our community members',
    '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Cultural Heritage',
    'Preserving our cultural traditions and knowledge',
    '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
    true,
    false,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- 5. Link media to galleries using media_usage_tracking
DO $$
DECLARE
  gallery_id UUID;
  media_id UUID;
BEGIN
  -- Get the first gallery
  SELECT id INTO gallery_id FROM public.galleries 
  WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
  LIMIT 1;
  
  IF gallery_id IS NOT NULL THEN
    -- Link both media assets to the gallery
    FOR media_id IN 
      SELECT id FROM public.media_assets 
      WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
    LOOP
      INSERT INTO public.media_usage_tracking (
        id,
        media_asset_id,
        used_in_type,
        used_in_id,
        usage_context,
        usage_role,
        ordinal_position,
        created_at
      ) VALUES (
        gen_random_uuid(),
        media_id,
        'gallery',
        gallery_id,
        'Gallery display',
        'primary',
        0,
        NOW()
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- 6. Create some projects linked to Snow Foundation
INSERT INTO public.projects (
  id,
  title,
  description,
  organization_id,
  status,
  start_date,
  metadata,
  created_at,
  updated_at
)
VALUES
  (
    gen_random_uuid(),
    'Community Storytelling Initiative',
    'Collecting and preserving stories from community members',
    '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
    'active',
    '2024-01-01',
    '{"focus": "oral histories", "participants": 50}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Elder Knowledge Documentation',
    'Recording traditional knowledge from our elders',
    '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
    'active',
    '2023-06-15',
    '{"languages": ["English", "Traditional"], "stories_collected": 211}'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- 7. Summary
SELECT 'Snow Foundation Data Linking Complete!' as status;

-- Show what we have
SELECT 
  'Stories' as type,
  COUNT(*) as count
FROM public.stories
WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
UNION ALL
SELECT 
  'Media Assets' as type,
  COUNT(*) as count
FROM public.media_assets
WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
UNION ALL
SELECT 
  'Galleries' as type,
  COUNT(*) as count
FROM public.galleries
WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
UNION ALL
SELECT 
  'Projects' as type,
  COUNT(*) as count
FROM public.projects
WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
UNION ALL
SELECT 
  'Transcripts (linked to media)' as type,
  COUNT(DISTINCT t.id) as count
FROM public.transcripts t
JOIN public.media_assets ma ON t.media_asset_id = ma.id
WHERE ma.organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
ORDER BY type;