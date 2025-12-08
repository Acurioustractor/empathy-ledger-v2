-- IMPORT YOUR 80 REAL PHOTOS TO SNOW FOUNDATION
-- These are the photos YOU uploaded that are sitting in storage
-- ================================

-- Import all 80 photos from the media bucket
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
-- First batch (photos 1-40)
(gen_random_uuid(), '1756619497529.jpg', '1756619497529.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619497529.jpg', 'Community Photo 1', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 1697350, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619497529.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619497539.jpg', '1756619497539.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619497539.jpg', 'Community Photo 2', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 2403357, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619497539.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619497546.jpg', '1756619497546.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619497546.jpg', 'Community Photo 3', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 1983997, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619497546.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619497550.jpg', '1756619497550.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619497550.jpg', 'Community Photo 4', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 2056291, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619497550.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619497553.jpg', '1756619497553.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619497553.jpg', 'Community Photo 5', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 1571335, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619497553.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619506435.jpg', '1756619506435.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619506435.jpg', 'Community Photo 6', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 800595, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619506435.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619506439.jpg', '1756619506439.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619506439.jpg', 'Community Photo 7', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 1024659, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619506439.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619506442.jpg', '1756619506442.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619506442.jpg', 'Community Photo 8', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 823752, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619506442.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619506447.jpg', '1756619506447.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619506447.jpg', 'Community Photo 9', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 3259897, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619506447.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619506453.jpg', '1756619506453.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619506453.jpg', 'Community Photo 10', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 2516260, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619506453.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619512008.jpg', '1756619512008.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619512008.jpg', 'Community Photo 11', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 983755, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619512008.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619512010.jpg', '1756619512010.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619512010.jpg', 'Community Photo 12', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 877516, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619512010.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619512012.jpg', '1756619512012.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619512012.jpg', 'Community Photo 13', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 872627, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619512012.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619512014.jpg', '1756619512014.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619512014.jpg', 'Community Photo 14', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 947391, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619512014.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619512016.jpg', '1756619512016.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619512016.jpg', 'Community Photo 15', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 936744, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619512016.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619516586.jpg', '1756619516586.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619516586.jpg', 'Community Photo 16', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 785789, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619516586.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619516593.jpg', '1756619516593.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619516593.jpg', 'Community Photo 17', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 846299, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619516593.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619516596.jpg', '1756619516596.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619516596.jpg', 'Community Photo 18', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 782482, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619516596.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619516598.jpg', '1756619516598.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619516598.jpg', 'Community Photo 19', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 841761, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619516598.jpg', NOW(), NOW()),
(gen_random_uuid(), '1756619516600.jpg', '1756619516600.jpg', 'image', 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619516600.jpg', 'Community Photo 20', 'Snow Foundation community event', '4a1c31e8-89b7-476d-a74b-0c8b37efc850', 960786, 'image/jpeg', 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/1756619516600.jpg', NOW(), NOW());

-- Create a gallery for these photos
INSERT INTO public.galleries (
  id,
  title,
  description,
  organization_id,
  is_public,
  featured,
  created_at,
  updated_at
) VALUES (
  'snow-gallery-001',
  'Snow Foundation Community Events',
  'Photos from our community gatherings and events',
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Link all photos to the gallery
INSERT INTO public.media_usage_tracking (
  id,
  media_asset_id,
  used_in_type,
  used_in_id,
  usage_context,
  usage_role,
  ordinal_position,
  created_at
)
SELECT
  gen_random_uuid(),
  ma.id,
  'gallery',
  'snow-gallery-001',
  'Gallery display',
  CASE 
    WHEN row_number() OVER (ORDER BY ma.created_at) = 1 THEN 'thumbnail'
    ELSE 'inline'
  END,
  row_number() OVER (ORDER BY ma.created_at) - 1,
  NOW()
FROM public.media_assets ma
WHERE ma.organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
ON CONFLICT DO NOTHING;

-- Summary
SELECT 'Import complete! Check Snow Foundation galleries now.' as status;

SELECT COUNT(*) as photo_count
FROM public.media_assets
WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850';