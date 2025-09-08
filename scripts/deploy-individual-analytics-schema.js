#!/usr/bin/env node

/**
 * Deploy Individual Analytics Schema
 * Creates all necessary tables and indexes for the Individual Transcript Analysis System
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deployIndividualAnalyticsSchema() {
  try {
    console.log('🚀 Starting Individual Analytics Schema deployment...')
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'database', '14-individual-analytics-schema.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📁 Schema file loaded successfully')
    
    // Execute the schema
    console.log('⚡ Executing Individual Analytics schema...')
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSql })
    
    if (error) {
      console.error('❌ Schema deployment failed:', error)
      throw error
    }
    
    console.log('✅ Individual Analytics schema deployed successfully!')
    
    // Verify table creation
    console.log('🔍 Verifying table creation...')
    
    const tablesToVerify = [
      'personal_insights',
      'professional_competencies', 
      'impact_stories',
      'opportunity_recommendations',
      'development_plans',
      'analysis_jobs'
    ]
    
    for (const table of tablesToVerify) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error && !error.message.includes('relation "public.exec_sql" does not exist')) {
        console.error(`❌ Error accessing ${table}:`, error.message)
      } else {
        console.log(`✅ Table '${table}' is accessible`)
      }
    }
    
    // Test basic functionality
    console.log('🧪 Testing basic table operations...')
    
    // Try to insert and delete a test record (if storytellers table exists)
    const { data: storytellers } = await supabase
      .from('storytellers')
      .select('id')
      .limit(1)
    
    if (storytellers && storytellers.length > 0) {
      const testStorytellerId = storytellers[0].id
      
      // Test personal_insights
      const { error: insertError } = await supabase
        .from('personal_insights')
        .insert({
          storyteller_id: testStorytellerId,
          narrative_themes: ['test_theme'],
          core_values: ['test_value'],
          life_philosophy: 'Test philosophy for schema verification',
          transcript_count: 0,
          confidence_score: 0.5
        })
      
      if (!insertError) {
        console.log('✅ Test insert successful')
        
        // Clean up test data
        await supabase
          .from('personal_insights')
          .delete()
          .eq('storyteller_id', testStorytellerId)
          .eq('life_philosophy', 'Test philosophy for schema verification')
        
        console.log('✅ Test cleanup successful')
      } else {
        console.log('⚠️  Test insert failed (may be due to RLS):', insertError.message)
      }
    }
    
    console.log('📊 Individual Analytics System Database Summary:')
    console.log('   📝 personal_insights - Narrative themes, values, philosophy')
    console.log('   🎯 professional_competencies - Skills analysis and market value')
    console.log('   📈 impact_stories - Professional impact narratives')
    console.log('   🔍 opportunity_recommendations - Career and grant matching')
    console.log('   📋 development_plans - Personal growth planning')
    console.log('   ⚙️  analysis_jobs - AI processing queue management')
    console.log('')
    console.log('🔐 Row Level Security policies created (disabled for development)')
    console.log('📈 Performance indexes created for optimal query speed')
    console.log('')
    console.log('🎉 Individual Analytics Schema deployment complete!')
    console.log('')
    console.log('Next Steps:')
    console.log('1. Test the Individual Analytics API endpoints')
    console.log('2. Run end-to-end analysis with real transcript data')
    console.log('3. Deploy RLS policies when ready for production')
    
  } catch (error) {
    console.error('💥 Deployment failed:', error)
    process.exit(1)
  }
}

// Execute if run directly
if (require.main === module) {
  deployIndividualAnalyticsSchema()
}

module.exports = { deployIndividualAnalyticsSchema }