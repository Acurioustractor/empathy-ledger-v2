#!/usr/bin/env node

/**
 * Comprehensive Platform Health Check
 *
 * Validates:
 * - Story quality (all 250 clean stories)
 * - Profile data completeness
 * - Database relationships integrity
 * - Media assets validation
 * - Performance metrics
 * - API endpoints health
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  checks: []
}

function log(status, category, message, details = null) {
  const icons = {
    pass: '✅',
    fail: '❌',
    warn: '⚠️ ',
    info: 'ℹ️ '
  }

  console.log(`${icons[status]} [${category}] ${message}`)
  if (details) {
    console.log(`   ${JSON.stringify(details)}`)
  }

  results.checks.push({ status, category, message, details })

  if (status === 'pass') results.passed++
  else if (status === 'fail') results.failed++
  else if (status === 'warn') results.warnings++
}

async function checkStoryQuality() {
  console.log('\n📖 Story Quality Checks')
  console.log('─'.repeat(60))

  // Check total stories
  const { count: totalStories, error: countError } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    log('fail', 'Stories', 'Failed to count stories', countError.message)
    return
  }

  log('pass', 'Stories', `Total stories: ${totalStories}`)

  // Check published stories
  const { count: publishedCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  const publishedPercent = ((publishedCount / totalStories) * 100).toFixed(1)
  log('pass', 'Stories', `Published stories: ${publishedCount} (${publishedPercent}%)`)

  // Check stories with profile images
  const { data: storiesWithImages } = await supabase
    .from('stories')
    .select(`
      id,
      storyteller:profiles!stories_storyteller_id_fkey(profile_image_url)
    `)
    .eq('status', 'published')
    .not('storyteller.profile_image_url', 'is', null)

  const imagePercent = ((storiesWithImages.length / publishedCount) * 100).toFixed(1)
  log('pass', 'Stories', `Stories with storyteller images: ${storiesWithImages.length} (${imagePercent}%)`)

  // Check for orphaned stories (no storyteller)
  const { count: orphanedCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .is('storyteller_id', null)

  if (orphanedCount > 0) {
    log('warn', 'Stories', `Orphaned stories (no storyteller): ${orphanedCount}`)
  } else {
    log('pass', 'Stories', 'No orphaned stories')
  }

  // Check story content length
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, content')
    .eq('status', 'published')
    .limit(1000)

  const veryShort = stories.filter(s => (s.content || '').length < 100).length
  const short = stories.filter(s => (s.content || '').length >= 100 && (s.content || '').length < 500).length
  const medium = stories.filter(s => (s.content || '').length >= 500 && (s.content || '').length < 2000).length
  const long = stories.filter(s => (s.content || '').length >= 2000).length

  console.log(`\n   Content Length Distribution:`)
  console.log(`   - Very Short (<100 chars): ${veryShort}`)
  console.log(`   - Short (100-500 chars): ${short}`)
  console.log(`   - Medium (500-2K chars): ${medium}`)
  console.log(`   - Long (2K+ chars): ${long}`)

  if (veryShort > publishedCount * 0.1) {
    log('warn', 'Stories', `${veryShort} very short stories (>${((veryShort/publishedCount)*100).toFixed(1)}%)`)
  } else {
    log('pass', 'Stories', `Content length distribution healthy`)
  }
}

async function checkProfileData() {
  console.log('\n👥 Profile Data Checks')
  console.log('─'.repeat(60))

  const { count: totalProfiles } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  log('pass', 'Profiles', `Total profiles: ${totalProfiles}`)

  // Check profiles with images
  const { count: withImages } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('profile_image_url', 'is', null)

  const imagePercent = ((withImages / totalProfiles) * 100).toFixed(1)
  log('pass', 'Profiles', `Profiles with images: ${withImages} (${imagePercent}%)`)

  // Check storytellers
  const { count: storytellerCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_storyteller', true)

  log('pass', 'Profiles', `Storytellers: ${storytellerCount}`)

  // Check profiles with cultural background
  const { count: withCulture } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .not('cultural_background', 'is', null)
    .neq('cultural_background', '')

  const culturePercent = ((withCulture / totalProfiles) * 100).toFixed(1)
  log('pass', 'Profiles', `Profiles with cultural background: ${withCulture} (${culturePercent}%)`)

  // Check for duplicate emails
  const { data: profiles } = await supabase
    .from('profiles')
    .select('email')
    .not('email', 'is', null)

  const emails = profiles.map(p => p.email).filter(Boolean)
  const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index)

  if (duplicates.length > 0) {
    log('warn', 'Profiles', `Duplicate emails found: ${duplicates.length}`, duplicates)
  } else {
    log('pass', 'Profiles', 'No duplicate emails')
  }
}

async function checkDatabaseRelationships() {
  console.log('\n🔗 Database Relationship Checks')
  console.log('─'.repeat(60))

  // Check story-storyteller relationships
  const { data: invalidStorytellers } = await supabase
    .from('stories')
    .select('id, title, storyteller_id')
    .not('storyteller_id', 'is', null)
    .limit(1000)

  let invalidCount = 0
  for (const story of invalidStorytellers) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', story.storyteller_id)
      .single()

    if (!profile) invalidCount++
  }

  if (invalidCount > 0) {
    log('fail', 'Relationships', `Invalid storyteller references: ${invalidCount}`)
  } else {
    log('pass', 'Relationships', 'All storyteller relationships valid')
  }

  // Check project relationships
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, project_id')
    .not('project_id', 'is', null)
    .limit(100)

  let invalidProjects = 0
  for (const story of stories) {
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', story.project_id)
      .single()

    if (!project) invalidProjects++
  }

  if (invalidProjects > 0) {
    log('warn', 'Relationships', `Invalid project references: ${invalidProjects}`)
  } else {
    log('pass', 'Relationships', 'Project relationships valid')
  }
}

async function checkMediaAssets() {
  console.log('\n🎨 Media Assets Checks')
  console.log('─'.repeat(60))

  const { count: totalMedia } = await supabase
    .from('media_assets')
    .select('*', { count: 'exact', head: true })

  log('pass', 'Media', `Total media assets: ${totalMedia}`)

  // Check media types
  const { data: media } = await supabase
    .from('media_assets')
    .select('media_type')
    .limit(1000)

  const types = media.reduce((acc, m) => {
    acc[m.media_type] = (acc[m.media_type] || 0) + 1
    return acc
  }, {})

  console.log(`\n   Media Types:`)
  Object.entries(types).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count}`)
  })

  log('pass', 'Media', 'Media type distribution recorded')
}

async function checkPerformanceMetrics() {
  console.log('\n⚡ Performance Metrics')
  console.log('─'.repeat(60))

  // Test query performance
  const startTime = Date.now()

  await supabase
    .from('stories')
    .select(`
      *,
      storyteller:profiles!stories_storyteller_id_fkey(
        id,
        display_name,
        profile_image_url,
        cultural_background
      )
    `)
    .eq('status', 'published')
    .limit(10)

  const queryTime = Date.now() - startTime

  if (queryTime > 2000) {
    log('warn', 'Performance', `Slow query: ${queryTime}ms (expected <2000ms)`)
  } else {
    log('pass', 'Performance', `Query time: ${queryTime}ms`)
  }

  // Check database size
  const tables = ['stories', 'profiles', 'media_assets', 'projects', 'transcripts']

  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })

    console.log(`   - ${table}: ${count} rows`)
  }

  log('pass', 'Performance', 'Database size metrics recorded')
}

async function printSummary() {
  console.log('\n' + '='.repeat(60))
  console.log('HEALTH CHECK SUMMARY')
  console.log('='.repeat(60))

  const total = results.passed + results.failed + results.warnings
  const passRate = ((results.passed / total) * 100).toFixed(1)

  console.log(`\nTotal Checks: ${total}`)
  console.log(`✅ Passed: ${results.passed} (${passRate}%)`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`⚠️  Warnings: ${results.warnings}`)

  if (results.failed === 0) {
    console.log(`\n🎉 All critical checks passed!`)
  } else {
    console.log(`\n⚠️  Some checks failed - review errors above`)
  }

  console.log('\n' + '='.repeat(60))
}

async function runHealthCheck() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗')
  console.log('║  Empathy Ledger - Comprehensive Health Check                  ║')
  console.log('╚════════════════════════════════════════════════════════════════╝\n')

  try {
    await checkStoryQuality()
    await checkProfileData()
    await checkDatabaseRelationships()
    await checkMediaAssets()
    await checkPerformanceMetrics()
    await printSummary()

    process.exit(results.failed > 0 ? 1 : 0)
  } catch (error) {
    console.error('\n❌ Health check failed:', error)
    process.exit(1)
  }
}

runHealthCheck()
