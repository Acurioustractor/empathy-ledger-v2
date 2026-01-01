/**
 * Check if super admin account exists and is configured correctly
 */

import { createAdminClient } from '@/lib/supabase/server'

async function main() {
  console.log('🔍 Checking Super Admin Account Configuration\n')

  const supabase = createAdminClient()

  try {
    // Check if benjamin@act.place profile exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, tenant_roles, tenant_id, created_at')
      .eq('email', 'benjamin@act.place')
      .single()

    if (error) {
      console.log('❌ Error fetching profile:', error.message)

      // Try to find any admin accounts
      console.log('\n🔍 Searching for other admin accounts...\n')
      const { data: admins } = await supabase
        .from('profiles')
        .select('id, email, display_name, tenant_roles')
        .contains('tenant_roles', ['admin'])
        .limit(5)

      if (admins && admins.length > 0) {
        console.log(`Found ${admins.length} admin account(s):`)
        admins.forEach((admin, i) => {
          console.log(`  ${i + 1}. ${admin.email}`)
          console.log(`     Roles: ${admin.tenant_roles?.join(', ') || 'none'}`)
        })
      } else {
        console.log('❌ No admin accounts found')
      }
      return
    }

    console.log('✅ Super Admin Account Found!\n')
    console.log('Account Details:')
    console.log(`  Email: ${profile.email}`)
    console.log(`  Display Name: ${profile.display_name || '(not set)'}`)
    console.log(`  ID: ${profile.id}`)
    console.log(`  Tenant Roles: ${profile.tenant_roles?.join(', ') || 'none'}`)
    console.log(`  Tenant ID: ${profile.tenant_id || 'null'}`)
    console.log(`  Created: ${profile.created_at}`)
    console.log()

    // Check if has admin role
    const hasAdminRole = profile.tenant_roles?.includes('admin')
    console.log(`Admin Role: ${hasAdminRole ? '✅ Yes' : '❌ No'}`)

    // Check super admin status (hardcoded in middleware)
    const isSuperAdmin = profile.email === 'benjamin@act.place'
    console.log(`Super Admin: ${isSuperAdmin ? '✅ Yes (hardcoded)' : '❌ No'}`)
    console.log()

    if (!hasAdminRole) {
      console.log('⚠️  WARNING: Account does not have admin role!')
      console.log('   Add "admin" to tenant_roles array')
    }

    // Check auth.users table
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id)

    if (authError) {
      console.log('❌ Could not fetch auth user:', authError.message)
    } else if (authUser) {
      console.log('Auth Account Details:')
      console.log(`  Email: ${authUser.user.email}`)
      console.log(`  Email Confirmed: ${authUser.user.email_confirmed_at ? '✅ Yes' : '❌ No'}`)
      console.log(`  Last Sign In: ${authUser.user.last_sign_in_at || 'Never'}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main().catch(console.error)
