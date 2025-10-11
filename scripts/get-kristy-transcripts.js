const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const KRISTY_ID = 'b59a1f4c-94fd-4805-a2c5-cac0922133e0';

async function getTranscripts() {
  const { data: transcripts, error } = await supabase
    .from('transcripts')
    .select('id, title, text, ai_summary, themes')
    .eq('storyteller_id', KRISTY_ID)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  for (const t of transcripts) {
    console.log('\n━'.repeat(40));
    console.log(`Title: ${t.title}`);
    console.log(`ID: ${t.id}`);
    console.log(`Has Summary: ${!!t.ai_summary}`);
    console.log(`Has Themes: ${!!t.themes}`);
    console.log(`Text Length: ${t.text?.length || 0} chars`);
    console.log(`Text Preview: ${t.text?.substring(0, 200)}...`);
  }
}

getTranscripts().catch(console.error);
