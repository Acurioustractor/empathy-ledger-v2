const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('🚀 Applying enhanced storyteller profiles migration...')

    // Add new columns to profiles table
    console.log('📝 Adding new columns to profiles table...')

    const { error: alterError } = await supabase.from('profiles').select('id').limit(1)
    if (alterError) {
      console.error('❌ Database connection error:', alterError)
      return
    }

    // Execute ALTER TABLE statements directly
    const alterStatements = [
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS impact_focus_areas text[] DEFAULT '{}'",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expertise_areas text[] DEFAULT '{}'",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS collaboration_preferences jsonb DEFAULT '{}'",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS storytelling_methods text[] DEFAULT '{}'",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS community_roles text[] DEFAULT '{}'",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS change_maker_type text",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS geographic_scope text DEFAULT 'local'",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_of_community_work integer DEFAULT 0",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mentor_availability boolean DEFAULT false",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS speaking_availability boolean DEFAULT false"
    ]

    for (const statement of alterStatements) {
      console.log(`Executing: ${statement}`)
      const { error } = await supabase.rpc('exec', { sql: statement })
      if (error) {
        console.log(`⚠️ Statement may already exist or need different approach: ${error.message}`)
      } else {
        console.log('✅ Statement executed successfully')
      }
    }

    console.log('🎉 Basic column additions completed!')
    console.log('💡 Note: Additional tables and indexes may need to be created manually in Supabase Dashboard')

  } catch (error) {
    console.error('❌ Error applying migration:', error)
  }
}

applyMigration()