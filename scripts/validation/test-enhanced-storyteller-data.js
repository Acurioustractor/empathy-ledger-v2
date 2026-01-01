const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addEnhancedStorytellerData() {
  try {
    console.log('🚀 Adding enhanced storyteller data for testing...')

    // Find Benjamin Knight's profile
    const { data: benjamin, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'bknight@snowfoundation.org')
      .single()

    if (findError || !benjamin) {
      console.error('❌ Benjamin not found:', findError)
      return
    }

    console.log('👤 Found Benjamin Knight:', benjamin.display_name)

    // Update Benjamin with enhanced storyteller properties
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
      .eq('id', benjamin.id)
      .select()

    if (updateError) {
      console.error('❌ Error updating Benjamin:', updateError)
      return
    }

    console.log('✅ Successfully updated Benjamin with enhanced properties')

    // Find a few more storytellers to enhance
    const { data: storytellers, error: storytellersError } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .contains('tenant_roles', ['storyteller'])
      .neq('id', benjamin.id)
      .limit(3)

    if (storytellers && storytellers.length > 0) {
      console.log(`📚 Enhancing ${storytellers.length} additional storytellers...`)

      for (const storyteller of storytellers) {
        const enhancedData = generateSampleData(storyteller.display_name)

        const { error: enhanceError } = await supabase
          .from('profiles')
          .update(enhancedData)
          .eq('id', storyteller.id)

        if (enhanceError) {
          console.log(`⚠️ Error enhancing ${storyteller.display_name}:`, enhanceError.message)
        } else {
          console.log(`✅ Enhanced ${storyteller.display_name}`)
        }
      }
    }

    console.log('🎉 Enhanced storyteller data setup complete!')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

function generateSampleData(displayName) {
  const sampleData = [
    {
      impact_focus_areas: ['Education', 'Health', 'Economic Development'],
      expertise_areas: ['Public Speaking', 'Community Engagement', 'Program Development'],
      storytelling_methods: ['Podcasts', 'Written Stories', 'Video Content'],
      community_roles: ['Board Member', 'Volunteer Coordinator'],
      change_maker_type: 'advocate',
      geographic_scope: 'local',
      years_of_community_work: 12,
      mentor_availability: false,
      speaking_availability: true
    },
    {
      impact_focus_areas: ['Environmental Justice', 'Youth Development'],
      expertise_areas: ['Research', 'Policy Analysis', 'Grant Writing'],
      storytelling_methods: ['Photography', 'Community Events', 'Social Media'],
      community_roles: ['Researcher', 'Activist'],
      change_maker_type: 'innovator',
      geographic_scope: 'national',
      years_of_community_work: 8,
      mentor_availability: true,
      speaking_availability: false
    },
    {
      impact_focus_areas: ['Housing', 'Criminal Justice Reform'],
      expertise_areas: ['Legal Advocacy', 'Community Outreach', 'Coalition Building'],
      storytelling_methods: ['Legal Briefs', 'Community Testimony', 'Direct Action'],
      community_roles: ['Legal Advocate', 'Community Organizer'],
      change_maker_type: 'system_changer',
      geographic_scope: 'regional',
      years_of_community_work: 15,
      mentor_availability: true,
      speaking_availability: true
    }
  ]

  return sampleData[Math.floor(Math.random() * sampleData.length)]
}

addEnhancedStorytellerData()