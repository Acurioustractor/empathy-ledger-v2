-- Check if locations table exists and create with correct structure
DO $$ 
BEGIN
    -- Drop existing locations table if it exists to recreate with proper structure
    DROP TABLE IF EXISTS profile_locations CASCADE;
    DROP TABLE IF EXISTS locations CASCADE;
    
    -- Create locations table with correct structure
    CREATE TABLE locations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      name VARCHAR(255) NOT NULL,
      city VARCHAR(255),
      state VARCHAR(255),
      country VARCHAR(255) DEFAULT 'Australia',
      postal_code VARCHAR(20),
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8)
    );

    -- Create unique constraint
    CREATE UNIQUE INDEX idx_locations_unique ON locations(COALESCE(name, ''), COALESCE(city, ''), COALESCE(state, ''), COALESCE(country, ''));

    -- Create profile_locations table
    CREATE TABLE profile_locations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      is_primary BOOLEAN DEFAULT FALSE,
      location_type VARCHAR(50),
      UNIQUE(profile_id, location_id)
    );

    -- Create indexes
    CREATE INDEX idx_profile_locations_profile_id ON profile_locations(profile_id);
    CREATE INDEX idx_profile_locations_location_id ON profile_locations(location_id);
    
    -- Insert sample Australian locations
    INSERT INTO locations (name, city, state, country) VALUES
      ('Sydney', 'Sydney', 'NSW', 'Australia'),
      ('Melbourne', 'Melbourne', 'VIC', 'Australia'),
      ('Brisbane', 'Brisbane', 'QLD', 'Australia'),
      ('Perth', 'Perth', 'WA', 'Australia'),
      ('Adelaide', 'Adelaide', 'SA', 'Australia'),
      ('Darwin', 'Darwin', 'NT', 'Australia'),
      ('Hobart', 'Hobart', 'TAS', 'Australia'),
      ('Canberra', 'Canberra', 'ACT', 'Australia'),
      ('Gold Coast', 'Gold Coast', 'QLD', 'Australia'),
      ('Newcastle', 'Newcastle', 'NSW', 'Australia'),
      ('Wollongong', 'Wollongong', 'NSW', 'Australia'),
      ('Geelong', 'Geelong', 'VIC', 'Australia'),
      ('Townsville', 'Townsville', 'QLD', 'Australia'),
      ('Cairns', 'Cairns', 'QLD', 'Australia'),
      ('Ballarat', 'Ballarat', 'VIC', 'Australia'),
      ('Bendigo', 'Bendigo', 'VIC', 'Australia');
      
    RAISE NOTICE 'Locations and profile_locations tables created successfully';
END $$;