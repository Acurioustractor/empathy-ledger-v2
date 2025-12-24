#!/usr/bin/env node

/**
 * Dynamic Story Transformation Script
 *
 * Automatically identifies and transforms poor-quality stories
 * using the story quality audit to find candidates.
 *
 * Usage:
 *   node scripts/data-management/transform-stories-dynamic.js --limit=10
 *   node scripts/data-management/transform-stories-dynamic.js --dry-run --limit=5
 *   node scripts/data-management/transform-stories-dynamic.js --min-severity=7
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

// Quality checks matching audit-story-quality.js
const QUALITY_CHECKS = {
  timecodes: {
    pattern: /\d{1,2}:\d{2}:\d{2}|\[\d{1,2}:\d{2}\]|\(\d{1,2}:\d{2}\)/,
    severity: 3
  },
  speakerLabels: {
    pattern: /speaker \d+:|speaker:|interviewer:|respondent:|\[speaker/i,
    severity: 3
  },
  transcriptArtifacts: {
    pattern: /\[inaudible\]|\[crosstalk\]|\[laughter\]|\[pause\]/i,
    severity: 2
  },
  techMarkers: {
    pattern: /===|~~~|------/,
    severity: 2
  },
  noParagraphs: {
    test: (content) => !content.includes('\n\n') && content.length > 500,
    severity: 2
  }
}

function calculateSeverity(story) {
  let score = 0
  Object.values(QUALITY_CHECKS).forEach(check => {
    if (check.pattern && check.pattern.test(story.content || '')) {
      score += check.severity
    } else if (check.test && check.test(story.content || '', story)) {
      score += check.severity
    }
  })
  return Math.min(score, 10)
}

async function fetchStoriesNeedingTransformation(minSeverity = 6) {
  console.log(`\n🔍 Scanning database for stories with quality issues (severity >= ${minSeverity})...`)

  const { data: stories, error } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      content,
      storyteller:profiles!stories_storyteller_id_fkey(
        display_name,
        cultural_background,
        bio
      )
    `)
    .eq('status', 'published')
    .not('content', 'is', null)

  if (error) throw error

  // Analyze each story and calculate severity
  const storiesWithSeverity = stories
    .map(story => ({
      ...story,
      severity: calculateSeverity(story)
    }))
    .filter(story => story.severity >= minSeverity)
    .sort((a, b) => b.severity - a.severity) // Highest severity first

  console.log(`✅ Found ${storiesWithSeverity.length} stories needing transformation`)
  console.log(`   Severity range: ${minSeverity}-10`)

  return storiesWithSeverity
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
  console.log(`Severity Score: ${story.severity}/10`)
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
    limit = 10,
    minSeverity = 7
  } = options

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Empathy Ledger - Dynamic Story Transformation                 ║
║  Using Claude Sonnet 4 + story-craft principles                ║
╚════════════════════════════════════════════════════════════════╝

${dryRun ? '⚠️  DRY RUN MODE - No database updates will be made\n' : ''}
AI Provider: Claude Sonnet 4 (Anthropic)
Minimum Severity: ${minSeverity}/10
`)

  // Fetch stories dynamically
  const stories = await fetchStoriesNeedingTransformation(minSeverity)

  if (stories.length === 0) {
    console.log('🎉 No stories need transformation! All stories are high quality.')
    return []
  }

  const storiesToTransform = stories.slice(0, limit)
  console.log(`\n📊 Transforming ${storiesToTransform.length} of ${stories.length} stories needing work\n`)

  let successCount = 0
  let failCount = 0
  const results = []

  for (const story of storiesToTransform) {
    try {
      const storyNum = successCount + failCount + 1

      console.log(`\n[${storyNum}/${storiesToTransform.length}] Processing: ${story.title}`)

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
        await updateStory(story.id, transformedContent)
      } else {
        console.log(`\n⏭️  Skipping database update (dry run mode)`)
      }

      successCount++
      results.push({
        id: story.id,
        title: story.title,
        status: 'success',
        severity: story.severity,
        originalLength: story.content.length,
        transformedLength: transformedContent.length
      })

      console.log(`✅ Story ${storyNum} transformed successfully\n`)

      // Rate limiting - wait 3 seconds between API calls
      if (storyNum < storiesToTransform.length) {
        console.log(`⏳ Waiting 3 seconds before next transformation...`)
        await new Promise(resolve => setTimeout(resolve, 3000))
      }

    } catch (error) {
      failCount++
      console.error(`\n❌ Failed to transform "${story.title}":`, error.message)
      results.push({
        id: story.id,
        title: story.title,
        status: 'failed',
        severity: story.severity,
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
  📋 Remaining Stories: ${stories.length - storiesToTransform.length}

${successCount === storiesToTransform.length ? '🎉 All stories transformed successfully!' : '⚠️  Some stories failed - review errors above'}

${dryRun ? '\n⚠️  DRY RUN - No changes were saved to database' : '\n✅ All transformations saved to database'}
`)

  // Show detailed results
  console.log(`\nDetailed Results:`)
  console.log(`${'─'.repeat(70)}`)
  results.forEach((r, i) => {
    if (r.status === 'success') {
      console.log(`${i + 1}. ✅ ${r.title}`)
      console.log(`   Severity: ${r.severity}/10 | ${r.originalLength} → ${r.transformedLength} chars (${r.transformedLength > r.originalLength ? '+' : ''}${r.transformedLength - r.originalLength})`)
    } else {
      console.log(`${i + 1}. ❌ ${r.title}`)
      console.log(`   Severity: ${r.severity}/10 | Error: ${r.error}`)
    }
  })

  return results
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const limitArg = args.find(arg => arg.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10
const severityArg = args.find(arg => arg.startsWith('--min-severity='))
const minSeverity = severityArg ? parseInt(severityArg.split('=')[1]) : 6

// Run transformation
transformBatch({ dryRun, limit, minSeverity })
  .then(() => {
    console.log('\n✅ Batch transformation complete')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Batch transformation failed:', err)
    process.exit(1)
  })
