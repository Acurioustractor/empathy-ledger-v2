#!/usr/bin/env node
/**
 * Seed test media with tags and locations for testing the enhanced tagging system
 * Run: node scripts/seed-test-media-tags.mjs
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

// Sample tags to create
const sampleTags = [
  { name: 'Landscape', slug: 'landscape', category: 'general', description: 'Natural landscapes and scenery' },
  { name: 'Portrait', slug: 'portrait', category: 'general', description: 'People portraits' },
  { name: 'Community Event', slug: 'community-event', category: 'event', description: 'Community gatherings and events' },
  { name: 'Traditional Territory', slug: 'traditional-territory', category: 'cultural', description: 'Images from traditional territories' },
  { name: 'Ceremony', slug: 'ceremony', category: 'cultural', description: 'Ceremonial occasions', cultural_sensitivity_level: 'sacred', requires_elder_approval: true },
  { name: 'Elder Knowledge', slug: 'elder-knowledge', category: 'cultural', description: 'Elder teachings and wisdom', cultural_sensitivity_level: 'sensitive' },
  { name: 'Youth Program', slug: 'youth-program', category: 'project', description: 'Youth programs and activities' },
  { name: 'Art & Craft', slug: 'art-craft', category: 'theme', description: 'Traditional and contemporary art' },
  { name: 'Melbourne', slug: 'melbourne', category: 'location', description: 'Melbourne area' },
  { name: 'Sydney', slug: 'sydney', category: 'location', description: 'Sydney area' },
  { name: 'Bush & Outback', slug: 'bush-outback', category: 'location', description: 'Rural and outback areas' },
  { name: 'Water & Rivers', slug: 'water-rivers', category: 'theme', description: 'Water features, rivers, and oceans' },
]

// Sample locations to add
const sampleLocations = [
  { latitude: -37.8136, longitude: 144.9631, placeName: 'Melbourne', indigenousTerritory: 'Wurundjeri Country' },
  { latitude: -33.8688, longitude: 151.2093, placeName: 'Sydney', indigenousTerritory: 'Gadigal Land' },
  { latitude: -34.9285, longitude: 138.6007, placeName: 'Adelaide', indigenousTerritory: 'Kaurna Land' },
  { latitude: -35.2809, longitude: 149.1300, placeName: 'Canberra', indigenousTerritory: 'Ngunnawal Country' },
]

async function seedData() {
  console.log('🌱 Starting seed process...\n')

  // 1. Create tags
  console.log('📌 Creating sample tags...')
  const createdTags = []

  for (const tag of sampleTags) {
    // Check if tag already exists
    const { data: existing } = await supabase
      .from('tags')
      .select('id, name')
      .eq('slug', tag.slug)
      .single()

    if (existing) {
      console.log(`   ℹ️  Tag "${tag.name}" already exists`)
      createdTags.push(existing)
      continue
    }

    const { data, error } = await supabase
      .from('tags')
      .insert(tag)
      .select()
      .single()

    if (error) {
      console.log(`   ⚠️  Tag "${tag.name}": ${error.message}`)
    } else {
      console.log(`   ✅ Tag "${tag.name}" created`)
      createdTags.push(data)
    }
  }

  console.log(`\n   Created/Updated ${createdTags.length} tags\n`)

  // 2. Get existing media assets
  console.log('🖼️  Fetching existing media assets...')
  const { data: mediaAssets, error: mediaError } = await supabase
    .from('media_assets')
    .select('id, title, media_type, thumbnail_url')
    .limit(10)

  if (mediaError) {
    console.error('Error fetching media:', mediaError)
    return
  }

  console.log(`   Found ${mediaAssets?.length || 0} media assets\n`)

  if (!mediaAssets?.length) {
    console.log('   No media assets found. Creating sample media assets...')

    // Create a few sample media assets for testing
    const sampleMediaAssets = [
      {
        title: 'Mountain Landscape',
        media_type: 'image',
        storage_path: 'test/mountain-landscape.jpg',
        thumbnail_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        mime_type: 'image/jpeg',
        file_size: 2500000,
        status: 'processed'
      },
      {
        title: 'Forest Path',
        media_type: 'image',
        storage_path: 'test/forest-path.jpg',
        thumbnail_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
        mime_type: 'image/jpeg',
        file_size: 1800000,
        status: 'processed'
      },
      {
        title: 'Community Gathering',
        media_type: 'image',
        storage_path: 'test/community-gathering.jpg',
        thumbnail_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
        mime_type: 'image/jpeg',
        file_size: 2100000,
        status: 'processed'
      },
      {
        title: 'Elder Portrait',
        media_type: 'image',
        storage_path: 'test/elder-portrait.jpg',
        thumbnail_url: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=400',
        mime_type: 'image/jpeg',
        file_size: 1500000,
        status: 'processed'
      },
      {
        title: 'River at Sunset',
        media_type: 'image',
        storage_path: 'test/river-sunset.jpg',
        thumbnail_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
        mime_type: 'image/jpeg',
        file_size: 2300000,
        status: 'processed'
      }
    ]

    for (const asset of sampleMediaAssets) {
      const { data, error } = await supabase
        .from('media_assets')
        .insert(asset)
        .select()
        .single()

      if (error) {
        console.log(`   ⚠️  Failed to create "${asset.title}": ${error.message}`)
      } else {
        console.log(`   ✅ Created media asset "${asset.title}"`)
        mediaAssets.push(data)
      }
    }

    console.log(`\n   Created ${sampleMediaAssets.length} sample media assets\n`)
  }

  // 3. Assign tags to media assets
  console.log('🏷️  Assigning tags to media assets...')

  // Get all created tags for reference
  const { data: allTags } = await supabase.from('tags').select('id, name, slug')
  const tagMap = new Map(allTags?.map(t => [t.slug, t.id]) || [])

  const tagAssignments = [
    { mediaIndex: 0, tags: ['landscape', 'traditional-territory', 'bush-outback'] },
    { mediaIndex: 1, tags: ['landscape', 'traditional-territory', 'bush-outback'] },
    { mediaIndex: 2, tags: ['community-event', 'youth-program'] },
    { mediaIndex: 3, tags: ['portrait', 'elder-knowledge'] },
    { mediaIndex: 4, tags: ['landscape', 'water-rivers', 'melbourne'] },
  ]

  for (const assignment of tagAssignments) {
    const media = mediaAssets[assignment.mediaIndex]
    if (!media) continue

    for (const tagSlug of assignment.tags) {
      const tagId = tagMap.get(tagSlug)
      if (!tagId) continue

      const { error } = await supabase
        .from('media_tags')
        .upsert({
          media_asset_id: media.id,
          tag_id: tagId,
          source: 'batch'
        }, { onConflict: 'media_asset_id,tag_id' })

      if (error && !error.message.includes('duplicate')) {
        console.log(`   ⚠️  Failed to assign tag "${tagSlug}" to "${media.title}": ${error.message}`)
      } else {
        console.log(`   ✅ Assigned "${tagSlug}" to "${media.title}"`)
      }
    }
  }

  // 4. Add locations to some media
  console.log('\n📍 Adding locations to media assets...')

  const locationAssignments = [
    { mediaIndex: 0, locationIndex: 3 }, // Mountain -> Canberra
    { mediaIndex: 2, locationIndex: 0 }, // Community -> Melbourne
    { mediaIndex: 4, locationIndex: 0 }, // River -> Melbourne
  ]

  for (const assignment of locationAssignments) {
    const media = mediaAssets[assignment.mediaIndex]
    const location = sampleLocations[assignment.locationIndex]
    if (!media || !location) continue

    const { error } = await supabase
      .from('media_locations')
      .upsert({
        media_asset_id: media.id,
        latitude: location.latitude,
        longitude: location.longitude,
        mapbox_place_name: location.placeName,
        indigenous_territory: location.indigenousTerritory,
        source: 'manual'
      }, { onConflict: 'media_asset_id' })

    if (error) {
      console.log(`   ⚠️  Failed to add location to "${media.title}": ${error.message}`)
    } else {
      console.log(`   ✅ Added ${location.placeName} (${location.indigenousTerritory}) to "${media.title}"`)
    }
  }

  // 5. Update tag usage counts
  console.log('\n📊 Updating tag usage counts...')

  for (const tag of allTags || []) {
    const { count } = await supabase
      .from('media_tags')
      .select('*', { count: 'exact', head: true })
      .eq('tag_id', tag.id)

    await supabase
      .from('tags')
      .update({ usage_count: count || 0 })
      .eq('id', tag.id)
  }

  console.log('   ✅ Tag usage counts updated\n')

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Seed complete!')
  console.log(`   • ${createdTags.length} tags created/updated`)
  console.log(`   • ${mediaAssets.length} media assets processed`)
  console.log(`   • Tags and locations assigned`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('📝 Next steps:')
  console.log('   1. Visit /test/sprint-2 and go to Media Gallery tab')
  console.log('   2. Click on any media item to open the tagger')
  console.log('   3. Select multiple items and use the batch tagging bar')
  console.log('   4. Test the location picker with Leaflet maps')
}

seedData().catch(console.error)
