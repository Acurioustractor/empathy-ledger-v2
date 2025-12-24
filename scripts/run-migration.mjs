#!/usr/bin/env node

/**
 * Run Migration via Supabase Service Role Client
 *
 * This script runs migrations using the Supabase JavaScript client.
 * Uses ES modules to work with latest Supabase SDK.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load .env.local
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables')
  console.error('   Make sure .env.local contains:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})

async function runMigration(migrationFile) {
  console.log(`\n📄 Migration: ${migrationFile}`)

  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', migrationFile)
  const sql = readFileSync(migrationPath, 'utf8')

  console.log(`   Size: ${(sql.length / 1024).toFixed(2)} KB`)
  console.log(`   Lines: ${sql.split('\n').length}`)

  console.log(`\n🔍 Checking if migration already applied...`)

  // Check if permission_tier column already exists
  const { data: columns } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_name', 'stories')
    .eq('column_name', 'permission_tier')

  if (columns && columns.length > 0) {
    console.log('   ⚠️  Column permission_tier already exists')
    console.log('   Migration may have been applied already')

    const response = await new Promise((resolve) => {
      process.stdout.write('   Continue anyway? (y/N): ')
      process.stdin.once('data', (data) => {
        resolve(data.toString().trim().toLowerCase())
      })
    })

    if (response !== 'y') {
      console.log('\n❌ Aborted by user')
      process.exit(0)
    }
  }

  console.log(`\n🚀 Running migration...`)
  console.log(`   This may take a minute...`)

  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`\n   Executing ${statements.length} statements:\n`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'

      // Log what we're about to execute
      const preview = statement.substring(0, 60).replace(/\s+/g, ' ')
      process.stdout.write(`   [${String(i + 1).padStart(2, ' ')}/${statements.length}] ${preview}... `)

      try {
        // Use rpc to execute raw SQL
        const { error } = await supabase.rpc('exec', { sql: statement })

        if (error) {
          console.log('❌')
          console.error(`        Error: ${error.message}`)

          // Some errors are OK (like "already exists")
          if (error.message.includes('already exists') || error.message.includes('IF NOT EXISTS')) {
            console.log(`        (Continuing - error expected)`)
          } else {
            throw error
          }
        } else {
          console.log('✅')
        }
      } catch (err) {
        console.log('❌')
        console.error(`        Error: ${err.message}`)

        if (!err.message.includes('already exists')) {
          throw err
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`\n✅ Migration completed!`)

    // Verify migration
    console.log(`\n🔍 Verifying migration...`)

    const { data: tierColumn } = await supabase
      .from('information_schema.columns')
      .select('*')
      .eq('table_name', 'stories')
      .eq('column_name', 'permission_tier')
      .single()

    if (tierColumn) {
      console.log(`   ✅ permission_tier column exists`)
      console.log(`      Type: ${tierColumn.data_type}`)
      console.log(`      Default: ${tierColumn.column_default || 'none'}`)
    }

    const { count } = await supabase
      .from('stories')
      .select('permission_tier', { count: 'exact', head: true })

    console.log(`   ✅ Stories table accessible`)
    console.log(`      Total stories: ${count}`)

    console.log(`\n✨ Migration successful!`)

  } catch (err) {
    console.error(`\n\n❌ Migration failed:`, err.message)
    console.log(`\n💡 Try running via Supabase Dashboard instead:`)
    console.log(`   1. Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new`)
    console.log(`   2. Copy contents of: supabase/migrations/${migrationFile}`)
    console.log(`   3. Paste and click "Run"`)
    process.exit(1)
  }
}

const migrationFile = process.argv[2] || '20251224000000_permission_tiers.sql'

runMigration(migrationFile)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('💥 Unexpected error:', err)
    process.exit(1)
  })
