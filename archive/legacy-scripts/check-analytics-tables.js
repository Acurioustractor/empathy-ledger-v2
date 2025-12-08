#!/usr/bin/env node

/**
 * Check Individual Analytics Tables in Supabase
 * Tests which analytics tables are deployed
 */

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAnalyticsTables() {
  console.log('🔍 Checking Individual Analytics Tables...')
  console.log('')

  // List of analytics tables to check
  const analyticsTablesList = [
    'personal_insights',
    'professional_competencies', 
    'impact_stories',
    'opportunity_recommendations',
    'development_plans',
    'analysis_jobs'
  ]

  // Additional AI and photo tables
  const otherTables = [
    'content_enhancement_results',
    'moderation_results',
    'elder_review_queue',
    'ai_safety_logs',
    'galleries',
    'photo_faces',
    'media_assets'
  ]

  let analyticsDeployed = 0
  let otherDeployed = 0
  let analyticsTotal = analyticsTablesList.length

  console.log('📊 INDIVIDUAL ANALYTICS TABLES:')
  console.log('================================')

  for (const table of analyticsTablesList) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.message.includes('Could not find the table')) {
          console.log(`❌ ${table}: Not deployed`)
        } else if (error.message.includes('permission denied') || error.message.includes('RLS')) {
          console.log(`✅ ${table}: Deployed (RLS protected)`)
          analyticsDeployed++
        } else {
          console.log(`⚠️  ${table}: Error - ${error.message}`)
        }
      } else {
        console.log(`✅ ${table}: Deployed and accessible`)
        analyticsDeployed++
      }
    } catch (err) {
      console.log(`❌ ${table}: Connection error`)
    }
  }

  console.log('')
  console.log('🗄️  OTHER RELATED TABLES:')
  console.log('=========================')

  for (const table of otherTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        if (error.message.includes('Could not find the table')) {
          console.log(`❌ ${table}: Not deployed`)
        } else if (error.message.includes('permission denied') || error.message.includes('RLS')) {
          console.log(`✅ ${table}: Deployed (RLS protected)`)
          otherDeployed++
        } else {
          console.log(`⚠️  ${table}: Error - ${error.message}`)
        }
      } else {
        console.log(`✅ ${table}: Deployed and accessible`)
        otherDeployed++
      }
    } catch (err) {
      console.log(`❌ ${table}: Connection error`)
    }
  }

  console.log('')
  console.log('📋 DEPLOYMENT STATUS SUMMARY:')
  console.log('==============================')
  console.log(`📊 Individual Analytics: ${analyticsDeployed}/${analyticsTotal} tables deployed`)
  console.log(`🗄️  Other Systems: ${otherDeployed}/${otherTables.length} tables deployed`)
  
  if (analyticsDeployed === 0) {
    console.log('')
    console.log('🚨 INDIVIDUAL ANALYTICS NOT DEPLOYED')
    console.log('   Need to run: database/14-individual-analytics-schema.sql')
    console.log('   Via Supabase SQL Editor')
  } else if (analyticsDeployed < analyticsTotal) {
    console.log('')
    console.log('⚠️  INDIVIDUAL ANALYTICS PARTIALLY DEPLOYED')
    console.log(`   ${analyticsTotal - analyticsDeployed} tables still need deployment`)
  } else {
    console.log('')
    console.log('✅ INDIVIDUAL ANALYTICS FULLY DEPLOYED!')
  }

  if (otherDeployed > 0) {
    console.log('')
    console.log('ℹ️  Other systems have some tables deployed')
  }

  console.log('')
  console.log('🔗 Supabase SQL Editor: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql')
}

// Execute check
checkAnalyticsTables().catch(console.error)