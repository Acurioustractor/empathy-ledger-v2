-- Gallery System Enhancements
-- Improved cross-linking between galleries, stories, profiles, and projects
-- Created: 2025-09-11

-- 1. Story-Gallery Bidirectional Links
CREATE TABLE IF NOT EXISTS story_gallery_links (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    
    story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
    
    -- Link context
    link_type text DEFAULT 'related' CHECK (link_type IN ('featured', 'supporting', 'background', 'context', 'related')),
    description text, -- How this gallery relates to the story
    display_order integer DEFAULT 0,
    
    -- Metadata
    created_by uuid REFERENCES profiles(id),
    
    UNIQUE(story_id, gallery_id)
);

-- 2. Enhanced Storyteller-Gallery Relationships
CREATE TABLE IF NOT EXISTS storyteller_gallery_collections (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    
    storyteller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
    
    -- Relationship context
    collection_type text DEFAULT 'contributed' CHECK (collection_type IN ('authored', 'featured', 'contributed', 'appeared_in')),
    role text, -- 'photographer', 'subject', 'cultural_guide', 'community_member', 'elder'
    contribution_description text,
    
    -- Permissions and consent
    consent_given boolean DEFAULT false,
    consent_date timestamptz,
    featured_consent boolean DEFAULT false, -- consent to be featured prominently
    
    UNIQUE(storyteller_id, gallery_id, collection_type)
);

-- 3. Media Usage Tracking Enhancements
CREATE TABLE IF NOT EXISTS media_usage_tracking (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    
    media_asset_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    
    -- Usage context
    used_in_type text NOT NULL CHECK (used_in_type IN ('story', 'gallery', 'project', 'profile', 'transcript')),
    used_in_id uuid NOT NULL, -- reference to the containing entity
    usage_role text, -- 'cover', 'featured', 'inline', 'background', 'thumbnail'
    usage_context jsonb DEFAULT '{}',
    
    -- Tracking
    added_by uuid REFERENCES profiles(id),
    added_at timestamptz DEFAULT now(),
    
    UNIQUE(media_asset_id, used_in_type, used_in_id)
);

-- 4. Gallery Collections (for organizing galleries)
CREATE TABLE IF NOT EXISTS gallery_collections (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Basic info
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    
    -- Ownership
    created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
    project_id uuid REFERENCES projects(id) ON DELETE SET NULL, -- optional project association
    
    -- Cultural context
    cultural_theme text,
    cultural_significance text,
    cultural_sensitivity_level text DEFAULT 'medium' CHECK (cultural_sensitivity_level IN ('low', 'medium', 'high')),
    
    -- Access
    visibility text DEFAULT 'private' CHECK (visibility IN ('public', 'community', 'organization', 'private')),
    
    -- Stats
    gallery_count integer DEFAULT 0,
    total_media_count integer DEFAULT 0,
    featured boolean DEFAULT false,
    
    -- Ordering
    display_order integer DEFAULT 0
);

-- 5. Gallery to Collection Links
CREATE TABLE IF NOT EXISTS gallery_collection_links (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    
    gallery_collection_id uuid NOT NULL REFERENCES gallery_collections(id) ON DELETE CASCADE,
    gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
    
    -- Context in collection
    display_order integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    collection_notes text,
    
    UNIQUE(gallery_collection_id, gallery_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_story_gallery_links_story ON story_gallery_links(story_id);
CREATE INDEX IF NOT EXISTS idx_story_gallery_links_gallery ON story_gallery_links(gallery_id);
CREATE INDEX IF NOT EXISTS idx_story_gallery_links_type ON story_gallery_links(link_type);

CREATE INDEX IF NOT EXISTS idx_storyteller_galleries_storyteller ON storyteller_gallery_collections(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_galleries_gallery ON storyteller_gallery_collections(gallery_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_galleries_type ON storyteller_gallery_collections(collection_type);

CREATE INDEX IF NOT EXISTS idx_media_usage_media ON media_usage_tracking(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_type_id ON media_usage_tracking(used_in_type, used_in_id);

CREATE INDEX IF NOT EXISTS idx_gallery_collections_creator ON gallery_collections(created_by);
CREATE INDEX IF NOT EXISTS idx_gallery_collections_org ON gallery_collections(organization_id);
CREATE INDEX IF NOT EXISTS idx_gallery_collections_project ON gallery_collections(project_id);

CREATE INDEX IF NOT EXISTS idx_gallery_collection_links_collection ON gallery_collection_links(gallery_collection_id);
CREATE INDEX IF NOT EXISTS idx_gallery_collection_links_gallery ON gallery_collection_links(gallery_id);

-- Add triggers for updated_at
CREATE TRIGGER update_gallery_collections_updated_at 
    BEFORE UPDATE ON gallery_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add functions to maintain counts
CREATE OR REPLACE FUNCTION update_gallery_collection_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE gallery_collections 
        SET gallery_count = (
            SELECT COUNT(*) FROM gallery_collection_links 
            WHERE gallery_collection_id = NEW.gallery_collection_id
        )
        WHERE id = NEW.gallery_collection_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE gallery_collections 
        SET gallery_count = (
            SELECT COUNT(*) FROM gallery_collection_links 
            WHERE gallery_collection_id = OLD.gallery_collection_id
        )
        WHERE id = OLD.gallery_collection_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gallery_collection_counts_trigger
    AFTER INSERT OR DELETE ON gallery_collection_links
    FOR EACH ROW EXECUTE FUNCTION update_gallery_collection_counts();

-- RLS Policies for new tables
ALTER TABLE story_gallery_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_gallery_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_collection_links ENABLE ROW LEVEL SECURITY;

-- Story-Gallery Links RLS
CREATE POLICY "Users can view story-gallery links for accessible stories" ON story_gallery_links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stories s 
            WHERE s.id = story_id 
            AND (s.status = 'published' OR s.author_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage story-gallery links for their stories" ON story_gallery_links
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM stories s 
            WHERE s.id = story_id AND s.author_id = auth.uid()
        )
    );

-- Storyteller-Gallery Collections RLS
CREATE POLICY "Users can view storyteller galleries" ON storyteller_gallery_collections
    FOR SELECT USING (
        storyteller_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM galleries g 
            WHERE g.id = gallery_id 
            AND (g.visibility = 'public' OR g.created_by = auth.uid())
        )
    );

CREATE POLICY "Users can manage their own storyteller galleries" ON storyteller_gallery_collections
    FOR ALL USING (storyteller_id = auth.uid());

-- Comments for documentation
COMMENT ON TABLE story_gallery_links IS 'Bidirectional links between stories and galleries with context';
COMMENT ON TABLE storyteller_gallery_collections IS 'Enhanced relationships between storytellers and galleries';
COMMENT ON TABLE media_usage_tracking IS 'Tracks where media assets are used across the platform';
COMMENT ON TABLE gallery_collections IS 'Organized collections of galleries for better curation';
COMMENT ON TABLE gallery_collection_links IS 'Links galleries to collections with ordering';