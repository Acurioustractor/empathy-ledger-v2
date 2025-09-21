const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function findStorytellers() {
  try {
    // Find all storytellers
    const { data: storytellers, error } = await supabase
      .from('profiles')
      .select('id, display_name, email, tenant_roles')
      .contains('tenant_roles', ['storyteller'])

    if (error) {
      console.error('Error finding storytellers:', error)
      return
    }

    console.log(`Found ${storytellers.length} storytellers:`)
    storytellers.forEach(s => {
      console.log(`- ${s.display_name} (${s.email}) - Roles: ${s.tenant_roles?.join(', ')}`)
    })

    // Take the first storyteller and enhance them
    if (storytellers.length > 0) {
      const storyteller = storytellers[0]
      console.log(`\n🎯 Enhancing ${storyteller.display_name}...`)

      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({
          impact_focus_areas: ['Indigenous Rights', 'Community Leadership', 'Cultural Preservation'],
          expertise_areas: ['Community Organizing', 'Traditional Knowledge', 'Youth Mentorship'],
          storytelling_methods: ['Oral Tradition', 'Digital Stories', 'Community Workshops'],
          community_roles: ['Elder Advisor', 'Cultural Keeper'],
          change_maker_type: 'community_organizer',
          geographic_scope: 'regional',
          years_of_community_work: 25,
          mentor_availability: true,
          speaking_availability: true,
          is_elder: true,
          is_featured: true
        })
        .eq('id', storyteller.id)
        .select()

      if (updateError) {
        console.error('❌ Error updating storyteller:', updateError)
      } else {
        console.log('✅ Successfully enhanced storyteller with new properties')
      }

      // Enhance a few more storytellers with different data
      if (storytellers.length > 1) {
        const secondStoryteller = storytellers[1]
        console.log(`\n🎯 Enhancing ${secondStoryteller.display_name}...`)

        const { error: updateError2 } = await supabase
          .from('profiles')
          .update({
            impact_focus_areas: ['Education', 'Health', 'Economic Development'],
            expertise_areas: ['Public Speaking', 'Community Engagement', 'Program Development'],
            storytelling_methods: ['Podcasts', 'Written Stories', 'Video Content'],
            community_roles: ['Board Member', 'Volunteer Coordinator'],
            change_maker_type: 'advocate',
            geographic_scope: 'local',
            years_of_community_work: 12,
            mentor_availability: false,
            speaking_availability: true,
            is_featured: true
          })
          .eq('id', secondStoryteller.id)

        if (updateError2) {
          console.error('❌ Error updating second storyteller:', updateError2)
        } else {
          console.log('✅ Successfully enhanced second storyteller')
        }
      }
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

findStorytellers()