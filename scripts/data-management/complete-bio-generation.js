#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function generateShortBio(storyteller, sourceContent) {
  const prompt = `Create a VERY short bio for ${storyteller.display_name} for their profile card.

Source: ${sourceContent.substring(0, 1500)}

STRICT Requirements:
- Maximum 100 characters total
- 1-2 sentences only
- No generic phrases
- Capture their unique essence

Bio:`

  const { text: shortBio } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt,
    maxTokens: 50
  })

  return shortBio?.trim()
}

async function generateLongBio(storyteller, sourceContent) {
  const prompt = `Create a comprehensive 3-4 sentence bio for ${storyteller.display_name} for their full profile page.

Source: ${sourceContent.substring(0, 2000)}

Requirements:
- 3-4 complete sentences
- 200-400 characters total
- Professional but warm tone
- Highlight their unique contributions and background
- Include relevant cultural, professional, or community context

Bio:`

  const { text: longBio } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt,
    maxTokens: 120
  })

  return longBio?.trim()
}

async function getContentForStoryteller(storytellerId) {
  // Fetch stories
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, content, summary')
    .eq('author_id', storytellerId)
    .limit(3)

  // Fetch transcripts
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, transcript_content, text, formatted_text')
    .eq('storyteller_id', storytellerId)
    .limit(3)

  return { stories: stories || [], transcripts: transcripts || [] }
}

async function completeBioGeneration() {
  try {
    console.log('🚀 Starting comprehensive bio completion...\n')

    // Get all profiles that need bio work
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, display_name, bio')
      .order('display_name')

    if (error) {
      console.error('Error fetching profiles:', error)
      return
    }

    console.log(`📋 Analyzing ${profiles.length} storytellers...\n`)

    const needsShortBio = []
    const needsLongBio = []
    const needsBothBios = []

    // Categorize storytellers by bio needs
    profiles.forEach(profile => {
      const bio = profile.bio || ''
      const hasShort = bio.includes('[SHORT_BIO]') && bio.includes('[/SHORT_BIO]')
      const hasLong = bio.length > 100 && !bio.match(/^\\s*\\[SHORT_BIO\\].*\\[\\/SHORT_BIO\\]\\s*$/)

      if (hasShort && !hasLong) {
        needsLongBio.push(profile)
      } else if (!hasShort && hasLong) {
        needsShortBio.push(profile)
      } else if (!hasShort && !hasLong && (!bio || bio.trim().length < 20)) {
        needsBothBios.push(profile)
      }
    })

    console.log(`🎯 WORK PLAN:`)
    console.log(`  📄 Need short bios: ${needsShortBio.length}`)
    console.log(`  📚 Need long bios: ${needsLongBio.length}`)
    console.log(`  🆘 Need both bios: ${needsBothBios.length}`)
    console.log(`  📊 Total to process: ${needsShortBio.length + needsLongBio.length + needsBothBios.length}\n`)

    const results = []
    let processed = 0

    // 1. Generate short bios for those who only have long bios
    console.log('🔸 PHASE 1: Adding short bios to storytellers with only long bios...')
    for (const storyteller of needsShortBio) {
      processed++
      console.log(`📝 ${processed}: Adding short bio for ${storyteller.display_name}`)

      try {
        const { stories, transcripts } = await getContentForStoryteller(storyteller.id)
        let sourceContent = storyteller.bio || ''

        if (!sourceContent || sourceContent.length < 50) {
          const storyContent = stories.map(s => `${s.title || 'Story'}: ${s.content || s.summary || ''}`).join('\\n')
          const transcriptContent = transcripts.map(t => {
            const content = t.transcript_content || t.text || t.formatted_text || ''
            return `${t.title || 'Transcript'}: ${content}`
          }).join('\\n')
          sourceContent = [storyContent, transcriptContent].filter(Boolean).join('\\n\\n')
        }

        if (!sourceContent.trim()) {
          console.log(`   ⏭️ Skipping - no content available`)
          continue
        }

        const shortBio = await generateShortBio(storyteller, sourceContent)

        if (shortBio && shortBio.length > 10 && shortBio.length <= 120) {
          const shortBioMarker = `[SHORT_BIO]${shortBio}[/SHORT_BIO]`
          const updatedBio = `${storyteller.bio}\\n\\n${shortBioMarker}`

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ bio: updatedBio })
            .eq('id', storyteller.id)

          if (!updateError) {
            console.log(`   ✅ Added: "${shortBio}" (${shortBio.length} chars)`)
            results.push({ name: storyteller.display_name, action: 'short_bio_added', success: true })
          } else {
            console.log(`   ❌ Error:`, updateError.message)
            results.push({ name: storyteller.display_name, action: 'short_bio_failed', success: false })
          }
        } else {
          console.log(`   ⚠️ Generated bio inappropriate length: ${shortBio?.length || 0}`)
        }

        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        console.log(`   ❌ Error:`, error.message)
        results.push({ name: storyteller.display_name, action: 'short_bio_error', success: false })
      }
    }

    // 2. Generate long bios for those who only have short bios
    console.log('\\n🔹 PHASE 2: Adding long bios to storytellers with only short bios...')
    for (const storyteller of needsLongBio) {
      processed++
      console.log(`📝 ${processed}: Adding long bio for ${storyteller.display_name}`)

      try {
        const { stories, transcripts } = await getContentForStoryteller(storyteller.id)
        let sourceContent = ''

        const storyContent = stories.map(s => `${s.title || 'Story'}: ${s.content || s.summary || ''}`).join('\\n')
        const transcriptContent = transcripts.map(t => {
          const content = t.transcript_content || t.text || t.formatted_text || ''
          return `${t.title || 'Transcript'}: ${content}`
        }).join('\\n')
        sourceContent = [storyContent, transcriptContent].filter(Boolean).join('\\n\\n')

        if (!sourceContent.trim()) {
          console.log(`   ⏭️ Skipping - no content available`)
          continue
        }

        const longBio = await generateLongBio(storyteller, sourceContent)

        if (longBio && longBio.length > 50 && longBio.length <= 500) {
          const updatedBio = `${longBio}\\n\\n${storyteller.bio}`

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ bio: updatedBio })
            .eq('id', storyteller.id)

          if (!updateError) {
            console.log(`   ✅ Added: "${longBio.substring(0, 60)}..." (${longBio.length} chars)`)
            results.push({ name: storyteller.display_name, action: 'long_bio_added', success: true })
          } else {
            console.log(`   ❌ Error:`, updateError.message)
            results.push({ name: storyteller.display_name, action: 'long_bio_failed', success: false })
          }
        } else {
          console.log(`   ⚠️ Generated bio inappropriate length: ${longBio?.length || 0}`)
        }

        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        console.log(`   ❌ Error:`, error.message)
        results.push({ name: storyteller.display_name, action: 'long_bio_error', success: false })
      }
    }

    // 3. Generate both bios for those with no meaningful content
    console.log('\\n🔺 PHASE 3: Adding both bios to storytellers with no meaningful content...')
    for (const storyteller of needsBothBios.slice(0, 10)) { // Limit to prevent overwhelming
      processed++
      console.log(`📝 ${processed}: Adding both bios for ${storyteller.display_name}`)

      try {
        const { stories, transcripts } = await getContentForStoryteller(storyteller.id)
        let sourceContent = ''

        const storyContent = stories.map(s => `${s.title || 'Story'}: ${s.content || s.summary || ''}`).join('\\n')
        const transcriptContent = transcripts.map(t => {
          const content = t.transcript_content || t.text || t.formatted_text || ''
          return `${t.title || 'Transcript'}: ${content}`
        }).join('\\n')
        sourceContent = [storyContent, transcriptContent].filter(Boolean).join('\\n\\n')

        if (!sourceContent.trim() || sourceContent.length < 50) {
          console.log(`   ⏭️ Skipping - insufficient content`)
          continue
        }

        const [longBio, shortBio] = await Promise.all([
          generateLongBio(storyteller, sourceContent),
          generateShortBio(storyteller, sourceContent)
        ])

        if (longBio && shortBio &&
            longBio.length > 50 && longBio.length <= 500 &&
            shortBio.length > 10 && shortBio.length <= 120) {

          const shortBioMarker = `[SHORT_BIO]${shortBio}[/SHORT_BIO]`
          const updatedBio = `${longBio}\\n\\n${shortBioMarker}`

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ bio: updatedBio })
            .eq('id', storyteller.id)

          if (!updateError) {
            console.log(`   ✅ Added both: Long (${longBio.length}) + Short (${shortBio.length})`)
            results.push({ name: storyteller.display_name, action: 'both_bios_added', success: true })
          } else {
            console.log(`   ❌ Error:`, updateError.message)
            results.push({ name: storyteller.display_name, action: 'both_bios_failed', success: false })
          }
        } else {
          console.log(`   ⚠️ Generated bios inappropriate: Long ${longBio?.length || 0}, Short ${shortBio?.length || 0}`)
        }

        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.log(`   ❌ Error:`, error.message)
        results.push({ name: storyteller.display_name, action: 'both_bios_error', success: false })
      }
    }

    // Final report
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    console.log(`\\n📊 FINAL REPORT:`)
    console.log(`==================`)
    console.log(`✅ Successful: ${successful}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📝 Total processed: ${results.length}`)

    if (successful > 0) {
      console.log(`\\n🎉 Successfully improved ${successful} storyteller bios!`)
      console.log(`💡 All bios are automatically integrated into the card and profile systems.`)
    }

  } catch (error) {
    console.error('❌ Fatal error in bio completion:', error)
  }
}

completeBioGeneration()