const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixJoeKwonTranscript() {
  console.log('=== FIXING JOE KWON TRANSCRIPT CONNECTION ===\n');

  const confitTenantId = 'c22fcf84-5a09-4893-a8ef-758c781e88a8';
  const joeKwonId = 'af4f90cc-e528-4c78-ae9f-e9dd0bde27de';

  // Find transcripts in Confit Pathways tenant
  const { data: transcripts } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id, tenant_id, status, word_count, created_at')
    .eq('tenant_id', confitTenantId);

  console.log('Transcripts in Confit Pathways tenant:');
  if (transcripts && transcripts.length > 0) {
    transcripts.forEach(t => {
      console.log(`  • ID: ${t.id}`);
      console.log(`    Title: ${t.title || 'test'}`);
      console.log(`    Storyteller ID: ${t.storyteller_id || 'NULL'}`);
      console.log(`    Status: ${t.status}`);
      console.log(`    Words: ${t.word_count}`);
      console.log(`    Created: ${t.created_at}`);
      console.log('');
    });

    // Check if any transcript has no storyteller or wrong storyteller
    const orphanTranscripts = transcripts.filter(t => !t.storyteller_id || t.storyteller_id !== joeKwonId);

    if (orphanTranscripts.length > 0) {
      console.log(`Found ${orphanTranscripts.length} transcript(s) not properly linked to Joe Kwon`);
      console.log('Linking to Joe Kwon...\n');

      for (const transcript of orphanTranscripts) {
        const { error: updateError } = await supabase
          .from('transcripts')
          .update({
            storyteller_id: joeKwonId,
            tenant_id: confitTenantId  // Ensure correct tenant too
          })
          .eq('id', transcript.id);

        if (updateError) {
          console.log(`  ❌ Failed to link transcript ${transcript.id}: ${updateError.message}`);
        } else {
          console.log(`  ✅ Linked transcript "${transcript.title || 'test'}" to Joe Kwon`);
        }
      }
    } else {
      console.log('✅ All transcripts already properly linked to Joe Kwon');
    }
  } else {
    console.log('No transcripts found in Confit Pathways tenant');
  }

  // Verify final state
  console.log('\nVERIFICATION - Joe Kwon transcripts:');
  const { data: joeTranscripts } = await supabase
    .from('transcripts')
    .select('id, title, status, word_count, tenant_id')
    .eq('storyteller_id', joeKwonId);

  if (joeTranscripts && joeTranscripts.length > 0) {
    console.log(`Joe Kwon has ${joeTranscripts.length} transcript(s):`);
    joeTranscripts.forEach(t => {
      const inCorrectTenant = t.tenant_id === confitTenantId ? '✅' : '⚠️';
      console.log(`  ${inCorrectTenant} "${t.title || 'test'}" - ${t.status} (${t.word_count} words)`);
    });
  } else {
    console.log('  No transcripts found for Joe Kwon');
  }

  // Also verify Joe Kwon's profile is correct
  console.log('\nVERIFYING JOE KWON PROFILE:');
  const { data: joeProfile } = await supabase
    .from('profiles')
    .select('id, display_name, email, is_storyteller, tenant_id')
    .eq('id', joeKwonId)
    .single();

  if (joeProfile) {
    console.log(`  Name: ${joeProfile.display_name}`);
    console.log(`  Email: ${joeProfile.email}`);
    console.log(`  Is Storyteller: ${joeProfile.is_storyteller}`);
    console.log(`  Tenant: ${joeProfile.tenant_id === confitTenantId ? 'Confit Pathways ✅' : 'Wrong tenant ❌'}`);
  }
}

fixJoeKwonTranscript().catch(console.error);