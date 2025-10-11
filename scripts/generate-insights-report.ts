import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const OONCHIUMPA_ORG_ID = 'c53077e1-98de-4216-9149-6268891ff62e';

async function gatherAllData() {
  console.log('📊 Gathering data...\n');

  // Get all storytellers
  const { data: storytellerProfiles } = await supabase
    .from('profile_organizations')
    .select(`
      profile_id,
      profiles!inner(
        id,
        display_name,
        full_name,
        bio,
        cultural_background,
        tenant_roles
      )
    `)
    .eq('organization_id', OONCHIUMPA_ORG_ID)
    .eq('is_active', true);

  const storytellers = storytellerProfiles
    ?.filter(sp => sp.profiles?.tenant_roles?.includes('storyteller'))
    .map(sp => sp.profiles) || [];

  // Get all transcripts with full analysis
  const allTranscripts = [];
  for (const storyteller of storytellers) {
    const { data: transcripts } = await supabase
      .from('transcripts')
      .select('id, title, ai_summary, themes, key_quotes')
      .eq('storyteller_id', storyteller.id);

    if (transcripts) {
      allTranscripts.push(...transcripts.map(t => ({
        ...t,
        storyteller_name: storyteller.display_name,
        storyteller_id: storyteller.id,
      })));
    }
  }

  console.log(`✅ Found ${storytellers.length} storytellers`);
  console.log(`✅ Found ${allTranscripts.length} transcripts\n`);

  return { storytellers, transcripts: allTranscripts };
}

async function generateInsights(data: any) {
  console.log('🤖 Generating cross-storyteller insights...\n');

  const storytellersContext = data.storytellers.map((s: any) => `
- ${s.display_name}: ${s.cultural_background || 'Not specified'}
  Bio: ${s.bio?.substring(0, 200)}...
  `).join('\n');

  const transcriptsContext = data.transcripts.map((t: any) => `
Transcript: "${t.title}" by ${t.storyteller_name}
Summary: ${t.ai_summary?.substring(0, 300)}...
Themes: ${t.themes?.join(', ')}
Key Quotes: ${t.key_quotes?.slice(0, 2).join(' | ')}
---
  `).join('\n');

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert at analyzing Indigenous Australian oral histories and identifying cross-cutting themes, patterns, and insights.

Your task is to analyze multiple storytellers' transcripts and provide:
1. Common themes across storytellers
2. Unique perspectives each storyteller brings
3. Key insights about community, culture, and connection
4. Patterns in storytelling approaches
5. Recommendations for how to present these stories together

Be respectful, culturally sensitive, and focus on amplifying Indigenous voices and perspectives.`,
        },
        {
          role: 'user',
          content: `Please analyze these Oonchiumpa storytellers and their transcripts:

STORYTELLERS:
${storytellersContext}

TRANSCRIPTS:
${transcriptsContext}

Provide a comprehensive analysis in JSON format:
{
  "executive_summary": "2-3 paragraph overview",
  "common_themes": [
    {
      "theme": "Theme name",
      "description": "What this theme represents",
      "storytellers": ["Names of storytellers who share this theme"],
      "significance": "Why this is important"
    }
  ],
  "storyteller_profiles": [
    {
      "name": "Storyteller name",
      "unique_contribution": "What makes their perspective unique",
      "key_narratives": ["Main stories/themes from their transcripts"]
    }
  ],
  "project_recommendations": {
    "law_student_workshops": "How to leverage these stories in educational context",
    "the_homestead": "Recommended storyteller assignments and focus areas",
    "future_initiatives": "Suggestions for new projects or directions"
  },
  "presentation_strategies": [
    "Strategy 1 for presenting these stories together",
    "Strategy 2...",
    "Strategy 3..."
  ],
  "next_steps": [
    "Recommended action 1",
    "Recommended action 2",
    "Recommended action 3"
  ]
}`,
        },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const insights = JSON.parse(completion.choices[0].message.content || '{}');
    return insights;
  } catch (error: any) {
    console.error(`❌ Error generating insights: ${error.message}`);
    throw error;
  }
}

function formatInsightsReport(insights: any): string {
  let report = `# Oonchiumpa Storytellers - Insights Report
*Generated: ${new Date().toLocaleDateString()}*

---

## Executive Summary

${insights.executive_summary}

---

## Common Themes Across Storytellers

`;

  insights.common_themes?.forEach((theme: any, idx: number) => {
    report += `### ${idx + 1}. ${theme.theme}

**Description:** ${theme.description}

**Shared by:** ${theme.storytellers?.join(', ')}

**Significance:** ${theme.significance}

---

`;
  });

  report += `## Individual Storyteller Contributions

`;

  insights.storyteller_profiles?.forEach((profile: any) => {
    report += `### ${profile.name}

**Unique Contribution:** ${profile.unique_contribution}

**Key Narratives:**
`;
    profile.key_narratives?.forEach((narrative: string) => {
      report += `- ${narrative}\n`;
    });
    report += '\n---\n\n';
  });

  report += `## Project Recommendations

### Law Student Workshops
${insights.project_recommendations?.law_student_workshops}

### The Homestead
${insights.project_recommendations?.the_homestead}

### Future Initiatives
${insights.project_recommendations?.future_initiatives}

---

## Presentation Strategies

`;

  insights.presentation_strategies?.forEach((strategy: string, idx: number) => {
    report += `${idx + 1}. ${strategy}\n\n`;
  });

  report += `---

## Next Steps

`;

  insights.next_steps?.forEach((step: string, idx: number) => {
    report += `${idx + 1}. ${step}\n`;
  });

  return report;
}

async function main() {
  console.log('🚀 Generating Oonchiumpa Storytellers Insights Report\n');

  const data = await gatherAllData();
  const insights = await generateInsights(data);

  console.log('✅ Insights generated\n');
  console.log('📝 Formatting report...\n');

  const report = formatInsightsReport(insights);

  // Save to file
  const outputPath = 'docs/OONCHIUMPA_INSIGHTS_REPORT.md';
  fs.writeFileSync(outputPath, report);

  console.log(`💾 Report saved to: ${outputPath}\n`);
  console.log('✨ Complete!\n');

  // Print key highlights
  console.log('📌 KEY HIGHLIGHTS:\n');
  console.log(`Common Themes: ${insights.common_themes?.length || 0}`);
  console.log(`Storyteller Profiles: ${insights.storyteller_profiles?.length || 0}`);
  console.log(`Presentation Strategies: ${insights.presentation_strategies?.length || 0}`);
  console.log(`Next Steps: ${insights.next_steps?.length || 0}`);
}

main().catch(console.error);
