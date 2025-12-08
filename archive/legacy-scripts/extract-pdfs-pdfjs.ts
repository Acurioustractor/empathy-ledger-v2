import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs'

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  const loadingTask = pdfjsLib.getDocument(buffer)
  const pdf = await loadingTask.promise

  let fullText = ''

  // Extract text from each page
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map((item: any) => item.str).join(' ')
    fullText += pageText + '\n\n'
  }

  return fullText.trim()
}

async function extractPDFs() {
  const supabase = createServiceRoleClient()
  const projectId = 'd10daf41-02ae-45e4-9e9b-1c96e56ee820'

  console.log('📄 Extracting text from PDF documents using pdfjs-dist...\n')

  // Get transcripts with PDF files
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, media_metadata')
    .eq('project_id', projectId)

  // Filter for PDFs
  const pdfTranscripts = transcripts?.filter(t =>
    t.media_metadata?.file_type === 'application/pdf'
  ) || []

  console.log(`Found ${pdfTranscripts.length} PDF documents\n`)

  let successCount = 0
  let errorCount = 0

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
        errorCount++
        continue
      }

      console.log(`  ✅ Downloaded ${fileData.size} bytes`)
      console.log('  🔍 Extracting PDF text...')

      const arrayBuffer = await fileData.arrayBuffer()
      const extractedText = await extractTextFromPDF(arrayBuffer)

      if (!extractedText || extractedText.trim().length === 0) {
        console.log(`  ⚠️  No text extracted`)
        errorCount++
        continue
      }

      const wordCount = extractedText.trim().split(/\s+/).length
      const characterCount = extractedText.length

      console.log(`  ✅ Extracted ${wordCount} words, ${characterCount} characters`)
      console.log(`  Preview: "${extractedText.substring(0, 100)}..."`)

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
  console.log('\n✨ Done!\n')
}

extractPDFs().catch(console.error)
