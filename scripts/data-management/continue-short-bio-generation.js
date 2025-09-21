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

async function generateShortBios() {
  try {
    console.log('🚀 Starting systematic short bio generation...')

    // Get storytellers that don't have short bio markers yet
    const { data: storytellers, error } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        bio,
        cultural_background
      `)
      .or('bio.is.null,bio.not.like.*[SHORT_BIO]*')
      .limit(50)
      .order('display_name')

    if (error) {
      console.error('Error fetching storytellers:', error)
      return
    }

    console.log(`📋 Found ${storytellers?.length || 0} storytellers without short bios`)

    if (!storytellers || storytellers.length === 0) {
      console.log('✅ All storytellers already have short bios!')
      return
    }

    const results = []
    let processed = 0

    for (const storyteller of storytellers) {
      processed++
      console.log(`\n📝 Processing ${processed}/${storytellers.length}: ${storyteller.display_name}`)

      try {
        // Fetch stories for this storyteller
        const { data: stories } = await supabase
          .from('stories')
          .select('id, title, content, summary')
          .eq('author_id', storyteller.id)
          .limit(3)

        // Fetch transcripts for this storyteller - fixed linking
        const { data: transcripts, error: transcriptError } = await supabase
          .from('transcripts')
          .select('id, title, transcript_content, text, formatted_text')
          .eq('storyteller_id', storyteller.id)
          .limit(3)

        console.log(`   Content: ${(stories || []).length} stories, ${(transcripts || []).length} transcripts`)
        if (transcriptError) {
          console.log(`   ⚠️ Transcript query error:`, transcriptError.message)
        }

        // Check if we have enough content to generate a bio
        if ((stories || []).length === 0 && (transcripts || []).length === 0 && (!storyteller.bio || storyteller.bio.length < 50)) {
          console.log(`   ⏭️ Skipping ${storyteller.display_name} - no meaningful content`)
          continue
        }

        // Use existing long bio if available, otherwise prepare content
        let sourceContent = storyteller.bio || ''

        // If no bio in main field, try to use content from stories/transcripts
        if (!sourceContent || sourceContent.length < 50) {
          const storyContent = (stories || []).map(s => `${s.title || 'Story'}: ${s.content || s.summary || ''}`).join('\n')
          const transcriptContent = (transcripts || []).map(t => {
            const content = t.transcript_content || t.text || t.formatted_text || '';
            return `${t.title || 'Transcript'}: ${content}`;
          }).join('\n')
          sourceContent = [storyContent, transcriptContent].filter(Boolean).join('\n\n')
        }

        if (!sourceContent.trim()) {
          console.log(`   ⏭️ Skipping ${storyteller.display_name} - no meaningful content after checking all sources`)
          continue
        }

        // Generate short bio for cards
        const prompt = `Create a VERY short bio for ${storyteller.display_name} for their profile card.

Source: ${sourceContent.substring(0, 1500)}

STRICT Requirements:
- Maximum 100 characters total
- 1-2 sentences only
- No generic phrases
- Capture their unique essence

Bio:`

        console.log(`   🤖 Generating short bio...`)
        const { text: shortBio } = await generateText({
          model: openai('gpt-4o-mini'),
          prompt,
          maxTokens: 50
        })

        if (shortBio && shortBio.length > 10 && shortBio.length <= 120) {
          // Store short bio with marker in existing bio field
          const shortBioMarker = `[SHORT_BIO]${shortBio.trim()}[/SHORT_BIO]`
          const updatedBio = storyteller.bio ? `${storyteller.bio}\n\n${shortBioMarker}` : shortBioMarker

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ bio: updatedBio })
            .eq('id', storyteller.id)

          if (updateError) {
            console.error(`   ❌ Error updating short bio for ${storyteller.display_name}:`, updateError)
            results.push({
              storyteller: storyteller.display_name,
              status: 'error',
              error: updateError.message
            })
          } else {
            console.log(`   ✅ Added short bio: "${shortBio.trim()}" (${shortBio.trim().length} chars)`)
            results.push({
              storyteller: storyteller.display_name,
              status: 'updated',
              new_short_bio: shortBio.trim(),
              character_count: shortBio.trim().length
            })
          }
        } else {
          console.log(`   ⚠️ Generated bio inappropriate length: ${shortBio?.length || 0} characters`)
          results.push({
            storyteller: storyteller.display_name,
            status: 'skipped',
            reason: `Generated bio inappropriate length: ${shortBio?.length || 0} characters`
          })
        }

        // Brief delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 300))

      } catch (error) {
        console.error(`   ❌ Error processing ${storyteller.display_name}:`, error)
        results.push({
          storyteller: storyteller.display_name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Final report
    const updated = results.filter(r => r.status === 'updated').length
    const skipped = results.filter(r => r.status === 'skipped').length
    const errors = results.filter(r => r.status === 'error').length

    console.log(`\n📊 FINAL RESULTS:`)
    console.log(`   ✅ Updated: ${updated}`)
    console.log(`   ⏭️ Skipped: ${skipped}`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log(`   📝 Total processed: ${results.length}`)

    if (updated > 0) {
      console.log(`\n🎉 Successfully added ${updated} new short bios!`)
      console.log(`💡 Short bios are automatically used in storyteller cards via the bio extraction utility.`)
    }

  } catch (error) {
    console.error('❌ Fatal error in short bio generation:', error)
  }
}

generateShortBios()