import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function fixOonchiumpaStorytellerLinks() {
  console.log('🔧 Fixing Oonchiumpa Storyteller Links\n')

  const supabase = createServiceRoleClient()

  // Get Oonchiumpa organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, tenant_id')
    .ilike('name', '%oonchiumpa%')
    .single()

  if (orgError || !org) {
    console.error('❌ Failed to find Oonchiumpa:', orgError)
    return
  }

  console.log('📍 Organization:', org.name)
  console.log('   ID:', org.id)
  console.log('   Tenant ID:', org.tenant_id)

  // Get all storytellers in this organization
  const { data: storytellers, error: storytellersError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('tenant_id', org.tenant_id)
    .eq('is_storyteller', true)

  if (storytellersError || !storytellers) {
    console.error('❌ Failed to get storytellers:', storytellersError)
    return
  }

  console.log('\n👥 Found storytellers:', storytellers.length)
  storytellers.forEach(s => console.log(`   - ${s.full_name} (${s.id})`))

  // Create a mapping of names to IDs for fuzzy matching
  const storytellerMap: Record<string, string> = {}
  storytellers.forEach(s => {
    const nameLower = s.full_name.toLowerCase()
    storytellerMap[nameLower] = s.id

    // Also add first name only for matching
    const firstName = s.full_name.split(' ')[0].toLowerCase()
    if (firstName) {
      storytellerMap[firstName] = s.id
    }
  })

  // Get "The Homestead" project ID
  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('organization_id', org.id)
    .ilike('name', '%homestead%')
    .single()

  if (!project) {
    console.error('❌ Could not find "The Homestead" project')
    return
  }

  console.log('\n📁 Found project:', project.name)
  console.log('   ID:', project.id)

  // ========================================
  // STEP 1: Fix transcripts by inferring storytellers from titles
  // ========================================
  console.log('\n\n📝 STEP 1: Fixing Transcripts\n')
  console.log('=' .repeat(50))

  const { data: transcripts, error: transcriptsError } = await supabase
    .from('transcripts')
    .select('id, title, storyteller_id')
    .eq('organization_id', org.id)
    .is('storyteller_id', null)

  console.log(`\nFound ${transcripts?.length || 0} transcripts with NULL storyteller_id`)

  let transcriptsFixed = 0
  let transcriptsSkipped = 0

  for (const transcript of transcripts || []) {
    console.log(`\n   Transcript: "${transcript.title}"`)

    // Try to infer storyteller from title
    const titleLower = transcript.title.toLowerCase()
    let inferredStorytellerId: string | null = null

    // Check if title contains any storyteller name
    for (const [name, id] of Object.entries(storytellerMap)) {
      if (titleLower.includes(name)) {
        inferredStorytellerId = id
        const storyteller = storytellers.find(s => s.id === id)
        console.log(`   ✓ Inferred storyteller: ${storyteller?.full_name}`)
        break
      }
    }

    if (inferredStorytellerId) {
      // Update the transcript
      const { error: updateError } = await supabase
        .from('transcripts')
        .update({ storyteller_id: inferredStorytellerId })
        .eq('id', transcript.id)

      if (updateError) {
        console.log(`   ❌ Failed to update: ${updateError.message}`)
        transcriptsSkipped++
      } else {
        console.log(`   ✅ Updated transcript with storyteller`)
        transcriptsFixed++
      }
    } else {
      console.log(`   ⚠️  Could not infer storyteller from title - skipping`)
      transcriptsSkipped++
    }
  }

  console.log(`\n📊 Transcripts: ${transcriptsFixed} fixed, ${transcriptsSkipped} skipped`)

  // ========================================
  // STEP 2: Fix stories by copying author_id to storyteller_id
  // ========================================
  console.log('\n\n📖 STEP 2: Fixing Stories (storyteller_id)\n')
  console.log('=' .repeat(50))

  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select('id, title, storyteller_id, author_id')
    .eq('organization_id', org.id)
    .is('storyteller_id', null)

  console.log(`\nFound ${stories?.length || 0} stories with NULL storyteller_id`)

  let storiesFixedStoryteller = 0
  let storiesSkippedStoryteller = 0

  for (const story of stories || []) {
    console.log(`\n   Story: "${story.title}"`)
    console.log(`   Author ID: ${story.author_id || 'NULL'}`)

    if (story.author_id) {
      const { error: updateError } = await supabase
        .from('stories')
        .update({ storyteller_id: story.author_id })
        .eq('id', story.id)

      if (updateError) {
        console.log(`   ❌ Failed to update: ${updateError.message}`)
        storiesSkippedStoryteller++
      } else {
        console.log(`   ✅ Copied author_id to storyteller_id`)
        storiesFixedStoryteller++
      }
    } else {
      console.log(`   ⚠️  No author_id to copy - skipping`)
      storiesSkippedStoryteller++
    }
  }

  console.log(`\n📊 Stories (storyteller_id): ${storiesFixedStoryteller} fixed, ${storiesSkippedStoryteller} skipped`)

  // ========================================
  // STEP 3: Fix stories by assigning to "The Homestead" project
  // ========================================
  console.log('\n\n📖 STEP 3: Fixing Stories (project_id)\n')
  console.log('=' .repeat(50))

  const { data: orphanedStories } = await supabase
    .from('stories')
    .select('id, title, project_id, storyteller_id')
    .eq('organization_id', org.id)
    .is('project_id', null)

  console.log(`\nFound ${orphanedStories?.length || 0} stories with NULL project_id`)

  let storiesFixedProject = 0
  let storiesSkippedProject = 0

  for (const story of orphanedStories || []) {
    console.log(`\n   Story: "${story.title}"`)

    // Check if this storyteller is linked to "The Homestead" project
    if (story.storyteller_id) {
      const { data: projectLink } = await supabase
        .from('project_storytellers')
        .select('project_id')
        .eq('project_id', project.id)
        .eq('storyteller_id', story.storyteller_id)
        .single()

      if (projectLink) {
        console.log(`   ✓ Storyteller is linked to "${project.name}"`)

        const { error: updateError } = await supabase
          .from('stories')
          .update({ project_id: project.id })
          .eq('id', story.id)

        if (updateError) {
          console.log(`   ❌ Failed to update: ${updateError.message}`)
          storiesSkippedProject++
        } else {
          console.log(`   ✅ Assigned to "${project.name}"`)
          storiesFixedProject++
        }
      } else {
        console.log(`   ⚠️  Storyteller not linked to "${project.name}" - skipping`)
        storiesSkippedProject++
      }
    } else {
      console.log(`   ⚠️  No storyteller_id - skipping`)
      storiesSkippedProject++
    }
  }

  console.log(`\n📊 Stories (project_id): ${storiesFixedProject} fixed, ${storiesSkippedProject} skipped`)

  // ========================================
  // STEP 4: Check for duplicate profiles
  // ========================================
  console.log('\n\n👥 STEP 4: Checking for Duplicate Profiles\n')
  console.log('=' .repeat(50))

  const duplicateCheck = storytellers.filter(s =>
    s.full_name.toLowerCase().includes('aunty bev')
  )

  if (duplicateCheck.length > 1) {
    console.log(`\n⚠️  Found ${duplicateCheck.length} profiles matching "Aunty Bev":`)
    duplicateCheck.forEach(s => {
      console.log(`   - ${s.full_name} (${s.id})`)
    })
    console.log('\n   ⚠️  Manual review needed to merge duplicates')
  } else {
    console.log('\n✅ No duplicate "Aunty Bev" profiles found')
  }

  // ========================================
  // FINAL SUMMARY
  // ========================================
  console.log('\n\n' + '='.repeat(50))
  console.log('📊 FINAL SUMMARY')
  console.log('='.repeat(50))
  console.log(`\n✅ Transcripts fixed: ${transcriptsFixed}/${transcripts?.length || 0}`)
  console.log(`✅ Stories storyteller_id fixed: ${storiesFixedStoryteller}/${stories?.length || 0}`)
  console.log(`✅ Stories project_id fixed: ${storiesFixedProject}/${orphanedStories?.length || 0}`)
  console.log(`\n⚠️  Transcripts skipped: ${transcriptsSkipped}`)
  console.log(`⚠️  Stories skipped: ${storiesSkippedStoryteller + storiesSkippedProject}`)

  if (duplicateCheck.length > 1) {
    console.log(`\n⚠️  ${duplicateCheck.length} duplicate profiles need manual review`)
  }

  console.log('\n✨ Done!\n')
}

fixOonchiumpaStorytellerLinks().catch(console.error)
