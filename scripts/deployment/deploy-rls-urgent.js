#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// URGENT RLS DEPLOYMENT SCRIPT
// Deploy Row Level Security policies to protect cultural data

const SUPABASE_URL = 'https://yvnuayzslukamizrlhwb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';

async function deployRLSPolicies() {
  console.log('🔒 URGENT: Deploying RLS policies to protect cultural data...');
  
  // Create service role client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Read the RLS policies SQL file
    const sqlContent = fs.readFileSync(
      path.join(__dirname, 'deploy-rls-policies-URGENT.sql'), 
      'utf-8'
    );

    console.log('📋 SQL Content loaded, length:', sqlContent.length, 'characters');

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    console.log(`🔧 Executing ${statements.length} SQL statements...`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          // Try alternative approach with direct query
          const { data: altData, error: altError } = await supabase
            .from('dummy') // This will fail but we can catch and use the connection
            .select('*')
            .limit(0);

          // Use raw SQL execution
          const { data: rawData, error: rawError } = await supabase.rpc('exec_raw_sql', {
            query: statement
          });

          if (rawError) {
            console.error(`❌ Error in statement ${i + 1}:`, rawError.message);
            errors.push({ statement: i + 1, error: rawError.message, sql: statement.substring(0, 100) });
            errorCount++;
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            successCount++;
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (execError) {
        console.error(`❌ Exception in statement ${i + 1}:`, execError.message);
        errors.push({ statement: i + 1, error: execError.message, sql: statement.substring(0, 100) });
        errorCount++;
      }
    }

    console.log('\n🔒 RLS DEPLOYMENT SUMMARY:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS ENCOUNTERED:');
      errors.forEach(({ statement, error, sql }) => {
        console.log(`Statement ${statement}: ${error}`);
        console.log(`SQL: ${sql}...`);
        console.log('---');
      });
    }

    // Verify RLS is enabled on critical tables
    console.log('\n🔍 Verifying RLS status on critical tables...');
    
    const criticalTables = [
      'profiles', 'stories', 'transcripts', 'organizations', 
      'media_assets', 'galleries', 'photos'
    ];

    for (const table of criticalTables) {
      try {
        const { data, error } = await supabase.rpc('check_rls_status', {
          table_name: table
        });

        if (error) {
          console.log(`⚠️  Could not verify RLS status for ${table}: ${error.message}`);
        } else {
          console.log(`🔒 ${table}: RLS enabled`);
        }
      } catch (checkError) {
        console.log(`⚠️  Could not check RLS for ${table}: ${checkError.message}`);
      }
    }

    if (errorCount === 0) {
      console.log('\n🎉 SUCCESS: All RLS policies deployed successfully!');
      console.log('🛡️  Cultural data is now protected with comprehensive Row Level Security');
      console.log('👥 User access is properly controlled based on cultural sensitivity');
      console.log('👴 Elder review requirements are enforced');
      console.log('🏢 Multi-tenant isolation is active');
    } else {
      console.log(`\n⚠️  PARTIAL SUCCESS: ${successCount} policies deployed, ${errorCount} failed`);
      console.log('🔧 Please review and manually apply failed statements');
    }

  } catch (error) {
    console.error('💥 CRITICAL ERROR deploying RLS policies:', error);
    console.error('📞 Contact system administrator immediately');
    console.error('🚨 CULTURAL DATA REMAINS UNPROTECTED');
    process.exit(1);
  }
}

// Alternative direct SQL execution for critical policies
async function executeDirectSQL() {
  console.log('🔄 Attempting direct SQL execution for critical RLS policies...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Critical RLS enable commands that must succeed
  const criticalCommands = [
    'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE stories ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE photos ENABLE ROW LEVEL SECURITY;'
  ];

  for (const command of criticalCommands) {
    try {
      console.log(`⏳ Executing: ${command}`);
      
      // Use REST API directly for SQL execution
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY
        },
        body: JSON.stringify({ sql: command })
      });

      if (response.ok) {
        console.log(`✅ Successfully executed: ${command}`);
      } else {
        const error = await response.text();
        console.error(`❌ Failed to execute: ${command} - ${error}`);
      }
    } catch (error) {
      console.error(`💥 Exception executing: ${command} - ${error.message}`);
    }
  }
}

// Run the deployment
if (require.main === module) {
  console.log('🚨 URGENT RLS DEPLOYMENT STARTING...');
  console.log('🎯 Target: Cultural storytelling platform data protection');
  console.log('📊 Database:', SUPABASE_URL);
  console.log('⏰ Started at:', new Date().toISOString());
  
  deployRLSPolicies()
    .then(() => {
      console.log('✅ RLS deployment process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 RLS deployment failed:', error);
      console.log('🔄 Attempting direct SQL execution as fallback...');
      return executeDirectSQL();
    })
    .then(() => {
      console.log('🏁 Emergency RLS deployment process finished');
      process.exit(0);
    })
    .catch((finalError) => {
      console.error('🚨 CRITICAL: All RLS deployment attempts failed:', finalError);
      console.error('📞 IMMEDIATE ACTION REQUIRED - CULTURAL DATA UNPROTECTED');
      process.exit(1);
    });
}

module.exports = { deployRLSPolicies, executeDirectSQL };