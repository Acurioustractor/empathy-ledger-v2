import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function checkStorageFiles() {
  const supabase = createServiceRoleClient()
  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820'

  console.log('📦 Checking Supabase Storage for document files...\n')

  // Get transcripts with media_metadata
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, media_metadata')
    .eq('project_id', projectId)
    .is('word_count', null)
    .limit(5)

  console.log('Sample transcripts with storage info:\n')

  for (const t of transcripts || []) {
    console.log(`- ${t.title}`)
    console.log(`  Metadata:`, JSON.stringify(t.media_metadata, null, 2))

    if (t.media_metadata?.source_path) {
      console.log(`  Attempting to download from: ${t.media_metadata.bucket}/${t.media_metadata.source_path}`)

      // Try to download the file
      const { data: fileData, error } = await supabase
        .storage
        .from(t.media_metadata.bucket || 'documents')
        .download(t.media_metadata.source_path)

      if (error) {
        console.log(`  ❌ Error: ${error.message}`)
      } else if (fileData) {
        const text = await fileData.text()
        console.log(`  ✅ Found file! ${text.length} characters`)
        console.log(`  Preview: "${text.substring(0, 150)}..."`)
      }
    }
    console.log()
  }

  // List what's in the storage bucket
  console.log('\n\n📂 Listing files in documents bucket...\n')

  const { data: files, error: listError } = await supabase
    .storage
    .from('documents')
    .list('source-documents', {
      limit: 20,
      offset: 0,
    })

  if (listError) {
    console.log(`❌ Error listing files: ${listError.message}`)
  } else if (files) {
    console.log(`Found ${files.length} files:`)
    files.forEach(file => {
      console.log(`  - ${file.name} (${file.metadata?.size || 0} bytes)`)
    })
  }
}

checkStorageFiles().catch(console.error)
