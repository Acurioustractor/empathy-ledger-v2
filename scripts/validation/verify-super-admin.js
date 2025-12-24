#!/usr/bin/env node

/**
 * Verify Super Admin Access
 *
 * Checks if your account has super admin permissions and can access
 * the registry sharing feature.
 *
 * Usage:
 *   node scripts/validation/verify-super-admin.js your-email@example.com
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

// Super admin emails from admin-config.ts
const SUPER_ADMIN_EMAILS = [
  'benjamin@act.place',
  'knighttss@gmail.com'
]

async function verifyAccess(email) {
  console.log(`\n🔍 Checking super admin access for: ${email}\n`)

  // Check 1: Is email in super admin list?
  const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(email.toLowerCase())
  console.log(`Super Admin Email: ${isSuperAdminEmail ? '✅ YES' : '❌ NO'}`)

  if (!isSuperAdminEmail) {
    console.log(`\n⚠️  Email not in super admin list. Add to:`)
    console.log(`   src/lib/config/admin-config.ts (line 62-65)`)
    console.log(`\nOr set in environment:`)
    console.log(`   SUPER_ADMIN_EMAILS="${email}"`)
    return false
  }

  // Check 2: Does profile exist?
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, tenant_roles, is_storyteller')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    console.error(`Profile Lookup: ❌ ERROR - ${error.message}`)
    return false
  }

  if (!profile) {
    console.log(`Profile Exists: ❌ NO`)
    console.log(`\n💡 Create profile by logging in at:`)
    console.log(`   https://empathy-ledger-v2.vercel.app/login`)
    console.log(`\nOr run:`)
    console.log(`   node scripts/data-management/create-super-admin-profile.js ${email}`)
    return false
  }

  console.log(`Profile Exists: ✅ YES`)
  console.log(`   ID: ${profile.id}`)
  console.log(`   Display Name: ${profile.display_name || 'Not set'}`)
  console.log(`   Tenant Roles: ${profile.tenant_roles?.join(', ') || 'None'}`)
  console.log(`   Is Storyteller: ${profile.is_storyteller ? 'Yes' : 'No'}`)

  // Check 3: Can access admin stories page?
  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select('id, title')
    .limit(1)

  if (storiesError) {
    console.log(`\nAccess Stories: ❌ ERROR - ${storiesError.message}`)
    return false
  }

  console.log(`\nAccess Stories: ✅ YES (${stories?.length || 0} found)`)

  // Check 4: Can access external applications?
  const { data: apps, error: appsError } = await supabase
    .from('external_applications')
    .select('id, app_name, app_display_name')
    .eq('is_active', true)

  if (appsError) {
    console.log(`Access Registries: ❌ ERROR - ${appsError.message}`)
    return false
  }

  console.log(`Access Registries: ✅ YES (${apps?.length || 0} active)`)
  if (apps && apps.length > 0) {
    apps.forEach(app => {
      console.log(`   - ${app.app_display_name} (${app.app_name})`)
    })
  }

  console.log(`\n✅ Super admin access verified!`)
  console.log(`\nNext steps:`)
  console.log(`1. Go to: https://empathy-ledger-v2.vercel.app/admin/stories`)
  console.log(`2. Log in as: ${email}`)
  console.log(`3. Click "View" on any story`)
  console.log(`4. Look for "Registry Sharing" card in the right column`)
  console.log(`5. Toggle "Share to ACT Farm" on\n`)

  return true
}

// Get email from command line or use default
const email = process.argv[2] || process.env.NEXT_PUBLIC_DEV_SUPER_ADMIN_EMAIL || 'benjamin@act.place'

verifyAccess(email)
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error.message)
    process.exit(1)
  })
