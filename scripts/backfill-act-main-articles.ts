import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase service credentials (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from('articles')
    .update({
      primary_project: 'act-main',
      related_projects: ['act-main'],
    })
    .is('primary_project', null)
    .eq('source_platform', 'webflow')
    .select('id, title, slug');

  if (error) {
    console.error('Backfill failed:', error.message);
    process.exit(1);
  }

  console.log(`✅ Backfilled ${data?.length || 0} ACT main articles`);
}

main().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
