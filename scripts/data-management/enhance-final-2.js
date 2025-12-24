#!/usr/bin/env node

/**
 * Enhance Final 2 Review Stories
 */

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const FINAL_STORIES = [
  'db20b47f-43c1-45ef-a683-78fde4ad5a75', // Margot Scales — Key Story
  '8bedff60-2e56-4c42-8de6-4f28bfbf05ee', // Aunty Evie
]

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
    temperature: 0.3,
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

async function enhanceFinalStories() {
  console.log('\n🎯 Enhancing final 2 review stories...\n')

  for (const storyId of FINAL_STORIES) {
    try {
      console.log(`\n📖 Fetching story ${storyId}...`)
      const story = await fetchStory(storyId)

      console.log(`\nTitle: ${story.title}`)
      console.log(`Storyteller: ${story.storyteller?.display_name || 'Unknown'}`)
      console.log(`Original Length: ${story.content.length} chars`)

      console.log(`\n🤖 Enhancing with Claude Sonnet 4...`)
      const enhanced = await enhanceWithClaude(story)

      console.log(`\n✅ Enhanced Length: ${enhanced.length} chars`)
      console.log(`Change: ${enhanced.length > story.content.length ? '+' : ''}${enhanced.length - story.content.length}`)

      console.log(`\n📝 Preview (first 400 chars):`)
      console.log(`${'─'.repeat(60)}`)
      console.log(enhanced.substring(0, 400))
      console.log(`${'─'.repeat(60)}`)

      console.log(`\n💾 Updating database...`)
      await updateStory(storyId, enhanced)
      console.log(`✅ Story updated successfully`)

      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (error) {
      console.error(`\n❌ Failed to enhance story ${storyId}:`, error.message)
    }
  }

  console.log('\n✅ Final 2 stories enhanced!\n')
}

enhanceFinalStories()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })
