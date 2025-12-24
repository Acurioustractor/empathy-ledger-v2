#!/usr/bin/env node

/**
 * Transform All Remaining Poor-Quality Stories
 *
 * Fetches story IDs from the audit and transforms them in batches.
 * This script integrates with the audit to ensure we're transforming the right stories.
 */

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Load story-craft principles
const STORY_CRAFT_GUIDE = readFileSync('.claude/skills/story-craft/skill.md', 'utf8')

// Story IDs from audit (severity >= 7)
// Final story
const STORIES_TO_TRANSFORM = [
  '11e8ae3e-6089-409e-9efe-25c036aaa675', // Essential Human Rights: A Refugee's Insight
]

async function fetchStory(storyId) {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      storyteller:profiles!stories_storyteller_id_fkey(
        display_name,
        cultural_background,
        bio
      )
    `)
    .eq('id', storyId)
    .single()

  if (error) throw error
  return data
}

async function transformWithClaude(story) {
  const prompt = `You are an expert storyteller for the Empathy Ledger platform, specializing in transforming raw interview transcripts into authentic, culturally-sensitive narratives.

## Story-Craft Principles:

${STORY_CRAFT_GUIDE.substring(0, 3000)}

## Raw Transcript to Transform:

**Title:** ${story.title}
**Storyteller:** ${story.storyteller?.display_name || 'Unknown'}
**Cultural Background:** ${story.storyteller?.cultural_background || 'Not specified'}

**Raw Content:**
${story.content.substring(0, 10000)}

## Your Task:

Transform this into an authentic Empathy Ledger story that:

1. **Removes ALL transcript artifacts:**
   - Timecodes: [00:00:00] or 00:00:00
   - Speaker labels: "Speaker 1:", "Interviewer:", etc.
   - Technical markers: [inaudible], [crosstalk], [pause]
   - Filler words: um, uh, like, you know (unless essential to voice)
   - Interview questions (turn them into narrative context)

2. **Creates authentic narrative:**
   - Strong opening hook (a moment, scene, or compelling question)
   - Clear story arc with beginning, middle, end
   - Specific, vivid details that bring moments to life
   - Natural paragraph structure (not wall of text)
   - Flows like a story, not an interview

3. **Honors cultural context:**
   - Respectfully acknowledges ${story.storyteller?.cultural_background || 'cultural background'}
   - Uses appropriate, respectful language
   - Maintains ${story.storyteller?.display_name}'s authentic voice
   - Respects sacred and sensitive content

4. **Captures emotional truth:**
   - Shows vulnerability AND strength
   - Focuses on human experience, not just facts
   - Includes meaningful insights
   - Resonates beyond the individual

5. **Follows Empathy Ledger voice:**
   - Authentic & grounded in real experience
   - Culturally respectful and sensitive
   - Human-centered, not system-centered
   - Emotionally resonant

## Output:

Provide ONLY the transformed story content.
- No preamble ("Here's the story..." etc.)
- No meta-commentary
- No explanations
- Just the beautifully crafted story, ready to publish.
- Keep it under 3000 words.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    temperature: 0.7,
    messages: [{
      role: 'user',
      content: prompt
    }]
  })

  return message.content[0].text
}

async function transformStory(story) {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`Transforming: ${story.title}`)
  console.log(`Storyteller: ${story.storyteller?.display_name || 'Unknown'}`)
  console.log(`Cultural Background: ${story.storyteller?.cultural_background || 'Not specified'}`)
  console.log(`Original Length: ${story.content.length} characters`)
  console.log(`${'='.repeat(70)}`)

  try {
    console.log(`\n🤖 Using Claude Sonnet 4 (best for storytelling)...`)

    const transformedContent = await transformWithClaude(story)

    console.log(`\n✅ Transformation complete`)
    console.log(`   Original: ${story.content.length} chars`)
    console.log(`   Transformed: ${transformedContent.length} chars`)
    console.log(`   Change: ${transformedContent.length > story.content.length ? '+' : ''}${transformedContent.length - story.content.length} chars`)

    return transformedContent

  } catch (error) {
    console.error(`❌ Transformation failed:`, error.message)
    throw error
  }
}

async function updateStory(storyId, transformedContent) {
  const timestamp = new Date().toISOString()

  const { error } = await supabase
    .from('stories')
    .update({
      content: transformedContent,
      updated_at: timestamp
    })
    .eq('id', storyId)

  if (error) throw error

  console.log(`✅ Story updated in database`)
}

async function transformBatch(options = {}) {
  const {
    dryRun = false,
    limit = STORIES_TO_TRANSFORM.length
  } = options

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Empathy Ledger - Transform Remaining Stories                  ║
║  Using Claude Sonnet 4 + story-craft principles                ║
╚════════════════════════════════════════════════════════════════╝

${dryRun ? '⚠️  DRY RUN MODE - No database updates will be made\n' : ''}
Transforming ${Math.min(limit, STORIES_TO_TRANSFORM.length)} stories...
AI Provider: Claude Sonnet 4 (Anthropic)
`)

  const storiesToProcess = STORIES_TO_TRANSFORM.slice(0, limit)
  let successCount = 0
  let failCount = 0
  const results = []

  for (const storyId of storiesToProcess) {
    try {
      const storyNum = successCount + failCount + 1

      console.log(`\n[${storyNum}/${storiesToProcess.length}] Fetching story...`)
      const story = await fetchStory(storyId)

      // Transform with Claude
      const transformedContent = await transformStory(story)

      // Show preview
      console.log(`\n📝 Preview (first 600 chars):`)
      console.log(`${'─'.repeat(70)}`)
      console.log(transformedContent.substring(0, 600))
      if (transformedContent.length > 600) {
        console.log(`\n... (${transformedContent.length - 600} more characters)`)
      }
      console.log(`${'─'.repeat(70)}`)

      // Update or skip based on dry run
      if (!dryRun) {
        console.log(`\n💾 Updating database...`)
        await updateStory(storyId, transformedContent)
      } else {
        console.log(`\n⏭️  Skipping database update (dry run mode)`)
      }

      successCount++
      results.push({
        id: storyId,
        title: story.title,
        status: 'success',
        originalLength: story.content.length,
        transformedLength: transformedContent.length
      })

      console.log(`✅ Story ${storyNum} transformed successfully\n`)

      // Rate limiting - wait 3 seconds between API calls
      if (storyNum < storiesToProcess.length) {
        console.log(`⏳ Waiting 3 seconds before next transformation...`)
        await new Promise(resolve => setTimeout(resolve, 3000))
      }

    } catch (error) {
      failCount++
      console.error(`\n❌ Failed to transform story ${storyId}:`, error.message)
      results.push({
        id: storyId,
        status: 'failed',
        error: error.message
      })
      console.error(`   Continuing with next story...\n`)
    }
  }

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  TRANSFORMATION COMPLETE                                       ║
╚════════════════════════════════════════════════════════════════╝

Results:
  ✅ Successful: ${successCount}
  ❌ Failed: ${failCount}
  📊 Total Processed: ${successCount + failCount}

${successCount === storiesToProcess.length ? '🎉 All stories transformed successfully!' : '⚠️  Some stories failed - review errors above'}

${dryRun ? '\n⚠️  DRY RUN - No changes were saved to database' : '\n✅ All transformations saved to database'}
`)

  // Show detailed results
  console.log(`\nDetailed Results:`)
  console.log(`${'─'.repeat(70)}`)
  results.forEach((r, i) => {
    if (r.status === 'success') {
      console.log(`${i + 1}. ✅ ${r.title}`)
      console.log(`   ${r.originalLength} → ${r.transformedLength} chars (${r.transformedLength > r.originalLength ? '+' : ''}${r.transformedLength - r.originalLength})`)
    } else {
      console.log(`${i + 1}. ❌ ${r.id}`)
      console.log(`   Error: ${r.error}`)
    }
  })

  return results
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const limitArg = args.find(arg => arg.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : STORIES_TO_TRANSFORM.length

// Run transformation
transformBatch({ dryRun, limit })
  .then(() => {
    console.log('\n✅ Batch transformation complete')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Batch transformation failed:', err)
    process.exit(1)
  })
