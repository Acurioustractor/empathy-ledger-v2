-- Add is_super_admin column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Add is_admin column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update Benjamin's profile to have super admin privileges
UPDATE profiles 
SET 
  is_super_admin = true,
  is_admin = true,
  tenant_roles = jsonb_build_object('admin', true, 'super_admin', true)
WHERE email = 'benjamin@act.place';

-- Verify the update
SELECT 
  id,
  email,
  display_name,
  is_super_admin,
  is_admin,
  tenant_roles,
  tenant_id
FROM profiles 
WHERE email = 'benjamin@act.place';