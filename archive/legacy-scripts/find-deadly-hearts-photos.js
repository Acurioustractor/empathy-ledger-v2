#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function findDeadlyHeartsPhotos() {
  console.log('🔍 Looking for Deadly Hearts photos...\n')

  // Check media_assets table for photos
  const { data: mediaAssets, error: mediaError } = await supabase
    .from('media_assets')
    .select('*')
    .or('filename.ilike.%deadly%,filename.ilike.%heart%,filename.ilike.%trek%')
    .limit(10)

  console.log('📁 media_assets table:')
  console.log('Count:', mediaAssets?.length || 0)
  if (mediaError) console.log('Error:', mediaError.message)
  
  if (mediaAssets && mediaAssets.length > 0) {
    console.log('\nSample media assets:')
    mediaAssets.forEach((asset, i) => {
      console.log(`${i+1}. ${asset.filename} (${asset.file_type}) - Size: ${asset.file_size}`)
    })
  }

  // Look for any photos that might be related to Snow Foundation
  const { data: snowPhotos, error: snowError } = await supabase
    .from('media_assets')
    .select('*')
    .eq('tenant_id', '4a1c31e8-89b7-476d-a74b-0c8b37efc850') // Snow Foundation tenant
    .limit(5)

  console.log('\n❄️ Snow Foundation media assets:')
  console.log('Count:', snowPhotos?.length || 0)
  if (snowError) console.log('Error:', snowError.message)
  
  if (snowPhotos && snowPhotos.length > 0) {
    console.log('\nSample Snow Foundation assets:')
    snowPhotos.forEach((asset, i) => {
      console.log(`${i+1}. ${asset.filename} (ID: ${asset.id})`)
    })
  }

  // Check if there's a media_usage_tracking table
  const { data: usageTracking, error: usageError } = await supabase
    .from('media_usage_tracking')
    .select('*')
    .eq('used_in_type', 'gallery')
    .limit(5)

  console.log('\n📊 media_usage_tracking for galleries:')
  console.log('Count:', usageTracking?.length || 0)
  if (usageError) console.log('Error:', usageError.message)
  
  if (usageTracking && usageTracking.length > 0) {
    console.log('\nSample usage tracking:')
    usageTracking.forEach((track, i) => {
      console.log(`${i+1}. Media ${track.media_asset_id} used in ${track.used_in_type} (${track.used_in_id})`)
    })
  }

  // Get gallery ID for reference
  const { data: gallery } = await supabase
    .from('photo_galleries')
    .select('id, title')
    .ilike('title', '%deadly hearts trek%')
    .single()

  if (gallery) {
    console.log(`\n🎯 Target Gallery: "${gallery.title}" (ID: ${gallery.id})`)
    
    // Check if there are any photos linked via media_usage_tracking
    const { data: linkedPhotos, error: linkedError } = await supabase
      .from('media_usage_tracking')
      .select(`
        *,
        media_asset:media_assets(filename, file_type, file_size)
      `)
      .eq('used_in_type', 'gallery')
      .eq('used_in_id', gallery.id)

    console.log('\n📸 Photos linked via media_usage_tracking:')
    console.log('Count:', linkedPhotos?.length || 0)
    if (linkedError) console.log('Error:', linkedError.message)
    
    if (linkedPhotos && linkedPhotos.length > 0) {
      console.log('\nLinked photos:')
      linkedPhotos.forEach((link, i) => {
        console.log(`${i+1}. ${link.media_asset?.filename} - Role: ${link.usage_role}`)
      })
    }
  }
}

findDeadlyHeartsPhotos().catch(console.error)