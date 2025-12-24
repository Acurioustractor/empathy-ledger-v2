#!/usr/bin/env node

/**
 * Reset Password for Super Admin
 *
 * This script sends a password reset email via Supabase Auth.
 * Alternatively, you can set a password directly for development.
 *
 * Usage:
 *   node scripts/validation/reset-password.js benjamin@act.place
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
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

async function resetPassword(email) {
  console.log(`\n🔑 Password Reset for: ${email}\n`)

  // Option 1: Send password reset email
  console.log('Option 1: Sending password reset email...')
  const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
    }
  })

  if (resetError) {
    console.error(`❌ Reset email failed: ${resetError.message}`)
  } else {
    console.log('✅ Password reset link generated!')
    console.log('\n📧 Magic Link (use this to reset):')
    console.log(`   ${resetData.properties?.action_link}\n`)
    console.log('Copy this URL and paste it in your browser to set a new password.\n')
  }

  // Option 2: Set password directly (development only)
  const newPassword = process.argv[3]

  if (newPassword) {
    console.log('\nOption 2: Setting password directly...')

    // Get user ID
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
      console.error(`❌ Failed to list users: ${userError.message}`)
      return
    }

    const user = userData.users.find(u => u.email === email)

    if (!user) {
      console.error(`❌ User not found: ${email}`)
      return
    }

    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error(`❌ Password update failed: ${updateError.message}`)
    } else {
      console.log(`✅ Password updated successfully!`)
      console.log(`\nYou can now log in at:`)
      console.log(`   https://empathy-ledger-v2.vercel.app/login`)
      console.log(`   Email: ${email}`)
      console.log(`   Password: ${newPassword}\n`)
    }
  } else {
    console.log('\n💡 To set a password directly (dev only), run:')
    console.log(`   node scripts/validation/reset-password.js ${email} YOUR_NEW_PASSWORD\n`)
  }
}

// Get email from command line
const email = process.argv[2] || process.env.NEXT_PUBLIC_DEV_SUPER_ADMIN_EMAIL || 'benjamin@act.place'

resetPassword(email)
  .then(() => {
    console.log('✨ Done!\n')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error.message)
    process.exit(1)
  })
