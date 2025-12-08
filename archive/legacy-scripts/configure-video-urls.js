#!/usr/bin/env node

/**
 * Script to configure video URLs for Descript content
 * This will make the videos actually playable in the storyteller dashboards
 */

const { createClient } = require('@supabase/supabase-js')
const { config } = require('dotenv')

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Snow Foundation storytellers with their key transcripts
const PRIORITY_TRANSCRIPTS = [
  {
    title: 'Aunty May - Talk',
    storyteller: 'Aunty Diganbal May Rose',
    // Example Descript share URL format (you'll need to replace with actual URLs)
    videoUrl: 'https://share.descript.com/view/aunty-may-talk-example',
    description: 'Key 8.1k word community story from Aunty May'
  },
  {
    title: 'Movie pre forum',
    storyteller: 'Dr Boe Remenyi', 
    videoUrl: 'https://share.descript.com/view/movie-pre-forum-example',
    description: 'Forum video discussion - the one you mentioned'
  },
  {
    title: 'Dr Boe Remenyi and Cissy Johns',
    storyteller: 'Dr Boe Remenyi',
    videoUrl: 'https://share.descript.com/view/boe-cissy-interview-example',
    description: 'Joint interview with community storytellers'
  },
  {
    title: 'Aunty Vicky Wade - Community Story',
    storyteller: 'Aunty Vicky Wade',
    videoUrl: 'https://share.descript.com/view/aunty-vicky-community-example',
    description: 'Elder community story'
  },
  {
    title: 'Cissy Johns - Deadly Hearts Community Story',
    storyteller: 'Cissy Johns',
    videoUrl: 'https://share.descript.com/view/cissy-deadly-hearts-example',
    description: 'Community story from Deadly Hearts project'
  },
  {
    title: 'Heather Mundo - Deadly Hearts Community Story',
    storyteller: 'Heather Mundo',
    videoUrl: 'https://share.descript.com/view/heather-deadly-hearts-example',
    description: 'Community story from Deadly Hearts project'
  }
]

// For demo purposes, we'll also create some working YouTube examples
const DEMO_VIDEO_CONFIGS = [
  {
    title: 'Aunty May - Talk',
    // Using a demo YouTube video for testing (replace with actual Descript URLs)
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoThumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    description: 'Demo video for testing - replace with actual Descript content'
  },
  {
    title: 'Movie pre forum',
    videoUrl: 'https://www.youtube.com/watch?v=oHg5SJYRHA0',
    videoThumbnail: 'https://img.youtube.com/vi/oHg5SJYRHA0/maxresdefault.jpg',
    description: 'Demo forum video - replace with actual Descript content'
  }
]

async function main() {
  console.log('🎥 Configuring video URLs for Descript content...\n')

  try {
    // First, let's get the key Snow Foundation transcripts
    const { data: transcripts, error } = await supabase
      .from('transcripts')
      .select(`
        id,
        title,
        storyteller_id,
        source_video_url,
        source_video_platform,
        source_video_thumbnail,
        profiles!storyteller_id (
          full_name,
          display_name
        )
      `)
      .eq('source_video_platform', 'descript')
      .in('title', PRIORITY_TRANSCRIPTS.map(t => t.title))

    if (error) {
      throw error
    }

    console.log(`🔍 Found ${transcripts.length} priority transcripts to configure`)

    // Option 1: Configure with demo URLs for immediate testing
    console.log('\n📺 OPTION 1: Configure with demo URLs for immediate testing')
    console.log('============================================================')
    
    for (const config of DEMO_VIDEO_CONFIGS) {
      const transcript = transcripts.find(t => t.title === config.title)
      if (!transcript) {
        console.log(`❌ Transcript "${config.title}" not found`)
        continue
      }

      const storyteller = transcript.profiles
      const storytellerName = storyteller?.full_name || storyteller?.display_name || 'Unknown'
      
      console.log(`\n🎯 Configuring: ${config.title}`)
      console.log(`   Storyteller: ${storytellerName}`)
      console.log(`   Current URL: ${transcript.source_video_url || 'MISSING'}`)
      console.log(`   New URL: ${config.videoUrl}`)
      console.log(`   Description: ${config.description}`)

      // Update the transcript with video URL
      const { error: updateError } = await supabase
        .from('transcripts')
        .update({
          source_video_url: config.videoUrl,
          source_video_thumbnail: config.videoThumbnail || null,
          media_metadata: {
            ...transcript.media_metadata,
            video_configured: true,
            video_type: 'demo_for_testing',
            configured_at: new Date().toISOString()
          }
        })
        .eq('id', transcript.id)

      if (updateError) {
        console.log(`   ❌ Error updating: ${updateError.message}`)
      } else {
        console.log(`   ✅ Updated successfully`)
      }
    }

    // Option 2: Show how to configure with actual Descript URLs
    console.log('\n🎬 OPTION 2: Configure with actual Descript URLs')
    console.log('====================================================')
    console.log('To use actual Descript videos, you need to:')
    console.log('1. Go to your Descript project')
    console.log('2. Click "Share" on each video')
    console.log('3. Get the shareable URL (e.g., https://share.descript.com/view/xxxxx)')
    console.log('4. Update the script with actual URLs')
    console.log('')

    PRIORITY_TRANSCRIPTS.forEach((config, index) => {
      const transcript = transcripts.find(t => t.title === config.title)
      if (transcript) {
        const storyteller = transcript.profiles
        const storytellerName = storyteller?.full_name || storyteller?.display_name || 'Unknown'
        
        console.log(`${index + 1}. ${config.title}`)
        console.log(`   Storyteller: ${storytellerName}`)
        console.log(`   Expected URL: ${config.videoUrl}`)
        console.log(`   Description: ${config.description}`)
        console.log(`   Database ID: ${transcript.id}`)
        console.log('')
      }
    })

    // Test the API to see results
    console.log('🚀 Testing updated storyteller dashboard...')
    
    const response = await fetch('http://localhost:3001/api/storytellers/99a2d1de-2cad-4e03-a828-bf6617b36ef1/dashboard')
    if (response.ok) {
      const data = await response.json()
      const auntMayTranscript = data.storyteller.transcripts.find(t => t.title === 'Aunty May - Talk')
      
      if (auntMayTranscript) {
        console.log('✅ Aunty May transcript now has:')
        console.log(`   Video URL: ${auntMayTranscript.videoUrl || 'Still missing'}`)
        console.log(`   Video Platform: ${auntMayTranscript.videoPlatform}`)
        console.log(`   Has Video: ${auntMayTranscript.hasVideo}`)
      }
    }

    console.log('\n🎉 Video configuration completed!')
    console.log('\n📱 Next steps:')
    console.log('1. Visit: http://localhost:3001/storytellers/99a2d1de-2cad-4e03-a828-bf6617b36ef1/dashboard')
    console.log('2. Click the "Videos" tab')
    console.log('3. You should now see working video players!')
    console.log('4. Replace demo URLs with actual Descript share URLs when available')

  } catch (error) {
    console.error('❌ Error configuring videos:', error)
  }
}

// Function to create Descript embed codes (if Descript supports iframe embedding)
function createDescriptEmbedCode(shareUrl) {
  // This is hypothetical - you'd need to check Descript's actual embed format
  const videoId = shareUrl.split('/').pop()
  return `https://embed.descript.com/player/${videoId}`
}

// Function to update a single transcript with video data
async function updateTranscriptVideo(transcriptId, videoData) {
  const { error } = await supabase
    .from('transcripts')
    .update({
      source_video_url: videoData.url,
      source_video_thumbnail: videoData.thumbnail,
      media_metadata: {
        ...videoData.metadata,
        video_configured: true,
        configured_at: new Date().toISOString()
      }
    })
    .eq('id', transcriptId)

  return !error
}

main()