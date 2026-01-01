#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// IDs we need
const DEADLY_HEARTS_PROJECT_ID = '29ebc2d2-4ea9-4870-8aff-5cc8b5be93f7'
const SNOW_FOUNDATION_ID = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'
const A_CURIOUS_TRACTOR_ID = 'db0de7bd-eb10-446b-99e9-0f3b7c199b8a'

async function linkDeadlyHeartsData() {
  console.log('🚀 Linking Deadly Hearts Project data...')

  try {
    // 1. Link project to BOTH organizations
    console.log('🔗 Linking project to both organizations...')
    
    const { error: linkOrgsError } = await supabase
      .from('project_organizations')
      .upsert([
        {
          project_id: DEADLY_HEARTS_PROJECT_ID,
          organization_id: SNOW_FOUNDATION_ID,
          role: 'lead'
        },
        {
          project_id: DEADLY_HEARTS_PROJECT_ID,
          organization_id: A_CURIOUS_TRACTOR_ID,
          role: 'partner'
        }
      ], { onConflict: 'project_id,organization_id' })

    if (linkOrgsError) {
      console.error('❌ Error linking organizations:', linkOrgsError)
    } else {
      console.log('✅ Project linked to both Snow Foundation (lead) and A Curious Tractor (partner)')
    }

    // 2. Get all storytellers from Snow Foundation tenant
    console.log('🔍 Finding Snow Foundation storytellers...')
    const { data: storytellers, error: storytellersError } = await supabase
      .from('profiles')
      .select('id, display_name, full_name, tenant_id')
      .eq('tenant_id', '96197009-c7bb-4408-89de-cd04085cdf44') // Snow Foundation tenant

    if (storytellersError) {
      console.error('❌ Error getting storytellers:', storytellersError)
      return
    }

    console.log(`📊 Found ${storytellers.length} storytellers to link`)

    // 3. Link all storytellers to the project
    if (storytellers.length > 0) {
      const storytellerLinks = storytellers.map(storyteller => ({
        project_id: DEADLY_HEARTS_PROJECT_ID,
        storyteller_id: storyteller.id,
        role: 'participant',
        status: 'active'
      }))

      const { error: linkStorytellersError } = await supabase
        .from('project_storytellers')
        .upsert(storytellerLinks, { onConflict: 'project_id,storyteller_id' })

      if (linkStorytellersError) {
        console.error('❌ Error linking storytellers:', linkStorytellersError)
      } else {
        console.log(`✅ Linked ${storytellers.length} storytellers to Deadly Hearts Project`)
        // Show first few names
        const names = storytellers.slice(0, 5).map(s => s.display_name || s.full_name || 'Unknown').join(', ')
        console.log(`   First few: ${names}...`)
      }
    }

    // 4. Link Deadly Hearts gallery to the project
    console.log('🖼️ Linking gallery to project...')
    
    // First, find the gallery
    const { data: galleries, error: gallerySearchError } = await supabase
      .from('photo_galleries')
      .select('id, title, organization_id')
      .eq('organization_id', SNOW_FOUNDATION_ID)
      .ilike('title', '%deadly%hearts%')

    if (gallerySearchError) {
      console.error('❌ Error searching for gallery:', gallerySearchError)
    } else if (galleries.length === 0) {
      console.log('⚠️ No Deadly Hearts gallery found')
    } else {
      console.log(`📸 Found ${galleries.length} gallery(ies):`)
      galleries.forEach(g => console.log(`   • ${g.title} (ID: ${g.id})`))

      // Link the first gallery to the project
      const { error: linkGalleryError } = await supabase
        .from('photo_galleries')
        .update({ project_id: DEADLY_HEARTS_PROJECT_ID })
        .eq('id', galleries[0].id)

      if (linkGalleryError) {
        console.error('❌ Error linking gallery:', linkGalleryError)
      } else {
        console.log(`✅ Gallery "${galleries[0].title}" linked to Deadly Hearts Project`)
      }
    }

    // 5. Verify all connections
    console.log('\n🔍 Verifying all connections...')

    // Check project-organization links
    const { data: projectOrgs } = await supabase
      .from('project_organizations')
      .select(`
        role,
        organizations(name)
      `)
      .eq('project_id', DEADLY_HEARTS_PROJECT_ID)

    console.log('📊 Project-Organization Links:')
    projectOrgs?.forEach(link => {
      console.log(`   • ${link.organizations?.name} (${link.role})`)
    })

    // Check project-storyteller links
    const { data: projectStorytellers } = await supabase
      .from('project_storytellers')
      .select('storyteller_id')
      .eq('project_id', DEADLY_HEARTS_PROJECT_ID)

    console.log(`📊 Project-Storyteller Links: ${projectStorytellers?.length || 0} storytellers`)

    // Check gallery-project links
    const { data: projectGalleries } = await supabase
      .from('photo_galleries')
      .select('id, title')
      .eq('project_id', DEADLY_HEARTS_PROJECT_ID)

    console.log(`📊 Gallery-Project Links: ${projectGalleries?.length || 0} galleries`)
    projectGalleries?.forEach(g => {
      console.log(`   • ${g.title}`)
    })

    console.log('\n🎉 Deadly Hearts Project linkage completed!')
    console.log('✨ Project is now shared between Snow Foundation and A Curious Tractor')
    console.log('✨ All storytellers are linked to the project')
    console.log('✨ Gallery is linked to the project')

  } catch (error) {
    console.error('💥 Script failed:', error)
    process.exit(1)
  }
}

linkDeadlyHeartsData().catch(console.error)