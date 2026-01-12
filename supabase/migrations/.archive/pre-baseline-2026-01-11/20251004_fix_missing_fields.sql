-- Add missing created_by field to profiles table
-- Note: Removed foreign key constraint since auth schema may not exist in local dev
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_created_by ON profiles(created_by);

-- Add missing organization_id field to galleries table for organization scoping
ALTER TABLE galleries
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_galleries_organization_id ON galleries(organization_id);

-- Note: RLS policies for galleries can be added when authentication system is fully implemented
-- For now, galleries are scoped by created_by and can optionally be scoped by organization_id
