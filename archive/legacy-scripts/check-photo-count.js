#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPhotoStructure() {
  console.log('🔍 Checking photo structure for Deadly Hearts Trek 2025 gallery...\n')

  // Get the gallery
  const { data: gallery } = await supabase
    .from('photo_galleries')
    .select('*')
    .ilike('title', '%deadly hearts trek%')
    .single()

  if (!gallery) {
    console.log('❌ Gallery not found')
    return
  }

  console.log('📁 Gallery:', gallery.title, '(ID:', gallery.id + ')')
  
  // Check photo_gallery_items
  const { data: galleryItems, error: itemsError } = await supabase
    .from('photo_gallery_items')
    .select('*')
    .eq('gallery_id', gallery.id)

  console.log('\n📸 photo_gallery_items table:')
  console.log('Count:', galleryItems?.length || 0)
  if (itemsError) console.log('Error:', itemsError.message)
  
  if (galleryItems && galleryItems.length > 0) {
    console.log('Sample item:', galleryItems[0])
  }

  // Check if there are other photo-related tables
  const tables = ['photos', 'media_assets', 'media_items', 'gallery_photos']
  
  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('count(*)')
        .limit(1)
      
      if (!error) {
        console.log(`\n📊 Found table: ${tableName}`)
        
        // Check if it has gallery_id
        const { data: sample } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
          
        if (sample && sample.length > 0) {
          console.log('Sample columns:', Object.keys(sample[0]))
          
          // Check if linked to our gallery
          if (sample[0].gallery_id) {
            const { data: linked, count } = await supabase
              .from(tableName)
              .select('*', { count: 'exact' })
              .eq('gallery_id', gallery.id)
              
            console.log(`Items linked to gallery: ${count || 0}`)
          }
        }
      }
    } catch (e) {
      // Table doesn't exist, skip
    }
  }
}

checkPhotoStructure().catch(console.error)