#!/usr/bin/env node
/**
 * Restore Stories from Archive to Live Database
 *
 * Migrates stories from the migration backup JSON to the live Supabase database.
 * This is needed for the Compendium sync to work, as vignettes reference these story IDs.
 *
 * Usage:
 *   node restore-archive-stories.mjs                      # Restore all stories
 *   node restore-archive-stories.mjs --dry-run            # Preview without writing
 *   node restore-archive-stories.mjs --ids uuid1,uuid2    # Restore specific stories
 *   node restore-archive-stories.mjs --vignettes-only     # Only stories linked to vignettes
 *
 * @requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load environment
const envContent = await fs.readFile(path.join(__dirname, '../.env.local'), 'utf-8')
const env = {}
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
}

// Supabase client
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

// Vignette-linked story IDs from descript-vignette-mapping.json
const VIGNETTE_STORY_IDS = [
  '7fe69429-8874-41e2-939a-ed6250720b5c', // 01-building-empathy-ledger
  '1a07fa32-19e7-43b5-8c53-185590147d17', // 02-orange-sky-origins
  'a81e3ee5-274d-403a-ad66-44484d1d8993', // 05-community-innovation-beds
  'd349a5ac-9ef5-469e-92f9-b197511da4f0', // 07-uncle-alan-palm-island
  '692e93fa-e581-4721-9b6e-4965799af0bb', // 16-community-recognition
  '5eb76939-e414-43f5-bf6a-57c8af736fd2', // 17-school-partnership
]

// Archive path
const ARCHIVE_PATH = path.join(__dirname, '../archive/migration-backup-2025-09-15T02-50-10-658Z.json')

/**
 * Load stories from archive
 */
async function loadArchiveStories() {
  console.log('Loading archive...')
  const content = await fs.readFile(ARCHIVE_PATH, 'utf-8')
  const archive = JSON.parse(content)
  return archive.tables.stories.data
}

/**
 * Check which stories already exist in database
 */
async function getExistingStoryIds(storyIds) {
  const { data, error } = await supabase
    .from('stories')
    .select('id')
    .in('id', storyIds)

  if (error) {
    console.error('Error checking existing stories:', error)
    return new Set()
  }

  return new Set(data.map(s => s.id))
}

/**
 * Prepare story for insertion (remove computed/problematic fields)
 */
function prepareStoryForInsert(story) {
  const prepared = { ...story }

  // Remove fields that might cause conflicts
  delete prepared.search_vector  // Computed field
  delete prepared.embedding      // Will be null anyway

  // Ensure required fields have defaults
  if (!prepared.status) prepared.status = 'draft'
  if (!prepared.community_status) prepared.community_status = 'draft'

  return prepared
}

/**
 * Insert a story into the database
 */
async function insertStory(story, dryRun = false) {
  const prepared = prepareStoryForInsert(story)

  if (dryRun) {
    console.log(`  [DRY RUN] Would insert: ${story.title?.slice(0, 50)}...`)
    return { success: true, dryRun: true }
  }

  const { data, error } = await supabase
    .from('stories')
    .insert(prepared)
    .select('id, title')
    .single()

  if (error) {
    // Check if it's a unique constraint violation (already exists)
    if (error.code === '23505') {
      return { success: true, skipped: true, reason: 'already exists' }
    }
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

/**
 * Main restore function
 */
async function restoreStories(options = {}) {
  const { dryRun = false, specificIds = null, vignettesOnly = false } = options

  console.log('═'.repeat(60))
  console.log('RESTORE ARCHIVE STORIES TO LIVE DATABASE')
  console.log('═'.repeat(60))
  console.log('')

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n')
  }

  // Load archive
  const allStories = await loadArchiveStories()
  console.log(`📦 Archive contains ${allStories.length} stories\n`)

  // Filter stories
  let storiesToRestore = allStories
  if (specificIds) {
    const idSet = new Set(specificIds)
    storiesToRestore = allStories.filter(s => idSet.has(s.id))
    console.log(`🎯 Filtering to ${storiesToRestore.length} specific stories\n`)
  } else if (vignettesOnly) {
    const idSet = new Set(VIGNETTE_STORY_IDS)
    storiesToRestore = allStories.filter(s => idSet.has(s.id))
    console.log(`🎯 Filtering to ${storiesToRestore.length} vignette-linked stories\n`)
  }

  if (storiesToRestore.length === 0) {
    console.log('❌ No stories to restore')
    return
  }

  // Check for existing stories
  const storyIds = storiesToRestore.map(s => s.id)
  const existingIds = await getExistingStoryIds(storyIds)
  console.log(`📊 ${existingIds.size} stories already exist in database\n`)

  // Results tracking
  const results = {
    restored: 0,
    skipped: 0,
    errors: [],
    dryRun: dryRun
  }

  // Process each story
  for (const story of storiesToRestore) {
    const shortTitle = story.title?.slice(0, 50) || 'Untitled'

    if (existingIds.has(story.id)) {
      console.log(`⏭️  Skip (exists): ${shortTitle}`)
      results.skipped++
      continue
    }

    const result = await insertStory(story, dryRun)

    if (result.success) {
      if (result.dryRun) {
        results.restored++
      } else if (result.skipped) {
        console.log(`⏭️  Skip (${result.reason}): ${shortTitle}`)
        results.skipped++
      } else {
        console.log(`✅ Restored: ${shortTitle}`)
        results.restored++
      }
    } else {
      console.log(`❌ Error: ${shortTitle} - ${result.error}`)
      results.errors.push({ id: story.id, title: shortTitle, error: result.error })
    }
  }

  // Summary
  console.log('')
  console.log('═'.repeat(60))
  console.log('SUMMARY')
  console.log('═'.repeat(60))
  console.log(`✅ Restored:  ${results.restored}`)
  console.log(`⏭️  Skipped:   ${results.skipped}`)
  console.log(`❌ Errors:    ${results.errors.length}`)
  console.log(`📊 Total:     ${storiesToRestore.length}`)

  if (results.errors.length > 0) {
    console.log('\nErrors:')
    for (const err of results.errors) {
      console.log(`  - ${err.title}: ${err.error}`)
    }
  }

  if (dryRun) {
    console.log('\n🔍 This was a dry run. Run without --dry-run to apply changes.')
  }

  return results
}

// Parse CLI arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const vignettesOnly = args.includes('--vignettes-only')

let specificIds = null
const idsIdx = args.indexOf('--ids')
if (idsIdx !== -1 && args[idsIdx + 1]) {
  specificIds = args[idsIdx + 1].split(',').map(s => s.trim())
}

// Run
restoreStories({ dryRun, specificIds, vignettesOnly })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
