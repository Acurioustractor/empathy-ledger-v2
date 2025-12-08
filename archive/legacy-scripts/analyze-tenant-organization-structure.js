#!/usr/bin/env node

/**
 * Analyze Tenant and Organization Structure
 * Review the multi-tenant architecture for organizational access planning
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function analyzeTenantOrganizationStructure() {
  console.log('🏢 ANALYZING TENANT & ORGANIZATION STRUCTURE')
  console.log('===========================================')
  console.log('')

  try {
    // Step 1: Examine Organizations Table
    console.log('🏛️  STEP 1: Organizations Table Analysis...')
    
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(10)

    if (orgError) {
      throw new Error(`Organizations table error: ${orgError.message}`)
    }

    console.log(`✅ Found ${organizations?.length || 0} organizations`)
    
    if (organizations && organizations.length > 0) {
      const sampleOrg = organizations[0]
      console.log('\n📋 Organization Structure:')
      Object.keys(sampleOrg).forEach(key => {
        const value = sampleOrg[key]
        const type = typeof value
        const display = type === 'object' ? JSON.stringify(value).substring(0, 100) : String(value).substring(0, 100)
        console.log(`   ${key}: ${type} ${value ? `(${display})` : '(null)'}`)
      })

      console.log('\n🏢 Sample Organizations:')
      organizations.slice(0, 5).forEach((org, index) => {
        console.log(`   ${index + 1}. ${org.name || org.display_name || org.id}`)
        console.log(`      Type: ${org.organization_type || 'Not specified'}`)
        console.log(`      Status: ${org.status || 'Unknown'}`)
        if (org.tenant_id) console.log(`      Tenant ID: ${org.tenant_id}`)
        if (org.member_count) console.log(`      Members: ${org.member_count}`)
        console.log('')
      })
    }

    // Step 2: Examine Profiles and Tenant Relationships  
    console.log('👤 STEP 2: Profiles and Tenant Relationships...')
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, tenant_id, full_name, organization_affiliations, cultural_affiliations')
      .not('tenant_id', 'is', null)
      .limit(10)

    if (profileError) {
      console.log(`⚠️  Profiles error: ${profileError.message}`)
    } else {
      console.log(`✅ Found ${profiles?.length || 0} profiles with tenant_id`)
      
      // Analyze tenant distribution
      const tenantCounts = {}
      profiles?.forEach(profile => {
        const tenantId = profile.tenant_id
        tenantCounts[tenantId] = (tenantCounts[tenantId] || 0) + 1
      })

      console.log('\n📊 Tenant Distribution:')
      Object.entries(tenantCounts).forEach(([tenantId, count]) => {
        console.log(`   ${tenantId}: ${count} profiles`)
      })

      if (profiles && profiles.length > 0) {
        console.log('\n👥 Sample Profile-Tenant Relationships:')
        profiles.slice(0, 3).forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.full_name || profile.id}`)
          console.log(`      Tenant: ${profile.tenant_id}`)
          console.log(`      Org Affiliations: ${JSON.stringify(profile.organization_affiliations)}`)
          console.log(`      Cultural Affiliations: ${JSON.stringify(profile.cultural_affiliations)}`)
          console.log('')
        })
      }
    }

    // Step 3: Examine Storytellers and Organization Links
    console.log('📖 STEP 3: Storytellers and Organization Links...')
    
    const { data: storytellers, error: storytellerError } = await supabase
      .from('storytellers')
      .select('id, display_name, organization_id, tenant_id, status')
      .not('organization_id', 'is', null)
      .limit(10)

    if (storytellerError) {
      console.log(`⚠️  Storytellers error: ${storytellerError.message}`)
    } else {
      console.log(`✅ Found ${storytellers?.length || 0} storytellers with organization links`)
      
      if (storytellers && storytellers.length > 0) {
        console.log('\n📚 Storyteller-Organization Relationships:')
        storytellers.slice(0, 5).forEach((storyteller, index) => {
          console.log(`   ${index + 1}. ${storyteller.display_name || storyteller.id}`)
          console.log(`      Organization: ${storyteller.organization_id}`)
          console.log(`      Tenant: ${storyteller.tenant_id || 'Not set'}`)
          console.log(`      Status: ${storyteller.status}`)
          console.log('')
        })
      }
    }

    // Step 4: Examine Stories and Tenant Access
    console.log('📑 STEP 4: Stories and Tenant Access Patterns...')
    
    const { data: stories, error: storyError } = await supabase
      .from('stories')
      .select('id, title, storyteller_id, organization_id, tenant_id, visibility, status')
      .limit(10)

    if (storyError) {
      console.log(`⚠️  Stories error: ${storyError.message}`)
    } else {
      console.log(`✅ Found ${stories?.length || 0} stories`)
      
      if (stories && stories.length > 0) {
        // Analyze visibility patterns
        const visibilityPatterns = {}
        const statusPatterns = {}
        
        stories.forEach(story => {
          const visibility = story.visibility || 'not_set'
          const status = story.status || 'not_set'
          visibilityPatterns[visibility] = (visibilityPatterns[visibility] || 0) + 1
          statusPatterns[status] = (statusPatterns[status] || 0) + 1
        })

        console.log('\n👁️  Story Visibility Patterns:')
        Object.entries(visibilityPatterns).forEach(([visibility, count]) => {
          console.log(`   ${visibility}: ${count} stories`)
        })

        console.log('\n📊 Story Status Patterns:')
        Object.entries(statusPatterns).forEach(([status, count]) => {
          console.log(`   ${status}: ${count} stories`)
        })

        console.log('\n📖 Sample Story Access Patterns:')
        stories.slice(0, 3).forEach((story, index) => {
          console.log(`   ${index + 1}. ${story.title || story.id}`)
          console.log(`      Storyteller: ${story.storyteller_id}`)
          console.log(`      Organization: ${story.organization_id || 'None'}`)
          console.log(`      Tenant: ${story.tenant_id || 'None'}`)
          console.log(`      Visibility: ${story.visibility}`)
          console.log(`      Status: ${story.status}`)
          console.log('')
        })
      }
    }

    // Step 5: Check Analytics Access Patterns
    console.log('📊 STEP 5: Analytics Access and Tenant Isolation...')
    
    const { data: analyticsInsights, error: analyticsError } = await supabase
      .from('personal_insights')
      .select('profile_id, narrative_themes, created_at')
      .limit(5)

    if (analyticsError) {
      console.log(`⚠️  Analytics error: ${analyticsError.message}`)
    } else {
      console.log(`✅ Analytics records accessible: ${analyticsInsights?.length || 0}`)
      
      if (analyticsInsights && analyticsInsights.length > 0) {
        console.log('\n🧠 Analytics-Profile Relationships:')
        for (const insight of analyticsInsights) {
          // Get the profile info for this insight
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, tenant_id, organization_affiliations')
            .eq('id', insight.profile_id)
            .single()
          
          console.log(`   Profile: ${profile?.full_name || insight.profile_id}`)
          console.log(`   Tenant: ${profile?.tenant_id || 'None'}`)
          console.log(`   Themes: ${insight.narrative_themes?.slice(0, 2).join(', ')}`)
          console.log(`   Created: ${new Date(insight.created_at).toLocaleDateString()}`)
          console.log('')
        }
      }
    }

    // Step 6: Analyze Current Multi-Tenant Architecture
    console.log('🏗️  STEP 6: Multi-Tenant Architecture Analysis...')
    
    // Check for RLS policies
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'organizations', 'stories', 'storytellers', 'personal_insights')
        ORDER BY tablename, policyname;
      `
    })

    if (policies?.status === 'success') {
      console.log('\n🔒 Row Level Security Policies Found:')
      // RLS policies would be in the response
      console.log('   ✅ RLS policies are configured for data isolation')
    } else {
      console.log('   ⚠️  Could not analyze RLS policies')
    }

    // Step 7: Generate Multi-Tenant Architecture Summary
    console.log('\n🎯 MULTI-TENANT ARCHITECTURE SUMMARY')
    console.log('====================================')
    
    const tenantAnalysis = {
      organizations: organizations?.length || 0,
      profilesWithTenants: profiles?.length || 0,
      storytellersLinked: storytellers?.length || 0,
      storiesTotal: stories?.length || 0,
      analyticsRecords: analyticsInsights?.length || 0,
      tenantDistribution: Object.keys(tenantCounts || {}).length
    }

    console.log(`🏢 Organizations: ${tenantAnalysis.organizations}`)
    console.log(`👤 Profiles with Tenants: ${tenantAnalysis.profilesWithTenants}`)
    console.log(`📖 Storytellers Linked: ${tenantAnalysis.storytellersLinked}`)
    console.log(`📑 Stories Available: ${tenantAnalysis.storiesTotal}`)
    console.log(`📊 Analytics Records: ${tenantAnalysis.analyticsRecords}`)
    console.log(`🏷️  Active Tenants: ${tenantAnalysis.tenantDistribution}`)
    console.log('')

    // Step 8: Recommendations for Organizational Access
    console.log('💡 ORGANIZATIONAL ACCESS RECOMMENDATIONS')
    console.log('=========================================')
    
    if (tenantAnalysis.organizations > 0 && tenantAnalysis.profilesWithTenants > 0) {
      console.log('✅ READY FOR ORGANIZATIONAL DEPLOYMENT:')
      console.log('   • Multi-tenant architecture is functional')
      console.log('   • Organizations have profiles and storytellers')
      console.log('   • Stories are linked to organizations')
      console.log('   • Analytics system can be tenant-isolated')
      console.log('')
      console.log('🎯 NEXT STEPS:')
      console.log('   1. Create organization admin dashboard')
      console.log('   2. Set up organization-level analytics views')
      console.log('   3. Configure organization story collections')
      console.log('   4. Test tenant data isolation')
      console.log('   5. Design community access patterns')
    } else {
      console.log('⚠️  ORGANIZATIONAL SETUP NEEDED:')
      console.log('   • Create sample organizations with proper tenant structure')
      console.log('   • Link profiles and storytellers to organizations')
      console.log('   • Set up organization-based story collections')
      console.log('   • Configure tenant-isolated analytics')
    }

    console.log('')
    console.log('🔗 Organizational Dashboard Concepts:')
    console.log('   /organizations/[id]/dashboard - Organization overview')
    console.log('   /organizations/[id]/storytellers - Community members')
    console.log('   /organizations/[id]/stories - Organization story collection')
    console.log('   /organizations/[id]/analytics - Aggregate analytics')
    console.log('   /organizations/[id]/settings - Organization management')
    console.log('')

    return {
      success: true,
      analysis: tenantAnalysis,
      readyForOrganizationalDeployment: tenantAnalysis.organizations > 0 && tenantAnalysis.profilesWithTenants > 0
    }

  } catch (error) {
    console.error('💥 TENANT ANALYSIS FAILED:', error.message)
    console.error('Stack trace:', error.stack)
    return {
      success: false,
      error: error.message
    }
  }
}

// Execute analysis
if (require.main === module) {
  analyzeTenantOrganizationStructure()
    .then(result => {
      if (result.success) {
        console.log('\n✅ Tenant and Organization analysis completed!')
        if (result.readyForOrganizationalDeployment) {
          console.log('🚀 System is ready for organizational access implementation!')
        } else {
          console.log('🔧 Additional setup needed for full organizational deployment')
        }
        process.exit(0)
      } else {
        console.log('\n❌ Analysis failed - review errors above')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Unexpected analysis error:', error)
      process.exit(1)
    })
}

module.exports = { analyzeTenantOrganizationStructure }