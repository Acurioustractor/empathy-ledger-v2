#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function findRealPhotos() {
  console.log('🔍 Finding where the 126 photos are stored...\n')

  // Get gallery ID
  const { data: gallery } = await supabase
    .from('photo_galleries')
    .select('id, title')
    .ilike('title', '%deadly hearts trek%')
    .single()

  if (!gallery) {
    console.log('❌ Gallery not found')
    return
  }

  console.log(`🎯 Gallery: "${gallery.title}" (ID: ${gallery.id})\n`)

  // Check all possible photo/media tables
  const possibleTables = [
    'photos',
    'media',
    'images',
    'gallery_media',
    'media_items',
    'cultural_media',
    'assets',
    'files'
  ]

  for (const tableName of possibleTables) {
    try {
      // First check if table exists and get total count
      const { data: allData, error: allError, count: totalCount } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      if (!allError && totalCount !== null) {
        console.log(`✅ Found table: ${tableName} (${totalCount} total records)`)

        // Get sample to see structure
        const { data: sample } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        if (sample && sample.length > 0) {
          const columns = Object.keys(sample[0])
          console.log(`   Columns: ${columns.join(', ')}`)

          // Check if it has gallery_id reference
          if (columns.includes('gallery_id')) {
            const { count: galleryCount } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true })
              .eq('gallery_id', gallery.id)

            console.log(`   🎯 Items for our gallery: ${galleryCount || 0}`)
          }

          // Check if it has project_id reference
          if (columns.includes('project_id')) {
            const { count: projectCount } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true })
              .eq('project_id', '29ebc2d2-4ea9-4870-8aff-5cc8b5be93f7')

            console.log(`   📁 Items for Deadly Hearts project: ${projectCount || 0}`)
          }

          // Check if it has title/name that might match
          if (columns.includes('title') || columns.includes('name')) {
            const titleCol = columns.includes('title') ? 'title' : 'name'
            const { data: matchingTitles, count: titleCount } = await supabase
              .from(tableName)
              .select('*', { count: 'exact' })
              .ilike(titleCol, '%snow foundation%')
              .limit(3)

            console.log(`   ❄️ Items with "Snow Foundation" in ${titleCol}: ${titleCount || 0}`)
            
            if (matchingTitles && matchingTitles.length > 0) {
              console.log(`   Sample: ${matchingTitles[0][titleCol]}`)
            }
          }
        }
        console.log('')
      }
    } catch (e) {
      // Table doesn't exist, skip silently
    }
  }

  // Check media_usage_tracking for gallery usage
  try {
    const { data: usageData, count: usageCount } = await supabase
      .from('media_usage_tracking')
      .select(`
        *,
        media_asset:media_assets(*)
      `, { count: 'exact' })
      .eq('used_in_type', 'gallery')
      .eq('used_in_id', gallery.id)

    console.log(`📊 media_usage_tracking for gallery: ${usageCount || 0} entries`)
    
    if (usageData && usageData.length > 0) {
      console.log('Sample usage entry:', usageData[0])
    }
  } catch (e) {
    console.log('No media_usage_tracking table')
  }
}

findRealPhotos().catch(console.error)