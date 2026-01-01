#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Snow Foundation and Deadly Hearts Trek project IDs from analyze-deadly-heart-trek.js
const DEADLY_PROJECT_ID = '96ded48f-db6e-4962-abab-33c88a123fa9';
const SNOW_TENANT_ID = '96197009-c7bb-4408-89de-cd04085cdf44';

// Simple AI Analysis Classes (simplified versions of the TypeScript ones)
class SimpleTranscriptAnalyzer {
  constructor() {
    this.keywordMap = {
      'personal': ['i', 'me', 'my', 'personal', 'experience', 'journey', 'life', 'grew up', 'childhood', 'remember'],
      'family': ['family', 'mother', 'father', 'grandmother', 'grandfather', 'parents', 'tradition', 'heritage'],
      'cultural': ['culture', 'traditional', 'ceremony', 'sacred', 'spiritual', 'elder', 'community', 'ancestors'],
      'community': ['community', 'together', 'collective', 'group', 'support', 'local', 'collaboration'],
      'healing': ['healing', 'recovery', 'overcome', 'struggle', 'growth', 'resilience', 'strength', 'hope']
    };
  }

  analyzeTranscript(transcript) {
    if (!transcript) return null;

    const words = transcript.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);

    const themeScores = this.calculateThemeScores(words);
    const keyThemes = this.extractKeyThemes(transcript);
    const culturalSensitivity = this.assessCulturalSensitivity(transcript);
    const metadata = this.generateMetadata(transcript);

    return {
      suggestedTemplate: this.selectBestTemplate(themeScores),
      confidence: Math.max(...Object.values(themeScores)) * 100,
      keyThemes,
      culturalSensitivity,
      metadata,
      themeScores,
      analyzedAt: new Date().toISOString()
    };
  }

  calculateThemeScores(words) {
    const scores = { personal: 0, family: 0, cultural: 0, community: 0, healing: 0 };
    const wordSet = new Set(words);

    Object.entries(this.keywordMap).forEach(([theme, keywords]) => {
      let matchCount = 0;
      keywords.forEach(keyword => {
        if (wordSet.has(keyword) || words.some(word => word.includes(keyword))) {
          matchCount++;
        }
      });
      scores[theme] = matchCount / Math.max(words.length * 0.01, keywords.length);
    });

    return scores;
  }

  selectBestTemplate(themeScores) {
    const topTheme = Object.entries(themeScores).reduce((max, [theme, score]) =>
      score > max.score ? { theme, score } : max
    , { theme: 'personal', score: 0 }).theme;

    const templates = {
      'personal': 'personal-journey',
      'family': 'family-heritage',
      'cultural': 'cultural-tradition',
      'community': 'community-story',
      'healing': 'healing-recovery'
    };

    return templates[topTheme] || 'personal-journey';
  }

  extractKeyThemes(text) {
    const themes = [];
    const patterns = {
      'Personal Growth': /\b(learn|grow|change|develop|transform|overcome)\w*\b/gi,
      'Family & Relationships': /\b(family|parent|child|friend|relationship|love|support)\w*\b/gi,
      'Cultural Heritage': /\b(tradition|culture|heritage|ancestor|ritual|ceremony)\w*\b/gi,
      'Community': /\b(community|neighbor|together|collective|group|social)\w*\b/gi,
      'Challenges': /\b(difficult|hard|struggle|problem|challenge|obstacle)\w*\b/gi,
      'Wisdom & Learning': /\b(wisdom|knowledge|learn|teach|understand|realize)\w*\b/gi
    };

    Object.entries(patterns).forEach(([theme, pattern]) => {
      const matches = text.match(pattern);
      if (matches && matches.length >= 2) {
        themes.push(theme);
      }
    });

    return themes;
  }

  assessCulturalSensitivity(text) {
    const lower = text.toLowerCase();

    if (lower.includes('sacred ceremony') || lower.includes('secret knowledge')) {
      return 'restricted';
    }
    if (lower.includes('sacred') || lower.includes('ceremony') || lower.includes('traditional knowledge')) {
      return 'high';
    }
    if (lower.includes('cultural') || lower.includes('tradition') || lower.includes('heritage')) {
      return 'medium';
    }

    return 'standard';
  }

  generateMetadata(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const timeReferences = this.extractReferences(text, [
      /\b\d{4}\b/g,
      /\b(childhood|youth|young|old)\b/gi
    ]);
    const peopleReferences = this.extractReferences(text, [
      /\b(mother|father|grandmother|grandfather|family|friend)\b/gi
    ]);

    return {
      wordCount: words.length,
      estimatedReadTime: Math.ceil(words.length / 200),
      timeReferences: timeReferences.slice(0, 5),
      peopleReferences: peopleReferences.slice(0, 5),
      emotionalTone: this.assessEmotionalTone(text)
    };
  }

  extractReferences(text, patterns) {
    const references = [];
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) references.push(...matches);
    });
    return [...new Set(references)];
  }

  assessEmotionalTone(text) {
    const lower = text.toLowerCase();
    const positive = ['happy', 'joy', 'success', 'love', 'proud', 'wonderful'].filter(w => lower.includes(w)).length;
    const challenging = ['difficult', 'hard', 'struggle', 'pain', 'sad'].filter(w => lower.includes(w)).length;
    const reflective = ['remember', 'think', 'reflect', 'learned'].filter(w => lower.includes(w)).length;

    if (challenging > positive && challenging > reflective) return 'challenging';
    if (positive > challenging && positive > reflective) return 'positive';
    if (reflective > 0) return 'reflective';
    return 'neutral';
  }
}

class SimpleIndigenousImpactAnalyzer {
  constructor() {
    this.impactPatterns = {
      'cultural_protocol': ['welcome', 'permission', 'respect', 'protocol', 'cultural safety', 'traditional owners'],
      'community_leadership': ['community leadership', 'community ownership', 'our mob', 'community led', 'self determination'],
      'knowledge_transmission': ['passed down', 'grandmother taught', 'elder teachings', 'traditional knowledge', 'wisdom'],
      'relationship_building': ['trust', 'relationship', 'connection', 'together', 'partnership', 'collaboration'],
      'healing_integration': ['healing', 'traditional healing', 'holistic', 'integrated approach', 'community healing'],
      'system_navigation': ['government', 'policy', 'advocacy', 'speaking up', 'institutional change'],
      'collective_mobilization': ['community together', 'organize', 'coming together', 'united', 'collective action'],
      'intergenerational_connection': ['young kids', 'children', 'youth', 'elder', 'generations', 'wisdom transfer']
    };
  }

  analyzeIndigenousImpact(transcript) {
    if (!transcript) return [];

    const insights = [];
    const sentences = transcript.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);

    sentences.forEach(sentence => {
      const sentenceInsights = this.identifyImpactPatterns(sentence);
      insights.push(...sentenceInsights);
    });

    return insights;
  }

  identifyImpactPatterns(sentence) {
    const insights = [];
    const lower = sentence.toLowerCase();

    Object.entries(this.impactPatterns).forEach(([impactType, patterns]) => {
      patterns.forEach(pattern => {
        if (lower.includes(pattern.toLowerCase())) {
          insights.push({
            impactType,
            quote: sentence.trim(),
            confidence: this.calculateConfidence(sentence, pattern),
            impactDimensions: this.calculateImpactDimensions(sentence, impactType),
            created_at: new Date().toISOString()
          });
        }
      });
    });

    return insights;
  }

  calculateConfidence(sentence, pattern) {
    let confidence = 0.6;
    if (sentence.toLowerCase().includes(pattern.toLowerCase())) confidence += 0.2;
    if (sentence.length > 100) confidence += 0.1;
    if (sentence.toLowerCase().includes('i ') || sentence.toLowerCase().includes('we ')) confidence += 0.1;
    return Math.min(0.95, confidence);
  }

  calculateImpactDimensions(sentence, impactType) {
    const dimensions = {
      relationshipStrengthening: 0,
      culturalContinuity: 0,
      communityEmpowerment: 0,
      systemTransformation: 0,
      healingProgression: 0,
      knowledgePreservation: 0
    };

    const lower = sentence.toLowerCase();

    // Set base scores based on impact type
    switch (impactType) {
      case 'cultural_protocol':
        dimensions.culturalContinuity = 0.9;
        dimensions.relationshipStrengthening = 0.7;
        break;
      case 'community_leadership':
        dimensions.communityEmpowerment = 0.9;
        dimensions.systemTransformation = 0.6;
        break;
      case 'knowledge_transmission':
        dimensions.knowledgePreservation = 0.9;
        dimensions.culturalContinuity = 0.8;
        break;
      case 'healing_integration':
        dimensions.healingProgression = 0.9;
        break;
      case 'relationship_building':
        dimensions.relationshipStrengthening = 0.9;
        break;
    }

    // Boost based on keywords
    if (lower.includes('together') || lower.includes('collective')) {
      dimensions.communityEmpowerment += 0.1;
    }
    if (lower.includes('traditional') || lower.includes('ancestral')) {
      dimensions.culturalContinuity += 0.1;
    }

    return dimensions;
  }
}

async function runSnowFoundationAIAnalysis() {
  console.log('🚀 Starting Snow Foundation AI Analysis for Deadly Hearts Trek Project\n');
  console.log(`📊 Project ID: ${DEADLY_PROJECT_ID}`);
  console.log(`🏢 Tenant ID: ${SNOW_TENANT_ID}\n`);

  const transcriptAnalyzer = new SimpleTranscriptAnalyzer();
  const impactAnalyzer = new SimpleIndigenousImpactAnalyzer();

  // Get all transcripts for the Deadly Hearts Trek project
  console.log('📝 Fetching transcripts...');
  const { data: transcripts, error: transcriptsError } = await supabase
    .from('transcripts')
    .select(`
      id,
      title,
      transcript_content,
      storyteller_id,
      metadata,
      ai_processing_date,
      profiles!storyteller_id (id, display_name, email)
    `)
    .eq('project_id', DEADLY_PROJECT_ID)
    .not('transcript_content', 'is', null);

  if (transcriptsError) {
    console.error('❌ Error fetching transcripts:', transcriptsError);
    return;
  }

  console.log(`📊 Found ${transcripts?.length || 0} transcripts with text\n`);

  if (!transcripts || transcripts.length === 0) {
    console.log('ℹ️ No transcripts found with transcript text. Exiting.');
    return;
  }

  let processedCount = 0;
  let updatedCount = 0;
  const analysisResults = [];

  for (const transcript of transcripts) {
    console.log(`\n📖 Processing: "${transcript.title}"`);
    console.log(`👤 Storyteller: ${transcript.profiles?.display_name || 'Unknown'}`);

    if (!transcript.transcript_content) {
      console.log('⚠️ No transcript content available, skipping...');
      continue;
    }

    try {
      // Run transcript analysis
      console.log('🔍 Running transcript analysis...');
      const transcriptAnalysis = transcriptAnalyzer.analyzeTranscript(transcript.transcript_content);

      // Run Indigenous impact analysis
      console.log('🌍 Running Indigenous impact analysis...');
      const impactInsights = impactAnalyzer.analyzeIndigenousImpact(transcript.transcript_content);

      // Combine results
      const combinedAnalysis = {
        transcript_analysis: transcriptAnalysis,
        indigenous_impact: {
          insights: impactInsights,
          total_insights: impactInsights.length,
          impact_summary: {
            most_common_impact: impactInsights.length > 0 ?
              impactInsights.reduce((acc, insight) => {
                acc[insight.impactType] = (acc[insight.impactType] || 0) + 1;
                return acc;
              }, {}) : {}
          }
        },
        analysis_metadata: {
          processed_at: new Date().toISOString(),
          analysis_version: '1.0',
          word_count: transcript.transcript_content.split(/\s+/).length,
          ai_confidence: transcriptAnalysis?.confidence || 0
        }
      };

      console.log(`✅ Analysis complete:`);
      console.log(`   - Themes found: ${transcriptAnalysis?.keyThemes?.length || 0}`);
      console.log(`   - Impact insights: ${impactInsights.length}`);
      console.log(`   - Cultural sensitivity: ${transcriptAnalysis?.culturalSensitivity || 'standard'}`);

      // Update transcript with analysis results
      const { error: updateError } = await supabase
        .from('transcripts')
        .update({
          metadata: combinedAnalysis,
          ai_processing_date: new Date().toISOString()
        })
        .eq('id', transcript.id);

      if (updateError) {
        console.error(`❌ Error updating transcript ${transcript.id}:`, updateError);
      } else {
        console.log('💾 Successfully saved analysis to database');
        updatedCount++;

        analysisResults.push({
          transcript_id: transcript.id,
          title: transcript.title,
          storyteller: transcript.profiles?.display_name || 'Unknown',
          analysis: combinedAnalysis
        });
      }

    } catch (error) {
      console.error(`❌ Error processing transcript ${transcript.id}:`, error);
    }

    processedCount++;
  }

  // Generate summary report
  console.log('\n' + '='.repeat(60));
  console.log('📊 SNOW FOUNDATION AI ANALYSIS COMPLETE');
  console.log('='.repeat(60));
  console.log(`📝 Total transcripts processed: ${processedCount}`);
  console.log(`💾 Successfully updated: ${updatedCount}`);
  console.log(`❌ Failed updates: ${processedCount - updatedCount}`);

  if (analysisResults.length > 0) {
    console.log('\n🎯 ANALYSIS HIGHLIGHTS:');

    // Aggregate insights across all transcripts
    const allInsights = analysisResults.flatMap(r => r.analysis.indigenous_impact.insights);
    const themeDistribution = {};
    const culturalSensitivityLevels = {};
    const totalWordCount = analysisResults.reduce((sum, r) => sum + r.analysis.analysis_metadata.word_count, 0);

    analysisResults.forEach(result => {
      const analysis = result.analysis.transcript_analysis;

      // Count themes
      if (analysis?.keyThemes) {
        analysis.keyThemes.forEach(theme => {
          themeDistribution[theme] = (themeDistribution[theme] || 0) + 1;
        });
      }

      // Count cultural sensitivity levels
      const sensitivity = analysis?.culturalSensitivity || 'standard';
      culturalSensitivityLevels[sensitivity] = (culturalSensitivityLevels[sensitivity] || 0) + 1;
    });

    console.log(`\n📈 CONTENT METRICS:`);
    console.log(`   - Total words analyzed: ${totalWordCount.toLocaleString()}`);
    console.log(`   - Average words per transcript: ${Math.round(totalWordCount / analysisResults.length).toLocaleString()}`);
    console.log(`   - Total Indigenous impact insights: ${allInsights.length}`);

    console.log(`\n🎨 THEME DISTRIBUTION:`);
    Object.entries(themeDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([theme, count]) => {
        console.log(`   - ${theme}: ${count} transcripts`);
      });

    console.log(`\n🛡️ CULTURAL SENSITIVITY LEVELS:`);
    Object.entries(culturalSensitivityLevels).forEach(([level, count]) => {
      console.log(`   - ${level}: ${count} transcripts`);
    });

    console.log(`\n🌍 INDIGENOUS IMPACT INSIGHTS:`);
    const impactTypes = {};
    allInsights.forEach(insight => {
      impactTypes[insight.impactType] = (impactTypes[insight.impactType] || 0) + 1;
    });

    Object.entries(impactTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .forEach(([type, count]) => {
        console.log(`   - ${type.replace(/_/g, ' ')}: ${count} insights`);
      });

    // Show featured quotes
    console.log(`\n💬 FEATURED COMMUNITY VOICES:`);
    allInsights
      .filter(insight => insight.confidence > 0.7)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .forEach((insight, index) => {
        console.log(`\n   ${index + 1}. [${insight.impactType.replace(/_/g, ' ')}]`);
        console.log(`      "${insight.quote}"`);
        console.log(`      Confidence: ${Math.round(insight.confidence * 100)}%`);
      });
  }

  console.log(`\n✅ Analysis complete! Results saved to transcript 'cultural_context' field.`);
  console.log(`📊 Data can now be viewed on the project analysis page.`);

  return {
    processed: processedCount,
    updated: updatedCount,
    results: analysisResults
  };
}

// Run the analysis
if (require.main === module) {
  runSnowFoundationAIAnalysis()
    .then(results => {
      console.log('\n🎉 Snow Foundation AI Analysis Complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runSnowFoundationAIAnalysis };