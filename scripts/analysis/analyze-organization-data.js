#!/usr/bin/env node

/**
 * Script to analyze organization data linkages and fix missing connections
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function analyzeOrganizationData() {
  console.log('🔍 Analyzing organization data linkages...')

  try {
    // Get all organizations with their tenant IDs
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, tenant_id')
      .order('name')

    if (orgError) {
      console.error('❌ Error fetching organizations:', orgError)
      return
    }

    console.log(`\n📋 Found ${organizations.length} organizations:\n`)

    for (const org of organizations) {
      console.log(`🏢 ${org.name} (${org.id})`)
      console.log(`   📋 Tenant ID: ${org.tenant_id}`)

      // Count storytellers in this tenant
      const { count: storytellerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', org.tenant_id)

      // Count stories in this tenant
      const { count: storyCount } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', org.tenant_id)

      // Count projects in this tenant
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', org.tenant_id)

      // Count galleries in this tenant
      const { count: galleryCount } = await supabase
        .from('galleries')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', org.tenant_id)

      // Count organization roles for this tenant
      const { count: roleCount } = await supabase
        .from('organization_roles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id)

      console.log(`   👥 Storytellers: ${storytellerCount || 0}`)
      console.log(`   📚 Stories: ${storyCount || 0}`)
      console.log(`   🎯 Projects: ${projectCount || 0}`)
      console.log(`   🖼️ Galleries: ${galleryCount || 0}`)
      console.log(`   🔗 Org Roles: ${roleCount || 0}`)

      // If we have storytellers but no org roles, that's a problem
      if ((storytellerCount || 0) > 0 && (roleCount || 0) === 0) {
        console.log(`   ⚠️ Has storytellers but no organization roles - needs linking!`)
      }

      console.log('')
    }

    // Check for storytellers not linked to any organization
    const { count: unlinkedStorytellers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .is('tenant_id', null)

    if (unlinkedStorytellers > 0) {
      console.log(`⚠️ Found ${unlinkedStorytellers} storytellers not linked to any organization`)
    }

    // Check for stories not linked to any organization
    const { count: unlinkedStories } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .is('tenant_id', null)

    if (unlinkedStories > 0) {
      console.log(`⚠️ Found ${unlinkedStories} stories not linked to any organization`)
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

// Run the analysis
analyzeOrganizationData()