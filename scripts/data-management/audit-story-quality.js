#!/usr/bin/env node

/**
 * Story Quality Audit Script
 *
 * Identifies stories with poor quality indicators:
 * - Raw transcripts with timecodes
 * - Speaker labels
 * - Transcript artifacts
 * - No narrative structure
 * - Poor writing quality
 *
 * Usage:
 *   node scripts/data-management/audit-story-quality.js
 *   node scripts/data-management/audit-story-quality.js --export-csv
 *   node scripts/data-management/audit-story-quality.js --delete-flagged
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const QUALITY_CHECKS = {
  timecodes: {
    name: 'Timecodes',
    pattern: /\d{1,2}:\d{2}:\d{2}|\[\d{1,2}:\d{2}\]|\(\d{1,2}:\d{2}\)/,
    severity: 'high',
    description: 'Contains transcript timecodes'
  },
  speakerLabels: {
    name: 'Speaker Labels',
    pattern: /speaker \d+:|speaker:|interviewer:|respondent:|\[speaker/i,
    severity: 'high',
    description: 'Contains speaker/interviewer labels'
  },
  transcriptArtifacts: {
    name: 'Transcript Artifacts',
    pattern: /\[inaudible\]|\[crosstalk\]|\[laughter\]|\[pause\]|um, uh|you know, like/i,
    severity: 'medium',
    description: 'Contains [inaudible], um/uh, filler words'
  },
  techMarkers: {
    name: 'Technical Markers',
    pattern: /===|~~~|------|^\s*\n\s*\n\s*\n/,
    severity: 'medium',
    description: 'Contains technical formatting artifacts'
  },
  noParagraphs: {
    name: 'No Paragraphs',
    test: (content) => !content.includes('\n') && content.length > 500,
    severity: 'medium',
    description: 'Wall of text with no paragraph breaks'
  },
  veryShort: {
    name: 'Very Short',
    test: (content) => content.trim().length < 150,
    severity: 'low',
    description: 'Content too short to be meaningful'
  },
  noSentences: {
    name: 'No Sentence Structure',
    test: (content) => content.split('.').length < 3 && content.length > 200,
    severity: 'medium',
    description: 'Lacks sentence structure'
  },
  testStory: {
    name: 'Test Story',
    test: (content, story) => {
      if (!story || !story.title) return false
      const title = story.title.toLowerCase()
      const contentLower = (content || '').toLowerCase()
      return title.includes('test') ||
             title.includes('e2e') ||
             contentLower.includes('test story') ||
             contentLower.includes('quick capture by test')
    },
    severity: 'high',
    description: 'Appears to be a test story'
  }
}

function analyzeStory(story) {
  const issues = []
  let severityScore = 0

  Object.entries(QUALITY_CHECKS).forEach(([key, check]) => {
    let flagged = false

    if (check.pattern) {
      flagged = check.pattern.test(story.content || '')
    } else if (check.test) {
      flagged = check.test(story.content || '', story)
    }

    if (flagged) {
      issues.push({
        check: key,
        name: check.name,
        severity: check.severity,
        description: check.description
      })

      if (check.severity === 'high') severityScore += 3
      if (check.severity === 'medium') severityScore += 2
      if (check.severity === 'low') severityScore += 1
    }
  })

  return {
    hasIssues: issues.length > 0,
    issues,
    severityScore,
    recommendation: getRecommendation(severityScore, issues)
  }
}

function getRecommendation(score, issues) {
  const hasTimecodes = issues.some(i => i.check === 'timecodes')
  const hasSpeakerLabels = issues.some(i => i.check === 'speakerLabels')
  const isTest = issues.some(i => i.check === 'testStory')

  if (isTest) return 'DELETE'
  if (score >= 6 || (hasTimecodes && hasSpeakerLabels)) return 'TRANSFORM'
  if (score >= 3) return 'REVIEW'
  return 'KEEP'
}

async function auditStories() {
  console.log('\n📊 EMPATHY LEDGER - Story Quality Audit\n')

  // Fetch all stories
  const { data: stories, error } = await supabase
    .from('stories')
    .select('id, title, content, created_at, storyteller_id, status')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching stories:', error.message)
    return
  }

  console.log(`Analyzing ${stories.length} stories...\n`)

  const results = {
    total: stories.length,
    clean: 0,
    needsReview: 0,
    needsTransform: 0,
    shouldDelete: 0,
    stories: []
  }

  stories.forEach(story => {
    const analysis = analyzeStory(story)

    if (!analysis.hasIssues) {
      results.clean++
      return
    }

    const storyResult = {
      id: story.id,
      title: story.title,
      status: story.status,
      created: story.created_at,
      ...analysis
    }

    results.stories.push(storyResult)

    if (analysis.recommendation === 'DELETE') results.shouldDelete++
    else if (analysis.recommendation === 'TRANSFORM') results.needsTransform++
    else if (analysis.recommendation === 'REVIEW') results.needsReview++
  })

  // Print summary
  console.log('═'.repeat(60))
  console.log('SUMMARY')
  console.log('═'.repeat(60))
  console.log(`Total Stories:           ${results.total}`)
  console.log(`✅ Clean (no issues):    ${results.clean}`)
  console.log(`⚠️  Needs Review:        ${results.needsReview}`)
  console.log(`🔄 Needs Transform:      ${results.needsTransform}`)
  console.log(`❌ Should Delete:        ${results.shouldDelete}`)
  console.log('═'.repeat(60))

  // Group by recommendation
  const byRecommendation = {
    DELETE: results.stories.filter(s => s.recommendation === 'DELETE'),
    TRANSFORM: results.stories.filter(s => s.recommendation === 'TRANSFORM'),
    REVIEW: results.stories.filter(s => s.recommendation === 'REVIEW')
  }

  // Print details
  if (byRecommendation.DELETE.length > 0) {
    console.log('\n❌ STORIES TO DELETE (Test/Junk)')
    console.log('─'.repeat(60))
    byRecommendation.DELETE.forEach((s, i) => {
      console.log(`${i + 1}. ${s.title}`)
      console.log(`   ID: ${s.id}`)
      console.log(`   Issues: ${s.issues.map(iss => iss.name).join(', ')}`)
    })
  }

  if (byRecommendation.TRANSFORM.length > 0) {
    console.log('\n🔄 STORIES TO TRANSFORM (Raw Transcripts)')
    console.log('─'.repeat(60))
    byRecommendation.TRANSFORM.slice(0, 20).forEach((s, i) => {
      console.log(`${i + 1}. ${s.title}`)
      console.log(`   ID: ${s.id}`)
      console.log(`   Issues: ${s.issues.map(iss => iss.name).join(', ')}`)
      console.log(`   Severity: ${s.severityScore}/10`)
    })
    if (byRecommendation.TRANSFORM.length > 20) {
      console.log(`\n   ... and ${byRecommendation.TRANSFORM.length - 20} more`)
    }
  }

  // Export options
  const args = process.argv.slice(2)

  if (args.includes('--export-csv')) {
    exportToCSV(results.stories)
  }

  if (args.includes('--delete-flagged')) {
    await deleteFlaggedStories(byRecommendation.DELETE)
  }

  if (args.includes('--help')) {
    printHelp()
  }

  console.log('\n✅ Audit complete!\n')

  return results
}

function exportToCSV(stories) {
  const csv = [
    'ID,Title,Recommendation,Severity,Issues',
    ...stories.map(s =>
      `"${s.id}","${s.title}","${s.recommendation}",${s.severityScore},"${s.issues.map(i => i.name).join('; ')}"`
    )
  ].join('\n')

  const filename = `story-quality-audit-${Date.now()}.csv`
  fs.writeFileSync(filename, csv)
  console.log(`\n📄 Exported to ${filename}`)
}

async function deleteFlaggedStories(stories) {
  console.log(`\n⚠️  About to delete ${stories.length} stories...`)
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...')

  await new Promise(resolve => setTimeout(resolve, 5000))

  for (const story of stories) {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', story.id)

    if (error) {
      console.error(`❌ Failed to delete "${story.title}":`, error.message)
    } else {
      console.log(`✅ Deleted "${story.title}"`)
    }
  }

  console.log(`\n✅ Deleted ${stories.length} stories`)
}

function printHelp() {
  console.log(`
Usage:
  node scripts/data-management/audit-story-quality.js [options]

Options:
  --export-csv        Export results to CSV file
  --delete-flagged    Delete stories marked for deletion (test stories)
  --help              Show this help message

Recommendations:
  DELETE      - Test stories, junk content
  TRANSFORM   - Raw transcripts needing story craft
  REVIEW      - Minor issues, manual review needed
  KEEP        - Clean, well-crafted stories

Next Steps:
  1. Review flagged stories manually
  2. Use the story-craft Claude skill to transform raw transcripts
  3. Delete test stories with --delete-flagged
  4. Export results with --export-csv for tracking
`)
}

// Run audit
auditStories()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
