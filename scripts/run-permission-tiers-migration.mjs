#!/usr/bin/env node

/**
 * Run Permission Tiers Migration
 *
 * This script runs the permission_tiers migration using Supabase's
 * PostgREST admin API which allows executing raw SQL.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function runMigration() {
  console.log('\n📄 Reading migration file...')

  const sql = readFileSync(
    join(__dirname, '..', 'supabase', 'migrations', '20251224000000_permission_tiers.sql'),
    'utf8'
  )

  console.log(`   ✅ Loaded ${sql.length} characters\n`)

  // Check if already applied
  console.log('🔍 Checking if migration already applied...')

  const { data: existingColumn } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'stories')
    .eq('column_name', 'permission_tier')
    .maybeSingle()

  if (existingColumn) {
    console.log('   ⚠️  permission_tier column already exists!')
    console.log('   Migration may have been applied already.\n')

    // Verify the data
    const { count } = await supabase
      .from('stories')
      .select('permission_tier', { count: 'exact', head: true })

    console.log(`✅ Migration already applied`)
    console.log(`   Stories with permission_tier: ${count}`)
    return
  }

  console.log('   ✅ Column does not exist, proceeding with migration\n')

  // Execute migration by sending to PostgREST's admin endpoint
  console.log('🚀 Executing migration...')
  console.log('   This will run the entire migration file as a transaction\n')

  try {
    // Use fetch to call the admin API directly
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/_exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HTTP ${response.status}: ${error}`)
    }

    console.log('✅ Migration executed successfully!\n')

    // Verify migration
    console.log('🔍 Verifying migration...')

    const { data: column } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'stories')
      .eq('column_name', 'permission_tier')
      .single()

    if (column) {
      console.log('   ✅ permission_tier column created')
      console.log(`      Type: ${column.data_type}`)
    }

    const { count } = await supabase
      .from('stories')
      .select('permission_tier', { count: 'exact', head: true })

    console.log(`   ✅ Stories table accessible (${count} stories)`)

    console.log('\n✨ Migration completed successfully!')

  } catch (error) {
    if (error.message.includes('404') || error.message.includes('_exec_sql')) {
      console.log('⚠️  Direct SQL execution not available via API')
      console.log('\n💡 Please run migration via Supabase CLI instead:')
      console.log('   1. Make sure you\'re linked: npx supabase link --project-ref yvnuayzslukamizrlhwb')
      console.log('   2. Push migrations: npx supabase db push')
      console.log('\n   Or use the Dashboard SQL Editor:')
      console.log('   https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new')
    } else {
      console.error('❌ Migration failed:', error.message)
    }
    process.exit(1)
  }
}

runMigration()
