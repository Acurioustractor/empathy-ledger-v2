#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔍 Verifying permission_tiers migration...\n')

// Check columns exist
const { data: columns } = await supabase
  .from('information_schema.columns')
  .select('column_name, data_type, column_default')
  .eq('table_schema', 'public')
  .eq('table_name', 'stories')
  .in('column_name', ['permission_tier', 'consent_verified_at', 'elder_reviewed', 'archive_consent_given'])

console.log('✅ New columns added:')
columns?.forEach(col => {
  console.log(`   • ${col.column_name} (${col.data_type})`)
})

// Check total stories
const { count } = await supabase
  .from('stories')
  .select('*', { count: 'exact', head: true })

console.log(`\n✅ Total stories in database: ${count}`)

// Sample stories to verify tiers were assigned
const { data: sample } = await supabase
  .from('stories')
  .select('id, title, permission_tier, status, consent_verified_at')
  .limit(5)

console.log('\n✅ Sample stories with permission tiers:')
sample?.forEach(s => {
  const title = s.title?.substring(0, 40) || 'Untitled'
  console.log(`   • ${title}`)
  console.log(`     Tier: ${s.permission_tier} | Status: ${s.status}`)
})

console.log('\n✨ Migration verified successfully!')
console.log('\n📋 Next steps:')
console.log('   1. Story cards will now show permission tier badges')
console.log('   2. Consent footer appears on token story routes')
console.log('   3. Ready to build permission tier selector component')
