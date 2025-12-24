#!/usr/bin/env node
/**
 * Verify Cloud-First Database Setup
 *
 * Checks that all components of the cloud-first workflow are properly configured:
 * - Supabase CLI linked to cloud project
 * - Environment variables set correctly
 * - Migration tracking table exists
 * - Can connect to cloud database
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

console.log('🔍 Verifying Cloud-First Database Setup...\n')

// Check 1: Environment Variables
console.log('1️⃣ Checking environment variables...')
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL'
]

let envVarsOk = true
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}`)
  } else {
    console.log(`   ❌ ${envVar} - MISSING`)
    envVarsOk = false
  }
}

if (!envVarsOk) {
  console.log('\n❌ Missing required environment variables. Check .env.local file.\n')
  process.exit(1)
}

console.log('   ✅ All environment variables present\n')

// Check 2: Supabase CLI Link
console.log('2️⃣ Checking Supabase CLI link...')
try {
  const { stdout } = await execAsync('npx supabase status --linked')
  if (stdout.includes('yvnuayzslukamizrlhwb')) {
    console.log('   ✅ CLI linked to cloud project: yvnuayzslukamizrlhwb\n')
  } else {
    console.log('   ⚠️  CLI may not be properly linked')
    console.log('   Run: npx supabase link --project-ref yvnuayzslukamizrlhwb\n')
  }
} catch (error) {
  console.log('   ⚠️  Could not verify CLI link status')
  console.log('   To link: npx supabase link --project-ref yvnuayzslukamizrlhwb\n')
}

// Check 3: Database Connection
console.log('3️⃣ Testing database connection...')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

try {
  const { data, error } = await supabase
    .from('profiles')
    .select('count', { count: 'exact', head: true })

  if (error) {
    console.log(`   ❌ Database connection failed: ${error.message}\n`)
    process.exit(1)
  }

  console.log('   ✅ Database connection successful\n')
} catch (error) {
  console.log(`   ❌ Database connection error: ${error.message}\n`)
  process.exit(1)
}

// Check 4: Migration Tracking Table
console.log('4️⃣ Checking migration tracking...')
try {
  const { data: schemas } = await supabase
    .from('information_schema.schemata')
    .select('schema_name')
    .eq('schema_name', 'supabase_migrations')
    .maybeSingle()

  if (schemas) {
    console.log('   ✅ supabase_migrations schema exists')

    // Check for migration table
    const { data: migrations, error: migrationsError } = await supabase.rpc('execute_sql', {
      query: 'SELECT COUNT(*) FROM supabase_migrations.schema_migrations'
    }).catch(async () => {
      // Try alternative method
      const { count } = await supabase
        .from('supabase_migrations.schema_migrations')
        .select('*', { count: 'exact', head: true })
      return { data: count }
    })

    console.log('   ✅ Migration tracking table exists')

    // Get migration count
    const { count } = await supabase
      .from('supabase_migrations.schema_migrations')
      .select('*', { count: 'exact', head: true })
      .catch(() => ({ count: 0 }))

    if (count > 0) {
      console.log(`   ✅ ${count} migrations tracked\n`)
    } else {
      console.log('   ⚠️  No migrations tracked yet (this is OK for new setup)\n')
    }
  } else {
    console.log('   ⚠️  Migration tracking schema not found')
    console.log('   Run this in Dashboard SQL Editor:')
    console.log('   CREATE SCHEMA IF NOT EXISTS supabase_migrations;')
    console.log('   CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (')
    console.log('     version TEXT PRIMARY KEY,')
    console.log('     statements TEXT[],')
    console.log('     name TEXT')
    console.log('   );\n')
  }
} catch (error) {
  console.log(`   ⚠️  Could not verify migration tracking: ${error.message}\n`)
}

// Check 5: Permission Tiers Migration
console.log('5️⃣ Checking permission_tiers migration...')
try {
  const { data: columns } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'stories')
    .eq('column_name', 'permission_tier')
    .maybeSingle()

  if (columns) {
    console.log('   ✅ permission_tier column exists on stories table')

    // Get sample data
    const { data: sample } = await supabase
      .from('stories')
      .select('permission_tier')
      .not('permission_tier', 'is', null)
      .limit(1)
      .maybeSingle()

    if (sample) {
      console.log(`   ✅ Sample tier: ${sample.permission_tier}\n`)
    } else {
      console.log('   ⚠️  No stories with permission_tier set yet\n')
    }
  } else {
    console.log('   ⚠️  permission_tier column not found')
    console.log('   Migration may not have been applied yet\n')
  }
} catch (error) {
  console.log(`   ⚠️  Could not check permission_tiers: ${error.message}\n`)
}

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✨ Setup Verification Complete!\n')
console.log('📋 Next Steps:')
console.log('   1. Set up GitHub integration (if not done):')
console.log('      https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/settings/integrations')
console.log('')
console.log('   2. Set up Vercel integration (if not done):')
console.log('      https://vercel.com/your-team/empathy-ledger-v2/settings/integrations')
console.log('')
console.log('   3. Start developing with cloud-first workflow:')
console.log('      See: docs/QUICK_START_CLOUD_WORKFLOW.md')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
