#!/usr/bin/env node

/**
 * Complete Storyteller Workflow Test Script
 * Tests the entire flow from profile creation to story publication
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test data
const TEST_STORYTELLER = {
  email: 'test.storyteller@example.com',
  fullName: 'Sarah Johnson',
  displayName: 'Sarah J.',
  bio: 'Community elder and keeper of traditional stories. I share wisdom passed down through generations.',
  culturalBackground: 'Indigenous storyteller with 30+ years of experience',
  isStoryteller: true,
  isElder: true
};

const TEST_TRANSCRIPT = {
  title: 'My Journey as a Storyteller',
  content: `
    I began my journey as a storyteller when I was just seven years old, sitting at my grandmother's feet. 
    She would tell us stories every evening after dinner, stories that had been passed down through our family for generations.
    
    These weren't just stories - they were lessons, history, and wisdom all woven together. My grandmother taught me that 
    every story has a purpose, whether it's to teach, to heal, to remember, or to inspire.
    
    As I grew older, I realized that these stories were more than entertainment. They were our connection to our ancestors, 
    our land, and our identity. When my grandmother passed, she entrusted me with these stories, asking me to keep them 
    alive for future generations.
    
    Now, thirty years later, I share these stories with schools, community centers, and anyone who will listen. 
    Each time I tell a story, I see my grandmother's smile, and I know that our traditions live on through these words.
    
    The most important lesson I've learned is that everyone has a story worth telling. Our experiences, our struggles, 
    and our triumphs all contribute to the great tapestry of human experience. When we share our stories, we build 
    bridges between generations and cultures.
  `,
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Example video
  videoPlatform: 'youtube',
  hasVideo: true
};

const SAMPLE_PHOTOS = [
  {
    filename: 'grandmother-portrait.jpg',
    url: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8',
    description: 'My grandmother who taught me storytelling',
    type: 'image'
  },
  {
    filename: 'community-gathering.jpg',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac',
    description: 'Community storytelling circle',
    type: 'image'
  },
  {
    filename: 'traditional-artifacts.jpg',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca',
    description: 'Traditional items used in our stories',
    type: 'image'
  }
];

async function createTestStoryteller() {
  console.log('\n📝 Step 1: Creating Storyteller Profile\n');
  console.log('----------------------------------------');
  
  try {
    // Check if profile already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', TEST_STORYTELLER.email)
      .single();

    if (existing) {
      console.log('✅ Profile already exists:', existing.id);
      console.log('   Name:', existing.display_name || existing.full_name);
      console.log('   Email:', existing.email);
      return existing.id;
    }

    // Use existing tenant
    const tenantId = 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6'; // Oonchiumpa tenant

    // Create new profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        email: TEST_STORYTELLER.email,
        full_name: TEST_STORYTELLER.fullName,
        display_name: TEST_STORYTELLER.displayName,
        bio: TEST_STORYTELLER.bio,
        cultural_background: TEST_STORYTELLER.culturalBackground,
        is_storyteller: TEST_STORYTELLER.isStoryteller,
        is_elder: TEST_STORYTELLER.isElder,
        onboarding_completed: true,
        profile_visibility: 'public',
        consent_given: true,
        consent_date: new Date().toISOString(),
        ai_processing_consent: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Profile created successfully!');
    console.log('   ID:', profile.id);
    console.log('   Name:', profile.display_name);
    console.log('   Email:', profile.email);
    console.log('   Storyteller:', profile.is_storyteller ? 'Yes' : 'No');
    console.log('   Elder:', profile.is_elder ? 'Yes' : 'No');
    
    return profile.id;
  } catch (error) {
    console.error('❌ Error creating profile:', error.message);
    throw error;
  }
}

async function createTestTranscript(storytellerId) {
  console.log('\n📹 Step 2: Adding Transcript with Video\n');
  console.log('----------------------------------------');
  
  try {
    // Get tenant_id from storyteller profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', storytellerId)
      .single();
    
    // Create transcript
    const { data: transcript, error } = await supabase
      .from('transcripts')
      .insert({
        id: crypto.randomUUID(),
        tenant_id: profile?.tenant_id || 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6',
        storyteller_id: storytellerId,
        title: TEST_TRANSCRIPT.title,
        text: TEST_TRANSCRIPT.content,
        transcript_content: TEST_TRANSCRIPT.content,
        source_video_url: TEST_TRANSCRIPT.videoUrl,
        source_video_platform: TEST_TRANSCRIPT.videoPlatform,
        status: 'completed',
        word_count: TEST_TRANSCRIPT.content.split(/\s+/).length,
        character_count: TEST_TRANSCRIPT.content.length,
        duration: 300, // 5 minutes
        language: 'en',
        ai_processing_consent: true,
        processing_consent: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Transcript created successfully!');
    console.log('   ID:', transcript.id);
    console.log('   Title:', transcript.title);
    console.log('   Word Count:', transcript.word_count);
    console.log('   Video URL:', transcript.source_video_url);
    console.log('   Status:', transcript.status);
    
    return transcript.id;
  } catch (error) {
    console.error('❌ Error creating transcript:', error.message);
    throw error;
  }
}

async function createMediaAssets(storytellerId, transcriptId) {
  console.log('\n🖼️  Step 3: Adding Media Assets\n');
  console.log('----------------------------------------');
  
  const mediaIds = [];
  
  for (const photo of SAMPLE_PHOTOS) {
    try {
      const { data: media, error } = await supabase
        .from('media_assets')
        .insert({
          id: crypto.randomUUID(),
          filename: photo.filename,
          original_filename: photo.filename,
          url: photo.url,
          cdn_url: photo.url,
          file_type: photo.type,
          media_type: photo.type,
          mime_type: 'image/jpeg',
          file_size: 1024000, // 1MB placeholder
          storage_bucket: 'media',
          storage_path: `storytellers/${storytellerId}/${photo.filename}`,
          uploaded_by: storytellerId,
          title: photo.description,
          description: photo.description,
          processing_status: 'completed',
          visibility: 'public',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Media asset created: ${photo.filename}`);
      mediaIds.push(media.id);
    } catch (error) {
      console.error(`❌ Error creating media asset ${photo.filename}:`, error.message);
    }
  }
  
  console.log(`\n📊 Created ${mediaIds.length} media assets`);
  return mediaIds;
}

async function displayWorkflowInstructions(storytellerId, transcriptId, mediaIds) {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('             🎯 TEST DATA CREATED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n📋 Test Data Summary:');
  console.log('--------------------');
  console.log(`Storyteller ID: ${storytellerId}`);
  console.log(`Transcript ID:  ${transcriptId}`);
  console.log(`Media Assets:   ${mediaIds.length} photos`);
  
  console.log('\n\n🚀 TESTING INSTRUCTIONS - Follow These Steps:\n');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log('1️⃣  OPEN STORYTELLER DASHBOARD');
  console.log('   -------------------------------');
  console.log(`   👉 Click here: http://localhost:3000/storytellers/${storytellerId}/dashboard`);
  console.log('   You should see:');
  console.log('   • Profile info for Sarah Johnson');
  console.log('   • 1 transcript in the Transcripts tab');
  console.log('   • Stats showing content counts\n');
  
  console.log('2️⃣  TEST AI STORY GENERATION');
  console.log('   --------------------------');
  console.log('   a) In the Transcripts tab, find "My Journey as a Storyteller"');
  console.log('   b) Click the purple "AI Generate" button');
  console.log('   c) In the dialog that opens:');
  console.log('      • Select Target Audience (try "All Ages")');
  console.log('      • Select Story Type (try "Personal Journey")');
  console.log('      • Add Cultural Context (optional): "Respectful of Indigenous traditions"');
  console.log('      • Adjust Story Length slider (try 2000 words)');
  console.log('   d) Click "Generate Story"');
  console.log('   e) Watch the progress bar - should take 10-20 seconds\n');
  
  console.log('3️⃣  REVIEW AI ANALYSIS');
  console.log('   -------------------');
  console.log('   After generation completes, you\'ll see 3 tabs:');
  console.log('   • Analysis Tab: Shows themes, emotional tone, key moments');
  console.log('   • Story Tab: The generated story content');
  console.log('   • Media Tab: Suggested photos/videos to include\n');
  
  console.log('4️⃣  EDIT AND SAVE STORY');
  console.log('   --------------------');
  console.log('   a) Click the Story tab');
  console.log('   b) Review the generated story');
  console.log('   c) Click "Edit Story" to make changes');
  console.log('   d) Click "Save as Draft" to save');
  console.log('   e) Or click "Continue to Full Editor" for more options\n');
  
  console.log('5️⃣  ADD PHOTOS TO STORY');
  console.log('   ---------------------');
  console.log('   In the full story editor:');
  console.log('   a) You\'ll see the 3 sample photos we created');
  console.log('   b) Click on photos to add them to your story');
  console.log('   c) Arrange them using drag and drop');
  console.log('   d) Add captions if desired\n');
  
  console.log('6️⃣  PUBLISH THE STORY');
  console.log('   ------------------');
  console.log('   a) Review all content');
  console.log('   b) Set privacy/sharing settings');
  console.log('   c) If cultural content, may require elder approval');
  console.log('   d) Click "Submit for Review" or "Publish"\n');
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n🔍 WHAT TO VERIFY:\n');
  console.log('   ✓ Profile displays correctly with elder badge');
  console.log('   ✓ Transcript shows with video link');
  console.log('   ✓ AI Generation produces meaningful themes');
  console.log('   ✓ Generated story maintains authentic voice');
  console.log('   ✓ Media suggestions are relevant');
  console.log('   ✓ Story can be edited and saved');
  console.log('   ✓ Photos can be attached to story');
  console.log('   ✓ Cultural sensitivity is detected\n');
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n💡 TROUBLESHOOTING:\n');
  console.log('   • If AI generation fails: Check OPENAI_API_KEY in .env.local');
  console.log('   • If no transcripts show: Refresh the page');
  console.log('   • If media doesn\'t load: Check Supabase storage settings');
  console.log('   • If save fails: Check browser console for errors\n');
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n🎬 Ready to test! Open the dashboard link above to begin.\n');
}

async function cleanupTestData() {
  console.log('\n🧹 Cleanup Option\n');
  console.log('----------------');
  console.log('To remove test data later, run:');
  console.log('node scripts/test-storyteller-workflow.js --cleanup\n');
}

async function runCleanup() {
  console.log('\n🧹 Cleaning up test data...\n');
  
  try {
    // Delete test profile and related data (cascades)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('email', TEST_STORYTELLER.email);
    
    if (error) throw error;
    
    console.log('✅ Test data cleaned up successfully!\n');
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    await runCleanup();
    return;
  }
  
  console.log('\n🚀 STORYTELLER WORKFLOW TEST SCRIPT');
  console.log('====================================\n');
  console.log('This script will create test data and guide you through');
  console.log('the complete storyteller workflow from profile to publication.\n');
  
  try {
    // Step 1: Create storyteller profile
    const storytellerId = await createTestStoryteller();
    
    // Step 2: Create transcript with video
    const transcriptId = await createTestTranscript(storytellerId);
    
    // Step 3: Create media assets
    const mediaIds = await createMediaAssets(storytellerId, transcriptId);
    
    // Step 4: Display testing instructions
    await displayWorkflowInstructions(storytellerId, transcriptId, mediaIds);
    
    // Step 5: Cleanup instructions
    await cleanupTestData();
    
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);