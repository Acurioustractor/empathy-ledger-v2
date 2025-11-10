import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function checkCreationDates() {
  const supabase = createServiceRoleClient()
  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820'

  const { data } = await supabase
    .from('transcripts')
    .select('id, title, created_at, created_by, metadata, video_url, source_video_url')
    .eq('project_id', projectId)
    .is('word_count', null)
    .order('created_at', { ascending: false })
    .limit(10)

  console.log('Recently created empty transcripts:\n')
  data?.forEach(t => {
    console.log(`- ${t.title}`)
    console.log(`  Created: ${new Date(t.created_at).toLocaleString()}`)
    console.log(`  Created by: ${t.created_by || 'unknown'}`)
    console.log(`  video_url: ${t.video_url || 'none'}`)
    console.log(`  source_video_url: ${t.source_video_url || 'none'}`)
    console.log(`  Metadata: ${JSON.stringify(t.metadata)}`)
    console.log()
  })
}

checkCreationDates().catch(console.error)
