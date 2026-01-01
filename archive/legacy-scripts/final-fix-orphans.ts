#!/usr/bin/env tsx

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fix() {
  console.log('🔧 Final Fix for Orphaned Stories\n')

  // Get Independent Storytellers org
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('slug', 'independent-storytellers')
    .single()

  console.log(`Found organization: ${org?.name} (${org?.id})\n`)

  if (org) {
    // Fix orphaned stories
    const { data: fixed, error } = await supabase
      .from('stories')
      .update({ organization_id: org.id })
      .is('organization_id', null)
      .select('id, title')

    if (error) {
      console.error('Error:', error.message)
    } else {
      console.log(`✅ Fixed ${fixed?.length || 0} stories:\n`)
      fixed?.forEach((s, i) => console.log(`  ${i+1}. ${s.title}`))
    }

    // Verify
    const { data: remaining } = await supabase
      .from('stories')
      .select('id')
      .is('organization_id', null)

    const remainingCount = remaining?.length || 0
    console.log(`\n✅ Remaining orphans: ${remainingCount}`)

    if (remainingCount === 0) {
      console.log('\n🎉 All stories now have organization_id!')
    }
  }
}

fix()
