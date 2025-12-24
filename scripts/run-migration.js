#!/usr/bin/env node

/**
 * Run Migration via Supabase Service Role Client
 *
 * This script runs migrations using the Supabase JavaScript client,
 * which is more reliable than psql for remote connections.
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!SUPABASE_URL)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!SUPABASE_SERVICE_KEY)
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration(migrationFile) {
  console.log(`\n📄 Reading migration: ${migrationFile}`)

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(migrationPath, 'utf8')

  console.log(`\n🚀 Running migration via Supabase client...`)
  console.log(`   Migration size: ${sql.length} characters`)
  console.log(`   Lines: ${sql.split('\n').length}`)

  try {
    // Execute SQL via RPC call
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql })

    if (error) {
      // If exec_sql function doesn't exist, we need to use a different approach
      if (error.message.includes('function') || error.code === '42883') {
        console.log('\n⚠️  exec_sql function not available')
        console.log('   Attempting direct query execution...')

        // Try breaking into individual statements
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'))

        console.log(`   Found ${statements.length} statements to execute\n`)

        let successCount = 0
        let errorCount = 0

        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i]
          console.log(`   [${i + 1}/${statements.length}] Executing...`)

          try {
            const { error: stmtError } = await supabase.rpc('query', {
              sql: statement + ';'
            })

            if (stmtError) {
              // Try as a direct query if RPC doesn't work
              console.log(`   ⚠️  RPC failed, trying alternative method...`)
              console.error(`   Error: ${stmtError.message}`)
              errorCount++
            } else {
              console.log(`   ✅ Statement ${i + 1} executed`)
              successCount++
            }
          } catch (err) {
            console.error(`   ❌ Error on statement ${i + 1}:`, err.message)
            errorCount++
          }
        }

        console.log(`\n📊 Summary:`)
        console.log(`   ✅ Successful: ${successCount}`)
        console.log(`   ❌ Failed: ${errorCount}`)

        if (errorCount > 0) {
          console.log('\n⚠️  Some statements failed. You may need to run the migration via Supabase Dashboard SQL Editor.')
          console.log('   Dashboard: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new')
        }
      } else {
        throw error
      }
    } else {
      console.log('\n✅ Migration completed successfully!')
      if (data) {
        console.log('   Result:', data)
      }
    }
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message)
    console.log('\n💡 Alternative: Run migration via Supabase Dashboard')
    console.log('   1. Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/sql/new')
    console.log('   2. Copy contents of:', migrationPath)
    console.log('   3. Paste into SQL Editor')
    console.log('   4. Click "Run"')
    process.exit(1)
  }
}

// Get migration file from command line or use default
const migrationFile = process.argv[2] || '20251224000000_permission_tiers.sql'

runMigration(migrationFile)
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n💥 Unexpected error:', err)
    process.exit(1)
  })
