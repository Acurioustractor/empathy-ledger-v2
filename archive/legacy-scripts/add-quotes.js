const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addQuotes() {
  const benjaminId = 'd0a162d2-282e-4653-9d12-aa934c9dfa4e';
  const tenantId = 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6';

  // Get the transcript IDs
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title')
    .eq('storyteller_id', benjaminId);

  if (!transcripts || transcripts.length === 0) {
    console.error('No transcripts found');
    return;
  }

  console.log('Found transcripts:', transcripts.map(t => t.title));

  const quotes = [
    {
      storyteller_id: benjaminId,
      tenant_id: tenantId,
      source_id: transcripts[0].id,
      source_type: 'transcript',
      source_title: transcripts[0].title,
      quote_text: 'Your database might be fast, but our protocols are older and wiser.',
      emotional_impact_score: 0.92,
      wisdom_score: 0.95,
      quotability_score: 0.88,
      inspiration_score: 0.85,
      themes: ['Elder Wisdom', 'Cultural Protocols'],
      quote_category: 'wisdom'
    },
    {
      storyteller_id: benjaminId,
      tenant_id: tenantId,
      source_id: transcripts[1].id,
      source_type: 'transcript',
      source_title: transcripts[1].title,
      quote_text: 'The technology should serve the community, not the other way around.',
      emotional_impact_score: 0.85,
      wisdom_score: 0.88,
      quotability_score: 0.92,
      inspiration_score: 0.90,
      themes: ['Technology Ethics', 'Community Empowerment'],
      quote_category: 'inspiration'
    }
  ];

  console.log('Adding quotes...');
  for (const quote of quotes) {
    const { error } = await supabase
      .from('storyteller_quotes')
      .insert(quote);

    if (error && !error.message.includes('duplicate')) {
      console.error('Quote error:', error.message);
    } else {
      console.log('✅ Added quote:', quote.quote_text.substring(0, 50) + '...');
    }
  }

  console.log('\n🎉 Quotes added! Your analytics should now be more engaging.');
}

if (require.main === module) {
  addQuotes();
}

module.exports = { addQuotes };