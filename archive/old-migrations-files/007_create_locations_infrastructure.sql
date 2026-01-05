-- Migration: Create Locations Infrastructure
-- Create locations table and profile_locations junction table

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Australia',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, city, state, country)
);

-- Create profile_locations junction table
CREATE TABLE IF NOT EXISTS profile_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, location_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_locations_profile ON profile_locations(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_locations_location ON profile_locations(location_id);
CREATE INDEX IF NOT EXISTS idx_profile_locations_primary ON profile_locations(profile_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_locations_city_state ON locations(city, state);

-- Add some common Australian locations
INSERT INTO locations (name, city, state, country) VALUES
  ('Sydney', 'Sydney', 'NSW', 'Australia'),
  ('Melbourne', 'Melbourne', 'VIC', 'Australia'),
  ('Brisbane', 'Brisbane', 'QLD', 'Australia'),
  ('Perth', 'Perth', 'WA', 'Australia'),
  ('Adelaide', 'Adelaide', 'SA', 'Australia'),
  ('Hobart', 'Hobart', 'TAS', 'Australia'),
  ('Darwin', 'Darwin', 'NT', 'Australia'),
  ('Canberra', 'Canberra', 'ACT', 'Australia'),
  ('Katherine', 'Katherine', 'NT', 'Australia'),
  ('Alice Springs', 'Alice Springs', 'NT', 'Australia'),
  ('Palm Island', 'Palm Island', 'QLD', 'Australia'),
  ('Tennant Creek', 'Tennant Creek', 'NT', 'Australia'),
  ('Mount Isa', 'Mount Isa', 'QLD', 'Australia'),
  ('Newcastle', 'Newcastle', 'NSW', 'Australia'),
  ('Wollongong', 'Wollongong', 'NSW', 'Australia'),
  ('Geelong', 'Geelong', 'VIC', 'Australia'),
  ('Cairns', 'Cairns', 'QLD', 'Australia'),
  ('Townsville', 'Townsville', 'QLD', 'Australia'),
  ('Gladstone', 'Gladstone', 'QLD', 'Australia')
ON CONFLICT (name, city, state, country) DO NOTHING;

-- Verify creation
DO $$
DECLARE
  locations_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO locations_count FROM locations;
  RAISE NOTICE 'Locations Infrastructure Created:';
  RAISE NOTICE '  Seeded locations: %', locations_count;
END $$;