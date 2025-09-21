-- COMPLETE SNOW FOUNDATION DATA SETUP
-- This SQL directly creates all the data we need
-- ================================

-- 1. First add any missing columns (safe - uses IF NOT EXISTS)
ALTER TABLE public.galleries 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

ALTER TABLE public.galleries 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

ALTER TABLE public.galleries 
ADD COLUMN IF NOT EXISTS cover_image TEXT;

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS has_explicit_consent BOOLEAN DEFAULT true;

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS consent_details JSONB;

ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS cultural_sensitivity_level TEXT DEFAULT 'general';

-- 2. Create Galleries for Snow Foundation
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
    'Elder Wisdom Collection',
    'Portraits and stories from our knowledge keepers who carry the wisdom of generations',
    '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Youth Voices',
    'Creative expressions and stories from the next generation of Indigenous leaders',
    '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Land and Water',
    'Visual stories of our sacred connection to traditional territories and waterways',
    '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
    true,
    false,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'Deadly Hearts Trek',
    'Documentation of our community heart health initiative combining traditional and modern wellness',
    '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
    true,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- 3. Create Media Assets for Snow Foundation
-- Note: Adjusting to match your actual schema
INSERT INTO public.media_assets (
  id,
  filename,
  original_filename,
  file_type,
  file_path,
  title,
  description,
  organization_id,
  story_id,
  file_size,
  mime_type,
  url,
  metadata,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid() as id,
  'elder_mary_portrait.jpg' as filename,
  'elder_mary_portrait.jpg' as original_filename,
  'image' as file_type,
  '/media/snow-foundation/elder_mary_portrait.jpg' as file_path,
  'Elder Mary Snowbird - Knowledge Keeper' as title,
  'Portrait of Elder Mary Snowbird, Cree Nation knowledge keeper and traditional storyteller' as description,
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850' as organization_id,
  NULL as story_id,
  3500000 as file_size,
  'image/jpeg' as mime_type,
  'https://storage.placeholder.com/elder_mary_portrait.jpg' as url,
  '{"tags": ["elder", "portrait", "cree"], "photographer": "Benjamin Knight"}'::jsonb as metadata,
  NOW() as created_at,
  NOW() as updated_at
WHERE NOT EXISTS (
  SELECT 1 FROM public.media_assets WHERE filename = 'elder_mary_portrait.jpg'
)
UNION ALL
SELECT 
  gen_random_uuid(),
  'seven_teachings_ceremony.mp4',
  'seven_teachings_ceremony.mp4',
  'video',
  '/media/snow-foundation/seven_teachings_ceremony.mp4',
  'Seven Sacred Teachings Ceremony',
  'Elder William Running Water leads a ceremony explaining the Seven Sacred Teachings',
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
  NULL,
  285000000,
  'video/mp4',
  'https://storage.placeholder.com/seven_teachings_ceremony.mp4',
  '{"tags": ["ceremony", "teachings", "video"], "duration": 1800, "has_transcript": true}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.media_assets WHERE filename = 'seven_teachings_ceremony.mp4'
)
UNION ALL
SELECT 
  gen_random_uuid(),
  'youth_drumming_circle.mp3',
  'youth_drumming_circle.mp3',
  'audio',
  '/media/snow-foundation/youth_drumming_circle.mp3',
  'Youth Drumming Circle',
  'Recording of youth learning traditional drumming and songs',
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
  NULL,
  45000000,
  'audio/mp3',
  'https://storage.placeholder.com/youth_drumming_circle.mp3',
  '{"tags": ["audio", "drumming", "youth"], "duration": 900, "has_transcript": true}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.media_assets WHERE filename = 'youth_drumming_circle.mp3'
)
UNION ALL
SELECT 
  gen_random_uuid(),
  'medicine_wheel_teaching.jpg',
  'medicine_wheel_teaching.jpg',
  'image',
  '/media/snow-foundation/medicine_wheel_teaching.jpg',
  'Medicine Wheel Teaching Diagram',
  'Visual representation of the Medicine Wheel teachings',
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
  NULL,
  2800000,
  'image/jpeg',
  'https://storage.placeholder.com/medicine_wheel_teaching.jpg',
  '{"tags": ["medicine-wheel", "teachings", "diagram"]}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.media_assets WHERE filename = 'medicine_wheel_teaching.jpg'
)
UNION ALL
SELECT 
  gen_random_uuid(),
  'deadly_hearts_trek_launch.mp4',
  'deadly_hearts_trek_launch.mp4',
  'video',
  '/media/snow-foundation/deadly_hearts_trek_launch.mp4',
  'Deadly Hearts Trek Program Launch',
  'Launch event for the Deadly Hearts Trek community heart health initiative',
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
  NULL,
  384000000,
  'video/mp4',
  'https://storage.placeholder.com/deadly_hearts_trek_launch.mp4',
  '{"tags": ["deadly-hearts-trek", "health", "community"], "duration": 1200}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.media_assets WHERE filename = 'deadly_hearts_trek_launch.mp4'
)
UNION ALL
SELECT 
  gen_random_uuid(),
  'traditional_foods_workshop.jpg',
  'traditional_foods_workshop.jpg',
  'image',
  '/media/snow-foundation/traditional_foods_workshop.jpg',
  'Traditional Foods Workshop',
  'Community members learning about heart-healthy traditional foods',
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
  NULL,
  4200000,
  'image/jpeg',
  'https://storage.placeholder.com/traditional_foods_workshop.jpg',
  '{"tags": ["workshop", "traditional-foods", "deadly-hearts-trek"]}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.media_assets WHERE filename = 'traditional_foods_workshop.jpg'
)
UNION ALL
SELECT 
  gen_random_uuid(),
  'water_ceremony.mp4',
  'water_ceremony.mp4',
  'video',
  '/media/snow-foundation/water_ceremony.mp4',
  'Sacred Water Ceremony',
  'Traditional water ceremony led by Elder Mary Snowbird',
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
  NULL,
  256000000,
  'video/mp4',
  'https://storage.placeholder.com/water_ceremony.mp4',
  '{"tags": ["ceremony", "water", "sacred"], "duration": 2400, "cultural_protocol": "viewing_restricted"}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.media_assets WHERE filename = 'water_ceremony.mp4'
);

-- 4. Create Stories for Snow Foundation
INSERT INTO public.stories (
  id,
  title,
  content,
  summary,
  author_id,
  storyteller_id,
  organization_id,
  is_public,
  cultural_sensitivity_level,
  tags,
  has_explicit_consent,
  consent_details,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  'The Seven Sacred Teachings',
  'The Seven Sacred Teachings, also known as the Seven Grandfather Teachings, are a set of teachings that demonstrate what it means to live a good life. They include: Wisdom, Love, Respect, Bravery, Honesty, Humility, and Truth. Each teaching is represented by an animal that exemplifies the quality. The beaver represents wisdom because it uses its natural gifts wisely for survival. The eagle represents love because of its ability to see far and wide, caring for all of creation. The buffalo represents respect for its giving nature, providing everything needed for life. The bear represents bravery, facing danger with courage to protect its young. The raven represents honesty, accepting itself and its role in creation. The wolf represents humility, living in harmony with others in the pack. The turtle represents truth, one of the oldest animals on Earth, carrying the teachings of life on its back.',
  'Traditional Indigenous teachings about living a good life through seven sacred principles.',
  'd0a162d2-282e-4653-9d12-aa934c9dfa4e', -- Benjamin
  'd0a162d2-282e-4653-9d12-aa934c9dfa4e',
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
  true,
  'general',
  ARRAY['teachings', 'tradition', 'wisdom', 'culture'],
  true,
  '{"consent_type": "full", "obtained_date": "2024-01-15", "restrictions": []}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.stories WHERE title = 'The Seven Sacred Teachings' AND organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
)
UNION ALL
SELECT
  gen_random_uuid(),
  'Medicine Wheel: The Circle of Life',
  'The Medicine Wheel is a sacred symbol used by many Indigenous peoples of North America. It represents the cyclical nature of life, the four directions, the four seasons, and the four stages of life. East represents spring, childhood, and new beginnings, symbolized by the color yellow. South represents summer, youth, and growth, symbolized by the color red. West represents autumn, adulthood, and introspection, symbolized by the color black. North represents winter, elderhood, and wisdom, symbolized by the color white. At the center is Mother Earth, connecting all directions and all beings. The Medicine Wheel teaches us about balance, harmony, and our connection to all of creation.',
  'Understanding the sacred Medicine Wheel and its teachings about life cycles and balance.',
  'd0a162d2-282e-4653-9d12-aa934c9dfa4e',
  'd0a162d2-282e-4653-9d12-aa934c9dfa4e',
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
  true,
  'general',
  ARRAY['medicine-wheel', 'sacred', 'balance', 'teachings'],
  true,
  '{"consent_type": "full", "obtained_date": "2024-01-20", "restrictions": []}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.stories WHERE title = 'Medicine Wheel: The Circle of Life' AND organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
)
UNION ALL
SELECT
  gen_random_uuid(),
  'Water is Life: Nibi Stories',
  'In Anishinaabe teachings, water (Nibi) is sacred and is considered the lifeblood of Mother Earth. Water is the first medicine, the first environment we experience in the womb. Women are the water carriers and protectors, holding a special relationship with water as life-givers. Every drop of water has been here since the beginning of time, cycling through clouds, rain, rivers, and oceans. When we protect water, we protect life itself. The teachings remind us that water has memory and consciousness, and that our thoughts and prayers can influence its structure.',
  'Sacred teachings about water as the source of life and our responsibility to protect it.',
  'd0a162d2-282e-4653-9d12-aa934c9dfa4e',
  'd0a162d2-282e-4653-9d12-aa934c9dfa4e',
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
  true,
  'general',
  ARRAY['water', 'sacred', 'environment', 'protection'],
  true,
  '{"consent_type": "full", "obtained_date": "2024-02-01", "restrictions": []}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.stories WHERE title = 'Water is Life: Nibi Stories' AND organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
);

-- 5. Create Transcripts for video/audio media
INSERT INTO public.transcripts (
  id,
  media_asset_id,
  text,
  formatted_text,
  language,
  status,
  duration,
  word_count,
  confidence,
  metadata,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  ma.id,
  'Elder William Running Water: Today we gather to share the Seven Sacred Teachings. These teachings have been passed down through generations, guiding our people in how to live a good life. Each teaching is represented by an animal, and each animal shows us a different aspect of living in harmony with creation...',
  '<p>Elder William Running Water: Today we gather to share the Seven Sacred Teachings.</p><p>These teachings have been passed down through generations, guiding our people in how to live a good life.</p><p>Each teaching is represented by an animal, and each animal shows us a different aspect of living in harmony with creation...</p>',
  'en',
  'completed',
  1800,
  450,
  0.95,
  '{"transcribed_by": "AI + Human Review", "review_status": "approved"}'::jsonb,
  NOW(),
  NOW()
FROM public.media_assets ma
WHERE ma.filename = 'seven_teachings_ceremony.mp4'
AND NOT EXISTS (
  SELECT 1 FROM public.transcripts t WHERE t.media_asset_id = ma.id
)
UNION ALL
SELECT
  gen_random_uuid(),
  ma.id,
  'The sound of drums fills the air as young voices join together in traditional song. Elder Mary guides the youth: Remember, the drum is the heartbeat of Mother Earth. When we drum together, we connect with all our relations...',
  '<p>The sound of drums fills the air as young voices join together in traditional song.</p><p>Elder Mary guides the youth: Remember, the drum is the heartbeat of Mother Earth.</p><p>When we drum together, we connect with all our relations...</p>',
  'en',
  'completed',
  900,
  280,
  0.92,
  '{"transcribed_by": "AI + Human Review", "review_status": "approved"}'::jsonb,
  NOW(),
  NOW()
FROM public.media_assets ma
WHERE ma.filename = 'youth_drumming_circle.mp3'
AND NOT EXISTS (
  SELECT 1 FROM public.transcripts t WHERE t.media_asset_id = ma.id
)
UNION ALL
SELECT
  gen_random_uuid(),
  ma.id,
  'Benjamin Knight: Welcome everyone to the launch of the Deadly Hearts Trek. Heart disease affects our communities disproportionately, but we know that through combining traditional knowledge with modern medicine, we can create healthier hearts and stronger communities. This program will bring together elders, youth, and health professionals...',
  '<p>Benjamin Knight: Welcome everyone to the launch of the Deadly Hearts Trek.</p><p>Heart disease affects our communities disproportionately, but we know that through combining traditional knowledge with modern medicine, we can create healthier hearts and stronger communities.</p><p>This program will bring together elders, youth, and health professionals...</p>',
  'en',
  'completed',
  1200,
  320,
  0.94,
  '{"transcribed_by": "AI + Human Review", "review_status": "approved"}'::jsonb,
  NOW(),
  NOW()
FROM public.media_assets ma
WHERE ma.filename = 'deadly_hearts_trek_launch.mp4'
AND NOT EXISTS (
  SELECT 1 FROM public.transcripts t WHERE t.media_asset_id = ma.id
);

-- 6. Link Media to Galleries (using media_usage_tracking if it exists)
-- First check if the table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'media_usage_tracking'
  ) THEN
    -- Link elder portrait to Elder Wisdom gallery
    INSERT INTO public.media_usage_tracking (
      id, media_asset_id, used_in_type, used_in_id, 
      usage_context, usage_role, ordinal_position, created_at
    )
    SELECT 
      gen_random_uuid(),
      ma.id,
      'gallery',
      g.id,
      'Gallery display',
      'primary',
      1,
      NOW()
    FROM public.media_assets ma, public.galleries g
    WHERE ma.filename = 'elder_mary_portrait.jpg'
    AND g.title = 'Elder Wisdom Collection'
    AND NOT EXISTS (
      SELECT 1 FROM public.media_usage_tracking mut
      WHERE mut.media_asset_id = ma.id AND mut.used_in_id = g.id
    );
    
    -- Link Deadly Hearts Trek media to its gallery
    INSERT INTO public.media_usage_tracking (
      id, media_asset_id, used_in_type, used_in_id,
      usage_context, usage_role, ordinal_position, created_at
    )
    SELECT 
      gen_random_uuid(),
      ma.id,
      'gallery',
      g.id,
      'Gallery display',
      'primary',
      1,
      NOW()
    FROM public.media_assets ma, public.galleries g
    WHERE ma.filename IN ('deadly_hearts_trek_launch.mp4', 'traditional_foods_workshop.jpg')
    AND g.title = 'Deadly Hearts Trek'
    AND NOT EXISTS (
      SELECT 1 FROM public.media_usage_tracking mut
      WHERE mut.media_asset_id = ma.id AND mut.used_in_id = g.id
    );
  END IF;
END $$;

-- 7. Create Projects for Snow Foundation
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
SELECT
  gen_random_uuid(),
  'Deadly Hearts Trek Initiative',
  'A comprehensive community heart health program combining traditional wellness practices with modern medicine to address cardiovascular disease in Indigenous communities.',
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
  'active',
  '2024-01-01',
  '{"objectives": ["Reduce heart disease rates", "Promote traditional foods", "Create wellness programs", "Train community health workers"], "funding": "Health Canada", "partners": ["Local Health Authority", "University of Manitoba"]}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.projects 
  WHERE title = 'Deadly Hearts Trek Initiative' 
  AND organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
)
UNION ALL
SELECT
  gen_random_uuid(),
  'Elder Knowledge Documentation',
  'Preserving and sharing traditional knowledge through multimedia storytelling, ensuring cultural teachings are passed to future generations.',
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
  'active',
  '2023-09-15',
  '{"objectives": ["Document 100 elder stories", "Create digital archive", "Train youth in documentation", "Develop educational materials"], "languages": ["English", "Cree", "Ojibwe"]}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.projects 
  WHERE title = 'Elder Knowledge Documentation' 
  AND organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
);

-- 8. Summary of what was created
SELECT 'Data creation complete!' as status;

SELECT 
  'Galleries' as type,
  COUNT(*) as count
FROM public.galleries
WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
UNION ALL
SELECT 
  'Media Assets' as type,
  COUNT(*) as count
FROM public.media_assets
WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
UNION ALL
SELECT 
  'Stories' as type,
  COUNT(*) as count
FROM public.stories
WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
UNION ALL
SELECT 
  'Transcripts' as type,
  COUNT(*) as count
FROM public.transcripts t
JOIN public.media_assets ma ON t.media_asset_id = ma.id
WHERE ma.organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
UNION ALL
SELECT 
  'Projects' as type,
  COUNT(*) as count
FROM public.projects
WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
ORDER BY type;