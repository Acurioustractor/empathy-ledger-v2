-- Video Links Table for External Video Management (Descript, YouTube, Vimeo, etc.)
-- Supports custom thumbnails, tagging, and metadata management

CREATE TABLE IF NOT EXISTS public.video_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  title TEXT NOT NULL,
  description TEXT,

  -- Video source
  video_url TEXT NOT NULL,  -- Original URL (e.g., Descript share link)
  embed_url TEXT,           -- Processed embed URL
  platform TEXT NOT NULL DEFAULT 'descript' CHECK (platform IN ('descript', 'youtube', 'vimeo', 'loom', 'wistia', 'other')),

  -- Thumbnails
  thumbnail_url TEXT,        -- Custom or auto-generated thumbnail
  custom_thumbnail_url TEXT, -- User-uploaded custom thumbnail

  -- Metadata
  duration INTEGER,          -- Duration in seconds
  recorded_at TIMESTAMPTZ,   -- When the video was recorded

  -- Organization
  project_code TEXT,         -- ACT project code
  cultural_sensitivity_level TEXT DEFAULT 'public' CHECK (cultural_sensitivity_level IN ('public', 'sensitive', 'sacred', 'restricted')),
  requires_elder_approval BOOLEAN DEFAULT false,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'processing', 'error')),
  processing_notes TEXT,

  -- Relationships
  tenant_id UUID REFERENCES public.tenants(id),
  created_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Tags Junction Table (reuses existing tags table)
CREATE TABLE IF NOT EXISTS public.video_link_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_link_id UUID NOT NULL REFERENCES public.video_links(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai_suggested', 'batch')),
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_link_id, tag_id)
);

-- Video Storytellers Junction Table
CREATE TABLE IF NOT EXISTS public.video_link_storytellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_link_id UUID NOT NULL REFERENCES public.video_links(id) ON DELETE CASCADE,
  storyteller_id UUID NOT NULL REFERENCES public.storytellers(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'appears_in' CHECK (relationship IN (
    'appears_in', 'interviewer', 'interviewee', 'narrator', 'producer', 'featured'
  )),
  consent_status TEXT DEFAULT 'pending' CHECK (consent_status IN ('pending', 'granted', 'declined', 'not_required')),
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_link_id, storyteller_id, relationship)
);

-- Video Locations Table
CREATE TABLE IF NOT EXISTS public.video_link_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_link_id UUID NOT NULL REFERENCES public.video_links(id) ON DELETE CASCADE UNIQUE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  mapbox_place_id TEXT,
  mapbox_place_name TEXT,
  indigenous_territory TEXT,
  traditional_name TEXT,
  locality TEXT,
  region TEXT,
  country TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'mapbox_search', 'mapbox_click')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_links_platform ON public.video_links(platform);
CREATE INDEX IF NOT EXISTS idx_video_links_project ON public.video_links(project_code);
CREATE INDEX IF NOT EXISTS idx_video_links_status ON public.video_links(status);
CREATE INDEX IF NOT EXISTS idx_video_links_created ON public.video_links(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_link_tags_video ON public.video_link_tags(video_link_id);
CREATE INDEX IF NOT EXISTS idx_video_link_tags_tag ON public.video_link_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_video_link_storytellers_video ON public.video_link_storytellers(video_link_id);
CREATE INDEX IF NOT EXISTS idx_video_link_storytellers_storyteller ON public.video_link_storytellers(storyteller_id);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_video_links_search ON public.video_links USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_video_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS video_links_updated_at ON public.video_links;
CREATE TRIGGER video_links_updated_at
  BEFORE UPDATE ON public.video_links
  FOR EACH ROW
  EXECUTE FUNCTION update_video_links_updated_at();

-- RLS Policies
ALTER TABLE public.video_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_link_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_link_storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_link_locations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read video links
CREATE POLICY "video_links_select_authenticated" ON public.video_links
  FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users to insert video links
CREATE POLICY "video_links_insert_authenticated" ON public.video_links
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update video links
CREATE POLICY "video_links_update_authenticated" ON public.video_links
  FOR UPDATE TO authenticated
  USING (true);

-- Allow authenticated users to delete video links
CREATE POLICY "video_links_delete_authenticated" ON public.video_links
  FOR DELETE TO authenticated
  USING (true);

-- Similar policies for junction tables
CREATE POLICY "video_link_tags_all_authenticated" ON public.video_link_tags
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "video_link_storytellers_all_authenticated" ON public.video_link_storytellers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "video_link_locations_all_authenticated" ON public.video_link_locations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Service role policies
CREATE POLICY "video_links_service_role" ON public.video_links
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "video_link_tags_service_role" ON public.video_link_tags
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "video_link_storytellers_service_role" ON public.video_link_storytellers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "video_link_locations_service_role" ON public.video_link_locations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE public.video_links IS 'External video links (Descript, YouTube, etc.) with metadata and tagging support';
