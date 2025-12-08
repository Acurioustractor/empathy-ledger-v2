const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yvnuayzslukamizrlhwb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k'
);

async function checkKristy() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, bio')
    .eq('id', '197c6c02-da4f-43df-a376-f9242249c297')
    .single();

  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Profile found:', JSON.stringify(data, null, 2));
  }
}

checkKristy();
