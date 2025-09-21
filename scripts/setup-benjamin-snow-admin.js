#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupBenjaminSnowAdmin() {
  try {
    console.log('🔧 Setting up Benjamin Knight as Snow Foundation admin...')
    
    const snowFoundationTenantId = '96197009-c7bb-4408-89de-cd04085cdf44'
    const benjaminProfileId = 'd0a162d2-282e-4653-9d12-aa934c9dfa4e'
    
    // Update Benjamin's profile to be associated with Snow Foundation tenant
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        tenant_id: snowFoundationTenantId,
        tenant_roles: ['admin', 'storyteller'],
        current_organization: 'Snow Foundation',
        updated_at: new Date().toISOString()
      })
      .eq('id', benjaminProfileId)
      .select()
    
    if (updateError) {
      console.error('❌ Error updating Benjamin\'s profile:', updateError)
      return
    }
    
    console.log('✅ Successfully updated Benjamin Knight\'s profile:')
    console.log('- Now belongs to Snow Foundation tenant')
    console.log('- Has admin and storyteller roles')
    console.log('- Current organization set to Snow Foundation')
    
    // Verify the update
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', benjaminProfileId)
      .single()
    
    if (!verifyError) {
      console.log('🔍 Verification - Benjamin\'s updated profile:')
      console.log(`- Tenant ID: ${verifyProfile.tenant_id}`)
      console.log(`- Roles: ${verifyProfile.tenant_roles.join(', ')}`)
      console.log(`- Organization: ${verifyProfile.current_organization}`)
    }
    
    console.log('🎉 Benjamin Knight is now a Snow Foundation admin!')
    console.log('🏢 Snow Foundation Organization ID: 4a1c31e8-89b7-476d-a74b-0c8b37efc850')
    console.log('💖 Deadly Hearts Trek Project ID: 1007ca9b-6020-4ab1-be02-42b2661b6d34')
    
  } catch (error) {
    console.error('❌ Setup error:', error)
  }
}

setupBenjaminSnowAdmin()