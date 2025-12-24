#!/usr/bin/env node

/**
 * Deploy Migration Script
 * Reads a migration file and executes it on the cloud database
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get migration file from command line
const migrationFile = process.argv[2]
if (!migrationFile) {
  console.error('Usage: node scripts/deploy-migration.mjs <migration-file>')
  process.exit(1)
}

// Read environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

console.log(`📦 Deploying migration: ${migrationFile}`)
console.log(`🔗 Target: ${SUPABASE_URL}`)

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Read migration file
const migrationPath = join(dirname(__dirname), migrationFile)
const sql = readFileSync(migrationPath, 'utf-8')

console.log(`📄 Read ${sql.length} characters from ${migrationFile}`)

// Split into statements (basic splitting on semicolons, may need refinement)
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--') && s !== 'COMMENT ON SCHEMA public IS')

console.log(`📝 Found ${statements.length} SQL statements`)

// Execute each statement
let successCount = 0
let errorCount = 0

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i] + ';'

  // Skip comments
  if (statement.startsWith('--')) continue

  console.log(`\n[${i + 1}/${statements.length}] Executing...`)
  console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''))

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: statement
    })

    if (error) {
      // Try alternative: use raw SQL query
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({ sql_query: statement })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }

      console.log('✅ Success')
      successCount++
    } else {
      console.log('✅ Success')
      successCount++
    }
  } catch (error) {
    console.error(`❌ Error:`, error.message)
    errorCount++

    // Continue on error for now
    // Uncomment to stop on first error:
    // process.exit(1)
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`✨ Migration deployment complete`)
console.log(`✅ Success: ${successCount}`)
console.log(`❌ Errors: ${errorCount}`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

process.exit(errorCount > 0 ? 1 : 0)
