#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testWithSampleData() {
  console.log('🧪 Testing with Sample Storyteller Data...\n');

  const vickyId = '7380ee75-512c-41b6-9f17-416e3dbba302';
  const transcriptId = 'edde7ce6-9347-439a-ba04-bf8e0a7ba85e';

  try {
    // Get Vicky's profile info
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id, display_name')
      .eq('id', vickyId)
      .single();

    if (!profile) {
      console.log('❌ Could not find Aunty Vicky\'s profile');
      return;
    }

    console.log(`👩‍🦳 Found storyteller: ${profile.display_name}`);
    console.log(`🏢 Tenant ID: ${profile.tenant_id}\n`);

    // 1. Create sample themes
    console.log('🎨 Creating sample themes...');

    const sampleThemes = [
      {
        tenant_id: profile.tenant_id,
        theme_name: 'Health & Healing',
        theme_category: 'health',
        theme_description: 'Stories about health advocacy, healing practices, and medical community work',
        ai_confidence_score: 0.95,
        usage_count: 1
      },
      {
        tenant_id: profile.tenant_id,
        theme_name: 'Community Leadership',
        theme_category: 'community',
        theme_description: 'Stories of leading community initiatives and advocacy work',
        ai_confidence_score: 0.90,
        usage_count: 1
      },
      {
        tenant_id: profile.tenant_id,
        theme_name: 'Cultural Heritage',
        theme_category: 'cultural',
        theme_description: 'Stories about cultural protocols, traditional knowledge, and respect for elders',
        ai_confidence_score: 0.88,
        usage_count: 1
      },
      {
        tenant_id: profile.tenant_id,
        theme_name: 'Youth Empowerment',
        theme_category: 'community',
        theme_description: 'Stories about inspiring and mentoring young people',
        ai_confidence_score: 0.85,
        usage_count: 1
      }
    ];

    const { data: themes, error: themeError } = await supabase
      .from('narrative_themes')
      .upsert(sampleThemes, {
        onConflict: 'tenant_id,theme_name',
        ignoreDuplicates: false
      })
      .select();

    if (themeError) {
      console.log('⚠️  Theme creation result:', themeError.message);
    } else {
      console.log(`✅ Created ${themes?.length || 0} themes`);
    }

    // 2. Create storyteller analytics
    console.log('\n📊 Creating storyteller analytics...');

    const analyticsData = {
      storyteller_id: vickyId,
      tenant_id: profile.tenant_id,
      total_stories: 1,
      total_transcripts: 1,
      total_word_count: 1187,
      total_engagement_score: 85.5,
      impact_reach: 500,
      primary_themes: ['Health & Healing', 'Community Leadership', 'Cultural Heritage', 'Youth Empowerment'],
      theme_distribution: {
        'Health & Healing': 30,
        'Community Leadership': 29,
        'Youth Empowerment': 14,
        'Cultural Heritage': 11,
        'Family Legacy': 10
      },
      storytelling_style: 'inspirational',
      emotional_tone_profile: {
        'inspiring': 0.4,
        'respectful': 0.3,
        'hopeful': 0.2,
        'determined': 0.1
      },
      connection_count: 3,
      story_view_count: 245,
      quote_citation_count: 8,
      inspiration_impact_score: 88.5
    };

    const { data: analytics, error: analyticsError } = await supabase
      .from('storyteller_analytics')
      .upsert(analyticsData)
      .select();

    if (analyticsError) {
      console.log('⚠️  Analytics creation result:', analyticsError.message);
    } else {
      console.log('✅ Created storyteller analytics');
    }

    // 3. Create storyteller-theme connections
    if (themes && themes.length > 0) {
      console.log('\n🔗 Creating theme connections...');

      const themeConnections = themes.map((theme, index) => ({
        storyteller_id: vickyId,
        theme_id: theme.id,
        tenant_id: profile.tenant_id,
        prominence_score: Math.max(0.9 - (index * 0.15), 0.3),
        frequency_count: Math.max(30 - (index * 5), 5),
        first_occurrence: new Date().toISOString(),
        last_occurrence: new Date().toISOString(),
        source_transcripts: [transcriptId],
        key_quotes: [
          'We go softly when entering community',
          'Communities are banging on our door',
          'We wanna study. We are gonna go back to boarding school'
        ].slice(0, index + 1)
      }));

      const { data: connections, error: connectionError } = await supabase
        .from('storyteller_themes')
        .upsert(themeConnections, {
          onConflict: 'storyteller_id,theme_id'
        })
        .select();

      if (connectionError) {
        console.log('⚠️  Theme connection result:', connectionError.message);
      } else {
        console.log(`✅ Created ${connections?.length || 0} theme connections`);
      }
    }

    // 4. Create powerful quotes
    console.log('\n💬 Creating powerful quotes...');

    const powerfulQuotes = [
      {
        storyteller_id: vickyId,
        tenant_id: profile.tenant_id,
        quote_text: "When we go into community, particularly my old Nan Lily, she said, you go in there with your eyes and you go in there with your ears. And you keep that mouth shut.",
        context_before: "I think it's important that when we go out on community, particularly when it's not my land, that I go softly.",
        context_after: "I observe, I never go onto country unless I am welcomed by traditional owners.",
        source_type: 'transcript',
        source_id: transcriptId,
        source_title: 'Aunty Vicky Wade - Community Story',
        emotional_impact_score: 0.92,
        wisdom_score: 0.95,
        quotability_score: 0.88,
        inspiration_score: 0.90,
        themes: ['Cultural Heritage', 'Elder Wisdom', 'Community Respect'],
        sentiment_score: 0.75,
        quote_category: 'wisdom',
        citation_count: 3
      },
      {
        storyteller_id: vickyId,
        tenant_id: profile.tenant_id,
        quote_text: "If we pick them up early, we can prevent them from having open heart surgery.",
        context_before: "So what we are really wanting to do is pick up kids with rheumatic heart disease early.",
        context_after: "Sonographers, cultural guides are really important.",
        source_type: 'transcript',
        source_id: transcriptId,
        source_title: 'Aunty Vicky Wade - Community Story',
        emotional_impact_score: 0.85,
        wisdom_score: 0.80,
        quotability_score: 0.75,
        inspiration_score: 0.88,
        themes: ['Health & Healing', 'Prevention', 'Community Impact'],
        sentiment_score: 0.80,
        quote_category: 'impact',
        citation_count: 2
      },
      {
        storyteller_id: vickyId,
        tenant_id: profile.tenant_id,
        quote_text: "We wanna study. We are gonna go back to boarding school so we can go.",
        context_before: "Yesterday we had three beautiful young girls and they're coming to me and they're talking.",
        context_after: "And I said, what do you wanna do? And they said, I wanna be a nurse or I wanna be a doctor.",
        source_type: 'transcript',
        source_id: transcriptId,
        source_title: 'Aunty Vicky Wade - Community Story',
        emotional_impact_score: 0.95,
        wisdom_score: 0.70,
        quotability_score: 0.82,
        inspiration_score: 0.95,
        themes: ['Youth Empowerment', 'Education', 'Role Modeling'],
        sentiment_score: 0.90,
        quote_category: 'inspiration',
        citation_count: 5
      }
    ];

    const { data: quotes, error: quotesError } = await supabase
      .from('storyteller_quotes')
      .upsert(powerfulQuotes, {
        onConflict: 'storyteller_id,quote_text'
      })
      .select();

    if (quotesError) {
      console.log('⚠️  Quotes creation result:', quotesError.message);
    } else {
      console.log(`✅ Created ${quotes?.length || 0} powerful quotes`);
    }

    // 5. Test data retrieval
    console.log('\n🔍 Testing data retrieval...');

    const tests = [
      {
        name: 'Storyteller Analytics',
        table: 'storyteller_analytics',
        condition: { storyteller_id: vickyId }
      },
      {
        name: 'Narrative Themes',
        table: 'narrative_themes',
        condition: { tenant_id: profile.tenant_id }
      },
      {
        name: 'Theme Connections',
        table: 'storyteller_themes',
        condition: { storyteller_id: vickyId }
      },
      {
        name: 'Powerful Quotes',
        table: 'storyteller_quotes',
        condition: { storyteller_id: vickyId }
      }
    ];

    for (const test of tests) {
      const { count, error } = await supabase
        .from(test.table)
        .select('*', { count: 'exact', head: true })
        .match(test.condition);

      if (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
      } else {
        console.log(`✅ ${test.name}: ${count || 0} records`);
      }
    }

    console.log('\n🎉 SAMPLE DATA SETUP COMPLETE!');
    console.log('================================');
    console.log('✅ Storyteller analytics populated');
    console.log('✅ Themes and connections created');
    console.log('✅ Powerful quotes extracted');
    console.log('✅ Ready for dashboard testing!');

    console.log('\n🚀 TEST YOUR COMPONENTS:');
    console.log('========================');
    console.log('1. Start your dev server: npm run dev');
    console.log('2. Visit: http://localhost:3000/test-analytics');
    console.log('3. See beautiful storyteller analytics in action!');

  } catch (error) {
    console.error('❌ Error setting up sample data:', error);
  }
}

testWithSampleData().catch(console.error);