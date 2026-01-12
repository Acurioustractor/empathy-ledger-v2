import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkSchema() {
  // Try to query the table structure via information_schema
  const { data, error } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'transcript_analysis_results'
        ORDER BY ordinal_position;
      `
    })
    .single()

  if (error) {
    console.log('RPC not available, trying direct query...')

    // Try a simple insert to see what columns are required
    const { error: testError } = await supabase
      .from('transcript_analysis_results')
      .insert({
        transcript_id: '00000000-0000-0000-0000-000000000000',
        analyzer_version: 'test',
        themes: []
      })

    console.log('Insert test error:', testError)
  } else {
    console.log('Schema:', data)
  }
}

checkSchema()
