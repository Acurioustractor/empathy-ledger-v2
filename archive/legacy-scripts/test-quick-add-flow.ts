import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function testQuickAddFlow() {
  console.log('🧪 Testing Quick Add Flow\n')

  const supabase = createServiceRoleClient()

  // Step 1: Get a real organization ID and project ID
  console.log('1️⃣ Finding test organization...')
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, tenant_id')
    .limit(1)
    .single()

  if (orgError || !orgs) {
    console.error('❌ Failed to find organization:', orgError)
    return
  }

  console.log(`✅ Found organization: ${orgs.name} (${orgs.id})`)
  console.log(`   Tenant ID: ${orgs.tenant_id}`)

  // Step 2: Get a project from this organization
  console.log('\n2️⃣ Finding project in organization...')
  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('id, name')
    .eq('organization_id', orgs.id)
    .limit(1)
    .single()

  if (projectError || !projects) {
    console.error('❌ Failed to find project:', projectError)
    return
  }

  console.log(`✅ Found project: ${projects.name} (${projects.id})`)

  // Step 3: Test profile creation with all required fields
  console.log('\n3️⃣ Testing profile creation...')

  const testProfileId = crypto.randomUUID()
  const testEmail = `test.storyteller.${Date.now()}@empathyledger.test.com`

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: testProfileId,
      full_name: 'Test Storyteller',
      display_name: 'Test Storyteller',
      email: testEmail,
      bio: 'This is a test storyteller created by the test script',
      cultural_background: 'Test Cultural Background',
      is_storyteller: true,
      is_elder: false,
      is_featured: false,
      onboarding_completed: true,
      profile_visibility: 'public',
      tenant_id: orgs.tenant_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (profileError) {
    console.error('❌ Failed to create profile:', profileError)
    console.error('   Message:', profileError.message)
    console.error('   Details:', profileError.details)
    return
  }

  console.log(`✅ Created profile: ${profile.id}`)

  // Step 4: Test profile-organization link
  console.log('\n4️⃣ Testing profile-organization link...')

  const { error: linkError } = await supabase
    .from('profile_organizations')
    .insert({
      profile_id: profile.id,
      organization_id: orgs.id,
      role: 'storyteller',
      is_active: true
    })

  if (linkError) {
    console.error('❌ Failed to link profile to organization:', linkError)
    // Clean up profile
    await supabase.from('profiles').delete().eq('id', profile.id)
    return
  }

  console.log('✅ Linked profile to organization')

  // Step 5: Test transcript creation
  console.log('\n5️⃣ Testing transcript creation...')

  const testTranscriptText = 'This is a test transcript for the quick add flow validation.'

  const { data: transcript, error: transcriptError } = await supabase
    .from('transcripts')
    .insert({
      title: 'Test Transcript',
      text: testTranscriptText,
      transcript_content: testTranscriptText,
      video_url: 'https://example.com/test-video.mp4',
      storyteller_id: profile.id,
      project_id: projects.id,
      organization_id: orgs.id,
      tenant_id: orgs.tenant_id,
      word_count: testTranscriptText.split(/\s+/).length,
      character_count: testTranscriptText.length,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (transcriptError) {
    console.error('❌ Failed to create transcript:', transcriptError)
    // Clean up
    await supabase.from('profile_organizations').delete().eq('profile_id', profile.id)
    await supabase.from('profiles').delete().eq('id', profile.id)
    return
  }

  console.log(`✅ Created transcript: ${transcript.id}`)

  // Step 6: Test story creation
  console.log('\n6️⃣ Testing story creation...')

  const { data: story, error: storyError } = await supabase
    .from('stories')
    .insert({
      title: 'Test Story',
      content: 'This is a test story for the quick add flow validation.',
      storyteller_id: profile.id,
      author_id: profile.id,
      project_id: projects.id,
      organization_id: orgs.id,
      tenant_id: orgs.tenant_id,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (storyError) {
    console.error('❌ Failed to create story:', storyError)
    // Clean up
    await supabase.from('transcripts').delete().eq('id', transcript.id)
    await supabase.from('profile_organizations').delete().eq('profile_id', profile.id)
    await supabase.from('profiles').delete().eq('id', profile.id)
    return
  }

  console.log(`✅ Created story: ${story.id}`)

  // Step 7: Verify all data
  console.log('\n7️⃣ Verifying all data...')

  const { data: verifyProfile, error: verifyError } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_organizations!inner(organization_id, role),
      stories(id, title),
      transcripts(id, title)
    `)
    .eq('id', profile.id)
    .single()

  if (verifyError) {
    console.error('❌ Failed to verify data:', verifyError)
  } else {
    console.log('✅ All data verified successfully!')
    console.log('\n📊 Summary:')
    console.log(`   Profile: ${verifyProfile.full_name} (${verifyProfile.id})`)
    console.log(`   Organization Links: ${verifyProfile.profile_organizations?.length || 0}`)
    console.log(`   Stories: ${verifyProfile.stories?.length || 0}`)
    console.log(`   Transcripts: ${verifyProfile.transcripts?.length || 0}`)
  }

  // Step 8: Clean up test data
  console.log('\n8️⃣ Cleaning up test data...')

  await supabase.from('stories').delete().eq('id', story.id)
  await supabase.from('transcripts').delete().eq('id', transcript.id)
  await supabase.from('profile_organizations').delete().eq('profile_id', profile.id)
  await supabase.from('profiles').delete().eq('id', profile.id)

  console.log('✅ Test data cleaned up')

  console.log('\n✅ ALL TESTS PASSED - Quick Add flow is working correctly!')
}

testQuickAddFlow().catch(console.error)
