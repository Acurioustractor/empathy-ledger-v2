import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function checkMediaUploads() {
  const supabase = createServiceRoleClient()

  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820'

  console.log('📁 Checking for uploaded document files...\n')

  // Get the organization for this project
  const { data: project } = await supabase
    .from('projects')
    .select('organization_id, name')
    .eq('id', projectId)
    .single()

  console.log('Project:', project?.name)
  console.log('Organization ID:', project?.organization_id)
  console.log()

  // Check for any media assets related to this organization
  const { data: mediaAssets } = await supabase
    .from('media_assets')
    .select('*')
    .eq('organization_id', project?.organization_id)
    .order('created_at', { ascending: false })

  console.log(`Total media assets: ${mediaAssets?.length || 0}`)

  // Filter for documents (PDFs, Word docs, etc.)
  const documents = mediaAssets?.filter(m =>
    m.asset_type === 'document' ||
    m.mime_type?.includes('pdf') ||
    m.mime_type?.includes('word') ||
    m.mime_type?.includes('doc') ||
    m.file_path?.match(/\.(pdf|docx?|txt)$/i)
  ) || []

  console.log(`Document files: ${documents.length}\n`)

  if (documents.length > 0) {
    console.log('Recent document uploads:')
    documents.slice(0, 10).forEach(doc => {
      console.log(`\n- ${doc.title || doc.file_name || 'Untitled'}`)
      console.log(`  Type: ${doc.asset_type}`)
      console.log(`  MIME: ${doc.mime_type}`)
      console.log(`  File: ${doc.file_path || doc.cdn_url}`)
      console.log(`  Created: ${new Date(doc.created_at).toLocaleDateString()}`)
      console.log(`  Transcript ID: ${doc.transcript_id || 'none'}`)
      console.log(`  Story ID: ${doc.story_id || 'none'}`)
    })
  }

  // Check for unlinked transcripts (titles matching document names)
  console.log('\n\n🔍 Checking for title matches...\n')

  const { data: emptyTranscripts } = await supabase
    .from('transcripts')
    .select('id, title')
    .eq('project_id', projectId)
    .is('word_count', null)

  const titleMatches = emptyTranscripts?.map(t => {
    const matchingMedia = mediaAssets?.find(m =>
      m.title?.toLowerCase().includes(t.title.toLowerCase()) ||
      t.title.toLowerCase().includes(m.title?.toLowerCase() || '') ||
      m.file_name?.toLowerCase().includes(t.title.toLowerCase()) ||
      t.title.toLowerCase().includes(m.file_name?.toLowerCase() || '')
    )
    return {
      transcript: t,
      media: matchingMedia
    }
  }).filter(m => m.media) || []

  if (titleMatches.length > 0) {
    console.log('Found potential matches:')
    titleMatches.forEach(match => {
      console.log(`\n✓ "${match.transcript.title}"`)
      console.log(`  → Matches media: ${match.media?.title || match.media?.file_name}`)
      console.log(`  → File: ${match.media?.file_path}`)
    })
  } else {
    console.log('No obvious title matches found')
  }
}

checkMediaUploads().catch(console.error)
