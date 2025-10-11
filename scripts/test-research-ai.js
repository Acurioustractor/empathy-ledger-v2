// Quick test of research AI capabilities
const { researchTopic, researchCulturalContext, factCheck } = require('./src/lib/ai/research-helper.ts');

async function testResearchAI() {
  console.log('🔬 Testing Research AI Tools...\n');

  // Test 1: Research cultural context
  console.log('1️⃣ Testing cultural context research...');
  try {
    const context = await researchCulturalContext(
      'storytelling and oral traditions',
      'Aboriginal Australian'
    );
    console.log('✅ Cultural context research successful!');
    console.log('📝 Result preview:', context.substring(0, 200) + '...\n');
  } catch (error) {
    console.error('❌ Cultural context research failed:', error.message, '\n');
  }

  // Test 2: Basic research
  console.log('2️⃣ Testing basic topic research...');
  try {
    const result = await researchTopic('Indigenous Australian art and culture', {
      maxResults: 3,
      includeAnswer: true
    });
    console.log('✅ Topic research successful!');
    console.log(`📊 Found ${result.results.length} sources`);
    if (result.answer) {
      console.log('💡 Answer:', result.answer.substring(0, 150) + '...\n');
    }
  } catch (error) {
    console.error('❌ Topic research failed:', error.message, '\n');
  }

  // Test 3: Fact checking
  console.log('3️⃣ Testing fact-checking...');
  try {
    const verification = await factCheck('Aboriginal Australians have the oldest continuous culture on Earth');
    console.log('✅ Fact-check successful!');
    console.log(`🎯 Confidence: ${verification.confidence}`);
    console.log(`📋 Sources: ${verification.sources.length}`);
    console.log(`💬 Verification:`, verification.verification.substring(0, 150) + '...\n');
  } catch (error) {
    console.error('❌ Fact-check failed:', error.message, '\n');
  }

  console.log('✨ Research AI testing complete!\n');
}

testResearchAI().catch(console.error);
