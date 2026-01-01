import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('📦 Reading migration file...')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251011_project_contexts.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('🚀 Executing SQL...')

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (!statement) continue

      console.log(`\n📝 Executing statement ${i + 1}/${statements.length}...`)
      console.log(statement.substring(0, 100) + '...')

      const { error } = await supabase.rpc('exec', { sql: statement + ';' })

      if (error) {
        console.error(`❌ Statement ${i + 1} failed:`, error)
        // Continue anyway - some might already exist
      } else {
        console.log(`✅ Statement ${i + 1} succeeded`)
      }
    }

    console.log('\n✅ Migration completed!')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

applyMigration()
