#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkTenantMapping() {
  // Check the tenant
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', '8891e1a9-92ae-423f-928b-cec602660011')
    .single()

  console.log('Tenant:', tenant)

  // If tenant has organization_id, use it
  if (tenant?.organization_id) {
    console.log(`\nTenant maps to organization: ${tenant.organization_id}`)

    // Verify organization exists
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', tenant.organization_id)
      .single()

    console.log('Organization:', org)

    if (org) {
      // Fix the stories
      const { data: updated, error } = await supabase
        .from('stories')
        .update({ organization_id: org.id })
        .is('organization_id', null)
        .eq('tenant_id', '8891e1a9-92ae-423f-928b-cec602660011')
        .select('id, title')

      if (error) {
        console.error('Error:', error)
      } else {
        console.log(`\n✅ Fixed ${updated?.length} stories`)
      }
    }
  } else {
    console.log('\n⚠️  Tenant has no organization_id - need to create organization or assign to Independent Storytellers')
  }
}

checkTenantMapping()
