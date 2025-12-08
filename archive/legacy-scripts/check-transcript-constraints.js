const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  // Try to create a transcript without created_by to see what works
  const { error } = await supabase
    .from('transcripts')
    .insert({
      title: 'Test',
      text: 'This is a test transcript with enough text to pass validation',
      storyteller_id: 'd0a162d2-282e-4653-9d12-aa934c9dfa4e' // Dev admin
    })
    .select();

  console.log('Insert result:', error || 'Success');

  if (!error) {
    // Clean up
    await supabase.from('transcripts').delete().eq('title', 'Test');
  }
}

check();
