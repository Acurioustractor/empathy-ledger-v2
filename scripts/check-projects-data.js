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

async function checkProjectsData() {
  console.log('🔍 Checking projects data...\n')
  
  try {
    // Check projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError)
    } else {
      console.log(`📊 Found ${projects?.length || 0} projects:`)
      if (projects?.length > 0) {
        projects.forEach(p => {
          console.log(`  - ${p.name} (ID: ${p.id}, Tenant: ${p.tenant_id}, Status: ${p.status})`)
        })
      }
    }
    
    console.log('\n')
    
    // Check organizations
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .order('name')
    
    if (orgsError) {
      console.error('❌ Error fetching organizations:', orgsError)
    } else {
      console.log(`🏢 Found ${orgs?.length || 0} organizations:`)
      if (orgs?.length > 0) {
        orgs.forEach(o => {
          console.log(`  - ${o.name} (ID: ${o.id}, Tenant: ${o.tenant_id})`)
        })
      }
    }
    
    console.log('\n')
    
    // Check user profile
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      console.log('👤 Current user:', user.email)
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        console.log('📝 Profile data:')
        console.log(`  - ID: ${profile.id}`)
        console.log(`  - Email: ${profile.email || 'Not set'}`)
        console.log(`  - Display Name: ${profile.display_name || 'Not set'}`)
        console.log(`  - Tenant ID: ${profile.tenant_id || 'Not set'}`)
        console.log(`  - Is Super Admin: ${profile.is_super_admin || false}`)
        console.log(`  - Is Admin: ${profile.is_admin || false}`)
        console.log(`  - Tenant Roles: ${JSON.stringify(profile.tenant_roles) || 'None'}`)
      }
    }
    
    // Check Benjamin's profile specifically
    console.log('\n🔍 Checking Benjamin\'s profile...')
    const { data: benjaminProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'benjamin@act.place')
      .single()
    
    if (benjaminProfile) {
      console.log('✅ Benjamin\'s profile found:')
      console.log(`  - ID: ${benjaminProfile.id}`)
      console.log(`  - Email: ${benjaminProfile.email}`)
      console.log(`  - Is Super Admin: ${benjaminProfile.is_super_admin || false}`)
      console.log(`  - Is Admin: ${benjaminProfile.is_admin || false}`)
      console.log(`  - Tenant ID: ${benjaminProfile.tenant_id || 'Not set'}`)
    } else {
      console.log('❌ Benjamin\'s profile not found')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkProjectsData()