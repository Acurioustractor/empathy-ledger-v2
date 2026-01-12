-- Enhanced Media Tagging System
-- Phase 1: World-class gallery with multi-dimensional tagging
-- Supports: tags, locations (Mapbox), storyteller linking, batch operations

-- ============================================================================
-- 1. TAGS TABLE - Centralized tag registry
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Tag identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Classification
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'general', 'cultural', 'location', 'project', 'theme', 'event', 'person'
  )),

  -- Hierarchy support
  parent_tag_id UUID REFERENCES public.tags(id) ON DELETE SET NULL,

  -- Cultural context
  cultural_sensitivity_level TEXT DEFAULT 'public' CHECK (
    cultural_sensitivity_level IN ('public', 'sensitive', 'sacred')
  ),
  requires_elder_approval BOOLEAN DEFAULT false,

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,

  -- Tenant scoping
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED,

  UNIQUE(slug, tenant_id)
);

-- Add comment
COMMENT ON TABLE public.tags IS 'Centralized tag registry for media assets with cultural sensitivity support';

-- ============================================================================
-- 2. MEDIA_TAGS TABLE - Junction table for media-tag relationships
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.media_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- References
  media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,

  -- Tag source and confidence
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN (
    'manual', 'ai_suggested', 'ai_verified', 'batch', 'exif'
  )),
  confidence FLOAT CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),

  -- Verification workflow
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,

  -- Elder approval for cultural content
  elder_approved BOOLEAN DEFAULT false,
  elder_approved_by UUID REFERENCES auth.users(id),
  elder_approved_at TIMESTAMPTZ,
  elder_notes TEXT,

  -- Audit
  added_by UUID REFERENCES auth.users(id),

  UNIQUE(media_asset_id, tag_id)
);

COMMENT ON TABLE public.media_tags IS 'Links media assets to tags with source tracking and verification workflow';

-- ============================================================================
-- 3. MEDIA_LOCATIONS TABLE - Enhanced location data with Mapbox integration
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.media_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Reference (one location per media)
  media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE UNIQUE,

  -- Coordinates
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accuracy_meters FLOAT,
  altitude_meters FLOAT,

  -- Mapbox integration
  mapbox_place_id TEXT,
  mapbox_place_type TEXT, -- 'country', 'region', 'place', 'locality', 'neighborhood', 'address', 'poi'
  mapbox_place_name TEXT,
  mapbox_context JSONB, -- Full context from Mapbox (region, country, etc.)
  bounding_box JSONB, -- [sw_lng, sw_lat, ne_lng, ne_lat]

  -- Cultural context
  indigenous_territory TEXT,
  traditional_name TEXT,
  country_code TEXT,

  -- Human-readable
  formatted_address TEXT,
  locality TEXT, -- City/town
  region TEXT, -- State/province
  country TEXT,

  -- Source tracking
  source TEXT DEFAULT 'manual' CHECK (source IN (
    'manual', 'exif', 'mapbox_search', 'mapbox_click', 'ai_detected', 'batch'
  )),

  -- Audit
  set_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE public.media_locations IS 'Geo-location data for media assets with Mapbox integration and indigenous territory support';

-- ============================================================================
-- 4. MEDIA_STORYTELLERS TABLE - Link media to storytellers
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.media_storytellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- References
  media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  storyteller_id UUID NOT NULL REFERENCES public.storytellers(id) ON DELETE CASCADE,

  -- Relationship type
  relationship TEXT NOT NULL DEFAULT 'appears_in' CHECK (relationship IN (
    'appears_in',      -- Person appears in the media
    'photographer',    -- Person took the photo/video
    'subject',         -- Primary subject of the media
    'owner',           -- Owns rights to the media
    'tagged_by_face',  -- Auto-tagged via face detection
    'mentioned'        -- Referenced but not shown
  )),

  -- Face detection link (if applicable)
  face_detection_id UUID, -- Links to face detection record if exists
  face_bounding_box JSONB, -- {x, y, width, height} in percentages
  face_confidence FLOAT,

  -- Consent workflow
  consent_status TEXT DEFAULT 'pending' CHECK (consent_status IN (
    'pending',      -- Awaiting consent
    'granted',      -- Consent given
    'denied',       -- Consent denied
    'revoked',      -- Previously granted, now revoked
    'not_required'  -- No consent needed (e.g., public figure in public setting)
  )),
  consent_granted_at TIMESTAMPTZ,
  consent_revoked_at TIMESTAMPTZ,
  consent_notes TEXT,

  -- Display preferences (set by storyteller)
  blur_face BOOLEAN DEFAULT false,
  hide_from_public BOOLEAN DEFAULT false,

  -- Source and audit
  source TEXT DEFAULT 'manual' CHECK (source IN (
    'manual', 'face_detection', 'batch', 'self_tagged'
  )),
  added_by UUID REFERENCES auth.users(id),

  UNIQUE(media_asset_id, storyteller_id, relationship)
);

COMMENT ON TABLE public.media_storytellers IS 'Links media to storytellers with consent management and face detection integration';

-- ============================================================================
-- 5. INDEXES FOR 10K SCALE PERFORMANCE
-- ============================================================================

-- Tags table indexes
CREATE INDEX IF NOT EXISTS idx_tags_category ON public.tags(category);
CREATE INDEX IF NOT EXISTS idx_tags_parent ON public.tags(parent_tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_tenant ON public.tags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tags_search ON public.tags USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_tags_usage ON public.tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_tags_cultural ON public.tags(cultural_sensitivity_level) WHERE requires_elder_approval = true;

-- Media tags indexes
CREATE INDEX IF NOT EXISTS idx_media_tags_media ON public.media_tags(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_tags_tag ON public.media_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_media_tags_source ON public.media_tags(source);
CREATE INDEX IF NOT EXISTS idx_media_tags_verified ON public.media_tags(verified) WHERE verified = false;
CREATE INDEX IF NOT EXISTS idx_media_tags_elder_pending ON public.media_tags(id) WHERE elder_approved = false;

-- Media locations indexes
CREATE INDEX IF NOT EXISTS idx_media_locations_media ON public.media_locations(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_locations_coords ON public.media_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_media_locations_country ON public.media_locations(country_code);
CREATE INDEX IF NOT EXISTS idx_media_locations_indigenous ON public.media_locations(indigenous_territory) WHERE indigenous_territory IS NOT NULL;

-- Media storytellers indexes
CREATE INDEX IF NOT EXISTS idx_media_storytellers_media ON public.media_storytellers(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_storytellers_storyteller ON public.media_storytellers(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_media_storytellers_consent ON public.media_storytellers(consent_status);
CREATE INDEX IF NOT EXISTS idx_media_storytellers_relationship ON public.media_storytellers(relationship);
CREATE INDEX IF NOT EXISTS idx_media_storytellers_face ON public.media_storytellers(face_detection_id) WHERE face_detection_id IS NOT NULL;

-- ============================================================================
-- 6. HELPER FUNCTIONS
-- ============================================================================

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.tags SET usage_count = usage_count + 1, updated_at = NOW()
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.tags SET usage_count = GREATEST(0, usage_count - 1), updated_at = NOW()
    WHERE id = OLD.tag_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for tag usage count
DROP TRIGGER IF EXISTS trigger_update_tag_usage ON public.media_tags;
CREATE TRIGGER trigger_update_tag_usage
  AFTER INSERT OR DELETE ON public.media_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_tag_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := regexp_replace(NEW.slug, '^-|-$', '', 'g');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating slug
DROP TRIGGER IF EXISTS trigger_generate_tag_slug ON public.tags;
CREATE TRIGGER trigger_generate_tag_slug
  BEFORE INSERT OR UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION generate_tag_slug();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_media_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_media_location_timestamp ON public.media_locations;
CREATE TRIGGER trigger_update_media_location_timestamp
  BEFORE UPDATE ON public.media_locations
  FOR EACH ROW EXECUTE FUNCTION update_media_location_timestamp();

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_storytellers ENABLE ROW LEVEL SECURITY;

-- Tags policies
DROP POLICY IF EXISTS "Anyone can view public tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can create tags" ON public.tags;
DROP POLICY IF EXISTS "Tag creators and admins can update" ON public.tags;
CREATE POLICY "Anyone can view public tags"
  ON public.tags FOR SELECT
  USING (cultural_sensitivity_level = 'public' OR tenant_id IS NULL);

CREATE POLICY "Authenticated users can create tags"
  ON public.tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Tag creators and admins can update"
  ON public.tags FOR UPDATE
  TO authenticated
  USING (true);

-- Media tags policies
DROP POLICY IF EXISTS "Anyone can view verified media tags" ON public.media_tags;
DROP POLICY IF EXISTS "Authenticated users can add media tags" ON public.media_tags;
DROP POLICY IF EXISTS "Users can update their own tags" ON public.media_tags;
DROP POLICY IF EXISTS "Users can delete their own tags" ON public.media_tags;
CREATE POLICY "Anyone can view verified media tags"
  ON public.media_tags FOR SELECT
  USING (
    verified = true
    OR (elder_approved = true OR NOT EXISTS (
      SELECT 1 FROM public.tags t
      WHERE t.id = tag_id AND t.requires_elder_approval = true
    ))
  );

CREATE POLICY "Authenticated users can add media tags"
  ON public.media_tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own tags"
  ON public.media_tags FOR UPDATE
  TO authenticated
  USING (added_by = auth.uid() OR verified_by = auth.uid() OR elder_approved_by = auth.uid());

CREATE POLICY "Users can delete their own tags"
  ON public.media_tags FOR DELETE
  TO authenticated
  USING (added_by = auth.uid());

-- Media locations policies
DROP POLICY IF EXISTS "Anyone can view media locations" ON public.media_locations;
DROP POLICY IF EXISTS "Authenticated users can set locations" ON public.media_locations;
DROP POLICY IF EXISTS "Location setters can update" ON public.media_locations;
CREATE POLICY "Anyone can view media locations"
  ON public.media_locations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can set locations"
  ON public.media_locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Location setters can update"
  ON public.media_locations FOR UPDATE
  TO authenticated
  USING (set_by = auth.uid() OR set_by IS NULL);

-- Media storytellers policies
DROP POLICY IF EXISTS "View based on consent status" ON public.media_storytellers;
DROP POLICY IF EXISTS "Authenticated users can link storytellers" ON public.media_storytellers;
DROP POLICY IF EXISTS "Storytellers can manage their own consent" ON public.media_storytellers;
CREATE POLICY "View based on consent status"
  ON public.media_storytellers FOR SELECT
  USING (
    consent_status IN ('granted', 'not_required')
    OR storyteller_id IN (
      SELECT id FROM public.storytellers WHERE profile_id = auth.uid()
    )
    OR added_by = auth.uid()
  );

CREATE POLICY "Authenticated users can link storytellers"
  ON public.media_storytellers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Storytellers can manage their own consent"
  ON public.media_storytellers FOR UPDATE
  TO authenticated
  USING (
    storyteller_id IN (
      SELECT id FROM public.storytellers WHERE profile_id = auth.uid()
    )
    OR added_by = auth.uid()
  );

-- ============================================================================
-- 8. SEED DEFAULT TAGS
-- ============================================================================

INSERT INTO public.tags (name, slug, category, cultural_sensitivity_level, description) VALUES
  -- Project tags
  ('Empathy Ledger', 'empathy-ledger', 'project', 'public', 'Empathy Ledger platform content'),
  ('JusticeHub', 'justicehub', 'project', 'public', 'JusticeHub platform content'),
  ('ACT Farm', 'act-farm', 'project', 'public', 'ACT Farm project content'),
  ('The Harvest', 'harvest', 'project', 'public', 'The Harvest program content'),
  ('Goods on Country', 'goods', 'project', 'public', 'Goods on Country marketplace'),
  ('ACT Placemat', 'placemat', 'project', 'public', 'ACT Placemat dining experience'),
  ('ACT Studio', 'studio', 'project', 'public', 'ACT Studio creative content'),

  -- Theme tags
  ('Storytelling', 'storytelling', 'theme', 'public', 'Stories and narratives'),
  ('Community', 'community', 'theme', 'public', 'Community gatherings and events'),
  ('Cultural Practice', 'cultural-practice', 'theme', 'sensitive', 'Traditional cultural practices'),
  ('Land & Country', 'land-country', 'theme', 'public', 'Connection to land and country'),
  ('Healing', 'healing', 'theme', 'sensitive', 'Healing practices and journeys'),
  ('Justice', 'justice', 'theme', 'public', 'Justice and legal advocacy'),
  ('Food & Farming', 'food-farming', 'theme', 'public', 'Food sovereignty and farming'),
  ('Youth', 'youth', 'theme', 'public', 'Youth programs and stories'),
  ('Elders', 'elders', 'theme', 'sensitive', 'Elder wisdom and guidance'),

  -- Cultural sensitivity tags
  ('Ceremony', 'ceremony', 'cultural', 'sacred', 'Ceremonial content requiring elder approval'),
  ('Sacred Site', 'sacred-site', 'cultural', 'sacred', 'Sacred site imagery'),
  ('Traditional Knowledge', 'traditional-knowledge', 'cultural', 'sensitive', 'Traditional knowledge content'),

  -- Event tags
  ('Workshop', 'workshop', 'event', 'public', 'Workshop or training event'),
  ('Conference', 'conference', 'event', 'public', 'Conference or summit'),
  ('Celebration', 'celebration', 'event', 'public', 'Celebration or milestone'),
  ('Launch', 'launch', 'event', 'public', 'Product or program launch')
ON CONFLICT (slug, tenant_id) DO NOTHING;

-- Mark sacred/sensitive tags as requiring elder approval
UPDATE public.tags
SET requires_elder_approval = true
WHERE cultural_sensitivity_level IN ('sacred', 'sensitive');

-- ============================================================================
-- 9. ADD COLUMNS TO MEDIA_ASSETS (IF NOT EXISTS)
-- ============================================================================

DO $$
BEGIN
  -- Project code for quick filtering
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_assets' AND column_name = 'project_code') THEN
    ALTER TABLE public.media_assets ADD COLUMN project_code TEXT CHECK (project_code IN (
      'empathy-ledger', 'justicehub', 'act-farm', 'harvest', 'goods', 'placemat', 'studio'
    ));
  END IF;

  -- AI tag suggestions storage
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_assets' AND column_name = 'ai_tag_suggestions') THEN
    ALTER TABLE public.media_assets ADD COLUMN ai_tag_suggestions JSONB DEFAULT '[]';
  END IF;

  -- Face detection status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_assets' AND column_name = 'face_detection_status') THEN
    ALTER TABLE public.media_assets ADD COLUMN face_detection_status TEXT DEFAULT 'pending'
      CHECK (face_detection_status IN ('pending', 'processing', 'completed', 'failed', 'skipped'));
  END IF;

  -- Face count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_assets' AND column_name = 'face_detection_count') THEN
    ALTER TABLE public.media_assets ADD COLUMN face_detection_count INTEGER DEFAULT 0;
  END IF;

  -- Batch tagging audit
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_assets' AND column_name = 'batch_tagged_at') THEN
    ALTER TABLE public.media_assets ADD COLUMN batch_tagged_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'media_assets' AND column_name = 'batch_tagged_by') THEN
    ALTER TABLE public.media_assets ADD COLUMN batch_tagged_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_media_assets_project_code ON public.media_assets(project_code);
CREATE INDEX IF NOT EXISTS idx_media_assets_face_status ON public.media_assets(face_detection_status);
CREATE INDEX IF NOT EXISTS idx_media_assets_ai_suggestions ON public.media_assets USING GIN(ai_tag_suggestions);
