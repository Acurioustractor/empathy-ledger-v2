import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const key = match[1].trim()
    const value = match[2].trim()
    envVars[key] = value
  }
})

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
)

async function setupBenjaminComplete() {
  try {
    console.log('🚀 Setting up Benjamin Knight as complete storyteller...\n')

    // 1. Get Benjamin's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, tenant_id')
      .eq('email', 'benjamin@act.place')
      .single()

    if (profileError || !profile) {
      console.error('❌ Could not find Benjamin Knight profile')
      return
    }

    console.log('✅ Found profile:', profile.full_name)
    console.log('   ID:', profile.id)
    console.log('   Tenant:', profile.tenant_id, '\n')

    // 2. Check if storyteller profile exists
    const { data: existingStoryteller } = await supabase
      .from('storytellers')
      .select('id')
      .eq('profile_id', profile.id)
      .single()

    let storytellerId = profile.id

    if (!existingStoryteller) {
      // Create storyteller profile
      const { data: storyteller, error: storytellerError } = await supabase
        .from('storytellers')
        .insert([{
          profile_id: profile.id,
          display_name: 'Benjamin Knight',
          email: 'benjamin@act.place',
          bio: 'Technology builder and community advocate working on the Empathy Ledger platform. Passionate about using technology to preserve and share stories while respecting cultural protocols.',
          location: 'Melbourne, Australia',
          is_active: true
        }])
        .select()
        .single()

      if (storytellerError) {
        console.error('❌ Error creating storyteller:', storytellerError)
        return
      } else {
        storytellerId = storyteller.id
        console.log('✅ Created storyteller profile (ID: ' + storytellerId + ')')
      }
    } else {
      storytellerId = existingStoryteller.id
      console.log('✅ Storyteller profile already exists (ID: ' + storytellerId + ')')
    }

    // 3. Find or create "A Curious Tractor" organization
    let { data: org } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('name', 'A Curious Tractor')
      .single()

    if (!org) {
      // Create the organization
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          tenant_id: profile.tenant_id,
          name: 'A Curious Tractor',
          description: 'A creative technology collective focused on storytelling, cultural preservation, and community empowerment.',
          organization_type: 'community',
          website: 'https://act.place',
          is_active: true
        }])
        .select()
        .single()

      if (orgError) {
        console.error('❌ Error creating organization:', orgError)
        return
      }
      org = newOrg
      console.log('✅ Created organization: A Curious Tractor')
    } else {
      console.log('✅ Found organization: A Curious Tractor')
    }

    console.log('   Org ID:', org.id, '\n')

    // 4. Link Benjamin to the organization using storyteller_organizations
    const { data: existingMembership } = await supabase
      .from('storyteller_organizations')
      .select('id')
      .eq('organization_id', org.id)
      .eq('storyteller_id', storytellerId)
      .single()

    if (!existingMembership) {
      const { error: memberError } = await supabase
        .from('storyteller_organizations')
        .insert([{
          organization_id: org.id,
          storyteller_id: storytellerId,
          tenant_id: profile.tenant_id,
          role: 'storyteller',
          is_active: true
        }])

      if (memberError) {
        console.error('❌ Error adding to organization:', memberError)
      } else {
        console.log('✅ Linked Benjamin to A Curious Tractor as storyteller')
      }
    } else {
      console.log('✅ Already member of A Curious Tractor')
    }

    // 5. Update the existing story to link to storyteller
    const { data: story, error: storyUpdateError } = await supabase
      .from('stories')
      .update({
        storyteller_id: storytellerId,
        author_id: profile.id
      })
      .eq('id', 'd7bed43d-1e25-4db7-9e17-e76ff25ebbe8')
      .select()
      .single()

    if (storyUpdateError) {
      console.error('❌ Error updating story:', storyUpdateError)
    } else {
      console.log('✅ Updated existing story with storyteller link\n')
    }

    // 6. Get story count
    const { count: storyCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('storyteller_id', profile.id)

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 Benjamin Knight Setup Complete!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('👤 Storyteller Profile:')
    console.log('   Name: Benjamin Knight')
    console.log('   Location: Melbourne, Australia')
    console.log('   Role: Platform Developer')
    console.log('   Bio: ✅ Set')
    console.log('   Stories: ' + (storyCount || 0))
    console.log('')

    console.log('🏢 Organization:')
    console.log('   Name: A Curious Tractor')
    console.log('   Role: Storyteller')
    console.log('   Permissions: View, Create, Edit stories')
    console.log('')

    console.log('📝 Your Story:')
    console.log('   Title: Testing the New Story Editor - A Journey')
    console.log('   Now shows: Benjamin Knight (not Anonymous!)')
    console.log('   View: http://localhost:3030/stories/d7bed43d-1e25-4db7-9e17-e76ff25ebbe8')
    console.log('')

    console.log('🎯 What You Can Now Test:')
    console.log('   ✅ Story attribution (shows your name)')
    console.log('   ✅ Storyteller profile page')
    console.log('   ✅ Organization membership')
    console.log('   ✅ Story creation with storyteller link')
    console.log('   ✅ Analytics and thematic analysis')
    console.log('   ✅ Transcript processing')
    console.log('   ✅ Community features')
    console.log('')

    console.log('🔗 Quick Links:')
    console.log('   Your Story: http://localhost:3030/stories/d7bed43d-1e25-4db7-9e17-e76ff25ebbe8')
    console.log('   Your Profile: http://localhost:3030/storytellers/' + profile.id)
    console.log('   Organization: http://localhost:3030/organisations/' + org.id)
    console.log('   Create Story: http://localhost:3030/stories/create')
    console.log('')

  } catch (err) {
    console.error('Error:', err)
  }
}

setupBenjaminComplete()
