import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'
// @ts-ignore
const pdfParse = require('pdf-parse')

async function extractPDFs() {
  const supabase = createServiceRoleClient()
  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820'

  console.log('📄 Extracting text from PDF documents...\n')

  // Get transcripts with PDF files
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, media_metadata')
    .eq('project_id', projectId)

  // Filter for PDFs that might not have content yet
  const pdfTranscripts = transcripts?.filter(t =>
    t.media_metadata?.file_type === 'application/pdf'
  ) || []

  console.log(`Found ${pdfTranscripts.length} PDF documents\n`)

  for (const transcript of pdfTranscripts) {
    console.log(`\n📋 Processing: ${transcript.title}`)

    const metadata = transcript.media_metadata
    const storagePath = metadata.storage_path
    const bucket = metadata.bucket || 'documents'

    console.log(`  Path: ${bucket}/${storagePath}`)

    try {
      // Download file
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from(bucket)
        .download(storagePath)

      if (downloadError || !fileData) {
        console.log(`  ❌ Download failed: ${downloadError?.message}`)
        continue
      }

      console.log(`  ✅ Downloaded ${fileData.size} bytes`)
      console.log('  🔍 Extracting PDF text...')

      const buffer = Buffer.from(await fileData.arrayBuffer())
      const pdfData = await pdfParse(buffer)
      const extractedText = pdfData.text

      if (!extractedText || extractedText.trim().length === 0) {
        console.log(`  ⚠️  No text extracted`)
        continue
      }

      const wordCount = extractedText.trim().split(/\s+/).length
      const characterCount = extractedText.length

      console.log(`  ✅ Extracted ${wordCount} words, ${characterCount} characters`)

      // Save to database
      const { error: updateError } = await supabase
        .from('transcripts')
        .update({
          transcript_content: extractedText,
          text: extractedText,
          word_count: wordCount,
          character_count: characterCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', transcript.id)

      if (updateError) {
        console.log(`  ❌ Database update error: ${updateError.message}`)
      } else {
        console.log(`  💾 Saved to database`)
      }

    } catch (error) {
      console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  console.log('\n✨ Done!\n')
}

extractPDFs().catch(console.error)
