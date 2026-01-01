import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function runMigration() {
  console.log('📦 Running project_analyses cache table migration...')

  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20251010_project_analysis_cache.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

    if (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }

    console.log('✅ Migration completed successfully!')
    console.log('📊 Table project_analyses created with caching support')
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

runMigration()
