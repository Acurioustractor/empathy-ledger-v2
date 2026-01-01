-- Media Usage Tracking System Enhancement (Fixed Version)
-- This enhancement tracks where media assets are used across the platform
-- Created: 2025-01-07
-- Fixed: Column name compatibility

-- First, let's check what columns exist in media_assets table
-- Run this to see the actual column names:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'media_assets' AND table_schema = 'public';

-- Create media usage tracking table
CREATE TABLE IF NOT EXISTS media_usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Media reference
  media_asset_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  
  -- Usage location
  used_in_type text NOT NULL CHECK (used_in_type IN ('story', 'gallery', 'profile', 'project', 'transcript')),
  used_in_id uuid NOT NULL,
  
  -- Usage context and metadata
  usage_context text,
  usage_role text, -- 'primary', 'cover', 'supporting', 'attachment'
  display_order integer DEFAULT 0,
  
  -- Tracking metadata
  added_by uuid REFERENCES profiles(id),
  added_at timestamptz DEFAULT now(),
  removed_at timestamptz,
  
  -- Usage analytics
  view_count integer DEFAULT 0,
  last_viewed_at timestamptz,
  
  -- Unique constraint to prevent duplicate usage entries
  UNIQUE(media_asset_id, used_in_type, used_in_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_usage_media_asset ON media_usage_tracking(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_used_in ON media_usage_tracking(used_in_type, used_in_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_added_by ON media_usage_tracking(added_by);
CREATE INDEX IF NOT EXISTS idx_media_usage_active ON media_usage_tracking(media_asset_id) WHERE removed_at IS NULL;

-- Enable Row Level Security
ALTER TABLE media_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media usage tracking (Fixed with proper column references)
CREATE POLICY "Users can view usage for their content" ON media_usage_tracking
    FOR SELECT USING (
        -- Users can see usage for media they uploaded (check actual column name)
        EXISTS (
            SELECT 1 FROM media_assets ma 
            WHERE ma.id = media_asset_id 
            AND (
                -- Try multiple possible column names for uploaded_by
                (ma.uploaded_by = auth.uid()) OR
                (ma.uploader_id = auth.uid()) OR  
                (ma.created_by = auth.uid())
            )
        ) OR
        -- Users can see usage for content they created
        (used_in_type = 'story' AND EXISTS (
            SELECT 1 FROM stories s WHERE s.id = used_in_id AND s.author_id = auth.uid()
        )) OR
        (used_in_type = 'gallery' AND EXISTS (
            SELECT 1 FROM galleries g WHERE g.id = used_in_id AND g.created_by = auth.uid()
        )) OR
        (used_in_type = 'profile' AND used_in_id::text = auth.uid()::text) OR
        -- Admins can see all usage
        auth.uid() IN (
            SELECT p.id FROM profiles p WHERE p.community_roles @> '["admin"]'::jsonb
        )
    );

CREATE POLICY "Users can track usage for their content" ON media_usage_tracking
    FOR INSERT WITH CHECK (
        -- Users can add usage tracking for media they uploaded
        EXISTS (
            SELECT 1 FROM media_assets ma 
            WHERE ma.id = media_asset_id 
            AND (
                (ma.uploaded_by = auth.uid()) OR
                (ma.uploader_id = auth.uid()) OR  
                (ma.created_by = auth.uid())
            )
        ) OR
        -- Users can add usage tracking for content they're adding to
        (used_in_type = 'story' AND EXISTS (
            SELECT 1 FROM stories s WHERE s.id = used_in_id AND s.author_id = auth.uid()
        )) OR
        (used_in_type = 'gallery' AND EXISTS (
            SELECT 1 FROM galleries g WHERE g.id = used_in_id AND g.created_by = auth.uid()
        )) OR
        (used_in_type = 'profile' AND used_in_id::text = auth.uid()::text)
    );

CREATE POLICY "Users can update usage for their content" ON media_usage_tracking
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM media_assets ma 
            WHERE ma.id = media_asset_id 
            AND (
                (ma.uploaded_by = auth.uid()) OR
                (ma.uploader_id = auth.uid()) OR  
                (ma.created_by = auth.uid())
            )
        ) OR
        added_by = auth.uid()
    );

CREATE POLICY "Users can delete usage tracking they created" ON media_usage_tracking
    FOR DELETE USING (
        added_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM media_assets ma 
            WHERE ma.id = media_asset_id 
            AND (
                (ma.uploaded_by = auth.uid()) OR
                (ma.uploader_id = auth.uid()) OR  
                (ma.created_by = auth.uid())
            )
        )
    );

-- Function to automatically track gallery media usage
CREATE OR REPLACE FUNCTION track_gallery_media_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Add usage tracking when media is added to gallery
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
            'gallery',
            NEW.gallery_id,
            COALESCE(NEW.caption, NEW.cultural_context),
            CASE WHEN NEW.is_cover_image THEN 'cover' ELSE 'supporting' END,
            NEW.sort_order,
            auth.uid()
        )
        ON CONFLICT (media_asset_id, used_in_type, used_in_id) 
        DO UPDATE SET
            usage_context = EXCLUDED.usage_context,
            usage_role = EXCLUDED.usage_role,
            display_order = EXCLUDED.display_order,
            updated_at = now(),
            removed_at = NULL; -- Un-delete if it was soft deleted
        
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update usage tracking when gallery media association is updated
        UPDATE media_usage_tracking 
        SET 
            usage_context = COALESCE(NEW.caption, NEW.cultural_context),
            usage_role = CASE WHEN NEW.is_cover_image THEN 'cover' ELSE 'supporting' END,
            display_order = NEW.sort_order,
            updated_at = now()
        WHERE media_asset_id = NEW.media_asset_id 
        AND used_in_type = 'gallery' 
        AND used_in_id = NEW.gallery_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Soft delete usage tracking when media is removed from gallery
        UPDATE media_usage_tracking 
        SET 
            removed_at = now(),
            updated_at = now()
        WHERE media_asset_id = OLD.media_asset_id 
        AND used_in_type = 'gallery' 
        AND used_in_id = OLD.gallery_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the trigger to gallery_media_associations
CREATE TRIGGER gallery_media_usage_tracking_trigger
    AFTER INSERT OR UPDATE OR DELETE ON gallery_media_associations
    FOR EACH ROW EXECUTE FUNCTION track_gallery_media_usage();

-- Function to get media usage summary
CREATE OR REPLACE FUNCTION get_media_usage_summary(asset_id uuid)
RETURNS TABLE (
    used_in_type text,
    used_in_id uuid,
    usage_count bigint,
    total_views bigint,
    last_viewed timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mut.used_in_type,
        mut.used_in_id,
        COUNT(*) as usage_count,
        SUM(mut.view_count) as total_views,
        MAX(mut.last_viewed_at) as last_viewed
    FROM media_usage_tracking mut
    WHERE mut.media_asset_id = asset_id 
    AND mut.removed_at IS NULL
    GROUP BY mut.used_in_type, mut.used_in_id
    ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find orphaned media (not used anywhere) - with flexible column check
CREATE OR REPLACE FUNCTION find_orphaned_media(user_id uuid DEFAULT NULL)
RETURNS TABLE (
    media_asset_id uuid,
    filename text,
    upload_date timestamptz,
    file_size bigint,
    last_usage_date timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ma.id,
        ma.filename,
        ma.created_at,
        ma.file_size,
        MAX(mut.removed_at) as last_usage_date
    FROM media_assets ma
    LEFT JOIN media_usage_tracking mut ON ma.id = mut.media_asset_id
    WHERE (
        user_id IS NULL OR 
        (ma.uploaded_by = user_id) OR 
        (ma.uploader_id = user_id) OR 
        (ma.created_by = user_id)
    )
    AND NOT EXISTS (
        SELECT 1 FROM media_usage_tracking mut2 
        WHERE mut2.media_asset_id = ma.id 
        AND mut2.removed_at IS NULL
    )
    GROUP BY ma.id, ma.filename, ma.created_at, ma.file_size
    ORDER BY ma.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track media view
CREATE OR REPLACE FUNCTION increment_media_usage_view(
    asset_id uuid,
    usage_type text,
    content_id uuid
)
RETURNS void AS $$
BEGIN
    UPDATE media_usage_tracking 
    SET 
        view_count = view_count + 1,
        last_viewed_at = now(),
        updated_at = now()
    WHERE media_asset_id = asset_id 
    AND used_in_type = usage_type 
    AND used_in_id = content_id
    AND removed_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger (if function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER update_media_usage_tracking_updated_at 
            BEFORE UPDATE ON media_usage_tracking
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END;
$$;

-- Backfill existing gallery media associations (with error handling)
DO $$
BEGIN
    -- First check if we can access the needed columns
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_assets' AND column_name = 'uploaded_by'
    ) THEN
        -- Use uploaded_by column
        INSERT INTO media_usage_tracking (
            media_asset_id,
            used_in_type,
            used_in_id,
            usage_context,
            usage_role,
            display_order,
            added_by,
            added_at
        )
        SELECT 
            gma.media_asset_id,
            'gallery'::text,
            gma.gallery_id,
            COALESCE(gma.caption, gma.cultural_context),
            CASE WHEN gma.is_cover_image THEN 'cover' ELSE 'supporting' END,
            gma.sort_order,
            g.created_by,
            gma.created_at
        FROM gallery_media_associations gma
        JOIN galleries g ON g.id = gma.gallery_id
        ON CONFLICT (media_asset_id, used_in_type, used_in_id) DO NOTHING;
    ELSE
        -- Handle different column names or skip backfill
        RAISE NOTICE 'Skipping backfill - media_assets table structure differs from expected';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Backfill failed but schema creation succeeded: %', SQLERRM;
END;
$$;

-- Comments for documentation
COMMENT ON TABLE media_usage_tracking IS 'Tracks where media assets are used across the platform for analytics and management';
COMMENT ON FUNCTION get_media_usage_summary IS 'Returns a summary of where a specific media asset is being used';
COMMENT ON FUNCTION find_orphaned_media IS 'Finds media assets that are not currently being used anywhere';
COMMENT ON FUNCTION increment_media_usage_view IS 'Increments the view count for media usage in a specific context';

-- Grant necessary permissions
GRANT SELECT ON media_usage_tracking TO authenticated;
GRANT EXECUTE ON FUNCTION get_media_usage_summary TO authenticated;
GRANT EXECUTE ON FUNCTION find_orphaned_media TO authenticated;
GRANT EXECUTE ON FUNCTION increment_media_usage_view TO authenticated;