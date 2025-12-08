#!/usr/bin/env node

/**
 * Missing Tables Analysis
 * Check what tables from our TypeScript definitions don't exist in the database
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yvnuayzslukamizrlhwb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkMissingTables() {
  console.log('🔍 Checking for Missing Tables...\n');

  // Based on our TypeScript types and codebase
  const expectedTables = [
    // Core tables
    'profiles',
    'organizations', 
    'projects',
    'storytellers',  // This was flagged as missing
    'transcripts',
    'stories',
    
    // Media management
    'media_assets',
    'galleries',
    'photos',
    'photo_tags',
    
    // AI and processing
    'ai_processing_queue',
    'content_recommendations',
    'analytics_events',
    
    // Additional expected tables
    'memberships',
    'permissions',
    'consent_records',
    'cultural_protocols'
  ];

  console.log('📊 Testing table access...\n');
  
  const tableStatus = {};
  
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116') {
          tableStatus[tableName] = { status: 'exists_no_permission', error: error.message };
          console.log(`⚠️  ${tableName}: Exists but no permission`);
        } else if (error.message.includes('does not exist')) {
          tableStatus[tableName] = { status: 'missing', error: error.message };
          console.log(`❌ ${tableName}: Table missing`);
        } else {
          tableStatus[tableName] = { status: 'error', error: error.message };
          console.log(`❓ ${tableName}: ${error.message}`);
        }
      } else {
        tableStatus[tableName] = { status: 'exists_accessible', count: data?.length || 0 };
        console.log(`✅ ${tableName}: Accessible`);
      }
    } catch (e) {
      tableStatus[tableName] = { status: 'exception', error: e.message };
      console.log(`💥 ${tableName}: Exception - ${e.message}`);
    }
  }

  // Also check for any tables that exist but aren't in our expected list
  console.log('\n🔍 Looking for unexpected tables...\n');
  
  // Try some tables that might exist from migrations
  const additionalTablestoCheck = [
    'users', 'auth_users', 'user_profiles', 'tenant_users',
    'photo_faces', 'face_clusters', 'photo_associations',
    'project_memberships', 'organization_memberships'
  ];

  for (const tableName of additionalTablestoCheck) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);

      if (!error) {
        console.log(`🆕 Found unexpected table: ${tableName} (accessible)`);
        tableStatus[tableName] = { status: 'unexpected_exists', count: data?.length || 0 };
      }
    } catch (e) {
      // Ignore - table doesn't exist
    }
  }

  // Summary
  const existing = Object.entries(tableStatus).filter(([_, info]) => 
    info.status === 'exists_accessible' || info.status === 'exists_no_permission'
  );
  const missing = Object.entries(tableStatus).filter(([_, info]) => 
    info.status === 'missing'
  );
  const errors = Object.entries(tableStatus).filter(([_, info]) => 
    info.status === 'error' || info.status === 'exception'
  );

  console.log('\n📋 SUMMARY');
  console.log('===========');
  console.log(`✅ Existing Tables: ${existing.length}`);
  console.log(`❌ Missing Tables: ${missing.length}`);
  console.log(`❓ Errors/Issues: ${errors.length}`);

  if (missing.length > 0) {
    console.log('\n🚨 MISSING TABLES:');
    missing.forEach(([table, info]) => {
      console.log(`   - ${table}: ${info.error}`);
    });
  }

  if (errors.length > 0) {
    console.log('\n❓ TABLE ISSUES:');
    errors.forEach(([table, info]) => {
      console.log(`   - ${table}: ${info.error}`);
    });
  }

  // Check for storytellers specifically
  if (tableStatus.storytellers?.status === 'missing') {
    console.log('\n🎯 STORYTELLERS TABLE ANALYSIS:');
    console.log('   The storytellers table is missing but critical for the platform.');
    console.log('   This table should store storyteller profiles and is referenced throughout the codebase.');
    
    // Check if data exists in profiles that should be in storytellers
    try {
      const { data: profilesWithStoryteller } = await supabase
        .from('profiles')
        .select('id, full_name, tenant_roles')
        .contains('tenant_roles', ['storyteller'])
        .limit(5);
      
      if (profilesWithStoryteller?.length > 0) {
        console.log(`   ℹ️  Found ${profilesWithStoryteller.length} profiles with storyteller role that should be in storytellers table`);
      }
    } catch (e) {
      console.log('   ❌ Could not check profiles for storyteller data');
    }
  }

  return tableStatus;
}

if (require.main === module) {
  checkMissingTables().catch(console.error);
}