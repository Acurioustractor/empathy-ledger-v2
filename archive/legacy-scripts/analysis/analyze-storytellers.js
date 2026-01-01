#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeStorytellerContent() {
  console.log('📊 STORYTELLER AND CONTENT ANALYSIS\n');

  // Get all storytellers (profiles with transcripts)
  const { data: allTranscripts } = await supabase
    .from('transcripts')
    .select('storyteller_id, title, project_id, profiles(display_name, tenant_id)')
    .not('storyteller_id', 'is', null);

  console.log(`📝 Total transcripts with storytellers: ${allTranscripts?.length || 0}`);

  // Group by storyteller
  const storytellerMap = new Map();
  allTranscripts?.forEach(transcript => {
    const id = transcript.storyteller_id;
    if (!storytellerMap.has(id)) {
      storytellerMap.set(id, {
        name: transcript.profiles?.display_name || 'Unknown',
        tenant_id: transcript.profiles?.tenant_id,
        transcripts: [],
        projects: new Set()
      });
    }
    storytellerMap.get(id).transcripts.push(transcript.title);
    if (transcript.project_id) {
      storytellerMap.get(id).projects.add(transcript.project_id);
    }
  });

  console.log(`\n👥 Active storytellers (${storytellerMap.size}):`);
  const snowTenantId = '96197009-c7bb-4408-89de-cd04085cdf44';

  storytellerMap.forEach((storyteller, id) => {
    const inSnow = storyteller.tenant_id === snowTenantId;
    console.log(`   - ${storyteller.name} (${storyteller.transcripts.length} transcripts) ${inSnow ? '✅ In Snow' : '❌ Not in Snow'}`);
    console.log(`     Projects: ${Array.from(storyteller.projects).join(', ') || 'None'}`);
    storyteller.transcripts.slice(0, 2).forEach(title => {
      console.log(`     - ${title}`);
    });
    if (storyteller.transcripts.length > 2) {
      console.log(`     ... and ${storyteller.transcripts.length - 2} more`);
    }
    console.log('');
  });

  // Check which storytellers should potentially be linked to Snow Foundation
  console.log('🎯 STORYTELLERS WHO COULD BE LINKED TO SNOW FOUNDATION:');
  console.log('(Based on Indigenous content, cultural themes, or community focus)\n');

  // Look for storytellers with culturally relevant content
  for (const [id, storyteller] of storytellerMap) {
    const culturalKeywords = storyteller.transcripts.some(title =>
      title.toLowerCase().includes('indigenous') ||
      title.toLowerCase().includes('aboriginal') ||
      title.toLowerCase().includes('community') ||
      title.toLowerCase().includes('cultural') ||
      title.toLowerCase().includes('traditional') ||
      title.toLowerCase().includes('elder') ||
      title.toLowerCase().includes('country') ||
      title.toLowerCase().includes('mob') ||
      title.toLowerCase().includes('deadly') ||
      title.toLowerCase().includes('heart')
    );

    if (culturalKeywords && storyteller.tenant_id !== snowTenantId) {
      console.log(`🌟 ${storyteller.name} - Potential Snow Foundation storyteller`);
      console.log(`   Relevant transcripts:`);
      storyteller.transcripts.forEach(title => {
        if (title.toLowerCase().includes('indigenous') ||
            title.toLowerCase().includes('aboriginal') ||
            title.toLowerCase().includes('community') ||
            title.toLowerCase().includes('cultural') ||
            title.toLowerCase().includes('deadly') ||
            title.toLowerCase().includes('heart')) {
          console.log(`     - ${title}`);
        }
      });
      console.log('');
    }
  }

  // Summary
  const storytellersInSnow = Array.from(storytellerMap.values()).filter(s => s.tenant_id === snowTenantId);
  const storytellersNotInSnow = Array.from(storytellerMap.values()).filter(s => s.tenant_id !== snowTenantId);

  console.log('📊 SUMMARY:');
  console.log(`   - Storytellers in Snow Foundation: ${storytellersInSnow.length}`);
  console.log(`   - Storytellers not in Snow Foundation: ${storytellersNotInSnow.length}`);
  console.log(`   - Total active storytellers: ${storytellerMap.size}`);
}

analyzeStorytellerContent();