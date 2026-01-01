/**
 * Check if seed interview tables exist in remote database
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkTables() {
  console.log('🔍 Checking for seed interview tables...\n')

  try {
    // Try to query each table
    const tables = ['project_seed_interviews', 'project_profiles', 'project_analyses']

    for (const tableName of tables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1)

      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ ${tableName} - Does NOT exist`)
        } else {
          console.log(`⚠️  ${tableName} - Error: ${error.message}`)
        }
      } else {
        console.log(`✅ ${tableName} - EXISTS (${data?.length || 0} rows sampled)`)
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

checkTables()
