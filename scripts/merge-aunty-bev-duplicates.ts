import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

async function mergeDuplicateProfiles() {
  console.log('🔀 Merging Duplicate "Aunty Bev and Uncle terry" Profiles\n')

  const supabase = createServiceRoleClient()

  // Get Oonchiumpa organization
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, tenant_id')
    .ilike('name', '%oonchiumpa%')
    .single()

  if (!org) {
    console.error('❌ Organization not found')
    return
  }

  console.log('📍 Organization:', org.name)
  console.log('   ID:', org.id)
  console.log('   Tenant ID:', org.tenant_id)

  // Find the duplicate "Aunty Bev and Uncle terry" profiles
  const { data: duplicates } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at')
    .eq('tenant_id', org.tenant_id)
    .ilike('full_name', '%aunty bev%')
    .order('created_at', { ascending: true })

  if (!duplicates || duplicates.length < 2) {
    console.log('✅ No duplicate profiles found (or less than 2)')
    return
  }

  console.log(`\n👥 Found ${duplicates.length} "Aunty Bev" profiles:\n`)
  duplicates.forEach((profile, index) => {
    console.log(`   ${index + 1}. ${profile.full_name}`)
    console.log(`      ID: ${profile.id}`)
    console.log(`      Email: ${profile.email || 'None'}`)
    console.log(`      Created: ${new Date(profile.created_at).toLocaleDateString()}\n`)
  })

  // Keep the first (oldest) profile, merge the rest into it
  const primaryProfile = duplicates[0]
  const duplicateProfile = duplicates[1]

  console.log('🎯 Primary Profile (KEEPING):')
  console.log(`   ${primaryProfile.full_name} (${primaryProfile.id})`)
  console.log('\n🗑️  Duplicate Profile (MERGING):')
  console.log(`   ${duplicateProfile.full_name} (${duplicateProfile.id})`)

  // ========================================
  // STEP 1: Find all relationships for duplicate profile
  // ========================================
  console.log('\n\n📊 STEP 1: Analyzing Relationships\n')
  console.log('=' .repeat(50))

  // Check stories
  const { data: duplicateStories } = await supabase
    .from('stories')
    .select('id, title')
    .or(`storyteller_id.eq.${duplicateProfile.id},author_id.eq.${duplicateProfile.id}`)

  console.log(`\n📖 Stories: ${duplicateStories?.length || 0}`)
  duplicateStories?.forEach(story => {
    console.log(`   - ${story.title}`)
  })

  // Check transcripts
  const { data: duplicateTranscripts } = await supabase
    .from('transcripts')
    .select('id, title')
    .eq('storyteller_id', duplicateProfile.id)

  console.log(`\n📝 Transcripts: ${duplicateTranscripts?.length || 0}`)
  duplicateTranscripts?.forEach(transcript => {
    console.log(`   - ${transcript.title}`)
  })

  // Check project_storytellers
  const { data: duplicateProjectLinks } = await supabase
    .from('project_storytellers')
    .select('project_id, role, projects:project_id(name)')
    .eq('storyteller_id', duplicateProfile.id)

  console.log(`\n🔗 Project Links: ${duplicateProjectLinks?.length || 0}`)
  duplicateProjectLinks?.forEach((link: any) => {
    console.log(`   - ${link.projects?.name || 'Unknown'} (${link.role})`)
  })

  // Check extracted_quotes
  const { data: duplicateQuotes } = await supabase
    .from('extracted_quotes')
    .select('id, quote_text')
    .eq('author_id', duplicateProfile.id)

  console.log(`\n💬 Extracted Quotes: ${duplicateQuotes?.length || 0}`)
  duplicateQuotes?.forEach(quote => {
    console.log(`   - ${quote.quote_text?.substring(0, 50)}...`)
  })

  // ========================================
  // STEP 2: Migrate relationships
  // ========================================
  console.log('\n\n🔄 STEP 2: Migrating Relationships\n')
  console.log('=' .repeat(50))

  let migratedCount = 0

  // Migrate stories (storyteller_id)
  if (duplicateStories && duplicateStories.length > 0) {
    console.log('\n📖 Migrating stories (storyteller_id)...')
    const { error } = await supabase
      .from('stories')
      .update({ storyteller_id: primaryProfile.id })
      .eq('storyteller_id', duplicateProfile.id)

    if (error) {
      console.log(`   ❌ Error: ${error.message}`)
    } else {
      const storyCount = duplicateStories.filter((s: any) =>
        s.storyteller_id === duplicateProfile.id
      ).length
      console.log(`   ✅ Migrated ${storyCount} stories (storyteller_id)`)
      migratedCount += storyCount
    }
  }

  // Migrate stories (author_id)
  console.log('\n📖 Migrating stories (author_id)...')
  const { error: authorError } = await supabase
    .from('stories')
    .update({ author_id: primaryProfile.id })
    .eq('author_id', duplicateProfile.id)

  if (authorError) {
    console.log(`   ❌ Error: ${authorError.message}`)
  } else {
    const authorCount = duplicateStories?.filter((s: any) =>
      s.author_id === duplicateProfile.id
    ).length || 0
    console.log(`   ✅ Migrated ${authorCount} stories (author_id)`)
    migratedCount += authorCount
  }

  // Migrate transcripts
  if (duplicateTranscripts && duplicateTranscripts.length > 0) {
    console.log('\n📝 Migrating transcripts...')
    const { error } = await supabase
      .from('transcripts')
      .update({ storyteller_id: primaryProfile.id })
      .eq('storyteller_id', duplicateProfile.id)

    if (error) {
      console.log(`   ❌ Error: ${error.message}`)
    } else {
      console.log(`   ✅ Migrated ${duplicateTranscripts.length} transcripts`)
      migratedCount += duplicateTranscripts.length
    }
  }

  // Migrate project links
  if (duplicateProjectLinks && duplicateProjectLinks.length > 0) {
    console.log('\n🔗 Migrating project links...')

    for (const link of duplicateProjectLinks) {
      // Check if primary profile already has a link to this project
      const { data: existingLink } = await supabase
        .from('project_storytellers')
        .select('id')
        .eq('project_id', link.project_id)
        .eq('storyteller_id', primaryProfile.id)
        .single()

      if (existingLink) {
        console.log(`   ⚠️  Primary already linked to ${(link as any).projects?.name} - deleting duplicate link`)
        await supabase
          .from('project_storytellers')
          .delete()
          .eq('project_id', link.project_id)
          .eq('storyteller_id', duplicateProfile.id)
      } else {
        console.log(`   ➡️  Migrating link to ${(link as any).projects?.name}`)
        const { error } = await supabase
          .from('project_storytellers')
          .update({ storyteller_id: primaryProfile.id })
          .eq('project_id', link.project_id)
          .eq('storyteller_id', duplicateProfile.id)

        if (error) {
          console.log(`   ❌ Error: ${error.message}`)
        } else {
          console.log(`   ✅ Migrated link`)
          migratedCount++
        }
      }
    }
  }

  // Migrate extracted quotes
  if (duplicateQuotes && duplicateQuotes.length > 0) {
    console.log('\n💬 Migrating extracted quotes...')
    const { error } = await supabase
      .from('extracted_quotes')
      .update({ author_id: primaryProfile.id })
      .eq('author_id', duplicateProfile.id)

    if (error) {
      console.log(`   ❌ Error: ${error.message}`)
    } else {
      console.log(`   ✅ Migrated ${duplicateQuotes.length} extracted quotes`)
      migratedCount += duplicateQuotes.length
    }
  }

  // ========================================
  // STEP 3: Delete duplicate profile
  // ========================================
  console.log('\n\n🗑️  STEP 3: Removing Duplicate Profile\n')
  console.log('=' .repeat(50))

  // First, remove any remaining relationships
  console.log('\n🧹 Cleaning up any remaining profile_organizations links...')
  const { error: orgLinkError } = await supabase
    .from('profile_organizations')
    .delete()
    .eq('profile_id', duplicateProfile.id)

  if (orgLinkError) {
    console.log(`   ⚠️  ${orgLinkError.message}`)
  } else {
    console.log('   ✅ Cleaned up organization links')
  }

  console.log('\n🗑️  Deleting duplicate profile...')
  const { error: deleteError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', duplicateProfile.id)

  if (deleteError) {
    console.error(`   ❌ Failed to delete duplicate profile: ${deleteError.message}`)
    console.error(`   ⚠️  You may need to manually delete profile ${duplicateProfile.id}`)
  } else {
    console.log('   ✅ Duplicate profile deleted successfully')
  }

  // ========================================
  // FINAL SUMMARY
  // ========================================
  console.log('\n\n' + '='.repeat(50))
  console.log('📊 FINAL SUMMARY')
  console.log('='.repeat(50))
  console.log(`\n✅ Kept Profile: ${primaryProfile.full_name}`)
  console.log(`   ID: ${primaryProfile.id}`)
  console.log(`\n🔀 Migrated Relationships: ${migratedCount}`)
  console.log(`\n🗑️  Removed: ${duplicateProfile.full_name}`)
  console.log(`   ID: ${duplicateProfile.id}`)

  console.log('\n✨ Merge complete!\n')
}

mergeDuplicateProfiles().catch(console.error)
