/**
 * Backfill storyteller_master_analysis from transcript_analysis_results
 *
 * Maps existing transcript analysis data to ALMA v2.0 framework
 * Uses correct schema: joins transcript_analysis_results → transcripts → storytellers
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

interface TranscriptAnalysis {
  id: string;
  transcript_id: string;
  themes: string[];
  quotes: any[];
  impact_assessment: any;
  cultural_flags: any;
  quality_metrics: any;
  tenant_id: string;
  created_at: string;
  transcripts: {
    storyteller_id: string;
    title: string;
    organization_id: string;
  };
}

/**
 * Transform transcript analysis to ALMA v2.0 signals
 */
function transformToALMASignals(analyses: TranscriptAnalysis[]): any {
  // Aggregate across all analyses for this storyteller
  const allThemes = analyses.flatMap(a => a.themes || []);
  const allQuotes = analyses.flatMap(a => a.quotes || []);
  const hasEvidenceCorroboration = analyses.length > 1;

  // Sample impact from most recent analysis
  const latestImpact = analyses[0]?.impact_assessment || {};

  return {
    authority: {
      level: 'lived_experience', // All storytellers are primary sources
      cultural_positioning: 'community_member',
      consent_boundaries: ['community_use', 'research_approved'],
      voice_control: 'full',
      OCAP_compliance: true
    },
    evidence_strength: {
      primary_source: true,
      corroboration_count: analyses.length,
      cultural_verification: 'pending',
      analysis_count: analyses.length
    },
    harm_risk_inverted: {
      safety_score: 0.95, // High safety by default
      cultural_protocols_met: true,
      trigger_warnings: [],
      consent_violations: 0
    },
    capability: {
      knowledge_domains: [...new Set(allThemes)].slice(0, 10),
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
}

/**
 * Transform to LCAA rhythm tracking
 */
function transformToLCAA(analyses: TranscriptAnalysis[]): any {
  return {
    listen_phase: {
      depth_achieved: 'conversational',
      participants: 1,
      transcript_count: analyses.length,
      insights_captured: analyses.reduce((sum, a) => sum + (a.quotes?.length || 0), 0)
    },
    curiosity_phase: {
      questions_explored: [],
      connections_made: 0,
      themes_emerged: [...new Set(analyses.flatMap(a => a.themes || []))].length
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
}

/**
 * Extract impact dimensions from analyses
 */
function extractImpactDimensions(analyses: TranscriptAnalysis[]): any {
  // Aggregate impact_assessment across all analyses
  const impacts = analyses.map(a => a.impact_assessment).filter(Boolean);

  if (impacts.length === 0) {
    return {
      individual: { healing: 0, empowerment: 0, identity: 0 },
      community: { connection: 0, capability: 0, sovereignty: 0 },
      environmental: { land_connection: 0, sustainable_practice: 0 }
    };
  }

  // Average the scores
  const avg = (key: string, subkey: string) => {
    const values = impacts
      .map(i => i?.[key]?.[subkey])
      .filter((v): v is number => typeof v === 'number');
    return values.length > 0
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100
      : 0;
  };

  return {
    individual: {
      healing: avg('individual', 'healing'),
      empowerment: avg('individual', 'empowerment'),
      identity: avg('individual', 'identity')
    },
    community: {
      connection: avg('community', 'connection'),
      capability: avg('community', 'capability'),
      sovereignty: avg('community', 'sovereignty')
    },
    environmental: {
      land_connection: avg('environmental', 'land_connection'),
      sustainable_practice: avg('environmental', 'sustainable_practice')
    }
  };
}

async function backfillStorytellerAnalysis() {
  console.log('═'.repeat(70));
  console.log('🔄 STORYTELLER MASTER ANALYSIS BACKFILL');
  console.log('═'.repeat(70));

  // Fetch all transcript analysis results with storyteller linkage via transcripts
  console.log('\n📊 Fetching transcript analysis results with storyteller linkage...');

  const { data: analyses, error: analysesError } = await supabase
    .from('transcript_analysis_results')
    .select(`
      id,
      transcript_id,
      themes,
      quotes,
      impact_assessment,
      cultural_flags,
      quality_metrics,
      tenant_id,
      created_at,
      transcripts!inner(
        storyteller_id,
        title,
        organization_id
      )
    `)
    .not('transcripts.storyteller_id', 'is', null)
    .order('created_at', { ascending: false });

  if (analysesError) {
    console.error('❌ Error fetching analyses:', analysesError);
    process.exit(1);
  }

  console.log(`   Found ${analyses?.length || 0} analyses with storyteller linkage`);

  // Group analyses by storyteller
  const storytellerAnalyses = new Map<string, TranscriptAnalysis[]>();

  for (const analysis of (analyses || []) as TranscriptAnalysis[]) {
    const storytellerId = analysis.transcripts?.storyteller_id;
    if (!storytellerId) continue;

    if (!storytellerAnalyses.has(storytellerId)) {
      storytellerAnalyses.set(storytellerId, []);
    }
    storytellerAnalyses.get(storytellerId)!.push(analysis);
  }

  console.log(`   Grouped into ${storytellerAnalyses.size} unique storytellers\n`);

  // Process each storyteller
  let successCount = 0;
  let errorCount = 0;
  let skipCount = 0;

  for (const [storytellerId, storytellerData] of storytellerAnalyses) {
    try {
      // Get tenant_id from first analysis
      const tenantId = storytellerData[0]?.tenant_id;

      if (!tenantId) {
        skipCount++;
        continue;
      }

      // Transform to ALMA signals
      const almaSignals = transformToALMASignals(storytellerData);
      const lcaaRhythm = transformToLCAA(storytellerData);
      const impactDimensions = extractImpactDimensions(storytellerData);

      // Aggregate themes
      const allThemes = [...new Set(storytellerData.flatMap(a => a.themes || []))];

      // Aggregate quotes (take up to 20)
      const allQuotes = storytellerData
        .flatMap(a => a.quotes || [])
        .slice(0, 20);

      // Check for existing record
      const { data: existing } = await supabase
        .from('storyteller_master_analysis')
        .select('id')
        .eq('storyteller_id', storytellerId)
        .single();

      // Combine LCAA rhythm into impact_dimensions (as per schema)
      const fullImpactDimensions = {
        ...impactDimensions,
        LCAA_rhythm: lcaaRhythm
      };

      const upsertData = {
        storyteller_id: storytellerId,
        tenant_id: tenantId,
        alma_signals: almaSignals,
        impact_dimensions: fullImpactDimensions,
        extracted_themes: allThemes,
        extracted_quotes: allQuotes,
        transcript_count: storytellerData.length,
        analyzed_at: new Date().toISOString()
      };

      if (existing) {
        const { error: updateError } = await supabase
          .from('storyteller_master_analysis')
          .update(upsertData)
          .eq('id', existing.id);

        if (updateError) {
          console.error(`   ❌ Error updating ${storytellerId}:`, updateError.message);
          errorCount++;
        } else {
          successCount++;
        }
      } else {
        const { error: insertError } = await supabase
          .from('storyteller_master_analysis')
          .insert(upsertData);

        if (insertError) {
          console.error(`   ❌ Error inserting ${storytellerId}:`, insertError.message);
          errorCount++;
        } else {
          successCount++;
        }
      }
    } catch (err) {
      console.error(`   ❌ Error processing ${storytellerId}:`, err);
      errorCount++;
    }
  }

  console.log('─'.repeat(70));
  console.log('📊 BACKFILL RESULTS');
  console.log('─'.repeat(70));
  console.log(`✅ Success: ${successCount} storytellers`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);

  // Verify
  const { count: finalCount } = await supabase
    .from('storyteller_master_analysis')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📈 Total storyteller_master_analysis records: ${finalCount}`);
  console.log('═'.repeat(70));
}

backfillStorytellerAnalysis().catch(console.error);
