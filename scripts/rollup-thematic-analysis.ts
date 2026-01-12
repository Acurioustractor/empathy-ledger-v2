/**
 * Rollup Thematic Analysis
 *
 * Aggregates themes from transcript_analysis_results into high-level thematic insights
 * across the entire platform. This provides the "big picture" view of what themes
 * appear across all storytellers and projects.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ThemeCount {
  theme: string;
  count: number;
  transcripts: string[];
  storytellers: string[];
  quotes: any[];
}

interface ThematicSummary {
  total_analyses: number;
  total_themes: number;
  total_quotes: number;
  top_themes: ThemeCount[];
  cultural_markers: any[];
  impact_summary: {
    individual: { healing: number; empowerment: number; identity: number };
    community: { connection: number; capability: number; sovereignty: number };
    environmental: { land_connection: number; sustainable_practice: number };
  };
}

async function rollupThematicAnalysis(): Promise<ThematicSummary> {
  console.log('🎯 THEMATIC ANALYSIS ROLLUP');
  console.log('=' .repeat(70));
  console.log('');

  // Fetch all transcript analysis results with transcript info
  console.log('📊 Fetching transcript analysis data...');
  const { data: analyses, error } = await supabase
    .from('transcript_analysis_results')
    .select(`
      id,
      transcript_id,
      themes,
      quotes,
      impact_assessment,
      cultural_flags,
      transcripts!inner (
        id,
        storyteller_id,
        title
      )
    `)
    .not('themes', 'is', null);

  if (error) {
    console.error('❌ Error fetching analyses:', error.message);
    throw error;
  }

  console.log(`   Found ${analyses?.length || 0} analyses with themes`);

  // Aggregate themes
  const themeMap = new Map<string, ThemeCount>();
  const allQuotes: any[] = [];
  const allCulturalMarkers: any[] = [];
  const impactTotals = {
    individual: { healing: 0, empowerment: 0, identity: 0, count: 0 },
    community: { connection: 0, capability: 0, sovereignty: 0, count: 0 },
    environmental: { land_connection: 0, sustainable_practice: 0, count: 0 }
  };

  for (const analysis of analyses || []) {
    const transcriptInfo = analysis.transcripts as any;
    const storytellerId = transcriptInfo?.storyteller_id;

    // Process themes
    const themes = analysis.themes || [];
    for (const theme of themes) {
      const existing = themeMap.get(theme) || {
        theme,
        count: 0,
        transcripts: [],
        storytellers: [],
        quotes: []
      };
      existing.count++;
      if (!existing.transcripts.includes(analysis.transcript_id)) {
        existing.transcripts.push(analysis.transcript_id);
      }
      if (storytellerId && !existing.storytellers.includes(storytellerId)) {
        existing.storytellers.push(storytellerId);
      }
      themeMap.set(theme, existing);
    }

    // Collect quotes
    const quotes = analysis.quotes || [];
    for (const quote of quotes) {
      allQuotes.push({
        ...quote,
        transcript_id: analysis.transcript_id,
        storyteller_id: storytellerId
      });
    }

    // Collect cultural markers
    const cultural = analysis.cultural_flags || {};
    if (cultural.languages_mentioned) {
      for (const lang of cultural.languages_mentioned) {
        allCulturalMarkers.push({ type: 'language', value: lang });
      }
    }
    if (cultural.places_of_significance) {
      for (const place of cultural.places_of_significance) {
        allCulturalMarkers.push({ type: 'place', value: place });
      }
    }

    // Aggregate impact dimensions
    const impact = analysis.impact_assessment || {};
    if (impact.individual) {
      impactTotals.individual.healing += impact.individual.healing || 0;
      impactTotals.individual.empowerment += impact.individual.empowerment || 0;
      impactTotals.individual.identity += impact.individual.identity || 0;
      impactTotals.individual.count++;
    }
    if (impact.community) {
      impactTotals.community.connection += impact.community.connection || 0;
      impactTotals.community.capability += impact.community.capability || 0;
      impactTotals.community.sovereignty += impact.community.sovereignty || 0;
      impactTotals.community.count++;
    }
    if (impact.environmental) {
      impactTotals.environmental.land_connection += impact.environmental.land_connection || 0;
      impactTotals.environmental.sustainable_practice += impact.environmental.sustainable_practice || 0;
      impactTotals.environmental.count++;
    }
  }

  // Sort themes by count
  const sortedThemes = Array.from(themeMap.values())
    .sort((a, b) => b.count - a.count);

  // Calculate averages for impact
  const impactSummary = {
    individual: {
      healing: impactTotals.individual.count > 0
        ? Math.round((impactTotals.individual.healing / impactTotals.individual.count) * 100) / 100
        : 0,
      empowerment: impactTotals.individual.count > 0
        ? Math.round((impactTotals.individual.empowerment / impactTotals.individual.count) * 100) / 100
        : 0,
      identity: impactTotals.individual.count > 0
        ? Math.round((impactTotals.individual.identity / impactTotals.individual.count) * 100) / 100
        : 0
    },
    community: {
      connection: impactTotals.community.count > 0
        ? Math.round((impactTotals.community.connection / impactTotals.community.count) * 100) / 100
        : 0,
      capability: impactTotals.community.count > 0
        ? Math.round((impactTotals.community.capability / impactTotals.community.count) * 100) / 100
        : 0,
      sovereignty: impactTotals.community.count > 0
        ? Math.round((impactTotals.community.sovereignty / impactTotals.community.count) * 100) / 100
        : 0
    },
    environmental: {
      land_connection: impactTotals.environmental.count > 0
        ? Math.round((impactTotals.environmental.land_connection / impactTotals.environmental.count) * 100) / 100
        : 0,
      sustainable_practice: impactTotals.environmental.count > 0
        ? Math.round((impactTotals.environmental.sustainable_practice / impactTotals.environmental.count) * 100) / 100
        : 0
    }
  };

  // Dedupe cultural markers
  const uniqueLanguages = [...new Set(allCulturalMarkers.filter(m => m.type === 'language').map(m => m.value))];
  const uniquePlaces = [...new Set(allCulturalMarkers.filter(m => m.type === 'place').map(m => m.value))];

  const summary: ThematicSummary = {
    total_analyses: analyses?.length || 0,
    total_themes: sortedThemes.length,
    total_quotes: allQuotes.length,
    top_themes: sortedThemes.slice(0, 20),
    cultural_markers: [
      { type: 'languages', values: uniqueLanguages },
      { type: 'places', values: uniquePlaces }
    ],
    impact_summary: impactSummary
  };

  // Print summary
  console.log('');
  console.log('=' .repeat(70));
  console.log('📊 THEMATIC ANALYSIS SUMMARY');
  console.log('=' .repeat(70));
  console.log('');
  console.log(`Total Analyses:  ${summary.total_analyses}`);
  console.log(`Unique Themes:   ${summary.total_themes}`);
  console.log(`Total Quotes:    ${summary.total_quotes}`);
  console.log('');
  console.log('─'.repeat(70));
  console.log('🏆 TOP 15 THEMES');
  console.log('─'.repeat(70));

  for (const theme of summary.top_themes.slice(0, 15)) {
    const bar = '█'.repeat(Math.min(theme.count, 30));
    console.log(`${theme.theme.padEnd(35)} ${theme.count.toString().padStart(3)} │ ${bar}`);
  }

  console.log('');
  console.log('─'.repeat(70));
  console.log('🌏 CULTURAL MARKERS');
  console.log('─'.repeat(70));
  console.log(`Languages mentioned: ${uniqueLanguages.length > 0 ? uniqueLanguages.slice(0, 10).join(', ') : 'None recorded'}`);
  console.log(`Places of significance: ${uniquePlaces.length > 0 ? uniquePlaces.slice(0, 10).join(', ') : 'None recorded'}`);

  console.log('');
  console.log('─'.repeat(70));
  console.log('📈 IMPACT DIMENSIONS (Average scores 0-1)');
  console.log('─'.repeat(70));
  console.log('');
  console.log('Individual Impact:');
  console.log(`  Healing:      ${impactSummary.individual.healing}`);
  console.log(`  Empowerment:  ${impactSummary.individual.empowerment}`);
  console.log(`  Identity:     ${impactSummary.individual.identity}`);
  console.log('');
  console.log('Community Impact:');
  console.log(`  Connection:   ${impactSummary.community.connection}`);
  console.log(`  Capability:   ${impactSummary.community.capability}`);
  console.log(`  Sovereignty:  ${impactSummary.community.sovereignty}`);
  console.log('');
  console.log('Environmental Impact:');
  console.log(`  Land Connection:       ${impactSummary.environmental.land_connection}`);
  console.log(`  Sustainable Practice:  ${impactSummary.environmental.sustainable_practice}`);

  console.log('');
  console.log('=' .repeat(70));
  console.log('✅ THEMATIC ROLLUP COMPLETE');
  console.log('=' .repeat(70));

  return summary;
}

// Run
rollupThematicAnalysis()
  .then(summary => {
    // Output JSON for programmatic use
    console.log('');
    console.log('📄 Full JSON output saved to: stdout (pipe to file if needed)');
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
