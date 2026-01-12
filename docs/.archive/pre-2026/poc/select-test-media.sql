-- Select 50 representative media assets for Vision AI PoC testing
-- Distribution: 10 cultural, 10 with people, 10 sacred potential, 20 everyday

-- Get a diverse sample of images from existing stories
WITH media_sample AS (
  SELECT 
    ma.id,
    ma.file_path,
    ma.file_name,
    ma.file_type,
    ma.created_at,
    s.title as story_title,
    s.themes,
    p.name as storyteller_name,
    -- Tag images by likely category based on metadata
    CASE 
      WHEN s.themes @> ARRAY['ceremony', 'ritual', 'sacred', 'cultural']::text[] THEN 'cultural'
      WHEN s.themes @> ARRAY['family', 'community', 'people']::text[] THEN 'people'
      WHEN s.themes @> ARRAY['elder', 'tradition', 'spiritual']::text[] THEN 'sacred_potential'
      ELSE 'everyday'
    END as category
  FROM media_assets ma
  JOIN stories s ON ma.story_id = s.id
  JOIN profiles p ON s.storyteller_id = p.id
  WHERE 
    ma.file_type LIKE 'image/%'
    AND ma.file_path IS NOT NULL
  ORDER BY ma.created_at DESC
  LIMIT 200 -- Get more than we need for filtering
)
SELECT 
  id,
  file_path,
  file_name,
  story_title,
  storyteller_name,
  themes,
  category
FROM (
  -- 10 cultural images
  (SELECT * FROM media_sample WHERE category = 'cultural' LIMIT 10)
  UNION ALL
  -- 10 images with people
  (SELECT * FROM media_sample WHERE category = 'people' LIMIT 10)
  UNION ALL
  -- 10 sacred potential
  (SELECT * FROM media_sample WHERE category = 'sacred_potential' LIMIT 10)
  UNION ALL
  -- 20 everyday images
  (SELECT * FROM media_sample WHERE category = 'everyday' LIMIT 20)
) as final_sample
ORDER BY category, created_at DESC;
