import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function checkSchema() {
  console.log('Checking database schema...\n');

  // Check transcript_analysis_results columns
  const { data: tarData, error: tarError } = await supabase
    .from('transcript_analysis_results')
    .select('*')
    .limit(1);

  if (tarError) {
    console.log('TAR error:', tarError.message);
  } else {
    console.log('transcript_analysis_results columns:');
    console.log(Object.keys(tarData?.[0] || {}).join(', '));
  }

  console.log('');

  // Check storytellers columns
  const { data: stData, error: stError } = await supabase
    .from('storytellers')
    .select('*')
    .limit(1);

  if (stError) {
    console.log('Storytellers error:', stError.message);
  } else {
    console.log('storytellers columns:');
    console.log(Object.keys(stData?.[0] || {}).join(', '));
  }

  console.log('');

  // Check storyteller_organizations columns
  const { data: soData, error: soError } = await supabase
    .from('storyteller_organizations')
    .select('*')
    .limit(1);

  if (soError) {
    console.log('storyteller_organizations error:', soError.message);
  } else {
    console.log('storyteller_organizations columns:');
    console.log(Object.keys(soData?.[0] || {}).join(', '));
  }

  console.log('');

  // Check transcripts columns
  const { data: trData, error: trError } = await supabase
    .from('transcripts')
    .select('*')
    .limit(1);

  if (trError) {
    console.log('transcripts error:', trError.message);
  } else {
    console.log('transcripts columns:');
    console.log(Object.keys(trData?.[0] || {}).join(', '));
  }
}

checkSchema();
