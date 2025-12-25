-- Grant super admin access to hi@act.place
-- This migration makes the ACT main email account a super admin

DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the user ID for hi@act.place
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'hi@act.place';

  -- If user exists, create or update their profile
  IF user_id IS NOT NULL THEN
    INSERT INTO profiles (
      id,
      email,
      display_name,
      super_admin,
      tenant_id,
      tenant_roles,
      created_at,
      updated_at
    )
    VALUES (
      user_id,
      'hi@act.place',
      'ACT Admin',
      true,
      '00000000-0000-0000-0000-000000000000'::uuid,
      ARRAY['super_admin', 'admin']::text[],
      now(),
      now()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      super_admin = true,
      tenant_roles = ARRAY['super_admin', 'admin']::text[],
      display_name = 'ACT Admin',
      updated_at = now();

    RAISE NOTICE 'Super admin access granted to hi@act.place (user_id: %)', user_id;
  ELSE
    RAISE NOTICE 'User hi@act.place not found. Please sign in first.';
  END IF;
END $$;
