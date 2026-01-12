import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'
// @ts-expect-error pdf-parse has no TS types and default ESM build typing is missing
import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import mammoth from 'mammoth'

async function extractDocumentText() {
  const supabase = createServiceRoleClient()
  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820'

  console.log('📄 Extracting text from stored documents...\n')

  // Get all transcripts with storage paths but no text
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, media_metadata, text, transcript_content')
    .eq('project_id', projectId)
    .is('word_count', null)

  console.log(`Found ${transcripts?.length || 0} transcripts to process\n`)

  let successCount = 0
  let errorCount = 0

  for (const transcript of transcripts || []) {
    console.log(`\n📋 Processing: ${transcript.title}`)

    const metadata = transcript.media_metadata
    if (!metadata?.storage_path) {
      console.log('  ⚠️  No storage path found')
      continue
    }

    const storagePath = metadata.storage_path
    const fileType = metadata.file_type
    const bucket = metadata.bucket || 'documents'

    console.log(`  Path: ${bucket}/${storagePath}`)
    console.log(`  Type: ${fileType}`)

    try {
      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from(bucket)
        .download(storagePath)

      if (downloadError) {
        console.log(`  ❌ Download error: ${downloadError.message}`)
        errorCount++
        continue
      }

      if (!fileData) {
        console.log(`  ❌ No file data`)
        errorCount++
        continue
      }

      console.log(`  ✅ Downloaded ${fileData.size} bytes`)

      let extractedText = ''

      // Extract text based on file type
      if (fileType === 'application/pdf') {
        console.log('  🔍 Extracting PDF text...')
        const buffer = Buffer.from(await fileData.arrayBuffer())
        const pdfData = await pdfParse(buffer)
        extractedText = pdfData.text
      }
      else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        console.log('  🔍 Extracting Word doc text...')
        const buffer = Buffer.from(await fileData.arrayBuffer())
        const result = await mammoth.extractRawText({ buffer })
        extractedText = result.value
      }
      else if (fileType === 'text/plain') {
        extractedText = await fileData.text()
      }
      else {
        console.log(`  ⚠️  Unsupported file type: ${fileType}`)
        errorCount++
        continue
      }

      if (!extractedText || extractedText.trim().length === 0) {
        console.log(`  ⚠️  No text extracted`)
        errorCount++
        continue
      }

      // Calculate word and character counts
      const wordCount = extractedText.trim().split(/\s+/).length
      const characterCount = extractedText.length

      console.log(`  ✅ Extracted ${wordCount} words, ${characterCount} characters`)

      // Save to database
      const { error: updateError } = await supabase
        .from('transcripts')
        .update({
          transcript_content: extractedText,
          text: extractedText, // Also save to text field for compatibility
          word_count: wordCount,
          character_count: characterCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', transcript.id)

      if (updateError) {
        console.log(`  ❌ Database update error: ${updateError.message}`)
        errorCount++
      } else {
        console.log(`  💾 Saved to database`)
        successCount++
      }

    } catch (error) {
      console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      errorCount++
    }
  }

  console.log('\n\n' + '='.repeat(50))
  console.log('📊 SUMMARY')
  console.log('='.repeat(50))
  console.log(`✅ Successfully processed: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`📝 Total: ${transcripts?.length || 0}`)
  console.log('\n✨ Done!\n')
}

extractDocumentText().catch(console.error)
