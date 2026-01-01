#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setBenjaminSuperAdmin() {
  console.log('🔐 Setting Benjamin as super admin...\n')
  
  try {
    // Update Benjamin's profile to be super admin
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        is_super_admin: true,
        tenant_roles: { admin: true, super_admin: true }
      })
      .eq('email', 'benjamin@act.place')
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error updating profile:', error)
      return
    }
    
    console.log('✅ Successfully updated Benjamin\'s profile!')
    console.log('Profile details:')
    console.log(`  - ID: ${data.id}`)
    console.log(`  - Email: ${data.email}`)
    console.log(`  - Display Name: ${data.display_name || 'Not set'}`)
    console.log(`  - Is Super Admin: ${data.is_super_admin}`)
    console.log(`  - Tenant Roles: ${JSON.stringify(data.tenant_roles)}`)
    console.log('\n🎉 Benjamin now has super admin access!')
    console.log('📝 You can now see all projects across all organizations!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

setBenjaminSuperAdmin()