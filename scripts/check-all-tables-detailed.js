#!/usr/bin/env node

/**
 * Check All Tables and Their Readiness for Schema Deployment
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAllTables() {
  console.log('🔍 COMPREHENSIVE TABLE ANALYSIS')
  console.log('=================================')
  console.log('')

  // Core tables that schemas depend on
  const coreTables = ['profiles', 'organizations', 'stories', 'media_assets']
  
  // Individual Analytics tables
  const analyticsTables = [
    'personal_insights', 'professional_competencies', 'impact_stories',
    'opportunity_recommendations', 'development_plans', 'analysis_jobs'
  ]
  
  // Photo Gallery tables (excluding media_assets which exists)
  const photoTables = [
    'galleries', 'gallery_media_associations', 'cultural_tags',
    'media_cultural_tags', 'photo_people', 'cultural_locations', 'media_locations'
  ]
  
  // AI Enhancement tables
  const aiTables = [
    'content_enhancement_results', 'moderation_results', 'elder_review_queue',
    'ai_safety_logs', 'ai_recommendation_logs', 'search_analytics',
    'ai_connection_analysis_logs', 'ai_enhancement_logs', 'moderation_appeals'
  ]

  async function checkTableGroup(tables, groupName, emoji) {
    console.log(`${emoji} ${groupName.toUpperCase()} TABLES:`)
    console.log('='.repeat(groupName.length + 10))
    
    let deployed = 0
    const total = tables.length
    
    for (const table of tables) {
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
            deployed++
          } else {
            console.log(`⚠️  ${table}: Error - ${error.message}`)
          }
        } else {
          console.log(`✅ ${table}: Deployed and accessible`)
          deployed++
        }
      } catch (err) {
        console.log(`❌ ${table}: Connection error`)
      }
    }
    
    console.log(`📊 Status: ${deployed}/${total} deployed`)
    console.log('')
    
    return { deployed, total, groupName }
  }

  // Check all groups
  const coreStatus = await checkTableGroup(coreTables, 'Core Foundation', '🏗️')
  const analyticsStatus = await checkTableGroup(analyticsTables, 'Individual Analytics', '📊') 
  const photoStatus = await checkTableGroup(photoTables, 'Photo Gallery', '📸')
  const aiStatus = await checkTableGroup(aiTables, 'AI Enhancement', '🤖')

  // Summary
  console.log('📋 DEPLOYMENT SUMMARY:')
  console.log('======================')
  console.log(`🏗️  Core Foundation: ${coreStatus.deployed}/${coreStatus.total} (${coreStatus.deployed === coreStatus.total ? 'READY' : 'INCOMPLETE'})`)
  console.log(`📊 Individual Analytics: ${analyticsStatus.deployed}/${analyticsStatus.total} (${analyticsStatus.deployed === analyticsStatus.total ? 'READY' : 'NEEDS DEPLOYMENT'})`)
  console.log(`📸 Photo Gallery: ${photoStatus.deployed}/${photoStatus.total} (${photoStatus.deployed === photoStatus.total ? 'READY' : 'NEEDS DEPLOYMENT'})`)
  console.log(`🤖 AI Enhancement: ${aiStatus.deployed}/${aiStatus.total} (${aiStatus.deployed === aiStatus.total ? 'READY' : 'NEEDS DEPLOYMENT'})`)
  
  console.log('')
  console.log('🎯 RECOMMENDED DEPLOYMENT ORDER:')
  console.log('=================================')
  
  if (analyticsStatus.deployed === 0) {
    console.log('1️⃣  HIGH PRIORITY: Individual Analytics System')
    console.log('   📁 File: database/14-individual-analytics-schema.sql')
    console.log('   🔧 Method: Copy/paste into Supabase SQL Editor')
    console.log('')
  }
  
  if (photoStatus.deployed === 0) {
    console.log('2️⃣  MEDIUM PRIORITY: Photo Gallery System')
    console.log('   📁 File: database/photo-gallery-schema.sql')
    console.log('   ⚠️  NOTE: media_assets exists but may need column additions')
    console.log('')
  }
  
  if (aiStatus.deployed === 0) {
    console.log('3️⃣  MEDIUM PRIORITY: AI Enhancement System')
    console.log('   📁 File: database/ai-enhancement-schema.sql')
    console.log('   🔧 Method: Copy/paste into Supabase SQL Editor')
    console.log('')
  }

  console.log('🔗 Supabase SQL Editor: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql')
}

checkAllTables().catch(console.error)
