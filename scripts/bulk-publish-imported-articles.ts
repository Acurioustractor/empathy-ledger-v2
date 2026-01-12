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
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('articles')
    .update({
      status: 'published',
      visibility: 'public',
      syndication_enabled: true,
      published_at: now,
    })
    .eq('source_platform', 'webflow')
    .in('primary_project', ['act-main', 'justicehub'])
    .select('id, title, slug, primary_project');

  if (error) {
    console.error('Bulk publish failed:', error.message);
    process.exit(1);
  }

  console.log(`✅ Published ${data?.length || 0} imported articles`);
}

main().catch((error) => {
  console.error('Bulk publish failed:', error);
  process.exit(1);
});
