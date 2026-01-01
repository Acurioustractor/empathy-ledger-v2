# 🚨 URGENT: Manual RLS Deployment for Cultural Data Protection

## CRITICAL SECURITY WARNING
The Empathy Ledger database currently has **NO ROW LEVEL SECURITY** protection. All cultural data, elder stories, and sensitive content is publicly accessible. **IMMEDIATE ACTION REQUIRED**.

## Database Information
- **URL**: https://yvnuayzslukamizrlhwb.supabase.co
- **Service Role**: Available in deployment scripts
- **Status**: Database connection verified ✅

## IMMEDIATE DEPLOYMENT STEPS

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Open the Empathy Ledger project
3. Navigate to **SQL Editor**

### Step 2: Execute These SQL Statements IN ORDER

#### 🔒 ENABLE RLS ON ALL CRITICAL TABLES

```sql
-- Enable Row Level Security on all critical tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
```

#### 🛡️ DROP EXISTING POLICIES (Clean Slate)

```sql
-- Clean up any existing policies
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
```

#### 👤 PROFILES POLICIES - Personal Data Protection

```sql
-- Users can see their own profile and public profiles
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT 
USING (
  auth.uid() = id OR 
  (privacy_settings->>'profile_visibility' = 'public')
);

-- Users can only insert their own profile
CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE 
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Users can only delete their own profile
CREATE POLICY "profiles_delete_policy" ON profiles FOR DELETE 
USING (auth.uid() = id);
```

#### 📖 STORIES POLICIES - Cultural Content Protection

```sql
-- Stories visibility based on privacy level and ownership
CREATE POLICY "stories_select_policy" ON stories FOR SELECT 
USING (
  privacy_level = 'public' OR 
  author_id = auth.uid()
);

-- Users can only create stories they own
CREATE POLICY "stories_insert_policy" ON stories FOR INSERT 
WITH CHECK (auth.uid() = author_id);

-- Users can only update their own stories
CREATE POLICY "stories_update_policy" ON stories FOR UPDATE 
USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

-- Users can only delete their own stories
CREATE POLICY "stories_delete_policy" ON stories FOR DELETE 
USING (auth.uid() = author_id);
```

#### 📝 TRANSCRIPTS POLICIES - Highly Sensitive Content

```sql
-- Transcripts are highly sensitive - only participants can access
CREATE POLICY "transcripts_select_policy" ON transcripts FOR SELECT 
USING (
  auth.uid() = ANY(participant_ids::uuid[])
);

-- Only participants can create transcripts
CREATE POLICY "transcripts_insert_policy" ON transcripts FOR INSERT 
WITH CHECK (auth.uid() = ANY(participant_ids::uuid[]));

-- Only participants can update transcripts
CREATE POLICY "transcripts_update_policy" ON transcripts FOR UPDATE 
USING (auth.uid() = ANY(participant_ids::uuid[])) 
WITH CHECK (auth.uid() = ANY(participant_ids::uuid[]));

-- Only participants can delete transcripts
CREATE POLICY "transcripts_delete_policy" ON transcripts FOR DELETE 
USING (auth.uid() = ANY(participant_ids::uuid[]));
```

#### 🏢 ORGANIZATIONS POLICIES - Multi-tenant Isolation

```sql
-- Users can see organizations they belong to or public ones
CREATE POLICY "organizations_select_policy" ON organizations FOR SELECT 
USING (
  privacy_level = 'public' OR
  EXISTS (
    SELECT 1 FROM organization_memberships 
    WHERE organization_id = organizations.id 
    AND user_id = auth.uid()
  )
);

-- Restrict organization creation to platform admins
CREATE POLICY "organizations_insert_policy" ON organizations FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'platform_admin'
  )
);

-- Organization updates require admin membership
CREATE POLICY "organizations_update_policy" ON organizations FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM organization_memberships om
    JOIN user_roles ur ON ur.user_id = om.user_id
    WHERE om.organization_id = organizations.id 
    AND om.user_id = auth.uid()
    AND ur.role IN ('admin', 'elder')
  )
);

-- Highly restricted organization deletion
CREATE POLICY "organizations_delete_policy" ON organizations FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'platform_admin'
  )
);
```

#### 🎬 MEDIA POLICIES - Cultural Media Protection

```sql
-- Media visibility based on privacy and cultural sensitivity
CREATE POLICY "media_assets_select_policy" ON media_assets FOR SELECT 
USING (
  uploader_id = auth.uid() OR
  (privacy_level = 'public' AND cultural_sensitivity_level <= 2)
);

-- Users can only upload media they own
CREATE POLICY "media_assets_insert_policy" ON media_assets FOR INSERT 
WITH CHECK (auth.uid() = uploader_id);

-- Users can only update their own media
CREATE POLICY "media_assets_update_policy" ON media_assets FOR UPDATE 
USING (auth.uid() = uploader_id) WITH CHECK (auth.uid() = uploader_id);

-- Users can only delete their own media
CREATE POLICY "media_assets_delete_policy" ON media_assets FOR DELETE 
USING (auth.uid() = uploader_id);
```

#### 🖼️ GALLERIES & PHOTOS POLICIES

```sql
-- Gallery access based on ownership and privacy
CREATE POLICY "galleries_select_policy" ON galleries FOR SELECT 
USING (
  created_by = auth.uid() OR
  privacy_level = 'public'
);

CREATE POLICY "galleries_insert_policy" ON galleries FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "galleries_update_policy" ON galleries FOR UPDATE 
USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

CREATE POLICY "galleries_delete_policy" ON galleries FOR DELETE 
USING (auth.uid() = created_by);

-- Photos inherit gallery permissions
CREATE POLICY "photos_select_policy" ON photos FOR SELECT 
USING (
  privacy_level = 'public' OR
  EXISTS (
    SELECT 1 FROM galleries 
    WHERE galleries.id = photos.gallery_id 
    AND galleries.created_by = auth.uid()
  )
);

CREATE POLICY "photos_insert_policy" ON photos FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM galleries 
    WHERE galleries.id = gallery_id 
    AND galleries.created_by = auth.uid()
  )
);

CREATE POLICY "photos_update_policy" ON photos FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM galleries 
    WHERE galleries.id = photos.gallery_id 
    AND galleries.created_by = auth.uid()
  )
);

CREATE POLICY "photos_delete_policy" ON photos FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM galleries 
    WHERE galleries.id = photos.gallery_id 
    AND galleries.created_by = auth.uid()
  )
);
```

### Step 3: Verification Queries

Run these to verify RLS is working:

```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'stories', 'transcripts', 'organizations', 'media_assets', 'galleries', 'photos');

-- Check policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'stories', 'transcripts', 'organizations', 'media_assets', 'galleries', 'photos');
```

## 🚨 CRITICAL SUCCESS CRITERIA

After deployment, verify:

1. ✅ **RLS Enabled**: All critical tables have `rowsecurity = true`
2. ✅ **Policies Active**: Each table has SELECT, INSERT, UPDATE, DELETE policies
3. ✅ **Access Control**: Unauthenticated users cannot access sensitive data
4. ✅ **Cultural Protection**: High sensitivity content requires proper permissions
5. ✅ **Multi-tenant**: Organizations are properly isolated

## 🎯 IMMEDIATE POST-DEPLOYMENT ACTIONS

1. **Test Authentication**: Verify users can only access their own data
2. **Test Privacy Levels**: Confirm public/private content visibility rules
3. **Test Cultural Sensitivity**: Ensure high-sensitivity content is restricted
4. **Monitor Access**: Check for any unauthorized data access attempts
5. **Elder Review**: Verify elder approval workflows are protected

## ⚠️ ROLLBACK PLAN

If issues occur, you can temporarily disable RLS:

```sql
-- EMERGENCY ROLLBACK (use only if critical issues)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE stories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts DISABLE ROW LEVEL SECURITY;
-- Continue for other tables as needed
```

## 📞 SUPPORT

- **Database Status**: Use API endpoint `/api/execute-rls-deployment` (GET) to check status
- **Verification**: Use the verification queries above
- **Issues**: Contact system administrator immediately

---

**🚨 THIS IS CRITICAL FOR CULTURAL DATA SOVEREIGNTY**
**⏰ DEPLOY IMMEDIATELY TO PROTECT ELDER STORIES AND COMMUNITY DATA**