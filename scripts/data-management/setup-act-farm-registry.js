#!/usr/bin/env node

/**
 * Setup ACT Farm Registry Integration
 *
 * This script creates the ACT Farm external application entry in the database
 * and generates an API key for the registry integration.
 *
 * Usage:
 *   node scripts/data-management/setup-act-farm-registry.js
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

/**
 * Generate a secure API key
 */
function generateApiKey() {
  return `el_${crypto.randomBytes(32).toString('hex')}`
}

/**
 * Main setup function
 */
async function setupActFarm() {
  console.log('🚀 Setting up ACT Farm Registry Integration\n')

  try {
    // Check if ACT Farm already exists
    const { data: existing, error: checkError } = await supabase
      .from('external_applications')
      .select('*')
      .eq('app_name', 'act_farm')
      .maybeSingle()

    if (checkError) {
      throw new Error(`Failed to check existing app: ${checkError.message}`)
    }

    if (existing) {
      console.log('✅ ACT Farm application already exists!')
      console.log('\n📋 Details:')
      console.log(`   App ID: ${existing.id}`)
      console.log(`   Display Name: ${existing.app_display_name}`)
      console.log(`   Active: ${existing.is_active}`)
      console.log(`   API Key: ${existing.api_key_hash}`)
      console.log('\n💡 To regenerate the API key, delete the record and run this script again.')
      return existing.api_key_hash
    }

    // Generate new API key
    const apiKey = generateApiKey()
    console.log('🔑 Generated new API key\n')

    // Insert ACT Farm application
    const { data: app, error: insertError } = await supabase
      .from('external_applications')
      .insert({
        app_name: 'act_farm',
        app_display_name: 'ACT Farm',
        app_description: 'ACT Farm and Regenerative Innovation Studio - Community stories and regenerative practices',
        api_key_hash: apiKey,
        allowed_story_types: ['community', 'practice', 'knowledge', 'culture', 'testimony', 'case_study'],
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to create app: ${insertError.message}`)
    }

    console.log('✅ ACT Farm application created successfully!\n')
    console.log('📋 Details:')
    console.log(`   App ID: ${app.id}`)
    console.log(`   Display Name: ${app.app_display_name}`)
    console.log(`   Allowed Story Types: ${app.allowed_story_types.join(', ')}`)
    console.log(`\n🔑 API Key (save this - it won't be shown again):`)
    console.log(`   ${apiKey}`)
    console.log('\n📝 Add this to your .env.local:')
    console.log(`   ACT_FARM_REGISTRY_TOKEN=${apiKey}`)
    console.log('\n🔗 Test the registry endpoint:')
    console.log(`   curl -H "Authorization: Bearer ${apiKey}" \\`)
    console.log(`     ${supabaseUrl.replace('https://', 'https://empathy-ledger-v2.vercel.app')}/api/registry?limit=5`)

    return apiKey
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

/**
 * Verify the setup by testing the registry endpoint
 */
async function verifySetup(apiKey) {
  console.log('\n🧪 Verifying setup...\n')

  try {
    // Query syndicated stories view directly
    const { data: stories, error } = await supabase
      .from('syndicated_stories')
      .select('story_id, title, requesting_app, share_media')
      .eq('requesting_app', 'act_farm')
      .limit(5)

    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️  syndicated_stories view not found')
        console.log('   Run the migration: supabase/migrations/20251209010000_external_api_syndication.sql')
        return
      }
      throw error
    }

    if (!stories || stories.length === 0) {
      console.log('ℹ️  No stories shared to ACT Farm yet')
      console.log('   Share stories from the admin panel: /admin/stories')
    } else {
      console.log(`✅ Found ${stories.length} stories shared to ACT Farm`)
      stories.forEach((story, i) => {
        console.log(`   ${i + 1}. ${story.title}`)
      })
    }
  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  }
}

// Run the setup
setupActFarm()
  .then(apiKey => verifySetup(apiKey))
  .then(() => {
    console.log('\n✨ Setup complete!\n')
    console.log('Next steps:')
    console.log('1. Share stories from /admin/stories')
    console.log('2. Test the registry API with the token above')
    console.log('3. Configure ACT Farm to fetch from your registry\n')
    process.exit(0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
