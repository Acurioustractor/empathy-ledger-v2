/**
 * Setup Benjamin Knight as storyteller with correct column names
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBenjaminStoryteller() {
  console.log('🚀 Setting up Benjamin Knight as storyteller with correct schema...\n');

  const benjaminId = 'd0a162d2-282e-4653-9d12-aa934c9dfa4e';
  const tenantId = 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6';

  try {
    // Sample transcripts with correct column names
    const sampleTranscripts = [
      {
        title: 'Building the Empathy Ledger Platform',
        transcript_text: `So I've been working on this platform called the Empathy Ledger, and it's really been a journey of understanding how to build technology that serves communities rather than extracting from them.

The core idea is that every story, every voice matters, but we need to handle them with the respect they deserve. When you're dealing with Indigenous communities, there are protocols - ways of sharing knowledge that have been developed over thousands of years.

Your database might be fast, but our protocols are older and wiser. I remember one conversation with an elder who told me that. That really stuck with me.

The technical challenge is interesting too - how do you build a multi-tenant system where each community controls their own data, their own narratives? We're using Supabase with Row Level Security, which helps, but the real innovation is in the cultural protocols we've built into the system.`,
        description: 'Reflections on building culturally sensitive technology platforms',
        storyteller_id: benjaminId,
        tenant_id: tenantId,
        status: 'completed',
        is_transcribed: true,
        language: 'English',
        cultural_sensitivity_level: 'high',
        cultural_context: {
          themes: ['Technology Ethics', 'Cultural Protocols', 'Platform Development'],
          cultural_elements: ['Elder Wisdom', 'Traditional Knowledge Systems']
        }
      },
      {
        title: 'The Importance of Cultural Protocols in Tech',
        transcript_text: `One thing I've learned is that technology isn't neutral. Every design decision embeds certain values, certain assumptions about how the world works.

When I started this project, I thought I understood what 'culturally sensitive' meant. But working with Indigenous communities taught me that it's not just about being respectful - it's about fundamentally rethinking how technology should work.

The technology should serve the community, not the other way around. It sounds simple, but when you really think about what that means for database design, for user interfaces, for data ownership - everything changes.

We had to build in consent mechanisms, approval workflows, ways for communities to control not just their data but how it gets used, who can see it, what stories get prioritized. It's not just about preserving culture, it's about adapting it for the digital age while keeping its essence intact.`,
        description: 'Exploring the intersection of cultural values and technology design',
        storyteller_id: benjaminId,
        tenant_id: tenantId,
        status: 'completed',
        is_transcribed: true,
        language: 'English',
        cultural_sensitivity_level: 'high',
        cultural_context: {
          themes: ['Technology Ethics', 'Community Empowerment', 'Cultural Adaptation'],
          cultural_elements: ['Consent Protocols', 'Data Sovereignty']
        }
      },
      {
        title: 'Lessons from Community Collaboration',
        transcript_text: `The best part of building this platform has been the collaborative process. When community members are invested in building something, they take ownership of it in a way that's beautiful to see.

We're not just building software - we're building relationships, we're building trust. Every feature request, every bug report becomes a conversation about values, about what matters to the community.

This collaborative approach has made the platform so much stronger. The impact has been incredible. People are sharing stories they've never shared before because they feel safe, because they know their community controls the narrative.

I think that's the future of technology - not moving fast and breaking things, but moving thoughtfully and building trust. It takes longer, but it creates something that actually serves people instead of extracting from them.`,
        description: 'Reflections on collaborative technology development with communities',
        storyteller_id: benjaminId,
        tenant_id: tenantId,
        status: 'completed',
        is_transcribed: true,
        language: 'English',
        cultural_sensitivity_level: 'medium',
        cultural_context: {
          themes: ['Collaborative Development', 'Community Ownership', 'Trust Building'],
          cultural_elements: ['Participatory Design', 'Community Control']
        }
      }
    ];

    console.log('📝 Creating transcripts...');
    const createdTranscripts = [];

    for (const transcript of sampleTranscripts) {
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

    if (createdTranscripts.length === 0) {
      console.error('❌ No transcripts were created successfully');
      return;
    }

    console.log(`\n📊 Created ${createdTranscripts.length} transcripts. Now generating analytics...`);

    // Calculate total word count
    const totalWordCount = createdTranscripts.reduce((sum, t) => {
      const wordCount = t.transcript_text ? t.transcript_text.split(' ').length : 0;
      return sum + wordCount;
    }, 0);

    // Create or update storyteller analytics
    const analyticsData = {
      storyteller_id: benjaminId,
      tenant_id: tenantId,
      total_stories: 0, // No stories yet, just transcripts
      total_transcripts: createdTranscripts.length,
      total_word_count: totalWordCount,
      total_engagement_score: 76.5,
      impact_reach: 45,
      primary_themes: ['Technology Ethics', 'Cultural Protocols', 'Community Empowerment', 'Collaborative Development'],
      connection_count: 3,
      storytelling_style: 'reflective_technical',
      last_calculated_at: new Date().toISOString()
    };

    const { error: analyticsError } = await supabase
      .from('storyteller_analytics')
      .upsert(analyticsData);

    if (analyticsError) {
      console.error('❌ Error creating analytics:', analyticsError);
    } else {
      console.log('✅ Created storyteller analytics');
    }

    // Create powerful quotes with proper source_id
    console.log('\n💬 Adding powerful quotes...');
    const powerfulQuotes = [
      {
        storyteller_id: benjaminId,
        tenant_id: tenantId,
        source_id: createdTranscripts[0].id, // Use actual transcript ID
        source_type: 'transcript',
        source_title: createdTranscripts[0].title,
        quote_text: "Your database might be fast, but our protocols are older and wiser.",
        context_before: "I remember one conversation with an elder who told me,",
        context_after: "That really stuck with me.",
        emotional_impact_score: 0.92,
        wisdom_score: 0.95,
        quotability_score: 0.88,
        inspiration_score: 0.85,
        themes: ['Elder Wisdom', 'Cultural Protocols', 'Technology Ethics'],
        quote_category: 'wisdom'
      },
      {
        storyteller_id: benjaminId,
        tenant_id: tenantId,
        source_id: createdTranscripts[1].id,
        source_type: 'transcript',
        source_title: createdTranscripts[1].title,
        quote_text: "The technology should serve the community, not the other way around.",
        context_before: "everything is designed to respect traditional ways of sharing knowledge.",
        context_after: "It's not just about preserving culture, it's about adapting it",
        emotional_impact_score: 0.85,
        wisdom_score: 0.88,
        quotability_score: 0.92,
        inspiration_score: 0.90,
        themes: ['Technology Ethics', 'Community Empowerment'],
        quote_category: 'inspiration'
      },
      {
        storyteller_id: benjaminId,
        tenant_id: tenantId,
        source_id: createdTranscripts[2].id,
        source_type: 'transcript',
        source_title: createdTranscripts[2].title,
        quote_text: "When community members are invested in building something, they take ownership of it in a way that's beautiful to see.",
        context_before: "This collaborative approach has made the platform so much stronger.",
        context_after: "The impact has been incredible.",
        emotional_impact_score: 0.88,
        wisdom_score: 0.82,
        quotability_score: 0.85,
        inspiration_score: 0.93,
        themes: ['Community Ownership', 'Collaborative Development'],
        quote_category: 'inspiration'
      }
    ];

    for (const quote of powerfulQuotes) {
      const { error: quoteError } = await supabase
        .from('storyteller_quotes')
        .insert(quote);

      if (quoteError && !quoteError.message.includes('duplicate key')) {
        console.error('❌ Error adding quote:', quoteError);
      } else {
        console.log(`✅ Added quote: "${quote.quote_text.substring(0, 50)}..."`);
      }
    }

    // Create engagement data
    console.log('\n📈 Creating engagement metrics...');
    const engagementData = {
      storyteller_id: benjaminId,
      tenant_id: tenantId,
      period_start: new Date('2025-09-01').toISOString(),
      period_end: new Date('2025-09-16').toISOString(),
      period_type: 'monthly', // Use valid period type
      stories_created: 0,
      transcripts_processed: createdTranscripts.length,
      connections_made: 3,
      story_views: 45,
      login_days: 12,
      engagement_score: 76.5,
      impact_score: 68.2,
      ai_analysis_requests: 2
    };

    const { error: engagementError } = await supabase
      .from('storyteller_engagement')
      .insert(engagementData);

    if (engagementError && !engagementError.message.includes('duplicate key')) {
      console.error('❌ Error creating engagement data:', engagementError);
    } else {
      console.log('✅ Created engagement metrics');
    }

    console.log('\n🎉 Benjamin Knight setup complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Transcripts: ${createdTranscripts.length}`);
    console.log(`   - Total words: ${totalWordCount.toLocaleString()}`);
    console.log(`   - Quotes: ${powerfulQuotes.length}`);
    console.log(`   - Impact reach: 45 people`);
    console.log(`   - Engagement score: 76.5`);

    console.log('\n🚀 Next steps:');
    console.log('   1. Visit your storyteller dashboard to see the analytics');
    console.log('   2. The transcripts should now show up in your profile');
    console.log('   3. You can create stories from these transcripts');
    console.log('   4. Analytics will update as you add more content');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
if (require.main === module) {
  setupBenjaminStoryteller();
}

module.exports = { setupBenjaminStoryteller };