const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking transcript table schema...\n');

  // Try to fetch one transcript to see the schema
  const { data, error } = await supabase
    .from('transcripts')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching transcript:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Transcript table columns:');
    console.log(Object.keys(data[0]).sort().join('\n'));
  } else {
    console.log('No transcripts found, trying to get schema differently...');

    // Try insert with minimal data to see what's required
    const { error: insertError } = await supabase
      .from('transcripts')
      .insert({
        title: 'test'
      })
      .select();

    console.log('Insert error (shows required fields):', insertError);
  }
}

checkSchema();
