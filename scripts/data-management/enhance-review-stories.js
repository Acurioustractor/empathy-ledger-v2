#!/usr/bin/env node

/**
 * Enhance Stories Marked for Review
 *
 * Lighter transformation for stories with minor issues:
 * - Remove timecodes
 * - Remove technical markers
 * - Add paragraph breaks
 * - Improve sentence structure
 * - Keep original voice and content
 *
 * Usage:
 *   node scripts/data-management/enhance-review-stories.js --limit=20 --dry-run
 *   node scripts/data-management/enhance-review-stories.js --limit=101
 */

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import * as dotenv from 'dotenv'
import { readFileSync, readdirSync } from 'fs'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Load story IDs from audit CSV
function getReviewStoryIds(limit = 20) {
  const csvFiles = readdirSync('.')
    .filter(f => f.startsWith('story-quality-audit-') && f.endsWith('.csv'))
    .sort()
    .reverse()

  if (csvFiles.length === 0) {
    throw new Error('No audit CSV found. Run: node scripts/data-management/audit-story-quality.js --export-csv')
  }

  const csv = readFileSync(csvFiles[0], 'utf8')
  const lines = csv.split('\n')
    .filter(line => line.includes('REVIEW'))
    .slice(0, limit)

  return lines.map(line => {
    const match = line.match(/^"([^"]+)"/)
    return match ? match[1] : null
  }).filter(Boolean)
}

async function fetchStory(storyId) {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      storyteller:profiles!stories_storyteller_id_fkey(
        display_name,
        cultural_background
      )
    `)
    .eq('id', storyId)
    .single()

  if (error) throw error
  return data
}

async function enhanceWithClaude(story) {
  const prompt = `You are enhancing a story for the Empathy Ledger platform. This story has minor quality issues that need fixing.

**Story Title:** ${story.title}
**Storyteller:** ${story.storyteller?.display_name || 'Unknown'}

**Current Content:**
${story.content.substring(0, 8000)}

**Your Task:**

Clean up technical artifacts while preserving the story content:

1. **Remove ALL timecodes** - Delete [00:00:00], 00:00:00, or similar time markers
2. **Remove speaker labels** - Delete "Ben:", "Interviewer:", "Speaker 1:", etc. Keep the dialogue, just remove the labels
3. **Remove technical markers** - Delete ===, ~~~, ------, horizontal lines
4. **Remove transcript artifacts** - Delete [inaudible], [crosstalk], [pause], etc.
5. **Add paragraph breaks** - If it's a wall of text, add paragraph breaks every 3-4 sentences
6. **Improve flow** - Make slight improvements to sentence structure and punctuation

**Important Guidelines:**

- Keep ALL the actual spoken content
- Keep the conversational tone and voice
- DO NOT add new content or embellishments
- DO NOT change what was said
- ONLY remove technical artifacts and improve formatting
- If it's already clean, return it unchanged

**Output:**

Provide ONLY the cleaned content. No preamble, no commentary, just the enhanced story text.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    temperature: 0.3,  // Lower temperature for minimal changes
    messages: [{
      role: 'user',
      content: prompt
    }]
  })

  return message.content[0].text
}

async function updateStory(storyId, enhancedContent) {
  const timestamp = new Date().toISOString()

  const { error } = await supabase
    .from('stories')
    .update({
      content: enhancedContent,
      updated_at: timestamp
    })
    .eq('id', storyId)

  if (error) throw error
}

async function enhanceBatch(options = {}) {
  const {
    dryRun = false,
    limit = 20
  } = options

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Empathy Ledger - Enhance Review Stories                      ║
║  Using Claude Sonnet 4 for light touch-ups                    ║
╚════════════════════════════════════════════════════════════════╝

${dryRun ? '⚠️  DRY RUN MODE - No database updates will be made\n' : ''}
AI Provider: Claude Sonnet 4 (Anthropic)
Enhancement Type: Light (minimal changes)
`)

  // Get story IDs from audit CSV
  console.log('📄 Loading story IDs from latest audit...')
  const storyIds = getReviewStoryIds(limit)
  console.log(`✅ Found ${storyIds.length} stories to enhance\n`)

  let successCount = 0
  let failCount = 0
  let noChangeCount = 0
  const results = []

  for (const storyId of storyIds) {
    try {
      const storyNum = successCount + failCount + noChangeCount + 1

      console.log(`\n[${storyNum}/${storyIds.length}] Fetching story...`)
      const story = await fetchStory(storyId)

      console.log(`\n${'='.repeat(70)}`)
      console.log(`Enhancing: ${story.title}`)
      console.log(`Storyteller: ${story.storyteller?.display_name || 'Unknown'}`)
      console.log(`Original Length: ${story.content.length} characters`)
      console.log(`${'='.repeat(70)}`)

      // Enhance with Claude
      console.log(`\n🤖 Using Claude Sonnet 4 for light enhancement...`)
      const enhancedContent = await enhanceWithClaude(story)

      const change = enhancedContent.length - story.content.length
      console.log(`\n✅ Enhancement complete`)
      console.log(`   Original: ${story.content.length} chars`)
      console.log(`   Enhanced: ${enhancedContent.length} chars`)
      console.log(`   Change: ${change > 0 ? '+' : ''}${change} chars`)

      // Show preview
      console.log(`\n📝 Preview (first 600 chars):`)
      console.log(`${'─'.repeat(70)}`)
      console.log(enhancedContent.substring(0, 600))
      if (enhancedContent.length > 600) {
        console.log(`\n... (${enhancedContent.length - 600} more characters)`)
      }
      console.log(`${'─'.repeat(70)}`)

      // Check if there was any real change
      if (enhancedContent.trim() === story.content.trim()) {
        console.log(`\n⏭️  No changes needed - story already clean`)
        noChangeCount++
        results.push({
          id: storyId,
          title: story.title,
          status: 'no_change',
          originalLength: story.content.length,
          enhancedLength: enhancedContent.length
        })
      } else {
        // Update or skip based on dry run
        if (!dryRun) {
          console.log(`\n💾 Updating database...`)
          await updateStory(storyId, enhancedContent)
          console.log(`✅ Story updated`)
        } else {
          console.log(`\n⏭️  Skipping database update (dry run mode)`)
        }

        successCount++
        results.push({
          id: storyId,
          title: story.title,
          status: 'success',
          originalLength: story.content.length,
          enhancedLength: enhancedContent.length
        })
      }

      // Rate limiting - wait 2 seconds between API calls
      if (storyNum < storyIds.length) {
        console.log(`⏳ Waiting 2 seconds before next enhancement...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

    } catch (error) {
      failCount++
      console.error(`\n❌ Failed to enhance story ${storyId}:`, error.message)
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
║  ENHANCEMENT COMPLETE                                          ║
╚════════════════════════════════════════════════════════════════╝

Results:
  ✅ Enhanced: ${successCount}
  ⏭️  No Changes Needed: ${noChangeCount}
  ❌ Failed: ${failCount}
  📊 Total Processed: ${successCount + failCount + noChangeCount}

${successCount === storyIds.length ? '🎉 All stories enhanced successfully!' : '⚠️  Some stories failed or needed no changes - review above'}

${dryRun ? '\n⚠️  DRY RUN - No changes were saved to database' : '\n✅ All enhancements saved to database'}
`)

  // Show detailed results
  console.log(`\nDetailed Results:`)
  console.log(`${'─'.repeat(70)}`)
  results.forEach((r, i) => {
    if (r.status === 'success') {
      console.log(`${i + 1}. ✅ ${r.title}`)
      console.log(`   ${r.originalLength} → ${r.enhancedLength} chars (${r.enhancedLength > r.originalLength ? '+' : ''}${r.enhancedLength - r.originalLength})`)
    } else if (r.status === 'no_change') {
      console.log(`${i + 1}. ⏭️  ${r.title}`)
      console.log(`   No changes needed`)
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
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 20

// Run enhancement
enhanceBatch({ dryRun, limit })
  .then(() => {
    console.log('\n✅ Batch enhancement complete')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Batch enhancement failed:', err)
    process.exit(1)
  })
