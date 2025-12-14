-- World Tour Feature Tables
-- Created: 2024-12-14
-- Purpose: Support the Empathy Ledger World Tour page with community nominations,
--          dream organizations, and confirmed tour stops

-- ============================================================================
-- TOUR REQUESTS TABLE
-- Community nominations for places Ben should visit
-- ============================================================================
CREATE TABLE IF NOT EXISTS tour_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Location details
  location_text TEXT NOT NULL,
  city TEXT,
  country TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Story context
  why_visit TEXT NOT NULL,
  storytellers_description TEXT,

  -- Organization connection (optional)
  organization_name TEXT,
  organization_role TEXT,

  -- How they can help
  how_can_help TEXT[] DEFAULT '{}', -- array: host, connect, fund, volunteer, other

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'completed', 'declined')),
  notes TEXT,

  -- Go High Level integration
  ghl_contact_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_tour_requests_status ON tour_requests(status);
CREATE INDEX IF NOT EXISTS idx_tour_requests_country ON tour_requests(country);
CREATE INDEX IF NOT EXISTS idx_tour_requests_created ON tour_requests(created_at DESC);

-- ============================================================================
-- DREAM ORGANIZATIONS TABLE
-- Aspirational partner organizations we want to connect with
-- ============================================================================
CREATE TABLE IF NOT EXISTS dream_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organization info
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT NOT NULL,
  why_connect TEXT NOT NULL, -- Why we want to partner with them

  -- Categorization
  category TEXT NOT NULL CHECK (category IN (
    'indigenous_rights',
    'cultural_preservation',
    'social_justice',
    'healthcare',
    'education',
    'environment',
    'media',
    'technology',
    'philanthropy',
    'government',
    'other'
  )),

  -- Location
  location_text TEXT,
  city TEXT,
  country TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Tracking
  contact_status TEXT DEFAULT 'dream' CHECK (contact_status IN (
    'dream',        -- On our wishlist
    'researching',  -- Learning more about them
    'reached_out',  -- Initial contact made
    'in_conversation', -- Active discussions
    'partnered',    -- Official partnership
    'declined'      -- They declined or not a fit
  )),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10), -- 1 = highest priority

  -- Metadata
  contact_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_dream_orgs_category ON dream_organizations(category);
CREATE INDEX IF NOT EXISTS idx_dream_orgs_status ON dream_organizations(contact_status);
CREATE INDEX IF NOT EXISTS idx_dream_orgs_priority ON dream_organizations(priority);

-- ============================================================================
-- TOUR STOPS TABLE
-- Confirmed locations on the tour itinerary
-- ============================================================================
CREATE TABLE IF NOT EXISTS tour_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Location (required)
  location_text TEXT NOT NULL,
  city TEXT,
  country TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,

  -- Status
  status TEXT DEFAULT 'planned' CHECK (status IN (
    'planned',     -- On the roadmap
    'confirmed',   -- Dates confirmed
    'in_progress', -- Currently there
    'completed'    -- Visit completed
  )),

  -- Dates
  date_start DATE,
  date_end DATE,

  -- Details
  title TEXT, -- Optional title like "Melbourne Community Gathering"
  description TEXT,
  partner_organizations TEXT[], -- Names or UUIDs of partnering orgs

  -- Outcomes (for completed stops)
  stories_collected INTEGER DEFAULT 0,
  storytellers_met INTEGER DEFAULT 0,
  highlights TEXT,

  -- Media
  cover_image_url TEXT,
  gallery_urls TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for status and date queries
CREATE INDEX IF NOT EXISTS idx_tour_stops_status ON tour_stops(status);
CREATE INDEX IF NOT EXISTS idx_tour_stops_dates ON tour_stops(date_start, date_end);
CREATE INDEX IF NOT EXISTS idx_tour_stops_country ON tour_stops(country);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE tour_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_stops ENABLE ROW LEVEL SECURITY;

-- Tour requests: Anyone can insert (public form), only admins can read/update
CREATE POLICY "Anyone can submit tour requests" ON tour_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view tour requests" ON tour_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.tenant_roles @> ARRAY['admin'] OR profiles.tenant_roles @> ARRAY['super_admin'])
    )
  );

CREATE POLICY "Admins can update tour requests" ON tour_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.tenant_roles @> ARRAY['admin'] OR profiles.tenant_roles @> ARRAY['super_admin'])
    )
  );

-- Dream organizations: Public read, admin write
CREATE POLICY "Anyone can view dream organizations" ON dream_organizations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage dream organizations" ON dream_organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.tenant_roles @> ARRAY['admin'] OR profiles.tenant_roles @> ARRAY['super_admin'])
    )
  );

-- Tour stops: Public read, admin write
CREATE POLICY "Anyone can view tour stops" ON tour_stops
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tour stops" ON tour_stops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.tenant_roles @> ARRAY['admin'] OR profiles.tenant_roles @> ARRAY['super_admin'])
    )
  );

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_tour_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tour_requests_updated_at
  BEFORE UPDATE ON tour_requests
  FOR EACH ROW EXECUTE FUNCTION update_tour_updated_at();

CREATE TRIGGER dream_organizations_updated_at
  BEFORE UPDATE ON dream_organizations
  FOR EACH ROW EXECUTE FUNCTION update_tour_updated_at();

CREATE TRIGGER tour_stops_updated_at
  BEFORE UPDATE ON tour_stops
  FOR EACH ROW EXECUTE FUNCTION update_tour_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE tour_requests IS 'Community nominations for Empathy Ledger World Tour visits';
COMMENT ON TABLE dream_organizations IS 'Aspirational partner organizations for the Empathy Ledger mission';
COMMENT ON TABLE tour_stops IS 'Confirmed and completed tour stop locations';

COMMENT ON COLUMN tour_requests.how_can_help IS 'Array of ways the person can help: host, connect, fund, volunteer, other';
COMMENT ON COLUMN tour_requests.ghl_contact_id IS 'Go High Level CRM contact ID for follow-up automation';
COMMENT ON COLUMN dream_organizations.priority IS 'Priority ranking 1-10, where 1 is highest priority';
COMMENT ON COLUMN tour_stops.partner_organizations IS 'Array of organization names or IDs involved in this stop';
