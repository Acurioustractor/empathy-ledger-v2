import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function test() {
  const { data, error, count } = await supabase
    .from('media_assets')
    .select('*', { count: 'exact', head: true })

  console.log('Total media_assets:', count)
  
  const { data: sample } = await supabase
    .from('media_assets')
    .select('id, filename, file_path, file_type, story_id')
    .limit(5)
  
  console.log('\nFirst 5 records:', JSON.stringify(sample, null, 2))
}

test()
