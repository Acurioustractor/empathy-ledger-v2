import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251011_project_contexts.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('🚀 Applying migration...')
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }

    console.log('✅ Migration applied successfully!')
    console.log('📊 Result:', data)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

applyMigration()
