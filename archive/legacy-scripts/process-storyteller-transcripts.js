const { TranscriptProcessingPipeline } = require('./src/lib/workflows/transcript-processing-pipeline.ts');

const transcripts = [
  { name: 'Adelaide Hayes', transcriptId: '04f7f1dd-8741-4925-8b1e-01ff7351552a' },
  { name: 'Aidan Harris', transcriptId: '1471c798-8145-4d1a-99a8-d6d94bf4904c' },
  { name: 'Chelsea Kenneally', transcriptId: '93f7914e-5af8-40c9-bffd-1fdad2b9f123' },
  { name: 'Suzie Ma', transcriptId: 'e7253b30-263e-42b9-951a-5355e8b19070' }
];

async function processAll() {
  const pipeline = new TranscriptProcessingPipeline(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  for (const { name, transcriptId } of transcripts) {
    console.log(`\n🔄 Processing transcript for ${name}...`);
    try {
      const result = await pipeline.processTranscript(transcriptId);
      console.log(`✅ ${name} - Success!`);
      console.log(`   Insights: ${result.insightsExtracted}`);
      console.log(`   Impact Types: ${result.impactTypes.join(', ')}`);
      console.log(`   Time: ${result.processingTimeMs}ms`);
    } catch (error) {
      console.error(`❌ ${name} - Error:`, error.message);
    }
  }
}

processAll().catch(console.error);
