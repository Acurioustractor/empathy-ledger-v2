/**
 * Phase 1 Foundation Setup: Create Kristy's Profile and Sample Transcripts
 *
 * This script sets up:
 * 1. Kristy Bloomfield's profile in the database
 * 2. 2-3 sample transcripts linked to her profile
 * 3. Basic organization and tenant data if needed
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration from .env.local
const SUPABASE_URL = 'https://yvnuayzslukamizrlhwb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Kristy's profile data (using actual DB columns)
const KRISTY_PROFILE = {
  id: '197c6c02-da4f-43df-a376-f9242249c297', // Fixed UUID for consistency
  email: 'kristy.bloomfield@example.com',
  full_name: 'Kristy Bloomfield',
  display_name: 'Kristy Bloomfield',
  is_storyteller: true,
  is_elder: false,
  bio: 'Community storyteller and cultural knowledge keeper with deep connections to local Indigenous traditions and histories.',
  personal_statement: 'Sharing stories that connect generations and preserve cultural wisdom.',
  onboarding_completed: true,
  profile_visibility: 'public',
  profile_status: 'active',
  allow_ai_analysis: true,
  allow_community_recommendations: true,
  consent_given: true,
  consent_date: new Date().toISOString(),
  consent_version: '1.0',
  storytelling_methods: ['oral_history', 'personal_narrative', 'cultural_knowledge'],
  community_roles: ['storyteller', 'knowledge_keeper'],
  is_featured: true
};

// Sample transcripts (minimal fields from actual schema)
const SAMPLE_TRANSCRIPTS = [
  {
    title: 'Growing Up on Country - Childhood Memories',
    transcript_content: `I remember being about five years old, walking with my grandmother along the creek bed.
She would stop at every plant, every tree, and tell me its story. Not just what it was called,
but why it mattered, how our ancestors used it, what it meant to our people.

She'd say, "This isn't just a tree, bubba. This is medicine. This is shelter. This is memory."

I didn't understand it then, but now I see - she was teaching me to read the land like a book.
Every rock, every waterhole had a chapter. And we were part of that story, not separate from it.`,
    language: 'en',
    cultural_sensitivity: 'standard',
    processing_status: 'pending',
    ai_analysis_allowed: true
  },
  {
    title: 'The Gathering Place - Community Connections',
    transcript_content: `The old meeting ground wasn't fancy. Just a clearing under the big paperbark trees,
with a fire pit in the middle that had been used for generations.

But that place held everything. Every important decision, every celebration, every time
we needed to come together as a community - we'd be there.

I can still smell the smoke, hear the aunties laughing, see the kids running around
while the elders talked. That's where I learned what community really means.
Not just people living near each other, but people who carry each other's stories,
who remember together, who take care of each other.

We lost access to that place when the highway went through. But we carry it with us.
The gathering place isn't gone - it's in how we still come together.`,
    language: 'en',
    cultural_sensitivity: 'standard',
    processing_status: 'pending',
    ai_analysis_allowed: true
  },
  {
    title: 'Language Keeper - Words That Hold Worlds',
    transcript_content: `My grandfather was one of the last fluent speakers. Every afternoon after school,
he'd sit with me on the verandah and we'd practice.

Some words were easy. Others... they carried so much meaning that English couldn't touch them.
One word might mean "the specific way sunlight filters through leaves at dawn" or
"the feeling of coming home after being away too long."

When he passed, I panicked. I thought I'd lost it all. But then my cousin and I started
recording everything we remembered. We'd call each other late at night:
"Remember that word Grandpa used for...?" And slowly, we started building it back.

It's not the same as when he was here. But language is living - it changes, adapts, survives.
We're keeping it alive, one word, one conversation at a time.`,
    language: 'en',
    cultural_sensitivity: 'restricted',
    processing_status: 'pending',
    ai_analysis_allowed: true,
    requires_elder_review: true
  }
];

async function setupKristyProfile() {
  console.log('🚀 Starting Phase 1 Foundation Setup\n');

  try {
    // Step 0: Check what columns exist in profiles table
    console.log('0️⃣ Checking profiles table schema...');
    const { data: sampleProfile } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single();

    if (sampleProfile) {
      console.log('   Available columns:', Object.keys(sampleProfile).join(', '));
    }

    // Step 1: Check if Kristy's profile already exists
    console.log('\n1️⃣ Checking for existing profile...');
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', KRISTY_PROFILE.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      throw checkError;
    }

    // Step 2: Create or update Kristy's profile
    if (existingProfile) {
      console.log('   ✓ Profile exists, updating...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update(KRISTY_PROFILE)
        .eq('id', KRISTY_PROFILE.id);

      if (updateError) throw updateError;
      console.log('   ✓ Profile updated successfully');
    } else {
      console.log('   ✓ Creating new profile...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([KRISTY_PROFILE]);

      if (insertError) throw insertError;
      console.log('   ✓ Profile created successfully');
    }

    // Step 3: Get or create tenant
    console.log('\n2️⃣ Setting up tenant...');
    let tenantId;

    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('name', 'Empathy Ledger Demo')
      .single();

    if (existingTenant) {
      tenantId = existingTenant.id;
      console.log('   ✓ Using existing tenant:', tenantId);
    } else {
      const { data: newTenant, error: tenantError } = await supabase
        .from('tenants')
        .insert([{
          name: 'Empathy Ledger Demo',
          slug: 'demo',
          status: 'active'
        }])
        .select('id')
        .single();

      if (tenantError) throw tenantError;
      tenantId = newTenant.id;
      console.log('   ✓ Created new tenant:', tenantId);
    }

    // Step 3.5: Check transcripts table columns
    console.log('\n2.5️⃣ Checking transcripts table schema...');
    const { data: sampleTranscript } = await supabase
      .from('transcripts')
      .select('*')
      .limit(1)
      .single();

    if (sampleTranscript) {
      console.log('   Available columns:', Object.keys(sampleTranscript).join(', '));
    } else {
      console.log('   No existing transcripts found');
    }

    // Step 4: Insert sample transcripts
    console.log('\n3️⃣ Creating sample transcripts...');

    for (let i = 0; i < SAMPLE_TRANSCRIPTS.length; i++) {
      const transcript = SAMPLE_TRANSCRIPTS[i];

      const { data, error } = await supabase
        .from('transcripts')
        .insert([{
          ...transcript,
          storyteller_id: KRISTY_PROFILE.id,
          tenant_id: tenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id, title')
        .single();

      if (error) {
        console.log(`   ⚠️  Warning: Could not create transcript "${transcript.title}"`);
        console.log(`      Error: ${error.message}`);
      } else {
        console.log(`   ✓ Created: "${data.title}" (${data.id})`);
      }
    }

    // Step 5: Verify setup
    console.log('\n4️⃣ Verifying setup...');
    const { data: transcripts, error: verifyError } = await supabase
      .from('transcripts')
      .select('id, title')
      .eq('storyteller_id', KRISTY_PROFILE.id);

    if (verifyError) throw verifyError;

    console.log(`   ✓ Found ${transcripts.length} transcripts for Kristy`);

    // Summary
    console.log('\n✅ Phase 1 Foundation Setup Complete!\n');
    console.log('📋 Summary:');
    console.log('   • Profile ID:', KRISTY_PROFILE.id);
    console.log('   • Profile Name:', KRISTY_PROFILE.full_name);
    console.log('   • Tenant ID:', tenantId);
    console.log('   • Transcripts:', transcripts.length);
    console.log('\n🔗 Next Steps:');
    console.log('   1. Test admin UI at /admin/transcripts');
    console.log('   2. Verify transcript editing works');
    console.log('   3. Test creating stories from transcripts');
    console.log(`   4. Check Kristy's profile at /storytellers/${KRISTY_PROFILE.id}`);

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('   Full error:', error);
    process.exit(1);
  }
}

// Run the setup
setupKristyProfile();
