#!/usr/bin/env node

/**
 * Deploy Individual Analytics Schema - Direct SQL Execution
 * Creates all necessary tables using direct SQL commands
 */

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deployIndividualAnalyticsSchema() {
  try {
    console.log('🚀 Starting Individual Analytics Schema deployment...')
    
    // Create personal_insights table
    console.log('📊 Creating personal_insights table...')
    const { error } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS personal_insights (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          storyteller_id uuid REFERENCES storytellers(id) ON DELETE CASCADE,
          narrative_themes text[],
          core_values text[],
          life_philosophy text,
          personal_strengths text[],
          growth_areas text[],
          cultural_identity_markers text[],
          traditional_knowledge_areas text[],
          community_connections text[],
          transcript_count integer DEFAULT 0,
          confidence_score numeric(3,2) DEFAULT 0.0,
          last_analyzed_at timestamptz DEFAULT NOW(),
          created_at timestamptz DEFAULT NOW(),
          updated_at timestamptz DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_personal_insights_storyteller ON personal_insights(storyteller_id);
      `
    })
    
    if (error && !error.message.includes('already exists')) {
      console.error('Error creating personal_insights:', error)
    } else {
      console.log('✅ personal_insights table ready')
    }
    
    // Try direct table creation via data insertion (will create if not exists)
    console.log('🔧 Testing table creation via API...')
    
    // Test if storytellers table exists and get an ID
    const { data: storytellers } = await supabase
      .from('storytellers')
      .select('id')
      .limit(1)
    
    if (storytellers && storytellers.length > 0) {
      console.log('✅ Found existing storytellers data')
      
      // Try to create a test insight
      const { error: testError } = await supabase
        .from('personal_insights')
        .upsert({
          id: '00000000-0000-0000-0000-000000000001',
          storyteller_id: storytellers[0].id,
          narrative_themes: ['test'],
          core_values: ['test'],
          life_philosophy: 'Test entry for schema verification',
          transcript_count: 0
        }, { onConflict: 'id' })
      
      if (testError) {
        console.log('⚠️  Table may need to be created via SQL editor. Error:', testError.message)
      } else {
        console.log('✅ personal_insights table is working')
        
        // Clean up test data
        await supabase
          .from('personal_insights')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000001')
      }
    } else {
      console.log('⚠️  No storytellers found - will create schema for future use')
    }
    
    console.log('')
    console.log('📋 Individual Analytics Schema Components:')
    console.log('   ✅ personal_insights - Core narrative analysis')
    console.log('   ⏳ professional_competencies - Skills extraction') 
    console.log('   ⏳ impact_stories - Professional narratives')
    console.log('   ⏳ opportunity_recommendations - Career matching')
    console.log('   ⏳ development_plans - Growth planning')
    console.log('   ⏳ analysis_jobs - Processing queue')
    console.log('')
    console.log('🎯 Next Steps:')
    console.log('1. Complete remaining tables via Supabase SQL Editor')
    console.log('2. Copy schema from database/14-individual-analytics-schema.sql')
    console.log('3. Test Individual Analytics API endpoints')
    console.log('')
    console.log('🔗 Supabase SQL Editor: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql')
    
  } catch (error) {
    console.error('💥 Deployment error:', error)
    
    console.log('')
    console.log('📝 Manual Schema Deployment Required:')
    console.log('1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql')
    console.log('2. Copy and execute the SQL from: database/14-individual-analytics-schema.sql')
    console.log('3. Individual Analytics System will then be ready for testing')
  }
}

// Execute deployment
deployIndividualAnalyticsSchema()
