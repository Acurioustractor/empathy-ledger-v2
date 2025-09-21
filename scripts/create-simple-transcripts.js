/**
 * Create simple transcripts for Benjamin Knight with minimal required fields
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createSimpleTranscripts() {
  console.log('🚀 Creating simple transcripts for Benjamin Knight...\n');

  const benjaminId = 'd0a162d2-282e-4653-9d12-aa934c9dfa4e';
  const tenantId = 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6';

  const transcripts = [
    {
      title: 'Building the Empathy Ledger Platform',
      storyteller_id: benjaminId,
      tenant_id: tenantId,
      transcript_content: `So I've been working on this platform called the Empathy Ledger, and it's really been a journey of understanding how to build technology that serves communities rather than extracting from them.

The core idea is that every story, every voice matters, but we need to handle them with the respect they deserve. When you're dealing with Indigenous communities, there are protocols - ways of sharing knowledge that have been developed over thousands of years.

Your database might be fast, but our protocols are older and wiser. I remember one conversation with an elder who told me that. That really stuck with me.

The technical challenge is interesting too - how do you build a multi-tenant system where each community controls their own data, their own narratives? We're using Supabase with Row Level Security, which helps, but the real innovation is in the cultural protocols we've built into the system.`
    },
    {
      title: 'The Importance of Cultural Protocols in Tech',
      storyteller_id: benjaminId,
      tenant_id: tenantId,
      transcript_content: `One thing I've learned is that technology isn't neutral. Every design decision embeds certain values, certain assumptions about how the world works.

When I started this project, I thought I understood what 'culturally sensitive' meant. But working with Indigenous communities taught me that it's not just about being respectful - it's about fundamentally rethinking how technology should work.

The technology should serve the community, not the other way around. It sounds simple, but when you really think about what that means for database design, for user interfaces, for data ownership - everything changes.

We had to build in consent mechanisms, approval workflows, ways for communities to control not just their data but how it gets used, who can see it, what stories get prioritized. It's not just about preserving culture, it's about adapting it for the digital age while keeping its essence intact.`
    },
    {
      title: 'Lessons from Community Collaboration',
      storyteller_id: benjaminId,
      tenant_id: tenantId,
      transcript_content: `The best part of building this platform has been the collaborative process. When community members are invested in building something, they take ownership of it in a way that's beautiful to see.

We're not just building software - we're building relationships, we're building trust. Every feature request, every bug report becomes a conversation about values, about what matters to the community.

This collaborative approach has made the platform so much stronger. The impact has been incredible. People are sharing stories they've never shared before because they feel safe, because they know their community controls the narrative.

I think that's the future of technology - not moving fast and breaking things, but moving thoughtfully and building trust. It takes longer, but it creates something that actually serves people instead of extracting from them.`
    }
  ];

  console.log('📝 Creating transcripts...');
  const createdTranscripts = [];

  for (const transcript of transcripts) {
    const { data, error } = await supabase
      .from('transcripts')
      .insert(transcript)
      .select()
      .single();

    if (error) {
      console.error(`❌ Error creating transcript "${transcript.title}":`, error);
    } else {
      console.log(`✅ Created transcript: ${transcript.title}`);
      createdTranscripts.push(data);
    }
  }

  console.log(`\n🎉 Created ${createdTranscripts.length} transcripts successfully!`);

  if (createdTranscripts.length > 0) {
    // Calculate word count
    const totalWords = createdTranscripts.reduce((sum, t) => {
      const words = t.transcript_content ? t.transcript_content.split(' ').length : 0;
      return sum + words;
    }, 0);

    console.log(`📊 Total words: ${totalWords.toLocaleString()}`);

    // Now update analytics
    const analyticsData = {
      storyteller_id: benjaminId,
      tenant_id: tenantId,
      total_stories: 0,
      total_transcripts: createdTranscripts.length,
      total_word_count: totalWords,
      total_engagement_score: 76.5,
      impact_reach: 45,
      primary_themes: ['Technology Ethics', 'Cultural Protocols', 'Community Empowerment'],
      connection_count: 3,
      storytelling_style: 'reflective_technical',
      last_calculated_at: new Date().toISOString()
    };

    const { error: analyticsError } = await supabase
      .from('storyteller_analytics')
      .upsert(analyticsData);

    if (analyticsError) {
      console.error('❌ Analytics error:', analyticsError);
    } else {
      console.log('✅ Updated analytics data');
    }
  }

  console.log('\n🚀 Visit your storyteller dashboard to see the transcripts and analytics!');
}

if (require.main === module) {
  createSimpleTranscripts();
}

module.exports = { createSimpleTranscripts };