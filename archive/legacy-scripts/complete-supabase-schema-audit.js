#!/usr/bin/env node

/**
 * Complete Supabase Schema Audit
 * Access actual Supabase database to get complete schema information
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function completeSchemaAudit() {
  console.log('🔍 COMPLETE SUPABASE SCHEMA AUDIT')
  console.log('==================================')
  console.log(`🌐 Project: ${supabaseUrl}`)
  console.log(`🕒 Timestamp: ${new Date().toISOString()}`)
  console.log('')

  const auditResults = {
    timestamp: new Date().toISOString(),
    project_url: supabaseUrl,
    tables: {},
    functions: {},
    policies: {},
    indexes: {},
    triggers: {},
    summary: {}
  }

  // Step 1: Try to get database schema information using different approaches
  console.log('📊 STEP 1: Discovering all tables...')
  console.log('=====================================')

  // Method 1: Try to access system tables directly
  const systemTableQueries = [
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
    "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public'",
    "SELECT table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE'"
  ]

  let discoveredTables = new Set()

  // Method 2: Try known table names by attempting to access them
  const possibleTables = [
    // Core tables we've seen
    'profiles', 'organizations', 'projects', 'stories', 'media_assets', 'transcripts',
    'photo_tags', 'cultural_protocols', 'photo_faces',
    
    // Auth related
    'users', 'auth.users', 'auth.sessions', 'auth.identities',
    
    // Individual Analytics
    'personal_insights', 'professional_competencies', 'impact_stories',
    'opportunity_recommendations', 'development_plans', 'analysis_jobs',
    
    // Photo Gallery
    'galleries', 'gallery_media_associations', 'cultural_tags',
    'media_cultural_tags', 'photo_people', 'cultural_locations', 'media_locations',
    
    // AI Enhancement  
    'content_enhancement_results', 'moderation_results', 'elder_review_queue',
    'ai_safety_logs', 'ai_recommendation_logs', 'search_analytics',
    'ai_connection_analysis_logs', 'ai_enhancement_logs', 'moderation_appeals',
    
    // Other possible tables
    'storytellers', 'memberships', 'permissions', 'consent_records',
    'analytics_events', 'ai_processing_queue', 'content_recommendations',
    'photos', 'comments', 'likes', 'tags', 'categories'
  ]

  console.log('🔍 Testing table access for schema discovery...')
  
  for (const tableName of possibleTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .limit(1)
      
      if (!error) {
        discoveredTables.add(tableName)
        auditResults.tables[tableName] = {
          exists: true,
          accessible: true,
          row_count: count,
          error: null
        }
        console.log(`✅ ${tableName}: Accessible (${count !== null ? count + ' rows' : 'unknown count'})`)
      } else if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        discoveredTables.add(tableName)
        auditResults.tables[tableName] = {
          exists: true,
          accessible: false,
          row_count: null,
          error: 'RLS_PROTECTED'
        }
        console.log(`🔒 ${tableName}: Exists but RLS protected`)
      } else if (error.message.includes('Could not find the table')) {
        auditResults.tables[tableName] = {
          exists: false,
          accessible: false,
          row_count: null,
          error: 'TABLE_NOT_FOUND'
        }
        console.log(`❌ ${tableName}: Not found`)
      } else {
        auditResults.tables[tableName] = {
          exists: 'unknown',
          accessible: false,
          row_count: null,
          error: error.message
        }
        console.log(`⚠️  ${tableName}: Error - ${error.message}`)
      }
    } catch (err) {
      auditResults.tables[tableName] = {
        exists: 'unknown',
        accessible: false,
        row_count: null,
        error: err.message
      }
      console.log(`💥 ${tableName}: Connection error - ${err.message}`)
    }
  }

  // Step 2: For accessible tables, get detailed schema information
  console.log('')
  console.log('📋 STEP 2: Analyzing accessible table structures...')
  console.log('==================================================')

  const accessibleTables = Array.from(discoveredTables).filter(table => 
    auditResults.tables[table].accessible === true
  )

  for (const tableName of accessibleTables) {
    console.log(`\n🔍 Analyzing ${tableName}:`)
    try {
      // Get a sample record to understand structure
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (!error && data && data.length > 0) {
        const sampleRecord = data[0]
        const columns = Object.keys(sampleRecord)
        
        auditResults.tables[tableName].columns = {}
        auditResults.tables[tableName].sample_data = sampleRecord
        
        console.log(`   📊 Columns (${columns.length}):`)
        columns.forEach(col => {
          const value = sampleRecord[col]
          const type = value === null ? 'null' : typeof value
          const hasData = value !== null && value !== undefined
          
          auditResults.tables[tableName].columns[col] = {
            type: type,
            has_sample_data: hasData,
            sample_value: hasData ? (typeof value === 'object' ? JSON.stringify(value).slice(0, 100) : String(value).slice(0, 100)) : null
          }
          
          console.log(`      ${col}: ${type} ${hasData ? `(${auditResults.tables[tableName].columns[col].sample_value})` : '(null)'}`)
        })
      } else {
        auditResults.tables[tableName].columns = {}
        auditResults.tables[tableName].sample_data = null
        console.log(`   📊 Table exists but no data to analyze structure`)
      }
    } catch (err) {
      console.log(`   ❌ Error analyzing structure: ${err.message}`)
      auditResults.tables[tableName].analysis_error = err.message
    }
  }

  // Step 3: Check for available functions (including exec alternatives)
  console.log('')
  console.log('⚙️  STEP 3: Checking available functions...')
  console.log('===========================================')

  const functionsToCheck = [
    'exec', 'exec_sql', 'execute', 'sql_exec',
    'pg_exec', 'run_sql', 'execute_sql'
  ]

  for (const funcName of functionsToCheck) {
    try {
      const { data, error } = await supabase.rpc(funcName, { sql: 'SELECT 1 as test' })
      
      if (!error) {
        auditResults.functions[funcName] = { available: true, tested: true }
        console.log(`✅ ${funcName}: Available and working`)
      } else {
        auditResults.functions[funcName] = { 
          available: false, 
          tested: true, 
          error: error.message 
        }
        console.log(`❌ ${funcName}: ${error.message}`)
      }
    } catch (err) {
      auditResults.functions[funcName] = { 
        available: false, 
        tested: true, 
        error: err.message 
      }
      console.log(`❌ ${funcName}: ${err.message}`)
    }
  }

  // Step 4: Generate summary
  console.log('')
  console.log('📋 STEP 4: Summary...')
  console.log('=====================')

  const totalTables = Object.keys(auditResults.tables).length
  const existingTables = Object.values(auditResults.tables).filter(t => t.exists === true).length
  const accessibleTables2 = Object.values(auditResults.tables).filter(t => t.accessible === true).length
  const availableFunctions = Object.values(auditResults.functions).filter(f => f.available === true).length

  auditResults.summary = {
    total_tables_checked: totalTables,
    existing_tables: existingTables,
    accessible_tables: accessibleTables2,
    missing_tables: totalTables - existingTables,
    available_functions: availableFunctions,
    total_functions_checked: Object.keys(auditResults.functions).length
  }

  console.log(`📊 Tables checked: ${totalTables}`)
  console.log(`✅ Tables existing: ${existingTables}`)
  console.log(`🔓 Tables accessible: ${accessibleTables2}`)
  console.log(`❌ Tables missing: ${totalTables - existingTables}`)
  console.log(`⚙️  Functions available: ${availableFunctions}`)

  // Step 5: Save detailed results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const resultsFile = `docs/complete-supabase-audit-${timestamp}.json`
  
  try {
    fs.writeFileSync(resultsFile, JSON.stringify(auditResults, null, 2))
    console.log(`📄 Detailed results saved: ${resultsFile}`)
  } catch (err) {
    console.log(`⚠️  Could not save results file: ${err.message}`)
  }

  // Step 6: Specific recommendations
  console.log('')
  console.log('🎯 SPECIFIC RECOMMENDATIONS:')
  console.log('=============================')

  // Check if analytics tables are missing
  const analyticsTables = ['personal_insights', 'professional_competencies', 'impact_stories', 
                          'opportunity_recommendations', 'development_plans', 'analysis_jobs']
  const missingAnalytics = analyticsTables.filter(table => !auditResults.tables[table] || auditResults.tables[table].exists !== true)
  
  if (missingAnalytics.length > 0) {
    console.log(`🚨 Individual Analytics MISSING: ${missingAnalytics.length}/${analyticsTables.length} tables`)
    console.log(`   Missing: ${missingAnalytics.join(', ')}`)
    console.log(`   Action: Deploy database/14-individual-analytics-schema-corrected.sql`)
  } else {
    console.log(`✅ Individual Analytics: All tables present`)
  }

  // Check exec function availability
  if (availableFunctions === 0) {
    console.log(`🔧 NO SQL execution functions available`)
    console.log(`   Action: Manual SQL deployment required via Supabase SQL Editor`)
    console.log(`   Alternative: Investigate creating custom exec function`)
  } else {
    console.log(`✅ SQL execution functions available`)
  }

  console.log('')
  console.log('🔗 Supabase SQL Editor: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql')
  console.log('')

  return auditResults
}

// Execute audit
if (require.main === module) {
  completeSchemaAudit()
    .then(results => {
      console.log('✅ Complete audit finished successfully!')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Audit failed:', error)
      process.exit(1)
    })
}

module.exports = { completeSchemaAudit }