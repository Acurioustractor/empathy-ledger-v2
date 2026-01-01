#!/usr/bin/env node

/**
 * Script to manage video URLs for storytellers and stories
 * This script allows you to:
 * 1. Add video URLs to transcripts (for storyteller videos)
 * 2. Add video embed codes to stories
 * 3. List current videos
 * 4. Test video configurations
 */

const { createClient } = require('@supabase/supabase-js')
const { config } = require('dotenv')

// Load environment variables
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Helper function to get YouTube video ID
function getYouTubeVideoId(url) {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  return match ? match[1] : null
}

// Helper function to get Vimeo video ID
function getVimeoVideoId(url) {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

// Helper function to generate thumbnail URL
function generateThumbnail(videoUrl) {
  const youtubeId = getYouTubeVideoId(videoUrl)
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
  }
  
  const vimeoId = getVimeoVideoId(videoUrl)
  if (vimeoId) {
    // Note: Vimeo thumbnails require API call, using placeholder for now
    return `https://vumbnail.com/${vimeoId}.jpg`
  }
  
  return null
}

// Helper function to detect video platform
function detectPlatform(videoUrl) {
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    return 'youtube'
  }
  if (videoUrl.includes('vimeo.com')) {
    return 'vimeo'
  }
  if (videoUrl.includes('descript.com')) {
    return 'descript'
  }
  return 'other'
}

async function listProfiles() {
  console.log('🔍 Finding storytellers with transcripts or stories...\n')
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      display_name,
      transcripts!storyteller_id (
        id,
        title,
        source_video_url,
        source_video_platform
      ),
      stories_as_storyteller:stories!storyteller_id (
        id,
        title,
        video_embed_code
      ),
      stories_as_author:stories!author_id (
        id,
        title,
        video_embed_code
      )
    `)
    .limit(20)

  if (error) throw error

  profiles.forEach((profile, index) => {
    const allStories = [...(profile.stories_as_storyteller || []), ...(profile.stories_as_author || [])]
    if (profile.transcripts.length > 0 || allStories.length > 0) {
      console.log(`${index + 1}. ${profile.full_name || profile.display_name}`)
      console.log(`   ID: ${profile.id}`)
      console.log(`   Transcripts: ${profile.transcripts.length} (${profile.transcripts.filter(t => t.source_video_url).length} with video)`)
      console.log(`   Stories: ${allStories.length} (${allStories.filter(s => s.video_embed_code).length} with video)`)
      console.log('')
    }
  })
}

async function addTranscriptVideo(storytellerId, transcriptTitle, videoUrl) {
  console.log(`🎬 Adding video to transcript...`)
  console.log(`   Storyteller ID: ${storytellerId}`)
  console.log(`   Transcript: ${transcriptTitle}`)
  console.log(`   Video URL: ${videoUrl}\n`)

  // Find the transcript
  const { data: transcripts, error: findError } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id')
    .eq('storyteller_id', storytellerId)
    .ilike('title', `%${transcriptTitle}%`)

  if (findError) throw findError

  if (transcripts.length === 0) {
    console.log('❌ No matching transcript found')
    return false
  }

  if (transcripts.length > 1) {
    console.log('🤔 Multiple transcripts found:')
    transcripts.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.title}`)
    })
    console.log('Please be more specific with the title')
    return false
  }

  const transcript = transcripts[0]
  const platform = detectPlatform(videoUrl)
  const thumbnail = generateThumbnail(videoUrl)

  console.log(`✅ Found transcript: "${transcript.title}"`)
  console.log(`   Platform detected: ${platform}`)
  console.log(`   Thumbnail: ${thumbnail || 'None generated'}`)

  // Update the transcript
  const { error: updateError } = await supabase
    .from('transcripts')
    .update({
      source_video_url: videoUrl,
      source_video_platform: platform,
      source_video_thumbnail: thumbnail,
      media_metadata: {
        video_configured: true,
        configured_at: new Date().toISOString(),
        configured_by: 'manage-video-urls-script'
      }
    })
    .eq('id', transcript.id)

  if (updateError) {
    console.log(`❌ Error updating transcript: ${updateError.message}`)
    return false
  }

  console.log('✅ Transcript video added successfully!')
  console.log(`🔗 View at: http://localhost:3002/storytellers/${storytellerId}/dashboard`)
  return true
}

async function addStoryVideoEmbed(storytellerId, storyTitle, embedCode) {
  console.log(`🎬 Adding video embed to story...`)
  console.log(`   Storyteller ID: ${storytellerId}`)
  console.log(`   Story: ${storyTitle}`)
  console.log(`   Embed code: ${embedCode.substring(0, 100)}...\n`)

  // Find the story
  const { data: stories, error: findError } = await supabase
    .from('stories')
    .select('id, title, storyteller_id, author_id')
    .or(`storyteller_id.eq.${storytellerId},author_id.eq.${storytellerId}`)
    .ilike('title', `%${storyTitle}%`)

  if (findError) throw findError

  if (stories.length === 0) {
    console.log('❌ No matching story found')
    return false
  }

  if (stories.length > 1) {
    console.log('🤔 Multiple stories found:')
    stories.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.title}`)
    })
    console.log('Please be more specific with the title')
    return false
  }

  const story = stories[0]

  console.log(`✅ Found story: "${story.title}"`)

  // Update the story
  const { error: updateError } = await supabase
    .from('stories')
    .update({
      video_embed_code: embedCode,
      media_metadata: {
        video_configured: true,
        configured_at: new Date().toISOString(),
        configured_by: 'manage-video-urls-script'
      }
    })
    .eq('id', story.id)

  if (updateError) {
    console.log(`❌ Error updating story: ${updateError.message}`)
    return false
  }

  console.log('✅ Story video embed added successfully!')
  console.log(`🔗 View at: http://localhost:3002/storytellers/${storytellerId}/dashboard`)
  return true
}

async function testVideoConfiguration(storytellerId) {
  console.log(`🧪 Testing video configuration for storyteller: ${storytellerId}\n`)

  try {
    const response = await fetch(`http://localhost:3002/api/storytellers/${storytellerId}/dashboard`)
    if (!response.ok) {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`)
      return
    }

    const data = await response.json()
    const storyteller = data.storyteller

    console.log(`👤 ${storyteller.fullName || storyteller.displayName}`)
    console.log(`   Total Videos: ${storyteller.stats.totalVideos}`)
    console.log('')

    if (storyteller.transcripts.length > 0) {
      console.log('📹 TRANSCRIPT VIDEOS:')
      storyteller.transcripts.forEach(t => {
        console.log(`   • ${t.title}`)
        console.log(`     Has Video: ${t.hasVideo ? '✅' : '❌'}`)
        if (t.hasVideo) {
          console.log(`     URL: ${t.videoUrl || 'None'}`)
          console.log(`     Platform: ${t.videoPlatform || 'None'}`)
          console.log(`     Thumbnail: ${t.videoThumbnail ? '✅' : '❌'}`)
        }
        console.log('')
      })
    }

    if (storyteller.stories.length > 0) {
      console.log('🎬 STORY VIDEOS:')
      storyteller.stories.forEach(s => {
        console.log(`   • ${s.title}`)
        console.log(`     Has Video: ${s.hasVideo ? '✅' : '❌'}`)
        if (s.hasVideo) {
          console.log(`     Embed Code: ${s.videoEmbedCode ? '✅' : '❌'}`)
        }
        console.log('')
      })
    }

    console.log(`🔗 Dashboard: http://localhost:3002/storytellers/${storytellerId}/dashboard`)

  } catch (error) {
    console.log(`❌ Error testing configuration: ${error.message}`)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  console.log('🎥 Video URL Management Tool\n')

  try {
    switch (command) {
      case 'list':
        await listProfiles()
        break

      case 'add-transcript-video':
        if (args.length < 4) {
          console.log('Usage: node manage-video-urls.js add-transcript-video <storyteller-id> "<transcript-title>" "<video-url>"')
          console.log('Example: node manage-video-urls.js add-transcript-video "99a2d1de-2cad-4e03-a828-bf6617b36ef1" "Aunty May" "https://www.youtube.com/watch?v=dQw4w9WgXcQ"')
          return
        }
        await addTranscriptVideo(args[1], args[2], args[3])
        break

      case 'add-story-embed':
        if (args.length < 4) {
          console.log('Usage: node manage-video-urls.js add-story-embed <storyteller-id> "<story-title>" "<embed-code>"')
          console.log('Example: node manage-video-urls.js add-story-embed "99a2d1de-2cad-4e03-a828-bf6617b36ef1" "My Story" "<iframe src=\'https://www.youtube.com/embed/dQw4w9WgXcQ\'></iframe>"')
          return
        }
        await addStoryVideoEmbed(args[1], args[2], args[3])
        break

      case 'test':
        if (args.length < 2) {
          console.log('Usage: node manage-video-urls.js test <storyteller-id>')
          console.log('Example: node manage-video-urls.js test "99a2d1de-2cad-4e03-a828-bf6617b36ef1"')
          return
        }
        await testVideoConfiguration(args[1])
        break

      default:
        console.log('Available commands:')
        console.log('  list                           - List storytellers with transcripts/stories')
        console.log('  add-transcript-video           - Add video URL to a transcript')
        console.log('  add-story-embed               - Add video embed code to a story')
        console.log('  test                          - Test video configuration for a storyteller')
        console.log('')
        console.log('Examples:')
        console.log('  node manage-video-urls.js list')
        console.log('  node manage-video-urls.js add-transcript-video "storyteller-id" "transcript-title" "video-url"')
        console.log('  node manage-video-urls.js add-story-embed "storyteller-id" "story-title" "embed-code"')
        console.log('  node manage-video-urls.js test "storyteller-id"')
        break
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()