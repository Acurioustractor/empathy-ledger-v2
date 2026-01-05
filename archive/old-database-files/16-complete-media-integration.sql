-- Complete Media Integration Enhancement
-- Links all content types to the centralized media system
-- Created: 2025-09-07

-- 1. Enhance profiles table for media support
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_media_id uuid REFERENCES media_assets(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_media_id uuid REFERENCES media_assets(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_media_ids uuid[] DEFAULT '{}';

-- 2. Create stories_media_associations table (to replace linked_media array)
CREATE TABLE IF NOT EXISTS stories_media_associations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now() NOT NULL,
    
    story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    media_asset_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    
    -- Usage context within story
    usage_role text DEFAULT 'supporting' CHECK (usage_role IN ('hero', 'cover', 'supporting', 'attachment', 'thumbnail')),
    display_order integer DEFAULT 0,
    caption text,
    timestamp_in_story integer, -- For video chapters/audio cues
    
    -- Override default media settings for this story context
    visibility_override text CHECK (visibility_override IN ('public', 'community', 'organization', 'private')),
    
    UNIQUE(story_id, media_asset_id)
);

-- 3. Add media support to stories table (keeping existing fields for backward compatibility)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES profiles(id);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS cover_media_id uuid REFERENCES media_assets(id);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS hero_media_id uuid REFERENCES media_assets(id);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS featured_video_id uuid REFERENCES media_assets(id);

-- 4. Create profile_media_associations (for storyteller portfolios)
CREATE TABLE IF NOT EXISTS profile_media_associations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now() NOT NULL,
    
    profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    media_asset_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    
    -- Portfolio context
    category text DEFAULT 'work' CHECK (category IN ('work', 'personal', 'ceremonial', 'teaching', 'archive')),
    display_order integer DEFAULT 0,
    description text,
    is_featured boolean DEFAULT false,
    date_created date,
    
    -- Cultural context for this person's work
    cultural_significance text,
    story_behind_media text,
    
    UNIQUE(profile_id, media_asset_id)
);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_media_story ON stories_media_associations(story_id);
CREATE INDEX IF NOT EXISTS idx_stories_media_asset ON stories_media_associations(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_stories_media_role ON stories_media_associations(usage_role);

CREATE INDEX IF NOT EXISTS idx_profile_media_profile ON profile_media_associations(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_media_asset ON profile_media_associations(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_profile_media_featured ON profile_media_associations(is_featured);

CREATE INDEX IF NOT EXISTS idx_profiles_avatar ON profiles(avatar_media_id);
CREATE INDEX IF NOT EXISTS idx_profiles_cover ON profiles(cover_media_id);

CREATE INDEX IF NOT EXISTS idx_stories_author ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_cover ON stories(cover_media_id);
CREATE INDEX IF NOT EXISTS idx_stories_hero ON stories(hero_media_id);

-- 6. Enable RLS
ALTER TABLE stories_media_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_media_associations ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for stories_media_associations
CREATE POLICY "Users can view story media associations" ON stories_media_associations
    FOR SELECT USING (
        -- Public stories
        EXISTS (SELECT 1 FROM stories s WHERE s.id = story_id AND s.status = 'published') OR
        -- Own stories
        EXISTS (SELECT 1 FROM stories s WHERE s.id = story_id AND s.author_id = auth.uid()) OR
        -- Admin access
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.community_roles @> '["admin"]'::jsonb)
    );

CREATE POLICY "Users can manage their story media" ON stories_media_associations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM stories s WHERE s.id = story_id AND s.author_id = auth.uid())
    );

-- 8. RLS Policies for profile_media_associations  
CREATE POLICY "Users can view public profile media" ON profile_media_associations
    FOR SELECT USING (
        -- Own portfolio
        profile_id = auth.uid() OR
        -- Public profiles (we can add profile visibility later)
        true
    );

CREATE POLICY "Users can manage their own portfolio" ON profile_media_associations
    FOR ALL USING (profile_id = auth.uid());

-- 9. Function to automatically track story media usage
CREATE OR REPLACE FUNCTION track_story_media_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO media_usage_tracking (
            media_asset_id,
            used_in_type,
            used_in_id,
            usage_context,
            usage_role,
            display_order,
            added_by
        ) VALUES (
            NEW.media_asset_id,
            'story',
            NEW.story_id,
            NEW.caption,
            NEW.usage_role,
            NEW.display_order,
            (SELECT author_id FROM stories WHERE id = NEW.story_id)
        )
        ON CONFLICT (media_asset_id, used_in_type, used_in_id) 
        DO UPDATE SET
            usage_context = EXCLUDED.usage_context,
            usage_role = EXCLUDED.usage_role,
            display_order = EXCLUDED.display_order,
            updated_at = now(),
            removed_at = NULL;
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE media_usage_tracking 
        SET 
            usage_context = NEW.caption,
            usage_role = NEW.usage_role,
            display_order = NEW.display_order,
            updated_at = now()
        WHERE media_asset_id = NEW.media_asset_id 
        AND used_in_type = 'story' 
        AND used_in_id = NEW.story_id;
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE media_usage_tracking 
        SET 
            removed_at = now(),
            updated_at = now()
        WHERE media_asset_id = OLD.media_asset_id 
        AND used_in_type = 'story' 
        AND used_in_id = OLD.story_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Function to automatically track profile media usage
CREATE OR REPLACE FUNCTION track_profile_media_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO media_usage_tracking (
            media_asset_id,
            used_in_type,
            used_in_id,
            usage_context,
            usage_role,
            display_order,
            added_by
        ) VALUES (
            NEW.media_asset_id,
            'profile',
            NEW.profile_id,
            COALESCE(NEW.description, NEW.cultural_significance),
            NEW.category,
            NEW.display_order,
            NEW.profile_id
        )
        ON CONFLICT (media_asset_id, used_in_type, used_in_id) 
        DO UPDATE SET
            usage_context = EXCLUDED.usage_context,
            usage_role = EXCLUDED.usage_role,
            display_order = EXCLUDED.display_order,
            updated_at = now(),
            removed_at = NULL;
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE media_usage_tracking 
        SET removed_at = now(), updated_at = now()
        WHERE media_asset_id = OLD.media_asset_id 
        AND used_in_type = 'profile' 
        AND used_in_id = OLD.profile_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Apply triggers
CREATE TRIGGER story_media_usage_tracking_trigger
    AFTER INSERT OR UPDATE OR DELETE ON stories_media_associations
    FOR EACH ROW EXECUTE FUNCTION track_story_media_usage();

CREATE TRIGGER profile_media_usage_tracking_trigger
    AFTER INSERT OR DELETE ON profile_media_associations
    FOR EACH ROW EXECUTE FUNCTION track_profile_media_usage();

-- 12. Function to migrate existing story media links
CREATE OR REPLACE FUNCTION migrate_existing_story_media()
RETURNS void AS $$
DECLARE
    story_record RECORD;
    media_id uuid;
BEGIN
    -- Migrate stories with story_image_url to media_assets if not already there
    FOR story_record IN 
        SELECT id, title, story_image_url, video_story_link 
        FROM stories 
        WHERE story_image_url IS NOT NULL OR video_story_link IS NOT NULL
    LOOP
        -- For now, we'll create placeholder media records for external URLs
        -- In a real migration, you'd download and import these files
        
        IF story_record.story_image_url IS NOT NULL THEN
            -- Check if media asset already exists for this URL
            SELECT id INTO media_id FROM media_assets 
            WHERE public_url = story_record.story_image_url;
            
            IF media_id IS NULL THEN
                -- Create placeholder media asset
                INSERT INTO media_assets (
                    filename, 
                    file_type, 
                    mime_type, 
                    file_size, 
                    storage_path, 
                    public_url,
                    title,
                    uploaded_by
                ) VALUES (
                    'migrated_' || replace(story_record.title, ' ', '_') || '_image',
                    'image',
                    'image/jpeg',
                    0,
                    'external/' || story_record.id,
                    story_record.story_image_url,
                    story_record.title || ' - Story Image',
                    (SELECT id FROM profiles LIMIT 1) -- Default uploader
                ) RETURNING id INTO media_id;
            END IF;
            
            -- Link to story as cover image
            UPDATE stories SET cover_media_id = media_id WHERE id = story_record.id;
            
            -- Create story media association
            INSERT INTO stories_media_associations (story_id, media_asset_id, usage_role, caption)
            VALUES (story_record.id, media_id, 'cover', 'Story cover image')
            ON CONFLICT (story_id, media_asset_id) DO NOTHING;
        END IF;
        
        -- Similar process for video_story_link
        IF story_record.video_story_link IS NOT NULL THEN
            SELECT id INTO media_id FROM media_assets 
            WHERE public_url = story_record.video_story_link;
            
            IF media_id IS NULL THEN
                INSERT INTO media_assets (
                    filename, 
                    file_type, 
                    mime_type, 
                    file_size, 
                    storage_path, 
                    public_url,
                    title,
                    uploaded_by
                ) VALUES (
                    'migrated_' || replace(story_record.title, ' ', '_') || '_video',
                    'video',
                    'video/mp4',
                    0,
                    'external/' || story_record.id,
                    story_record.video_story_link,
                    story_record.title || ' - Story Video',
                    (SELECT id FROM profiles LIMIT 1)
                ) RETURNING id INTO media_id;
            END IF;
            
            -- Link to story as hero video
            UPDATE stories SET hero_media_id = media_id WHERE id = story_record.id;
            
            -- Create story media association
            INSERT INTO stories_media_associations (story_id, media_asset_id, usage_role, caption)
            VALUES (story_record.id, media_id, 'hero', 'Story hero video')
            ON CONFLICT (story_id, media_asset_id) DO NOTHING;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Story media migration completed';
END;
$$ LANGUAGE plpgsql;

-- 13. Comments for documentation
COMMENT ON TABLE stories_media_associations IS 'Links stories to media assets with role-based usage tracking';
COMMENT ON TABLE profile_media_associations IS 'Links profiles to media assets for storyteller portfolios';
COMMENT ON FUNCTION migrate_existing_story_media IS 'Migrates existing story image/video URLs to the centralized media system';

-- Grant permissions
GRANT SELECT ON stories_media_associations TO authenticated;
GRANT SELECT ON profile_media_associations TO authenticated;