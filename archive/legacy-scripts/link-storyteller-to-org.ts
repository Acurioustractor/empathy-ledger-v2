import { createServiceRoleClient } from '../src/lib/supabase/service-role-client'

/**
 * Script to link a storyteller (profile) to an organization
 *
 * Usage: npx tsx scripts/link-storyteller-to-org.ts <profile_id> <org_id>
 */

async function linkStoryteller() {
  const supabase = createServiceRoleClient()

  const profileId = process.argv[2]
  const orgId = process.argv[3]

  if (!profileId || !orgId) {
    console.log('❌ Usage: npx tsx scripts/link-storyteller-to-org.ts <profile_id> <org_id>')
    console.log('\nTo find IDs, use:')
    console.log('  - Storytellers: npx tsx scripts/list-storytellers.ts')
    console.log('  - Organizations: npx tsx scripts/list-organizations.ts')
    process.exit(1)
  }

  console.log('🔗 Linking storyteller to organization...\n')

  // Get storyteller info
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', profileId)
    .single()

  if (!profile) {
    console.log('❌ Storyteller not found')
    process.exit(1)
  }

  // Get organization info
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', orgId)
    .single()

  if (!org) {
    console.log('❌ Organization not found')
    process.exit(1)
  }

  console.log('Storyteller:', profile.full_name || profile.email)
  console.log('Organization:', org.name)
  console.log()

  // Check if link already exists
  const { data: existing } = await supabase
    .from('profile_organizations')
    .select('*')
    .eq('profile_id', profileId)
    .eq('organization_id', orgId)
    .single()

  if (existing) {
    console.log('ℹ️  Link already exists')
    console.log('   Role:', existing.role)
    console.log('   Active:', existing.is_active)

    // Update to make sure it's active
    const { error: updateError } = await supabase
      .from('profile_organizations')
      .update({ is_active: true, role: 'storyteller' })
      .eq('profile_id', profileId)
      .eq('organization_id', orgId)

    if (updateError) {
      console.log('❌ Error updating link:', updateError.message)
    } else {
      console.log('✅ Updated link to ensure it\'s active')
    }

    return
  }

  // Create new link
  const { error } = await supabase
    .from('profile_organizations')
    .insert({
      profile_id: profileId,
      organization_id: orgId,
      role: 'storyteller',
      is_active: true
    })

  if (error) {
    console.log('❌ Error creating link:', error.message)
    process.exit(1)
  }

  console.log('✅ Successfully linked storyteller to organization!')
}

linkStoryteller()
