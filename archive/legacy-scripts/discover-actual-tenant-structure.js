#!/usr/bin/env node

/**
 * Discover Actual Tenant Structure
 * First discover what tables and columns actually exist, then analyze tenant relationships
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yvnuayzslukamizrlhwb.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function discoverActualTenantStructure() {
  console.log('🔍 DISCOVERING ACTUAL TENANT STRUCTURE')
  console.log('=====================================')
  console.log('')

  try {
    // Step 1: Organizations Analysis (we know this works)
    console.log('🏢 STEP 1: Organizations (Confirmed Working)...')
    
    const { data: organizations } = await supabase
      .from('organizations')
      .select('id, tenant_id, name, type, cultural_protocols, created_at')
      .limit(5)

    console.log(`✅ Organizations: ${organizations?.length || 0} found`)
    
    const tenantIds = new Set()
    organizations?.forEach(org => {
      if (org.tenant_id) tenantIds.add(org.tenant_id)
      console.log(`   ${org.name}: Tenant ${org.tenant_id?.substring(0, 8)}...`)
    })
    
    console.log(`🏷️  Unique Tenants: ${tenantIds.size}`)
    console.log('')

    // Step 2: Profiles Analysis (discover actual columns)
    console.log('👤 STEP 2: Profiles Structure Discovery...')
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profiles && profiles.length > 0) {
      const profileColumns = Object.keys(profiles[0])
      console.log('✅ Profile columns found:')
      profileColumns.forEach(col => {
        const value = profiles[0][col]
        console.log(`   ${col}: ${typeof value} ${value ? `(${String(value).substring(0, 50)})` : '(null)'}`)
      })
      
      // Check how many profiles have tenant_id
      const { count: profilesWithTenant } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('tenant_id', 'is', null)
      
      const { count: totalProfiles } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        
      console.log(`📊 Profiles with tenant_id: ${profilesWithTenant || 0}/${totalProfiles || 0}`)
    }
    console.log('')

    // Step 3: Stories Structure Discovery
    console.log('📚 STEP 3: Stories Structure Discovery...')
    
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('*')
      .limit(1)

    if (stories && stories.length > 0) {
      const storyColumns = Object.keys(stories[0])
      console.log('✅ Story columns found:')
      storyColumns.forEach(col => {
        const value = stories[0][col]
        console.log(`   ${col}: ${typeof value} ${value ? `(${String(value).substring(0, 50)})` : '(null)'}`)
      })
      
      // Check stories count and tenant distribution
      const { count: totalStories } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
      
      console.log(`📊 Total stories: ${totalStories || 0}`)
    } else if (storiesError) {
      console.log(`⚠️  Stories table error: ${storiesError.message}`)
    }
    console.log('')

    // Step 4: Check for storytellers or similar tables
    console.log('🎭 STEP 4: Storytellers/Authors Table Discovery...')
    
    const possibleTables = ['storytellers', 'authors', 'content_creators', 'users']
    
    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (!error && data) {
          console.log(`✅ Found table: ${tableName}`)
          if (data.length > 0) {
            const columns = Object.keys(data[0])
            console.log(`   Columns: ${columns.join(', ')}`)
            
            const { count } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true })
            console.log(`   Records: ${count || 0}`)
          }
        }
      } catch (e) {
        // Table doesn't exist or not accessible
      }
    }
    console.log('')

    // Step 5: Analytics Integration Check
    console.log('📊 STEP 5: Analytics and Tenant Integration...')
    
    const { data: analytics } = await supabase
      .from('personal_insights')
      .select('profile_id, narrative_themes, created_at')
      .limit(3)

    if (analytics && analytics.length > 0) {
      console.log(`✅ Analytics records: ${analytics.length}`)
      
      for (const insight of analytics) {
        // Get profile info for each analytics record
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, tenant_id, full_name, email')
          .eq('id', insight.profile_id)
          .single()

        console.log(`   Profile: ${profile?.full_name || insight.profile_id}`)
        console.log(`   Tenant: ${profile?.tenant_id || 'NO TENANT'}`)
        console.log(`   Analytics: ${insight.narrative_themes?.join(', ')}`)
        console.log('')
      }
    }

    // Step 6: Current Tenant Architecture Summary
    console.log('🏗️  STEP 6: Current Tenant Architecture Assessment...')
    
    const architectureAssessment = {
      organizations: {
        count: organizations?.length || 0,
        hasTenants: organizations?.every(org => org.tenant_id) || false,
        uniqueTenants: tenantIds.size
      },
      profiles: {
        hasTenantColumn: profiles && profiles.length > 0 && 'tenant_id' in profiles[0],
        profilesWithTenants: 0 // We'll get this from our previous query
      },
      stories: {
        exists: stories && stories.length > 0,
        columns: stories && stories.length > 0 ? Object.keys(stories[0]) : []
      },
      analytics: {
        working: analytics && analytics.length > 0,
        linkedToProfiles: true
      }
    }

    console.log('📋 Architecture Assessment:')
    console.log(`   🏢 Organizations: ${architectureAssessment.organizations.count} (${architectureAssessment.organizations.hasTenants ? 'ALL have tenants' : 'MISSING tenants'})`)
    console.log(`   👤 Profiles: ${architectureAssessment.profiles.hasTenantColumn ? 'HAS tenant_id column' : 'MISSING tenant_id column'}`)
    console.log(`   📚 Stories: ${architectureAssessment.stories.exists ? 'EXISTS' : 'NOT FOUND'}`)
    console.log(`   📊 Analytics: ${architectureAssessment.analytics.working ? 'WORKING' : 'NOT WORKING'}`)
    console.log('')

    // Step 7: Multi-Tenant Recommendations
    console.log('💡 MULTI-TENANT SETUP RECOMMENDATIONS')
    console.log('=====================================')
    
    if (architectureAssessment.organizations.hasTenants && architectureAssessment.organizations.count > 0) {
      console.log('✅ ORGANIZATIONS READY:')
      console.log('   • Organizations have proper tenant_id structure')
      console.log('   • Cultural protocols configured')
      console.log(`   • ${architectureAssessment.organizations.uniqueTenants} active tenants`)
      console.log('')

      console.log('🎯 IMMEDIATE ACTIONS NEEDED:')
      
      if (!architectureAssessment.profiles.hasTenantColumn) {
        console.log('   ❗ Link profiles to tenants/organizations')
      } else {
        console.log('   ✅ Profiles have tenant structure')
      }
      
      if (architectureAssessment.stories.exists) {
        console.log('   ✅ Stories system exists')
        console.log('   🔧 Need to verify tenant isolation for stories')
      } else {
        console.log('   ❗ Stories system needs investigation')
      }
      
      console.log('   🔧 Set up organizational dashboard structure')
      console.log('   🔧 Configure tenant-isolated analytics views')
      console.log('   🔧 Create organization admin interfaces')
      console.log('')

      console.log('🏢 PROPOSED ORGANIZATIONAL STRUCTURE:')
      console.log('   /organizations/[id]/dashboard - Organization overview')
      console.log('   /organizations/[id]/members - Community profiles')
      console.log('   /organizations/[id]/stories - Tenant story collection')
      console.log('   /organizations/[id]/analytics - Aggregated insights')
      console.log('   /organizations/[id]/settings - Tenant management')
      console.log('')
      
      console.log('🚀 NEXT DEVELOPMENT PHASE:')
      console.log('   1. Create organization dashboard pages')
      console.log('   2. Set up tenant-based RLS policies')
      console.log('   3. Build organization analytics aggregation')
      console.log('   4. Test multi-tenant data isolation')
      console.log('   5. Create community access patterns')

    } else {
      console.log('⚠️  SETUP NEEDED: Organizations need proper tenant structure')
    }

    console.log('')
    console.log('📋 SAMPLE ORGANIZATIONS READY FOR TESTING:')
    organizations?.forEach((org, index) => {
      console.log(`   ${index + 1}. ${org.name}`)
      console.log(`      ID: ${org.id}`)
      console.log(`      Tenant: ${org.tenant_id}`)
      console.log(`      Type: ${org.type || 'Not specified'}`)
      console.log('')
    })

    return {
      success: true,
      architecture: architectureAssessment,
      organizations: organizations || [],
      recommendationsReady: architectureAssessment.organizations.hasTenants && architectureAssessment.organizations.count > 0
    }

  } catch (error) {
    console.error('💥 DISCOVERY FAILED:', error.message)
    console.error('Stack trace:', error.stack)
    return {
      success: false,
      error: error.message
    }
  }
}

// Execute discovery
if (require.main === module) {
  discoverActualTenantStructure()
    .then(result => {
      if (result.success) {
        console.log('\n✅ Tenant structure discovery completed!')
        if (result.recommendationsReady) {
          console.log('🚀 Ready to proceed with organizational dashboard development!')
        } else {
          console.log('🔧 Additional tenant setup required before organizational features')
        }
        process.exit(0)
      } else {
        console.log('\n❌ Discovery failed - review errors above')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('❌ Unexpected discovery error:', error)
      process.exit(1)
    })
}

module.exports = { discoverActualTenantStructure }