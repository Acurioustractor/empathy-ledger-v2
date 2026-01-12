-- Create storytellers table to match application expectations
-- This table represents storytellers as a distinct entity from general profiles

CREATE TABLE IF NOT EXISTS public.storytellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  bio text,
  cultural_background text[],
  language_skills text[],
  preferred_contact_method text,
  storytelling_experience text,
  areas_of_expertise text[],
  consent_to_share boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT storytellers_profile_id_key UNIQUE (profile_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_storytellers_profile_id ON storytellers(profile_id);
CREATE INDEX IF NOT EXISTS idx_storytellers_is_active ON storytellers(is_active);
CREATE INDEX IF NOT EXISTS idx_storytellers_cultural_background ON storytellers USING GIN(cultural_background);

-- Populate storytellers from existing profiles that have stories
INSERT INTO public.storytellers (
  id,
  profile_id,
  display_name,
  bio,
  cultural_background,
  language_skills,
  is_active,
  created_at,
  updated_at
)
SELECT DISTINCT
  s.storyteller_id as id,
  s.storyteller_id as profile_id,
  COALESCE(p.display_name, p.full_name, 'Anonymous') as display_name,
  p.bio,
  p.cultural_affiliations as cultural_background,
  p.languages_spoken as language_skills,
  true as is_active,
  s.created_at,
  s.updated_at
FROM stories s
INNER JOIN profiles p ON s.storyteller_id = p.id
WHERE s.storyteller_id IS NOT NULL
ON CONFLICT (profile_id) DO NOTHING;

-- Enable RLS
ALTER TABLE storytellers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for storytellers table
CREATE POLICY "Public storytellers are viewable by everyone"
  ON storytellers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view their own storyteller profile"
  ON storytellers FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can update their own storyteller profile"
  ON storytellers FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can insert their own storyteller profile"
  ON storytellers FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Service role has full access"
  ON storytellers FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_storytellers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER storytellers_updated_at
  BEFORE UPDATE ON storytellers
  FOR EACH ROW
  EXECUTE FUNCTION update_storytellers_updated_at();

-- Add comments for documentation
COMMENT ON TABLE storytellers IS 'Storytellers - individuals who share stories on the platform';
COMMENT ON COLUMN storytellers.profile_id IS 'Reference to the user profile (one-to-one relationship)';
COMMENT ON COLUMN storytellers.display_name IS 'Public display name for the storyteller';
COMMENT ON COLUMN storytellers.cultural_background IS 'Array of cultural backgrounds/affiliations';
COMMENT ON COLUMN storytellers.consent_to_share IS 'Whether storyteller consents to sharing their stories publicly';
COMMENT ON COLUMN storytellers.is_active IS 'Whether the storyteller profile is currently active';
