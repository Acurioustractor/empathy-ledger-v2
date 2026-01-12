-- Grant super-admin access to Benjamin Knight
-- This migration finds the appropriate profile and grants full super-admin permissions

-- First, let's find profiles that might be yours
DO $$
DECLARE
  v_profile_id UUID;
  v_profile_email TEXT;
  v_profile_name TEXT;
BEGIN
  -- Try to find profile by email pattern
  SELECT id, email, display_name INTO v_profile_id, v_profile_email, v_profile_name
  FROM public.profiles
  WHERE
    email ILIKE '%knight%'
    OR email ILIKE '%ben%'
    OR display_name ILIKE '%knight%'
    OR display_name ILIKE '%Ben%'
    OR full_name ILIKE '%knight%'
    OR full_name ILIKE '%Benjamin%'
  LIMIT 1;

  -- If found, grant super-admin access
  IF v_profile_id IS NOT NULL THEN
    -- Set super-admin flag
    UPDATE public.profiles
    SET is_super_admin = TRUE
    WHERE id = v_profile_id;

    -- Grant all super-admin permissions
    INSERT INTO public.super_admin_permissions (profile_id, permission_type)
    SELECT v_profile_id, unnest(ARRAY[
      'manage_all_organizations',
      'cross_org_publishing',
      'content_moderation',
      'super_admin_dashboard',
      'manage_syndication',
      'social_media_publishing',
      'analytics_access'
    ])
    ON CONFLICT (profile_id, permission_type) DO NOTHING;

    RAISE NOTICE 'Super-admin access granted to profile: % (%, %)', v_profile_id, v_profile_email, v_profile_name;
  ELSE
    -- If no profile found, create a placeholder that can be updated later
    RAISE NOTICE 'No matching profile found. Manual setup required.';
    RAISE NOTICE 'Run this SQL to grant super-admin access:';
    RAISE NOTICE 'UPDATE public.profiles SET is_super_admin = TRUE WHERE id = ''<your-profile-id>'';';
    RAISE NOTICE 'INSERT INTO public.super_admin_permissions (profile_id, permission_type) SELECT ''<your-profile-id>'', unnest(ARRAY[''manage_all_organizations'',''cross_org_publishing'',''content_moderation'',''super_admin_dashboard'',''manage_syndication'',''social_media_publishing'',''analytics_access'']);';
  END IF;
END $$;

-- Display current super-admin profiles
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '--- Current Super-Admin Profiles ---';
  FOR rec IN
    SELECT
      p.id,
      p.display_name,
      p.email,
      p.full_name,
      p.is_super_admin,
      COUNT(sap.id) as permission_count
    FROM public.profiles p
    LEFT JOIN public.super_admin_permissions sap ON sap.profile_id = p.id AND sap.is_active = TRUE
    WHERE p.is_super_admin = TRUE
    GROUP BY p.id, p.display_name, p.email, p.full_name, p.is_super_admin
  LOOP
    RAISE NOTICE 'Profile: % | Email: % | Name: % | Permissions: %',
      rec.id, rec.email, rec.display_name, rec.permission_count;
  END LOOP;
END $$;
