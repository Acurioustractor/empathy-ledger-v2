#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixBenjaminAuthLoop() {
  try {
    console.log('🔧 Fixing Benjamin Knight auth loop issue...')
    
    const email = 'benjamin@act.place'
    
    // First, let's check what's in auth.users
    const { data: { users }, error: getUsersError } = await supabase.auth.admin.listUsers()
    
    if (getUsersError) {
      console.error('Error listing users:', getUsersError)
      return
    }
    
    const authUser = users.find(u => u.email === email)
    console.log('Auth user found:', authUser ? `${authUser.id} (${authUser.email})` : 'NOT FOUND')
    
    // Check what's in profiles table
    const { data: profiles, error: getProfilesError } = await supabase
      .from('profiles')
      .select('id, email, display_name, tenant_id')
      .or(`email.eq.${email},display_name.ilike.%benjamin%`)
    
    if (!getProfilesError) {
      console.log('Profiles found:', profiles.length)
      profiles.forEach(p => {
        console.log(`- Profile: ${p.id} | Email: ${p.email} | Name: ${p.display_name} | Tenant: ${p.tenant_id}`)
      })
    }
    
    // If auth user exists, make sure profile matches
    if (authUser) {
      const snowFoundationTenantId = '96197009-c7bb-4408-89de-cd04085cdf44'
      
      // Check if profile exists for this auth user
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      if (!existingProfile) {
        console.log('Creating profile for auth user...')
        
        // Create profile with auth user ID
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            email: email,
            display_name: 'Ben',
            full_name: 'Benjamin Knight',
            tenant_id: snowFoundationTenantId,
            tenant_roles: ['admin', 'storyteller'],
            current_organization: 'Snow Foundation'
          })
          .select()
          .single()
        
        if (createError) {
          console.error('Error creating profile:', createError)
        } else {
          console.log('✅ Created matching profile for auth user')
        }
      } else {
        console.log('✅ Profile already exists for auth user')
        
        // Update it to ensure Snow Foundation access
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            tenant_id: snowFoundationTenantId,
            tenant_roles: ['admin', 'storyteller'],
            current_organization: 'Snow Foundation',
            email: email
          })
          .eq('id', authUser.id)
        
        if (!updateError) {
          console.log('✅ Updated profile with Snow Foundation access')
        }
      }
    } else {
      console.log('❌ No auth user found - authentication may not be working')
    }
    
    console.log('🎉 Auth loop fix attempt complete!')
    console.log('Try signing in again at: http://localhost:3001/auth/signin')
    
  } catch (error) {
    console.error('❌ Fix error:', error)
  }
}

fixBenjaminAuthLoop()