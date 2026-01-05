import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testQuery() {
  console.log('Testing stories query...\n')

  const { data, error, count } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      status,
      is_public,
      storyteller:storytellers!storyteller_id (
        id,
        display_name,
        avatar_url
      )
    `, { count: 'exact' })
    .eq('status', 'published')
    .eq('is_public', true)
    .limit(2)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`Found ${count} total stories`)
  console.log('\nSample stories:')
  console.log(JSON.stringify(data, null, 2))
}

testQuery().catch(console.error)
