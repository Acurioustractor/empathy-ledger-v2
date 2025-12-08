#!/usr/bin/env node

/**
 * Script to check video data in transcripts and find missing video URLs
 */

const { createClient } = require('@supabase/supabase-js')
const { config } = require('dotenv')

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  try {
    console.log('🔍 Checking video data in transcripts...')
    
    // Get all transcripts with video information
    const { data: transcripts, error } = await supabase
      .from('transcripts')
      .select(`
        id,
        title,
        storyteller_id,
        source_video_url,
        source_video_platform,
        source_video_thumbnail,
        media_metadata,
        profiles!storyteller_id (
          full_name,
          display_name
        )
      `)
      .not('source_video_platform', 'is', null)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw error
    }
    
    console.log(`📊 Found ${transcripts.length} transcripts with video platform info`)
    
    transcripts.forEach((transcript, index) => {
      const storyteller = transcript.profiles
      const storytellerName = storyteller?.full_name || storyteller?.display_name || 'Unknown'
      
      console.log(`\n${index + 1}. ${transcript.title}`)
      console.log(`   Storyteller: ${storytellerName}`)
      console.log(`   Platform: ${transcript.source_video_platform}`)
      console.log(`   Video URL: ${transcript.source_video_url || 'MISSING ❌'}`)
      console.log(`   Thumbnail: ${transcript.source_video_thumbnail || 'None'}`)
      
      if (transcript.media_metadata) {
        console.log(`   Metadata: ${JSON.stringify(transcript.media_metadata, null, 2)}`)
      }
    })
    
    // Show summary
    const withUrls = transcripts.filter(t => t.source_video_url).length
    const descriptVideos = transcripts.filter(t => t.source_video_platform === 'descript').length
    
    console.log('\n📊 SUMMARY:')
    console.log(`   Total video transcripts: ${transcripts.length}`)
    console.log(`   With video URLs: ${withUrls}`)
    console.log(`   Descript videos: ${descriptVideos}`)
    console.log(`   Missing video data: ${transcripts.length - withUrls}`)
    
    // Show specific recommendations
    console.log('\n💡 RECOMMENDATIONS:')
    if (descriptVideos > 0 && withUrls === 0) {
      console.log('   - Descript videos found but URLs missing')
      console.log('   - Need to configure Descript video URLs or embed codes')
      console.log('   - Check if Descript provides shareable URLs or embed codes')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()