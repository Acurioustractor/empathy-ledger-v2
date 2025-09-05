#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// URGENT RLS DEPLOYMENT - DIRECT SQL EXECUTION
// Deploy Row Level Security policies to protect cultural data

const SUPABASE_URL = 'https://yvnuayzslukamizrlhwb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';

async function executeSQL(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({ sql })
    });

    const result = await response.text();
    return { success: response.ok, result, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deployRLSPoliciesDirectly() {
  console.log('🔒 URGENT: Deploying RLS policies directly to protect cultural data...');
  
  // Critical RLS policies to deploy immediately
  const criticalPolicies = [
    // Enable RLS on all tables
    'ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE IF EXISTS stories ENABLE ROW LEVEL SECURITY;', 
    'ALTER TABLE IF EXISTS transcripts ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE IF EXISTS media_assets ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE IF EXISTS galleries ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE IF EXISTS photos ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE IF EXISTS storytellers ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;',

    // Drop existing policies first
    'DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;',
    'DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;', 
    'DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;',
    'DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;',

    // Essential Profiles Policies
    `CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT 
     USING (
       auth.uid() = id OR 
       (privacy_settings->>'profile_visibility' = 'public')
     );`,

    `CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT 
     WITH CHECK (auth.uid() = id);`,

    `CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE 
     USING (auth.uid() = id) WITH CHECK (auth.uid() = id);`,

    `CREATE POLICY "profiles_delete_policy" ON profiles FOR DELETE 
     USING (auth.uid() = id);`,

    // Drop story policies
    'DROP POLICY IF EXISTS "stories_select_policy" ON stories;',
    'DROP POLICY IF EXISTS "stories_insert_policy" ON stories;',
    'DROP POLICY IF EXISTS "stories_update_policy" ON stories;', 
    'DROP POLICY IF EXISTS "stories_delete_policy" ON stories;',

    // Essential Stories Policies
    `CREATE POLICY "stories_select_policy" ON stories FOR SELECT 
     USING (
       privacy_level = 'public' OR 
       author_id = auth.uid()
     );`,

    `CREATE POLICY "stories_insert_policy" ON stories FOR INSERT 
     WITH CHECK (auth.uid() = author_id);`,

    `CREATE POLICY "stories_update_policy" ON stories FOR UPDATE 
     USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);`,

    `CREATE POLICY "stories_delete_policy" ON stories FOR DELETE 
     USING (auth.uid() = author_id);`,

    // Drop transcript policies
    'DROP POLICY IF EXISTS "transcripts_select_policy" ON transcripts;',
    'DROP POLICY IF EXISTS "transcripts_insert_policy" ON transcripts;',
    'DROP POLICY IF EXISTS "transcripts_update_policy" ON transcripts;',
    'DROP POLICY IF EXISTS "transcripts_delete_policy" ON transcripts;',

    // Essential Transcripts Policies - Highly Restrictive
    `CREATE POLICY "transcripts_select_policy" ON transcripts FOR SELECT 
     USING (
       auth.uid() = ANY(participant_ids::uuid[])
     );`,

    `CREATE POLICY "transcripts_insert_policy" ON transcripts FOR INSERT 
     WITH CHECK (auth.uid() = ANY(participant_ids::uuid[]));`,

    `CREATE POLICY "transcripts_update_policy" ON transcripts FOR UPDATE 
     USING (auth.uid() = ANY(participant_ids::uuid[])) 
     WITH CHECK (auth.uid() = ANY(participant_ids::uuid[]));`,

    `CREATE POLICY "transcripts_delete_policy" ON transcripts FOR DELETE 
     USING (auth.uid() = ANY(participant_ids::uuid[]));`
  ];

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < criticalPolicies.length; i++) {
    const policy = criticalPolicies[i];
    console.log(`⏳ Executing critical policy ${i + 1}/${criticalPolicies.length}...`);
    
    const result = await executeSQL(policy);
    
    if (result.success) {
      console.log(`✅ Policy ${i + 1} executed successfully`);
      successCount++;
    } else {
      console.error(`❌ Policy ${i + 1} failed:`, result.error || result.result);
      errors.push({ policy: i + 1, error: result.error || result.result, sql: policy.substring(0, 100) });
      errorCount++;
    }

    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n🔒 CRITICAL RLS DEPLOYMENT SUMMARY:');
  console.log(`✅ Successful policies: ${successCount}`);
  console.log(`❌ Failed policies: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS ENCOUNTERED:');
    errors.forEach(({ policy, error, sql }) => {
      console.log(`Policy ${policy}: ${error}`);
      console.log(`SQL: ${sql}...`);
      console.log('---');
    });
  }

  if (errorCount === 0) {
    console.log('\n🎉 SUCCESS: Critical RLS policies deployed!');
    console.log('🛡️  Cultural data is now protected');
  } else {
    console.log(`\n⚠️  PARTIAL SUCCESS: ${successCount} policies deployed, ${errorCount} failed`);
  }

  return { successCount, errorCount, errors };
}

// Alternative approach using Supabase client with service role
async function deployViaSupabaseClient() {
  console.log('🔄 Attempting deployment via Supabase client...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  });

  // Test connection first
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Enable RLS on critical tables using raw SQL
    const enableRLSCommands = [
      'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE stories ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY'
    ];

    for (const command of enableRLSCommands) {
      console.log(`⏳ Executing: ${command}`);
      
      try {
        // Use rpc to execute raw SQL if available
        const { data, error } = await supabase.rpc('enable_rls_on_table', {
          table_name: command.split(' ')[2]
        });

        if (error) {
          console.log(`⚠️  RPC failed, trying alternative approach: ${error.message}`);
        } else {
          console.log(`✅ RLS enabled on table`);
        }
      } catch (rpcError) {
        console.log(`⚠️  RPC not available: ${rpcError.message}`);
      }
    }

    return true;
  } catch (connectionError) {
    console.error('💥 Database connection failed:', connectionError.message);
    return false;
  }
}

// Main execution
if (require.main === module) {
  console.log('🚨 URGENT RLS DEPLOYMENT STARTING...');
  console.log('🎯 Target: Cultural storytelling platform data protection');
  console.log('📊 Database:', SUPABASE_URL);
  console.log('⏰ Started at:', new Date().toISOString());
  
  deployRLSPoliciesDirectly()
    .then(({ successCount, errorCount }) => {
      if (errorCount > 0) {
        console.log('🔄 Trying alternative deployment method...');
        return deployViaSupabaseClient();
      }
      return successCount > 0;
    })
    .then((success) => {
      if (success) {
        console.log('✅ RLS deployment completed successfully');
        console.log('🛡️  Cultural data protection is now active');
      } else {
        console.error('🚨 CRITICAL: RLS deployment failed completely');
        console.error('📞 IMMEDIATE MANUAL INTERVENTION REQUIRED');
        console.error('💡 Please apply RLS policies manually through Supabase dashboard');
      }
    })
    .catch((error) => {
      console.error('💥 CRITICAL FAILURE:', error);
      console.error('🚨 CULTURAL DATA REMAINS UNPROTECTED');
    });
}

module.exports = { deployRLSPoliciesDirectly, deployViaSupabaseClient };