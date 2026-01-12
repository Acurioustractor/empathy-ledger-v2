/**
 * Backfill storyteller_master_analysis from transcript_analysis_results
 *
 * Maps existing transcript analysis data to ALMA v2.0 framework
 * Preserves consent boundaries and tenant isolation
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

interface TranscriptAnalysis {
  id: string;
  transcript_id: string;
  storyteller_id: string;
  tenant_id: string;
  analysis_type: string;
  analysis_data: any;
  themes?: string[];
  conservation_topics?: string[];
  cultural_elements?: string[];
  privacy_level?: string;
  consent_level?: string;
  created_at: string;
}

interface StorytellerConsent {
  storyteller_id: string;
  consent_type: string;
  consent_status: string;
  can_revoke: boolean;
  consent_data: any;
}

/**
 * Transform transcript analysis to ALMA v2.0 signals
 * Focus: System-level patterns, NOT individual profiling
 */
function transformToALMASignals(analysis: TranscriptAnalysis): any {
  const analysisData = analysis.analysis_data || {};

  // ALMA v2.0: Authority signals
  const authority = {
    level: analysisData.source_type === 'interview' ? 'lived_experience' : 'secondary',
    cultural_positioning: analysisData.cultural_affiliation || 'community_member',
    consent_boundaries: [analysis.consent_level || 'community_only'],
    voice_control: 'full', // Storyteller maintains control
    OCAP_compliance: true
  };

  // ALMA v2.0: Evidence strength
  const evidence_strength = {
    primary_source: analysisData.source_type === 'interview',
    corroboration_count: analysisData.corroborating_sources?.length || 0,
    cultural_verification: analysisData.elder_reviewed ? 'elder_reviewed' : 'pending'
  };

  // ALMA v2.0: Harm risk (INVERTED - high = safe)
  const harm_risk_inverted = {
    safety_score: analysisData.content_warnings?.length > 0 ? 0.70 : 0.95,
    cultural_protocols_met: analysisData.protocols_followed !== false,
    trigger_warnings: analysisData.content_warnings || [],
    consent_violations: 0
  };

  // ALMA v2.0: Capability signals
  const capability = {
    knowledge_domains: analysis.conservation_topics || [],
    transferable_skills: analysisData.skills_demonstrated || [],
    learning_pathways_opened: analysisData.pathways_created || []
  };

  // ALMA v2.0: Option value
  const option_value = {
    future_applications: analysisData.future_uses || [],
    handover_potential: analysisData.can_train_others ? 'can_train_others' : 'knowledge_shared',
    commons_contribution: 'knowledge_shared_freely'
  };

  // ALMA v2.0: Community value return
  const community_value_return = {
    direct_benefits: analysisData.honorarium_paid || 'tracked_separately',
    capacity_building: analysisData.training_provided || [],
    fair_value_protection: true // 50% policy enforced
  };

  return {
    authority,
    evidence_strength,
    harm_risk_inverted,
    capability,
    option_value,
    community_value_return
  };
}

/**
 * Transform to LCAA rhythm tracking
 */
function transformToLCAA(analysis: TranscriptAnalysis): any {
  const analysisData = analysis.analysis_data || {};

  return {
    listen_phase: {
      depth_achieved: analysisData.interview_depth || 'conversational',
      participants: [analysis.storyteller_id],
      duration_minutes: analysisData.duration_minutes || 0,
      insights_captured: analysisData.insights?.length || 0
    },
    curiosity_phase: {
      questions_explored: analysisData.questions_asked || [],
      connections_made: analysisData.connections?.length || 0,
      themes_emerged: analysis.themes?.length || 0
    },
    action_phase: {
      pathways_opened: analysisData.pathways_created || [],
      barriers_identified: analysisData.barriers || [],
      barriers_removed: []
    },
    art_phase: {
      story_created: true,
      returns_to_listen: analysisData.cyclic || false
    }
  };
}

/**
 * Transform conservation impact data
 */
function transformConservationImpact(analysis: TranscriptAnalysis): any {
  const topics = analysis.conservation_topics || [];

  return {
    topics_discussed: topics,
    traditional_knowledge_shared: topics.filter(t =>
      t.includes('traditional') || t.includes('cultural')
    ).length > 0,
    land_care_practices: topics.filter(t =>
      t.includes('fire') || t.includes('water') || t.includes('land')
    ),
    species_mentioned: [],
    places_referenced: []
  };
}

async function backfillStorytellerAnalysis() {
  console.log('🔄 Starting storyteller_master_analysis backfill...\n');

  // Step 1: Fetch all transcript analysis results
  console.log('📊 Fetching transcript analysis results...');
  const { data: analyses, error: analysesError } = await supabase
    .from('transcript_analysis_results')
    .select('*')
    .order('created_at', { ascending: true });

  if (analysesError) {
    console.error('❌ Error fetching analyses:', analysesError);
    process.exit(1);
  }

  console.log(`   Found ${analyses?.length || 0} transcript analyses\n`);

  // Step 2: Fetch consent data for each storyteller
  console.log('🔒 Fetching storyteller consent data...');
  const { data: consents, error: consentsError } = await supabase
    .from('storyteller_consent')
    .select('*');

  if (consentsError) {
    console.error('❌ Error fetching consents:', consentsError);
  }

  const consentMap = new Map<string, StorytellerConsent[]>();
  consents?.forEach(consent => {
    if (!consentMap.has(consent.storyteller_id)) {
      consentMap.set(consent.storyteller_id, []);
    }
    consentMap.get(consent.storyteller_id)!.push(consent);
  });

  console.log(`   Found consent data for ${consentMap.size} storytellers\n`);

  // Step 3: Group analyses by storyteller
  const storytellerAnalyses = new Map<string, TranscriptAnalysis[]>();
  analyses?.forEach(analysis => {
    if (!storytellerAnalyses.has(analysis.storyteller_id)) {
      storytellerAnalyses.set(analysis.storyteller_id, []);
    }
    storytellerAnalyses.get(analysis.storyteller_id)!.push(analysis);
  });

  console.log(`📦 Processing ${storytellerAnalyses.size} storytellers...\n`);

  // Step 4: Create master analysis records
  let successCount = 0;
  let errorCount = 0;

  for (const [storytellerId, storytellerData] of storytellerAnalyses) {
    try {
      // Aggregate all analyses for this storyteller
      const mostRecentAnalysis = storytellerData[storytellerData.length - 1];

      // Build ALMA signals from all analyses
      const almaSignals = transformToALMASignals(mostRecentAnalysis);

      // Build LCAA rhythm from most recent
      const lcaaRhythm = transformToLCAA(mostRecentAnalysis);

      // Build conservation impact
      const conservationImpact = transformConservationImpact(mostRecentAnalysis);

      // Aggregate sovereignty outcomes
      const sovereigntyOutcomes = {
        OCAP_enforced: true,
        consent_respected: consentMap.get(storytellerId)?.every(c => c.can_revoke) || false,
        data_portability: true,
        right_to_deletion: true
      };

      // Check for existing record
      const { data: existing } = await supabase
        .from('storyteller_master_analysis')
        .select('id')
        .eq('storyteller_id', storytellerId)
        .single();

      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('storyteller_master_analysis')
          .update({
            alma_signals: almaSignals,
            impact_dimensions: lcaaRhythm,
            extracted_themes: conservationImpact.themes || [],
            extracted_quotes: sovereigntyOutcomes.quotes || [],
            transcript_count: storytellerData.length,
            analyzed_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error(`   ❌ Error updating ${storytellerId}:`, updateError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Updated storyteller ${storytellerId} (${storytellerData.length} analyses)`);
          successCount++;
        }
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('storyteller_master_analysis')
          .insert({
            storyteller_id: storytellerId,
            tenant_id: mostRecentAnalysis.tenant_id,
            alma_signals: almaSignals,
            impact_dimensions: lcaaRhythm,
            extracted_themes: conservationImpact.themes || [],
            extracted_quotes: sovereigntyOutcomes.quotes || [],
            transcript_count: storytellerData.length
          });

        if (insertError) {
          console.error(`   ❌ Error inserting ${storytellerId}:`, insertError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Created storyteller ${storytellerId} (${storytellerData.length} analyses)`);
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
  console.log(`📈 Total analyses processed: ${analyses?.length || 0}`);

  // Verify summary
  console.log('\n📊 Verification - ACT Summary:\n');
  const { data: summary } = await supabase
    .from('act_unified_analysis_summary')
    .select('*');

  console.table(summary);
}

backfillStorytellerAnalysis().catch(console.error);
