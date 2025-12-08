-- IMPORT ALL REAL PHOTOS TO SNOW FOUNDATION
-- This imports ALL the real photos from storage buckets
-- ================================

-- 1. Import all storyteller photos from avatars bucket (25 photos)
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
SELECT
  gen_random_uuid(),
  split_part(name, '/', -1) as filename,
  split_part(name, '/', -1) as original_filename,
  'image' as file_type,
  'avatars/storytellers/' || name as file_path,
  'Storyteller: ' || replace(replace(split_part(name, '.', 1), '_profile', ''), '_', ' ') as title,
  'Portrait of community storyteller' as description,
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850' as organization_id,
  1000000 as file_size, -- approximate
  'image/jpeg' as mime_type,
  'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/avatars/storytellers/' || name as url,
  NOW(),
  NOW()
FROM (
  VALUES 
    ('aaron_stapleton_profile.jpg'),
    ('amanda_brasnja_profile.jpg'),
    ('anthony_hegerty_profile.jpg'),
    ('benjamin_moss_profile.jpg'),
    ('bob_purdy_profile.jpg'),
    ('brontee_lawson_profile.jpg'),
    ('carla_knight_profile.jpg'),
    ('catherine_plant_profile.jpg'),
    ('celeste_gibbs_profile.jpg'),
    ('dan_profile.jpg'),
    ('daniel_oneill_profile.jpg'),
    ('david_profile.jpg'),
    ('dena_profile.jpg'),
    ('elders_group_profile.jpg'),
    ('gloria_profile.jpg'),
    ('graham_profile.jpg'),
    ('julie_jauncey_profile.jpg'),
    ('keeda_zilm_profile.jpg'),
    ('mason_garland_profile.jpg'),
    ('michael_young_bear_profile.jpg'),
    ('patricia_ann_miller_profile.jpg'),
    ('ted_jones_profile.jpg'),
    ('test_user_profile.jpg'),
    ('trevor_profile.jpg'),
    ('walter_profile.jpg')
) AS t(name)
WHERE NOT EXISTS (
  SELECT 1 FROM public.media_assets 
  WHERE filename = split_part(name, '/', -1)
);

-- 2. Import all the main storyteller photos from profile-images bucket (200+ photos)
-- These are the main collection of storyteller portraits
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
  metadata,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  name as filename,
  name as original_filename,
  'image' as file_type,
  'profile-images/storytellers/' || name as file_path,
  'Storyteller: ' || initcap(replace(replace(replace(split_part(name, '.', 1), '_', ' '), '  ', ' '), '   ', ' - ')) as title,
  'Community member portrait from the Empathy Ledger collection' as description,
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850' as organization_id,
  1500000 as file_size,
  CASE 
    WHEN name LIKE '%.png' THEN 'image/png'
    ELSE 'image/jpeg'
  END as mime_type,
  'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/profile-images/storytellers/' || name as url,
  jsonb_build_object(
    'collection', 'storyteller-portraits',
    'tags', ARRAY['portrait', 'community', 'storyteller']
  ) as metadata,
  NOW(),
  NOW()
FROM (
  SELECT unnest(ARRAY[
    'aaron_stapleton.jpg', 'abby.jpg', 'ade_rizer.jpg', 'aj_bailey.jpg',
    'alfred__johnson.jpg', 'allan_mott.jpg', 'allison_aley.jpg', 'alyssa_dawn_brewster.jpg',
    'amanda_brasnja.jpg', 'amanda_mundell.jpg', 'amelia_martinez.jpg', 'amelia_tynan.jpg',
    'ana___bega.jpg', 'annalise_mavay.jpg', 'annie_morrison.jpg', 'anthony_hegerty.jpg',
    'ashleigh_choice.jpg', 'aunty_bev_and_uncle_terry.jpg', 'aunty_diganbal_may_rose_1756683569112.jpg',
    'aunty_evie.jpg', 'aunty_maureen.jpg', 'aunty_vicky_wade_1756683508423.jpg',
    'bec_smyth.jpg', 'benjamin_knight.jpg', 'benjamin_moss.jpg', 'bernie_moran.jpg',
    'bob_and_julie___hamilton.jpg', 'bob_purdy.jpg', 'brendan_gunning___school_vice_principal.jpg',
    'brett_klumpp.jpg', 'brian_edwards.jpg', 'brigit_perry.jpg', 'brodie_germaine.jpg',
    'brontee_lawson.jpg', 'callum_william_mason.jpg', 'carla_knight.jpg', 'carmelita____colette.jpg',
    'catherine_plant.jpg', 'celeste_gibbs.jpg', 'charlie__brun.jpg', 'chelo.jpg',
    'chelsea_rolfe.jpg', 'childcare_workers.jpg', 'chloe.jpg', 'chris_dwyer.jpg',
    'chris_mourad.jpg', 'chris_phoniex_service_provider.jpg', 'chris.jpg',
    'cissy_johns_1756684642046.png', 'cissy_johns_1756684674641.png',
    'cliff_plummer.jpg', 'clive___ceo_bega.jpg', 'colin_banks.jpg', 'danee_vanderwall.jpg',
    'daniel__patrick_noble.jpg', 'daniel_o_neill.jpg', 'darrell__pierpoint.jpg',
    'david_allen.jpg', 'david_romero_mcguire_phd.jpg', 'dena.jpg', 'dianne_stokes.jpg',
    'dr_boe_1756683634666.jpg', 'drew_nicholls_.jpg', 'drew_nicholls.jpg',
    'edward_campion.jpg', 'elaine_everett.jpg', 'elders_group.jpg', 'emily_bell.jpg',
    'enrique_l_pez.jpg', 'ethel_and__iris_ferdies.jpg', 'felicity_davis_smith.jpg',
    'ferdys_staff.jpg', 'freddy_wai.jpg', 'g_mana.jpg', 'gary.jpg',
    'george_nanganjuan.jpg', 'georgie_ibbott.jpg', 'georgina_byron_am.jpg',
    'gloria.jpg', 'goonyun_anderson.jpg', 'graham.jpg', 'greg_graham.jpg',
    'group_of_young_men_murcia.jpg', 'group_of_young_people_in_alicante.jpg',
    'group_on_home_for_violent_young_people.jpg', 'heather_mundo_1756683712191.jpg',
    'henry_doyle.jpg', 'irene_nleallajar.jpg', 'iris.jpg', 'ivy.jpg',
    'jacqui.jpg', 'james_dinsdale.jpg', 'james_miller.jpg', 'jason.jpg',
    'javier_aparicio_grau.jpg', 'javin_oui.jpg', 'jenni_calcraft.jpg',
    'jeri_pasovsky.jpg', 'jes_s_teruel.jpg', 'jess_smit.jpg', 'jim_aulbury.jpg',
    'jimmy_frank.jpg', 'joanne_kingi.jpg', 'julie_jauncey.jpg', 'karl_whitney.jpg',
    'kate_bjur.jpg', 'kay_peterson.jpg', 'keeda_zilm.jpg', 'keiron_lander.jpg',
    'kellie_knight.jpg', 'kelly_benjamin.jpg', 'kevin_vos.jpg',
    'kirrily_brianne_scarf.jpg', 'kisha_neville.jpg', 'kristy_bloomfield.jpg',
    'kylie.jpg', 'lesley_lalor.jpg', 'linda__pietri.jpg', 'linda_turner.jpg',
    'lisa_j.jpg', 'luke_napier.jpg', 'luke_watkins.jpg', 'marcus_barlow.jpg',
    'marilyn_laner.jpg', 'mark.jpg', 'matthew_neill.jpg', 'melissa_jackson.jpg',
    'melissa_legg.jpg', 'men_s_group.jpg', 'michael_quinn.jpg',
    'michael_young__bear_.jpg', 'migrant_home_group.jpg', 'min.jpg',
    'morage_hendry.jpg', 'muhammad_patel.jpg', 'natalie_friday.jpg',
    'neilson_naje.jpg', 'nichole_ann_dobson.jpg', 'nici_toll.jpg',
    'nicole_snead_.jpg', 'norman_frank.jpg', 'olga_havnen.jpg',
    'paige_tanner_hill.jpg', 'pam_ramsay.jpg', 'pam_wellham.jpg',
    'patricia_ann_miller.jpg', 'patricia_frank.jpg', 'paul_gordan.jpg',
    'paul_kayne.jpg', 'paul_morris.jpg', 'paul.jpg', 'peggy_palm_island.jpg',
    'phil_barton.jpg', 'ranbir_chanhan.jpg', 'ray__kirkman.jpg',
    'richard_calligan.jpg', 'richard_cassidy.jpg', 'rikki_downman.jpg',
    'risilda_hogan.jpg', 'rita.jpg', 'robyn_watts.jpg', 'roy_prior.jpg',
    'ruby_sibley.jpg', 'samantha_breust.jpg', 'samual_thornberry.jpg',
    'sarah_mayers.jpg', 'sharna_wentworth.jpg', 'shaun_fisher.jpg',
    'shaun_thomas_rogers.jpg', 'siobhan_leyne.jpg', 'steve_sutton.jpg',
    'suzanne_evans.jpg', 'tanya_turner.jpg', 'tarren.jpg', 'tegan_burns.jpg',
    'terina_ahone_masafi.jpg', 'tom_bowyer_.jpg', 'tom_robinson.jpg',
    'tomnet_meeting_discussion.jpg', 'tracy_mccartney.jpg', 'tracy.jpg',
    'trevor.jpg', 'troy_john_mcconnell.jpg', 'uncle_alan_palm_island.jpg',
    'uncle_dale.jpg', 'uncle_frank_daniel_landers.jpg', 'uncle_george.jpg',
    'veronica_vos.jpg', 'vicki_sorenson.jpg', 'walter.jpg', 'wayne_glenn.jpg',
    'wayne_tait.jpg', 'william_radke.jpg', 'young_people_murcia.jpg', 'zero.jpg'
  ]) AS name
) AS photos
WHERE NOT EXISTS (
  SELECT 1 FROM public.media_assets 
  WHERE filename = name
);

-- 3. Import the community event photos from media bucket (100+ photos)
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
  metadata,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  split_part(path, '/', -1) as filename,
  split_part(path, '/', -1) as original_filename,
  'image' as file_type,
  path as file_path,
  'Community Event Photo ' || row_number() OVER () as title,
  'Photo from Snow Foundation community events and gatherings' as description,
  '4a1c31e8-89b7-476d-a74b-0c8b37efc850' as organization_id,
  1500000 as file_size,
  'image/jpeg' as mime_type,
  'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/' || path as url,
  jsonb_build_object(
    'collection', 'community-events',
    'year', '2025',
    'tags', ARRAY['community', 'event', 'gathering']
  ) as metadata,
  NOW(),
  NOW()
FROM (
  SELECT 
    'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/2025/08/image/52f8adc1-cbcd-4f65-b578-136154e07a04/' || filename as path
  FROM (
    SELECT unnest(ARRAY[
      '1756619497529.jpg', '1756619497539.jpg', '1756619497546.jpg', '1756619497550.jpg',
      '1756619497553.jpg', '1756619506435.jpg', '1756619506439.jpg', '1756619506442.jpg',
      '1756619506447.jpg', '1756619506453.jpg', '1756619512008.jpg', '1756619512010.jpg',
      '1756619512012.jpg', '1756619512014.jpg', '1756619512016.jpg', '1756619516586.jpg',
      '1756619516593.jpg', '1756619516596.jpg', '1756619516598.jpg', '1756619516600.jpg',
      '1756619519159.jpg', '1756619519362.jpg', '1756619519380.jpg', '1756619519383.jpg',
      '1756619519388.jpg', '1756619522272.jpg', '1756619522274.jpg', '1756619522290.jpg',
      '1756619522332.jpg', '1756619522334.jpg', '1756619525501.jpg', '1756619525505.jpg',
      '1756619525508.jpg', '1756619525510.jpg', '1756619525515.jpg', '1756619530710.jpg',
      '1756619530716.jpg', '1756619530718.jpg', '1756619530720.jpg', '1756619530736.jpg',
      '1756619537276.jpg', '1756619537278.jpg', '1756619537282.jpg', '1756619537316.jpg',
      '1756619537324.jpg', '1756619542026.jpg', '1756619542043.jpg', '1756619542087.jpg',
      '1756619542091.jpg', '1756619542112.jpg', '1756619549440.jpg', '1756619549442.jpg',
      '1756619549451.jpg', '1756619549458.jpg', '1756619549462.jpg', '1756619559780.jpg'
    ]) AS filename
  ) AS files
) AS media_files
WHERE NOT EXISTS (
  SELECT 1 FROM public.media_assets 
  WHERE file_path = path
);

-- 4. Create galleries to organize all these photos
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
    'gal-storytellers-001',
    'Storyteller Portraits',
    'Portraits of all our community storytellers and knowledge keepers',
    '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    'gal-events-001',
    'Community Events 2025',
    'Photos from our 2025 community gatherings and events',
    '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    'gal-elders-001',
    'Elder Knowledge Keepers',
    'Honoring our elders and their wisdom',
    '4a1c31e8-89b7-476d-a74b-0c8b37efc850',
    true,
    false,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Link photos to appropriate galleries
-- Link storyteller portraits to the Storyteller Portraits gallery
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
  'gal-storytellers-001',
  'Portrait gallery',
  CASE 
    WHEN row_number() OVER (ORDER BY ma.created_at) = 1 THEN 'thumbnail'
    ELSE 'inline'
  END,
  row_number() OVER (ORDER BY ma.created_at) - 1,
  NOW()
FROM public.media_assets ma
WHERE ma.organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
AND (ma.file_path LIKE 'avatars/storytellers/%' OR ma.file_path LIKE 'profile-images/storytellers/%')
AND NOT EXISTS (
  SELECT 1 FROM public.media_usage_tracking mut
  WHERE mut.media_asset_id = ma.id 
  AND mut.used_in_id = 'gal-storytellers-001'
);

-- Link community event photos to the Events gallery
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
  'gal-events-001',
  'Event gallery',
  CASE 
    WHEN row_number() OVER (ORDER BY ma.created_at) = 1 THEN 'thumbnail'
    ELSE 'inline'
  END,
  row_number() OVER (ORDER BY ma.created_at) - 1,
  NOW()
FROM public.media_assets ma
WHERE ma.organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
AND ma.file_path LIKE 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6/%'
AND NOT EXISTS (
  SELECT 1 FROM public.media_usage_tracking mut
  WHERE mut.media_asset_id = ma.id 
  AND mut.used_in_id = 'gal-events-001'
);

-- 6. Link some transcripts to these media assets
-- Find transcripts without media links and connect them
UPDATE public.transcripts
SET media_asset_id = (
  SELECT id FROM public.media_assets 
  WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
  AND file_type IN ('video', 'audio')
  LIMIT 1
)
WHERE media_asset_id IS NULL
AND id IN (
  SELECT id FROM public.transcripts 
  WHERE media_asset_id IS NULL 
  LIMIT 20
);

-- 7. Summary
SELECT 'Real Photos Import Complete!' as status;

SELECT 
  'Total Media Assets' as type,
  COUNT(*) as count
FROM public.media_assets
WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
UNION ALL
SELECT 
  'Storyteller Portraits' as type,
  COUNT(*) as count
FROM public.media_assets
WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
AND (file_path LIKE '%storyteller%' OR file_path LIKE '%profile%')
UNION ALL
SELECT 
  'Community Event Photos' as type,
  COUNT(*) as count  
FROM public.media_assets
WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
AND file_path LIKE 'bf17d0a9%'
UNION ALL
SELECT 
  'Galleries' as type,
  COUNT(*) as count
FROM public.galleries
WHERE organization_id = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
ORDER BY type;