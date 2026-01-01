const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251011_project_contexts.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('🚀 Applying migration via Supabase...\n')

    // Use Supabase's raw SQL execution
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sql
    })

    if (error) {
      console.error('❌ Error applying migration:', error)

      // If the RPC function doesn't exist, we need to use alternative approach
      if (error.code === 'PGRST202' || error.code === '42883') {
        console.log('\n⚠️  exec_sql RPC function not available')
        console.log('💡 Please apply the migration manually via Supabase Dashboard:')
        console.log('   1. Go to: https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/editor')
        console.log('   2. Click "SQL Editor"')
        console.log('   3. Paste the contents of: supabase/migrations/20251011_project_contexts.sql')
        console.log('   4. Click "Run"')
        process.exit(1)
      }

      process.exit(1)
    }

    console.log('✅ Migration applied successfully!')
    console.log('📊 Result:', data)

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

applyMigration()
