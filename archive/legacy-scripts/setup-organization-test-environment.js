#!/usr/bin/env node

/**
 * Setup Organization Test Environment
 * Prepare one organization for dashboard testing with sample data analysis
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupOrganizationTestEnvironment() {
  console.log('🏢 SETTING UP ORGANIZATION TEST ENVIRONMENT')
  console.log('==========================================')
  console.log('')

  try {
    // Step 1: Select Snow Foundation as test organization
    console.log('🎯 STEP 1: Selecting test organization...')
    
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('name', 'Snow Foundation')
      .single()

    if (orgError || !org) {
      throw new Error('Snow Foundation not found - using first available organization')
    }

    console.log(`✅ Selected Organization: ${org.name}`)
    console.log(`   ID: ${org.id}`)
    console.log(`   Tenant ID: ${org.tenant_id}`)
    console.log(`   Type: ${org.type}`)
    console.log(`   Description: ${org.description}`)
    console.log('')

    // Step 2: Analyze tenant data for this organization
    console.log('👥 STEP 2: Analyzing tenant membership...')
    
    const { data: members, error: membersError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name, tenant_roles, cultural_background, current_role, story_visibility_level, ai_processing_consent')
      .eq('tenant_id', org.tenant_id)

    if (membersError) {
      throw new Error(`Error fetching members: ${membersError.message}`)
    }

    console.log(`✅ Tenant Members: ${members?.length || 0}`)
    
    if (members && members.length > 0) {
      console.log('')
      console.log('📋 Member Summary:')
      members.slice(0, 10).forEach((member, index) => {
        console.log(`   ${index + 1}. ${member.display_name || member.full_name || member.id}`)
        console.log(`      Roles: ${JSON.stringify(member.tenant_roles)}`)
        console.log(`      Background: ${member.cultural_background || 'Not specified'}`)
        console.log(`      Current Role: ${member.current_role || 'Not specified'}`)
        console.log(`      Story Visibility: ${member.story_visibility_level}`)
        console.log(`      AI Consent: ${member.ai_processing_consent}`)
        console.log('')
      })

      if (members.length > 10) {
        console.log(`   ... and ${members.length - 10} more members`)
        console.log('')
      }
    }

    // Step 3: Analyze organization's story collection
    console.log('📚 STEP 3: Analyzing organization story collection...')
    
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, title, author_id, story_type, privacy_level, cultural_sensitivity_level, status, themes, created_at')
      .eq('tenant_id', org.tenant_id)
      .limit(50)

    if (storiesError) {
      console.log(`⚠️  Story analysis error: ${storiesError.message}`)
    } else {
      console.log(`✅ Organization Stories: ${stories?.length || 0}`)
      
      if (stories && stories.length > 0) {
        // Analyze story patterns
        const storyTypes = {}
        const privacyLevels = {}
        const culturalSensitivity = {}
        const storyStatus = {}

        stories.forEach(story => {
          storyTypes[story.story_type] = (storyTypes[story.story_type] || 0) + 1
          privacyLevels[story.privacy_level] = (privacyLevels[story.privacy_level] || 0) + 1
          culturalSensitivity[story.cultural_sensitivity_level] = (culturalSensitivity[story.cultural_sensitivity_level] || 0) + 1
          storyStatus[story.status] = (storyStatus[story.status] || 0) + 1
        })

        console.log('')
        console.log('📊 Story Analysis:')
        console.log('   Story Types:')
        Object.entries(storyTypes).forEach(([type, count]) => {
          console.log(`     ${type}: ${count} stories`)
        })
        
        console.log('   Privacy Levels:')
        Object.entries(privacyLevels).forEach(([level, count]) => {
          console.log(`     ${level}: ${count} stories`)
        })

        console.log('   Cultural Sensitivity:')
        Object.entries(culturalSensitivity).forEach(([level, count]) => {
          console.log(`     ${level}: ${count} stories`)
        })

        console.log('   Status Distribution:')
        Object.entries(storyStatus).forEach(([status, count]) => {
          console.log(`     ${status}: ${count} stories`)
        })

        console.log('')
        console.log('📖 Sample Stories:')
        stories.slice(0, 5).forEach((story, index) => {
          console.log(`   ${index + 1}. ${story.title}`)
          console.log(`      Type: ${story.story_type} | Privacy: ${story.privacy_level} | Status: ${story.status}`)
          console.log(`      Cultural Level: ${story.cultural_sensitivity_level}`)
          console.log(`      Themes: ${story.themes?.slice(0, 3).join(', ')}`)
          console.log(`      Created: ${new Date(story.created_at).toLocaleDateString()}`)
          console.log('')
        })
      }
    }

    // Step 4: Check for analytics data from organization members
    console.log('📊 STEP 4: Checking organization member analytics...')
    
    let analyticsData = []
    
    if (members && members.length > 0) {
      const memberIds = members.map(m => m.id)
      
      const { data: fetchedAnalytics, error: analyticsError } = await supabase
        .from('personal_insights')
        .select('profile_id, narrative_themes, core_values, personal_strengths, cultural_identity_markers, created_at')
        .in('profile_id', memberIds)
      
      analyticsData = fetchedAnalytics || []

      if (analyticsError) {
        console.log(`⚠️  Analytics error: ${analyticsError.message}`)
      } else {
        console.log(`✅ Member Analytics: ${analyticsData?.length || 0} records`)
        
        if (analyticsData && analyticsData.length > 0) {
          // Aggregate organization analytics
          const allThemes = []
          const allValues = []
          const allStrengths = []
          const allCulturalMarkers = []

          analyticsData.forEach(insight => {
            allThemes.push(...(insight.narrative_themes || []))
            allValues.push(...(insight.core_values || []))
            allStrengths.push(...(insight.personal_strengths || []))
            allCulturalMarkers.push(...(insight.cultural_identity_markers || []))
          })

          // Count frequencies
          const themeFreq = {}
          const valueFreq = {}
          const strengthFreq = {}

          allThemes.forEach(theme => themeFreq[theme] = (themeFreq[theme] || 0) + 1)
          allValues.forEach(value => valueFreq[value] = (valueFreq[value] || 0) + 1)
          allStrengths.forEach(strength => strengthFreq[strength] = (strengthFreq[strength] || 0) + 1)

          console.log('')
          console.log('🧠 Organization Analytics Aggregation:')
          console.log(`   Members with Analytics: ${analyticsData.length}/${members.length}`)
          
          console.log('   Top Community Themes:')
          Object.entries(themeFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .forEach(([theme, count]) => {
              console.log(`     ${theme}: ${count} members`)
            })

          console.log('   Top Community Values:')
          Object.entries(valueFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .forEach(([value, count]) => {
              console.log(`     ${value}: ${count} members`)
            })

          console.log('   Top Community Strengths:')
          Object.entries(strengthFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .forEach(([strength, count]) => {
              console.log(`     ${strength}: ${count} members`)
            })
        }
      }
    }

    // Step 5: Generate organization dashboard URLs and implementation plan
    console.log('')
    console.log('🌐 STEP 5: Organization Dashboard Implementation Plan')
    console.log('====================================================')
    
    const orgDashboardBase = `/organizations/${org.id}`
    
    console.log(`🏢 Organization: ${org.name}`)
    console.log(`   Dashboard Base URL: ${orgDashboardBase}`)
    console.log('')
    console.log('📱 Required Dashboard Pages:')
    console.log(`   ${orgDashboardBase}/dashboard - Organization overview & metrics`)
    console.log(`   ${orgDashboardBase}/members - Community member directory (${members?.length || 0} members)`)
    console.log(`   ${orgDashboardBase}/stories - Story collection (${stories?.length || 0} stories)`)
    console.log(`   ${orgDashboardBase}/analytics - Aggregated member insights`)
    console.log(`   ${orgDashboardBase}/settings - Organization management`)
    console.log('')

    // Step 6: Implementation checklist and next steps
    console.log('✅ ORGANIZATION TEST ENVIRONMENT READY!')
    console.log('=======================================')
    console.log('')
    console.log('🎯 IMPLEMENTATION CHECKLIST:')
    console.log('')
    console.log('📋 Phase 1 - Foundation (Week 1-2):')
    console.log('   🔧 Create organization dashboard page structure')
    console.log('   🔧 Implement tenant-based authentication middleware')
    console.log('   🔧 Build member directory with profile access')
    console.log('   🔧 Create organization story collection view')
    console.log('   🔧 Add basic organization metrics dashboard')
    console.log('')
    console.log('📊 Phase 2 - Analytics (Week 3-4):')
    console.log('   🔧 Aggregate member analytics for organization insights')
    console.log('   🔧 Create organization-level skill and strength visualization')
    console.log('   🔧 Build community theme and value analysis')
    console.log('   🔧 Implement story impact and reach metrics')
    console.log('   🔧 Add member engagement and participation tracking')
    console.log('')
    console.log('🤝 Phase 3 - Community Features (Week 5-6):')
    console.log('   🔧 Build member mentorship matching system')
    console.log('   🔧 Create story curation and featuring tools')
    console.log('   🔧 Implement member collaboration features')
    console.log('   🔧 Add cultural protocol and elder approval workflows')
    console.log('   🔧 Create community event and activity coordination')
    console.log('')

    console.log('🚀 IMMEDIATE NEXT STEPS:')
    console.log(`   1. Create Next.js page: src/app${orgDashboardBase}/dashboard/page.tsx`)
    console.log(`   2. Add organization authentication: lib/auth/organization.ts`)
    console.log(`   3. Create organization service: lib/services/organization.service.ts`)
    console.log(`   4. Build member management: components/organization/MemberDirectory.tsx`)
    console.log(`   5. Test with Snow Foundation data`)
    console.log('')

    console.log('📝 SAMPLE DATA SUMMARY FOR TESTING:')
    console.log(`   🏢 Organization: ${org.name} (${org.type})`)
    console.log(`   👥 Members: ${members?.length || 0} profiles`)
    console.log(`   📚 Stories: ${stories?.length || 0} stories`)
    console.log(`   📊 Analytics: ${analyticsData?.length || 0} member insights`)
    console.log(`   🏷️  Tenant ID: ${org.tenant_id}`)
    console.log('')

    return {
      success: true,
      organization: org,
      memberCount: members?.length || 0,
      storyCount: stories?.length || 0,
      analyticsCount: analyticsData?.length || 0,
      dashboardUrl: orgDashboardBase,
      readyForImplementation: true
    }

  } catch (error) {
    console.error('💥 ORGANIZATION SETUP FAILED:', error.message)
    console.error('Stack trace:', error.stack)
    return {
      success: false,
      error: error.message
    }
  }
}

// Execute setup
if (require.main === module) {
  setupOrganizationTestEnvironment()
    .then(result => {
      if (result.success) {
        console.log('✅ Organization test environment ready!')
        console.log(`🎯 Next: Implement dashboard at ${result.dashboardUrl}/dashboard`)
        process.exit(0)
      } else {
        console.log('❌ Organization setup failed - review errors above')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Unexpected setup error:', error)
      process.exit(1)
    })
}

module.exports = { setupOrganizationTestEnvironment }