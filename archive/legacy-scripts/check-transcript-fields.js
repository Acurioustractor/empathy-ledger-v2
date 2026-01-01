const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function checkTranscriptFields() {
  const { data, error } = await supabase
    .from('transcripts')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.log('Error:', error.message);
    return;
  }

  console.log('Transcript table fields:');
  console.log('='.repeat(60));

  const fields = Object.keys(data).sort();

  // Look for text content fields
  const textFields = fields.filter(f =>
    f.includes('text') ||
    f.includes('content') ||
    f.includes('transcript') ||
    f.includes('body')
  );

  console.log('\nText-related fields:');
  textFields.forEach(f => {
    const value = data[f];
    const preview = typeof value === 'string' ?
      value.substring(0, 50) + (value.length > 50 ? '...' : '') :
      typeof value;
    console.log(`  ✅ ${f}: ${preview}`);
  });

  console.log('\nAll fields:');
  fields.forEach(f => console.log(`  - ${f}`));
}

checkTranscriptFields();
