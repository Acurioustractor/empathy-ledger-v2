-- URGENT RLS DEPLOYMENT FOR CULTURAL DATA PROTECTION
-- Deploy immediately to secure cultural storytelling platform

-- Enable RLS on all critical tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

DROP POLICY IF EXISTS "stories_select_policy" ON stories;
DROP POLICY IF EXISTS "stories_insert_policy" ON stories;
DROP POLICY IF EXISTS "stories_update_policy" ON stories;
DROP POLICY IF EXISTS "stories_delete_policy" ON stories;

DROP POLICY IF EXISTS "transcripts_select_policy" ON transcripts;
DROP POLICY IF EXISTS "transcripts_insert_policy" ON transcripts;
DROP POLICY IF EXISTS "transcripts_update_policy" ON transcripts;
DROP POLICY IF EXISTS "transcripts_delete_policy" ON transcripts;

DROP POLICY IF EXISTS "organizations_select_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_insert_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_update_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_delete_policy" ON organizations;

DROP POLICY IF EXISTS "media_assets_select_policy" ON media_assets;
DROP POLICY IF EXISTS "media_assets_insert_policy" ON media_assets;
DROP POLICY IF EXISTS "media_assets_update_policy" ON media_assets;
DROP POLICY IF EXISTS "media_assets_delete_policy" ON media_assets;

DROP POLICY IF EXISTS "galleries_select_policy" ON galleries;
DROP POLICY IF EXISTS "galleries_insert_policy" ON galleries;
DROP POLICY IF EXISTS "galleries_update_policy" ON galleries;
DROP POLICY IF EXISTS "galleries_delete_policy" ON galleries;

DROP POLICY IF EXISTS "photos_select_policy" ON photos;
DROP POLICY IF EXISTS "photos_insert_policy" ON photos;
DROP POLICY IF EXISTS "photos_update_policy" ON photos;
DROP POLICY IF EXISTS "photos_delete_policy" ON photos;

-- PROFILES TABLE POLICIES - Personal and Cultural Data Protection
-- Users can see their own profile and public profiles with appropriate cultural sensitivity
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT 
USING (
  auth.uid() = id OR 
  (privacy_settings->>'profile_visibility' = 'public' AND 
   (cultural_sensitivity_level IS NULL OR cultural_sensitivity_level <= 2)) OR
  -- Organization members can see each other based on cultural sensitivity
  EXISTS (
    SELECT 1 FROM organization_memberships om1, organization_memberships om2 
    WHERE om1.user_id = auth.uid() 
    AND om2.user_id = profiles.id 
    AND om1.organization_id = om2.organization_id
    AND (cultural_sensitivity_level IS NULL OR cultural_sensitivity_level <= 3)
  )
);

-- Users can only insert their own profile
CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can only update their own profile, with cultural review requirements
CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- High cultural sensitivity requires elder approval
  (cultural_sensitivity_level <= 3 OR 
   elder_approved = true OR 
   auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'elder'))
);

-- Users can only delete their own profile
CREATE POLICY "profiles_delete_policy" ON profiles FOR DELETE 
USING (auth.uid() = id);

-- STORIES TABLE POLICIES - Cultural Story Protection with Elder Review
-- Stories visibility based on cultural sensitivity and elder approval
CREATE POLICY "stories_select_policy" ON stories FOR SELECT 
USING (
  -- Public stories with low cultural sensitivity
  (privacy_level = 'public' AND cultural_sensitivity_level <= 2) OR
  -- Own stories
  author_id = auth.uid() OR
  -- Organization members can see shared stories
  (privacy_level IN ('organization', 'community') AND
   EXISTS (
     SELECT 1 FROM organization_memberships om, profiles p
     WHERE om.user_id = auth.uid() 
     AND p.id = stories.author_id
     AND om.organization_id = p.organization_id
   )) OR
  -- Elders can see stories requiring cultural review
  (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'elder'))
);

-- Users can create stories with cultural sensitivity validation
CREATE POLICY "stories_insert_policy" ON stories FOR INSERT 
WITH CHECK (
  auth.uid() = author_id AND
  -- High cultural sensitivity requires pre-approval for creation
  (cultural_sensitivity_level <= 3 OR 
   auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'elder'))
);

-- Story updates require cultural compliance
CREATE POLICY "stories_update_policy" ON stories FOR UPDATE 
USING (
  auth.uid() = author_id OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'elder')
)
WITH CHECK (
  -- Cultural sensitivity increases require elder approval
  (cultural_sensitivity_level <= OLD.cultural_sensitivity_level OR elder_approved = true) AND
  -- High sensitivity content must be elder approved
  (cultural_sensitivity_level <= 3 OR elder_approved = true)
);

-- Story deletion protection
CREATE POLICY "stories_delete_policy" ON stories FOR DELETE 
USING (
  auth.uid() = author_id OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- TRANSCRIPTS TABLE POLICIES - Sensitive Storytelling Content Protection
-- Transcripts are highly sensitive - strict access controls
CREATE POLICY "transcripts_select_policy" ON transcripts FOR SELECT 
USING (
  -- Users can see transcripts they participated in
  auth.uid() = ANY(participant_ids) OR
  -- Organization admins can see organization transcripts
  (auth.uid() IN (SELECT user_id FROM user_roles ur, organization_memberships om 
                  WHERE ur.role = 'admin' AND ur.user_id = om.user_id 
                  AND om.organization_id = transcripts.organization_id)) OR
  -- Elders can access for cultural review
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'elder')
);

-- Only authorized users can create transcripts
CREATE POLICY "transcripts_insert_policy" ON transcripts FOR INSERT 
WITH CHECK (
  auth.uid() = ANY(participant_ids) OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'elder'))
);

-- Transcript updates require proper authorization
CREATE POLICY "transcripts_update_policy" ON transcripts FOR UPDATE 
USING (
  auth.uid() = ANY(participant_ids) OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'elder'))
)
WITH CHECK (
  -- Cultural sensitivity increases require elder approval
  cultural_sensitivity_level <= 3 OR elder_approved = true
);

-- Transcript deletion is highly restricted
CREATE POLICY "transcripts_delete_policy" ON transcripts FOR DELETE 
USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin') OR
  (auth.uid() = ANY(participant_ids) AND array_length(participant_ids, 1) = 1)
);

-- ORGANIZATIONS TABLE POLICIES - Multi-tenant Isolation
-- Users can see organizations they belong to or public ones
CREATE POLICY "organizations_select_policy" ON organizations FOR SELECT 
USING (
  privacy_level = 'public' OR
  auth.uid() IN (SELECT user_id FROM organization_memberships WHERE organization_id = organizations.id)
);

-- Only platform admins can create organizations
CREATE POLICY "organizations_insert_policy" ON organizations FOR INSERT 
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'platform_admin')
);

-- Organization updates require admin role within organization
CREATE POLICY "organizations_update_policy" ON organizations FOR UPDATE 
USING (
  auth.uid() IN (SELECT user_id FROM organization_memberships om, user_roles ur
                 WHERE om.organization_id = organizations.id 
                 AND ur.user_id = om.user_id 
                 AND ur.role IN ('admin', 'elder'))
);

-- Organization deletion is highly restricted
CREATE POLICY "organizations_delete_policy" ON organizations FOR DELETE 
USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'platform_admin')
);

-- MEDIA_ASSETS TABLE POLICIES - Cultural Media Protection
-- Media visibility based on cultural sensitivity and ownership
CREATE POLICY "media_assets_select_policy" ON media_assets FOR SELECT 
USING (
  -- Own media
  uploader_id = auth.uid() OR
  -- Public media with low cultural sensitivity
  (privacy_level = 'public' AND cultural_sensitivity_level <= 2) OR
  -- Organization shared media
  (privacy_level IN ('organization', 'community') AND
   EXISTS (
     SELECT 1 FROM organization_memberships om1, organization_memberships om2
     WHERE om1.user_id = auth.uid() 
     AND om2.user_id = media_assets.uploader_id
     AND om1.organization_id = om2.organization_id
   )) OR
  -- Elders can access for review
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'elder')
);

-- Media upload with cultural validation
CREATE POLICY "media_assets_insert_policy" ON media_assets FOR INSERT 
WITH CHECK (
  auth.uid() = uploader_id AND
  -- High cultural sensitivity requires elder pre-approval
  (cultural_sensitivity_level <= 3 OR 
   auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'elder'))
);

-- Media updates require ownership or elder authority
CREATE POLICY "media_assets_update_policy" ON media_assets FOR UPDATE 
USING (
  auth.uid() = uploader_id OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'elder')
)
WITH CHECK (
  cultural_sensitivity_level <= 3 OR elder_approved = true
);

-- Media deletion protection
CREATE POLICY "media_assets_delete_policy" ON media_assets FOR DELETE 
USING (
  auth.uid() = uploader_id OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'elder'))
);

-- GALLERIES TABLE POLICIES - Photo Collection Protection
CREATE POLICY "galleries_select_policy" ON galleries FOR SELECT 
USING (
  created_by = auth.uid() OR
  privacy_level = 'public' OR
  (privacy_level = 'organization' AND
   EXISTS (
     SELECT 1 FROM organization_memberships om1, organization_memberships om2
     WHERE om1.user_id = auth.uid() 
     AND om2.user_id = galleries.created_by
     AND om1.organization_id = om2.organization_id
   ))
);

CREATE POLICY "galleries_insert_policy" ON galleries FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "galleries_update_policy" ON galleries FOR UPDATE 
USING (
  auth.uid() = created_by OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'elder')
);

CREATE POLICY "galleries_delete_policy" ON galleries FOR DELETE 
USING (
  auth.uid() = created_by OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- PHOTOS TABLE POLICIES - Individual Photo Protection
CREATE POLICY "photos_select_policy" ON photos FOR SELECT 
USING (
  -- Public photos
  privacy_level = 'public' OR
  -- Own photos
  EXISTS (SELECT 1 FROM galleries WHERE galleries.id = photos.gallery_id AND galleries.created_by = auth.uid()) OR
  -- Organization shared photos
  (privacy_level = 'organization' AND
   EXISTS (
     SELECT 1 FROM galleries g, organization_memberships om1, organization_memberships om2
     WHERE g.id = photos.gallery_id
     AND om1.user_id = auth.uid() 
     AND om2.user_id = g.created_by
     AND om1.organization_id = om2.organization_id
   ))
);

CREATE POLICY "photos_insert_policy" ON photos FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM galleries WHERE galleries.id = gallery_id AND galleries.created_by = auth.uid())
);

CREATE POLICY "photos_update_policy" ON photos FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM galleries WHERE galleries.id = photos.gallery_id AND galleries.created_by = auth.uid()) OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'elder')
);

CREATE POLICY "photos_delete_policy" ON photos FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM galleries WHERE galleries.id = photos.gallery_id AND galleries.created_by = auth.uid()) OR
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Create supporting functions for cultural data protection
CREATE OR REPLACE FUNCTION check_cultural_sensitivity_access(
  user_id UUID,
  content_sensitivity INTEGER,
  content_owner_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Users can always access their own content
  IF user_id = content_owner_id THEN
    RETURN TRUE;
  END IF;
  
  -- Elders have elevated access
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = check_cultural_sensitivity_access.user_id AND role = 'elder') THEN
    RETURN TRUE;
  END IF;
  
  -- Regular users limited by sensitivity level
  RETURN content_sensitivity <= 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate elder approval requirements
CREATE OR REPLACE FUNCTION requires_elder_approval(
  sensitivity_level INTEGER,
  current_approval BOOLEAN DEFAULT FALSE
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN sensitivity_level > 3 AND NOT COALESCE(current_approval, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit table for cultural data access
CREATE TABLE IF NOT EXISTS cultural_access_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL,
  cultural_sensitivity_level INTEGER,
  access_granted BOOLEAN,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit table
ALTER TABLE cultural_access_audit ENABLE ROW LEVEL SECURITY;

-- Audit table policies - only admins and elders can view
CREATE POLICY "cultural_access_audit_select_policy" ON cultural_access_audit FOR SELECT 
USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'elder', 'platform_admin'))
);

-- Create trigger function for cultural access logging
CREATE OR REPLACE FUNCTION log_cultural_access() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO cultural_access_audit (
    user_id, 
    table_name, 
    record_id, 
    action, 
    cultural_sensitivity_level,
    access_granted,
    reason
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    COALESCE(NEW.cultural_sensitivity_level, OLD.cultural_sensitivity_level),
    true,
    'RLS policy allowed access'
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply cultural access logging triggers to sensitive tables
CREATE TRIGGER cultural_access_log_stories
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON stories
  FOR EACH ROW EXECUTE FUNCTION log_cultural_access();

CREATE TRIGGER cultural_access_log_transcripts
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON transcripts
  FOR EACH ROW EXECUTE FUNCTION log_cultural_access();

CREATE TRIGGER cultural_access_log_media_assets
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION log_cultural_access();

COMMENT ON TABLE profiles IS 'User profiles with cultural data protection via RLS';
COMMENT ON TABLE stories IS 'Cultural stories with elder review requirements and sensitivity-based access';
COMMENT ON TABLE transcripts IS 'Highly sensitive storytelling content with strict access controls';
COMMENT ON TABLE organizations IS 'Multi-tenant organizations with proper isolation';
COMMENT ON TABLE media_assets IS 'Cultural media with sensitivity-based access and elder approval';
COMMENT ON TABLE galleries IS 'Photo collections with community and cultural access controls';
COMMENT ON TABLE photos IS 'Individual photos with privacy and cultural sensitivity protection';
COMMENT ON TABLE cultural_access_audit IS 'Audit log for cultural data access tracking';