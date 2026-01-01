-- Comprehensive Photo Gallery System Schema for Empathy Ledger
-- Respects Indigenous cultural protocols and consent requirements
-- Created: 2025-09-05

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Media Assets table (foundation for all media)
CREATE TABLE IF NOT EXISTS media_assets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Basic file information
    filename text NOT NULL,
    original_filename text NOT NULL,
    file_type text NOT NULL, -- 'image', 'video', 'audio', 'document'
    mime_type text NOT NULL,
    file_size bigint NOT NULL,
    
    -- Storage information
    storage_bucket text NOT NULL,
    storage_path text NOT NULL,
    public_url text,
    thumbnail_url text,
    optimized_url text,
    
    -- Media dimensions (for images/videos)
    width integer,
    height integer,
    duration integer, -- seconds for video/audio
    
    -- Ownership and permissions
    uploaded_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
    
    -- Cultural context
    cultural_context jsonb DEFAULT '{}',
    cultural_sensitivity_level text DEFAULT 'medium' CHECK (cultural_sensitivity_level IN ('low', 'medium', 'high')),
    ceremonial_content boolean DEFAULT false,
    traditional_knowledge boolean DEFAULT false,
    
    -- Consent and approvals
    consent_status text DEFAULT 'pending' CHECK (consent_status IN ('pending', 'granted', 'denied', 'expired')),
    consent_metadata jsonb DEFAULT '{}',
    elder_approval boolean,
    elder_approved_by uuid REFERENCES profiles(id),
    elder_approval_date timestamptz,
    cultural_review_status text DEFAULT 'pending' CHECK (cultural_review_status IN ('pending', 'approved', 'rejected', 'needs_review')),
    cultural_reviewer_id uuid REFERENCES profiles(id),
    cultural_review_date timestamptz,
    cultural_review_notes text,
    
    -- Visibility and access
    visibility text DEFAULT 'private' CHECK (visibility IN ('public', 'community', 'organization', 'private')),
    access_restrictions jsonb DEFAULT '{}', -- gender, age, cultural restrictions
    
    -- Metadata
    title text,
    description text,
    alt_text text, -- accessibility
    tags text[] DEFAULT '{}',
    location_data jsonb, -- structured location information
    capture_date date,
    
    -- Processing status
    processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_metadata jsonb DEFAULT '{}',
    
    -- Audit
    last_accessed_at timestamptz,
    access_count integer DEFAULT 0
);

-- Galleries table for organizing collections of photos
CREATE TABLE IF NOT EXISTS galleries (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Basic information
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    cover_image_id uuid REFERENCES media_assets(id),
    
    -- Ownership
    created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
    
    -- Cultural context
    cultural_theme text, -- 'ceremony', 'community', 'traditional_practices', 'contemporary', 'family'
    cultural_context jsonb DEFAULT '{}',
    cultural_significance text,
    cultural_sensitivity_level text DEFAULT 'medium' CHECK (cultural_sensitivity_level IN ('low', 'medium', 'high')),
    
    -- Ceremonial and traditional context
    ceremony_type text,
    ceremony_date date,
    ceremony_location text,
    seasonal_context text, -- spring, summer, fall, winter, or specific cultural seasons
    traditional_knowledge_content boolean DEFAULT false,
    
    -- Consent and permissions
    requires_elder_approval boolean DEFAULT false,
    elder_approval_status text DEFAULT 'not_required' CHECK (elder_approval_status IN ('not_required', 'pending', 'approved', 'denied')),
    elder_approved_by uuid REFERENCES profiles(id),
    elder_approval_date timestamptz,
    
    -- Cultural review
    cultural_review_status text DEFAULT 'pending' CHECK (cultural_review_status IN ('pending', 'approved', 'rejected', 'needs_review')),
    cultural_reviewer_id uuid REFERENCES profiles(id),
    cultural_review_date timestamptz,
    cultural_review_notes text,
    
    -- Access and visibility
    visibility text DEFAULT 'private' CHECK (visibility IN ('public', 'community', 'organization', 'private')),
    access_restrictions jsonb DEFAULT '{}',
    viewing_permissions jsonb DEFAULT '{}',
    
    -- Gallery settings
    allow_downloads boolean DEFAULT false,
    allow_comments boolean DEFAULT true,
    show_metadata boolean DEFAULT true,
    auto_generate_thumbnails boolean DEFAULT true,
    
    -- Status and metrics
    status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
    photo_count integer DEFAULT 0,
    view_count integer DEFAULT 0,
    featured boolean DEFAULT false,
    
    -- Geographic context
    location_context jsonb, -- traditional territory, specific locations
    
    -- Relationships to stories
    related_story_ids uuid[] DEFAULT '{}'
);

-- Gallery Media Associations (many-to-many)
CREATE TABLE IF NOT EXISTS gallery_media_associations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    
    gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
    media_asset_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    
    -- Position and display
    sort_order integer DEFAULT 0,
    is_cover_image boolean DEFAULT false,
    
    -- Individual photo context within gallery
    caption text,
    cultural_context text,
    location_in_ceremony text,
    people_depicted text[], -- general descriptions, not specific names for privacy
    
    -- Specific permissions for this photo in this gallery
    visibility_override text CHECK (visibility_override IN ('public', 'community', 'organization', 'private')),
    consent_status text DEFAULT 'pending' CHECK (consent_status IN ('pending', 'granted', 'denied', 'expired')),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(gallery_id, media_asset_id)
);

-- Cultural Tags for categorizing content
CREATE TABLE IF NOT EXISTS cultural_tags (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    description text,
    category text NOT NULL, -- 'ceremony', 'location', 'practice', 'season', 'people_group', 'art_form'
    
    -- Cultural significance
    cultural_sensitivity_level text DEFAULT 'low' CHECK (cultural_sensitivity_level IN ('low', 'medium', 'high')),
    requires_elder_approval boolean DEFAULT false,
    access_restrictions jsonb DEFAULT '{}',
    
    -- Hierarchical structure
    parent_tag_id uuid REFERENCES cultural_tags(id),
    tag_hierarchy text[], -- breadcrumb path
    
    -- Usage tracking
    usage_count integer DEFAULT 0,
    
    -- Cultural context
    traditional_name text,
    cultural_protocols text,
    appropriate_contexts text[]
);

-- Junction table for media asset cultural tags
CREATE TABLE IF NOT EXISTS media_cultural_tags (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    
    media_asset_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    cultural_tag_id uuid NOT NULL REFERENCES cultural_tags(id) ON DELETE CASCADE,
    
    -- Tag context for this specific media
    context_notes text,
    confidence_level text DEFAULT 'high' CHECK (confidence_level IN ('low', 'medium', 'high')),
    tagged_by uuid REFERENCES profiles(id),
    
    -- Cultural validation
    elder_validated boolean DEFAULT false,
    elder_validated_by uuid REFERENCES profiles(id),
    elder_validation_date timestamptz,
    
    UNIQUE(media_asset_id, cultural_tag_id)
);

-- People in Photos (respecting privacy and consent)
CREATE TABLE IF NOT EXISTS photo_people (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    
    media_asset_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    
    -- Person identification (flexible, privacy-respecting)
    profile_id uuid REFERENCES profiles(id), -- if person has a profile and consents
    display_name text, -- how they want to be identified, if at all
    relationship_to_subject text, -- 'elder', 'youth', 'family_member', 'community_member'
    
    -- Visual positioning (for photo tagging)
    position_data jsonb, -- coordinates or regions in the photo
    
    -- Consent and permissions
    identification_consent boolean DEFAULT false,
    public_identification_consent boolean DEFAULT false,
    consent_date timestamptz,
    consent_expiry timestamptz,
    
    -- Cultural context
    cultural_role text, -- their role in ceremony/event depicted
    significance_notes text,
    
    -- Privacy protection
    anonymization_level text DEFAULT 'full' CHECK (anonymization_level IN ('none', 'partial', 'full')),
    
    UNIQUE(media_asset_id, profile_id) -- prevent duplicate tagging of same person
);

-- Cultural Locations for geographic/cultural context
CREATE TABLE IF NOT EXISTS cultural_locations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    
    name text NOT NULL,
    traditional_name text,
    description text,
    
    -- Geographic data
    coordinates point, -- PostGIS point if available
    region text,
    traditional_territory text,
    
    -- Cultural significance
    cultural_significance text,
    ceremonial_importance text,
    access_restrictions text,
    cultural_protocols text,
    
    -- Seasonal considerations
    seasonal_access jsonb, -- when it's appropriate to visit/photograph
    ceremony_calendar jsonb, -- times when it might be restricted
    
    -- Permissions and protocols
    requires_permission boolean DEFAULT false,
    permission_contact text,
    cultural_sensitivity_level text DEFAULT 'medium' CHECK (cultural_sensitivity_level IN ('low', 'medium', 'high')),
    
    -- Usage tracking
    photo_count integer DEFAULT 0,
    story_count integer DEFAULT 0
);

-- Link media assets to cultural locations
CREATE TABLE IF NOT EXISTS media_locations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    
    media_asset_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    cultural_location_id uuid NOT NULL REFERENCES cultural_locations(id) ON DELETE CASCADE,
    
    -- Specific context for this photo at this location
    context_notes text,
    date_taken date,
    cultural_event text,
    
    UNIQUE(media_asset_id, cultural_location_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by ON media_assets(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_assets_organization ON media_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_cultural_sensitivity ON media_assets(cultural_sensitivity_level);
CREATE INDEX IF NOT EXISTS idx_media_assets_consent_status ON media_assets(consent_status);
CREATE INDEX IF NOT EXISTS idx_media_assets_visibility ON media_assets(visibility);
CREATE INDEX IF NOT EXISTS idx_media_assets_tags ON media_assets USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_media_assets_cultural_context ON media_assets USING gin(cultural_context);

CREATE INDEX IF NOT EXISTS idx_galleries_created_by ON galleries(created_by);
CREATE INDEX IF NOT EXISTS idx_galleries_organization ON galleries(organization_id);
CREATE INDEX IF NOT EXISTS idx_galleries_cultural_theme ON galleries(cultural_theme);
CREATE INDEX IF NOT EXISTS idx_galleries_status ON galleries(status);
CREATE INDEX IF NOT EXISTS idx_galleries_visibility ON galleries(visibility);

CREATE INDEX IF NOT EXISTS idx_gallery_media_gallery ON gallery_media_associations(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_media_asset ON gallery_media_associations(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_gallery_media_sort_order ON gallery_media_associations(sort_order);

CREATE INDEX IF NOT EXISTS idx_cultural_tags_category ON cultural_tags(category);
CREATE INDEX IF NOT EXISTS idx_cultural_tags_sensitivity ON cultural_tags(cultural_sensitivity_level);

CREATE INDEX IF NOT EXISTS idx_media_cultural_tags_media ON media_cultural_tags(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_cultural_tags_tag ON media_cultural_tags(cultural_tag_id);

-- Row Level Security (RLS) Policies
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_media_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_cultural_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_assets
CREATE POLICY "Users can view public media" ON media_assets
    FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can view community media if they are authenticated" ON media_assets
    FOR SELECT USING (
        visibility = 'community' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can view their own media" ON media_assets
    FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Users can upload media" ON media_assets
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update their own media" ON media_assets
    FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own media" ON media_assets
    FOR DELETE USING (uploaded_by = auth.uid());

-- RLS Policies for galleries
CREATE POLICY "Users can view public galleries" ON galleries
    FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can view community galleries if authenticated" ON galleries
    FOR SELECT USING (
        visibility = 'community' AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can view their own galleries" ON galleries
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create galleries" ON galleries
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own galleries" ON galleries
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own galleries" ON galleries
    FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for gallery_media_associations
CREATE POLICY "Users can view associations for visible galleries" ON gallery_media_associations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM galleries g 
            WHERE g.id = gallery_id 
            AND (
                g.visibility = 'public' OR 
                (g.visibility = 'community' AND auth.role() = 'authenticated') OR 
                g.created_by = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage associations for their galleries" ON gallery_media_associations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM galleries g 
            WHERE g.id = gallery_id AND g.created_by = auth.uid()
        )
    );

-- Update functions for maintaining counts and timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_galleries_updated_at BEFORE UPDATE ON galleries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update gallery photo count
CREATE OR REPLACE FUNCTION update_gallery_photo_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE galleries 
        SET photo_count = (
            SELECT COUNT(*) FROM gallery_media_associations 
            WHERE gallery_id = NEW.gallery_id
        )
        WHERE id = NEW.gallery_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE galleries 
        SET photo_count = (
            SELECT COUNT(*) FROM gallery_media_associations 
            WHERE gallery_id = OLD.gallery_id
        )
        WHERE id = OLD.gallery_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply photo count triggers
CREATE TRIGGER update_gallery_photo_count_trigger
    AFTER INSERT OR DELETE ON gallery_media_associations
    FOR EACH ROW EXECUTE FUNCTION update_gallery_photo_count();

-- Function to update cultural tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE cultural_tags 
        SET usage_count = usage_count + 1
        WHERE id = NEW.cultural_tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE cultural_tags 
        SET usage_count = usage_count - 1
        WHERE id = OLD.cultural_tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply tag usage count trigger
CREATE TRIGGER update_tag_usage_count_trigger
    AFTER INSERT OR DELETE ON media_cultural_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Insert some initial cultural tags
INSERT INTO cultural_tags (name, slug, description, category, cultural_sensitivity_level) VALUES
    ('Ceremony', 'ceremony', 'Traditional ceremonial content', 'ceremony', 'high'),
    ('Community Gathering', 'community-gathering', 'Community events and gatherings', 'ceremony', 'medium'),
    ('Traditional Practices', 'traditional-practices', 'Traditional cultural practices', 'practice', 'high'),
    ('Elders', 'elders', 'Content featuring community elders', 'people_group', 'medium'),
    ('Youth', 'youth', 'Content featuring young community members', 'people_group', 'low'),
    ('Traditional Territory', 'traditional-territory', 'Photos taken on traditional territory', 'location', 'medium'),
    ('Sacred Site', 'sacred-site', 'Sacred or spiritually significant locations', 'location', 'high'),
    ('Art and Crafts', 'art-crafts', 'Traditional and contemporary art forms', 'art_form', 'low'),
    ('Storytelling', 'storytelling', 'Storytelling events and sessions', 'practice', 'low'),
    ('Seasonal Activities', 'seasonal-activities', 'Activities tied to seasons', 'season', 'low')
ON CONFLICT (slug) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE media_assets IS 'Central table for all media files with cultural protocols and consent management';
COMMENT ON TABLE galleries IS 'Collections of photos organized by theme, event, or cultural significance';
COMMENT ON TABLE gallery_media_associations IS 'Many-to-many relationship between galleries and media assets';
COMMENT ON TABLE cultural_tags IS 'Cultural categorization system respecting Indigenous protocols';
COMMENT ON TABLE media_cultural_tags IS 'Tags applied to media with cultural validation';
COMMENT ON TABLE photo_people IS 'Privacy-respecting people identification in photos';
COMMENT ON TABLE cultural_locations IS 'Culturally significant locations with access protocols';
COMMENT ON TABLE media_locations IS 'Links between media and cultural locations';