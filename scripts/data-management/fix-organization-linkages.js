#!/usr/bin/env node

/**
 * Script to fix organization linkages by creating proper organization_roles entries
 * This will make the frontend display correct member counts
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

async function fixOrganizationLinkages() {
  console.log('🔧 Fixing organization linkages...')

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

    let totalLinked = 0

    for (const org of organizations) {
      console.log(`\n🏢 Processing ${org.name}...`)

      // Get all storytellers (profiles) in this tenant
      const { data: storytellers, error: storytellerError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('tenant_id', org.tenant_id)

      if (storytellerError) {
        console.error(`❌ Error fetching storytellers for ${org.name}:`, storytellerError)
        continue
      }

      if (!storytellers || storytellers.length === 0) {
        console.log(`   ℹ️ No storytellers found`)
        continue
      }

      console.log(`   👥 Found ${storytellers.length} storytellers`)

      // Check if organization_roles already exist for these storytellers
      const { data: existingRoles } = await supabase
        .from('organization_roles')
        .select('profile_id')
        .eq('organization_id', org.id)

      const existingProfileIds = new Set((existingRoles || []).map(r => r.profile_id))

      // Create organization_roles for storytellers that don't have them
      const rolesToCreate = storytellers
        .filter(s => !existingProfileIds.has(s.id))
        .map(storyteller => ({
          organization_id: org.id,
          profile_id: storyteller.id,
          role: 'member',
          tenant_id: org.tenant_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

      if (rolesToCreate.length === 0) {
        console.log(`   ✅ All storytellers already linked`)
        continue
      }

      const { error: roleError } = await supabase
        .from('organization_roles')
        .insert(rolesToCreate)

      if (roleError) {
        console.error(`❌ Error creating organization roles for ${org.name}:`, roleError)
        continue
      }

      console.log(`   ✅ Linked ${rolesToCreate.length} storytellers to ${org.name}`)
      totalLinked += rolesToCreate.length
    }

    console.log(`\n🎉 Successfully linked ${totalLinked} storytellers to their organizations!`)

    // Now let's update any stories that should be linked to organizations
    console.log('\n📚 Checking story linkages...')

    // Get stories that have a tenant_id but might need project linkage
    const { data: stories, error: storyError } = await supabase
      .from('stories')
      .select('id, title, tenant_id, project_id')
      .not('tenant_id', 'is', null)

    if (storyError) {
      console.error('❌ Error fetching stories:', storyError)
      return
    }

    if (stories && stories.length > 0) {
      console.log(`📖 Found ${stories.length} stories with tenant linkages`)

      // Group stories by tenant_id
      const storiesByTenant = stories.reduce((acc, story) => {
        if (!acc[story.tenant_id]) acc[story.tenant_id] = []
        acc[story.tenant_id].push(story)
        return acc
      }, {})

      for (const [tenantId, tenantStories] of Object.entries(storiesByTenant)) {
        console.log(`   📋 Tenant ${tenantId}: ${tenantStories.length} stories`)
      }
    }

    console.log('\n✅ Organization linkage fix complete!')

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

// Run the fix
fixOrganizationLinkages()