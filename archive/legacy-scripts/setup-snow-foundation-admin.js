#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupSnowFoundationAdmin() {
  try {
    console.log('🔍 Checking for Snow Foundation organization...')
    
    // Find Snow Foundation
    const { data: snowOrgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .ilike('name', '%snow%')
    
    if (orgError) {
      console.error('Error finding Snow Foundation:', orgError)
      return
    }
    
    console.log('Found organizations matching "snow":', snowOrgs)
    
    // Find Benjamin Knight's profile
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .or('email.eq.benknight@hey.com,display_name.ilike.%benjamin%,full_name.ilike.%benjamin%')
    
    if (profileError) {
      console.error('Error finding Benjamin Knight profile:', profileError)
      return
    }
    
    console.log('Found profiles matching Benjamin:', profiles)
    
    // Check current tenant/organization structure
    const { data: allOrgs, error: allOrgsError } = await supabase
      .from('organizations')
      .select('id, name, type, location, tenant_id')
      .limit(10)
    
    if (!allOrgsError) {
      console.log('All organizations (first 10):', allOrgs)
    }
    
    // Check projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(10)
      
    if (!projectsError) {
      console.log('Projects found:', projects)
    }
    
    // Check for deadly hearts trek project
    const { data: deadlyHearts, error: deadlyError } = await supabase
      .from('projects')
      .select('*')
      .or('name.ilike.%deadly%,name.ilike.%hearts%,name.ilike.%trek%')
      
    if (!deadlyError) {
      console.log('Deadly Hearts Trek projects:', deadlyHearts)
    }

  } catch (error) {
    console.error('Setup error:', error)
  }
}

setupSnowFoundationAdmin()