#!/usr/bin/env node

/**
 * Script to connect the 5 community storytellers to Snow Foundation
 * This will make them show up in the organization storytellers page
 */

const { createClient } = require('@supabase/supabase-js')
const { config } = require('dotenv')

// Load environment variables
config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Snow Foundation ID
const SNOW_FOUNDATION_ID = '4a1c31e8-89b7-476d-a74b-0c8b37efc850'

// Community storytellers to connect (based on the names you mentioned)
const STORYTELLERS = [
  { name: 'Cissy Johns', pattern: 'Cissy' },
  { name: 'Dr Boe Remenyi', pattern: 'Boe' },
  { name: 'Aunty Diganbal May Rose', pattern: 'Diganbal' },
  { name: 'Heather Mundo', pattern: 'Heather' },
  { name: 'Aunty Vicky Wade', pattern: 'Vicky' }
]

async function main() {
  try {
    console.log('🔍 Finding community storytellers...')
    
    // Get all profiles that match our storyteller names
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, display_name, is_storyteller')
    
    if (profilesError) {
      throw profilesError
    }
    
    console.log(`📊 Found ${profiles.length} total profiles`)
    
    // Find matching storytellers
    const matchedStorytellers = []
    
    for (const storyteller of STORYTELLERS) {
      const profile = profiles.find(p => 
        (p.full_name && p.full_name.includes(storyteller.pattern)) ||
        (p.display_name && p.display_name.includes(storyteller.pattern))
      )
      
      if (profile) {
        matchedStorytellers.push({
          ...profile,
          role: storyteller.name.includes('Aunty') ? 'elder' : 'member'
        })
        console.log(`✅ Found: ${profile.full_name || profile.display_name} (${profile.id})`)
      } else {
        console.log(`❌ Not found: ${storyteller.name}`)
      }
    }
    
    if (matchedStorytellers.length === 0) {
      console.log('❌ No matching storytellers found')
      return
    }
    
    console.log(`\n🎯 Connecting ${matchedStorytellers.length} storytellers to Snow Foundation...`)
    
    // Check if organization_members table exists and what's currently there
    const { data: existingMembers } = await supabase
      .from('organization_members')
      .select('user_id, profiles(full_name)')
      .eq('organization_id', SNOW_FOUNDATION_ID)
    
    console.log(`📋 Current Snow Foundation members: ${existingMembers?.length || 0}`)
    
    // Connect each storyteller to the organization
    for (const storyteller of matchedStorytellers) {
      // Check if already connected
      const alreadyMember = existingMembers?.some(m => m.user_id === storyteller.id)
      
      if (alreadyMember) {
        console.log(`⚠️  ${storyteller.full_name || storyteller.display_name} is already a member`)
        continue
      }
      
      // Add to organization_members
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: SNOW_FOUNDATION_ID,
          user_id: storyteller.id,
          role: storyteller.role,
          joined_at: new Date().toISOString()
        })
      
      if (memberError) {
        console.error(`❌ Error adding ${storyteller.full_name}: ${memberError.message}`)
      } else {
        console.log(`✅ Connected: ${storyteller.full_name || storyteller.display_name} as ${storyteller.role}`)
      }
      
      // Also ensure they have is_storyteller flag set
      if (!storyteller.is_storyteller) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_storyteller: true })
          .eq('id', storyteller.id)
        
        if (updateError) {
          console.error(`❌ Error updating storyteller flag for ${storyteller.full_name}: ${updateError.message}`)
        } else {
          console.log(`✅ Set storyteller flag for: ${storyteller.full_name || storyteller.display_name}`)
        }
      }
    }
    
    console.log('\n🚀 Checking final results...')
    
    // Test the API to see results
    const response = await fetch(`http://localhost:3001/api/organizations/${SNOW_FOUNDATION_ID}/storytellers`)
    if (response.ok) {
      const data = await response.json()
      console.log(`🎉 Success! Now showing ${data.storytellers?.length || 0} storytellers for Snow Foundation:`)
      
      data.storytellers?.forEach((storyteller, index) => {
        console.log(`   ${index + 1}. ${storyteller.fullName} - ${storyteller.stats.totalTranscripts} transcripts, ${storyteller.stats.totalStories} stories`)
      })
    } else {
      console.log('⚠️  API test failed, but database updates completed')
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  }
}

main()