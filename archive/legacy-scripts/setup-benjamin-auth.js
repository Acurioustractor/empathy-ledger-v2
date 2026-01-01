#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupBenjaminAuth() {
  try {
    console.log('🔧 Setting up Benjamin Knight authentication...')
    
    const email = 'benjamin@act.place'
    const password = 'temporary123' // We'll create a temporary password
    
    // Check if user exists in auth.users
    const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(email)
    
    if (getUserError && getUserError.message !== 'User not found') {
      console.error('Error checking user:', getUserError)
      return
    }
    
    let user
    if (!existingUser.user) {
      console.log('Creating auth user for Benjamin Knight...')
      
      // Create user in auth.users
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: 'Benjamin Knight',
          display_name: 'Ben'
        }
      })
      
      if (createError) {
        console.error('Error creating user:', createError)
        return
      }
      
      user = newUser.user
      console.log('✅ Created auth user:', user.id)
      
      // Update the profile with the auth user ID
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          id: user.id, // Link the profile to the auth user
          email: email
        })
        .eq('id', 'd0a162d2-282e-4653-9d12-aa934c9dfa4e')
      
      if (updateProfileError) {
        console.error('Error updating profile:', updateProfileError)
      } else {
        console.log('✅ Linked profile to auth user')
      }
      
    } else {
      user = existingUser.user
      console.log('✅ User already exists:', user.id)
    }
    
    console.log('🎉 Benjamin Knight auth setup complete!')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Password: ${password}`)
    console.log('🏢 Organization: Snow Foundation (admin access)')
    console.log('')
    console.log('🔗 Now sign in at: http://localhost:3001/auth/signin')
    console.log('📊 Then access dashboard: http://localhost:3001/organizations/4a1c31e8-89b7-476d-a74b-0c8b37efc850/dashboard')
    
  } catch (error) {
    console.error('❌ Setup error:', error)
  }
}

setupBenjaminAuth()