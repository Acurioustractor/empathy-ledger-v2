import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Checking existing data sources...\n');

// Check what tables exist
const tables = [
  'transcripts',
  'transcript_analysis_results',
  'stories',
  'storytellers',
  'projects',
  'organizations'
];

for (const table of tables) {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log(`❌ ${table}: ${error.message}`);
  } else {
    console.log(`✅ ${table}: ${count} records`);
  }
}

console.log('\n📊 Checking for analysis data specifically...\n');

// Check transcript_analysis_results structure
const { data: sampleAnalysis, error: analysisError } = await supabase
  .from('transcript_analysis_results')
  .select('*')
  .limit(1);

if (sampleAnalysis && sampleAnalysis.length > 0) {
  console.log('Sample analysis structure:');
  console.log(Object.keys(sampleAnalysis[0]));
} else {
  console.log('No transcript_analysis_results found');
}

// Check storytellers
const { count: storytellerCount } = await supabase
  .from('storytellers')
  .select('*', { count: 'exact', head: true });

console.log(`\n📊 Found ${storytellerCount} storytellers in database`);
