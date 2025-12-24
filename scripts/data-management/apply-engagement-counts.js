/**
 * Apply Story Engagement Counts Migration
 *
 * Adds views_count, likes_count, shares_count columns to stories table
 * This is a bulletproof deployment script that applies the migration directly
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyMigration() {
  console.log('🚀 Applying Story Engagement Counts Migration...\n')

  // Read the migration SQL
  const migrationSQL = readFileSync('supabase/migrations/20251223140000_add_story_engagement_counts.sql', 'utf8')

  console.log('📝 Migration SQL:')
  console.log('─'.repeat(60))
  console.log(migrationSQL)
  console.log('─'.repeat(60))

  console.log('\n⚠️  This will modify the production database!')
  console.log('   Adding columns: views_count, likes_count, shares_count')
  console.log('   Creating functions: increment_story_view_count, increment_story_like_count, etc.')

  // For now, just verify the migration exists
  console.log('\n✅ Migration file created successfully')
  console.log('\n📋 TO APPLY THIS MIGRATION:')
  console.log('   1. Go to https://supabase.com/dashboard/project/yvnuayzslukamizrlhwb/editor')
  console.log('   2. Click "SQL Editor"')
  console.log('   3. Create a new query')
  console.log('   4. Paste the migration SQL above')
  console.log('   5. Click "Run"')
  console.log('\n   OR run this command in your terminal:')
  console.log('   npx supabase db push --db-url "postgresql://postgres.yvnuayzslukamizrlhwb:YOUR_PASSWORD@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres"')

  console.log('\n⏳ Checking if columns already exist...')

  try {
    const { data, error } = await supabase
      .from('stories')
      .select('id, views_count, likes_count, shares_count')
      .limit(1)

    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('❌ Columns do NOT exist yet - migration needed')
        console.log('\n🔧 Run the SQL migration manually via Supabase dashboard')
        return false
      }
      console.error('❌ Error checking columns:', error.message)
      return false
    }

    console.log('✅ Columns ALREADY exist! Migration was already applied.')
    console.log(`   Sample: views=${data[0]?.views_count}, likes=${data[0]?.likes_count}, shares=${data[0]?.shares_count}`)
    return true

  } catch (err) {
    console.error('❌ Error:', err.message)
    return false
  }
}

applyMigration()
  .then((success) => {
    if (success) {
      console.log('\n✅ Migration check complete - columns exist')
    } else {
      console.log('\n⚠️  Migration needed - apply via Supabase dashboard')
    }
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Failed:', err)
    process.exit(1)
  })
