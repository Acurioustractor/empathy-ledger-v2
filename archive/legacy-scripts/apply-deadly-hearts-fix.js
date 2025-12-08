#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyFix() {
  console.log('🚀 Starting Deadly Hearts Project linkage fix...')

  try {
    // Read the SQL script
    const sqlScript = readFileSync(join(process.cwd(), 'scripts/fix-deadly-hearts-linkages.sql'), 'utf8')
    
    // Split into individual statements
    const statements = sqlScript
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📄 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
      
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error)
        console.log('Statement was:', statement)
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`)
        if (data) console.log('Data:', data)
      }
    }

    // Verify the connections
    console.log('\n🔍 Verifying connections...')

    // Check project-organization links
    const { data: projectOrgs, error: projectOrgsError } = await supabase
      .from('project_organizations')
      .select(`
        project_id,
        organization_id,
        role,
        projects(name),
        organizations(name)
      `)
      .eq('project_id', '29ebc2d2-4ea9-4870-8aff-5cc8b5be93f7')

    if (projectOrgsError) {
      console.error('❌ Error checking project-organization links:', projectOrgsError)
    } else {
      console.log('📊 Project-Organization Links:')
      projectOrgs.forEach(link => {
        console.log(`   • ${link.projects?.name} → ${link.organizations?.name} (${link.role})`)
      })
    }

    // Check project-storyteller links
    const { data: projectStorytellers, error: projectStorytellersError } = await supabase
      .from('project_storytellers')
      .select(`
        storyteller_id,
        role,
        profiles(display_name, full_name)
      `)
      .eq('project_id', '29ebc2d2-4ea9-4870-8aff-5cc8b5be93f7')

    if (projectStorytellersError) {
      console.error('❌ Error checking project-storyteller links:', projectStorytellersError)
    } else {
      console.log(`📊 Project-Storyteller Links: ${projectStorytellers.length} storytellers`)
      console.log(`   First few: ${projectStorytellers.slice(0, 3).map(s => s.profiles?.display_name || s.profiles?.full_name || 'Unknown').join(', ')}...`)
    }

    // Check gallery-project links
    const { data: galleries, error: galleriesError } = await supabase
      .from('photo_galleries')
      .select(`
        id,
        gallery_name,
        project_id,
        organization_id
      `)
      .eq('project_id', '29ebc2d2-4ea9-4870-8aff-5cc8b5be93f7')

    if (galleriesError) {
      console.error('❌ Error checking gallery-project links:', galleriesError)
    } else {
      console.log('📊 Gallery-Project Links:')
      galleries.forEach(gallery => {
        console.log(`   • ${gallery.gallery_name} → Deadly Hearts Project`)
      })
    }

    console.log('\n🎉 Deadly Hearts linkage fix completed!')

  } catch (error) {
    console.error('💥 Script failed:', error)
    process.exit(1)
  }
}

// Run the script
applyFix().catch(console.error)