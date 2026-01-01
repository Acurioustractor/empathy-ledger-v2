#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugGalleryCount() {
  const galleryId = '35814c50-3379-413d-b2c9-7150a8ab7a8d'
  
  console.log('🔍 Debug: Finding photos for gallery:', galleryId, '\n')

  // 1. Check media_usage_tracking
  const { data: usageData, count: usageCount, error: usageError } = await supabase
    .from('media_usage_tracking')
    .select('*', { count: 'exact' })
    .eq('used_in_type', 'gallery')
    .eq('used_in_id', galleryId)

  console.log('📊 media_usage_tracking:')
  console.log('Count:', usageCount || 0)
  console.log('Error:', usageError?.message || 'none')
  if (usageData && usageData.length > 0) {
    console.log('Sample data:', usageData[0])
  }

  // 2. Check photo_gallery_items (old way)
  const { data: itemsData, count: itemsCount } = await supabase
    .from('photo_gallery_items')
    .select('*', { count: 'exact' })
    .eq('gallery_id', galleryId)

  console.log('\n📸 photo_gallery_items:')
  console.log('Count:', itemsCount || 0)
  if (itemsData && itemsData.length > 0) {
    console.log('Sample data:', itemsData[0])
  }

  // 3. Check if there's a different table name being used
  console.log('\n🔍 Checking for alternate table names...')
  
  // Check galleries table itself for any counts
  const { data: galleryData } = await supabase
    .from('photo_galleries')
    .select('*')
    .eq('id', galleryId)
    .single()

  console.log('\n📁 Gallery data:', galleryData)

  // Check if there are any references in other tables
  const alternateChecks = [
    'galleries', 
    'gallery_items',
    'media_items',
    'cultural_media',
    'assets'
  ]

  for (const tableName of alternateChecks) {
    try {
      const { count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .eq('gallery_id', galleryId)

      if (count && count > 0) {
        console.log(`✅ Found ${count} items in ${tableName} table`)
        
        const { data: sample } = await supabase
          .from(tableName)
          .select('*')
          .eq('gallery_id', galleryId)
          .limit(1)
          
        if (sample && sample.length > 0) {
          console.log('Sample:', sample[0])
        }
      }
    } catch (e) {
      // Table doesn't exist
    }
  }

  // Final check: see what gallery the interface is actually looking at
  console.log('\n🎯 Let me check the galleries with photos...')
  
  const { data: allGalleries } = await supabase
    .from('photo_galleries')
    .select('id, title')
    .limit(10)

  if (allGalleries) {
    console.log('\nAll galleries:')
    for (const gallery of allGalleries) {
      const { count: mediaCount } = await supabase
        .from('media_usage_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('used_in_type', 'gallery')
        .eq('used_in_id', gallery.id)

      console.log(`- ${gallery.title} (${gallery.id}): ${mediaCount || 0} photos`)
    }
  }
}

debugGalleryCount().catch(console.error)