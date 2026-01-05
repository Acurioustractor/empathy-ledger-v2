-- Minimal Media Schema for Testing Media Usage Tracking
-- This creates only the essential tables needed for media usage tracking
-- Created: 2025-09-07

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Minimal profiles table (just for references)
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    display_name text,
    community_roles jsonb DEFAULT '[]'
);

-- Minimal organizations table (just for references) 
CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    name text NOT NULL
);

-- Stories table (needed for media usage tracking)
CREATE TABLE IF NOT EXISTS stories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    title text NOT NULL,
    author_id uuid REFERENCES profiles(id)
);

-- Media Assets table (core for media tracking)
CREATE TABLE IF NOT EXISTS media_assets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Basic file information
    filename text NOT NULL,
    file_type text NOT NULL,
    mime_type text NOT NULL DEFAULT 'application/octet-stream',
    file_size bigint NOT NULL DEFAULT 0,
    
    -- Storage information
    storage_path text NOT NULL DEFAULT '',
    public_url text,
    thumbnail_url text,
    
    -- Media dimensions
    duration integer,
    
    -- Ownership
    uploaded_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Cultural context
    cultural_sensitivity_level text DEFAULT 'medium' CHECK (cultural_sensitivity_level IN ('low', 'medium', 'high')),
    ceremonial_content boolean DEFAULT false,
    traditional_knowledge boolean DEFAULT false,
    
    -- Status fields
    consent_status text DEFAULT 'pending' CHECK (consent_status IN ('pending', 'granted', 'denied', 'expired')),
    cultural_review_status text DEFAULT 'pending' CHECK (cultural_review_status IN ('pending', 'approved', 'rejected', 'needs_review')),
    cultural_review_notes text,
    cultural_review_date timestamptz,
    
    -- Basic metadata
    title text,
    description text
);

-- Galleries table
CREATE TABLE IF NOT EXISTS galleries (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    title text NOT NULL,
    description text,
    created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
    visibility text DEFAULT 'private' CHECK (visibility IN ('public', 'community', 'organization', 'private'))
);

-- Gallery Media Associations
CREATE TABLE IF NOT EXISTS gallery_media_associations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now() NOT NULL,
    
    gallery_id uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
    media_asset_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    
    sort_order integer DEFAULT 0,
    is_cover_image boolean DEFAULT false,
    caption text,
    cultural_context text,
    
    UNIQUE(gallery_id, media_asset_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_media_associations ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Allow all for authenticated users" ON profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON organizations FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON stories FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON media_assets FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON galleries FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON gallery_media_associations FOR ALL TO authenticated USING (true);

-- Update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update triggers
CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_galleries_updated_at BEFORE UPDATE ON galleries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Insert test data
INSERT INTO profiles (id, display_name, community_roles) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Test User', '["admin"]'::jsonb),
    ('550e8400-e29b-41d4-a716-446655440001', 'Elder User', '["elder"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO organizations (id, name) VALUES
    ('550e8400-e29b-41d4-a716-446655440010', 'Test Organization')
ON CONFLICT (id) DO NOTHING;