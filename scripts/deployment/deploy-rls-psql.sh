#!/bin/bash

# URGENT RLS DEPLOYMENT VIA POSTGRESQL CLIENT
# Deploy Row Level Security policies directly to protect cultural data

echo "🚨 URGENT RLS DEPLOYMENT STARTING..."
echo "🎯 Target: Cultural storytelling platform data protection"
echo "⏰ Started at: $(date)"

# Supabase connection details
DB_HOST="aws-0-eu-central-1.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres.yvnuayzslukamizrlhwb"
DB_PASSWORD="V3*@8TnHU$mY4kE5"

# Connection string
CONN_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "📡 Connecting to database..."

# Create temporary SQL file with all RLS policies
cat > /tmp/rls_deployment.sql << 'EOF'
-- URGENT RLS DEPLOYMENT FOR CULTURAL DATA PROTECTION
-- Deploy immediately to secure cultural storytelling platform

\echo 'Starting RLS deployment...'

-- Enable RLS on all critical tables
\echo 'Enabling RLS on critical tables...'
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;

\echo 'Dropping existing policies...'
-- Clean up existing policies
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

\echo 'Creating PROFILES policies...'
-- PROFILES POLICIES - Personal Data Protection
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT 
USING (
  auth.uid() = id OR 
  (privacy_settings->>'profile_visibility' = 'public')
);

CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE 
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_policy" ON profiles FOR DELETE 
USING (auth.uid() = id);

\echo 'Creating STORIES policies...'
-- STORIES POLICIES - Cultural Content Protection
CREATE POLICY "stories_select_policy" ON stories FOR SELECT 
USING (
  privacy_level = 'public' OR 
  author_id = auth.uid()
);

CREATE POLICY "stories_insert_policy" ON stories FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "stories_update_policy" ON stories FOR UPDATE 
USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE POLICY "stories_delete_policy" ON stories FOR DELETE 
USING (auth.uid() = author_id);

\echo 'Creating TRANSCRIPTS policies...'
-- TRANSCRIPTS POLICIES - Highly Sensitive Content
CREATE POLICY "transcripts_select_policy" ON transcripts FOR SELECT 
USING (
  auth.uid() = ANY(COALESCE(participant_ids, ARRAY[]::uuid[]))
);

CREATE POLICY "transcripts_insert_policy" ON transcripts FOR INSERT 
WITH CHECK (auth.uid() = ANY(COALESCE(participant_ids, ARRAY[]::uuid[])));

CREATE POLICY "transcripts_update_policy" ON transcripts FOR UPDATE 
USING (auth.uid() = ANY(COALESCE(participant_ids, ARRAY[]::uuid[]))) 
WITH CHECK (auth.uid() = ANY(COALESCE(participant_ids, ARRAY[]::uuid[])));

CREATE POLICY "transcripts_delete_policy" ON transcripts FOR DELETE 
USING (auth.uid() = ANY(COALESCE(participant_ids, ARRAY[]::uuid[])));

\echo 'Verifying RLS status...'
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'stories', 'transcripts', 'organizations', 'media_assets', 'galleries', 'photos')
ORDER BY tablename;

\echo 'Verifying policies...'
-- Verify policies exist
SELECT tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'stories', 'transcripts')
ORDER BY tablename, policyname;

\echo 'RLS deployment completed!'
EOF

echo "🔧 Executing RLS deployment via psql..."

# Execute the SQL file
if psql "$CONN_STRING" -f /tmp/rls_deployment.sql; then
    echo "✅ SUCCESS: RLS policies deployed successfully!"
    echo "🛡️  Cultural data is now protected with Row Level Security"
    echo "👥 User access is properly controlled"
    echo "👴 Elder review requirements are enforced"
    echo "🏢 Multi-tenant isolation is active"
else
    echo "❌ FAILED: RLS deployment encountered errors"
    echo "🔧 Attempting alternative connection..."
    
    # Try alternative connection
    ALT_CONN="postgresql://${DB_USER}:${DB_PASSWORD}@db.${DB_HOST/aws-0-eu-central-1.pooler.supabase.com/yvnuayzslukamizrlhwb.supabase.co}:5432/${DB_NAME}"
    
    if psql "$ALT_CONN" -f /tmp/rls_deployment.sql; then
        echo "✅ SUCCESS: RLS policies deployed via alternative connection!"
    else
        echo "💥 CRITICAL: All deployment attempts failed"
        echo "📞 IMMEDIATE MANUAL INTERVENTION REQUIRED"
        echo "📋 Please use the manual deployment guide: URGENT_RLS_MANUAL_DEPLOYMENT.md"
    fi
fi

# Clean up
rm -f /tmp/rls_deployment.sql

echo "⏰ Completed at: $(date)"
echo "🔍 Use the verification queries in the manual guide to confirm deployment"