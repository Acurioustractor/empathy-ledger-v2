#!/usr/bin/env tsx

/**
 * Map Tenant to Organization
 *
 * This script links the old tenant to the new organization structure
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

console.log('🔗 Mapping Tenant to Organization\n')

async function mapTenantToOrganization() {
  // Step 1: Find the Oonchiumpa organization
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', 'oonchiumpa')
    .single()

  if (!org) {
    console.error('❌ Oonchiumpa organization not found!')
    return
  }

  console.log('✅ Found Oonchiumpa organization:', org.id)

  // Step 2: Update the tenant to link to organization
  const tenantId = '8891e1a9-92ae-423f-928b-cec602660011'

  const { error: tenantError } = await supabase
    .from('tenants')
    .update({ organization_id: org.id })
    .eq('id', tenantId)

  if (tenantError) {
    console.error('❌ Error updating tenant:', tenantError.message)
    return
  }

  console.log('✅ Updated tenant to link to organization\n')

  // Step 3: Fix all stories with this tenant_id
  const { data: updated, error: storiesError } = await supabase
    .from('stories')
    .update({ organization_id: org.id })
    .is('organization_id', null)
    .eq('tenant_id', tenantId)
    .select('id, title')

  if (storiesError) {
    console.error('❌ Error updating stories:', storiesError.message)
    return
  }

  console.log(`✅ Fixed ${updated?.length} orphaned stories`)

  if (updated) {
    console.log('\nFixed stories:')
    updated.forEach((story, i) => {
      console.log(`  ${i + 1}. ${story.title}`)
    })
  }

  // Step 4: Verify no more orphans
  const { data: remainingOrphans } = await supabase
    .from('stories')
    .select('id')
    .is('organization_id', null)

  console.log(`\n✅ Remaining orphaned stories: ${remainingOrphans?.length || 0}`)

  if (remainingOrphans && remainingOrphans.length === 0) {
    console.log('\n🎉 All stories now have organization_id!')
  }
}

mapTenantToOrganization()
