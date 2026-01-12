import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const value = match[2].trim()
    envVars[key] = value
  }
})

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
)

async function checkStoriesColumns() {
  try {
    // Try to get the schema by attempting a select with no results
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .limit(0)

    if (error) {
      console.error('Error querying stories table:', error)
      return
    }

    console.log('✅ Stories table exists and is accessible')

    // Get a valid tenant_id first
    const { data: tenants } = await supabase
      .from('tenants')
      .select('id')
      .limit(1)
      .single()

    if (!tenants) {
      console.error('❌ No tenants found in database')
      return
    }

    console.log('✅ Found tenant:', tenants.id)
    console.log('\nNow attempting a minimal insert to see what columns are accepted...\n')

    // Try with all required NOT NULL fields
    const minimalStory = {
      title: 'Schema Test Story',
      content: 'This is test content.',
      storyteller_id: '494b6ec3-f944-46cc-91f4-216028b8389c',
      author_id: '494b6ec3-f944-46cc-91f4-216028b8389c',
      tenant_id: tenants.id
    }

    const { data: insertData, error: insertError } = await supabase
      .from('stories')
      .insert([minimalStory])
      .select()

    if (insertError) {
      console.error('❌ Minimal insert failed:', insertError)
    } else {
      console.log('✅ Minimal insert succeeded!')
      console.log('Created story:', insertData)

      // Clean up - delete the test story
      await supabase
        .from('stories')
        .delete()
        .eq('id', insertData[0].id)

      console.log('🧹 Test story deleted')
    }

  } catch (err) {
    console.error('Script error:', err)
  }
}

checkStoriesColumns()
