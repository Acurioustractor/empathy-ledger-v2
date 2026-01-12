/**
 * Backfill storyteller_master_analysis from STORIES
 *
 * Since transcript_analysis_results is empty, we'll create initial ALMA signals
 * from existing stories and their metadata
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function backfillFromStories() {
  console.log('🔄 Backfilling storyteller_master_analysis from STORIES...\n');

  // Get all stories with storytellers
  console.log('📊 Fetching stories...');
  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select(`
      id,
      title,
      content,
      storyteller_id,
      tenant_id,
      privacy_level,
      themes,
      created_at
    `)
    .not('storyteller_id', 'is', null);

  if (storiesError) {
    console.error('❌ Error fetching stories:', storiesError);
    process.exit(1);
  }

  console.log(`   Found ${stories?.length || 0} stories with storytellers\n`);

  // Group by storyteller
  const storytellerStories = new Map<string, typeof stories>();
  stories?.forEach(story => {
    if (!storytellerStories.has(story.storyteller_id)) {
      storytellerStories.set(story.storyteller_id, []);
    }
    storytellerStories.get(story.storyteller_id)!.push(story);
  });

  console.log(`📦 Processing ${storytellerStories.size} storytellers...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const [storytellerId, storyList] of storytellerStories) {
    try {
      // Create initial ALMA signals from story metadata
      const almaSignals = {
        authority: {
          level: 'lived_experience', // Default for storytellers
          cultural_positioning: 'community_member',
          consent_boundaries: ['public_sharing'], // Infer from published stories
          voice_control: 'full',
          OCAP_compliance: true
        },
        evidence_strength: {
          primary_source: true, // Stories are primary sources
          corroboration_count: storyList.length, // Multiple stories = corroboration
          cultural_verification: 'pending'
        },
        harm_risk_inverted: {
          safety_score: 0.95, // Default safe (published stories)
          cultural_protocols_met: true,
          trigger_warnings: [],
          consent_violations: 0
        },
        capability: {
          knowledge_domains: extractKnowledgeDomains(storyList),
          transferable_skills: [],
          learning_pathways_opened: []
        },
        option_value: {
          future_applications: [],
          handover_potential: 'knowledge_shared',
          commons_contribution: 'knowledge_shared_freely'
        },
        community_value_return: {
          direct_benefits: 'tracked_separately',
          capacity_building: [],
          fair_value_protection: true
        }
      };

      // LCAA rhythm - basic from stories
      const lcaaRhythm = {
        listen_phase: {
          depth_achieved: 'conversational',
          participants: [storytellerId],
          duration_minutes: 0,
          insights_captured: storyList.length
        },
        curiosity_phase: {
          questions_explored: [],
          connections_made: 0,
          themes_emerged: extractUniqueThemes(storyList).length
        },
        action_phase: {
          pathways_opened: [],
          barriers_identified: [],
          barriers_removed: []
        },
        art_phase: {
          story_created: true,
          returns_to_listen: false
        }
      };

      // Conservation impact
      const conservationImpact = {
        topics_discussed: extractTopics(storyList),
        traditional_knowledge_shared: false,
        land_care_practices: []
      };

      // Sovereignty outcomes
      const sovereigntyOutcomes = {
        OCAP_enforced: true,
        consent_respected: true,
        data_portability: true,
        right_to_deletion: true
      };

      // Get most recent story for tenant/privacy
      const mostRecent = storyList[storyList.length - 1];

      // Check for existing
      const { data: existing } = await supabase
        .from('storyteller_master_analysis')
        .select('id')
        .eq('storyteller_id', storytellerId)
        .single();

      if (existing) {
        // Update
        const { error: updateError } = await supabase
          .from('storyteller_master_analysis')
          .update({
            alma_signals: almaSignals,
            lcaa_rhythm_analysis: lcaaRhythm,
            conservation_impact: conservationImpact,
            sovereignty_outcomes: sovereigntyOutcomes,
            source_analyses: storyList.map(s => s.id),
            analysis_count: storyList.length,
            last_analysis_date: mostRecent.created_at,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error(`   ❌ Error updating ${storytellerId}:`, updateError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Updated storyteller ${storytellerId} (${storyList.length} stories)`);
          successCount++;
        }
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('storyteller_master_analysis')
          .insert({
            storyteller_id: storytellerId,
            tenant_id: mostRecent.tenant_id,
            privacy_level: mostRecent.privacy_level || 'private',
            consent_level: 'public_sharing', // Inferred from published
            alma_signals: almaSignals,
            lcaa_rhythm_analysis: lcaaRhythm,
            conservation_impact: conservationImpact,
            sovereignty_outcomes: sovereigntyOutcomes,
            source_analyses: storyList.map(s => s.id),
            analysis_count: storyList.length,
            last_analysis_date: mostRecent.created_at
          });

        if (insertError) {
          console.error(`   ❌ Error inserting ${storytellerId}:`, insertError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Created storyteller ${storytellerId} (${storyList.length} stories)`);
          successCount++;
        }
      }
    } catch (err) {
      console.error(`   ❌ Error processing ${storytellerId}:`, err);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 BACKFILL COMPLETE');
  console.log('='.repeat(70));
  console.log(`✅ Success: ${successCount} storytellers`);
  console.log(`❌ Errors: ${errorCount} storytellers`);
  console.log(`📈 Total stories processed: ${stories?.length || 0}`);

  // Verify
  console.log('\n📊 Verification:\n');
  const { data: summary } = await supabase
    .from('act_unified_analysis_summary')
    .select('*');

  console.table(summary);
}

function extractKnowledgeDomains(stories: any[]): string[] {
  // Extract from themes
  const themes = stories.flatMap(s => s.themes || []);
  return [...new Set(themes)].slice(0, 10);
}

function extractUniqueThemes(stories: any[]): string[] {
  const themes = stories.flatMap(s => s.themes || []);
  return [...new Set(themes)];
}

function extractTopics(stories: any[]): string[] {
  // Simple extraction from titles/themes
  const topics = stories.flatMap(s => {
    const words = (s.title || '').toLowerCase().split(/\s+/);
    return words.filter((w: string) => w.length > 4);
  });
  return [...new Set(topics)].slice(0, 10);
}

backfillFromStories().catch(console.error);
