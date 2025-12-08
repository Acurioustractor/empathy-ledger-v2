/**
 * Populate Sample Analytics Data
 * Uses previous transcripts and storyteller data as examples
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function populateSampleAnalyticsData() {
  console.log('🌟 Starting analytics sample data population...');

  try {
    // 1. First, let's get existing storytellers from profiles
    const { data: storytellers, error: storytellersError } = await supabase
      .from('profiles')
      .select('id, display_name, tenant_id, bio, cultural_background')
      .eq('is_storyteller', true)
      .limit(5);

    if (storytellersError) {
      console.error('Error fetching storytellers:', storytellersError);
      return;
    }

    console.log(`📊 Found ${storytellers.length} storytellers to enhance with analytics`);

    // 2. Create sample narrative themes based on previous transcript examples
    const sampleThemes = [
      {
        theme_name: 'Cultural Identity',
        theme_category: 'cultural',
        theme_description: 'Stories exploring cultural heritage and identity formation',
        ai_confidence_score: 0.92,
        usage_count: 15,
        storyteller_count: 8
      },
      {
        theme_name: 'Community Healing',
        theme_category: 'community',
        theme_description: 'Narratives about healing trauma and building resilience',
        ai_confidence_score: 0.88,
        usage_count: 12,
        storyteller_count: 6
      },
      {
        theme_name: 'Intergenerational Wisdom',
        theme_category: 'cultural',
        theme_description: 'Stories bridging generations and passing down knowledge',
        ai_confidence_score: 0.95,
        usage_count: 20,
        storyteller_count: 10
      },
      {
        theme_name: 'Land Connection',
        theme_category: 'cultural',
        theme_description: 'Deep connection to country and traditional lands',
        ai_confidence_score: 0.90,
        usage_count: 18,
        storyteller_count: 9
      },
      {
        theme_name: 'Youth Empowerment',
        theme_category: 'community',
        theme_description: 'Stories of inspiring and mentoring young people',
        ai_confidence_score: 0.85,
        usage_count: 10,
        storyteller_count: 5
      }
    ];

    // Insert sample themes with proper tenant_id
    const tenant_id = storytellers[0]?.tenant_id || '00000000-0000-0000-0000-000000000000';

    for (const theme of sampleThemes) {
      const { error: themeError } = await supabase
        .from('narrative_themes')
        .upsert({
          tenant_id,
          ...theme
        }, {
          onConflict: 'tenant_id,theme_name',
          ignoreDuplicates: true
        });

      if (themeError) {
        console.error('Error inserting theme:', theme.theme_name, themeError);
      } else {
        console.log(`✅ Added theme: ${theme.theme_name}`);
      }
    }

    // 3. Get the created themes
    const { data: createdThemes } = await supabase
      .from('narrative_themes')
      .select('id, theme_name')
      .eq('tenant_id', tenant_id);

    // 4. Create storyteller analytics for each storyteller
    for (let i = 0; i < storytellers.length; i++) {
      const storyteller = storytellers[i];

      const analyticsData = {
        storyteller_id: storyteller.id,
        tenant_id: storyteller.tenant_id,
        total_stories: Math.floor(Math.random() * 15) + 3, // 3-17 stories
        total_transcripts: Math.floor(Math.random() * 25) + 5, // 5-29 transcripts
        total_word_count: Math.floor(Math.random() * 50000) + 10000, // 10k-60k words
        total_engagement_score: (Math.random() * 80) + 20, // 20-100 score
        impact_reach: Math.floor(Math.random() * 500) + 50, // 50-549 people reached
        primary_themes: createdThemes.slice(0, 3).map(t => t.theme_name),
        connection_count: Math.floor(Math.random() * 20) + 2, // 2-21 connections
        storytelling_style: ['inspirational', 'reflective', 'educational', 'conversational'][i % 4]
      };

      const { error: analyticsError } = await supabase
        .from('storyteller_analytics')
        .upsert(analyticsData, {
          onConflict: 'storyteller_id',
          ignoreDuplicates: false
        });

      if (analyticsError) {
        console.error('Error inserting analytics for:', storyteller.display_name, analyticsError);
      } else {
        console.log(`📈 Added analytics for: ${storyteller.display_name}`);
      }
    }

    // 5. Create sample powerful quotes from previous transcript examples
    const sampleQuotes = [
      {
        quote_text: "Our stories are not just words, they are the bridge between our ancestors and our future generations.",
        context_before: "When I think about storytelling in our community,",
        context_after: "That's why every story matters, no matter how small it might seem.",
        source_type: "transcript",
        emotional_impact_score: 0.95,
        wisdom_score: 0.92,
        quotability_score: 0.88,
        inspiration_score: 0.90,
        themes: ["Intergenerational Wisdom", "Cultural Identity"],
        quote_category: "wisdom"
      },
      {
        quote_text: "Healing happens when we share our truth with courage and compassion.",
        context_before: "Through all the challenges our community has faced,",
        context_after: "This is how we break cycles and create new possibilities.",
        source_type: "story",
        emotional_impact_score: 0.88,
        wisdom_score: 0.85,
        quotability_score: 0.92,
        inspiration_score: 0.95,
        themes: ["Community Healing", "Personal Growth"],
        quote_category: "inspiration"
      },
      {
        quote_text: "The land doesn't just hold our history, it holds our future dreams.",
        context_before: "Walking on country with the elders,",
        context_after: "Every step connects us deeper to who we are meant to become.",
        source_type: "interview",
        emotional_impact_score: 0.90,
        wisdom_score: 0.95,
        quotability_score: 0.85,
        inspiration_score: 0.87,
        themes: ["Land Connection", "Cultural Identity"],
        quote_category: "cultural"
      }
    ];

    // Insert sample quotes for storytellers
    for (let i = 0; i < Math.min(storytellers.length, sampleQuotes.length); i++) {
      const quote = sampleQuotes[i];
      const storyteller = storytellers[i];

      const quoteData = {
        storyteller_id: storyteller.id,
        tenant_id: storyteller.tenant_id,
        source_id: storyteller.id, // Using storyteller ID as mock source
        source_title: `${storyteller.display_name}'s Story Session`,
        ...quote
      };

      const { error: quoteError } = await supabase
        .from('storyteller_quotes')
        .insert(quoteData);

      if (quoteError) {
        console.error('Error inserting quote:', quoteError);
      } else {
        console.log(`💬 Added quote for: ${storyteller.display_name}`);
      }
    }

    // 6. Create sample storyteller demographics
    for (const storyteller of storytellers) {
      const demographicsData = {
        storyteller_id: storyteller.id,
        tenant_id: storyteller.tenant_id,
        current_location: {
          city: ['Katherine', 'Alice Springs', 'Darwin', 'Tennant Creek', 'Nhulunbuy'][Math.floor(Math.random() * 5)],
          state: 'NT',
          country: 'Australia',
          coordinates: [-14.4686 + (Math.random() * 2), 132.2635 + (Math.random() * 4)]
        },
        cultural_background: storyteller.cultural_background ? [storyteller.cultural_background] : ['Aboriginal Australian'],
        languages_spoken: ['English', 'Local Indigenous Language'],
        geographic_region: 'Northern Territory',
        generation_category: ['elder', 'middle-aged', 'young-adult'][Math.floor(Math.random() * 3)],
        areas_of_expertise: ['Cultural Knowledge', 'Community Leadership', 'Storytelling'],
        community_roles: [['Elder'], ['Mentor'], ['Cultural Keeper']][Math.floor(Math.random() * 3)]
      };

      const { error: demoError } = await supabase
        .from('storyteller_demographics')
        .upsert(demographicsData, {
          onConflict: 'storyteller_id',
          ignoreDuplicates: false
        });

      if (demoError) {
        console.error('Error inserting demographics:', demoError);
      } else {
        console.log(`🌍 Added demographics for: ${storyteller.display_name}`);
      }
    }

    // 7. Create sample engagement data
    for (const storyteller of storytellers) {
      const engagementData = {
        storyteller_id: storyteller.id,
        tenant_id: storyteller.tenant_id,
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        period_end: new Date().toISOString(),
        period_type: 'monthly',
        stories_created: Math.floor(Math.random() * 5) + 1,
        transcripts_processed: Math.floor(Math.random() * 8) + 2,
        connections_made: Math.floor(Math.random() * 3) + 1,
        story_views: Math.floor(Math.random() * 100) + 20,
        login_days: Math.floor(Math.random() * 25) + 5,
        engagement_score: Math.random() * 80 + 20,
        impact_score: Math.random() * 60 + 30
      };

      const { error: engagementError } = await supabase
        .from('storyteller_engagement')
        .insert(engagementData);

      if (engagementError) {
        console.error('Error inserting engagement:', engagementError);
      } else {
        console.log(`📊 Added engagement data for: ${storyteller.display_name}`);
      }
    }

    console.log('\n🎉 Sample analytics data population completed successfully!');
    console.log('📈 Created comprehensive storyteller analytics ecosystem');
    console.log('🔍 You can now test the frontend integration');

  } catch (error) {
    console.error('❌ Error populating sample data:', error);
  }
}

// Run the population script
if (require.main === module) {
  populateSampleAnalyticsData();
}

module.exports = { populateSampleAnalyticsData };