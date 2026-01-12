-- Add missing columns to storytellers table for admin management
-- These columns enable full inline editing in the admin storytellers table

-- Add is_featured column if it doesn't exist
ALTER TABLE storytellers ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Add is_elder column if it doesn't exist
ALTER TABLE storytellers ADD COLUMN IF NOT EXISTS is_elder boolean DEFAULT false;

-- Add email column if it doesn't exist
ALTER TABLE storytellers ADD COLUMN IF NOT EXISTS email text;

-- Add location column if it doesn't exist
ALTER TABLE storytellers ADD COLUMN IF NOT EXISTS location text;

-- Add profile_visibility column for consistent status management
ALTER TABLE storytellers ADD COLUMN IF NOT EXISTS profile_visibility text DEFAULT 'public';

-- Create indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_storytellers_is_featured ON storytellers(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_storytellers_is_elder ON storytellers(is_elder) WHERE is_elder = true;
CREATE INDEX IF NOT EXISTS idx_storytellers_email ON storytellers(email);
CREATE INDEX IF NOT EXISTS idx_storytellers_location ON storytellers(location);
CREATE INDEX IF NOT EXISTS idx_storytellers_profile_visibility ON storytellers(profile_visibility);

-- Add comments for documentation
COMMENT ON COLUMN storytellers.is_featured IS 'Whether this storyteller is featured on the homepage';
COMMENT ON COLUMN storytellers.is_elder IS 'Whether this storyteller is recognized as an elder/cultural keeper';
COMMENT ON COLUMN storytellers.email IS 'Contact email for the storyteller';
COMMENT ON COLUMN storytellers.location IS 'Geographic location of the storyteller';
COMMENT ON COLUMN storytellers.profile_visibility IS 'Profile visibility status: public, private, draft, pending, inactive, suspended';
